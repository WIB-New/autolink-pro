import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, usersAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('autolink_user');
      const storedToken = localStorage.getItem('autolink_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (_) {}
    setIsLoading(false);
  }, []);

  const normalizeUser = (u) => ({
    ...u,
    firstName: u.firstName || u.first_name || '',
    lastName: u.lastName || u.last_name || '',
  });

  // Persiste la session JWT retournée par login/google/otp/register
  const persistSession = (data) => {
    const safeUser = normalizeUser(data.user);
    localStorage.setItem('autolink_user', JSON.stringify(safeUser));
    localStorage.setItem('autolink_access', data.access);
    localStorage.setItem('autolink_refresh', data.refresh);
    localStorage.setItem('autolink_token', data.access);
    setUser(safeUser);
    setIsAuthenticated(true);
    return safeUser;
  };

  const login = async ({ email, password }) => {
    // 1) Tentative API réelle (backend Django)
    try {
      const { data } = await authAPI.login(email, password);
      const safeUser = persistSession(data);
      return { success: true, user: safeUser };
    } catch (err) {
      // Identifiants invalides confirmés par l'API → erreur directe
      if (err.response?.status === 400 || err.response?.status === 401) {
        return { success: false, error: 'Email ou mot de passe incorrect.' };
      }
      // API injoignable → erreur réseau honnête (aucun mode démo)
      return { success: false, error: 'Serveur injoignable — vérifiez votre connexion puis réessayez.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('autolink_user');
    localStorage.removeItem('autolink_token');
    localStorage.removeItem('autolink_access');
    localStorage.removeItem('autolink_refresh');
    setUser(null);
    setIsAuthenticated(false);
  };

  const googleLogin = async (profile) => {
    // profile = { email, first_name, last_name, google_id }
    try {
      const { data } = await authAPI.google(profile);
      const safeUser = normalizeUser(data.user);
      localStorage.setItem('autolink_user', JSON.stringify(safeUser));
      localStorage.setItem('autolink_access', data.access);
      localStorage.setItem('autolink_refresh', data.refresh);
      localStorage.setItem('autolink_token', data.access);
      setUser(safeUser);
      setIsAuthenticated(true);
      return { success: true, user: safeUser };
    } catch (err) {
      if (err.response?.data) {
        const first = Object.values(err.response.data)[0];
        return { success: false, error: Array.isArray(first) ? first[0] : String(first) };
      }
      return { success: false, error: 'Connexion Google impossible — API injoignable.' };
    }
  };

  const otpVerify = async (email, code) => {
    try {
      const { data } = await authAPI.otpVerify(email, code);
      const safeUser = persistSession(data);
      return { success: true, user: safeUser };
    } catch (err) {
      if (err.response?.data) {
        const first = Object.values(err.response.data)[0];
        return { success: false, error: Array.isArray(first) ? first[0] : String(first) };
      }
      return { success: false, error: 'Serveur injoignable — réessayez.' };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await authAPI.register({
        username: userData.email.split('@')[0] + Date.now() % 1000,
        email: userData.email,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        phone: userData.phone || '',
        role: userData.role || 'CLIENT',
        password: userData.password,
        password2: userData.password,
        ...(userData.ref_code ? { ref_code: userData.ref_code } : {}),
      });
      const safeUser = normalizeUser(data.user);
      localStorage.setItem('autolink_user', JSON.stringify(safeUser));
      localStorage.setItem('autolink_access', data.access);
      localStorage.setItem('autolink_refresh', data.refresh);
      setUser(safeUser);
      setIsAuthenticated(true);
      return { success: true, user: safeUser };
    } catch (err) {
      if (err.response?.data) {
        const first = Object.values(err.response.data)[0];
        return { success: false, error: Array.isArray(first) ? first[0] : String(first) };
      }
      return { success: false, error: 'API injoignable — réessayez plus tard.' };
    }
  };

  const updateUser = async (payload) => {
    // Met à jour le profil via l'API puis resynchronise la session locale.
    try {
      const { data } = await usersAPI.updateMe(payload);
      const safeUser = normalizeUser(data);
      localStorage.setItem('autolink_user', JSON.stringify(safeUser));
      setUser(safeUser);
      return { success: true, user: safeUser };
    } catch (err) {
      if (err.response?.data) {
        const first = Object.values(err.response.data)[0];
        return { success: false, error: Array.isArray(first) ? first[0] : String(first) };
      }
      // Hors-ligne : on applique quand même localement
      const merged = normalizeUser({ ...user, ...payload });
      localStorage.setItem('autolink_user', JSON.stringify(merged));
      setUser(merged);
      return { success: true, user: merged, offline: true };
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await usersAPI.me();
      const safeUser = normalizeUser(data);
      localStorage.setItem('autolink_user', JSON.stringify(safeUser));
      setUser(safeUser);
      return safeUser;
    } catch (_) { return null; }
  };

  const getDashboardPath = (role) => {
    const paths = {
      CLIENT: '/client/dashboard',
      OWNER: '/owner/dashboard',
      DRIVER: '/driver/dashboard',
      ADMIN: '/admin/dashboard',
      CONTROLLER: '/controller/dashboard',
    };
    return paths[role] || '/';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, register, googleLogin, otpVerify, updateUser, refreshUser, getDashboardPath }}>
      {children}
    </AuthContext.Provider>
  );
};
