import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import ActorsListView from './views/ActorsListView';
import ActorDetailView from './views/ActorDetailView';
import NetworkGraphView from './views/NetworkGraphView';
import PairComparisonView from './views/PairComparisonView';
import ScannerSimView from './views/ScannerSimView';
import ExportReportView from './views/ExportReportView';
import AdminDataView from './views/AdminDataView';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';

function InvestigationShell() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedActorId, setSelectedActorId] = useState('ACTOR-001');
  const [selectedPair, setSelectedPair] = useState({ actorA: 'ACTOR-001', actorB: 'ACTOR-002' });
  const [notification, setNotification] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleNavigate = (view, params = {}) => {
    if (params.actorId) {
      setSelectedActorId(params.actorId);
    }
    if (params.actorA && params.actorB) {
      setSelectedPair({ actorA: params.actorA, actorB: params.actorB });
    }
    setCurrentView(view);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleResetSuccess = () => {
    showToast('Database reset successfully. Threat intelligence seed models reloaded.');
    const view = currentView;
    setCurrentView('dashboard');
    setTimeout(() => setCurrentView(view), 50);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light text-dark">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onResetSuccess={handleResetSuccess}
        onToggleMobileNav={() => setMobileNavOpen((v) => !v)}
      />

      {notification && (
        <div className="position-fixed bottom-0 end-0 p-3 z-3">
          <div className="soc-card p-3 small d-flex align-items-center gap-2 shadow-sm" style={{ background: '#ffffff' }}>
            <i className="bi bi-check-circle-fill text-success fs-5"></i>
            <span>{notification}</span>
          </div>
        </div>
      )}

      <div className="container-fluid flex-grow-1">
        <div className="row flex-nowrap">
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            mobileNavOpen={mobileNavOpen}
            onCloseMobileNav={() => setMobileNavOpen(false)}
          />

          <main className="col py-4 px-3 px-md-4 overflow-auto">
            {currentView === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
            {currentView === 'actors' && <ActorsListView onNavigate={handleNavigate} />}
            {currentView === 'actor-detail' && (
              <ActorDetailView actorId={selectedActorId} onNavigate={handleNavigate} />
            )}
            {currentView === 'graph' && <NetworkGraphView onNavigate={handleNavigate} />}
            {currentView === 'investigator' && (
              <PairComparisonView initialPair={selectedPair} onNavigate={handleNavigate} />
            )}
            {currentView === 'scanner' && <ScannerSimView />}
            {currentView === 'export' && (
              <ExportReportView selectedActorId={selectedActorId} onNavigate={handleNavigate} />
            )}
            {currentView === 'admin-data' && <AdminDataView />}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, ready } = useAuth();

  if (!ready) return null;
  if (!user) return <LoginPage />;

  return <InvestigationShell />;
}
