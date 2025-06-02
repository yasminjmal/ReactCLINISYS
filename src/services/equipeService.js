import api from './api'; // Assuming 'api.js' (the configured axios instance) is in the same directory

/**
 * Retrieves all equipes.
 * @returns {Promise<Array<object>>} A list of equipes.
 */
const getAllEquipes = () => {
    return api.get('/equipes');
};

/**
 * Retrieves a single equipe by its ID.
 * @param {number} id - The ID of the equipe.
 * @returns {Promise<object>} The equipe object.
 */
const getEquipeById = (id) => {
    return api.get(`/equipes/${id}`);
};

/**
 * Creates a new equipe.
 * @param {object} equipeData - The data for the new equipe.
 * @returns {Promise<object>} The newly created equipe.
 */
const createEquipe = (equipeData) => {
    return api.post('/equipes', equipeData);
};

/**
 * Updates an existing equipe.
 * @param {number} id - The ID of the equipe to update.
 * @param {object} equipeData - The updated data for the equipe.
 * @returns {Promise<object>} The updated equipe.
 */
const updateEquipe = (id, equipeData) => {
    return api.put(`/equipes/${id}`, equipeData);
};

/**
 * Deletes an equipe by its ID.
 * @param {number} id - The ID of the equipe to delete.
 * @returns {Promise<void>}
 */
const deleteEquipe = (id) => {
    return api.delete(`/equipes/${id}`);
};

const equipeService = {
    getAllEquipes,
    getEquipeById,
    createEquipe,
    updateEquipe,
    deleteEquipe,
};

export default equipeService;