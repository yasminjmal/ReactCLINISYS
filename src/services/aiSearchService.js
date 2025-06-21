import api from './api';

const AI_SEARCH_ENDPOINT = '/ai-search';

/**
 * Performs an AI-powered search.
 * @param {string} query - The natural language search query.
 * @returns {Promise<object>} The search results from the API.
 */
const search = async (query) => {
  try {
    const response = await api.post(AI_SEARCH_ENDPOINT, { query });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la recherche IA:", error);
    // Propagate the error to be handled by the calling component
    throw error;
  }
};

const aiSearchService = {
  search,
};

export default aiSearchService;