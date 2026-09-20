import express from 'express';
import { dbStore } from '../data/mockDatabase.js';

const router = express.Router();

// POST /api/attribution/pair - Calculate live attribution between two actors with optional weight sliders
router.post('/pair', async (req, res) => {
  try {
    const { actorAId, actorBId, weights, prior } = req.body;

    if (!actorAId || !actorBId) {
      return res.status(400).json({ success: false, error: 'Both actorAId and actorBId are required' });
    }

    const result = await dbStore.computeAttribution(actorAId, actorBId, weights, prior);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/attribution/matrix - Get full attribution matrix of all actor pairs
router.get('/matrix', async (req, res) => {
  try {
    const minConfidence = parseInt(req.query.minConfidence || '0', 10);
    const pairs = await dbStore.getFullAttributionMatrix(minConfidence);

    res.json({
      success: true,
      count: pairs.length,
      data: pairs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/attribution/stats - Global telemetry & executive stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await dbStore.getGlobalStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
