import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import ConfidenceBadge from '../components/ConfidenceBadge';

export default function DashboardView({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, actorsRes] = await Promise.all([
        api.getGlobalStats(),
        api.getActors()
      ]);
      setStats(statsRes.data);
      setActors(actorsRes.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-success" role="status"></div>
        <span className="ms-3 text-secondary">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger p-4">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Failed to load dashboard: {error}
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      {/* Simple header, no jargon */}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        <div>
          <h2 className="h4 fw-semibold mb-1" style={{ color: 'var(--soc-text-primary)' }}>Overview</h2>
          <p className="text-secondary mb-0">Tracked actors, links found, and how confident we are.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => onNavigate('graph')}>
            View graph
          </button>
          <button className="btn btn-sm btn-success" onClick={() => onNavigate('investigator')}>
            Compare two actors
          </button>
        </div>
      </div>

      {/* Stats row — no boxes, just a divided strip */}
      <div className="row g-4 mb-5 pb-4" style={{ borderBottom: '1px solid var(--soc-border)' }}>
        <div className="col-6 col-lg-3">
          <StatCard
            title="Tracked actors"
            value={stats?.totalTrackedActors || 18}
            icon="bi-person-bounding-box"
            color="info"
            onClick={() => onNavigate('actors')}
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            title="Strong links found"
            value={stats?.highRiskAttributedClusters || 4}
            subtitle="80%+ confidence"
            icon="bi-link-45deg"
            color="success"
            onClick={() => onNavigate('graph')}
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            title="Possible links"
            value={stats?.moderateLeadCount || 6}
            subtitle="worth reviewing"
            icon="bi-search"
            color="warning"
            onClick={() => onNavigate('actors')}
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            title="Evidence collected"
            value={stats?.totalEvidencePiecesIngested || 58}
            icon="bi-database"
            color="purple"
            onClick={() => onNavigate('scanner')}
          />
        </div>
      </div>

      {/* Main content: two columns with a visible divider so the gap reads
          as a deliberate separator instead of empty space */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-lg-7">
          <h6 className="text-secondary mb-3" style={{ letterSpacing: '0.3px' }}>
            Actors likely to be the same person
          </h6>
          {(stats?.topAttributionAlerts || []).length === 0 ? (
            <div className="text-secondary small py-3">No high-confidence links yet — check back after the next scan.</div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {(stats?.topAttributionAlerts || []).map((pair, idx) => (
                <div
                  key={idx}
                  className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 py-3"
                  style={{ borderBottom: '1px solid var(--soc-border)' }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <img src={pair.actorA.avatar} alt={pair.actorA.handle} className="rounded-circle"
                         style={{ width: '32px', height: '32px', objectFit: 'cover' }} />
                    <span className="fw-medium">{pair.actorA.handle}</span>
                    <i className="bi bi-arrow-left-right text-secondary mx-1"></i>
                    <img src={pair.actorB.avatar} alt={pair.actorB.handle} className="rounded-circle"
                         style={{ width: '32px', height: '32px', objectFit: 'cover' }} />
                    <span className="fw-medium">{pair.actorB.handle}</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <ConfidenceBadge score={pair.confidenceScore} tier={pair.confidenceTier} />
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => onNavigate('investigator', { actorA: pair.actorA.id, actorB: pair.actorB.id })}
                    >
                      Why?
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-12 col-lg-5" style={{ borderLeft: '1px solid var(--soc-border)', paddingLeft: '2rem' }}>
          <h6 className="text-secondary mb-3" style={{ letterSpacing: '0.3px' }}>
            Actors by category
          </h6>
          {(() => {
            const allCategories = Object.entries(stats?.categoryDistribution || {}).sort((a, b) => b[1] - a[1]);
            const topCategories = allCategories.slice(0, 8);
            const remaining = allCategories.length - topCategories.length;
            const colors = ['#ff3b5c', '#ffa502', '#00d4ff', '#00ff88', '#a855f7', '#70a1ff', '#eccc68', '#ff6b9d'];
            return (
              <>
                <div className="row row-cols-2 g-3">
                  {topCategories.map(([cat, count], idx) => {
                    const barColor = colors[idx % colors.length];
                    const pct = Math.round((count / (stats?.totalTrackedActors || 18)) * 100);
                    return (
                      <div key={cat} className="col">
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="text-truncate" style={{ maxWidth: '80%' }}>{cat}</span>
                          <span className="text-secondary">{count}</span>
                        </div>
                        <div className="progress" style={{ height: '4px', background: 'var(--soc-track-bg)' }}>
                          <div className="progress-bar" style={{ width: `${pct}%`, backgroundColor: barColor }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {remaining > 0 && (
                  <button
                    className="btn btn-sm btn-link text-decoration-none ps-0 mt-3"
                    onClick={() => onNavigate('actors')}
                  >
                    +{remaining} more categor{remaining === 1 ? 'y' : 'ies'} &rarr;
                  </button>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Recent actors table — kept, since a table is the clearest way to browse a list */}
      <h6 className="text-secondary mb-3" style={{ letterSpacing: '0.3px' }}>Recently scanned</h6>
      <div className="table-responsive">
        <table className="table table-cyber align-middle">
          <thead>
            <tr>
              <th>Actor</th>
              <th>Suspected identity</th>
              <th>Category</th>
              <th>Risk</th>
              <th>Best match</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {actors.slice(0, 6).map((actor) => (
              <tr key={actor.id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img src={actor.avatar} alt={actor.handle} className="rounded-circle"
                         style={{ width: '28px', height: '28px', objectFit: 'cover' }} />
                    <span className="fw-medium">{actor.handle}</span>
                  </div>
                </td>
                <td className="small">
                  {actor.suspectedIdentity ? actor.suspectedIdentity.name : <span className="text-secondary">Not yet linked</span>}
                </td>
                <td className="text-secondary">{actor.category}</td>
                <td>
                  <span className={`badge-cyber ${actor.threatLevel === 'CRITICAL' ? 'badge-cyber-critical' : actor.threatLevel === 'HIGH' ? 'badge-cyber-high' : 'badge-cyber-medium'}`}>
                    {actor.threatLevel}
                  </span>
                </td>
                <td>
                  {actor.highestConfidenceLink ? (
                    <div className="d-flex align-items-center gap-2">
                      <ConfidenceBadge score={actor.highestConfidenceLink.confidenceScore} size="small" />
                      <span className="small">{actor.highestConfidenceLink.handle}</span>
                    </div>
                  ) : (
                    <span className="text-secondary small">None yet</span>
                  )}
                </td>
                <td className="text-end">
                  <button className="btn btn-sm btn-link text-decoration-none"
                          onClick={() => onNavigate('actor-detail', { actorId: actor.id })}>
                    View &rarr;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-center mt-2">
        <button className="btn btn-sm btn-link text-decoration-none" onClick={() => onNavigate('actors')}>
          View all {actors.length} actors &rarr;
        </button>
      </div>
    </div>
  );
}
