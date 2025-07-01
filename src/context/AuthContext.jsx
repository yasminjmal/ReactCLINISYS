// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';
import api from '../services/api';
import userService from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children, navigate }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fonction pour charger l'utilisateur et son profil complet
  const fetchAndSetCurrentUserProfile = useCallback(async (userLogin, authToken) => {
    try {
      const userProfile = await userService.getUserByLogin(userLogin);
      if (userProfile && userProfile.id) { // Assurez-vous que le profil contient l'ID
        setCurrentUser({
            id: userProfile.id, // <--- C'EST ICI QUE L'ID EST AJOUTÉ !
            login: userProfile.login,
            role: userProfile.role, // Ou le champ approprié
            prenom: userProfile.prenom, // Ajoutez d'autres champs si nécessaires
            nom: userProfile.nom,
            email: userProfile.email,
            // ... autres données du profil
        });
        localStorage.setItem('currentUser', JSON.stringify({
            id: userProfile.id,
            login: userProfile.login,
            role: userProfile.role,
            prenom: userProfile.prenom,
            nom: userProfile.nom,
            email: userProfile.email,
        }));
        setToken(authToken);
        setIsAuthenticated(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      } else {
        console.error("DEBUG: ID utilisateur manquant dans le profil après getUserByLogin.");
        localStorage.clear();
        setCurrentUser(null);
        setToken(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du profil utilisateur par login:", error);
      localStorage.clear();
      setCurrentUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);


  const loadUserFromStorage = useCallback(() => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('currentUser'); // Garder ceci pour le login
      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Si currentUser dans localStorage n'a pas d'ID, on le récupère
        if (!parsedUser.id && parsedUser.login) { // Si l'ID manque mais le login est là
            fetchAndSetCurrentUserProfile(parsedUser.login, storedToken);
        } else if (parsedUser.id) { // Si l'ID est déjà là, on l'utilise
            setCurrentUser(parsedUser);
            setToken(storedToken);
            setIsAuthenticated(true);
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            setIsLoading(false);
        } else { // Pas d'ID et pas de login pour le récupérer
            localStorage.clear();
            setCurrentUser(null);
            setToken(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
      } else {
        setCurrentUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données utilisateur depuis le stockage local:", error);
      localStorage.clear();
      setCurrentUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [fetchAndSetCurrentUserProfile]);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const login = useCallback(async (credentials) => {
    try {
      const { token: newToken, user: userData } = await authService.login(credentials);

      localStorage.setItem('authToken', newToken); // Stocker le nouveau token
      // Ne pas stocker userData directement si ID manquant
      
      // Récupérer le profil complet avec l'ID via le login
      await fetchAndSetCurrentUserProfile(userData.login, newToken); // Utilisez le login de userData
      
      return userData;
    } catch (error) {
      throw error;
    }
  }, [fetchAndSetCurrentUserProfile]);

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