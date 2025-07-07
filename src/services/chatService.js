/**
 * Ce service encapsule tous les appels à l'API backend concernant le chat.
 * Il gère l'authentification et la gestion des erreurs de manière centralisée.
 */

// Une fonction utilitaire pour créer les headers d'authentification.
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Dans une application réelle, on pourrait rediriger vers la page de connexion.
        throw new Error("Token d'authentification non trouvé.");
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// L'URL de base de votre API. À externaliser dans un fichier de configuration pour la production.
const API_BASE_URL = 'http://localhost:9010/template-core/api';

/**
 * Gère la réponse de l'API, en vérifiant les erreurs HTTP.
 * @param {Response} response - La réponse de l'API fetch.
 * @returns {Promise<any>} - Les données JSON si la réponse est OK.
 */
const handleResponse = async (response) => {
    if (!response.ok) {
        // Tente de lire le message d'erreur du backend, sinon utilise le statut HTTP.
        const errorData = await response.text();
        console.error("Erreur de l'API:", errorData);
        throw new Error(`Erreur du serveur: ${response.status} ${response.statusText}`);
    }
    return response.json();
};

/**
 * Récupère l'historique complet des messages entre deux utilisateurs.
 * Correspond à l'endpoint GET /api/chat/history
 * @param {number} user1Id - L'ID du premier utilisateur.
 * @param {number} user2Id - L'ID du second utilisateur.
 * @returns {Promise<Array>} - Une promesse qui se résout avec la liste des messages.
 */
export const getChatMessages = async (user1Id, user2Id) => {
    console.log(`chatService: Récupération de l'historique pour les utilisateurs ${user1Id} et ${user2Id}`);
    const response = await fetch(`${API_BASE_URL}/chat/history?user1=${user1Id}&user2=${user2Id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

/**
 * Récupère la liste des conversations récentes pour un utilisateur donné.
 * Correspond à l'endpoint GET /api/chat/my-messages/{userId}
 * @param {number} userId - L'ID de l'utilisateur connecté.
 * @returns {Promise<Array>} - Une promesse qui se résout avec la liste des dernières conversations.
 */
export const getMyChatList = async (userId) => {
    console.log(`chatService: Récupération de la liste des conversations pour l'utilisateur ${userId}`);
    const response = await fetch(`${API_BASE_URL}/chat/my-messages/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    // Note: Pour ce service, nous devons peut-être transformer les données pour obtenir une liste de "partenaires".
    // La logique ci-dessous suppose que votre API renvoie déjà une liste prête à l'emploi.
    return handleResponse(response);
};


// On exporte les fonctions pour les rendre utilisables dans les composants et les hooks.
const chatService = {
    getChatMessages,
    getMyChatList
};

export default chatService;