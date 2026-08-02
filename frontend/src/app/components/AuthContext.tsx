'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthState {
  token: string | null;
  username: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, username: string) => void;
  logout: () => void;
  authHeader: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ token: null, username: null });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const username = localStorage.getItem('auth_username');
    if (token && username) setAuth({ token, username });
  }, []);

  const login = (token: string, username: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_username', username);
    setAuth({ token, username });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_username');
    setAuth({ token: null, username: null });
  };

  const authHeader = (): Record<string, string> =>
    auth.token ? { Authorization: `Bearer ${auth.token}` } : {};

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
