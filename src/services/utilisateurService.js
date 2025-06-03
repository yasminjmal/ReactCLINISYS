import api from './api'; // Assuming 'api.js' (the configured axios instance) is in the same directory

/**
 * Retrieves all utilisateurs.
 * @returns {Promise<Array<object>>} A list of utilisateurs.
 */
const getAllUtilisateurs = () => {
    return api.get('/utilisateurs');
};

/**
 * Retrieves a single utilisateur by their ID.
 * @param {number} id - The ID of the utilisateur.
 * @returns {Promise<object>} The utilisateur object.
 */
const getUtilisateurById = (id) => {
    return api.get(`/utilisateurs/${id}`);
};

/**
 * Finds a utilisateur by their email.
 * @param {string} email - The email of the utilisateur.
 * @returns {Promise<object>} The utilisateur object.
 */
const findByEmail = (email) => {
    return api.get(`/utilisateurs/findbyemail/${email}`);
};

/**
 * Finds a utilisateur by their login.
 * @param {string} login - The login of the utilisateur.
 * @returns {Promise<object>} The utilisateur object.
 */
const findByLogin = (login) => {
    return api.get(`/utilisateurs/findbylogin/${login}`);
};

/**
 * Creates a new utilisateur, with an optional photo upload.
 * This corresponds to the POST endpoint in UtilisateurResource.java.
 * @param {object} utilisateurData - The JSON data for the new utilisateur.
 * @param {File} [file] - The optional photo file to upload.
 * @returns {Promise<object>} The newly created utilisateur.
 */
const createUtilisateur = (utilisateurData, file) => {
    const formData = new FormData();

    // The backend expects a part named "utilisateur" with the JSON content
    formData.append('utilisateur', new Blob([JSON.stringify(utilisateurData)], {
        type: 'application/json'
    }));

    // If a file is provided, it's added to a part named "file"
    if (file) {
        formData.append('file', file);
    }

    return api.post('/utilisateurs', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

/**
 * Updates an existing utilisateur, with an optional new photo.
 * This corresponds to the PUT endpoint in UtilisateurResource.java.
 * @param {number} id - The ID of the utilisateur to update.
 * @param {object} utilisateurData - The JSON data for the utilisateur.
 * @param {File} [file] - The optional new photo file to upload.
 * @returns {Promise<object>} The updated utilisateur.
 */
const updateUtilisateur = (id, utilisateurData, file) => {
    const formData = new FormData();

    formData.append('utilisateur', new Blob([JSON.stringify(utilisateurData)], {
        type: 'application/json'
    }));

    if (file) {
        formData.append('file', file);
    }

    return api.put(`/utilisateurs/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

/**
 * Deletes a utilisateur by their ID.
 * @param {number} id - The ID of the utilisateur to delete.
 * @returns {Promise<void>}
 */
const deleteUtilisateur = (id) => {
    return api.delete(`/utilisateurs/${id}`);
};

const utilisateurService = {
    getAllUtilisateurs,
    getUtilisateurById,
    findByEmail,
    findByLogin,
    createUtilisateur,
    updateUtilisateur,
    deleteUtilisateur,
};

export default utilisateurService;