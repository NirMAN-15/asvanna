import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('asvanna_token');
    const storedUser = localStorage.getItem('asvanna_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data from localStorage', error);
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone, password, role, otp) => {
    try {
      const payload = { phone, role };
      if (password) payload.password = password;
      if (otp) payload.otp = otp;
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
        token,
        role: user?.role,
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
