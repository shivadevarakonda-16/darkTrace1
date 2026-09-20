import { dbStore } from '../data/mockDatabase.js';
import Actor from '../models/Actor.js';
import { mongoReady } from '../config/db.js';

/**
 * Simulated continuous crawler/scraper.
 *
 * AegisTrace is a hackathon demo and has no access to a real Tor network
 * or live dark web marketplaces from this environment, so this service
 * does NOT reach out to any real .onion infrastructure. Instead it is the
 * integration point where a real crawler pipeline would plug in: on a
 * timer it produces a new "sighting" (a forum post, an infra re-scan, or
 * a brand-new low-confidence actor stub) in the exact same shape a real
 * scraper's output would take, writes it into the live in-memory dataset,
 * and persists it to MongoDB Atlas when connected.
 *
 * To wire in a real crawler: replace `generateSighting()` with a call
 * into your actual scraping pipeline (Tor client + parser) and keep
 * everything downstream (dbStore.addOrUpdateActor, Mongo upsert) as-is.
 */

let intervalHandle = null;

function randomOf(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSighting() {
  const actors = dbStore.actors;
  if (!actors.length) return null;

  const target = randomOf(actors);
  const kinds = ['forum_post', 'infra_rescan'];
  const kind = randomOf(kinds);

  const updated = JSON.parse(JSON.stringify(target));
  const now = new Date().toISOString();

  if (kind === 'forum_post') {
    updated.samplePosts = updated.samplePosts || [];
    updated.samplePosts.push({
      timestamp: now,
      content: '[AUTO-CRAWL] New forum sighting captured by continuous monitor. Placeholder content — wire in a real crawler to replace this.',
    });
  } else {
    updated.infrastructure = updated.infrastructure || {};
    updated.infrastructure.last_rescanned = now;
  }
  updated.lastSeen = now;
  updated.ingestSource = 'auto_scraper';

  return updated;
}

async function runScrapeCycle() {
  try {
    const sighting = generateSighting();
    if (!sighting) return;

    dbStore.addOrUpdateActor(sighting);
    dbStore.scanLogs.push({
      timestamp: new Date().toISOString(),
      type: 'AUTO_SCRAPE',
      actorId: sighting.id,
      message: `Simulated crawler ingested a new sighting for ${sighting.handle}.`,
    });

    if (mongoReady()) {
      await Actor.findOneAndUpdate({ id: sighting.id }, sighting, { upsert: true, new: true });
    }
  } catch (err) {
    console.error('Scraper cycle error:', err.message);
  }
}

export function startScraperService() {
  if (intervalHandle) return; // already running

  const enabled = (process.env.SCRAPER_ENABLED || 'true').toLowerCase() !== 'false';
  if (!enabled) {
    console.log('🕷️  Scraper service disabled via SCRAPER_ENABLED=false');
    return;
  }

  const intervalMs = Math.max(15000, parseInt(process.env.SCRAPER_INTERVAL_MS || '60000', 10));
  console.log(`🕷️  Scraper service started — simulated crawl cycle every ${intervalMs / 1000}s`);

  intervalHandle = setInterval(runScrapeCycle, intervalMs);
  // Kick off one cycle shortly after boot so there's visible activity
  setTimeout(runScrapeCycle, 5000);
}

export function stopScraperService() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}
