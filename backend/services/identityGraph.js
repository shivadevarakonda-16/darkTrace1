/**
 * Module 2: Identity Graph Builder & Link Prediction Engine
 * 
 * Builds an interconnected knowledge graph of personas, identifiers (PGP, Wallets, Handles, Messengers),
 * and implements a Graph Link Prediction heuristic (GNN approximation) based on behavioral/metadata overlap.
 */

import Graph from 'graphology';

export class IdentityGraph {
  constructor() {
    this.graph = new Graph({ multi: true, type: 'undirected' });
  }

  /**
   * Reset and populate graph from actor records
   */
  buildGraph(actors = []) {
    this.graph.clear();

    // 1. Add all Actor Nodes
    actors.forEach(actor => {
      if (!this.graph.hasNode(actor.id)) {
        this.graph.addNode(actor.id, {
          id: actor.id,
          label: actor.handle,
          type: 'ACTOR',
          category: actor.category,
          threatLevel: actor.threatLevel,
          avatar: actor.avatar,
          source: actor.source,
          lastSeen: actor.lastSeen
        });
      }

      // 2. Add Identifier Nodes and Edges
      // PGP Keys
      if (actor.pgpFingerprint) {
        const pgpNodeId = `pgp:${actor.pgpFingerprint.toLowerCase()}`;
        if (!this.graph.hasNode(pgpNodeId)) {
          this.graph.addNode(pgpNodeId, {
            id: pgpNodeId,
            label: `PGP: ${actor.pgpFingerprint.slice(0, 8)}...`,
            type: 'PGP_KEY',
            fingerprint: actor.pgpFingerprint
          });
        }
        this.addEdgeIfMissing(actor.id, pgpNodeId, 'USES_PGP', { weight: 1.0 });
      }

      // Crypto Wallets
      (actor.wallets || []).forEach(wallet => {
        const walletNodeId = `wallet:${wallet.address.toLowerCase()}`;
        if (!this.graph.hasNode(walletNodeId)) {
          this.graph.addNode(walletNodeId, {
            id: walletNodeId,
            label: `Wallet: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`,
            type: 'CRYPTO_WALLET',
            currency: wallet.currency,
            address: wallet.address
          });
        }
        this.addEdgeIfMissing(actor.id, walletNodeId, 'OWNS_WALLET', { weight: 1.0 });
      });

      // Communication handles (Jabber / Tox / Telegram)
      if (actor.contact?.jabber) {
        const jabberNodeId = `jabber:${actor.contact.jabber.toLowerCase()}`;
        if (!this.graph.hasNode(jabberNodeId)) {
          this.graph.addNode(jabberNodeId, {
            id: jabberNodeId,
            label: `Jabber: ${actor.contact.jabber}`,
            type: 'COMM_HANDLE',
            protocol: 'Jabber/XMPP'
          });
        }
        this.addEdgeIfMissing(actor.id, jabberNodeId, 'COMMUNICATES_VIA', { weight: 0.9 });
      }

      if (actor.contact?.tox) {
        const toxNodeId = `tox:${actor.contact.tox.toLowerCase()}`;
        if (!this.graph.hasNode(toxNodeId)) {
          this.graph.addNode(toxNodeId, {
            id: toxNodeId,
            label: `Tox: ${actor.contact.tox.slice(0, 10)}...`,
            type: 'COMM_HANDLE',
            protocol: 'Tox'
          });
        }
        this.addEdgeIfMissing(actor.id, toxNodeId, 'COMMUNICATES_VIA', { weight: 0.95 });
      }

      if (actor.contact?.telegram) {
        const tgNodeId = `tg:${actor.contact.telegram.toLowerCase()}`;
        if (!this.graph.hasNode(tgNodeId)) {
          this.graph.addNode(tgNodeId, {
            id: tgNodeId,
            label: `TG: @${actor.contact.telegram}`,
            type: 'COMM_HANDLE',
            protocol: 'Telegram'
          });
        }
        this.addEdgeIfMissing(actor.id, tgNodeId, 'COMMUNICATES_VIA', { weight: 0.85 });
      }

      // Forums
      (actor.forums || []).forEach(forum => {
        const forumNodeId = `forum:${forum.toLowerCase()}`;
        if (!this.graph.hasNode(forumNodeId)) {
          this.graph.addNode(forumNodeId, {
            id: forumNodeId,
            label: `Forum: ${forum}`,
            type: 'FORUM',
            name: forum
          });
        }
        this.addEdgeIfMissing(actor.id, forumNodeId, 'POSTS_ON', { weight: 0.3 });
      });
    });

    return this.graph;
  }

  addEdgeIfMissing(source, target, edgeType, attributes = {}) {
    if (this.graph.hasNode(source) && this.graph.hasNode(target)) {
      this.graph.addEdge(source, target, {
        edgeType,
        ...attributes
      });
    }
  }

  /**
   * Find direct shared identifiers between two actors
   */
  findSharedIdentifiers(actorA, actorB) {
    const shared = {
      pgp: [],
      wallets: [],
      contacts: [],
      forums: [],
      hasHardLink: false
    };

    // 1. PGP Match
    if (actorA.pgpFingerprint && actorB.pgpFingerprint &&
        actorA.pgpFingerprint.toLowerCase() === actorB.pgpFingerprint.toLowerCase()) {
      shared.pgp.push(actorA.pgpFingerprint);
      shared.hasHardLink = true;
    }

    // 2. Wallet Match
    const aWallets = (actorA.wallets || []).map(w => w.address.toLowerCase());
    const bWallets = (actorB.wallets || []).map(w => w.address.toLowerCase());
    const commonWallets = aWallets.filter(w => bWallets.includes(w));
    if (commonWallets.length > 0) {
      shared.wallets = commonWallets;
      shared.hasHardLink = true;
    }

    // 3. Contact Match (Jabber / Tox / Telegram)
    if (actorA.contact && actorB.contact) {
      if (actorA.contact.jabber && actorA.contact.jabber.toLowerCase() === actorB.contact.jabber?.toLowerCase()) {
        shared.contacts.push(`Jabber: ${actorA.contact.jabber}`);
        shared.hasHardLink = true;
      }
      if (actorA.contact.tox && actorA.contact.tox.toLowerCase() === actorB.contact.tox?.toLowerCase()) {
        shared.contacts.push(`Tox: ${actorA.contact.tox}`);
        shared.hasHardLink = true;
      }
      if (actorA.contact.telegram && actorA.contact.telegram.toLowerCase() === actorB.contact.telegram?.toLowerCase()) {
        shared.contacts.push(`Telegram: @${actorA.contact.telegram}`);
        shared.hasHardLink = true;
      }
    }

    // 4. Common Forums
    const aForums = actorA.forums || [];
    const bForums = actorB.forums || [];
    shared.forums = aForums.filter(f => bForums.includes(f));

    return shared;
  }

  /**
   * Novel Feature: Link Prediction Heuristic (GNN Approximation)
   * Evaluates structural and behavioral metadata overlap when no shared hard identifier exists.
   */
  predictLink(actorA, actorB) {
    // 1. Category alignment (Commodity / TTP)
    const categoryMatch = actorA.category === actorB.category ? 1.0 : 0.0;
    
    // 2. Sub-specialization / Goods tag overlap (Jaccard index)
    const tagsA = new Set(actorA.specializations || [actorA.category]);
    const tagsB = new Set(actorB.specializations || [actorB.category]);
    const tagIntersection = [...tagsA].filter(x => tagsB.has(x)).length;
    const tagUnion = new Set([...tagsA, ...tagsB]).size;
    const tagOverlap = tagUnion > 0 ? tagIntersection / tagUnion : 0;

    // 3. Forum Co-presence (Jaccard index)
    const forumsA = new Set(actorA.forums || []);
    const forumsB = new Set(actorB.forums || []);
    const forumIntersection = [...forumsA].filter(x => forumsB.has(x)).length;
    const forumUnion = new Set([...forumsA, ...forumsB]).size;
    const forumOverlap = forumUnion > 0 ? forumIntersection / forumUnion : 0;

    // 4. Operational timeframe overlap
    const activeSpanA = (actorA.activeRange?.endYear || 2026) - (actorA.activeRange?.startYear || 2023);
    const activeSpanB = (actorB.activeRange?.endYear || 2026) - (actorB.activeRange?.startYear || 2023);
    const startOverlap = Math.max(actorA.activeRange?.startYear || 2023, actorB.activeRange?.startYear || 2023);
    const endOverlap = Math.min(actorA.activeRange?.endYear || 2026, actorB.activeRange?.endYear || 2026);
    const yearOverlap = Math.max(0, endOverlap - startOverlap + 1) / Math.max(1, Math.max(activeSpanA, activeSpanB) + 1);

    // 5. Handle naming pattern similarity (Levenshtein / character trigrams)
    const nameSim = this.computeHandlePatternSimilarity(actorA.handle, actorB.handle);

    // Weighted GNN approximation score
    const predictionScore = (
      (categoryMatch * 0.25) +
      (tagOverlap * 0.30) +
      (forumOverlap * 0.20) +
      (yearOverlap * 0.15) +
      (nameSim * 0.10)
    );

    const reasons = [];
    if (categoryMatch) reasons.push(`Identical threat vector & operational category: "${actorA.category}"`);
    if (tagOverlap > 0.4) reasons.push(`High niche specialization overlap (${(tagOverlap * 100).toFixed(0)}% common TTP tags)`);
    if (forumOverlap > 0.3) reasons.push(`Co-present on ${forumIntersection} underground forum(s)`);
    if (yearOverlap > 0.6) reasons.push('Synchronous active operational timeframe');
    if (nameSim > 0.5) reasons.push(`Algorithmic handle morphological similarity (${(nameSim * 100).toFixed(0)}%)`);

    return {
      predictionScore: parseFloat(predictionScore.toFixed(3)),
      isWeakLink: predictionScore >= 0.50,
      factors: {
        categoryMatch,
        tagOverlap,
        forumOverlap,
        yearOverlap,
        nameSim
      },
      reasons
    };
  }

  /**
   * Helper: N-gram string similarity for handle patterns
   */
  computeHandlePatternSimilarity(str1, str2) {
    const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (s1 === s2) return 1.0;
    if (s1.length < 2 || s2.length < 2) return 0.0;

    const getBigrams = str => {
      const bigrams = new Set();
      for (let i = 0; i < str.length - 1; i++) {
        bigrams.add(str.slice(i, i + 2));
      }
      return bigrams;
    };

    const b1 = getBigrams(s1);
    const b2 = getBigrams(s2);
    const intersection = [...b1].filter(x => b2.has(x)).length;
    return (2.0 * intersection) / (b1.size + b2.size);
  }

  /**
   * Full Identity Graph analysis for an actor pair
   */
  evaluateGraphLink(actorA, actorB) {
    const shared = this.findSharedIdentifiers(actorA, actorB);
    const linkPrediction = this.predictLink(actorA, actorB);

    let score = 0.05;
    const findings = [];

    if (shared.hasHardLink) {
      if (shared.pgp.length > 0) {
        score = Math.max(score, 0.98);
        findings.push(`Cryptographic Hard Link: Shared PGP Key Fingerprint (${shared.pgp[0].substring(0, 16)}...)`);
      }
      if (shared.wallets.length > 0) {
        score = Math.max(score, 0.95);
        findings.push(`Direct Financial Identifier: Identical wallet address reuse (${shared.wallets[0]})`);
      }
      if (shared.contacts.length > 0) {
        score = Math.max(score, 0.90);
        findings.push(`Shared Communication Handle: ${shared.contacts.join(', ')}`);
      }
    } else {
      // Use Link Prediction
      score = Math.max(score, linkPrediction.predictionScore * 0.75);
      if (linkPrediction.isWeakLink) {
        findings.push(`Link Prediction (GNN Heuristic): Probable weak correlation (${(linkPrediction.predictionScore * 100).toFixed(0)}% metadata alignment)`);
        findings.push(...linkPrediction.reasons);
      } else {
        findings.push('No shared cryptographic identifiers or strong graph neighborhood clustering.');
      }
    }

    return {
      score: parseFloat(score.toFixed(3)),
      shared,
      linkPrediction,
      hasHardLink: shared.hasHardLink,
      findings
    };
  }

  /**
   * Export network graph for Vis.js / frontend visualization
   */
  exportForFrontend(filterMinConfidence = 0) {
    const nodes = [];
    const edges = [];

    this.graph.forEachNode((nodeId, attrs) => {
      nodes.push({
        id: nodeId,
        label: attrs.label || nodeId,
        group: attrs.type,
        category: attrs.category,
        threatLevel: attrs.threatLevel,
        type: attrs.type,
        avatar: attrs.avatar
      });
    });

    this.graph.forEachEdge((edgeId, attrs, source, target) => {
      edges.push({
        id: edgeId,
        from: source,
        to: target,
        label: attrs.edgeType,
        edgeType: attrs.edgeType,
        weight: attrs.weight || 1.0
      });
    });

    return { nodes, edges };
  }
}

export const defaultIdentityGraph = new IdentityGraph();
