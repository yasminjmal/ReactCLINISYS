// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:9000/template-core/api';

const authService = {
  //AUTHENTICATION
  login: async (credentials) => {
    const { data } = await axios.post(`${API_URL}/authenticate`, credentials);
    localStorage.setItem('token', data);
    return data;
  },

  //AVANCEMENTS 
  getAvancements: async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/avancements`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  getAvancement: async (id) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/avancements/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  createAvancement: async (avancementData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_URL}/avancements`, avancementData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  updateAvancement: async (id, avancementData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.put(`${API_URL}/avancements/${id}`, avancementData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  deleteAvancement: async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/avancements/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  },

  //MODULES
  getModules: async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/modules`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  getModule: async (id) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/modules/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  createModule: async (moduleData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_URL}/modules`, moduleData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  updateModule: async (id, moduleData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.put(`${API_URL}/modules/${id}`, moduleData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  deleteModule: async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/modules/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  },

  //EQUIPES 
  getEquipes: async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/equipes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  getEquipe: async (id) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/equipes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  createEquipe: async (equipeData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_URL}/equipes`, equipeData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  updateEquipe: async (id, equipeData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.put(`${API_URL}/equipes/${id}`, equipeData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  deleteEquipe: async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/equipes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  },

  //POSTES 
  getPostes: async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/postes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  getPoste: async (id) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/postes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  createPoste: async (posteData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_URL}/postes`, posteData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  updatePoste: async (id, posteData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.put(`${API_URL}/postes/${id}`, posteData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  deletePoste: async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/postes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  },

  //CLIENTS 
  getClients: async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  getClient: async (id) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/clients/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  createClient: async (clientData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_URL}/clients`, clientData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  updateClient: async (id, clientData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.put(`${API_URL}/clients/${id}`, clientData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  deleteClient: async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/clients/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  },

  //TICKETFICHIERS 
  getTicketfichiers: async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/ticketfichiers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  getTicketfichier: async (id) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/ticketfichiers/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  createTicketfichier: async (ticketfichierData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_URL}/ticketfichiers`, ticketfichierData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  updateTicketfichier: async (id, ticketfichierData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.put(`${API_URL}/ticketfichiers/${id}`, ticketfichierData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  deleteTicketfichier: async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/ticketfichiers/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  },

  //EQUIPEPOSTES 
  getEquipePostes: async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/equipepostes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  getEquipePoste: async (id) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/equipepostes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  createEquipePoste: async (equipePosteData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_URL}/equipepostes`, equipePosteData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  updateEquipePoste: async (id, equipePosteData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.put(`${API_URL}/equipepostes/${id}`, equipePosteData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  deleteEquipePoste: async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/equipepostes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  },

  //FICHIERSJOINTES
   
  getFichiersjointes: async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/fichiersjointess`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  getFichiersjointes: async (id) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/fichiersjointess/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  createFichiersjointes: async (fichiersjointesData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_URL}/fichiersjointess`, fichiersjointesData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  updateFichiersjointes: async (id, fichiersjointesData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.put(`${API_URL}/fichiersjointess/${id}`, fichiersjointesData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  deleteFichiersjointes: async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/fichiersjointess/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  },

  //COMMENTAIRES 
  getCommentaires: async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/commentaires`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  getCommentaire: async (id) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/commentaires/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  createCommentaire: async (commentaireData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_URL}/commentaires`, commentaireData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  updateCommentaire: async (id, commentaireData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.put(`${API_URL}/commentaires/${id}`, commentaireData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  deleteCommentaire: async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/commentaires/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  },
  //UTILISATEURS 
  getUtilisateurs: async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/utilisateurs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  getUtilisateur: async (id) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/utilisateurs/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  createUtilisateur: async (utilisateurData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_URL}/utilisateurs`, utilisateurData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  updateUtilisateur: async (id, utilisateurData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.put(`${API_URL}/utilisateurs/${id}`, utilisateurData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  deleteUtilisateur: async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/utilisateurs/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  },
    //TICKETS 
  getTickets: async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/tickets`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  getTicket: async (id) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  },
  createTicket: async (ticketData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(`${API_URL}/tickets`, ticketData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  updateTicket: async (id, ticketData) => {
    const token = localStorage.getItem('token');
    const { data } = await axios.put(`${API_URL}/tickets/${id}`, ticketData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  },
  deleteTicket: async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  },


};

export default authService;