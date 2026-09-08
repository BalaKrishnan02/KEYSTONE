import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { LoginResponse, UserRole } from '../types';
import { authService } from '../services/authService';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  customerId?: number;
}

export const DEMO_ACCOUNTS: Record<UserRole, { email: string; name: string; id: number; customerId?: number }> = {
  MANAGER: {
    id: 1,
    name: 'Admin Manager',
    email: 'admin@vertexa.com',
  },
  DISPATCHER: {
    id: 2,
    name: 'Sarah Jenkins',
    email: 'sarah@vertexa.com',
  },
  TECHNICIAN: {
    id: 3,
    name: 'Mike Ramirez',
    email: 'mike@vertexa.com',
  },
  CUSTOMER: {
    id: 5,
    name: 'John Sterling',
    email: 'john@apex.com',
    customerId: 1,
  },
};

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  switchToRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('keystone_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          id: 1,
          name: 'Admin Manager',
          email: 'admin@vertexa.com',
          role: 'MANAGER',
        };
      }
    }
    return {
      id: 1,
      name: 'Admin Manager',
      email: 'admin@vertexa.com',
      role: 'MANAGER',
    };
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('keystone_token') || null;
  });

  const [loading, setLoading] = useState(false);

  // Auto-obtain valid token if none exists
  useEffect(() => {
    const ensureToken = async () => {
      const savedToken = localStorage.getItem('keystone_token');
      if (!savedToken) {
        try {
          const res = await authService.login('admin@vertexa.com', 'password123');
          setToken(res.accessToken);
          setUser(res.user);
          localStorage.setItem('keystone_token', res.accessToken);
          localStorage.setItem('keystone_user', JSON.stringify(res.user));
        } catch {
          // If backend offline or failing, keep default user
          const defaultUser: AuthUser = {
            id: 1,
            name: 'Admin Manager',
            email: 'admin@vertexa.com',
            role: 'MANAGER',
          };
          setUser(defaultUser);
          localStorage.setItem('keystone_user', JSON.stringify(defaultUser));
        }
      }
    };
    ensureToken();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response: LoginResponse = await authService.login(email, password);
    setToken(response.accessToken);
    setUser(response.user);
    localStorage.setItem('keystone_token', response.accessToken);
    localStorage.setItem('keystone_user', JSON.stringify(response.user));
  }, []);

  const register = useCallback(async (data: any) => {
    const response: LoginResponse = await authService.register(data);
    setToken(response.accessToken);
    setUser(response.user);
    localStorage.setItem('keystone_token', response.accessToken);
    localStorage.setItem('keystone_user', JSON.stringify(response.user));
  }, []);

  const switchToRole = useCallback(async (role: UserRole) => {
    const demo = DEMO_ACCOUNTS[role];
    try {
      const res = await authService.login(demo.email, 'password123');
      setToken(res.accessToken);
      setUser(res.user);
      localStorage.setItem('keystone_token', res.accessToken);
      localStorage.setItem('keystone_user', JSON.stringify(res.user));
    } catch {
      const fallbackUser: AuthUser = {
        id: demo.id,
        name: demo.name,
        email: demo.email,
        role: role,
        customerId: demo.customerId,
      };
      setUser(fallbackUser);
      localStorage.setItem('keystone_user', JSON.stringify(fallbackUser));
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('keystone_token');
    localStorage.removeItem('keystone_user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: true, // Always true to allow direct access without login barrier
        login,
        register,
        switchToRole,
        logout,
        loading,
      }}
    >
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