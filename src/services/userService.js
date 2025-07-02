// src/services/userService.js
import api from './api';

const USER_PROFILE_ENDPOINT = '/utilisateurs'; // Use the base endpoint

const getUserByLogin = async (login) => {
  try {
    const response = await api.get(`${USER_PROFILE_ENDPOINT}/find-by-login/${login}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch profile for user ${login}`, error);
    throw error;
  }
};

// --- ADD THIS NEW FUNCTION ---
const getUserById = async (id) => {
    try {
        const response = await api.get(`${USER_PROFILE_ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch user with ID ${id}`, error);
        throw error;
    }
};

const getAllUtilisateurs = () => {
    return api.get('/utilisateurs');
};

const userService = {
  getUserByLogin,
  getUserById, // Export the new function
  getAllUtilisateurs,
};

export default userService;