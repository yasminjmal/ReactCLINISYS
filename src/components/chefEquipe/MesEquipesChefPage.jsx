// src/components/chefEquipe/MesEquipesChefPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Users, Search, Info, Edit, UserPlus, Trash2, X, Loader, Shield, ChevronDown, Package, Settings } from 'lucide-react';

// Importation des services nécessaires
import equipeService from '../../services/equipeService';
import posteService from '../../services/posteService';
import equipePosteUtilisateurService from '../../services/equipePosteUtilisateurService';
import utilisateurService from '../../services/utilisateurService';

// --- Sous-composants et Modales ---

const getProfileImageUrl = (user) => user?.photo ? `data:image/jpeg;base64,${user.photo}` : `https://i.pravatar.cc/150?u=${user?.id || 'default'}`;

const ModalWrapper = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"><X size={20} /></button>
                <h3 className="text-xl font-semibold mb-6">{title}</h3>
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

// --- NOUVEAU SOUS-COMPOSANT : LIGNE D'ÉQUIPE DANS LE TABLEAU ---
const TeamRow = ({ equipe, modules, onAddMember, onRemoveMember, onToggle, isExpanded }) => {
    return (
        <>
            {/* Ligne principale de l'équipe */}
            <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="p-4 w-12 text-center">
                    <button onClick={onToggle} className="p-1 rounded-full hover:bg-slate-200">
                        <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </td>
                <td className="p-4 font-semibold text-slate-800">{equipe.designation}</td>
                <td className="p-4 text-slate-600">{equipe.description || 'N/A'}</td>
                <td className="p-4 text-center text-slate-600">{equipe.assignments?.length || 0}</td>
                <td className="p-4 text-center">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${equipe.actif ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {equipe.actif ? 'Actif' : 'Inactif'}
                    </span>
                </td>
                <td className="p-4 text-center">
                    <button onClick={() => onAddMember(equipe)} className="btn btn-primary-outline btn-sm">
                        <UserPlus size={16} />
                    </button>
                </td>
            </tr>
            {/* Section dépliable pour les membres et modules */}
            {isExpanded && (
                <tr className="bg-slate-50">
                    <td colSpan="6" className="p-0">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                            {/* --- COLONNE MEMBRES --- */}
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Users size={18} /> Membres ({equipe.assignments.length})</h4>
                                {equipe.assignments.length > 0 ? (
                                    <div className="space-y-2">
                                        {equipe.assignments.map(assignment => (
                                            <div key={assignment.utilisateur.id} className="flex items-center justify-between bg-white p-2 rounded-md border">
                                                <div className="flex items-center gap-3">
                                                    <img src={getProfileImageUrl(assignment.utilisateur)} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                    <div>
                                                        <p className="font-medium text-sm">{assignment.utilisateur.prenom} {assignment.utilisateur.nom}</p>
                                                        <p className="text-xs text-slate-500">{assignment.poste.designation}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => onRemoveMember(equipe.id, assignment.utilisateur.id, assignment.poste.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-full">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-sm text-slate-500 p-4">Cette équipe n'a aucun membre.</p>
                                )}
                            </div>
                             {/* --- COLONNE MODULES --- */}
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Package size={18} /> Modules Gérés ({modules.length})</h4>
                                {modules.length > 0 ? (
                                    <div className="space-y-2">
                                        {modules.map(module => (
                                            <div key={module.id} className="flex items-center gap-3 bg-white p-2 rounded-md border">
                                                <Settings size={16} className="text-slate-500 flex-shrink-0" />
                                                <p className="text-sm font-medium">{module.designation}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-sm text-slate-500 p-4">Cette équipe ne gère aucun module.</p>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};


// --- COMPOSANT PRINCIPAL ---
const MesEquipesChefPage = ({ equipesChef, allModules, refetchData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [equipeSelectionnee, setEquipeSelectionnee] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [allPostes, setAllPostes] = useState([]);
    const [teamsWithAssignments, setTeamsWithAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState({});

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
                    assignments: assignmentsData[index].data || []
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
            refetchData();
        } catch (error) { console.error("Erreur lors de l'ajout:", error); }
    };

    const handleRemoveMember = async (idEquipe, idUtilisateur, idPoste) => {
        if (window.confirm("Êtes-vous sûr de vouloir retirer ce membre de l'équipe ?")) {
            try {
                await equipePosteUtilisateurService.deleteAssignment(idEquipe, idUtilisateur, idPoste);
                refetchData();
            } catch (error) { console.error("Erreur lors de la suppression:", error); }
        }
    };

    const toggleRow = (equipeId) => {
        setExpandedRows(prev => ({ ...prev, [equipeId]: !prev[equipeId] }));
    };

    const filteredTeams = useMemo(() => {
        if (!searchTerm) return teamsWithAssignments;
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        return teamsWithAssignments.filter(team => 
            team.designation.toLowerCase().includes(lowerSearchTerm) ||
            team.assignments.some(a => `${a.utilisateur.prenom} ${a.utilisateur.nom}`.toLowerCase().includes(lowerSearchTerm))
        );
    }, [teamsWithAssignments, searchTerm]);
    
    const getModulesForEquipe = (equipeId) => (allModules || []).filter(module => module.equipe?.id === equipeId);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader className="animate-spin" size={48} /></div>;
    }

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Gestion des Équipes</h1>
                <p className="text-slate-500 mt-1">Consultez et gérez les membres et les modules de vos équipes.</p>
            </header>

            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-grow w-full">
                    <Search className="h-5 w-5 text-slate-400 absolute inset-y-0 left-3 flex items-center pointer-events-none" />
                    <input type="text" placeholder="Rechercher une équipe ou un membre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input w-full pl-10"/>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    {filteredTeams.length === 0 ? (
                        <div className="text-center py-16">
                           <Info size={48} className="mx-auto text-slate-400 mb-4" />
                            <p className="text-slate-500">{searchTerm ? "Aucun résultat pour votre recherche." : "Vous ne supervisez aucune équipe."}</p>
                        </div>
                    ) : (
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-700">
                                <tr>
                                    <th className="p-4 w-12"></th>
                                    <th className="p-4 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">Équipe</th>
                                    <th className="p-4 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">Description</th>
                                    <th className="p-4 text-center text-xs font-semibold text-slate-100 uppercase tracking-wider">Membres</th>
                                    <th className="p-4 text-center text-xs font-semibold text-slate-100 uppercase tracking-wider">Statut</th>
                                    <th className="p-4 text-center text-xs font-semibold text-slate-100 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {filteredTeams.map((equipe) => (
                                    <TeamRow 
                                        key={equipe.id}
                                        equipe={equipe}
                                        modules={getModulesForEquipe(equipe.id)}
                                        onAddMember={handleOpenAddMemberModal}
                                        onRemoveMember={handleRemoveMember}
                                        onToggle={() => toggleRow(equipe.id)}
                                        isExpanded={!!expandedRows[equipe.id]}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            
            <ModalAjouterMembre isOpen={isAddMemberModalOpen} onClose={handleCloseModals} onAdd={handleAddMember} equipe={equipeSelectionnee} allUsers={allUsers} allPostes={allPostes}/>
        </div>
    );
};

export default MesEquipesChefPage;