/**
 * Dual Database Layer: In-Memory Engine with seamless MongoDB / persistent syncing.
 * Provides out-of-the-box zero-dependency instant execution for hackathon demos.
 */

import { actors as initialActors, clearnetDatabase, knownExchanges, mockTransactions } from './seedData.js';
import { defaultInfraScanner } from '../services/infraScanner.js';
import { defaultIdentityGraph } from '../services/identityGraph.js';
import { defaultStylometryEngine } from '../services/stylometryEngine.js';
import { defaultCryptoEngine } from '../services/cryptoCorrelation.js';
import { defaultFusionEngine } from '../services/fusionEngine.js';

class DatabaseStore {
  constructor() {
    this.actors = JSON.parse(JSON.stringify(initialActors));
    this.clearnetDb = JSON.parse(JSON.stringify(clearnetDatabase));
    this.knownExchanges = JSON.parse(JSON.stringify(knownExchanges));
    this.mockTransactions = JSON.parse(JSON.stringify(mockTransactions));
    this.attributionCache = new Map(); // "ACTOR_A_ID:ACTOR_B_ID" -> attribution object
    this.scanLogs = [];

    this.initEngines();
  }

  initEngines() {
    defaultInfraScanner.setClearnetDb(this.clearnetDb);
    defaultIdentityGraph.buildGraph(this.actors);
    defaultCryptoEngine.setMockData(this.knownExchanges, this.mockTransactions);
  }

  /**
   * Replace the entire in-memory actor list (used when hydrating from
   * MongoDB Atlas at startup) and rebuild the attribution engines.
   */
  replaceActors(actorArray) {
    this.actors = JSON.parse(JSON.stringify(actorArray));
    this.attributionCache.clear();
    this.initEngines();
    return this.actors.length;
  }

  /**
   * Insert a new actor or update an existing one (matched by `id`), then
   * rebuild the attribution engines so the identity graph / fusion scores
   * immediately reflect the change. Used by admin CSV uploads and the
   * simulated crawler/scraper service.
   */
  addOrUpdateActor(actor) {
    if (!actor || !actor.id) return false;
    const idx = this.actors.findIndex(a => a.id === actor.id);
    if (idx >= 0) {
      this.actors[idx] = { ...this.actors[idx], ...actor };
    } else {
      this.actors.push(actor);
    }
    this.attributionCache.clear();
    this.initEngines();
    return true;
  }

  /**
   * Bulk version of addOrUpdateActor — rebuilds engines once at the end
   * instead of after every record, since that's the expensive step.
   */
  bulkAddOrUpdateActors(actorArray) {
    let count = 0;
    for (const actor of actorArray) {
      if (!actor || !actor.id) continue;
      const idx = this.actors.findIndex(a => a.id === actor.id);
      if (idx >= 0) {
        this.actors[idx] = { ...this.actors[idx], ...actor };
      } else {
        this.actors.push(actor);
      }
      count++;
    }
    this.attributionCache.clear();
    this.initEngines();
    return count;
  }

  /**
   * Reset store to initial seed state
   */
  resetToSeed() {
    this.actors = JSON.parse(JSON.stringify(initialActors));
    this.clearnetDb = JSON.parse(JSON.stringify(clearnetDatabase));
    this.knownExchanges = JSON.parse(JSON.stringify(knownExchanges));
    this.mockTransactions = JSON.parse(JSON.stringify(mockTransactions));
    this.attributionCache.clear();
    this.scanLogs = [];
    this.initEngines();
    return { success: true, count: this.actors.length };
  }

  // --- ACTOR CRUD ---
  getAllActors(query = {}) {
    let result = [...this.actors];

    if (query.category) {
      result = result.filter(a => a.category.toLowerCase().includes(query.category.toLowerCase()));
    }
    if (query.threatLevel) {
      result = result.filter(a => a.threatLevel.toLowerCase() === query.threatLevel.toLowerCase());
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      result = result.filter(a => 
        a.handle.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.specializations || []).some(s => s.toLowerCase().includes(q)) ||
        (a.wallets || []).some(w => w.address.toLowerCase().includes(q)) ||
        (a.pgpFingerprint && a.pgpFingerprint.toLowerCase().includes(q))
      );
    }

    return result;
  }

  getActorById(id) {
    return this.actors.find(a => a.id === id || a.handle.toLowerCase() === id.toLowerCase()) || null;
  }

  /**
   * Calculate comprehensive attribution between any two actors
   */
  async computeAttribution(idA, idB, customWeights = null, prior = null) {
    const actorA = this.getActorById(idA);
    const actorB = this.getActorById(idB);

    if (!actorA || !actorB) {
      throw new Error(`Actor ${!actorA ? idA : idB} not found`);
    }

    if (actorA.id === actorB.id) {
      return {
        actorA,
        actorB,
        confidenceScore: 100,
        confidenceTier: 'SELF_IDENTITY',
        isSelf: true
      };
    }

    // Sort IDs for consistent cache key
    const cacheKey = [actorA.id, actorB.id].sort().join(':') + 
      (customWeights ? `_w${JSON.stringify(customWeights)}` : '') +
      (prior !== null ? `_p${prior}` : '');

    if (this.attributionCache.has(cacheKey)) {
      return this.attributionCache.get(cacheKey);
    }

    // 1. Module 1: Infrastructure
    const infraResult = defaultInfraScanner.compareActorInfra(actorA, actorB);

    // 2. Module 2: Identity Graph & Link Prediction
    const graphResult = defaultIdentityGraph.evaluateGraphLink(actorA, actorB);

    // 3. Module 3: AI Stylometry & Behavioral Forensics
    const stylometryResult = await defaultStylometryEngine.compareActors(actorA, actorB);

    // 4. Module 4: Crypto Correlation
    const cryptoResult = defaultCryptoEngine.compareActorWallets(actorA, actorB);

    // 5. Evidence Fusion
    const fusion = defaultFusionEngine.fuseEvidence({
      infraResult,
      graphResult,
      stylometryResult,
      cryptoResult,
      customWeights,
      prior
    });

    const attribution = {
      pairId: `${actorA.id}__${actorB.id}`,
      actorA: {
        id: actorA.id,
        handle: actorA.handle,
        category: actorA.category,
        threatLevel: actorA.threatLevel,
        avatar: actorA.avatar,
        suspectedIdentity: actorA.suspectedIdentity
      },
      actorB: {
        id: actorB.id,
        handle: actorB.handle,
        category: actorB.category,
        threatLevel: actorB.threatLevel,
        avatar: actorB.avatar,
        suspectedIdentity: actorB.suspectedIdentity
      },
      ...fusion,
      moduleOutputs: {
        infraResult,
        graphResult,
        stylometryResult,
        cryptoResult
      },
      timestamp: new Date().toISOString()
    };

    this.attributionCache.set(cacheKey, attribution);
    return attribution;
  }

  /**
   * Find top linked personas for a given actor
   */
  async getTopLinksForActor(actorId, limit = 5) {
    const actor = this.getActorById(actorId);
    if (!actor) return [];

    const links = [];
    for (const other of this.actors) {
      if (other.id !== actor.id) {
        const attrib = await this.computeAttribution(actor.id, other.id);
        links.push({
          linkedActor: other,
          confidenceScore: attrib.confidenceScore,
          confidenceTier: attrib.confidenceTier,
          badgeClass: attrib.badgeClass,
          explanationSummary: attrib.explanationSummary,
          evidenceTrail: attrib.evidenceTrail,
          auditMath: attrib.auditMath
        });
      }
    }

    links.sort((a, b) => b.confidenceScore - a.confidenceScore);
    return links.slice(0, limit);
  }

  /**
   * Full Attribution Matrix for all actors (for network graph edges)
   */
  async getFullAttributionMatrix(minConfidence = 20) {
    const pairs = [];
    for (let i = 0; i < this.actors.length; i++) {
      for (let j = i + 1; j < this.actors.length; j++) {
        const attrib = await this.computeAttribution(this.actors[i].id, this.actors[j].id);
        if (attrib.confidenceScore >= minConfidence) {
          pairs.push(attrib);
        }
      }
    }
    pairs.sort((a, b) => b.confidenceScore - a.confidenceScore);
    return pairs;
  }

  /**
   * Global Telemetry & Stats for Executive Dashboard
   */
  async getGlobalStats() {
    const allPairs = await this.getFullAttributionMatrix(0);
    const highRiskPairs = allPairs.filter(p => p.confidenceScore >= 75);
    const moderatePairs = allPairs.filter(p => p.confidenceScore >= 45 && p.confidenceScore < 75);

    const categories = {};
    this.actors.forEach(a => {
      categories[a.category] = (categories[a.category] || 0) + 1;
    });

    const threatLevels = {
      CRITICAL: this.actors.filter(a => a.threatLevel === 'CRITICAL').length,
      HIGH: this.actors.filter(a => a.threatLevel === 'HIGH').length,
      MEDIUM: this.actors.filter(a => a.threatLevel === 'MEDIUM').length,
      LOW: this.actors.filter(a => a.threatLevel === 'LOW').length
    };

    return {
      totalTrackedActors: this.actors.length,
      highRiskAttributedClusters: highRiskPairs.length,
      moderateLeadCount: moderatePairs.length,
      totalEvidencePiecesIngested: this.clearnetDb.length + this.mockTransactions.length + 42,
      categoryDistribution: categories,
      threatLevels,
      topAttributionAlerts: highRiskPairs.slice(0, 6)
    };
  }
}

export const dbStore = new DatabaseStore();
