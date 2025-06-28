// src/services/dashboardService.js
import api from './api'; // Cet 'api' a déjà la base URL correcte: http://localhost:9010/template-core/api

const dashboardService = {

    // 1. Pour TicketsByStatusDonutChart
    // L'URL ici est maintenant relative à la baseURL de l'instance 'api' :
    // 'tickets/stats/by-status' -> http://localhost:9010/template-core/api/tickets/stats/by-status
    getTicketCountsByStatus: async () => {
        try {
            const response = await api.get('tickets/stats/by-status'); // Chemin relatif SANS le /api/initial
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des stats de tickets par statut:", error);
            throw error;
        }
    },

    // 2. Pour LiveFeedsAreaChart (endpoints à définir côté backend si pas déjà fait)
    getLiveMetrics: async () => {
        try {
            // C'est maintenant le vrai endpoint que nous avons défini dans MonitoringResource
            const response = await api.get('monitoring/activity-by-hour');
            return response.data; // Attendu: [{"hour": "08:00", "count": 75}, ...]
        } catch (error) {
            console.error("Erreur lors de la récupération des métriques en direct:", error);
            throw error;
        }
    },

    // 3. Pour SubscriptionsHourlyBarChart (endpoints à définir côté backend)
    getSubscriptionsHourlyStats: async () => {
        try {
            // Remplacez par le chemin réel de votre nouvelle API ClientResource ou AnalyticsResource
            const response = await api.get('clients/stats/new-clients-by-hour');
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des stats horaires de souscriptions:", error);
            throw error;
        }
    },

    // 4. Pour EventsCalendar (endpoints à définir côté backend)
    getCalendarEvents: async () => {
        try {
            // C'est maintenant le vrai endpoint
            const response = await api.get('tickets/calendar-events');
            return response.data; // Attendu: [{"id": 1, "title": "Échéance Ticket #1: Titre", "start": "ISO_STRING", ...}, ...]
        } catch (error) {
            console.error("Erreur lors de la récupération des événements du calendrier:", error);
            throw error;
        }
    },
    getGlobalTicketCounts: async () => {
        try {
            const response = await api.get('tickets/stats/global-counts');
            return response.data; // Attendu: { totalTickets: 500, ticketsEnAttente: 50, ... }
        } catch (error) {
            console.error("Erreur lors de la récupération des statistiques globales des tickets:", error);
            throw error;
        }
    },
    getActiveTicketsByCategory: async (groupBy = 'employee') => { // Définit 'employee' comme défaut
        try {
            const response = await api.get(`tickets/stats/active-by-category?groupBy=${groupBy}`);
            return response.data; // Attendu: [{"category": "Nom Employé/Module", "activeTickets": X}, ...]
        } catch (error) {
            console.error("Erreur lors de la récupération des tickets actifs par catégorie:", error);
            throw error;
        }
    },
    getPerformanceStats: async (groupBy = 'employee', period = 'current_month') => {
        try {
            const response = await api.get(`tickets/stats/performance?groupBy=${groupBy}&period=${period}`);
            return response.data; // Attendu: [{"category": "Nom Employé/Équipe", "completedTickets": X}, ...]
        } catch (error) {
            console.error("Erreur lors de la récupération des statistiques de performance:", error);
            throw error;
        }
    },
    getOverdueTickets: async () => {
        try {
            const response = await api.get('tickets/overdue');
            // Attendu: List<TicketResponseDTO> (version légère)
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des tickets en retard:", error);
            throw error;
        }
    },
    getClientStatsByRegion: async (mapType = 'world') => { // Accepte un paramètre
        try {
            // On passe le type de carte en paramètre de la requête
            const response = await api.get(`clients/stats/by-region?mapType=${mapType}`);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des statistiques clients par région:", error);
            throw error;
        }
    }

    
    
};

export default dashboardService;    