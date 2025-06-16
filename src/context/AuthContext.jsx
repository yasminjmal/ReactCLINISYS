// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
// REMOVED: import { useNavigate } from 'react-router-dom'; // NE PLUS IMPORTER ICI !
import authService from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

// MODIFIÉ : AuthProvider reçoit 'navigate' en prop
export const AuthProvider = ({ children, navigate }) => { // Recevez 'navigate' ici
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // REMOVED: const navigate = useNavigate(); // Ne plus appeler useNavigate ici !

  const loadUserFromStorage = useCallback(() => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem('currentUser');
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
      localStorage.setItem('jwtToken', newToken);
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
    // CLÉ : Utiliser la prop 'navigate' passée
    if (navigate) {
        navigate('/login'); // Utilise la prop navigate pour la redirection
    } else {
        // Fallback si navigate n'est pas disponible (cas rare ou de test)
        window.location.href = '/login';
    }
  }, [navigate]); // 'navigate' est maintenant une dépendance

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