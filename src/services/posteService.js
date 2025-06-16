// src/services/posteService.js
import api from './api';

// LA LIGNE SUIVANTE A ÉTÉ SUPPRIMÉE CAR ELLE EST INUTILE ET CAUSE L'ERREUR DANS UN NAVIGATEUR
//import { URLSearchParams } from 'url'; 

/**
 * Retrieves all postes, with an optional filter for 'actif' status.
 * @param {string} [filterStatus] - Optional. Can be 'actif', 'inactif', or 'tous'.
 * @returns {Promise<Array<object>>} A list of postes.
 */
const getAllPostes = (filterStatus) => {
    // On utilise directement URLSearchParams, qui est disponible globalement dans le navigateur.
    const params = new URLSearchParams();
    if (filterStatus === 'actif') {
        params.append('actifs', 'true');
    } else if (filterStatus === 'inactif') {
        params.append('actifs', 'false');
    }
    
    return api.get('/postes', { params });
};

// ... le reste du fichier est identique ...
const getPosteById = (id) => {
    return api.get(`/postes/${id}`);
};

const createPoste = (posteData) => {
    return api.post('/postes', posteData);
};

const updatePoste = (id, posteData) => {
    return api.put(`/postes/${id}`, posteData);
};

const deletePoste = (id) => {
    return api.delete(`/postes/${id}`);
};

const posteService = {
    getAllPostes,
    getPosteById,
    createPoste,
    updatePoste,
    deletePoste,
};

export default posteService;