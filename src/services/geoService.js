// src/services/geoService.js
import api from './api';
const GEOCODING_API_BASE_URL = 'https://nominatim.openstreetmap.org/search'; // Exemple avec Nominatim


const geoService = {
    getAllCountries: async () => {
        const response = await api.get('geo/countries');
        return response.data;
    },
    getRegionsByCountryCode: async (countryCode) => {
        const response = await api.get(`geo/countries/${countryCode}/regions`);
        return response.data;
    },
    geocodeAddress: async (address, countryCode = '', regionName = '') => {
        try {
            // Exemple pour Nominatim (nécessite un serveur proxy ou une clé API pour les requêtes depuis le frontend)
            // Il est souvent préférable de faire le géocodage côté backend pour masquer la clé API et gérer les limites de requêtes
            const query = `${address}, ${regionName}, ${countryCode}`;
            const response = await fetch(`${GEOCODING_API_BASE_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`);

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                };
            }
            return null;
        } catch (error) {
            console.error("Erreur de géocodage:", error);
            return null;
        }
    }
};

export default geoService;