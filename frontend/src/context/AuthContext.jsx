import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify initial user session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('reusecampus_token');
      if (token) {
        try {
          // Backend provides GET /api/auth/me (and /api/users/me)
          const res = await API.get('/auth/me');
          if (res.data?.success && res.data?.data) {
            setUser(res.data.data);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          localStorage.removeItem('reusecampus_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login handler accepting user data and JWT token
  const login = (userData, token) => {
    if (token) {
      localStorage.setItem('reusecampus_token', token);
    }
    setUser(userData);
  };

  // Helper to authenticate with credentials and unpack { success: true, data: { ... } }
  const loginUser = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data?.success && res.data?.data) {
      const { token } = res.data.data;
      if (token) {
        localStorage.setItem('reusecampus_token', token);
      }
      setUser(res.data.data);
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Failed to authenticate');
  };

  // Helper to register a new user and unpack { success: true, data: { ... } }
  const registerUser = async (userData) => {
    const res = await API.post('/auth/register', userData);
    if (res.data?.success && res.data?.data) {
      const { token } = res.data.data;
      if (token) {
        localStorage.setItem('reusecampus_token', token);
      }
      setUser(res.data.data);
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Failed to register account');
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('reusecampus_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        loginUser,
        registerUser,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

