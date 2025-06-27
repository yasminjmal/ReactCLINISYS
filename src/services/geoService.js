// src/services/geoService.js
import api from './api';

const geoService = {
    getAllCountries: async () => {
        const response = await api.get('geo/countries');
        return response.data;
    },
    getRegionsByCountryCode: async (countryCode) => {
        const response = await api.get(`geo/countries/${countryCode}/regions`);
        return response.data;
    }
};

export default geoService;