import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ExportReportView({ selectedActorId = 'ACTOR-001', onNavigate }) {
  const [actorId, setActorId] = useState(selectedActorId);
  const [actors, setActors] = useState([]);
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActors();
  }, []);

  useEffect(() => {
    if (actorId) {
      loadDossier(actorId);
    }
  }, [actorId]);

  const loadActors = async () => {
    try {
      const res = await api.getActors();
      setActors(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDossier = async (id) => {
    try {
      setLoading(true);
      const res = await api.getDossierReport(id);
      setDossier(res.data);
    } catch (e) {
      alert('Failed to load dossier: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    api.downloadFile('/export/csv', 'aegistrace-attribution-matrix.csv').catch(e => alert(e.message));
  };

  const handleDownloadStix = () => {
    api.downloadFile('/export/stix-json', 'aegistrace-stix-bundle.json').catch(e => alert(e.message));
  };

  return (
    <div className="export-report-view">
      {/* Top Controls (Hidden during print) */}
      <div className="no-print d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 font-mono fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-file-earmark-arrow-down-fill text-info"></i>
            FORENSIC DOSSIER & THREAT INTEL EXPORT
          </h2>
          <p className="text-secondary small font-mono mb-0">
            Download standard STIX 2.1 JSON bundles, CSV attribution matrices, or generate classified law-enforcement dossiers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadCsv}
            className="btn btn-sm btn-outline-info font-mono d-flex align-items-center gap-2"
          >
            <i className="bi bi-filetype-csv"></i>
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleDownloadStix}
            className="btn btn-sm btn-outline-warning font-mono d-flex align-items-center gap-2"
          >
            <i className="bi bi-filetype-json"></i>
            <span>Export STIX 2.1 JSON</span>
          </button>

          <button
            className="btn btn-sm btn-info text-dark font-mono fw-bold d-flex align-items-center gap-2"
            onClick={handlePrint}
          >
            <i className="bi bi-printer-fill"></i>
            <span>Print / Save PDF Dossier</span>
          </button>
        </div>
      </div>

      {/* Actor Selector (Hidden during print) */}
      <div className="no-print soc-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <label className="form-label text-secondary font-mono small mb-1" style={{ fontSize: '0.75rem' }}>
              SELECT THREAT ACTOR FOR DOSSIER GENERATION:
            </label>
            <select
              className="form-select bg-white border-secondary text-dark font-mono"
              value={actorId}
              onChange={(e) => setActorId(e.target.value)}
            >
              {actors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.handle} - {a.category} ({a.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Printable Forensic Dossier Sheet */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-info" role="status"></div>
          <span className="ms-3 font-mono text-secondary">COMPILING FORENSIC REPORT...</span>
        </div>
      ) : dossier ? (
        <div 
          className="soc-card p-4 p-md-5 font-mono" 
          style={{ background: 'var(--soc-code-bg)', border: '1px solid var(--soc-border)', borderRadius: '4px' }}
        >
          {/* Classification Header Stamp */}
          <div className="text-center border-bottom border-secondary pb-3 mb-4">
            <div className="badge-cyber badge-cyber-critical d-inline-block mb-1 fs-6">
              {dossier.classification}
            </div>
            <div className="text-secondary small">
              AEGISTRACE DE-ANONYMIZATION PLATFORM &bull; CASE REF: <strong>{dossier.reportId}</strong>
            </div>
            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
              GENERATION TIMESTAMP: {new Date(dossier.generatedDate).toUTCString()} &bull; INVESTIGATOR: {dossier.investigator}
            </div>
          </div>

          {/* Subject Overview */}
          <div className="mb-4">
            <h5 className="text-info border-bottom border-secondary pb-1 mb-3">1. SUBJECT IDENTIFICATION</h5>
            <div className="row g-3">
              <div className="col-6 col-md-3">
                <div className="text-secondary small">PRIMARY HANDLE:</div>
                <div className="text-dark fw-bold fs-5">{dossier.subject.handle}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-secondary small">INTERNAL RECORD ID:</div>
                <div className="text-dark">{dossier.subject.id}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-secondary small">THREAT SECTOR:</div>
                <div className="text-warning">{dossier.subject.category}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-secondary small">OPERATIONAL STATUS:</div>
                <div className="text-danger fw-bold">{dossier.subject.threatLevel}</div>
              </div>
            </div>

            {/* Cryptographic Identifiers */}
            <div className="mt-3 p-3 rounded bg-white border border-secondary small">
              <div className="text-secondary mb-1">PGP Fingerprint: <span className="text-warning">{dossier.subject.pgpFingerprint || 'N/A'}</span></div>
              <div className="text-secondary mb-1">Primary Wallets: <span className="text-info">{(dossier.subject.wallets || []).map(w => `${w.currency}:${w.address}`).join(', ') || 'N/A'}</span></div>
              <div className="text-secondary">Monitored Underground Forums: <span className="text-dark">{(dossier.subject.forums || []).join(', ')}</span></div>
            </div>
          </div>

          {/* Executive Bayesian Attribution Matrix */}
          <div className="mb-4">
            <h5 className="text-info border-bottom border-secondary pb-1 mb-3">2. MULTI-MODAL EVIDENCE FUSION ATTRIBUTIONS</h5>
            <p className="text-secondary small mb-3">
              {dossier.systemSummary}
            </p>

            <div className="table-responsive">
              <table className="table table-bordered table-dark border-secondary font-mono small">
                <thead>
                  <tr className="bg-white text-secondary">
                    <th>ATTRIBUTED PERSONA</th>
                    <th>CATEGORY</th>
                    <th>POSTERIOR CONFIDENCE</th>
                    <th>PRIMARY CORRELATING EVIDENCE</th>
                  </tr>
                </thead>
                <tbody>
                  {(dossier.topAttributions || []).map((attr, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold text-dark">{attr.linkedActor.handle}</td>
                      <td className="text-secondary">{attr.linkedActor.category}</td>
                      <td>
                        <span className={`badge ${attr.confidenceScore >= 75 ? 'bg-success text-dark fw-bold' : attr.confidenceScore >= 45 ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                          {attr.confidenceScore}% CONFIDENCE
                        </span>
                      </td>
                      <td className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        {attr.explanationSummary}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Attribution Evidence Breakdown */}
          {dossier.topAttributions?.[0] && (
            <div className="mb-4">
              <h5 className="text-info border-bottom border-secondary pb-1 mb-3">
                3. FORENSIC EVIDENCE TRAIL BREAKDOWN ({dossier.subject.handle} &harr; {dossier.topAttributions[0].linkedActor.handle})
              </h5>

              <div className="row g-2">
                {dossier.topAttributions[0].evidenceTrail.map((ev, i) => (
                  <div key={i} className="col-12 col-md-6">
                    <div className="p-3 bg-white rounded border border-secondary small">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="text-dark">{ev.module}</strong>
                        <span className="text-info">{ev.contributionPercent}% Contribution</span>
                      </div>
                      <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                        Raw Module Score: {ev.scorePercent}% &bull; Reliability Weight: {ev.weight} &bull; Tier: <strong className="text-warning">{ev.tier}</strong>
                      </div>
                      <ul className="list-unstyled mb-0 mt-2 text-dark" style={{ fontSize: '0.72rem' }}>
                        {ev.findings.slice(0, 2).map((f, fi) => (
                          <li key={fi}>&bull; {typeof f === 'string' ? f : f.description}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forensic Sign-Off Block */}
          <div className="border-top border-secondary pt-4 mt-5 d-flex justify-content-between align-items-end flex-wrap gap-3">
            <div>
              <div className="text-secondary small">AUTHENTICATION SIGNATURE:</div>
              <div className="text-info font-mono fw-bold">AEGIS-TRACE-AUTOPROBE//SHA256:9f8a3c...</div>
            </div>
            <div className="text-muted small">
              CONFIDENTIAL INTELLIGENCE DOSSIER &bull; FOR OFFICIAL INVESTIGATIVE USE ONLY
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
