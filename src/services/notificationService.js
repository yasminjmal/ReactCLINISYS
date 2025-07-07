// src/services/notificationService.js
import api from './api'; // ✅ Utilise notre instance axios déjà configurée

const notificationService = {

  /**
   * Récupère toutes les notifications pour l'utilisateur actuellement authentifié.
   * Le backend se charge de trouver l'utilisateur via le token JWT, il n'est donc pas nécessaire
   * d'envoyer l'ID de l'utilisateur.
   */
  getNotifications: () => {
    // L'intercepteur d'api.js s'occupera d'ajouter le token.
    return api.get('/notifications');
  },

  /**
   * Marque une notification spécifique comme lue.
   * @param {number} notificationId - L'ID de la notification à marquer.
   */
  markAsRead: (notificationId) => {
    return api.post(`/notifications/${notificationId}/read`);
  },

};

export default notificationService;