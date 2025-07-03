import axios from 'axios';

// Crée une instance axios pré-configurée.
// Toutes les requêtes utiliseront cette base d'URL.
const api = axios.create({
  baseURL: 'http://localhost:9010/template-core/api',
});

// Ajoute un intercepteur qui s'exécute avant chaque envoi de requête.
api.interceptors.request.use(
  (config) => {
    // Tente de récupérer le token d'authentification depuis le localStorage.
    const token = localStorage.getItem('authToken'); // Assurez-vous que cette clé 'authToken' est bien celle que vous utilisez lors de la connexion.
    console.log("api.js: Token récupéré:", token);
    // Si un token est trouvé, il est ajouté à l'en-tête 'Authorization'.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // La configuration de la requête est retournée pour être exécutée.
    return config;
  },
  (error) => {
    // Gère les erreurs lors de la configuration de la requête.
    return Promise.reject(error);
  }
);

export default api;
