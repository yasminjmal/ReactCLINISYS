// src/services/documentService.js
import api from './api'; // Assurez-vous que le chemin est correct pour votre instance axios configurée

const BASE_URL = '/document-jointes';

const documentService = {
    /**
     * Télécharge un document joint pour un ticket spécifique.
     * @param {File} file Le fichier à télécharger.
     * @param {number} ticketId L'ID du ticket auquel le document est joint.
     * @returns {Promise<Object>} Les données du document créé.
     */
    uploadDocument: async (file, ticketId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('idTicket', ticketId);
        const response = await api.post(BASE_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Supprime un document joint par son ID.
     * @param {number} documentId L'ID du document à supprimer.
     * @returns {Promise<void>}
     */
    deleteDocument: async (documentId) => {
        await api.delete(`${BASE_URL}/${documentId}`);
    },

    /**
     * Télécharge un document joint spécifique par son ID.
     * Le backend renvoie directement les octets du fichier.
     * @param {number} documentId L'ID du document à télécharger.
     * @param {string} fileName Le nom du fichier pour le téléchargement.
     */
    downloadDocument: async (documentId, fileName) => {
        const response = await api.get(`${BASE_URL}/${documentId}/download`, {
            responseType: 'blob', // Important pour gérer les fichiers binaires
        });

        // Crée un lien temporaire pour télécharger le fichier
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName); // Utilisez le nom de fichier correct
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url); // Nettoyage de l'URL objet
    }
};

export default documentService;