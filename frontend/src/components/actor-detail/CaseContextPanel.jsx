import React from 'react';

/**
 * Case context strip shown under the tabs: statistical/administrative case
 * info only (region, count, status) — deliberately never a personal victim
 * narrative. See project notes for why this stays abstract.
 */
export default function CaseContextPanel({ caseContext }) {
  if (!caseContext) return null;

  return (
    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--soc-border)' }}>
      <h6 className="text-secondary mb-3">Case context</h6>
      <div className="row g-4">
        <div className="col-6 col-md-3">
          <div className="text-secondary small mb-1">Case type</div>
          <div>{caseContext.caseType}</div>
        </div>
        <div className="col-6 col-md-3">
          <div className="text-secondary small mb-1">Region</div>
          <div>{caseContext.affectedRegion}</div>
        </div>
        <div className="col-6 col-md-3">
          <div className="text-secondary small mb-1">Reported cases</div>
          <div>{caseContext.estimatedCaseCount}</div>
        </div>
        <div className="col-6 col-md-3">
          <div className="text-secondary small mb-1">Status</div>
          <div>{caseContext.investigationStatus}</div>
        </div>
      </div>
      <div className="text-secondary small mt-3">
        Handling unit: {caseContext.agencyFocus}. No personal victim information is stored in this record.
      </div>
    </div>
  );
}
