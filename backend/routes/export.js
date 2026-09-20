import express from 'express';
import { dbStore } from '../data/mockDatabase.js';

const router = express.Router();

// GET /api/export/csv - Export attribution matrix as CSV
router.get('/csv', async (req, res) => {
  try {
    const pairs = await dbStore.getFullAttributionMatrix(0);

    const headers = [
      'Pair ID',
      'Actor A Handle',
      'Actor A Category',
      'Actor B Handle',
      'Actor B Category',
      'Attribution Confidence (%)',
      'Confidence Tier',
      'Crypto Correlation (%)',
      'Infra Leak Score (%)',
      'Stylometry Match (%)',
      'Identity Graph Score (%)',
      'Prior Probability (%)',
      'Key Findings Summary'
    ];

    const rows = pairs.map(p => {
      const cryptoTrail = p.evidenceTrail.find(e => e.key === 'crypto');
      const infraTrail = p.evidenceTrail.find(e => e.key === 'infra');
      const styleTrail = p.evidenceTrail.find(e => e.key === 'stylometry');
      const graphTrail = p.evidenceTrail.find(e => e.key === 'graph');

      return [
        `"${p.pairId}"`,
        `"${p.actorA.handle}"`,
        `"${p.actorA.category}"`,
        `"${p.actorB.handle}"`,
        `"${p.actorB.category}"`,
        p.confidenceScore,
        `"${p.confidenceTier}"`,
        cryptoTrail ? cryptoTrail.scorePercent : 0,
        infraTrail ? infraTrail.scorePercent : 0,
        styleTrail ? styleTrail.scorePercent : 0,
        graphTrail ? graphTrail.scorePercent : 0,
        Math.round((p.priorProbability || 0.5) * 100),
        `"${(p.explanationSummary || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="aegistrace-attribution-matrix.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/export/stix-json - Export Threat Intel in STIX 2.1 JSON Format
router.get('/stix-json', async (req, res) => {
  try {
    const actors = dbStore.getAllActors();
    const pairs = await dbStore.getFullAttributionMatrix(40);

    const stixObjects = [];
    const bundleId = `bundle--${Date.now()}`;

    // 1. STIX Threat Actor Objects
    actors.forEach(actor => {
      stixObjects.push({
        type: 'threat-actor',
        spec_version: '2.1',
        id: `threat-actor--${actor.id.toLowerCase()}`,
        created: '2026-01-01T00:00:00.000Z',
        modified: actor.lastSeen,
        name: actor.handle,
        description: `Tracked underground threat actor operating under category: ${actor.category}`,
        threat_actor_types: [actor.category.toLowerCase()],
        aliases: [actor.handle, actor.contact?.telegram, actor.contact?.jabber].filter(Boolean),
        roles: actor.specializations || [],
        sophistication: actor.threatLevel === 'CRITICAL' ? 'expert' : 'intermediate',
        resource_level: 'individual',
        primary_motivation: 'financial-gain',
        x_aegis_pgp_fingerprint: actor.pgpFingerprint,
        x_aegis_wallets: actor.wallets
      });
    });

    // 2. STIX Relationship Objects (attributed-to)
    pairs.forEach((pair, idx) => {
      stixObjects.push({
        type: 'relationship',
        spec_version: '2.1',
        id: `relationship--attrib-${idx}-${Date.now()}`,
        created: pair.timestamp,
        modified: pair.timestamp,
        relationship_type: 'attributed-to',
        source_ref: `threat-actor--${pair.actorA.id.toLowerCase()}`,
        target_ref: `threat-actor--${pair.actorB.id.toLowerCase()}`,
        confidence: pair.confidenceScore,
        description: pair.explanationSummary,
        x_aegis_evidence_trail: pair.evidenceTrail,
        x_aegis_bayesian_math: pair.auditMath
      });
    });

    const bundle = {
      type: 'bundle',
      id: bundleId,
      spec_version: '2.1',
      title: 'AegisTrace Threat Actor Multi-Modal Attribution Bundle',
      generated_at: new Date().toISOString(),
      objects: stixObjects
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="aegistrace-stix-bundle.json"');
    res.send(JSON.stringify(bundle, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/export/report/:id - Complete forensic dossier for printing/PDF
router.get('/report/:id', async (req, res) => {
  try {
    const actor = dbStore.getActorById(req.params.id);
    if (!actor) {
      return res.status(404).json({ success: false, error: 'Actor not found' });
    }

    const topLinks = await dbStore.getTopLinksForActor(actor.id, 5);

    const dossier = {
      classification: 'TOP SECRET // THREAT INTEL // DECLASSIFIED DEMO',
      reportId: `AT-DOSSIER-${actor.id}-${new Date().getFullYear()}`,
      generatedDate: new Date().toISOString(),
      investigator: 'AegisTrace Automated Threat Attribution Engine v2.0',
      subject: actor,
      topAttributions: topLinks,
      systemSummary: `Forensic analysis conducted across 4 independent threat intelligence vectors: Onion infrastructure leak signatures, identity graph link prediction, stylometric NLP vectorization, and Bitcoin/Monero UTXO multi-input clustering.`
    };

    res.json({
      success: true,
      data: dossier
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
