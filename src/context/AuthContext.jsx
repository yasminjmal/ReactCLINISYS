// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import apiClient from '../services/api'; // Pour mettre à jour l'instance Axios si nécessaire

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(authService.getAuthToken());
  const [isLoading, setIsLoading] = useState(true); // Pour gérer le chargement initial

  useEffect(() => {
    // Cette vérification initiale peut être plus complexe,
    // par exemple, valider le token avec le backend.
    const user = authService.getCurrentUser();
    const storedToken = authService.getAuthToken();
    if (user && storedToken) {
      setCurrentUser(user);
      setToken(storedToken);
      // Mettre à jour l'en-tête par défaut d'Axios au cas où il n'aurait pas été défini
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setIsLoading(false);
  }, []);

  const loginContext = async (credentials) => {
    try {
      const { token: newToken, user: userData } = await authService.login(credentials);
      setToken(newToken);
      setCurrentUser(userData);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return userData; // Renvoyer les données utilisateur pour la redirection
    } catch (error) {
      // L'erreur est déjà loggée dans authService, la propager pour LoginPage
      throw error;
    }
  };

  const logoutContext = () => {
    authService.logout();
    setCurrentUser(null);
    setToken(null);
    delete apiClient.defaults.headers.common['Authorization'];
    // Redirection gérée dans App.jsx ou le composant appelant
  };

  const value = {
    currentUser,
    token,
    isLoading,
    login: loginContext,
    logout: logoutContext,
    isAuthenticated: !!token, // Ou !!currentUser && !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
