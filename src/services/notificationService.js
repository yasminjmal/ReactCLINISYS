// src/services/notificationService.js
import api from './api'; // utilise ton instance axios déjà configurée
import axios from 'axios';
import authService from './authService'; // Assurez-vous que le chemin est correct
// if (authService.isAuthenticated()== true){
//         token= localStorage.getItem('authToken'),
//         useeId= localStorage.getItem('userId')
//     }    
 

const notificationService = {
    

 getUnreadNotifications() {
    const token = authService.getAuthToken();
    const user = authService.getCurrentUser();

    if (!user || !user.id) {
      throw new Error('userId is required');
    }

    if (!token) {
      throw new Error('token is required');
    }

    return api.get('/notifications', {
      params: { userId: user.id },
      headers: { Authorization: `Bearer ${token}` }
    });
  },




  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/mark-as-read`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du marquage de la notification ${notificationId} comme lue:`, error);
      throw error;
    }
  },
  markAllAsRead: async (userId) => {
    try {
      const response = await api.put('/notifications/mark-all-as-read', { userId });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du marquage de toutes les notifications comme lues pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  },
  deleteAllNotifications: async (userId) => {
    try {
      const response = await api.delete('/notifications/delete-all', { params: { userId } });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de toutes les notifications pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  }
};

export default notificationService;
