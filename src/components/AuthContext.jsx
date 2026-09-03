import { createContext, useCallback, useContext, useState } from 'react';
import { Store } from '../store.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => Store.session());

  const login = useCallback((sessionObj) => {
    Store.setSession(sessionObj);
    setSessionState(sessionObj);
  }, []);

  const logout = useCallback(() => {
    Store.clearSession();
    setSessionState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
