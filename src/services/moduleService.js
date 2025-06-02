import api from './api'; // Assuming 'api.js' (the configured axios instance) is in the same directory

/**
 * Retrieves all modules.
 * @returns {Promise<Array<object>>} A list of modules.
 */
const getAllModules = () => {
    return api.get('/modules');
};

/**
 * Retrieves a single module by its ID.
 * @param {number} id - The ID of the module.
 * @returns {Promise<object>} The module object.
 */
const getModuleById = (id) => {
    return api.get(`/modules/${id}`);
};

/**
 * Creates a new module.
 * @param {object} moduleData - The data for the new module.
 * @returns {Promise<object>} The newly created module.
 */
const createModule = (moduleData) => {
    return api.post('/modules', moduleData);
};

/**
 * Updates an existing module.
 * @param {number} id - The ID of the module to update.
 * @param {object} moduleData - The updated data for the module.
 * @returns {Promise<object>} The updated module.
 */
const updateModule = (id, moduleData) => {
    return api.put(`/modules/${id}`, moduleData);
};

/**
 * Deletes a module by its ID.
 * @param {number} id - The ID of the module to delete.
 * @returns {Promise<void>}
 */
const deleteModule = (id) => {
    return api.delete(`/modules/${id}`);
};

const moduleService = {
    getAllModules,
    getModuleById,
    createModule,
    updateModule,
    deleteModule,
};

export default moduleService;