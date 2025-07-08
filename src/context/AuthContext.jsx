// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
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
            const storedToken = localStorage.getItem('authToken');
            if (storedUser && storedToken) {
                const parsedUser = JSON.parse(storedUser);
                setCurrentUser(parsedUser);
                setToken(storedToken);
                setIsAuthenticated(true);
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } else {
                // S'il manque l'un des deux, on nettoie tout
                localStorage.removeItem('currentUser');
                localStorage.removeItem('authToken');
                setCurrentUser(null);
                setToken(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des données utilisateur :", error);
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
            localStorage.setItem('authToken', newToken);
            setCurrentUser(userData);
            setToken(newToken);
            setIsAuthenticated(true);

            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            return userData;
        } catch (error) {
            console.error("Erreur de login :", error);
            localStorage.clear();
            setCurrentUser(null);
            setToken(null);
            setIsAuthenticated(false);
            delete api.defaults.headers.common['Authorization'];
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
            // Fallback si navigate n'est pas disponible
            window.location.href = '/login';
        }
    }, [navigate]);

    // L'objet `value` contient maintenant le token
    const value = useMemo(() => ({
        currentUser,
        token, // --- LA CORRECTION EST ICI ---
        isAuthenticated,
        isLoading,
        login,
        logout,
    }), [currentUser, token, isAuthenticated, isLoading, login, logout]);

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

export const getFullUserName = async (currentUser) => {
    if (!currentUser || !currentUser.id) return null;
    try {
        const response = await userService.getUserById(currentUser.id);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération du nom complet :", error);
        return null;
    }
};
