// src/services/ticketService.js
import api from './api'; // Assurez-vous que le chemin est correct

const BASE_URL = '/tickets';

const ticketService = {
    getAllParentTickets: async () => {
        const response = await api.get(`${BASE_URL}/parents`);
        return response.data;
    },

    getTicketById: async (id) => {
        const response = await api.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    createTicket: async (ticketData) => {
        const response = await api.post(BASE_URL, ticketData);
        return response.data;
    },
    
    updateTicket: async (id, ticketData) => {
        const response = await api.put(`${BASE_URL}/${id}`, ticketData);
        return response.data;
    },

    deleteTicket: async (id) => {
        const response = await api.delete(`${BASE_URL}/${id}`);
        return response.data;
    },
};

export default ticketService;