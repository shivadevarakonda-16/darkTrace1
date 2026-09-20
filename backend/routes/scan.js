import express from 'express';
import { dbStore } from '../data/mockDatabase.js';
import { defaultInfraScanner } from '../services/infraScanner.js';
import { requireRole } from '../middleware/auth.js';
import Actor from '../models/Actor.js';
import { mongoReady } from '../config/db.js';

const router = express.Router();

// POST /api/scan/simulate - Execute a simulated live scanner probe against an onion footprint
router.post('/simulate', (req, res) => {
  try {
    const { onionAddress, statusPageExposed, certFingerprint, serverBanner, sshKey, leakedIp } = req.body;

    const mockOnionRecord = {
      onion_address: onionAddress || 'unknown-hidden-service.onion',
      status_page_exposed: !!statusPageExposed,
      clearnet_ip_leaked: leakedIp || null,
      ssl_cert: certFingerprint ? { sha256_fingerprint: certFingerprint } : null,
      server_banner: serverBanner || 'nginx/1.24.0 (Ubuntu)',
      ssh_host_key: sshKey || null
    };

    const scanResult = defaultInfraScanner.scanOnionRecord(mockOnionRecord);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      target: mockOnionRecord.onion_address,
      data: scanResult
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/scan/reset - Reset dataset to fresh seed state (admin only — destructive)
// Resets BOTH the live in-memory copy AND MongoDB Atlas (when connected), so a
// reset is a real reset everywhere — not just until the next server restart.
router.post('/reset', requireRole('admin'), async (req, res) => {
  try {
    const result = dbStore.resetToSeed();

    let mongoResynced = false;
    if (mongoReady()) {
      await Actor.deleteMany({});
      await Actor.insertMany(dbStore.actors, { ordered: false });
      mongoResynced = true;
    }

    res.json({
      success: true,
      message: `Database re-seeded successfully with ${result.count} threat actor profiles.${mongoResynced ? ' MongoDB Atlas was also reset to match.' : ''}`,
      count: result.count,
      mongoResynced,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
