import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ConfidenceBadge from '../components/ConfidenceBadge';
import EvidenceTrail from '../components/EvidenceTrail';

export default function PairComparisonView({ initialPair, onNavigate }) {
  const [actors, setActors] = useState([]);
  const [actorAId, setActorAId] = useState(initialPair?.actorA || 'ACTOR-001');
  const [actorBId, setActorBId] = useState(initialPair?.actorB || 'ACTOR-002');

  const [weights, setWeights] = useState({
    crypto: 0.35,
    infra: 0.25,
    stylometry: 0.20,
    graph: 0.20
  });
  const [prior, setPrior] = useState(0.50);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [attribution, setAttribution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { loadActors(); }, []);

  useEffect(() => {
    if (initialPair?.actorA && initialPair?.actorB) {
      setActorAId(initialPair.actorA);
      setActorBId(initialPair.actorB);
    }
  }, [initialPair]);

  useEffect(() => {
    if (actorAId && actorBId && actorAId !== actorBId) {
      runAttribution();
    }
  }, [actorAId, actorBId, weights, prior]);

  const loadActors = async () => {
    try {
      const res = await api.getActors();
      setActors(res.data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  const runAttribution = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.computePairAttribution(actorAId, actorBId, weights, prior);
      setAttribution(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseSelect = (a, b) => {
    setActorAId(a);
    setActorBId(b);
  };

  const resetWeightsToDefault = () => {
    setWeights({ crypto: 0.35, infra: 0.25, stylometry: 0.20, graph: 0.20 });
    setPrior(0.50);
  };

  const presets = [
    { a: 'ACTOR-001', b: 'ACTOR-002', label: 'Ransomware pair' },
    { a: 'ACTOR-003', b: 'ACTOR-004', label: 'Narcotics pair' },
    { a: 'ACTOR-005', b: 'ACTOR-006', label: '0-Day broker pair' },
    { a: 'ACTOR-001', b: 'ACTOR-003', label: 'Unrelated pair (control)' }
  ];

  return (
    <div className="pair-comparison-view">
      {/* Simple header */}
      <div className="mb-4">
        <h2 className="h4 fw-semibold mb-1" style={{ color: 'var(--soc-text-primary)' }}>Compare two actors</h2>
        <p className="text-secondary mb-0">Pick two actors to see how likely it is they're the same person, and why.</p>
      </div>

      {/* Quick presets — plain text buttons, no boxes */}
      <div className="d-flex flex-wrap gap-2 mb-4 pb-4" style={{ borderBottom: '1px solid var(--soc-border)' }}>
        {presets.map((p, i) => (
          <button
            key={i}
            className={`btn btn-sm ${actorAId === p.a && actorBId === p.b ? 'btn-success' : 'btn-outline-secondary'}`}
            onClick={() => handleCaseSelect(p.a, p.b)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Selectors — one simple row: A, vs, B */}
      <div className="row g-3 align-items-end mb-4">
        <div className="col-12 col-md-5">
          <label className="form-label text-secondary small mb-1">Actor A</label>
          <select className="form-select" value={actorAId} onChange={(e) => setActorAId(e.target.value)}>
            {actors.map((a) => (
              <option key={a.id} value={a.id}>{a.handle} — {a.category}</option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-2 text-center">
          <span className="text-secondary fw-bold">vs</span>
        </div>

        <div className="col-12 col-md-5">
          <label className="form-label text-secondary small mb-1">Actor B</label>
          <select className="form-select" value={actorBId} onChange={(e) => setActorBId(e.target.value)}>
            {actors.map((a) => (
              <option key={a.id} value={a.id} disabled={a.id === actorAId}>{a.handle} — {a.category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced controls — tucked away by default so the page stays simple */}
      <div className="mb-4">
        <button className="btn btn-sm btn-link text-decoration-none ps-0" onClick={() => setShowAdvanced(!showAdvanced)}>
          <i className={`bi bi-chevron-${showAdvanced ? 'down' : 'right'} me-1`}></i>
          Advanced: adjust how much each type of evidence counts
        </button>
        {showAdvanced && (
          <div className="row g-4 mt-1 pt-3" style={{ borderTop: '1px solid var(--soc-border)' }}>
            <div className="col-6 col-md-3">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-secondary">Wallet / crypto</span>
                <strong className="text-info">{weights.crypto}</strong>
              </div>
              <input type="range" className="form-range soc-slider" min="0.05" max="0.80" step="0.05"
                value={weights.crypto} onChange={(e) => setWeights({ ...weights, crypto: parseFloat(e.target.value) })} />
            </div>
            <div className="col-6 col-md-3">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-secondary">Server / infra</span>
                <strong className="text-success">{weights.infra}</strong>
              </div>
              <input type="range" className="form-range soc-slider" min="0.05" max="0.80" step="0.05"
                value={weights.infra} onChange={(e) => setWeights({ ...weights, infra: parseFloat(e.target.value) })} />
            </div>
            <div className="col-6 col-md-3">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-secondary">Writing style</span>
                <strong style={{ color: '#a855f7' }}>{weights.stylometry}</strong>
              </div>
              <input type="range" className="form-range soc-slider" min="0.05" max="0.80" step="0.05"
                value={weights.stylometry} onChange={(e) => setWeights({ ...weights, stylometry: parseFloat(e.target.value) })} />
            </div>
            <div className="col-6 col-md-3">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-secondary">Starting assumption</span>
                <strong className="text-warning">{Math.round(prior * 100)}%</strong>
              </div>
              <input type="range" className="form-range soc-slider" min="0.10" max="0.90" step="0.05"
                value={prior} onChange={(e) => setPrior(parseFloat(e.target.value))} />
            </div>
            <div className="col-12">
              <button className="btn btn-sm btn-outline-secondary" onClick={resetWeightsToDefault}>Reset to defaults</button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-success" role="status"></div>
          <span className="ms-3 text-secondary">Comparing...</span>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : attribution ? (
        <div>
          {/* Plain side-by-side profile strip with the score in the middle — no boxes */}
          <div className="row g-3 align-items-center mb-4 pb-4" style={{ borderBottom: '1px solid var(--soc-border)' }}>
            <div className="col-5">
              <div className="d-flex align-items-center gap-3">
                <img src={attribution.actorA.avatar} alt={attribution.actorA.handle} className="rounded-circle"
                     style={{ width: '52px', height: '52px', objectFit: 'cover' }} />
                <div>
                  <div className="fw-semibold fs-5">{attribution.actorA.handle}</div>
                  <div className="text-secondary small">{attribution.actorA.category}</div>
                  {attribution.actorA.suspectedIdentity && (
                    <div className="small text-success mt-1">
                      <i className="bi bi-person-check-fill me-1"></i>{attribution.actorA.suspectedIdentity.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-2 text-center">
              <ConfidenceBadge score={attribution.confidenceScore} tier={attribution.confidenceTier} showLabel={false} size="large" />
              <div className="text-secondary small mt-1">match confidence</div>
            </div>

            <div className="col-5">
              <div className="d-flex align-items-center gap-3 justify-content-end text-end flex-row-reverse">
                <img src={attribution.actorB.avatar} alt={attribution.actorB.handle} className="rounded-circle"
                     style={{ width: '52px', height: '52px', objectFit: 'cover' }} />
                <div>
                  <div className="fw-semibold fs-5">{attribution.actorB.handle}</div>
                  <div className="text-secondary small">{attribution.actorB.category}</div>
                  {attribution.actorB.suspectedIdentity && (
                    <div className="small text-success mt-1">
                      <i className="bi bi-person-check-fill me-1"></i>{attribution.actorB.suspectedIdentity.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Why — evidence trail, unboxed */}
          <h6 className="text-secondary mb-3">Why we think this</h6>
          <EvidenceTrail
            evidenceTrail={attribution.evidenceTrail}
            confidenceScore={attribution.confidenceScore}
            auditMath={attribution.auditMath}
            explanationSummary={attribution.explanationSummary}
          />
        </div>
      ) : null}
    </div>
  );
}
