import api from './api';

/**
 * Service pour gérer les opérations d'envoi d'e-mails.
 */
const mailingService = {
  /**
   * Envoie une notification par e-mail pour un ticket spécifié comme étant en retard.
   * Le backend se chargera de récupérer les détails du ticket et de l'utilisateur assigné.
   *
   * @param {number} ticketId - L'ID du ticket pour lequel envoyer la notification.
   * @returns {Promise<any>} La réponse de l'API, généralement un message de succès.
   */
  sendLateTicketNotification: async (ticketId) => {
    if (!ticketId) {
      return Promise.reject(new Error("L'ID du ticket est requis."));
    }
    try {
      // Appel de l'endpoint POST avec l'ID du ticket dans l'URL.
      // Pas de corps de requête (payload) nécessaire car le backend récupère tout.
      const response = await api.post(`/notify-late-ticket/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'envoi de la notification pour le ticket #${ticketId}:`, error);
      // L'erreur est déjà gérée globalement par l'intercepteur,
      // mais on la propage au cas où une logique spécifique serait nécessaire dans le composant appelant.
      throw error;
    }
  },

  // Vous pouvez ajouter ici d'autres fonctions liées à l'envoi d'e-mails si nécessaire,
  // comme celles pour la réinitialisation de mot de passe, bien qu'elles puissent aussi
  // faire partie d'un service d'authentification (authService).
};

export default mailingService;
