import React from 'react';

export default function ConfidenceBadge({ score, tier = '', showLabel = true, size = 'normal' }) {
  let badgeClass = 'badge-cyber-low';
  let label = 'LOW CONFIDENCE';
  let dotColor = '#94a3b8';

  if (score >= 75) {
    badgeClass = 'badge-cyber-success';
    label = 'HIGH ATTRIBUTION';
    dotColor = '#00ff9d';
  } else if (score >= 45) {
    badgeClass = 'badge-cyber-high';
    label = 'MODERATE LEAD';
    dotColor = '#ffa502';
  }

  const fontSize = size === 'large' ? '1rem' : size === 'small' ? '0.7rem' : '0.8rem';
  const padding = size === 'large' ? '0.5rem 0.9rem' : size === 'small' ? '0.2rem 0.45rem' : '0.35rem 0.65rem';

  return (
    <span 
      className={`badge-cyber ${badgeClass} d-inline-flex align-items-center gap-2`}
      style={{ fontSize, padding }}
      title={tier || `Confidence: ${score}%`}
    >
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dotColor }}></span>
      <span className="fw-bold font-mono">{score}%</span>
      {showLabel && <span className="opacity-75">{label}</span>}
    </span>
  );
}
