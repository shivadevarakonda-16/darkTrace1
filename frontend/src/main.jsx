import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/bootstrap-shim.css';
import './styles/icons-shim.css';
import './styles/theme.css';
import './styles/auth.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
