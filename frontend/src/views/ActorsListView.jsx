import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ConfidenceBadge from '../components/ConfidenceBadge';

export default function ActorsListView({ onNavigate }) {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedThreat, setSelectedThreat] = useState('ALL');

  useEffect(() => {
    loadActors();
  }, []);

  const loadActors = async () => {
    try {
      setLoading(true);
      const res = await api.getActors();
      setActors(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(actors.map(a => a.category))).sort()];

  const filteredActors = actors.filter((actor) => {
    const matchesSearch = !search || 
      actor.handle.toLowerCase().includes(search.toLowerCase()) ||
      actor.id.toLowerCase().includes(search.toLowerCase()) ||
      actor.category.toLowerCase().includes(search.toLowerCase()) ||
      (actor.pgpFingerprint && actor.pgpFingerprint.toLowerCase().includes(search.toLowerCase())) ||
      (actor.wallets || []).some(w => w.address.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || actor.category === selectedCategory;
    const matchesThreat = selectedThreat === 'ALL' || actor.threatLevel === selectedThreat;

    return matchesSearch && matchesCategory && matchesThreat;
  });

  return (
    <div className="actors-list-view">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 font-mono fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-person-badge-fill text-info"></i>
            TRACKED DARK WEB THREAT ACTORS
          </h2>
          <p className="text-secondary small font-mono mb-0">
            Repository of monitored underground personas with cryptographic, financial, infrastructure, and stylometric telemetry.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge-cyber badge-cyber-medium font-mono">
            {filteredActors.length} / {actors.length} PROFILES
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="soc-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          {/* Search Box */}
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-secondary text-secondary font-mono">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-white border-secondary text-dark font-mono"
                placeholder="Search by handle, PGP, wallet, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
              {search && (
                <button 
                  className="btn btn-dark border-secondary text-secondary" 
                  onClick={() => setSearch('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="col-12 col-sm-6 col-md-4">
            <select
              className="form-select bg-white border-secondary text-dark font-mono"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>Category: {c}</option>
              ))}
            </select>
          </div>

          {/* Threat Level Filter */}
          <div className="col-12 col-sm-6 col-md-3">
            <select
              className="form-select bg-white border-secondary text-dark font-mono"
              value={selectedThreat}
              onChange={(e) => setSelectedThreat(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            >
              <option value="ALL">Threat: ALL</option>
              <option value="CRITICAL">Threat: CRITICAL</option>
              <option value="HIGH">Threat: HIGH</option>
              <option value="MEDIUM">Threat: MEDIUM</option>
              <option value="LOW">Threat: LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actor Table */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-info" role="status"></div>
          <span className="ms-3 font-mono text-secondary">FILTERING THREAT PERSONAS...</span>
        </div>
      ) : error ? (
        <div className="alert alert-danger font-mono">{error}</div>
      ) : (
        <div className="soc-card p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-cyber align-middle mb-0">
              <thead>
                <tr>
                  <th>PERSONA PROFILE</th>
                  <th>THREAT LEVEL</th>
                  <th>OPERATIONAL SECTOR</th>
                  <th>SOURCE / FORUM</th>
                  <th>IDENTIFIERS</th>
                  <th>LINKED PERSONA</th>
                  <th className="text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredActors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-secondary font-mono">
                      No threat actors match the current search filters.
                    </td>
                  </tr>
                ) : (
                  filteredActors.map((actor) => (
                    <tr key={actor.id}>
                      {/* Persona Profile */}
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={actor.avatar}
                            alt={actor.handle}
                            className="rounded border border-secondary"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                          <div>
                            <div 
                              className="fw-bold text-dark font-mono small text-decoration-none cursor-pointer"
                              style={{ cursor: 'pointer' }}
                              onClick={() => onNavigate('actor-detail', { actorId: actor.id })}
                            >
                              {actor.handle}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {actor.suspectedIdentity ? (
                                <><i className="bi bi-person-check-fill text-success me-1"></i>{actor.suspectedIdentity.name}</>
                              ) : (
                                'Identity not yet linked'
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Threat Level */}
                      <td>
                        <span className={`badge-cyber ${
                          actor.threatLevel === 'CRITICAL' ? 'badge-cyber-critical' :
                          actor.threatLevel === 'HIGH' ? 'badge-cyber-high' :
                          actor.threatLevel === 'MEDIUM' ? 'badge-cyber-medium' : 'badge-cyber-low'
                        }`}>
                          {actor.threatLevel}
                        </span>
                      </td>

                      {/* Operational Sector */}
                      <td>
                        <div className="text-dark small fw-medium">{actor.category}</div>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {(actor.specializations || []).slice(0, 2).map((s, idx) => (
                            <span key={idx} className="badge bg-white border border-secondary text-secondary" style={{ fontSize: '0.62rem' }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Source */}
                      <td>
                        <div className="text-dark small font-mono">{actor.source}</div>
                        <div className="text-muted" style={{ fontSize: '0.68rem' }}>
                          Last: {new Date(actor.lastSeen).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Identifiers Badges */}
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {actor.pgpFingerprint && (
                            <span className="badge bg-white border border-warning text-warning font-mono d-inline-block text-truncate" style={{ maxWidth: '140px', fontSize: '0.65rem' }} title={`PGP: ${actor.pgpFingerprint}`}>
                              PGP: {actor.pgpFingerprint.slice(0, 8)}...
                            </span>
                          )}
                          {(actor.wallets || []).length > 0 && (
                            <span className="badge bg-white border border-info text-info font-mono d-inline-block text-truncate" style={{ maxWidth: '140px', fontSize: '0.65rem' }} title={`Wallet: ${actor.wallets[0].address}`}>
                              {actor.wallets[0].currency}: {actor.wallets[0].address.slice(0, 6)}...
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Linked Persona */}
                      <td>
                        {actor.highestConfidenceLink ? (
                          <div className="d-flex flex-column gap-1">
                            <div className="d-flex align-items-center gap-1">
                              <ConfidenceBadge score={actor.highestConfidenceLink.confidenceScore} size="small" />
                            </div>
                            <span 
                              className="text-info font-mono small cursor-pointer"
                              style={{ cursor: 'pointer', fontSize: '0.75rem' }}
                              onClick={() => onNavigate('investigator', { actorA: actor.id, actorB: actor.highestConfidenceLink.actorId })}
                            >
                              &harr; {actor.highestConfidenceLink.handle}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted font-mono" style={{ fontSize: '0.72rem' }}>No direct link</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="text-end">
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-info font-mono"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => onNavigate('actor-detail', { actorId: actor.id })}
                            title="Open forensic dossier"
                          >
                            Dossier
                          </button>
                          {actor.highestConfidenceLink && (
                            <button
                              className="btn btn-sm btn-outline-success font-mono"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => onNavigate('investigator', { actorA: actor.id, actorB: actor.highestConfidenceLink.actorId })}
                              title="Compare evidence trail"
                            >
                              <i className="bi bi-sliders"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
