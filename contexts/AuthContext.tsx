'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import apiClient, { endpoints } from '@/lib/api';

interface User {
  _id: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  accessToken?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('auth_token');
      const storedUser = Cookies.get('user');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          // Verify token is still valid
          await refreshUser();
        } catch (error) {
          console.error('Error parsing stored user:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const response = await apiClient.get(endpoints.profile);
      if (response.data) {
        const profileData = response.data._doc || response.data;
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      logout();
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      const response = await apiClient.post(endpoints.login, {
        identifier,
        password,
      });

      if (response.data.message === 'Agent login successful') {
        const { agent, accessToken } = response.data;
        const userData = { ...agent, accessToken };

        setUser(userData);
        Cookies.set('auth_token', accessToken, { expires: 7 });
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });

        await refreshUser();
        router.push('/bookings/add');
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('auth_token');
    Cookies.remove('user');
    router.push('/signin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

