import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { LoginResponse, UserRole } from '../types';
import { authService } from '../services/authService';

import { mockStore } from '../services/mockData';

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  customerId?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAs: (email: string, password?: string, fallbackUser?: AuthUser) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('keystone_token');
    const savedUser = localStorage.getItem('keystone_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('keystone_token');
        localStorage.removeItem('keystone_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response: LoginResponse = await authService.login(email, password);
      setToken(response.accessToken);
      setUser(response.user);
      localStorage.setItem('keystone_token', response.accessToken);
      localStorage.setItem('keystone_user', JSON.stringify(response.user));
    } catch {
      const found = mockStore.getRawUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        const mockToken = 'mock_jwt_token_' + found.role.toLowerCase();
        setToken(mockToken);
        setUser(found);
        localStorage.setItem('keystone_token', mockToken);
        localStorage.setItem('keystone_user', JSON.stringify(found));
        return;
      }
      throw new Error('Invalid email or password');
    }
  }, []);

  const loginAs = useCallback(async (email: string, password = 'password123', fallbackUser?: AuthUser) => {
    try {
      const response: LoginResponse = await authService.login(email, password);
      setToken(response.accessToken);
      setUser(response.user);
      localStorage.setItem('keystone_token', response.accessToken);
      localStorage.setItem('keystone_user', JSON.stringify(response.user));
    } catch {
      if (fallbackUser) {
        const mockToken = 'mock_jwt_token_' + fallbackUser.role.toLowerCase();
        setToken(mockToken);
        setUser(fallbackUser);
        localStorage.setItem('keystone_token', mockToken);
        localStorage.setItem('keystone_user', JSON.stringify(fallbackUser));
      }
    }
  }, []);

  const register = useCallback(async (data: any) => {
    const response: LoginResponse = await authService.register(data);
    setToken(response.accessToken);
    setUser(response.user);
    localStorage.setItem('keystone_token', response.accessToken);
    localStorage.setItem('keystone_user', JSON.stringify(response.user));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('keystone_token');
    localStorage.removeItem('keystone_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, loginAs, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}