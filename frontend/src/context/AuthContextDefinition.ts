import { createContext } from 'react';

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

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<any>;
  logout: () => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
  API_URL: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
