/**
 * THE KEY NOVEL FEATURE: Evidence Fusion Engine
 * 
 * Multi-source Bayesian Evidence Fusion combining:
 * 1. Infrastructure Leak Scanner (Module 1)
 * 2. Identity Graph & Link Prediction (Module 2)
 * 3. AI Persona Stylometry & Behavior (Module 3)
 * 4. Crypto Wallet Correlation & Temporal Sync (Module 4)
 * 
 * Features:
 * - Configurable Bayesian Prior (default 50% / neutral)
 * - Configurable Evidence Reliability Weights (e.g. Crypto=0.35, Infra=0.25, Style=0.20, Graph=0.20)
 * - Likelihood ratio / Log-odds mathematical belief updating
 * - Auditable Evidence Trail & percentage contribution breakdown
 */

export class EvidenceFusionEngine {
  constructor(defaultWeights = {}) {
    this.weights = {
      crypto: defaultWeights.crypto ?? 0.35,
      infra: defaultWeights.infra ?? 0.25,
      stylometry: defaultWeights.stylometry ?? 0.20,
      graph: defaultWeights.graph ?? 0.20
    };
    this.basePrior = 0.50;
  }

  /**
   * Set custom reliability weights (e.g. from UI sliders)
   */
  setWeights(customWeights = {}) {
    const raw = {
      crypto: parseFloat(customWeights.crypto ?? this.weights.crypto),
      infra: parseFloat(customWeights.infra ?? this.weights.infra),
      stylometry: parseFloat(customWeights.stylometry ?? this.weights.stylometry),
      graph: parseFloat(customWeights.graph ?? this.weights.graph)
    };

    const sum = raw.crypto + raw.infra + raw.stylometry + raw.graph;
    if (sum > 0) {
      this.weights = {
        crypto: raw.crypto / sum,
        infra: raw.infra / sum,
        stylometry: raw.stylometry / sum,
        graph: raw.graph / sum
      };
    }
  }

  /**
   * Compute Bayesian Likelihood Ratio (Bayes Factor) for a score and weight
   * Clamp scores to prevent infinities (0.02 - 0.98)
   */
  computeLikelihoodRatio(score, weight) {
    const clamped = Math.max(0.02, Math.min(0.98, score));
    const rawOddsRatio = clamped / (1.0 - clamped);
    // Exponentiate with weight to scale belief update impact
    const likelihoodRatio = Math.pow(rawOddsRatio, weight * 1.5);
    const logOddsDelta = Math.log(likelihoodRatio);
    return {
      clampedScore: clamped,
      likelihoodRatio: parseFloat(likelihoodRatio.toFixed(4)),
      logOddsDelta: parseFloat(logOddsDelta.toFixed(4))
    };
  }

  /**
   * Fuse 4 evidence modules for a persona pair
   */
  fuseEvidence({ infraResult, graphResult, stylometryResult, cryptoResult, customWeights = null, prior = null }) {
    const priorProb = prior !== null ? Math.max(0.01, Math.min(0.99, prior)) : this.basePrior;
    const priorOdds = priorProb / (1.0 - priorProb);

    // Apply custom weights if provided for sensitivity analysis
    const weightsToUse = customWeights ? {
      crypto: customWeights.crypto ?? this.weights.crypto,
      infra: customWeights.infra ?? this.weights.infra,
      stylometry: customWeights.stylometry ?? this.weights.stylometry,
      graph: customWeights.graph ?? this.weights.graph
    } : { ...this.weights };

    // Normalize weights to sum to 1.0
    const weightSum = (weightsToUse.crypto + weightsToUse.infra + weightsToUse.stylometry + weightsToUse.graph) || 1.0;
    const normWeights = {
      crypto: weightsToUse.crypto / weightSum,
      infra: weightsToUse.infra / weightSum,
      stylometry: weightsToUse.stylometry / weightSum,
      graph: weightsToUse.graph / weightSum
    };

    // Extract module scores
    const sCrypto = cryptoResult?.score ?? 0.05;
    const sInfra = infraResult?.score ?? 0.05;
    const sStyle = stylometryResult?.score ?? 0.05;
    const sGraph = graphResult?.score ?? 0.05;

    // Compute Bayesian Likelihood Ratios
    const lrCrypto = this.computeLikelihoodRatio(sCrypto, normWeights.crypto);
    const lrInfra = this.computeLikelihoodRatio(sInfra, normWeights.infra);
    const lrStyle = this.computeLikelihoodRatio(sStyle, normWeights.stylometry);
    const lrGraph = this.computeLikelihoodRatio(sGraph, normWeights.graph);

    // Posterior Odds = Prior Odds * LR_crypto * LR_infra * LR_style * LR_graph
    const totalLikelihoodRatio = lrCrypto.likelihoodRatio * lrInfra.likelihoodRatio * lrStyle.likelihoodRatio * lrGraph.likelihoodRatio;
    const posteriorOdds = priorOdds * totalLikelihoodRatio;
    const finalPosteriorProb = posteriorOdds / (1.0 + posteriorOdds);
    const confidenceScore = Math.round(finalPosteriorProb * 100);

    // Calculate Relative Positive Evidence Contribution Breakdown
    // (Based on positive log-odds shift or score * weight)
    const rawContributions = {
      crypto: Math.max(0.001, (sCrypto - 0.05) * normWeights.crypto),
      infra: Math.max(0.001, (sInfra - 0.05) * normWeights.infra),
      stylometry: Math.max(0.001, (sStyle - 0.05) * normWeights.stylometry),
      graph: Math.max(0.001, (sGraph - 0.05) * normWeights.graph)
    };
    const totalContr = rawContributions.crypto + rawContributions.infra + rawContributions.stylometry + rawContributions.graph;

    const evidenceTrail = [
      {
        module: 'Crypto Wallet Correlation',
        key: 'crypto',
        score: sCrypto,
        scorePercent: Math.round(sCrypto * 100),
        weight: parseFloat(normWeights.crypto.toFixed(2)),
        contributionPercent: Math.round((rawContributions.crypto / totalContr) * 100),
        logOddsShift: lrCrypto.logOddsDelta,
        tier: sCrypto >= 0.8 ? 'STRONG' : sCrypto >= 0.45 ? 'MODERATE' : 'WEAK',
        icon: 'bi-currency-bitcoin',
        findings: cryptoResult?.findings || []
      },
      {
        module: 'Infrastructure Leak Scanner',
        key: 'infra',
        score: sInfra,
        scorePercent: Math.round(sInfra * 100),
        weight: parseFloat(normWeights.infra.toFixed(2)),
        contributionPercent: Math.round((rawContributions.infra / totalContr) * 100),
        logOddsShift: lrInfra.logOddsDelta,
        tier: sInfra >= 0.8 ? 'STRONG' : sInfra >= 0.45 ? 'MODERATE' : 'WEAK',
        icon: 'bi-hdd-network',
        findings: infraResult?.crossFindings || infraResult?.findings || []
      },
      {
        module: 'AI Stylometry & Behavior',
        key: 'stylometry',
        score: sStyle,
        scorePercent: Math.round(sStyle * 100),
        weight: parseFloat(normWeights.stylometry.toFixed(2)),
        contributionPercent: Math.round((rawContributions.stylometry / totalContr) * 100),
        logOddsShift: lrStyle.logOddsDelta,
        tier: sStyle >= 0.7 ? 'STRONG' : sStyle >= 0.45 ? 'MODERATE' : 'WEAK',
        icon: 'bi-chat-left-quote',
        findings: stylometryResult?.findings || []
      },
      {
        module: 'Identity Graph & Link Prediction',
        key: 'graph',
        score: sGraph,
        scorePercent: Math.round(sGraph * 100),
        weight: parseFloat(normWeights.graph.toFixed(2)),
        contributionPercent: Math.round((rawContributions.graph / totalContr) * 100),
        logOddsShift: lrGraph.logOddsDelta,
        tier: sGraph >= 0.8 ? 'STRONG' : sGraph >= 0.45 ? 'MODERATE' : 'WEAK',
        icon: 'bi-diagram-3',
        findings: graphResult?.findings || []
      }
    ];

    // Determine overall confidence tier & color
    let confidenceTier = 'LOW';
    let alertColor = 'danger';
    let badgeClass = 'bg-danger text-light';

    if (confidenceScore >= 75) {
      confidenceTier = 'HIGH CONFIDENCE (PROBABLE ATTRIBUTION)';
      alertColor = 'success';
      badgeClass = 'bg-success text-dark fw-bold';
    } else if (confidenceScore >= 45) {
      confidenceTier = 'MODERATE CONFIDENCE (INVESTIGATION WARRANTED)';
      alertColor = 'warning';
      badgeClass = 'bg-warning text-dark fw-bold';
    } else {
      confidenceTier = 'LOW CONFIDENCE (DISTINCT ACTORS / UNCORRELATED)';
      alertColor = 'secondary';
      badgeClass = 'bg-secondary text-light';
    }

    // Generate Natural Language Forensic Summary
    const strongPoints = evidenceTrail.filter(e => e.tier === 'STRONG' || e.contributionPercent >= 25);
    let explanationSummary = '';
    if (confidenceScore >= 75) {
      const topReasons = strongPoints.map(p => `${p.module} (${p.contributionPercent}% contribution)`).join(', ');
      explanationSummary = `High-probability attribution confirmed (${confidenceScore}% confidence). Linkage is anchored by ${topReasons || 'concurring multi-source forensic indicators'}. High risk of single threat operator behind both aliases.`;
    } else if (confidenceScore >= 45) {
      explanationSummary = `Moderate attribution link (${confidenceScore}% confidence). Observed correlation in ${strongPoints.map(p => p.module).join(' and ') || 'behavioral markers'}, but lacks definitive cryptographic or blockchain proof. Further SIGINT surveillance recommended.`;
    } else {
      explanationSummary = `Uncorrelated identities (${confidenceScore}% confidence). No statistically significant overlap across blockchain UTXOs, server infrastructure, or stylometric fingerprints.`;
    }

    return {
      confidenceScore,
      confidenceDecimal: parseFloat(finalPosteriorProb.toFixed(4)),
      confidenceTier,
      alertColor,
      badgeClass,
      explanationSummary,
      priorProbability: priorProb,
      weights: normWeights,
      evidenceTrail,
      auditMath: {
        priorOdds: parseFloat(priorOdds.toFixed(4)),
        cryptoLikelihoodRatio: lrCrypto.likelihoodRatio,
        infraLikelihoodRatio: lrInfra.likelihoodRatio,
        styleLikelihoodRatio: lrStyle.likelihoodRatio,
        graphLikelihoodRatio: lrGraph.likelihoodRatio,
        combinedLikelihoodRatio: parseFloat(totalLikelihoodRatio.toFixed(4)),
        posteriorOdds: parseFloat(posteriorOdds.toFixed(4)),
        posteriorProbability: parseFloat(finalPosteriorProb.toFixed(4))
      }
    };
  }
}

export const defaultFusionEngine = new EvidenceFusionEngine();
