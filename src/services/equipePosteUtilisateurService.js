import api from './api'; // Assuming 'api.js' is in the same directory or adjust path

const BASE_URL = '/equipeposteutilisateurs';

/**
 * Creates a new EquipePosteUtilisateur assignment.
 * @param {object} assignmentData - Expected to have { idPoste, idUtilisateur, idEquipe }
 * @returns {Promise<object>} The created assignment DTO.
 */
const createAssignment = (assignmentData) => {
    return api.post(BASE_URL, assignmentData);
};

/**
 * Retrieves all EquipePosteUtilisateur assignments.
 * @returns {Promise<Array<object>>} A list of all assignments.
 */
const getAllAssignments = () => {
    return api.get(BASE_URL);
};

/**
 * Retrieves a specific EquipePosteUtilisateur assignment by its composite key.
 * @param {number} idPoste
 * @param {number} idUtilisateur
 * @param {number} idEquipe
 * @returns {Promise<object>} The assignment DTO.
 */
const getAssignmentByIds = (idPoste, idUtilisateur, idEquipe) => {
    return api.get(`${BASE_URL}/${idPoste}/${idUtilisateur}/${idEquipe}`);
};

/**
 * Deletes an EquipePosteUtilisateur assignment by its composite key.
 * @param {number} idPoste
 * @param {number} idUtilisateur
 * @param {number} idEquipe
 * @returns {Promise<void>}
 */
const deleteAssignment = (idPoste, idUtilisateur, idEquipe) => {
    return api.delete(`${BASE_URL}/${idPoste}/${idUtilisateur}/${idEquipe}`);
};

// The PUT endpoint for update exists in your resource, but often for linking tables,
// it's more common to delete and re-create if changes are needed beyond non-key attributes.
// If your EquipePosteUtilisateur has other attributes to update, an update function would be similar to create.
// const updateAssignment = (idPoste, idUtilisateur, idEquipe, assignmentData) => {
//     return api.put(`${BASE_URL}/${idPoste}/${idUtilisateur}/${idEquipe}`, assignmentData);
// };

const equipePosteUtilisateurService = {
    createAssignment,
    getAllAssignments,
    getAssignmentByIds,
    deleteAssignment,
    // updateAssignment, // Add if needed
};

export default equipePosteUtilisateurService;