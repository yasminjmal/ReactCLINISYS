import api from './api';

const chatService = {
    /**
     * Fetches the list of latest conversations for a user.
     * This populates the sidebar.
     * @param {number} userId
     * @returns {Promise<Array>}
     */
    getMyChatList: async (userId) => {
        try {
            const response = await api.get(`/chat/my-messages/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching chat list:", error);
            throw error;
        }
    },

    /**
     * Fetches the full message history between two users.
     * This populates the main chat window when a conversation is selected.
     * @param {number} userId1
     * @param {number} userId2
     * @returns {Promise<Array>}
     */
    getChatMessages: async (userId1, userId2) => {
        try {
            const response = await api.get(`/chat/history?user1=${userId1}&user2=${userId2}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching chat messages:", error);
            throw error;
        }
    },
};

export default chatService;