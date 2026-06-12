import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface User {
  id?: string;
  _id?: string;
  adminName: string;
  collegeName: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<User>;
  register: (collegeName: string, adminName: string, email: string, password: string, confirmPassword: string) => Promise<any>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        try {
          // Verify token against server on load
          const res = await axios.get('/api/auth/me');
          if (res.data && res.data.success) {
            const freshUser = res.data.user;
            setUser(freshUser);
            // Sync fresh user back to storage
            if (localStorage.getItem('token')) {
              localStorage.setItem('user', JSON.stringify(freshUser));
            } else {
              sessionStorage.setItem('user', JSON.stringify(freshUser));
            }
          }
        } catch (err) {
          console.error('Initial token verification failed:', err);
          // Don't auto-clear here since the Axios interceptor in main.tsx will catch 401 
          // and cleanly redirect/clear to avoid duplicate state updates
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: apiToken, user: apiUser } = res.data;

      setToken(apiToken);
      setUser(apiUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`;

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', apiToken);
      storage.setItem('user', JSON.stringify(apiUser));

      return apiUser;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (
    collegeName: string,
    adminName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', {
        collegeName,
        adminName,
        email,
        password,
        confirmPassword,
      });
      
      const { token: apiToken, user: apiUser } = res.data;
      if (apiToken && apiUser) {
        setToken(apiToken);
        setUser(apiUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`;
        localStorage.setItem('token', apiToken);
        localStorage.setItem('user', JSON.stringify(apiUser));
      }
      
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    if (localStorage.getItem('token')) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
