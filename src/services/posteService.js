import api from './api';

/**
 * Retrieves all postes.
 * @returns {Promise<Array<object>>} A list of postes.
 */
const getAllPostes = () => {
    return api.get('/postes');
};

/**
 * Retrieves a single poste by its ID.
 * @param {number} id - The ID of the poste.
 * @returns {Promise<object>} The poste object.
 */
const getPosteById = (id) => {
    return api.get(`/postes/${id}`);
};

/**
 * Creates a new poste.
 * @param {object} posteData - The data for the new poste.
 * @returns {Promise<object>} The newly created poste.
 */
const createPoste = (posteData) => {
    return api.post('/postes', posteData);
};

/**
 * Updates an existing poste.
 * @param {number} id - The ID of the poste to update.
 * @param {object} posteData - The updated data for the poste.
 * @returns {Promise<object>} The updated poste.
 */
const updatePoste = (id, posteData) => {
    return api.put(`/postes/${id}`, posteData);
};

/**
 * Deletes a poste by its ID.
 * @param {number} id - The ID of the poste to delete.
 * @returns {Promise<void>}
 */
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