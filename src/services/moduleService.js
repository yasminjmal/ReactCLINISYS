import api from './api';

/**
 * Récupère tous les modules, avec un filtre optionnel par ID d'équipe.
 * @param {object} [filters] - Objet de filtres, ex: { equipeId: 1 }.
 * @returns {Promise<Array<object>>} Une liste de modules.
 */
const getAllModules = (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.equipeId) {
        params.append('equipes', filters.equipeId);
    }
    return api.get('/modules', { params });
};

/**
 * Crée un nouveau module.
 * @param {object} moduleData - Données du module : { designation: string, idEquipe?: number, actif: boolean }.
 * @returns {Promise<object>} Le module nouvellement créé.
 */
const createModule = (moduleData) => {
    return api.post('/modules', moduleData);
};

/**
 * Met à jour un module existant.
 * @param {number} id - L'ID du module à mettre à jour.
 * @param {object} moduleData - Données mises à jour : { designation: string, idEquipe?: number, actif: boolean }.
 * @returns {Promise<object>} Le module mis à jour.
 */
const updateModule = (id, moduleData) => {
    return api.put(`/modules/${id}`, moduleData);
};

/**
 * Supprime un module par son ID.
 * @param {number} id - L'ID du module à supprimer.
 * @returns {Promise<void>}
 */
const deleteModule = (id) => {
    return api.delete(`/modules/${id}`);
};

const moduleService = {
    getAllModules,
    createModule,
    updateModule,
    deleteModule,
};

export default moduleService;
