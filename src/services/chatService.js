import api from './api';

const chatService = {
    getUserChats: async (userId) => {
        try {
            const response = await api.get(`/chat/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des chats de l'utilisateur:", error);
            throw error; // Re-throw error to be handled by the caller
        }
    },

    getChatMessages: async (chatId) => {
        try {
            const response = await api.get(`/chat/messages/${chatId}`);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des messages du chat:", error);
            throw error;
        }
    },

    /**
     * Récupère les messages non lus pour un utilisateur spécifique.
     * C'est la fonction qui était manquante ou défectueuse et qui causait l'erreur.
     * @param {string} userId - L'ID de l'utilisateur.
     * @returns {Promise<Array>} - Une promesse qui se résout avec un tableau de messages, ou un tableau vide en cas d'erreur.
     */
    getUnreadMessages: async (userId) => {
        try {
            const response = await api.get(`/chat/messages/unread/${userId}`);
            // S'assurer que la fonction retourne toujours un tableau.
            return response.data || [];
        } catch (error) {
            console.error(`Erreur lors de la récupération des messages non lus pour l'utilisateur ${userId}:`, error);
            // En cas d'erreur (ex: API down, 404), retourner un tableau vide pour éviter que l'application ne plante.
            return [];
        }
    },

    createPrivateChat: async (userId1, userId2) => {
        try {
            const response = await api.post('/chat/private', { userId1, userId2 });
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création d'un chat privé:", error);
            throw error;
        }
    },

    createGroupChat: async (name, participantIds) => {
        try {
            const response = await api.post('/chat/group', { name, participantIds });
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création d'un chat de groupe:", error);
            throw error;
        }
    },
};

export default chatService;
