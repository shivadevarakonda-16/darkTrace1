import React from 'react';
import ConfidenceBadge from '../ConfidenceBadge';
import EvidenceTrail from '../EvidenceTrail';

/**
 * "Linked personas" tab: a ranked list of candidate matches on the left,
 * and the full evidence trail for whichever one is selected on the right.
 */
export default function AttributionsTab({ actor, links, selectedIndex, onSelect, onNavigate }) {
  const currentLink = links[selectedIndex] || null;

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-4">
        <div className="soc-card p-3">
          <div className="text-secondary small mb-2">Ranked candidate matches</div>
          <div className="d-flex flex-column gap-2">
            {links.map((link, idx) => (
              <div
                key={link.linkedActor.id}
                className={`soc-card p-3 ${selectedIndex === idx ? 'soc-card-active' : ''}`}
                style={{ cursor: 'pointer', background: selectedIndex === idx ? 'var(--soc-surface-active)' : 'var(--soc-surface)' }}
                onClick={() => onSelect(idx)}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-bold text-dark small">{link.linkedActor.handle}</span>
                  <ConfidenceBadge score={link.confidenceScore} size="small" />
                </div>
                <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                  {link.linkedActor.category} &bull; {link.linkedActor.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-8">
        {currentLink ? (
          <div className="soc-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div>
                <span className="text-secondary small">Comparing</span>
                <h4 className="text-dark mb-0">
                  {actor.handle} &harr; {currentLink.linkedActor.handle}
                </h4>
              </div>
              <button
                className="btn btn-sm btn-info text-dark fw-bold"
                onClick={() => onNavigate('investigator', { actorA: actor.id, actorB: currentLink.linkedActor.id })}
              >
                <i className="bi bi-sliders me-1"></i>
                Open in Compare
              </button>
            </div>

            <EvidenceTrail
              evidenceTrail={currentLink.evidenceTrail}
              confidenceScore={currentLink.confidenceScore}
              auditMath={currentLink.auditMath}
              explanationSummary={currentLink.explanationSummary}
            />
          </div>
        ) : (
          <div className="soc-card p-4 text-center text-secondary">
            No linked personas detected for this profile.
          </div>
        )}
      </div>
    </div>
  );
}
