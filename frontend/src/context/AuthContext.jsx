import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const token = localStorage.getItem('prism_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('prism_token');
      localStorage.removeItem('prism_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('prism_token', data.token);
    localStorage.setItem('prism_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, confirmPassword) => {
    const { data } = await api.post('/auth/register', { name, email, password, confirmPassword });
    localStorage.setItem('prism_token', data.token);
    localStorage.setItem('prism_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('prism_token');
    localStorage.removeItem('prism_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
