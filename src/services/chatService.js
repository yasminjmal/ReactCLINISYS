// src/services/chatService.js

import api from './api';

const chatService = {
  /**
   * Récupère l'historique des messages entre deux utilisateurs.
   */
  getChatMessages: (user1Id, user2Id) => {
    return api.get(`/chat/history?user1=${user1Id}&user2=${user2Id}`).then(res => res.data);
  },

  /**
   * Récupère la liste des conversations récentes d'un utilisateur.
   */
  getMyChatList: (userId) => {
    return api.get(`/chat/my-messages/${userId}`).then(res => res.data);
  },

  /**
   * Envoie un fichier au backend pour stockage en base de données.
   */
  sendFile: (file, senderId, receiverId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderId', senderId);
    formData.append('receiverId', receiverId);
    return api.post('/chat/messages/file', formData);
  },

  /**
   * Supprime un message.
   */
  deleteMessage: (messageId) => {
    return api.delete(`/chat/messages/${messageId}`);
  }
};

export default chatService;