import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentView, onNavigate, mobileNavOpen, onCloseMobileNav }) {
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'SOC Dashboard', icon: 'bi-grid-1x2-fill', badge: null },
    { id: 'actors', label: 'Threat Actor Dossiers', icon: 'bi-person-badge-fill', badge: '18', badgeClass: 'badge-cyber-low' },
    { id: 'graph', label: 'Identity Network Graph', icon: 'bi-diagram-3-fill', badge: 'Interactive', badgeClass: 'badge-cyber-medium' },
    { id: 'investigator', label: 'Dual Persona Link Lab', icon: 'bi-sliders', badge: 'Bayesian', badgeClass: 'badge-cyber-medium' },
    { id: 'scanner', label: 'Onion Infra Scanner', icon: 'bi-hdd-network-fill', badge: 'Probe', badgeClass: 'badge-cyber-low' },
    { id: 'export', label: 'Forensic Dossier & Export', icon: 'bi-file-earmark-arrow-down-fill', badge: 'STIX/PDF', badgeClass: 'badge-cyber-low' },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin-data',
      label: 'Dataset Management',
      icon: 'bi-database',
      badge: 'Admin',
      badgeClass: 'badge-cyber-critical',
    });
  }

  const renderNavContent = () => (
    <div className="d-flex flex-column h-100 p-3">
      {/* Target Cases Quick Jump */}
      <div className="mb-4">
        <div className="text-secondary font-mono small mb-2 px-2" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
          PRIMARY INVESTIGATIVE CASES:
        </div>
        <div className="d-flex flex-column gap-1">
          <button
            className="btn btn-sm text-start font-mono soc-card p-2 d-flex justify-content-between align-items-center"
            style={{ fontSize: '0.75rem', background: 'var(--soc-code-bg)' }}
            onClick={() => onNavigate('investigator', { actorA: 'ACTOR-001', actorB: 'ACTOR-002' })}
          >
            <span className="text-dark">KryptonGhost &harr; VektorZero</span>
            <span className="badge-cyber badge-cyber-success" style={{ fontSize: '0.65rem' }}>98%</span>
          </button>
          <button
            className="btn btn-sm text-start font-mono soc-card p-2 d-flex justify-content-between align-items-center"
            style={{ fontSize: '0.75rem', background: 'var(--soc-code-bg)' }}
            onClick={() => onNavigate('investigator', { actorA: 'ACTOR-003', actorB: 'ACTOR-004' })}
          >
            <span className="text-dark">SilkCobalt &harr; HydraMedic</span>
            <span className="badge-cyber badge-cyber-success" style={{ fontSize: '0.65rem' }}>95%</span>
          </button>
          <button
            className="btn btn-sm text-start font-mono soc-card p-2 d-flex justify-content-between align-items-center"
            style={{ fontSize: '0.75rem', background: 'var(--soc-code-bg)' }}
            onClick={() => onNavigate('investigator', { actorA: 'ACTOR-005', actorB: 'ACTOR-006' })}
          >
            <span className="text-dark">ZeroByte_Dev &harr; NexusRogue</span>
            <span className="badge-cyber badge-cyber-medium" style={{ fontSize: '0.65rem' }}>84%</span>
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="text-secondary font-mono small mb-2 px-2" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
        CORE MODULES:
      </div>
      <nav className="nav flex-column flex-grow-1 gap-1">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`soc-nav-link ${currentView === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(item.id);
            }}
          >
            <i className={`bi ${item.icon} fs-5`}></i>
            <span className="flex-grow-1" style={{ fontSize: '0.88rem' }}>{item.label}</span>
            {item.badge && (
              <span className={`badge-cyber ${item.badgeClass || 'badge-cyber-low'}`} style={{ fontSize: '0.65rem' }}>
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* Engine Architecture Footer */}
      <div className="p-3 rounded soc-card mt-auto" style={{ background: 'var(--soc-surface-hover)' }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <i className="bi bi-cpu text-info"></i>
          <span className="text-dark font-mono small fw-bold" style={{ fontSize: '0.75rem' }}>EVIDENCE FUSION</span>
        </div>
        <div className="text-secondary small font-mono" style={{ fontSize: '0.7rem' }}>
          <div>&bull; Module 1: Infra Rules</div>
          <div>&bull; Module 2: Graph Pred</div>
          <div>&bull; Module 3: MiniLM Stylometry</div>
          <div>&bull; Module 4: UTXO Temporal</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="d-none d-md-block soc-sidebar col-md-3 col-lg-2 p-0">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer (custom — no Bootstrap JS dependency) */}
      {mobileNavOpen && (
        <div className="mobile-drawer-backdrop d-md-none" onClick={onCloseMobileNav}>
          <div className="mobile-drawer bg-white text-dark" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <span className="font-mono text-info fw-bold small">AEGISTRACE // MENU</span>
              <button type="button" className="btn-close" onClick={onCloseMobileNav}></button>
            </div>
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
}
