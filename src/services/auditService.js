// src/services/auditService.js
import api from './api';

const auditService = {
  /**
   * Récupère l'historique d'une entité donnée.
   * @param {string} entityType - Le type d'entité (ex: 'ticket', 'client', 'utilisateur').
   * @param {number} entityId - L'ID de l'entité.
   * @returns {Promise<Array>}
   */
  getHistory: (entityType, entityId) => {
    if (!entityType || !entityId) {
        return Promise.reject(new Error("Le type et l'ID de l'entité sont requis."));
    }
    // Construit l'URL dynamiquement en fonction du type d'entité
    // ex: /api/audit/history/ticket/123
    return api.get(`/audit/history/${entityType}/${entityId}`).then(res => res.data);
  }
};

export default auditService;
