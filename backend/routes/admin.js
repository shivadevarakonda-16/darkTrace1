import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import Actor from '../models/Actor.js';
import { dbStore } from '../data/mockDatabase.js';
import { mongoReady } from '../config/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Every route below requires an authenticated admin
router.use(authenticate, requireRole('admin'));

/**
 * Expected CSV headers (case-insensitive, order doesn't matter):
 * id,handle,category,threatLevel,source,lastSeen,specializations,forums,
 * pgpFingerprint,btcWallet,xmrWallet,onionAddress,clearnetIpLeaked,
 * serverBanner,suspectedName,suspectedLocation,matchedVia
 *
 * - id is optional: if left blank a new ACTOR-### id is generated.
 * - specializations / forums accept multiple values separated by ";".
 * - Any row whose id matches an existing actor UPDATES that actor;
 *   otherwise a new actor is created.
 */
/**
 * Returns a function that hands out fresh ACTOR-### ids, one at a time,
 * guaranteed to never repeat within a single upload batch.
 *
 * (The old version recalculated "next id" by scanning dbStore.actors on
 * every call — but dbStore.actors doesn't grow until *after* the whole
 * CSV is processed, so every blank-id row after the first got handed the
 * exact same id back, and the `while (usedIds.has(id))` retry loop spun
 * forever without ever producing a new value. That's an infinite loop
 * that freezes the whole Node process — this is why an upload with more
 * than one blank id would hang forever. Fixed by tracking a running
 * counter that advances on every call, independent of dbStore state.)
 */
function makeIdGenerator(usedIds) {
  let counter = dbStore.actors
    .map(a => /^ACTOR-(\d+)$/i.exec(a.id))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10))
    .reduce((max, n) => Math.max(max, n), 0);

  return function nextGeneratedId() {
    let id;
    do {
      counter += 1;
      id = `ACTOR-${String(counter).padStart(3, '0')}`;
    } while (usedIds.has(id));
    return id;
  };
}

function splitList(value) {
  if (!value) return [];
  return String(value)
    .split(';')
    .map(s => s.trim())
    .filter(Boolean);
}

function rowToActor(row, usedIds, nextGeneratedId) {
  // Normalize header casing since spreadsheet exports vary a lot
  const get = (key) => {
    const foundKey = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
    return foundKey ? String(row[foundKey]).trim() : '';
  };

  let id = get('id');
  if (!id || usedIds.has(id)) {
    id = nextGeneratedId();
  }
  usedIds.add(id);

  const btcWallet = get('btcWallet');
  const xmrWallet = get('xmrWallet');
  const wallets = [];
  if (btcWallet) wallets.push({ currency: 'BTC', address: btcWallet });
  if (xmrWallet) wallets.push({ currency: 'XMR', address: xmrWallet });

  const existing = dbStore.actors.find(a => a.id === id) || {};

  return {
    ...existing,
    id,
    handle: get('handle') || existing.handle || id,
    category: get('category') || existing.category || 'Uncategorized',
    threatLevel: (get('threatLevel') || existing.threatLevel || 'MEDIUM').toUpperCase(),
    source: get('source') || existing.source || 'Manual CSV Import',
    lastSeen: get('lastSeen') || existing.lastSeen || new Date().toISOString(),
    specializations: splitList(get('specializations')).length
      ? splitList(get('specializations'))
      : existing.specializations || [],
    forums: splitList(get('forums')).length ? splitList(get('forums')) : existing.forums || [],
    pgpFingerprint: get('pgpFingerprint') || existing.pgpFingerprint || '',
    wallets: wallets.length ? wallets : existing.wallets || [],
    infrastructure: {
      ...(existing.infrastructure || {}),
      onion_address: get('onionAddress') || existing.infrastructure?.onion_address || '',
      clearnet_ip_leaked: get('clearnetIpLeaked') || existing.infrastructure?.clearnet_ip_leaked || null,
      server_banner: get('serverBanner') || existing.infrastructure?.server_banner || '',
    },
    suspectedIdentity: {
      name: get('suspectedName') || existing.suspectedIdentity?.name || 'Unknown',
      location: get('suspectedLocation') || existing.suspectedIdentity?.location || 'Unknown',
      matchedVia: get('matchedVia') || existing.suspectedIdentity?.matchedVia || 'Manual CSV Import',
    },
    samplePosts: existing.samplePosts || [],
    transactions: existing.transactions || [],
    avatar: existing.avatar || '',
    ingestSource: 'admin_csv_upload',
    updatedAt: new Date().toISOString(),
  };
}

// POST /api/admin/actors/upload-csv - admin uploads a CSV to bulk add/update actors
router.post('/actors/upload-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No CSV file uploaded (field name "file").' });
    }

    let rows;
    try {
      rows = parse(req.file.buffer.toString('utf-8'), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (parseErr) {
      return res.status(400).json({ success: false, error: `Could not parse CSV: ${parseErr.message}` });
    }

    if (!rows.length) {
      return res.status(400).json({ success: false, error: 'CSV file contains no data rows.' });
    }

    const usedIds = new Set(dbStore.actors.map(a => a.id));
    const nextGeneratedId = makeIdGenerator(usedIds);
    const actorObjects = rows.map(row => rowToActor(row, usedIds, nextGeneratedId));

    // Update the live in-memory dataset (rebuilds attribution engines)
    const updatedCount = dbStore.bulkAddOrUpdateActors(actorObjects);

    // Persist to MongoDB Atlas if connected
    let persisted = false;
    if (mongoReady()) {
      await Promise.all(
        actorObjects.map(a => Actor.findOneAndUpdate({ id: a.id }, a, { upsert: true, new: true }))
      );
      persisted = true;
    }

    res.json({
      success: true,
      message: `Processed ${rows.length} row(s), ${updatedCount} actor record(s) added/updated.`,
      persistedToMongo: persisted,
      actorIds: actorObjects.map(a => a.id),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/actors/csv-template - sample CSV headers/row for the admin UI to offer as a download
router.get('/actors/csv-template', (req, res) => {
  const header = [
    'id', 'handle', 'category', 'threatLevel', 'source', 'lastSeen',
    'specializations', 'forums', 'pgpFingerprint', 'btcWallet', 'xmrWallet',
    'onionAddress', 'clearnetIpLeaked', 'serverBanner', 'suspectedName',
    'suspectedLocation', 'matchedVia',
  ].join(',');
  const sample = [
    '', 'NewActorHandle', 'Carding / Fraud', 'HIGH', 'Manual Intel Report',
    new Date().toISOString(), 'BIN Attacks;Card Shops', 'Exploit.in',
    '', '', '', '', '', '', 'Unknown', 'Unknown', 'Manual CSV Import',
  ].join(',');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="aegistrace_actor_template.csv"');
  res.send(`${header}\n${sample}\n`);
});

// GET /api/admin/status - quick admin-facing status of the data layer
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      totalActors: dbStore.actors.length,
      mongoConnected: mongoReady(),
      scanLogs: dbStore.scanLogs.slice(-20),
    },
  });
});

export default router;
