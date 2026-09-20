import React from 'react';

export default function ActivityTimeline({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-secondary small font-mono p-4 text-center">
        No chronological telemetry recorded for this persona.
      </div>
    );
  }

  const getBadgeClass = (type) => {
    switch (type) {
      case 'FORUM_POST': return 'badge-cyber-medium';
      case 'CRYPTO_TX': return 'badge-cyber-success';
      case 'INFRA_SCAN': return 'badge-cyber-critical';
      default: return 'badge-cyber-low';
    }
  };

  return (
    <div className="activity-timeline position-relative ps-3">
      {/* Vertical Timeline Line */}
      <div 
        className="position-absolute top-0 bottom-0" 
        style={{ left: '15px', width: '2px', background: 'var(--soc-track-bg)' }}
      />

      <div className="d-flex flex-column gap-3">
        {events.map((evt, idx) => (
          <div key={idx} className="position-relative ps-4">
            {/* Dot Node */}
            <div 
              className="position-absolute rounded-circle d-flex align-items-center justify-content-center"
              style={{
                left: '-9px',
                top: '4px',
                width: '18px',
                height: '18px',
                background: 'var(--soc-surface-active)',
                border: '2px solid #00d4ff',
                zIndex: 2
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00d4ff' }} />
            </div>

            {/* Event Box */}
            <div className="soc-card p-3">
              <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge-cyber ${getBadgeClass(evt.type)}`} style={{ fontSize: '0.65rem' }}>
                    {evt.badge}
                  </span>
                  <span className="fw-semibold text-dark small">{evt.title}</span>
                </div>
                <span className="text-muted font-mono" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-clock me-1"></i>
                  {new Date(evt.timestamp).toUTCString()}
                </span>
              </div>

              <p className="text-secondary small mb-1 font-mono lh-sm" style={{ fontSize: '0.78rem' }}>
                {evt.content}
              </p>

              <div className="text-muted" style={{ fontSize: '0.68rem' }}>
                Source: <span className="text-info">{evt.source}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
