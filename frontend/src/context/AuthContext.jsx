import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('asvanna_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('asvanna_token') || null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async (identifier, password, role) => {
    try {
      const payload = { nic: identifier, phone: identifier, identifier, role };
      if (password) payload.password = password;
      const response = await API.post('/auth/login', payload);
      const { user: returnedUser, token: returnedToken } = response.data.data;

      setUser(returnedUser);
      setToken(returnedToken);
      localStorage.setItem('asvanna_token', returnedToken);
      localStorage.setItem('asvanna_user', JSON.stringify(returnedUser));

      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Network error' };
    }
  };

  const register = async (userData, role) => {
    try {
      const response = await API.post('/auth/register', { ...userData, role });
      const { user: returnedUser, token: returnedToken } = response.data.data;

      setUser(returnedUser);
      setToken(returnedToken);
      localStorage.setItem('asvanna_token', returnedToken);
      localStorage.setItem('asvanna_user', JSON.stringify(returnedUser));

      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Network error' };
    }
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole.toUpperCase() };
    setUser(updatedUser);
    localStorage.setItem('asvanna_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('asvanna_token');
    localStorage.removeItem('asvanna_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateUser: (updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem('asvanna_user', JSON.stringify(updatedUser));
        },
        token,
        role: user?.role,
        switchRole,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
