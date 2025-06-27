// src/services/commentService.js
import api from './api';

const BASE_URL = '/commentaires';

const commentService = {
    addComment: async (commentData, userId) => { // Ajout de userId
        const payload = {
            ...commentData,
            idUtilisateur: userId // Ajout de l'ID de l'utilisateur
        };
        const response = await api.post(BASE_URL, payload);
        return response.data;
    },

    updateComment: async (commentId, commentData, userId) => { // Ajout de userId
        const payload = {
            ...commentData,
            idUtilisateur: userId // Ajout de l'ID de l'utilisateur
        };
        // Le backend attend seulement le 'commentaire' dans le DTO de requête pour la mise à jour
        // Adapter le payload en fonction de votre CommentaireRequestDTO pour l'update
        const response = await api.put(`${BASE_URL}/${commentId}`, {
            commentaire: payload.commentaire,
            idTicket: payload.idTicket, // Assurez-vous que le backend l'attend pour l'update
            idUtilisateur: payload.idUtilisateur // Assurez-vous que le backend l'attend pour l'update
        });
        return response.data;
    },

    deleteComment: async (commentId) => {
        await api.delete(`${BASE_URL}/${commentId}`);
    }
};

export default commentService;