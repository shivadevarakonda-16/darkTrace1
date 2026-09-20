import React from 'react';

/**
 * "Infrastructure" tab: leaked server details for this actor's hidden
 * service, if any were found during a scan.
 */
export default function InfrastructureTab({ infrastructure }) {
  return (
    <div className="soc-card p-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-hdd-network text-info fs-5"></i>
        <h5 className="text-dark mb-0">Infrastructure & leak footprint</h5>
      </div>

      {infrastructure ? (
        <div className="row g-4 g-md-5">
          <div className="col-12 col-md-6">
            <div className="text-secondary small mb-1">Onion address</div>
            <div className="text-info small text-break">{infrastructure.onion_address}</div>
          </div>

          <div className="col-12 col-md-6">
            <div className="text-secondary small mb-1">Server software</div>
            <div className="text-dark small">{infrastructure.server_banner || 'Hidden'}</div>
          </div>

          <div className="col-12 col-md-6">
            <div className="text-secondary small mb-1">Status page exposed</div>
            <div className={infrastructure.status_page_exposed ? 'text-danger fw-bold' : 'text-success'}>
              {infrastructure.status_page_exposed ? 'Yes — leaked real IP address' : 'No — not exposed'}
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="text-secondary small mb-1">Leaked clearnet IP</div>
            <div className="text-danger fw-bold">{infrastructure.clearnet_ip_leaked || 'None detected'}</div>
          </div>

          {infrastructure.ssl_cert && (
            <div className="col-12">
              <div className="text-secondary small mb-1">SSL certificate fingerprint</div>
              <div className="text-warning small text-break">{infrastructure.ssl_cert.sha256_fingerprint}</div>
              <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>Also seen on: {infrastructure.ssl_cert.subject_cn}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-secondary p-4 text-center">
          No hidden service infrastructure profile registered for this persona.
        </div>
      )}
    </div>
  );
}
