import api from './api';

/**
 * Récupère tous les utilisateurs, avec des filtres optionnels.
 * @param {object} [filters] - Objet de filtres, ex: { role: 'ROLE_Admin', actifs: true }.
 * @returns {Promise<Array<object>>} Une liste d'utilisateurs.
 */
const getAllUtilisateurs = (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) {
        params.append('role', filters.role);
    }
    if (filters.actifs !== undefined) {
        params.append('actifs', filters.actifs);
    }
    return api.get('/utilisateurs', { params });
};

/**
 * Crée un nouvel utilisateur avec une photo optionnelle.
 * @param {object} utilisateurData - Les données de l'utilisateur (nom, email, etc.).
 * @param {File} [photoFile] - Le fichier de la photo, optionnel.
 * @returns {Promise<object>} L'utilisateur nouvellement créé.
 */
const createUtilisateur = (utilisateurData, photoFile) => {
    const formData = new FormData();
    formData.append('utilisateur', new Blob([JSON.stringify(utilisateurData)], { type: 'application/json' }));
    if (photoFile) {
        formData.append('photo', photoFile);
    }
    return api.post('/utilisateurs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

/**
 * Met à jour un utilisateur existant.
 * @param {number} id - L'ID de l'utilisateur.
 * @param {object} utilisateurData - Les données mises à jour.
 * @param {File} [photoFile] - Le nouveau fichier de photo, optionnel.
 * @returns {Promise<object>} L'utilisateur mis à jour.
 */
const updateUtilisateur = (id, utilisateurData, photoFile) => {
    const formData = new FormData();
    formData.append('utilisateur', new Blob([JSON.stringify(utilisateurData)], { type: 'application/json' }));

    if (photoFile) {
        formData.append('photo', photoFile);
    }

    return api.put(`/utilisateurs/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

/**
 * Supprime un utilisateur par son ID.
 * @param {number} id - L'ID de l'utilisateur à supprimer.
 * @returns {Promise<void>}
 */
const deleteUtilisateur = (id) => {
    return api.delete(`/utilisateurs/${id}`);
};

const utilisateurService = {
    getAllUtilisateurs,
    createUtilisateur,
    updateUtilisateur,
    deleteUtilisateur,
};

export default utilisateurService;