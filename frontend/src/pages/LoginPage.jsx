import React, { useState } from 'react';
import { Shield, UserCog, Search, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [role, setRole] = useState('investigator'); // 'investigator' | 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Enter a username and password.');
      return;
    }
    setLoading(true);
    try {
      const res = role === 'admin'
        ? await api.loginAdmin(username.trim(), password)
        : await api.loginInvestigator(username.trim(), password);
      login(res.token, res.user);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <Shield size={28} strokeWidth={2} />
          <div>
            <div className="login-brand-title">AegisTrace</div>
            <div className="login-brand-subtitle">Threat Actor Attribution Platform</div>
          </div>
        </div>

        <div className="login-tabs" role="tablist" aria-label="Choose login type">
          <button
            type="button"
            role="tab"
            aria-selected={role === 'investigator'}
            className={`login-tab ${role === 'investigator' ? 'login-tab-active' : ''}`}
            onClick={() => { setRole('investigator'); setError(''); }}
          >
            <Search size={16} />
            Investigator Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === 'admin'}
            className={`login-tab ${role === 'admin' ? 'login-tab-active' : ''}`}
            onClick={() => { setRole('admin'); setError(''); }}
          >
            <UserCog size={16} />
            Admin Login
          </button>
        </div>

        <p className="login-tab-desc">
          {role === 'admin'
            ? 'Manage the actor dataset: upload CSV updates and monitor the ingestion pipeline.'
            : 'Investigate tracked actors, run attribution analysis, and export case dossiers.'}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            Username
            <input
              className="login-input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={role === 'admin' ? 'admin' : 'investigator'}
            />
          </label>

          <label className="login-label">
            Password
            <input
              className="login-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && (
            <div className="login-error">
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? <Loader2 size={16} className="spin" /> : (role === 'admin' ? <UserCog size={16} /> : <Search size={16} />)}
            {loading ? 'Signing in…' : role === 'admin' ? 'Sign in as Admin' : 'Sign in as Investigator'}
          </button>
        </form>

        <p className="login-footnote">
          Default seeded credentials are set in <code>backend/.env</code> (
          <code>ADMIN_USERNAME</code> / <code>INVESTIGATOR_USERNAME</code>) — change them before real use.
        </p>
      </div>
    </div>
  );
}
