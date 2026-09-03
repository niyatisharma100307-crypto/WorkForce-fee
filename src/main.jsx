import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './styles/base.css';
import './styles/app.css';
import './styles/home.css';
import './styles/public.css';
import './styles/auth.css';

import { AuthProvider } from './components/AuthContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
