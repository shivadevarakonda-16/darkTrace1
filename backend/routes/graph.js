import express from 'express';
import { dbStore } from '../data/mockDatabase.js';

const router = express.Router();

// GET /api/graph - Graph payload for vis-network
router.get('/', async (req, res) => {
  try {
    const minConfidence = parseInt(req.query.minConfidence || '30', 10);
    const includeIdentifiers = req.query.includeIdentifiers !== 'false';
    const isDark = req.query.theme === 'dark';

    // Palette for node/label colors — the border colors (category identity)
    // stay the same in both modes; only fills/text adapt for readability.
    const palette = isDark
      ? {
          nodeBg: '#12161d', nodeText: '#e6eaf0', nodeTextBold: '#ffffff',
          highlightBorder: '#22c55e', highlightBg: '#0f2a1a',
          edgeHighlight: '#e6eaf0', edgeLabelBg: '#0a0e14',
          pgpBorder: '#f59e0b', pgpBg: '#2a2013', pgpText: '#fbbf24',
          walletBorder: '#4f9dff', walletBg: '#0f1e33', walletText: '#7cc4ff'
        }
      : {
          nodeBg: '#ffffff', nodeText: '#1a2233', nodeTextBold: '#000000',
          highlightBorder: '#16a34a', highlightBg: '#f0fdf4',
          edgeHighlight: '#1a2233', edgeLabelBg: '#ffffff',
          pgpBorder: '#d97706', pgpBg: '#fffbeb', pgpText: '#b45309',
          walletBorder: '#2563eb', walletBg: '#eff6ff', walletText: '#1d4ed8'
        };

    const actors = dbStore.getAllActors();
    const pairs = await dbStore.getFullAttributionMatrix(minConfidence);

    const nodes = [];
    const edges = [];
    const nodeSet = new Set();

    // Color map for actor categories
    const categoryColors = {
      'Ransomware / Extortion': '#ff4757',
      'Darknet Supply / Narcotics': '#ffa502',
      'Exploit Broker / 0-Day': '#ff6b81',
      'DDoS / Botnet Ops': '#ff7f50',
      'Financial Fraud / Carding': '#eccc68',
      'Bulletproof Hosting': '#70a1ff',
      'Malware Development': '#ff5252',
      'Crypto Laundering / Mixers': '#2ed573',
      'Network Recon / Proxy': '#1e90ff',
      'Cryptanalysis / Tooling': '#5352ed',
      'Scripting / RAT Reseller': '#a4b0be',
      'Hacktivism / Leaks': '#57606f',
      'Darknet Goods / Documents': '#2ed573'
    };

    // 1. Add Actor Nodes
    actors.forEach(actor => {
      const color = categoryColors[actor.category] || '#00d4ff';
      nodes.push({
        id: actor.id,
        label: actor.handle,
        title: `<b>${actor.handle}</b><br/>Category: ${actor.category}<br/>Threat: ${actor.threatLevel}<br/>Source: ${actor.source}`,
        shape: 'circularImage',
        image: actor.avatar,
        size: actor.threatLevel === 'CRITICAL' ? 32 : actor.threatLevel === 'HIGH' ? 28 : 24,
        borderWidth: 3,
        color: {
          border: color,
          background: palette.nodeBg,
          highlight: { border: palette.highlightBorder, background: palette.highlightBg }
        },
        font: { color: palette.nodeText, face: 'Inter', size: 13, bold: { color: palette.nodeTextBold } },
        nodeType: 'ACTOR',
        category: actor.category,
        threatLevel: actor.threatLevel,
        actorData: actor
      });
      nodeSet.add(actor.id);
    });

    // 2. Add Attributed Pair Edges (Inter-Actor Attribution Links)
    pairs.forEach((pair, idx) => {
      let edgeColor = '#57606f';
      let edgeWidth = 1;
      let dashes = false;

      if (pair.confidenceScore >= 75) {
        edgeColor = '#00ff9d'; // High confidence neon green
        edgeWidth = 3.5;
      } else if (pair.confidenceScore >= 50) {
        edgeColor = '#00d4ff'; // Moderate confidence cyan
        edgeWidth = 2.5;
      } else {
        edgeColor = '#a4b0be'; // Low/weak link
        edgeWidth = 1.5;
        dashes = true;
      }

      edges.push({
        id: `edge-attrib-${idx}`,
        from: pair.actorA.id,
        to: pair.actorB.id,
        label: `${pair.confidenceScore}%`,
        title: `<b>Attribution: ${pair.actorA.handle} ↔ ${pair.actorB.handle}</b><br/>Confidence: ${pair.confidenceScore}%<br/>${pair.explanationSummary}`,
        color: { color: edgeColor, highlight: palette.edgeHighlight, opacity: 0.9 },
        width: edgeWidth,
        dashes,
        smooth: { type: 'continuous', roundness: 0.2 },
        font: { color: edgeColor, background: palette.edgeLabelBg, face: 'JetBrains Mono', size: 11, strokeWidth: 0 },
        edgeType: 'ATTRIBUTION_LINK',
        confidenceScore: pair.confidenceScore,
        evidenceTrail: pair.evidenceTrail
      });
    });

    // 3. Optional: Add Identifiers (PGP, Wallets) for fine-grained network investigation
    if (includeIdentifiers) {
      actors.forEach(actor => {
        // PGP Key Node
        if (actor.pgpFingerprint) {
          const pgpId = `pgp:${actor.pgpFingerprint.replace(/\s+/g, '')}`;
          if (!nodeSet.has(pgpId)) {
            nodes.push({
              id: pgpId,
              label: `PGP:${actor.pgpFingerprint.slice(0, 4)}`,
              title: `PGP Fingerprint: ${actor.pgpFingerprint}`,
              shape: 'diamond',
              size: 14,
              color: { border: palette.pgpBorder, background: palette.pgpBg },
              font: { color: palette.pgpText, face: 'JetBrains Mono', size: 10 },
              nodeType: 'IDENTIFIER_PGP'
            });
            nodeSet.add(pgpId);
          }
          edges.push({
            id: `edge-${actor.id}-${pgpId}`,
            from: actor.id,
            to: pgpId,
            color: { color: '#ffa502', opacity: 0.5 },
            width: 1,
            dashes: [2, 2],
            edgeType: 'IDENTIFIER_LINK'
          });
        }

        // Wallet Node
        (actor.wallets || []).forEach((w, wIdx) => {
          const wId = `wallet:${w.address}`;
          if (!nodeSet.has(wId)) {
            nodes.push({
              id: wId,
              label: `${w.currency}:${w.address.slice(0, 4)}...${w.address.slice(-3)}`,
              title: `${w.currency} Address: ${w.address}`,
              shape: 'triangle',
              size: 13,
              color: { border: palette.walletBorder, background: palette.walletBg },
              font: { color: palette.walletText, face: 'JetBrains Mono', size: 10 },
              nodeType: 'IDENTIFIER_WALLET'
            });
            nodeSet.add(wId);
          }
          edges.push({
            id: `edge-${actor.id}-${wId}-${wIdx}`,
            from: actor.id,
            to: wId,
            color: { color: '#00d4ff', opacity: 0.5 },
            width: 1,
            dashes: [2, 2],
            edgeType: 'IDENTIFIER_LINK'
          });
        });
      });
    }

    res.json({
      success: true,
      data: {
        nodes,
        edges,
        totalNodes: nodes.length,
        totalEdges: edges.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
