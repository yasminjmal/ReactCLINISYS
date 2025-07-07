// src/services/api.js
import axios from 'axios';
export const API_BASE_URL = 'http://localhost:9010/template-core/api';

// Crée une instance axios pré-configurée.
const api = axios.create({
  baseURL: 'http://localhost:9010/template-core/api',
});

// Ajoute un intercepteur qui s'exécute avant chaque envoi de requête.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- NOUVEAU : Intercepteur de réponse pour la gestion globale des erreurs ---
api.interceptors.response.use(
  (response) => response, // Si la réponse est réussie, on ne fait rien
  (error) => {
    // Log de l'erreur pour le débogage
    console.error("Erreur API interceptée:", error);

    // Vous pouvez ici implémenter une logique de notification globale (ex: avec react-toastify)
    // Par exemple: toast.error(error.response?.data?.message || "Une erreur est survenue");

    if (error.response?.status === 401) {
        // Gérer les erreurs d'authentification, par exemple déconnecter l'utilisateur
        // localStorage.clear();
        // window.location.href = '/login';
    }
    
    // Il est crucial de rejeter la promesse pour que les `catch` locaux puissent aussi la gérer
    return Promise.reject(error);
  }
);


export default api;