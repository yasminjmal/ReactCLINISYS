// src/services/api.js
import axios from 'axios';

// Configurez l'URL de base de votre API Spring Boot
// Assurez-vous que le port correspond à celui de votre backend Spring Boot (par défaut 8080)
// Vite expose les variables d'environnement via import.meta.env
// Assurez-vous que votre variable d'environnement est préfixée par VITE_ dans votre fichier .env
// Par exemple : VITE_API_URL=http://localhost:8080/api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/template-core/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête si disponible
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse (optionnel, pour gérer les erreurs globales comme 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalide ou expiré
      // Vous pourriez ici déclencher une déconnexion globale
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      // Rediriger vers la page de connexion, par exemple :
      // window.location.href = '/login'; // Décommentez si vous voulez une redirection automatique
      console.error('Unauthorized access - 401. Token might be invalid or expired.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
