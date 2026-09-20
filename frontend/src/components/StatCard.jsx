import React from 'react';

export default function StatCard({ title, value, subtitle, icon, color = 'info', onClick = null }) {
  const colorMap = {
    info: '#00d4ff',
    success: '#00ff88',
    warning: '#ffa502',
    danger: '#ff3b5c',
    purple: '#a855f7'
  };
  const accent = colorMap[color] || colorMap.info;

  return (
    <div
      className={onClick ? 'cursor-pointer' : ''}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        padding: '0.5rem 0 0.5rem 1rem',
        borderLeft: `2px solid ${accent}`
      }}
    >
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className={`bi ${icon}`} style={{ color: accent, fontSize: '0.95rem' }}></i>
        <span className="text-secondary small">{title}</span>
      </div>
      <div className="fs-2 fw-semibold" style={{ color: 'var(--soc-text-primary)' }}>{value}</div>
      {subtitle && <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{subtitle}</div>}
    </div>
  );
}
