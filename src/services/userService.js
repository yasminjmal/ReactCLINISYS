import api from './api';

const USER_PROFILE_ENDPOINT = '/utilisateurs/find-by-login';

/**
 * Fetches the full user profile from the backend using the user's login.
 * @param {string} login - The user's login/username.
 * @returns {Promise<object>} The full user object, including the ID.
 */
const getUserByLogin = async (login) => {
  try {
    const response = await api.get(`${USER_PROFILE_ENDPOINT}/${login}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch profile for user ${login}`, error);
    throw error;
  }
};
const getAllUtilisateurs = () => {
    return api.get('/utilisateurs');
};

const userService = {
  getUserByLogin,
  getAllUtilisateurs,
};

export default userService;