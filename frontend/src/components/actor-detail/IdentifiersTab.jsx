import React from 'react';

/**
 * "Identifiers & wallets" tab: PGP key, crypto wallets, contact handles,
 * and the forums the actor is active on.
 */
export default function IdentifiersTab({ actor }) {
  return (
    <div className="row g-3">
      <div className="col-12 col-md-6">
        <div className="soc-card p-3 h-100">
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-key-fill text-warning"></i>
            <span className="fw-bold text-dark small">PGP key fingerprint</span>
          </div>
          {actor.pgpFingerprint ? (
            <div className="p-3 rounded bg-white border border-secondary text-warning small text-break">
              {actor.pgpFingerprint}
            </div>
          ) : (
            <div className="text-secondary small">No published PGP fingerprint found.</div>
          )}
        </div>
      </div>

      <div className="col-12 col-md-6">
        <div className="soc-card p-3 h-100">
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-currency-bitcoin text-info"></i>
            <span className="fw-bold text-dark small">Crypto wallets</span>
          </div>
          <div className="d-flex flex-column gap-2">
            {(actor.wallets || []).map((w, idx) => (
              <div key={idx} className="p-2 rounded bg-white border border-secondary small d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="text-info fw-bold">{w.currency}:</span>
                <span className="text-dark text-break" style={{ fontSize: '0.75rem' }}>{w.address}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="col-12 col-md-6">
        <div className="soc-card p-3 h-100">
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-chat-square-dots-fill text-success"></i>
            <span className="fw-bold text-dark small">Contact handles</span>
          </div>
          <div className="d-flex flex-column gap-2 small">
            {actor.contact?.jabber && (
              <div className="text-secondary">Jabber/XMPP: <strong className="text-dark">{actor.contact.jabber}</strong></div>
            )}
            {actor.contact?.tox && (
              <div className="text-secondary">Tox ID: <strong className="text-dark text-break" style={{ fontSize: '0.72rem' }}>{actor.contact.tox}</strong></div>
            )}
            {actor.contact?.telegram && (
              <div className="text-secondary">Telegram: <strong className="text-dark">@{actor.contact.telegram}</strong></div>
            )}
            {!actor.contact?.jabber && !actor.contact?.tox && !actor.contact?.telegram && (
              <div className="text-secondary">No contact handles on record.</div>
            )}
          </div>
        </div>
      </div>

      <div className="col-12 col-md-6">
        <div className="soc-card p-3 h-100">
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-globe text-primary"></i>
            <span className="fw-bold text-dark small">Active forums</span>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {(actor.forums || []).map((forum, idx) => (
              <span key={idx} className="badge bg-white border border-info text-info p-2" style={{ fontSize: '0.78rem' }}>
                {forum}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
