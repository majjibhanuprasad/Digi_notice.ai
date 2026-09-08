import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'DEPARTMENT_ADMIN' | 'STUDENT';
  department: string | null;
  academicYear: string | null;
  profileImage: string;
  clubs: string[];
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'DEPARTMENT_ADMIN' | 'STUDENT';
  department?: string | null;
  academicYear?: string | null;
  clubs?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
  API_URL: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData: RegisterData): Promise<User> => {
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
      // Return registered user object without auto-logging in
      return data.user;
    } catch (err) {
      throw err;
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
