import React, { useState, useEffect, useCallback } from 'react';
import { Search, List, LayoutGrid, Users as UsersIconPage, UserPlus, Frown, Table as TableIcon, AlertTriangle, Save, XCircle, Edit } from 'lucide-react';

// --- Services ---
import equipeService from '../../../services/equipeService';
import equipePosteUtilisateurService from '../../../services/equipePosteUtilisateurService';
import utilisateurService from '../../../services/utilisateurService';
import posteService from '../../../services/posteService';

// --- Sous-composants ---
import EquipeCard from './EquipeCard';
import EquipeRow from './EquipeRow';
import EquipeTableRow from './EquipeTableRow';
import AjouterEquipePage from './AjouterEquipePage';

// ===================================================================
//  MODALE DE MODIFICATION
// ===================================================================
const EditEquipeModal = ({ equipe, onUpdate, onCancel, onRefreshEquipes, showTemporaryMessage }) => {
    // Robust state initialization with nullish coalescing for safety
    const [designation, setDesignation] = useState(equipe?.designation || '');
    const [selectedChefId, setSelectedChefId] = useState(equipe?.chefEquipe?.id || '');
    const [actif, setActif] = useState(equipe?.actif ?? false); // Default to true if undefined/null

    const [allUsers, setAllUsers] = useState([]);
    const [allPostes, setAllPostes] = useState([]);
    const [currentTeamAssignments, setCurrentTeamAssignments] = useState([]);
    const [newMemberSelection, setNewMemberSelection] = useState({ userId: '', postId: '' });
    const [loadingResources, setLoadingResources] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            setLoadingResources(true);
            try {
                const [usersRes, postesRes, assignmentsRes] = await Promise.all([
                    utilisateurService.getAllUtilisateurs(),
                    posteService.getAllPostes(),
                    equipePosteUtilisateurService.getAllAssignmentsForEquipe(equipe.id)
                ]);

                console.log("Modal Fetched Users:", usersRes.data);
                console.log("Modal Fetched Postes:", postesRes.data);
                console.log(`Modal Fetched Assignments for Team ${equipe.id}:`, assignmentsRes.data);

                setAllUsers(usersRes.data || []);
                setAllPostes(postesRes.data || []);
                setCurrentTeamAssignments(assignmentsRes.data || []);

            } catch (error) {
                console.error("Modal - Erreur lors du chargement des ressources:", error);
                showTemporaryMessage('error', 'Erreur lors du chargement des données pour la modification de l\'équipe.');
            } finally {
                setLoadingResources(false);
            }
        };
        fetchResources();
    }, [equipe.id, showTemporaryMessage]); // Dependency array

    const handleUpdate = async () => {
        const updatedEquipeDTO = {
            designation: designation,
            idChefEquipe: selectedChefId ? parseInt(selectedChefId) : null,
            actif: actif // FIX: Ensure this is 'actif', not 'aactif'
        };

        await onUpdate(equipe.id, updatedEquipeDTO);
        onCancel();
    };

    const handleAddMember = async () => {
        if (!newMemberSelection.userId || !newMemberSelection.postId) {
            showTemporaryMessage('warning', 'Veuillez sélectionner un utilisateur et un poste.');
            return;
        }

        const isAlreadyAssigned = currentTeamAssignments.some(
            assignment =>
                assignment.utilisateur?.id === parseInt(newMemberSelection.userId) && // Add optional chaining
                assignment.poste?.id === parseInt(newMemberSelection.postId) // Add optional chaining
        );

        if (isAlreadyAssigned) {
            showTemporaryMessage('info', 'Cet utilisateur est déjà assigné à ce poste dans cette équipe.');
            return;
        }

        try {
            const assignmentData = {
                idEquipe: equipe.id,
                idUtilisateur: parseInt(newMemberSelection.userId),
                idPoste: parseInt(newMemberSelection.postId)
            };
            await equipePosteUtilisateurService.createAssignment(assignmentData);
            setNewMemberSelection({ userId: '', postId: '' });

            const assignmentsRes = await equipePosteUtilisateurService.getAllAssignmentsForEquipe(equipe.id);
            setCurrentTeamAssignments(assignmentsRes.data || []);

            onRefreshEquipes();
            showTemporaryMessage('success', 'Membre ajouté à l\'équipe.');
        } catch (error) {
            console.error("Erreur lors de l'ajout du membre:", error.response?.data || error.message);
            showTemporaryMessage('error', "Erreur lors de l'ajout du membre: " + (error.response?.data?.message || "Une erreur est survenue lors de l'ajout du membre."));
        }
    };

    const handleRemoveMember = async (assignmentToRemove) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir retirer ${assignmentToRemove.utilisateur?.prenom} ${assignmentToRemove.utilisateur?.nom} (${assignmentToRemove.poste?.designation}) de cette équipe?`)) {
            return;
        }
        try {
            await equipePosteUtilisateurService.deleteAssignment(
                assignmentToRemove.equipe.id,
                assignmentToRemove.utilisateur.id,
                assignmentToRemove.poste.id
            );

            const assignmentsRes = await equipePosteUtilisateurService.getAllAssignmentsForEquipe(equipe.id);
            setCurrentTeamAssignments(assignmentsRes.data || []);
            onRefreshEquipes();
            showTemporaryMessage('info', 'Membre retiré de l\'équipe.');
        } catch (error) {
            console.error("Erreur lors de la suppression du membre:", error.response?.data || error.message);
            showTemporaryMessage('error', "Erreur lors de la suppression du membre: " + (error.response?.data?.message || "Une erreur est survenue lors de la suppression du membre."));
        }
    };

    if (loadingResources) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-lg w-full animate-slide-in-up text-center">
                    Chargement des ressources...
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl w-full animate-slide-in-up overflow-y-auto max-h-[90vh]">
                <h3 className="text-lg font-semibold mb-4">Modifier l'équipe "{equipe?.designation || '...'}"</h3> {/* Safe access */}

                {/* Section Modifier Désignation et Chef */}
                <div className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <h4 className="font-medium mb-3 text-slate-700 dark:text-slate-200">Informations Générales</h4>
                    <div className="mb-4">
                        <label className="form-label text-xs">Désignation de l'équipe</label>
                        <input
                            type="text" // Added type for completeness
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label text-xs">Chef d'équipe</label>
                        <select
                            value={selectedChefId}
                            onChange={(e) => setSelectedChefId(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Sélectionner un chef</option>
                            {allUsers.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.prenom} {user.nom}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* NEW: Field for 'actif' attribute in edit modal */}
                    <div className="flex items-center space-x-2 mb-4">
                        <input
                            type="checkbox"
                            id="edit-actif" // Unique ID for this checkbox
                            checked={actif} // Use the local state variable 'actif'
                            onChange={(e) => setActif(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-sky-600 rounded focus:ring-sky-500"
                        />
                        <label htmlFor="edit-actif" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Équipe active
                        </label>
                    </div>

                    <div className="flex justify-end">
                        <button onClick={handleUpdate} className="btn btn-primary"><Save size={16} className="mr-2"/>Sauvegarder les modifications générales</button>
                    </div>
                </div>

                {/* Section Gestion des Membres */}
                <div className="mb-6">
                    <h4 className="font-medium mb-3 text-slate-700 dark:text-slate-200">Gestion des Membres</h4>

                    {/* Add new member section */}
                    <div className="flex items-end gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                        <div className="flex-1">
                            <label className="form-label text-xs">Ajouter Membre</label>
                            <select
                                value={newMemberSelection.userId}
                                onChange={(e) => setNewMemberSelection(prev => ({ ...prev, userId: e.target.value }))}
                                className="form-select"
                            >
                                <option value="">Sélectionner un utilisateur</option>
                                {allUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.prenom} {user.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="form-label text-xs">Assigner Poste</label>
                            <select
                                value={newMemberSelection.postId}
                                onChange={(e) => setNewMemberSelection(prev => ({ ...prev, postId: e.target.value }))}
                                className="form-select"
                            >
                                <option value="">Sélectionner un poste</option>
                                {allPostes.map(poste => (
                                    <option key={poste.id} value={poste.id}>
                                        {poste.designation}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleAddMember} className="btn btn-secondary flex-none h-10 w-10 flex items-center justify-center p-0" title="Ajouter ce membre">
                            <UserPlus size={18} />
                        </button>
                    </div>

                    {/* Current members list */}
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Membres actuels de l'équipe ({currentTeamAssignments.length}):</p>
                    {currentTeamAssignments.length === 0 ? (
                        <p className="text-center text-slate-500 text-sm">Aucun membre assigné à cette équipe.</p>
                    ) : (
                        <ul className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-md p-2">
                            {currentTeamAssignments.map(assignment => (
                                <li key={`${assignment.equipe?.id}-${assignment.utilisateur?.id}-${assignment.poste?.id}`} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-md shadow-sm">
                                    <span className="text-sm text-slate-700 dark:text-slate-200">
                                        {assignment.utilisateur?.prenom} {assignment.utilisateur?.nom} (
                                        <span className="font-semibold">{assignment.poste?.designation}</span>)
                                    </span>
                                    <button onClick={() => handleRemoveMember(assignment)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900" title="Retirer ce membre">
                                        <XCircle size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Modal close buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onCancel} className="btn btn-secondary">Fermer</button>
                </div>
            </div>
        </div>
    );
};

// ===================================================================
//  MODALE DE SUPPRESSION
// ===================================================================
const DeleteConfirmationModal = ({ equipe, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-sm animate-slide-in-up">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            <p className="text-sm text-slate-600 my-2">Voulez-vous vraiment supprimer l'équipe <strong className="font-semibold">{equipe?.designation}</strong> ?</p>
            <div className="flex justify-center space-x-3 mt-6">
                <button onClick={onCancel} className="btn btn-secondary">Annuler</button>
                <button onClick={onConfirm} className="btn btn-danger">Supprimer</button>
            </div>
        </div>
    </div>
);

// ===================================================================
//  COMPOSANT PRINCIPAL
// ===================================================================
const ConsulterEquipesPage = ({ users = [] }) => {
    const [view, setView] = useState('list');
    const [equipes, setEquipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [pageMessage, setPageMessage] = useState(null);
    const [equipeToEdit, setEquipeToEdit] = useState(null);
    const [equipeToDelete, setEquipeToDelete] = useState(null);

    // This useEffect logs state changes for debugging
    useEffect(() => {
        console.log("ConsulterEquipesPage - equipeToEdit state changed to:", equipeToEdit);
        if (equipeToEdit) {
            console.log("ConsulterEquipesPage - Edit modal should be visible now.");
        } else {
            console.log("ConsulterEquipesPage - Edit modal should be hidden now.");
        }
    }, [equipeToEdit]);

    const fetchEquipes = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await equipeService.getAllEquipes();
            setEquipes(response.data || []);
        } catch (err) {
            setError("Erreur lors de la récupération des équipes.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchEquipes(); }, [fetchEquipes]);

    const showTemporaryMessage = useCallback((type, text) => {
        setPageMessage({ type, text });
        setTimeout(() => setPageMessage(null), 4000);
    }, []);

    const handleAddEquipe = async (equipeFormData) => {
        const equipeDTO = {
            designation: equipeFormData.designation,
            idChefEquipe: null,
            actif: equipeFormData.actif // Include 'actif' from form data
        };
        try {
            await equipeService.createEquipe(equipeDTO);
            showTemporaryMessage('success', `L'équipe '${equipeDTO.designation}' a été créée.`);
            await fetchEquipes();
            setView('list');
        } catch (err) {
            showTemporaryMessage('error', err.response?.data?.message || "Erreur lors de la création.");
        }
    };

    const handleUpdateEquipe = async (equipeId, updatedData) => { // 'updatedData' now includes 'actif'
        try {
            await equipeService.updateEquipe(equipeId, updatedData);
            showTemporaryMessage('success', 'Équipe mise à jour.');
            setEquipeToEdit(null); // Close the modal
            await fetchEquipes(); // Refresh the list
        } catch (err) {
            showTemporaryMessage('error', err.response?.data?.message || 'Erreur lors de la mise à jour.');
        }
    };

    const handleDeleteEquipe = async () => {
        console.log("handleDeleteEquipe est appelée. Valeur de equipeToDelete :", equipeToDelete);
        if (!equipeToDelete) {
            console.error("Aucune équipe sélectionnée pour la suppression.");
            return;
        }

        const idToDelete = equipeToDelete.id;

        try {
            await equipeService.deleteEquipe(idToDelete);
            showTemporaryMessage('info', 'Équipe supprimée avec succès.');

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data || 'Impossible de supprimer cette équipe.';
            showTemporaryMessage('error', errorMessage);
            console.error("Erreur détaillée de la suppression:", err.response);

        } finally {
            setEquipeToDelete(null);
            await fetchEquipes();
        }
    };

    const processedEquipes = equipes.filter(e => (e.designation || '').toLowerCase().includes(searchTerm.toLowerCase()));

    // --- RENDER ---
    if (isLoading) return <div className="p-6 text-center">Chargement...</div>;
    if (error) return <div className="p-6 text-center text-red-500"><Frown/>{error}</div>;
    if (view === 'add') return <AjouterEquipePage onAddEquipe={handleAddEquipe} onCancel={() => setView('list')} />;

    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
            {/* These modals MUST be at the top level of the return statement
                so they can render independently of viewMode and overlay other content. */}
            {equipeToDelete &&
                <DeleteConfirmationModal
                    equipe={equipeToDelete}
                    onCancel={() => setEquipeToDelete(null)}
                    onConfirm={handleDeleteEquipe}
                />
            }
            {equipeToEdit && (
                <EditEquipeModal
                    equipe={equipeToEdit}
                    onUpdate={handleUpdateEquipe}
                    onCancel={() => setEquipeToEdit(null)}
                    onRefreshEquipes={fetchEquipes}
                    showTemporaryMessage={showTemporaryMessage}
                />
            )}

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Gestion des Équipes ({processedEquipes.length})</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setView('add')} className="btn btn-primary"><UserPlus size={18} className="mr-2"/>Ajouter</button>
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}><TableIcon size={20} /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}><List size={20} /></button>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}><LayoutGrid size={20} /></button>
                    </div>
                </div>
                <input type="text" placeholder="Rechercher par désignation..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input w-full"/>
            </div>

            {pageMessage && (
                <div className={`p-3 rounded-md text-sm ${
                    pageMessage.type === 'success' ? 'bg-green-100 text-green-800' :
                    pageMessage.type === 'error' ? 'bg-red-100 text-red-800' :
                    pageMessage.type === 'info' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                    {pageMessage.text}
                </div>
            )}

            {processedEquipes.length === 0 && !isLoading && <p className="text-center text-slate-500 py-10">Aucune équipe trouvée.</p>}

            {viewMode === 'table' && (
                <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-700 text-left text-xs text-slate-700 dark:text-slate-300 uppercase">
                                <th className="px-6 py-3">Équipe</th><th className="px-6 py-3">Chef d'équipe</th><th className="px-6 py-3 text-center">Membres</th><th className="px-6 py-3">Statut</th><th className="px-6 py-3">Date Création</th><th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {processedEquipes.map(equipe => <EquipeTableRow key={equipe.id} equipe={equipe} onEditRequest={setEquipeToEdit} onDeleteRequest={setEquipeToDelete}/>)}
                        </tbody>
                    </table>
                </div>
            )}
            {viewMode === 'list' && ( <div className="space-y-3">{processedEquipes.map(equipe => <EquipeRow key={equipe.id} equipe={equipe} onEditRequest={setEquipeToEdit} onDeleteRequest={setEquipeToDelete}/>)}</div> )}
            {viewMode === 'grid' && ( <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{processedEquipes.map(equipe => <EquipeCard key={equipe.id} equipe={equipe} onEditRequest={setEquipeToEdit} onDeleteRequest={setEquipeToDelete}/>)}</div> )}
        </div>
    );
};

export default ConsulterEquipesPage;