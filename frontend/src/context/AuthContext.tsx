import React, { useState, useEffect } from 'react';
import { AuthContext, type User, type RegisterData, type AuthContextType } from './AuthContextDefinition';
import { API_URL } from '../config/api';

export type { User, RegisterData, AuthContextType };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Authenticated fetch wrapper that automatically appends bearer token
  const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const activeToken = token || localStorage.getItem('diginotice_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(activeToken ? { 'Authorization': `Bearer ${activeToken}` } : {})
    };

    const targetUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    
    const res = await fetch(targetUrl, {
      ...options,
      headers
    });

    if (res.status === 401) {
      // If token expired/invalid, clear auth state
      logout();
    }

    return res;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('diginotice_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('diginotice_token');
          setToken(null);
        }
      } catch (err) {
        console.error('Failed to restore authentication session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed. Please check credentials.');
      }

      const data = await res.json();
      localStorage.setItem('diginotice_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData: RegisterData): Promise<any> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Registration failed. Please try again.');
      }

      const data = await res.json();
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('diginotice_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, apiFetch, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
