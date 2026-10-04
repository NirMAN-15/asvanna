import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const isPublicPath = ['/', '/login', '/auth/officer', '/auth/farmer', '/auth/buyer'].includes(window.location.pathname);
      if (isPublicPath && !searchParams.get('mock_role')) {
        return null;
      }
      const mockRole = searchParams.get('mock_role');
      if (mockRole) {
        if (mockRole.toUpperCase() === 'ADMIN') {
          return {"id":1,"first_name":"Nirman","middle_name":"Achintha","last_name":"Wedikkara","full_name":"Nirman Achintha Wedikkara (Super Admin)","phone":"0770000000","nic":"199500000000","email":"admin@asvanna.lk","role":"ADMIN","language_preference":"en","district":"Badulla","division":"Bandarawela","gnd_division":"Bandarawela Central","address_line1":"No. 15, Station Road","address_line2":"Central Hill","city":"Bandarawela","postal_code":"90100","latitude":"6.82580000","longitude":"80.99820000","total_land_size":null,"preferred_search_radius":"20.0","is_verified":true,"is_active":true};
        }
        if (mockRole.toUpperCase() === 'OFFICER') {
          return {"id":2,"first_name":"Sunil","last_name":"Weerasinghe","full_name":"Sunil Weerasinghe (Divisional Officer)","phone":"0771234567","nic":"198512345678","email":"officer.bandarawela@agrarian.gov.lk","role":"OFFICER","language_preference":"en","district":"Badulla","division":"Bandarawela","is_verified":true,"is_active":true};
        }
        if (mockRole.toUpperCase() === 'FARMER') {
          return {"id":3,"first_name":"Kapila","last_name":"Bandara","full_name":"Kapila Bandara (Farmer)","phone":"0712345678","nic":"197823456789","email":"kapila.farmer@gmail.com","role":"FARMER","language_preference":"en","district":"Badulla","division":"Bandarawela","total_land_size":2.5,"is_verified":true,"is_active":true};
        }
        if (mockRole.toUpperCase() === 'BUYER') {
          return {"id":6,"first_name":"Bandarawela","last_name":"Grand Hotel","full_name":"Bandarawela Grand Hotel (Buyer)","phone":"0572222222","nic":"200134567890","email":"procurement@grandbandarawela.com","role":"BUYER","language_preference":"en","district":"Badulla","division":"Bandarawela","preferred_search_radius":8.0,"is_verified":true,"is_active":true};
        }
      }
      const storedUser = localStorage.getItem('asvanna_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const isPublicPath = ['/', '/login', '/auth/officer', '/auth/farmer', '/auth/buyer'].includes(window.location.pathname);
      if (isPublicPath && !searchParams.get('mock_role')) {
        return null;
      }
      const mockRole = searchParams.get('mock_role');
      if (mockRole) {
        return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkFETUlOIiwicGhvbmUiOiIwNzcwMDAwMDAwIiwiZGlzdHJpY3QiOiJCYWR1bGxhIiwiZGl2aXNpb24iOiJCYW5kYXJhd2VsYSIsImlhdCI6MTc5MDI4MjQwNywiZXhwIjoxNzkwMzY4ODA3fQ.ifqJf6zd_0MkziRYoBnHpd8gFBWLH-VNuVI84oapHeQ";
      }
      return localStorage.getItem('asvanna_token');
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mockRole = searchParams.get('mock_role');
    if (mockRole && user && token) {
      localStorage.setItem('asvanna_token', token);
      localStorage.setItem('asvanna_user', JSON.stringify(user));
    }
  }, [user, token]);

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
