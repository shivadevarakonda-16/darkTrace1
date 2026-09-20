import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

export default function AdminDataView() {
  const [status, setStatus] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadStatus();
    const id = setInterval(loadStatus, 15000);
    return () => clearInterval(id);
  }, []);

  const loadStatus = async () => {
    try {
      const res = await api.getAdminStatus();
      setStatus(res.data);
    } catch (e) {
      // Non-fatal — admin status panel just stays empty
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a .csv file.');
      return;
    }
    setError('');
    setResult(null);
    setUploading(true);
    try {
      const res = await api.uploadActorsCsv(file);
      setResult(res);
      loadStatus();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleTemplateDownload = () => {
    api.downloadFile('/admin/actors/csv-template', 'aegistrace_actor_template.csv').catch(e => setError(e.message));
  };

  return (
    <div className="admin-data-view">
      <div className="mb-4">
        <h2 className="h4 font-mono fw-bold text-dark mb-1 d-flex align-items-center gap-2">
          <i className="bi bi-database text-info"></i>
          DATASET MANAGEMENT
        </h2>
        <p className="text-secondary small font-mono mb-0">
          Upload a CSV to add or update threat actor records. Matching by <code>id</code> updates an existing
          actor; a blank or unmatched <code>id</code> creates a new one.
        </p>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div
            className={`soc-card p-4 upload-dropzone ${dragOver ? 'upload-dropzone-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
          >
            <div className="text-center py-4">
              <i className="bi bi-file-earmark-arrow-down-fill fs-2 text-info d-inline-block mb-2"></i>
              <p className="fw-semibold text-dark mb-1">Drag & drop a CSV file here</p>
              <p className="text-secondary small mb-3">or</p>
              <button
                className="btn btn-sm btn-info text-dark fw-bold"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : 'Choose CSV File'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="d-none"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mt-3 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="soc-card p-3 mt-3" style={{ background: 'var(--badge-success-bg)', borderColor: 'var(--badge-success-border)' }}>
              <div className="fw-semibold" style={{ color: 'var(--badge-success-text)' }}>
                <i className="bi bi-check-circle-fill me-2"></i>
                {result.message}
              </div>
              <div className="small text-secondary mt-1">
                Persisted to MongoDB Atlas: {result.persistedToMongo ? 'Yes' : 'No (not connected — in-memory only)'}
              </div>
              {result.actorIds?.length > 0 && (
                <div className="small text-secondary mt-1 text-break">
                  IDs: {result.actorIds.join(', ')}
                </div>
              )}
            </div>
          )}

          <div className="soc-card p-3 mt-3">
            <div className="fw-semibold small text-dark mb-2">CSV format</div>
            <p className="text-secondary small mb-2">
              Columns (any order; only <code>handle</code> is required for new rows):
            </p>
            <p className="font-mono small text-secondary mb-3" style={{ wordBreak: 'break-word' }}>
              id, handle, category, threatLevel, source, lastSeen, specializations, forums, pgpFingerprint,
              btcWallet, xmrWallet, onionAddress, clearnetIpLeaked, serverBanner, suspectedName, suspectedLocation, matchedVia
            </p>
            <p className="text-secondary small mb-3">
              Use a semicolon (<code>;</code>) to separate multiple values within <code>specializations</code> or <code>forums</code>.
            </p>
            <button className="btn btn-sm btn-outline-secondary" onClick={handleTemplateDownload}>
              <i className="bi bi-file-earmark-arrow-down-fill me-2"></i>
              Download CSV Template
            </button>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="soc-card p-3">
            <div className="fw-semibold small text-dark mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-cpu text-info"></i>
              Live Data Layer Status
            </div>
            {status ? (
              <div className="d-flex flex-column gap-2 small">
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Total tracked actors</span>
                  <span className="fw-semibold text-dark">{status.totalActors}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">MongoDB Atlas</span>
                  <span className={status.mongoConnected ? 'text-success fw-semibold' : 'text-danger fw-semibold'}>
                    {status.mongoConnected ? 'Connected' : 'Not connected'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-secondary small mb-0">Loading…</p>
            )}

            <div className="border-top mt-3 pt-3">
              <div className="fw-semibold small text-dark mb-2">Recent ingestion activity</div>
              {status?.scanLogs?.length ? (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {[...status.scanLogs].reverse().map((log, i) => (
                    <div key={i} className="p-2 rounded" style={{ background: 'var(--soc-surface-hover)', fontSize: '0.72rem' }}>
                      <div className="text-secondary font-mono">{new Date(log.timestamp).toLocaleString()}</div>
                      <div className="text-dark">{log.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary small mb-0">
                  No activity yet. The simulated crawler service posts sightings here as it runs
                  (see <code>backend/services/scraperService.js</code>).
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
