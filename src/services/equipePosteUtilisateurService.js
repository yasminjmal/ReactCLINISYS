// src/services/equipePosteUtilisateurService.js
import api from './api';

const BASE_URL = '/equipe-poste-utilisateurs'; // L'URL de votre contrôleur backend

/**
 * Crée une nouvelle assignation d'un utilisateur à une équipe avec un poste.
 * @param {object} assignmentData - Doit contenir { idEquipe, idUtilisateur, idPoste }
 * @returns {Promise<object>} La nouvelle assignation créée.
*/
const createAssignment = (assignmentData) => {
    return api.post(BASE_URL, assignmentData);
};

/**
 * Supprime une assignation par sa clé composite.
 * @param {number} idEquipe - ID de l'équipe
 * @param {number} idUtilisateur - ID de l'utilisateur
 * @param {number} idPoste - ID du poste
 * @returns {Promise<void>}
*/
const deleteAssignment = (idEquipe, idUtilisateur, idPoste) => {
    // L'URL doit correspondre exactement à celle définie dans votre EquipePosteutilisateurResource
    return api.delete(`${BASE_URL}/${idPoste}/${idUtilisateur}/${idEquipe}`);
};

/**
 * Récupère toutes les assignations. Utile pour le débogage.
 * @returns {Promise<Array<object>>} Une liste de toutes les assignations.
*/
const getAllAssignments = () => {
    return api.get(BASE_URL);
};

/**
 * Récupère toutes les assignations pour une équipe spécifique.
 * @param {number} idEquipe - L'ID de l'équipe.
 * @returns {Promise<Array<object>>} Une liste des assignations pour l'équipe donnée.
*/
const getAllAssignmentsForEquipe = (idEquipe) => {
    return api.get(`${BASE_URL}/equipe/${idEquipe}`);
};


const equipePosteUtilisateurService = {
    createAssignment,
    deleteAssignment,
    getAllAssignments,
    getAllAssignmentsForEquipe, // Add this new method
};

export default equipePosteUtilisateurService;