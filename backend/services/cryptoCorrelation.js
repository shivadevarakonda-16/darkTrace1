/**
 * Module 4: Crypto Wallet Correlation & Clustering Engine
 * 
 * Implements common-input transaction clustering heuristics, exchange deposit linkage,
 * and Temporal Correlation between on-chain UTXO events and dark web forum posts/escrows.
 */

export class CryptoCorrelationEngine {
  constructor(knownExchanges = [], mockTransactions = []) {
    this.knownExchanges = knownExchanges;
    this.mockTransactions = mockTransactions;
    this.clusters = new Map(); // address -> clusterId
  }

  setMockData(knownExchanges, mockTransactions) {
    this.knownExchanges = knownExchanges;
    this.mockTransactions = mockTransactions;
    this.rebuildClusters();
  }

  /**
   * Common-Input Heuristic Clustering:
   * Any addresses co-spending inputs in the same transaction belong to the same entity.
   */
  rebuildClusters() {
    this.clusters.clear();
    let clusterCounter = 1;

    this.mockTransactions.forEach(tx => {
      const inputs = tx.inputs || [];
      if (inputs.length === 0) return;

      // Find existing cluster among inputs
      let existingClusterId = null;
      for (const inputAddr of inputs) {
        const clean = inputAddr.toLowerCase();
        if (this.clusters.has(clean)) {
          existingClusterId = this.clusters.get(clean);
          break;
        }
      }

      const clusterId = existingClusterId || `CLUSTER-TX-${String(clusterCounter++).padStart(3, '0')}`;
      for (const inputAddr of inputs) {
        this.clusters.set(inputAddr.toLowerCase(), clusterId);
      }
    });
  }

  /**
   * Get cluster ID for a wallet address
   */
  getClusterForAddress(address) {
    if (!address) return null;
    return this.clusters.get(address.toLowerCase()) || null;
  }

  /**
   * Check if any wallet in a list or cluster links to a known exchange deposit address
   */
  checkExchangeLink(wallets = []) {
    const findings = [];
    let linkedExchange = null;

    for (const w of wallets) {
      const addr = (typeof w === 'string' ? w : w.address).toLowerCase();
      const clusterId = this.getClusterForAddress(addr);

      // Check transactions involving this wallet or its cluster
      for (const tx of this.mockTransactions) {
        const isSender = (tx.inputs || []).some(inAddr => {
          const inClean = inAddr.toLowerCase();
          return inClean === addr || (clusterId && this.clusters.get(inClean) === clusterId);
        });

        if (isSender) {
          for (const output of tx.outputs || []) {
            const outAddr = (output.address || '').toLowerCase();
            const matchedEx = this.knownExchanges.find(ex => ex.address.toLowerCase() === outAddr);
            if (matchedEx) {
              linkedExchange = matchedEx;
              findings.push({
                exchange: matchedEx.name,
                depositAddress: matchedEx.address,
                amount: output.amount,
                currency: tx.currency || 'BTC',
                txHash: tx.txHash,
                timestamp: tx.timestamp,
                kycRisk: matchedEx.kycRequired ? 'HIGH_DE-ANONYMIZATION_RISK' : 'MIXER_OBSCURED'
              });
            }
          }
        }
      }
    }

    return {
      hasExchangeLink: findings.length > 0,
      linkedExchange,
      findings
    };
  }

  /**
   * Novel Feature: Temporal Correlation Check
   * Correlates wallet inbound transaction timestamps with forum "sale confirmed" / "escrow released" events.
   * Window: <= 3 hours delta indicates direct transaction causality.
   */
  checkTemporalCorrelation(actorPosts = [], walletTxs = []) {
    const matchingEvents = [];
    let totalScore = 0;

    const saleKeywords = ['sold', 'sent btc', 'payment received', 'escrow released', 'shipped', 'deal done', 'vouch +1', 'keys released'];

    actorPosts.forEach(post => {
      const text = (typeof post === 'string' ? post : post.content || '').toLowerCase();
      const isSalePost = saleKeywords.some(kw => text.includes(kw));

      if (isSalePost && post.timestamp) {
        const postTime = new Date(post.timestamp).getTime();

        walletTxs.forEach(tx => {
          const txTime = new Date(tx.timestamp).getTime();
          const deltaHours = Math.abs(txTime - postTime) / (1000 * 60 * 60);

          if (deltaHours <= 3.5) {
            const matchConfidence = Math.max(0.6, 1.0 - (deltaHours / 3.5) * 0.4);
            totalScore += matchConfidence;
            matchingEvents.push({
              postContent: post.content ? post.content.substring(0, 80) + '...' : 'Forum sale update',
              postTimestamp: post.timestamp,
              txHash: tx.txHash,
              txAmount: tx.amount,
              currency: tx.currency || 'BTC',
              txTimestamp: tx.timestamp,
              deltaMinutes: Math.round(deltaHours * 60),
              matchConfidence: parseFloat(matchConfidence.toFixed(2))
            });
          }
        });
      }
    });

    const temporalScore = matchingEvents.length > 0 ? Math.min(1.0, 0.4 + (totalScore * 0.3)) : 0.05;

    return {
      score: parseFloat(temporalScore.toFixed(3)),
      hasTemporalMatch: matchingEvents.length > 0,
      matchingEvents
    };
  }

  /**
   * Full Crypto Correlation Comparison between two actors
   */
  compareActorWallets(actorA, actorB) {
    const aWallets = (actorA.wallets || []).map(w => typeof w === 'string' ? w : w.address);
    const bWallets = (actorB.wallets || []).map(w => typeof w === 'string' ? w : w.address);

    const findings = [];
    let score = 0.05;

    // 1. Direct Wallet Address Overlap
    const directOverlap = aWallets.filter(w => bWallets.map(x => x.toLowerCase()).includes(w.toLowerCase()));
    if (directOverlap.length > 0) {
      score = 0.98;
      findings.push(`Direct Wallet Reuse: Address ${directOverlap[0]} published across both profiles.`);
    }

    // 2. Common-Input Cluster Overlap
    const aClusters = new Set(aWallets.map(w => this.getClusterForAddress(w)).filter(Boolean));
    const bClusters = new Set(bWallets.map(w => this.getClusterForAddress(w)).filter(Boolean));
    const sharedClusters = [...aClusters].filter(c => bClusters.has(c));

    if (sharedClusters.length > 0 && directOverlap.length === 0) {
      score = Math.max(score, 0.90);
      findings.push(`UTXO Co-Spending Cluster: Wallets merged into identical spending cluster [${sharedClusters[0]}] via multi-input transaction.`);
    }

    // 3. Exchange Linkage
    const exA = this.checkExchangeLink(aWallets);
    const exB = this.checkExchangeLink(bWallets);

    if (exA.hasExchangeLink && exB.hasExchangeLink) {
      const commonExchanges = exA.findings.filter(fA => 
        exB.findings.some(fB => fB.exchange === fA.exchange && fB.depositAddress.toLowerCase() === fA.depositAddress.toLowerCase())
      );

      if (commonExchanges.length > 0) {
        score = Math.max(score, 0.94);
        findings.push(`Cashing Out to Same KYC Exchange Deposit Account: ${commonExchanges[0].exchange} (${commonExchanges[0].depositAddress.substring(0, 16)}...).`);
      }
    }

    // 4. Temporal Correlation Analysis
    const txsA = (actorA.transactions || []);
    const txsB = (actorB.transactions || []);
    const tempAtoB = this.checkTemporalCorrelation(actorA.samplePosts, txsB);
    const tempBtoA = this.checkTemporalCorrelation(actorB.samplePosts, txsA);

    const bestTemporal = tempAtoB.score > tempBtoA.score ? tempAtoB : tempBtoA;
    if (bestTemporal.hasTemporalMatch) {
      score = Math.max(score, Math.min(0.85, score + bestTemporal.score * 0.4));
      bestTemporal.matchingEvents.forEach(evt => {
        findings.push(`Temporal Financial Correlation: On-chain transaction (${evt.txAmount} ${evt.currency}) confirmed within ${evt.deltaMinutes} min of forum escrow update.`);
      });
    }

    if (findings.length === 0) {
      findings.push('Isolated blockchain footprints: No shared UTXO clusters, exchange destinations, or synchronized payment windows.');
    }

    const confidenceTier = score >= 0.8 ? 'HIGH' : score >= 0.5 ? 'MEDIUM' : 'LOW';

    return {
      score: parseFloat(score.toFixed(3)),
      confidenceTier,
      directOverlap,
      sharedClusters,
      exchangeLinks: {
        actorA: exA.findings,
        actorB: exB.findings
      },
      temporalEvents: bestTemporal.matchingEvents,
      findings
    };
  }
}

export const defaultCryptoEngine = new CryptoCorrelationEngine();
