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
            // Remplacez par le chemin réel de votre nouvelle API MonitoringResource
            const response = await api.get('monitoring/activity-by-hour');
            return response.data;
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
            // Remplacez par le chemin réel de votre nouvelle API TicketResource ou CalendarResource
            const response = await api.get('tickets/calendar-events');
            return response.data;
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
    }

    
    
};

export default dashboardService;    