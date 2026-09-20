import React from 'react';

const TABS = [
  { key: 'attributions', icon: 'bi-shield-lock-fill', label: 'Linked personas' },
  { key: 'identifiers', icon: 'bi-fingerprint', label: 'Identifiers & wallets' },
  { key: 'infra', icon: 'bi-hdd-network-fill', label: 'Infrastructure' },
  { key: 'timeline', icon: 'bi-clock-history', label: 'Timeline' }
];

/**
 * Simple tab navigation for the Actor Detail page. Counts (links found,
 * timeline events) are passed in so the tab labels stay accurate without
 * this component needing to know where that data comes from.
 */
export default function ActorTabs({ activeTab, onChange, linkCount, timelineCount }) {
  const countFor = (key) => {
    if (key === 'attributions') return linkCount;
    if (key === 'timeline') return timelineCount;
    return null;
  };

  return (
    <div className="d-flex border-bottom border-secondary mb-4 gap-2 flex-wrap">
      {TABS.map((tab) => {
        const count = countFor(tab.key);
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            className={`btn rounded-0 pb-2 px-3 ${isActive ? 'text-info border-bottom border-info border-2 fw-bold' : 'text-secondary'}`}
            onClick={() => onChange(tab.key)}
          >
            <i className={`bi ${tab.icon} me-2`}></i>
            {tab.label}{count !== null ? ` (${count})` : ''}
          </button>
        );
      })}
    </div>
  );
}
