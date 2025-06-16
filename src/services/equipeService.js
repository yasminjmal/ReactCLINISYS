// Dans src/services/equipeService.js
import api from './api';

const getAllEquipes = () => {
    return api.get('/equipes');
};

/**
 * Crée une nouvelle équipe (sans les membres).
 * @param {object} equipeData - Doit contenir { designation, idChefEquipe, actif }
 * @returns {Promise<object>} L'équipe créée.
 */
const createEquipe = (equipeData) => {
    return api.post('/equipes', equipeData);
};

/**
 * Met à jour les informations de base d'une équipe.
 * @param {number} id - L'ID de l'équipe.
 * @param {object} equipeData - Doit contenir { designation, idChefEquipe, actif }
 * @returns {Promise<object>} L'équipe mise à jour.
 */
const updateEquipe = (id, equipeData) => {
    return api.put(`/equipes/${id}`, equipeData);
};

/**
 * Supprime une équipe par son ID.
 * @param {number} id - L'ID de l'équipe à supprimer.
 * @returns {Promise<void>}
 */
const deleteEquipe = (id) => {
    return api.delete(`/equipes/${id}`);
};

const equipeService = {
    getAllEquipes,
    createEquipe,
    updateEquipe,
    deleteEquipe,
};

export default equipeService;