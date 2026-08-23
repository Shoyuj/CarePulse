import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setToken, getToken } from '../api/client';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [
  {
    role: 'PATIENT',
    name: 'Rohan Sharma',
    email: 'patient.rohan@gmail.com',
    password: 'patient123',
    subtitle: 'Cardiac Patient (Rajpur Rd)'
  },
  {
    role: 'PATIENT',
    name: 'Priya Negi',
    email: 'patient.priya@gmail.com',
    password: 'patient123',
    subtitle: 'Dermatology Patient (Dalanwala)'
  },
  {
    role: 'DOCTOR',
    name: 'Dr. Raghavendra Rawat',
    email: 'dr.rawat@healthcare.com',
    password: 'doctor123',
    subtitle: 'Cardiologist (Max Hospital DDN)'
  },
  {
    role: 'DOCTOR',
    name: 'Dr. Priya Semwal',
    email: 'dr.semwal@healthcare.com',
    password: 'doctor123',
    subtitle: 'Dermatologist (Dalanwala)'
  },
  {
    role: 'DOCTOR',
    name: 'Dr. Arvind Negi',
    email: 'dr.negi@healthcare.com',
    password: 'doctor123',
    subtitle: 'Orthopedic Surgeon (Synergy Hospital)'
  },
  {
    role: 'ADMIN',
    name: 'Dehradun Clinic Admin',
    email: 'admin@healthcare.com',
    password: 'admin123',
    subtitle: 'Operations & Healthcare Network'
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (err) {
      console.warn('Failed to restore session:', err);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    setToken(res.token);
    const userData = res.user || {
      id: res.userId,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
      doctorProfileId: res.doctorProfileId
    };
    setUser(userData);
    return userData;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    setToken(res.token);
    const userData = res.user || {
      id: res.userId,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
      doctorProfileId: res.doctorProfileId
    };
    setUser(userData);
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const quickLogin = async (demoAccount) => {
    setLoading(true);
    try {
      return await login(demoAccount.email, demoAccount.password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        quickLogin,
        refreshUser: fetchCurrentUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isDoctor: user?.role === 'DOCTOR',
        isPatient: user?.role === 'PATIENT'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
