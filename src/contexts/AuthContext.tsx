import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';

interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  photoURL?: string;
  isAnonymous: boolean;
  onboarding_completed?: boolean;
  role?: string;
  purpose?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Map backend user response to our User interface
  const mapUser = (data: any): User => ({
    id: data.id,
    email: data.email,
    username: data.name || data.email?.split('@')[0] || '',
    displayName: data.name,
    isAnonymous: false,
    onboarding_completed: data.onboarding_completed,
    role: data.role,
    purpose: data.purpose,
  });

  // Restore session on mount via GET /auth/me
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get<{ status: string; data: any }>(ENDPOINTS.ME);
      if (res.data) {
        setUser(mapUser(res.data));
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  // Listen for forced logouts (401 after refresh failure)
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const signOut = async () => {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } catch {
      // logout even if API fails
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAnonymous: user?.isAnonymous ?? false,
        isLoading,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
