import React from 'react';
import ConfidenceBadge from '../ConfidenceBadge';

/**
 * Profile header for the Actor Detail page: avatar, handle, threat badge,
 * suspected real identity callout, specializations, and a quick link to the
 * top attribution match.
 */
export default function ActorHeader({ actor, onNavigate }) {
  return (
    <div className="soc-card p-4 mb-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-4">
        <div className="d-flex align-items-center gap-4">
          <img
            src={actor.avatar}
            alt={actor.handle}
            className="rounded border border-2 border-info shadow"
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
          />
          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h2 className="h4 fw-bold text-dark mb-0">{actor.handle}</h2>
              <span className={`badge-cyber ${actor.threatLevel === 'CRITICAL' ? 'badge-cyber-critical' : actor.threatLevel === 'HIGH' ? 'badge-cyber-high' : 'badge-cyber-medium'}`}>
                {actor.threatLevel} threat
              </span>
            </div>
            <div className="text-secondary small mt-1">
              {actor.category} &bull; Source: {actor.source}
            </div>
            {actor.suspectedIdentity && (
              <div
                className="d-flex align-items-center gap-2 mt-2 py-1 px-2 rounded"
                style={{ background: 'var(--badge-success-bg)', border: '1px solid var(--badge-success-border)', width: 'fit-content' }}
              >
                <i className="bi bi-person-check-fill text-success"></i>
                <span className="text-dark">
                  Suspected real identity: <strong>{actor.suspectedIdentity.name}</strong>
                  <span className="text-secondary"> — {actor.suspectedIdentity.location}</span>
                </span>
              </div>
            )}
            <div className="d-flex flex-wrap gap-1 mt-2">
              {(actor.specializations || []).map((spec, i) => (
                <span key={i} className="badge bg-white border border-secondary text-secondary" style={{ fontSize: '0.7rem' }}>
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {actor.topLinks?.length > 0 && (
          <div
            className="align-self-stretch align-self-md-auto"
            style={{ minWidth: '220px', borderLeft: '2px solid var(--soc-accent-green)', paddingLeft: '1rem' }}
          >
            <div className="text-secondary small">Highest match</div>
            <div className="d-flex align-items-center justify-content-between mt-1 gap-2">
              <span className="text-dark fw-bold">{actor.topLinks[0].linkedActor.handle}</span>
              <ConfidenceBadge score={actor.topLinks[0].confidenceScore} size="small" />
            </div>
            <button
              className="btn btn-sm btn-link text-decoration-none ps-0 mt-1"
              onClick={() => onNavigate('investigator', { actorA: actor.id, actorB: actor.topLinks[0].linkedActor.id })}
            >
              Compare &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
