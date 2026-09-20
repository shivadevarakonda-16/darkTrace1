import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('aegis-user');
    return raw ? JSON.parse(raw) : null;
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // If a session expires mid-use (401 from any API call), drop back to login.
    const onExpire = () => setUser(null);
    window.addEventListener('aegis-session-expired', onExpire);
    return () => window.removeEventListener('aegis-session-expired', onExpire);
  }, []);

  useEffect(() => {
    setReady(true);
  }, []);

  const login = useCallback((token, userInfo) => {
    localStorage.setItem('aegis-token', token);
    localStorage.setItem('aegis-user', JSON.stringify(userInfo));
    setUser(userInfo);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aegis-token');
    localStorage.removeItem('aegis-user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
