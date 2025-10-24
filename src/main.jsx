// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { resolveRedirectOnce } from '@/auth/resolveRedirectOnce';

// Ejecuta la resolución de redirect ANTES de montar (fire-and-forget)
resolveRedirectOnce();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
