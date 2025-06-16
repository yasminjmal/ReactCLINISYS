// src/services/ticketService.js
import api from './api'; // Assurez-vous que le chemin vers votre instance axios est correct

const BASE_URL = '/tickets'; // Correspond à @RequestMapping("/api/tickets") dans TicketResource

const ticketService = {
  /**
   * Récupère tous les tickets avec filtres optionnels.
   * @param {object} filters - Ex: { status: 'EN_ATTENTE', moduleId: 1, priority: 'HAUTE' }
   * @returns {Promise<Array<object>>} Liste des tickets
   */
  getAllTickets: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.statue) {
      params.append('statue', filters.statue.toUpperCase()); // Les enums Java sont souvent en majuscules
    }
    if (filters.idModule) {
      params.append('idModule', filters.idModule);
    }
    if (filters.priorite) {
      params.append('priorite', filters.priorite.toUpperCase()); // Les enums Java sont souvent en majuscules
    }
    // TODO: Ajouter d'autres filtres si le backend les supporte (ex: par date, par utilisateur assigné)
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  /**
   * Récupère un ticket par son ID.
   * @param {number} id - ID du ticket
   * @returns {Promise<object>} Le ticket
   */
  getTicketById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Crée un nouveau ticket.
   * @param {object} ticketData - Données du ticket (titre, description, idClient, etc.)
   * @returns {Promise<object>} Le ticket créé
   */
  createTicket: async (ticketData) => {
    // Adapter ticketData pour correspondre à TicketRequestDTO
    const requestData = {
      titre: ticketData.titre,
      description: ticketData.description || null, // S'assurer que les champs optionnels sont null si vides
      idParentTicket: ticketData.idParentTicket || null,
      priorite: ticketData.priorite ? ticketData.priorite.toUpperCase() : null, // En majuscules
      statue: ticketData.statue.toUpperCase(), // En majuscules
      idClient: ticketData.idClient,
      idModule: ticketData.idModule || null, // Peut être nul à la création si non affecté
      idUtilisateur: ticketData.idUtilisateur || null, // Peut être nul à la création
    };
    const response = await api.post(BASE_URL, requestData);
    return response.data;
  },

  /**
   * Met à jour un ticket existant.
   * @param {number} id - ID du ticket à mettre à jour
   * @param {object} ticketData - Données du ticket mises à jour
   * @returns {Promise<object>} Le ticket mis à jour
   */
  updateTicket: async (id, ticketData) => {
    const requestData = {
      titre: ticketData.titre,
      description: ticketData.description || null,
      idParentTicket: ticketData.idParentTicket || null,
      priorite: ticketData.priorite ? ticketData.priorite.toUpperCase() : null,
      statue: ticketData.statue.toUpperCase(),
      idClient: ticketData.idClient,
      idModule: ticketData.idModule || null,
      idUtilisateur: ticketData.idUtilisateur || null,
    };
    const response = await api.put(`${BASE_URL}/${id}`, requestData);
    return response.data;
  },

  /**
   * Supprime un ticket.
   * @param {number} id - ID du ticket à supprimer
   * @returns {Promise<void>}
   */
  deleteTicket: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // --- Méthodes spécifiques pour les actions sur les tickets ---

  /**
   * Affecte un ticket à un module et/ou à un utilisateur.
   * @param {number} ticketId
   * @param {object} affectationData - { idModule: number, idUtilisateur?: number, documentsJoints?: array, statue: string }
   * @returns {Promise<object>} Ticket mis à jour
   */
  affecterTicket: async (ticketId, affectationData) => {
    // Récupérer le ticket actuel pour conserver les champs non modifiés
    const currentTicket = await ticketService.getTicketById(ticketId);
    
    const updatedTicketData = {
        ...currentTicket,
        // Les IDs doivent être passés au backend
        idModule: affectationData.idModule, 
        idUtilisateur: affectationData.idUtilisateur || null, 
        statue: affectationData.statue ? affectationData.statue.toUpperCase() : currentTicket.statue.toUpperCase()
    };
    
    // IMPORTANT: La gestion des documents joints n'est pas dans le DTO de requête de base ici.
    // Si votre backend attend des documents joints lors de l'affectation, vous aurez besoin
    // soit d'un endpoint d'upload séparé, soit de modifier le DTO/contrôleur pour accepter les fichiers.
    // Pour l'instant, on se concentre sur l'affectation du module/utilisateur/statut.
    return ticketService.updateTicket(ticketId, updatedTicketData);
  },

  /**
   * Diffracte un ticket en créant des sous-tickets.
   * @param {number} parentTicketId
   * @param {Array<object>} subTicketsData - Liste de { titre: string, description: string }
   * @returns {Promise<Array<object>>} Les sous-tickets créés
   */
  diffracterTicket: async (parentTicketId, subTicketsData) => {
    // Cette fonction nécessitera un endpoint spécifique côté backend
    // Supposons un endpoint POST /tickets/{id}/diffract
    // Qui prend une liste de sous-tickets à créer pour le parent
    const response = await api.post(`${BASE_URL}/${parentTicketId}/diffract`, subTicketsData);
    return response.data;
  },

  /**
   * Accepte un ticket.
   * @param {number} ticketId
   * @returns {Promise<object>} Ticket mis à jour
   */
  accepterTicket: async (ticketId) => {
    const currentTicket = await ticketService.getTicketById(ticketId);
    const updatedTicketData = {
      ...currentTicket,
      statue: 'ACCEPTE', 
    };
    return ticketService.updateTicket(ticketId, updatedTicketData);
  },

  /**
   * Refuse un ticket.
   * @param {number} ticketId
   * @param {string} motifRefus
   * @returns {Promise<object>} Ticket mis à jour
   */
  refuserTicket: async (ticketId, motifRefus) => {
    const currentTicket = await ticketService.getTicketById(ticketId);
    const updatedTicketData = {
      ...currentTicket,
      statue: 'REFUSE', 
      description: (currentTicket.description || '') + `\nMotif de refus: ${motifRefus}`, 
    };
    return ticketService.updateTicket(ticketId, updatedTicketData);
  },
};

export default ticketService;