// src/services/chatService.js

import api from './api'; // On importe l'instance axios centralisée

const chatService = {
  /**
   * Récupère l'historique complet des messages entre deux utilisateurs.
   * @param {number} user1Id - L'ID du premier utilisateur.
   * @param {number} user2Id - L'ID du second utilisateur.
   * @returns {Promise<Array>} - Une promesse qui se résout avec la liste des messages.
   */
  getChatMessages: (user1Id, user2Id) => {
    console.log(`chatService: Récupération de l'historique pour les utilisateurs ${user1Id} et ${user2Id}`);
    // Utilise api.get pour un code plus propre. Le token est ajouté automatiquement.
    return api.get(`/chat/history?user1=${user1Id}&user2=${user2Id}`).then(res => res.data);
  },

  /**
   * Récupère la liste des conversations récentes pour un utilisateur donné.
   * @param {number} userId - L'ID de l'utilisateur connecté.
   * @returns {Promise<Array>} - Une promesse qui se résout avec la liste des conversations.
   */
  getMyChatList: (userId) => {
    console.log(`chatService: Récupération de la liste des conversations pour l'utilisateur ${userId}`);
    return api.get(`/chat/my-messages/${userId}`).then(res => res.data);
  },

  /**
   * Envoie un fichier au backend pour qu'il soit stocké en base de données.
   * @param {File} file - Le fichier à uploader.
   * @param {number} senderId - L'ID de l'expéditeur.
   * @param {number} receiverId - L'ID du destinataire.
   * @returns {Promise} - Une promesse qui se résout lorsque l'upload est terminé.
   */
  sendFile: (file, senderId, receiverId) => {
    // On utilise FormData pour envoyer des données binaires (le fichier) et des données textuelles.
    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderId', senderId);
    formData.append('receiverId', receiverId);
    
    console.log(`chatService: Envoi du fichier "${file.name}" de ${senderId} à ${receiverId}`);

    // On utilise api.post. Axios s'occupera du Content-Type 'multipart/form-data'.
    return api.post('/chat/messages/file', formData);
  }
};

export default chatService;