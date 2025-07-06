// src/components/chefEquipe/MesEquipesChefPage.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Info, Edit, UserPlus, Trash2, X, Loader, Shield, ChevronDown, Package, Settings, Users as UsersIcon, ArrowLeft } from 'lucide-react';

// Importation des services nécessaires
import equipeService from '../../services/equipeService';
import posteService from '../../services/posteService';
import equipePosteUtilisateurService from '../../services/equipePosteUtilisateurService';
import utilisateurService from '../../services/utilisateurService';
import ticketService from '../../services/ticketService'; // Added ticketService for detailed data

// Importation du nouveau composant de tableau de bord détaillé et des nouveaux composants de navigation/vue globale
import TeamDetailDashboard from './dashboardsEQUIPES/TeamDetailDashboard'; 
import TeamTabNavigator from './dashboardsEQUIPES/TeamTabNavigator'; // NEW import
import TeamGlobalOverview from './dashboardsEQUIPES/TeamGlobalOverview'; // NEW import


// --- Modals (remain here or in a shared place) ---
const ModalWrapper = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><X size={20} /></button>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">{title}</h3>
                {children}
            </div>
        </div>
    );
};

const ModalAjouterMembre = ({ isOpen, onClose, onAdd, equipe, allUsers, allPostes }) => {
    const [idUtilisateur, setIdUtilisateur] = useState('');
    const [idPoste, setIdPoste] = useState('');

    const utilisateursDisponibles = useMemo(() => {
        if (!allUsers || !equipe?.assignments) return [];
        const idsMembresActuels = equipe.assignments.map(a => a.utilisateur.id);
        return allUsers.filter(u => !idsMembresActuels.includes(u.id) && u.actif);
    }, [allUsers, equipe]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!idUtilisateur || !idPoste) return;
        onAdd({ idEquipe: equipe.id, idUtilisateur, idPoste });
        setIdPoste('');
        setIdUtilisateur('');
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Ajouter un membre à "${equipe?.designation}"`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="idUtilisateur" className="form-label">Utilisateur</label>
                    <select id="idUtilisateur" value={idUtilisateur} onChange={(e) => setIdUtilisateur(e.target.value)} className="form-select" required>
                        <option value="">-- Sélectionner un utilisateur --</option>
                        {utilisateursDisponibles.map(user => (<option key={user.id} value={user.id}>{user.prenom} {user.nom}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="idPoste" className="form-label">Poste</label>
                    <select id="idPoste" value={idPoste} onChange={(e) => setIdPoste(e.target.value)} className="form-select" required>
                       <option value="">-- Sélectionner un poste --</option>
                        {allPostes.map(poste => (<option key={poste.id} value={poste.id}>{poste.designation}</option>))}
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
                    <button type="submit" className="btn btn-primary">Ajouter</button>
                </div>
            </form>
        </ModalWrapper>
    );
};


// --- COMPOSANT PRINCIPAL : MesEquipesChefPage.jsx ---
const MesEquipesChefPage = ({ equipesChef, allModules, refetchData }) => {
    // Supprimé searchTerm et isSidebarOpen (pas géré ici)
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [equipeSelectionnee, setEquipeSelectionnee] = useState(null); // Used for add member modal
    const [allUsers, setAllUsers] = useState([]);
    const [allPostes, setAllPostes] = useState([]);
    const [teamsWithAssignments, setTeamsWithAssignments] = useState([]); // This holds team data with members
    const [isLoading, setIsLoading] = useState(true);
    
    // NEW: State to manage the active tab (either 'global' or a team ID)
    const [activeTeamTab, setActiveTeamTab] = useState('global'); 

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [usersRes, postesRes, ...assignmentPromises] = await Promise.all([
                    utilisateurService.getAllUtilisateurs(),
                    posteService.getAllPostes('actif'),
                    ...(equipesChef || []).map(equipe => equipePosteUtilisateurService.getAllAssignmentsForEquipe(equipe.id))
                ]);

                setAllUsers(usersRes.data || []);
                setAllPostes(postesRes.data || []);
                
                const assignmentsData = await Promise.all(assignmentPromises);
                const newTeamsWithAssignments = (equipesChef || []).map((equipe, index) => ({
                    ...equipe,
                    assignments: assignmentsData[index].data || [],
                    // Assuming you might want to attach total tickets assigned to each team later
                    // totalAssignedTickets: await ticketService.getAssignedTicketsCountForTeam(equipe.id) // Example API call
                }));
                setTeamsWithAssignments(newTeamsWithAssignments);

            } catch (error) {
                console.error("Erreur de chargement des données de la page:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (equipesChef.length > 0) loadInitialData();
        else setIsLoading(false);
    }, [equipesChef]);
    
    const handleOpenAddMemberModal = (equipe) => { setEquipeSelectionnee(equipe); setIsAddMemberModalOpen(true); };
    const handleCloseModals = () => { setIsAddMemberModalOpen(false); setEquipeSelectionnee(null); };

    const handleAddMember = async (assignmentData) => {
        try {
            await equipePosteUtilisateurService.createAssignment(assignmentData);
            handleCloseModals();
            refetchData(); // Refetch all teams data, including assignments
        } catch (error) { console.error("Erreur lors de l'ajout:", error); }
    };

    const handleRemoveMember = async (idEquipe, idUtilisateur, idPoste) => {
        if (window.confirm("Êtes-vous sûr de vouloir retirer ce membre de l'équipe ?")) {
            try {
                await equipePosteUtilisateurService.deleteAssignment(idEquipe, idUtilisateur, idPoste);
                refetchData(); // Refetch all teams data, including assignments
            } catch (error) { console.error("Erreur lors de la suppression:", error); }
        }
    };
    
    // Function to handle tab clicks
    const handleTabClick = (tabId) => {
        setActiveTeamTab(tabId);
    };

    // Determine which team is currently selected for detailed view
    const selectedTeam = activeTeamTab === 'global' 
        ? null 
        : teamsWithAssignments.find(team => team.id === activeTeamTab);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader className="animate-spin" size={48} /></div>;
    }

    return (
        <div>
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestion des Équipes</h1>
                <p className="text-slate-500 mt-1">Consultez et gérez les membres et les modules de vos équipes.</p>
            </header>

            {/* NEW: Team Tab Navigator */}
            <TeamTabNavigator 
                teams={teamsWithAssignments}
                activeTab={activeTeamTab}
                onTabClick={handleTabClick}
            />

            {/* Content area based on active tab */}
            <div className="mt-6">
                {activeTeamTab === 'global' ? (
                    <TeamGlobalOverview 
                        teams={teamsWithAssignments} 
                        allModules={allModules} 
                        // You might need to pass ticket data if global overview requires specific ticket counts
                        // For chart data in global overview, you might need to fetch a consolidated view
                    />
                ) : (
                    selectedTeam ? (
                        <TeamDetailDashboard 
                            team={selectedTeam} 
                            allUsers={allUsers} 
                            allPostes={allPostes} 
                            allModules={allModules} 
                            refetchData={refetchData} // Pass refetch for child components
                        />
                    ) : (
                        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                            Sélectionnez une équipe pour voir ses détails.
                        </div>
                    )
                )}
            </div>
            
            {/* Modal for adding members (can be global as it affects any team) */}
            <ModalAjouterMembre isOpen={isAddMemberModalOpen} onClose={handleCloseModals} onAdd={handleAddMember} equipe={equipeSelectionnee} allUsers={allUsers} allPostes={allPostes}/>
        </div>
    );
};

export default MesEquipesChefPage;