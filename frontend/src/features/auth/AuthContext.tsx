import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../../types';
import { authApi } from './authApi';
import type { LoginPayload, RegisterPayload } from './authApi';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<User>;
  register: (data: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  uploadAvatar: (file: File) => Promise<User>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
      if (typeof window !== 'undefined' && currentUser.role) {
        window.localStorage.setItem('campus_connect_role', currentUser.role.toUpperCase());
      }
      return currentUser;
    } catch {
      setUser(null);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('campus_connect_role');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
      if (typeof window !== 'undefined' && response.user.role) {
        window.localStorage.setItem('campus_connect_role', response.user.role.toUpperCase());
      }
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      setUser(response.user);
      if (typeof window !== 'undefined' && response.user.role) {
        window.localStorage.setItem('campus_connect_role', response.user.role.toUpperCase());
      }
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('campus_connect_role');
      }
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    const updatedUser = await authApi.updateProfile(data);
    setUser(updatedUser);
    return updatedUser;
  };

  const uploadAvatar = async (file: File): Promise<User> => {
    const res = await authApi.uploadAvatar(file);
    setUser(res.user);
    return res.user;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    uploadAvatar,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
