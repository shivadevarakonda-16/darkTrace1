import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onNavigate, currentView, onResetSuccess, onToggleMobileNav }) {
  const { user, isAdmin, logout } = useAuth();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!isAdmin) return;
    if (window.confirm('Reset threat actor database and re-run all baseline evidence fusion pipelines?')) {
      try {
        setIsResetting(true);
        await api.resetData();
        if (onResetSuccess) onResetSuccess();
      } catch (e) {
        alert('Reset failed: ' + e.message);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <header className="soc-header sticky-top py-2 px-3 px-md-4">
      <div className="d-flex justify-content-between align-items-center">
        {/* Brand & SOC Telemetry */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-dark d-md-none border-secondary"
            type="button"
            onClick={onToggleMobileNav}
          >
            <i className="bi bi-list fs-5"></i>
          </button>

          <div
            className="d-flex align-items-center gap-2 cursor-pointer"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('dashboard')}
          >
            <div className="d-flex align-items-center justify-content-center rounded p-1" style={{ background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.4)' }}>
              <i className="bi bi-shield-shaded text-info fs-4"></i>
            </div>
            <div>
              <div className="fw-bold tracking-wide text-dark d-flex align-items-center gap-2" style={{ letterSpacing: '1px', fontSize: '1.05rem' }}>
                <span>Dark<span className="text-info">TRACE</span></span>
              </div>
              <div className="text-secondary font-mono" style={{ fontSize: '0.68rem', letterSpacing: '0.3px' }}>
                DARK WEB THREAT ACTOR MULTI-MODAL ATTRIBUTION PLATFORM
              </div>
            </div>
          </div>
        </div>

        {/* Global Status Bar & Quick Actions */}
        <div className="d-flex align-items-center gap-2 gap-md-3">
          <div className="d-none d-lg-flex align-items-center gap-2 px-3 py-1 rounded soc-card">
            <span className="pulse-indicator"></span>
            <span className="text-dark font-mono small" style={{ fontSize: '0.75rem' }}>
              FUSION ENGINE: <strong className="text-success">ONLINE</strong>
            </span>
          </div>

          <button
            className="btn btn-sm btn-outline-info font-mono d-none d-sm-flex align-items-center gap-2"
            onClick={() => onNavigate('investigator')}
            style={{ fontSize: '0.78rem' }}
          >
            <i className="bi bi-sliders"></i>
            <span>Live Pair Lab</span>
          </button>

          {isAdmin && (
            <button
              className="btn btn-sm btn-outline-secondary font-mono d-flex align-items-center gap-2"
              onClick={handleReset}
              disabled={isResetting}
              title="Reset synthetic data & re-seed test clusters (admin only)"
              style={{ fontSize: '0.78rem' }}
            >
              <i className={`bi bi-arrow-clockwise ${isResetting ? 'spin' : ''}`}></i>
              <span className="d-none d-md-inline">{isResetting ? 'Re-seeding...' : 'Re-seed Demo'}</span>
            </button>
          )}

          {/* Session / user badge */}
          <div className="d-flex align-items-center gap-2 px-3 py-1 rounded soc-card">
            <i className={`bi ${isAdmin ? 'bi-person-badge-fill' : 'bi-person-check-fill'} text-info`}></i>
            <span className="text-dark font-mono small d-none d-md-inline" style={{ fontSize: '0.75rem' }}>
              {user?.username} <span className="text-secondary">({user?.role})</span>
            </span>
          </div>

          <button
            className="btn btn-sm btn-outline-secondary font-mono"
            onClick={logout}
            title="Log out"
            style={{ fontSize: '0.78rem' }}
          >
            <i className="bi bi-x"></i>
            <span className="d-none d-md-inline"> Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
