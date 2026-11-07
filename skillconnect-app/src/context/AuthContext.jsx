import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const readStoredUser = () => {
  const raw = localStorage.getItem('skillconnect_user') || sessionStorage.getItem('skillconnect_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

const storeAuth = (data, rememberMe = true) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  const other = rememberMe ? sessionStorage : localStorage;
  other.removeItem('skillconnect_access_token');
  other.removeItem('skillconnect_refresh_token');
  other.removeItem('skillconnect_user');
  storage.setItem('skillconnect_access_token', data.tokens.access);
  storage.setItem('skillconnect_refresh_token', data.tokens.refresh);
  storage.setItem('skillconnect_user', JSON.stringify(data.user));
};

const mapProfileToUser = (profile, previous = {}) => {
  const customer = profile.customer_profile;
  const worker = profile.worker_profile;
  const data = customer || worker || {};
  return {
    ...previous,
    id: profile.id,
    email: profile.email,
    phone: profile.phone || data.phone || '',
    role: profile.role,
    isVerified: profile.is_verified,
    name: data.full_name || previous.name || profile.email?.split('@')[0] || 'User',
    address: data.address || '',
    ward: data.ward || '',
    panchayat: data.panchayat || '',
    district: data.district || '',
    state: data.state || '',
    pincode: data.pincode || '',
    avatar: previous.avatar || data.profile_photo || ''
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem('skillconnect_access_token') || sessionStorage.getItem('skillconnect_access_token')));

  useEffect(() => {
    let active = true;
    const accessToken = localStorage.getItem('skillconnect_access_token') || sessionStorage.getItem('skillconnect_access_token');
    if (!accessToken) {
      setAuthLoading(false);
      return undefined;
    }

    authService.getProfile()
      .then((profile) => {
        if (!active) return;
        const nextUser = mapProfileToUser(profile, readStoredUser() || {});
        setUser(nextUser);
        const storage = localStorage.getItem('skillconnect_access_token') ? localStorage : sessionStorage;
        storage.setItem('skillconnect_user', JSON.stringify(nextUser));
      })
      .catch(() => {
        if (active) {
          authService.logout();
          setUser(null);
        }
      })
      .finally(() => active && setAuthLoading(false));

    return () => { active = false; };
  }, []);

  const login = async (email, password, role = 'customer', rememberMe = true) => {
    try {
      const data = await authService.login({ email, password, role });
      storeAuth(data, rememberMe);
      setUser(data.user);
      return data.user;
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Login failed. Check your credentials.';
      throw new Error(message);
    }
  };

  const registerCustomer = async (formData) => {
    try {
      const data = await authService.registerCustomer(formData);
      if (data.tokens && data.user) {
        storeAuth(data, true);
        setUser(data.user);
      }
      return data;
    } catch (error) {
      const data = error.response?.data || {};
      const message = data.error || data.message || (typeof data === 'string' ? data : Object.values(data.errors || data).flat().join(' ')) || 'Registration failed.';
      throw new Error(String(message));
    }
  };

  const registerWorker = async (formData) => {
    try {
      return await authService.registerWorker(formData);
    } catch (error) {
      const data = error.response?.data || {};
      const message = data.error || data.message || (typeof data === 'string' ? data : Object.values(data.errors || data).flat().join(' ')) || 'Worker registration failed.';
      throw new Error(String(message));
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUserProfile = async (updatedData) => {
    const payload = {
      full_name: updatedData.name,
      email: updatedData.email,
      phone: updatedData.phone,
      address: updatedData.address,
      ward: updatedData.ward,
      district: updatedData.district
    };
    try {
      const response = await authService.updateProfile(payload);
      const nextUser = mapProfileToUser({
        ...response,
        id: user?.id,
        email: response.email || updatedData.email,
        phone: response.phone || updatedData.phone,
        role: user?.role,
        is_verified: user?.isVerified
      }, user || {});
      setUser(nextUser);
      const storage = localStorage.getItem('skillconnect_user') ? localStorage : sessionStorage;
      storage.setItem('skillconnect_user', JSON.stringify(nextUser));
      return response;
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Unable to update profile.';
      throw new Error(message);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    const data = await authService.changePassword({ old_password: currentPassword, new_password: newPassword });
    if (data.tokens) {
      const storage = localStorage.getItem('skillconnect_access_token') ? localStorage : sessionStorage;
      storage.setItem('skillconnect_access_token', data.tokens.access);
      storage.setItem('skillconnect_refresh_token', data.tokens.refresh);
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, registerCustomer, registerWorker, logout, updateUserProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
