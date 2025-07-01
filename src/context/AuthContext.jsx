import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children, navigate }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUserFromStorage = useCallback(() => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem('currentUser');
      // --- FIX: Use the correct key 'authToken' to load the token ---
      const storedToken = localStorage.getItem('authToken'); 
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setToken(storedToken);
        setIsAuthenticated(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } else {
        setCurrentUser(null);
        setToken(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données utilisateur depuis le stockage local:", error);
      localStorage.clear();
      setCurrentUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const login = useCallback(async (credentials) => {
    try {
      const { token: newToken, user: userData } = await authService.login(credentials);
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      // --- FIX: Use the same key 'authToken' to save the token ---
      localStorage.setItem('authToken', newToken);
      setCurrentUser(userData);
      setToken(newToken);
      setIsAuthenticated(true);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return userData;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setCurrentUser(null);
    setToken(null);
    setIsAuthenticated(false);
    delete api.defaults.headers.common['Authorization'];
    if (navigate) {
        navigate('/login');
    } else {
        window.location.href = '/login';
    }
  }, [navigate]);

  const value = useMemo(() => ({
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }), [currentUser, isAuthenticated, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};