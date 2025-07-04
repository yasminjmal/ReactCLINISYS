// src/services/authService.js
import apiClient from './api';
import decodeToken from './decodeToken';

const LOGIN_ENDPOINT = '/authenticate'; // Endpoint de votre backend

const login = async (credentials) => {
  console.log("authService.login: Tentative de connexion avec :", { login: credentials.login, motDePasse: '******' });
  try {
    const authResponse = await apiClient.post(LOGIN_ENDPOINT, {
      login: credentials.login,
      motDePasse: credentials.motDePasse,
    });

    console.log("authService.login: Réponse d'authentification:", authResponse.data);
    const token = authResponse.data.token;

    if (token) {
      localStorage.setItem('authToken', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const decodedPayload = decodeToken(token);
      console.log("authService.login: Payload du token décodé:", decodedPayload);

      if (decodedPayload && decodedPayload.sub && decodedPayload.roles && decodedPayload.roles.length > 0) {
        // Extrait le premier rôle/autorité. Votre backend renvoie un tableau.
        const authority = decodedPayload.roles[0];
        
        // Créer un objet utilisateur simplifié basé sur le token
        const user = {
          id: decodedPayload.id, // 'id' peut être utilisé si disponible
          login: decodedPayload.sub, // 'sub' contient le login
          role: authority, // Ex: "ROLE_Admin"
          // Vous pouvez ajouter d'autres informations du token si nécessaire, ex: decodedPayload.nomComplet
        };
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log("authService.login: Utilisateur stocké (depuis token):", user);
        return { token, user };
      } else {
        // Si le token ne peut pas être décodé correctement ou manque d'infos cruciales
        localStorage.removeItem('authToken');
        delete apiClient.defaults.headers.common['Authorization'];
        throw new Error("Token reçu mais invalide ou ne contient pas les informations utilisateur nécessaires.");
      }
    } else {
      throw new Error("La réponse du serveur ne contient pas de token valide.");
    }
  } catch (error) {
    let errorMessage = "Échec de la connexion.";
    if (error.response) {
      console.error('authService.login: Erreur (réponse serveur):', error.response.data);
      errorMessage = error.response.data.message || "Login ou mot de passe incorrect.";
    } else if (error.request) {
      console.error('authService.login: Erreur (pas de réponse serveur):', error.request);
      errorMessage = "Le serveur n'a pas répondu.";
    } else {
      console.error('authService.login: Erreur (configuration/autre):', error.message);
      errorMessage = error.message;
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    delete apiClient.defaults.headers.common['Authorization'];
    throw new Error(errorMessage);
  }
};

const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  delete apiClient.defaults.headers.common['Authorization'];
  console.log("authService.logout: Utilisateur déconnecté, localStorage nettoyé.");
  // Redirection vers /login sera gérée par le composant qui appelle logout ou par ProtectedRoute
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("authService.getCurrentUser: Erreur parsing currentUser", e);
      localStorage.removeItem('currentUser');
      return null;
    }
  }
  return null;
};

const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Fonction pour vérifier si l'utilisateur est authentifié (basé sur la présence du token)
const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;

  const decoded = decodeToken(token);
  if (!decoded || decoded.exp * 1000 < Date.now()) {
    // Token expiré ou invalide, nettoyer
    logout(); 
    return false;
  }
  return true;
};

const authService = {
  login,
  logout,
  getCurrentUser,
  getAuthToken,
  isAuthenticated, // Exposer la fonction isAuthenticated
  decodeAuthToken: decodeToken // Exposer l'utilitaire de décodage si besoin ailleurs
};

export default authService;
