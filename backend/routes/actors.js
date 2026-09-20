import express from 'express';
import { dbStore } from '../data/mockDatabase.js';

const router = express.Router();

// GET /api/actors - List all actors with query filtering
router.get('/', async (req, res) => {
  try {
    const actors = dbStore.getAllActors(req.query);
    
    // Enrich each actor with their current highest-confidence linked persona
    const enriched = await Promise.all(actors.map(async (actor) => {
      const topLinks = await dbStore.getTopLinksForActor(actor.id, 1);
      const primaryLink = topLinks[0] || null;

      return {
        ...actor,
        highestConfidenceLink: primaryLink ? {
          actorId: primaryLink.linkedActor.id,
          handle: primaryLink.linkedActor.handle,
          category: primaryLink.linkedActor.category,
          confidenceScore: primaryLink.confidenceScore,
          confidenceTier: primaryLink.confidenceTier,
          badgeClass: primaryLink.badgeClass
        } : null
      };
    }));

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/actors/:id - Get single actor profile & top linked personas
router.get('/:id', async (req, res) => {
  try {
    const actor = dbStore.getActorById(req.params.id);
    if (!actor) {
      return res.status(404).json({ success: false, error: 'Actor not found' });
    }

    const topLinks = await dbStore.getTopLinksForActor(actor.id, 5);

    res.json({
      success: true,
      data: {
        ...actor,
        topLinks
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/actors/:id/timeline - Chronological events (posts, transactions, scans)
router.get('/:id/timeline', (req, res) => {
  try {
    const actor = dbStore.getActorById(req.params.id);
    if (!actor) {
      return res.status(404).json({ success: false, error: 'Actor not found' });
    }

    const events = [];

    // Add forum posts
    (actor.samplePosts || []).forEach(post => {
      events.push({
        type: 'FORUM_POST',
        source: actor.source || 'Darknet Forum',
        timestamp: post.timestamp,
        title: 'Underground Forum Post / Escrow Update',
        content: post.content,
        icon: 'bi-chat-left-dots-fill',
        badge: 'Forum Activity'
      });
    });

    // Add transactions
    (actor.transactions || []).forEach(tx => {
      events.push({
        type: 'CRYPTO_TX',
        source: 'Blockchain UTXO Ledger',
        timestamp: tx.timestamp,
        title: `On-Chain Transaction (${tx.amount} ${tx.currency})`,
        content: `TxHash: ${tx.txHash}`,
        icon: 'bi-currency-bitcoin',
        badge: 'Financial Flow'
      });
    });

    // Add infrastructure telemetry
    if (actor.infrastructure) {
      events.push({
        type: 'INFRA_SCAN',
        source: 'AegisTrace Onion Telemetry',
        timestamp: actor.lastSeen,
        title: 'Hidden Service Fingerprint Captured',
        content: `Target: ${actor.infrastructure.onion_address} | Server: ${actor.infrastructure.server_banner}`,
        icon: 'bi-hdd-network-fill',
        badge: 'Infrastructure'
      });
    }

    // Sort descending by timestamp
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: events
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
