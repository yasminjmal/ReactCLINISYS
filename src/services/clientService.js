// src/services/clientService.js
import api from './api'; // Assurez-vous que ce chemin est correct pour votre instance Axios

const BASE_URL = '/clients'; // Correspond à @RequestMapping("/api/clients") dans ClientResource

const clientService = {
  /**
   * Récupère tous les clients.
   * @returns {Promise<AxiosResponse<Array<object>>>} Une réponse Axios contenant la liste des clients.
   */
  getAllClients: async () => {
    const response = await api.get(BASE_URL);
    return response; // La ressource retourne directement List<ClientResponseDTO>
  },

  /**
   * Récupère un client par son ID.
   * @param {number} id - ID du client
   * @returns {Promise<object>} Le client
   */
  getClientById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Crée un nouveau client.
   * @param {object} clientData - Données du client (nomComplet, adress, email, etc.)
   * @returns {Promise<object>} Le client créé
   */
  createClient: async (clientData) => {
    const response = await api.post(BASE_URL, clientData);
    return response.data;
  },

  /**
   * Met à jour un client existant.
   * @param {number} id - ID du client à mettre à jour
   * @param {object} clientData - Données du client mises à jour
   * @returns {Promise<object>} Le client mis à jour
   */
  updateClient: async (id, clientData) => {
    const response = await api.put(`${BASE_URL}/${id}`, clientData);
    return response.data;
  },

  /**
   * Supprime un client.
   * @param {number} id - ID du client à supprimer
   * @returns {Promise<void>}
   */
  deleteClient: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};

export default clientService;