import React, { useState } from 'react';

export default function EvidenceTrail({ evidenceTrail = [], confidenceScore = 0, auditMath = null, explanationSummary = '' }) {
  const [showMathDetails, setShowMathDetails] = useState(false);

  const getModuleColor = (key) => {
    switch (key) {
      case 'crypto': return '#00d4ff';     // Electric Blue
      case 'infra': return '#00ff9d';      // Neon Green
      case 'stylometry': return '#a855f7'; // Purple
      case 'graph': return '#ffa502';      // Amber
      default: return '#38bdf8';
    }
  };

  return (
    <div className="evidence-trail-container">
      {/* Executive Attribution Verdict Banner */}
      <div className="p-3 mb-4 rounded soc-card" style={{ background: 'rgba(17, 23, 38, 0.95)' }}>
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-shield-check text-info fs-5"></i>
            <span className="fw-semibold text-dark">Explainable Evidence Fusion Verdict</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-secondary small font-mono">POSTERIOR CONFIDENCE:</span>
            <span className="badge-cyber badge-cyber-success fs-6 font-mono fw-bold">
              {confidenceScore}%
            </span>
          </div>
        </div>
        <p className="text-secondary small mb-0 lh-base">
          {explanationSummary || 'Automated multi-modal Bayesian evaluation across 4 discrete intelligence vectors.'}
        </p>
      </div>

      {/* 4-Module Relative Contribution Stack Bar */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="text-secondary small font-mono">RELATIVE EVIDENCE CONTRIBUTION SHARE</span>
          <span className="text-secondary small font-mono">100% AUDIT TRAIL</span>
        </div>
        <div className="progress" style={{ height: '12px', background: 'var(--soc-track-bg)', borderRadius: '6px' }}>
          {evidenceTrail.map((item) => (
            <div
              key={item.key}
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${item.contributionPercent}%`,
                backgroundColor: getModuleColor(item.key)
              }}
              title={`${item.module}: ${item.contributionPercent}% share`}
            />
          ))}
        </div>
        <div className="d-flex justify-content-between mt-2 flex-wrap gap-2">
          {evidenceTrail.map((item) => (
            <div key={item.key} className="d-flex align-items-center gap-1 small">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getModuleColor(item.key) }}></span>
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{item.module.split(' ')[0]}:</span>
              <span className="font-mono fw-bold text-dark" style={{ fontSize: '0.75rem' }}>{item.contributionPercent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Module Breakdown Cards */}
      <div className="row g-3">
        {evidenceTrail.map((item) => {
          const color = getModuleColor(item.key);
          return (
            <div key={item.key} className="col-12 col-md-6">
              <div className="soc-card p-3 h-100" style={{ borderLeft: `3px solid ${color}` }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${item.icon}`} style={{ color }}></i>
                    <span className="fw-semibold text-dark small">{item.module}</span>
                  </div>
                  <span className={`badge font-mono ${item.tier === 'STRONG' ? 'bg-success text-dark' : item.tier === 'MODERATE' ? 'bg-warning text-dark' : 'bg-secondary'}`} style={{ fontSize: '0.68rem' }}>
                    {item.tier}
                  </span>
                </div>

                {/* Score vs Contribution Row */}
                <div className="d-flex justify-content-between text-secondary font-mono small mb-2" style={{ fontSize: '0.75rem' }}>
                  <span>Raw Score: <strong className="text-dark">{item.scorePercent}%</strong></span>
                  <span>Reliability Weight: <strong className="text-dark">{item.weight}</strong></span>
                  <span>Contribution: <strong style={{ color }}>{item.contributionPercent}%</strong></span>
                </div>

                <div className="progress mb-2" style={{ height: '4px', background: 'var(--soc-track-bg)' }}>
                  <div
                    className="progress-bar"
                    style={{ width: `${item.scorePercent}%`, backgroundColor: color }}
                  />
                </div>

                {/* Forensic Findings */}
                <div className="mt-2">
                  <div className="text-muted font-mono" style={{ fontSize: '0.7rem' }}>CORRELATED INDICATORS:</div>
                  <ul className="list-unstyled mb-0 mt-1">
                    {(item.findings || []).slice(0, 3).map((f, fIdx) => {
                      const text = typeof f === 'string' ? f : f.description || f.rule || JSON.stringify(f);
                      return (
                        <li key={fIdx} className="d-flex align-items-start gap-1 text-dark small py-1" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-arrow-return-right text-muted flex-shrink-0" style={{ fontSize: '0.7rem' }}></i>
                          <span>{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bayesian Mathematical Audit Trail Dropdown */}
      {auditMath && (
        <div className="mt-4">
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 font-mono"
            style={{ fontSize: '0.75rem', borderColor: '#1f2d48' }}
            onClick={() => setShowMathDetails(!showMathDetails)}
          >
            <i className={`bi bi-chevron-${showMathDetails ? 'up' : 'down'}`}></i>
            <i className="bi bi-calculator"></i>
            {showMathDetails ? 'Hide Bayesian Audit Log' : 'View Mathematical Bayesian Audit Log (Judges Explainability)'}
          </button>

          {showMathDetails && (
            <div className="soc-card p-3 mt-2 font-mono small" style={{ background: 'var(--soc-code-bg)', fontSize: '0.75rem' }}>
              <div className="text-info fw-bold mb-2">// BAYESIAN EVIDENCE FUSION COMPUTATION LOG:</div>
              <div className="text-secondary mb-1">1. Prior Probability P0 = 50.0% &rarr; Prior Odds O0 = <span className="text-dark">{auditMath.priorOdds}</span></div>
              <div className="text-secondary mb-1">2. Likelihood Ratios (LR_i = (S_i / (1 - S_i))^w_i):</div>
              <div className="ps-3 text-secondary mb-1">&bull; Crypto (LR_crypto): <span className="text-dark">{auditMath.cryptoLikelihoodRatio}</span></div>
              <div className="ps-3 text-secondary mb-1">&bull; Infra (LR_infra): <span className="text-dark">{auditMath.infraLikelihoodRatio}</span></div>
              <div className="ps-3 text-secondary mb-1">&bull; Stylometry (LR_style): <span className="text-dark">{auditMath.styleLikelihoodRatio}</span></div>
              <div className="ps-3 text-secondary mb-1">&bull; Graph (LR_graph): <span className="text-dark">{auditMath.graphLikelihoodRatio}</span></div>
              <div className="text-secondary mb-1">3. Combined Likelihood Ratio (&prod; LR_i) = <span className="text-info fw-bold">{auditMath.combinedLikelihoodRatio}</span></div>
              <div className="text-secondary mb-1">4. Posterior Odds = O0 &times; &prod; LR_i = <span className="text-dark">{auditMath.posteriorOdds}</span></div>
              <div className="text-secondary">5. Final Confidence P = PosteriorOdds / (1 + PosteriorOdds) = <span className="text-success fw-bold">{(auditMath.posteriorProbability * 100).toFixed(1)}% &rarr; {confidenceScore}%</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
