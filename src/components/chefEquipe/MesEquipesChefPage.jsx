import React, { useState, useMemo, useEffect } from 'react';
import { Users, User, Settings, Shield, ChevronDown, ChevronUp, Briefcase, Package, Search as SearchIcon, Info, Edit, UserPlus, Trash2, X, Loader } from 'lucide-react';

// --- Importation des services nécessaires ---
import equipeService from '../../services/equipeService';
import posteService from '../../services/posteService';
import equipePosteUtilisateurService from '../../services/equipePosteUtilisateurService';
import utilisateurService from '../../services/utilisateurService'; 

// --- MODALE POUR MODIFIER UNE ÉQUIPE (SIMPLIFIÉE) ---
const ModalModifierEquipe = ({ isOpen, onClose, onSave, equipe }) => {
    const [formData, setFormData] = useState({});
    useEffect(() => {
        if (equipe) {
            setFormData({
                designation: equipe.designation || '',
                actif: equipe.actif === true,
            });
        }
    }, [equipe]);

    if (!isOpen || !equipe) return null;

    

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(equipe.id, formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                    <X size={20} />
                </button>
                <h3 className="text-lg font-semibold mb-4">Modifier l'équipe</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="designation" className="form-label">Désignation</label>
                        <input id="designation" name="designation" type="text" value={formData.designation} onChange={handleChange} className="form-input" required />
                    </div>
                    <div className="flex items-center">
                        <input id="actif" name="actif" type="checkbox" checked={formData.actif} onChange={handleChange} className="form-checkbox" />
                        <label htmlFor="actif" className="ml-2">Équipe active</label>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
                        <button type="submit" className="btn btn-primary">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- MODALE POUR AJOUTER UN MEMBRE ---
const ModalAjouterMembre = ({ isOpen, onClose, onAdd, equipe, allUsers, allPostes }) => {
    const [idUtilisateur, setIdUtilisateur] = useState('');
    const [idPoste, setIdPoste] = useState('');

    const utilisateursDisponibles = useMemo(() => {
        if (!allUsers || !equipe?.utilisateurs) return [];
        const idsMembresActuels = equipe.utilisateurs.map(u => u.id);
        return allUsers.filter(u => !idsMembresActuels.includes(u.id));
    }, [allUsers, equipe]);

    if (!isOpen || !equipe) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!idUtilisateur || !idPoste) {
            alert("Veuillez sélectionner un utilisateur et un poste.");
            return;
        }
        onAdd({ idEquipe: equipe.id, idUtilisateur, idPoste });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
                 <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><X size={20} /></button>
                <h3 className="text-lg font-semibold mb-4">Ajouter un membre à "{equipe.designation}"</h3>
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
            </div>
        </div>
    );
};


// --- COMPOSANT PRINCIPAL ---
const MesEquipesChefPage = ({ equipesChef, allModules, refetchData }) => {
    const [expandedEquipes, setExpandedEquipes] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [equipeSelectionnee, setEquipeSelectionnee] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [allPostes, setAllPostes] = useState([]);
    const [detailedAssignments, setDetailedAssignments] = useState({});
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

    useEffect(() => {
        const loadFormData = async () => {
            try {
                const [usersRes, postesRes] = await Promise.all([
                    utilisateurService.getAllUtilisateurs(),
                    posteService.getAllPostes('actif')
                ]);
                setAllUsers(usersRes.data || []);
                setAllPostes(postesRes.data || []);
            } catch (error) {
                console.error("Erreur de chargement des données pour les formulaires:", error);
            }
        };
        loadFormData();
    }, []);

    const toggleEquipeExpansion = async (equipeId) => {
        const isCurrentlyExpanded = !!expandedEquipes[equipeId];
        if (!isCurrentlyExpanded && !detailedAssignments[equipeId]) {
            setIsLoadingAssignments(true);
            try {
                const response = await equipePosteUtilisateurService.getAllAssignmentsForEquipe(equipeId);
                setDetailedAssignments(prev => ({
                    ...prev,
                    [equipeId]: response.data || []
                }));
            } catch (error) {
                console.error("Erreur de chargement des assignations:", error);
                setDetailedAssignments(prev => ({ ...prev, [equipeId]: [] }));
            } finally {
                setIsLoadingAssignments(false);
            }
        }
        setExpandedEquipes(prev => ({ ...prev, [equipeId]: !isCurrentlyExpanded }));
    };
    
    const filteredEquipes = useMemo(() => {
        if (!searchTerm) return equipesChef || [];
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (equipesChef || []).filter(equipe =>
            equipe.designation.toLowerCase().includes(lowerSearchTerm) ||
            (equipe.description && equipe.description.toLowerCase().includes(lowerSearchTerm))
        );
    }, [equipesChef, searchTerm]);

    const getModulesForEquipe = (equipeId) => (allModules || []).filter(module => module.equipe?.id === equipeId);

    const handleOpenEditModal = (equipe) => {
        setEquipeSelectionnee(equipe);
        setIsEditModalOpen(true);
    };
    
    const handleOpenAddMemberModal = (equipe) => {
        setEquipeSelectionnee(equipe);
        setIsAddMemberModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsEditModalOpen(false);
        setIsAddMemberModalOpen(false);
        setEquipeSelectionnee(null);
    };

    const handleSaveChanges = async (equipeId, dataToUpdate) => {
        try {
            await equipeService.updateEquipe(equipeId, dataToUpdate);
            handleCloseModals();
            refetchData();
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'équipe:", error);
        }
    };
    
    const handleAddMember = async (assignmentData) => {
        try {
            await equipePosteUtilisateurService.createAssignment(assignmentData);
            const response = await equipePosteUtilisateurService.getAllAssignmentsForEquipe(assignmentData.idEquipe);
            setDetailedAssignments(prev => ({...prev, [assignmentData.idEquipe]: response.data || []}));
            handleCloseModals();
        } catch (error) {
            console.error("Erreur lors de l'ajout du membre:", error);
        }
    };

    const handleRemoveMember = async (idEquipe, idUtilisateur, idPoste) => {
        if (window.confirm("Êtes-vous sûr de vouloir retirer ce membre de l'équipe ?")) {
            try {
                await equipePosteUtilisateurService.deleteAssignment(idEquipe, idUtilisateur, idPoste);
                const response = await equipePosteUtilisateurService.getAllAssignmentsForEquipe(idEquipe);
                setDetailedAssignments(prev => ({...prev, [idEquipe]: response.data || []}));
            } catch (error) {
                console.error("Erreur lors de la suppression du membre:", error);
            }
        }
    };

    if (!equipesChef) {
        return <div className="p-6 text-center text-slate-500 dark:text-slate-400">Chargement...</div>;
    }

      const getProfileImageUrl = (user) => {
        if (user?.photo) {
            return `data:image/jpeg;base64,${user.photo}`;
        }
        return `https://i.pravatar.cc/150?u=${user?.id || 'default'}`;
    };

    return (
        <>
            <div className="p-4 md:p-6 space-y-6 bg-slate-100 dark:bg-slate-950 min-h-full">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-5">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mes Équipes</h1>
                        <div className="relative w-full sm:w-72">
                            <SearchIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 absolute inset-y-0 left-3 flex items-center pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Rechercher une équipe..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input-icon w-full py-2.5 text-sm pl-10"
                            />
                        </div>
                    </div>
                </div>

                {filteredEquipes.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                       <Info size={48} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">
                            {searchTerm ? "Aucune équipe ne correspond à votre recherche." : "Vous ne supervisez aucune équipe pour le moment."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredEquipes.map((equipe) => {
                            const assignments = detailedAssignments[equipe.id] || [];
                            const modulesDeLequipe = getModulesForEquipe(equipe.id);

                            return (
                                <div key={equipe.id} className="bg-white dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <div className="w-full flex justify-between items-center p-4 md:p-6 text-left">
                                        <div className="flex items-center gap-4 flex-grow">
                                            <div className="p-2.5 bg-sky-100 dark:bg-sky-700/30 rounded-lg flex-shrink-0">
                                                <Users size={22} className="text-sky-600 dark:text-sky-400" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-lg font-semibold text-sky-700 dark:text-sky-300">{equipe.designation}</h2>
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${equipe.actif ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {equipe.actif ? 'Actif' : 'Inactif'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-prose">{equipe.description || "Pas de description."}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button onClick={() => handleOpenEditModal(equipe)} className="btn btn-secondary-outline btn-xs p-2" title="Modifier l'équipe">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => toggleEquipeExpansion(equipe.id)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                                {expandedEquipes[equipe.id] ? <ChevronUp size={24} className="text-slate-500" /> : <ChevronDown size={24} className="text-slate-500" />}
                                            </button>
                                        </div>
                                    </div>

                                    {expandedEquipes[equipe.id] && (
                                        <div className="border-t border-slate-200 dark:border-slate-700 p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-800/30">
                                            <section>
                                                <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center">
                                                    <Package size={18} className="mr-2.5 text-teal-500" /> Modules Gérés ({modulesDeLequipe.length})
                                                </h3>
                                                {modulesDeLequipe.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {modulesDeLequipe.map((module) => (
                                                            <div key={module.id} className="p-3.5 bg-white dark:bg-slate-700 rounded-lg shadow border flex items-start space-x-3">
                                                                <div className="p-2 bg-teal-50 dark:bg-teal-700/30 rounded-md flex-shrink-0">
                                                                    <Settings size={20} className="text-teal-600 dark:text-teal-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-sm">{module.designation}</p>
                                                                    <p className="text-xs text-slate-500 mt-0.5">{module.description}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-500 italic">Aucun module n'est géré par cette équipe.</p>
                                                )}
                                            </section>
                                            
                                            <section className="pt-5 border-t border-slate-300 dark:border-slate-700">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="text-base font-semibold flex items-center">
                                                        <User className="mr-2.5" /> Membres ({assignments.length})
                                                    </h3>
                                                    <button onClick={() => handleOpenAddMemberModal(equipe)} className="btn btn-primary-outline btn-sm flex items-center gap-2">
                                                        <UserPlus size={16} /> Ajouter
                                                    </button>
                                                </div>
                                                
                                                {isLoadingAssignments && <div className="flex justify-center p-4"><Loader className="animate-spin"/></div>}

                                                {!isLoadingAssignments && assignments.length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {assignments.map((assignment) => (
                                                            <div key={`${assignment.utilisateur.id}-${assignment.poste.id}`} className="p-3.5 bg-white dark:bg-slate-700 rounded-lg shadow-md border flex items-start space-x-3">
                                                                 <img 
                                                                    src={getProfileImageUrl(assignment.utilisateur)} 
                                                                    alt={`${assignment.utilisateur.prenom} ${assignment.utilisateur.nom}`}
                                                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                                                />
                                                                <div className="flex-grow">
                                                                    <p className="font-semibold text-sm">{assignment.utilisateur.prenom} {assignment.utilisateur.nom}</p>
                                                                    <p className="text-xs text-sky-600">{assignment.poste.designation}</p>
                                                                </div>
                                                                <button 
                                                                    onClick={() => handleRemoveMember(equipe.id, assignment.utilisateur.id, assignment.poste.id)}
                                                                    className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-700/20 rounded-full" 
                                                                    title="Retirer de l'équipe">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (!isLoadingAssignments &&
                                                    <p className="text-sm text-slate-500 italic">Aucun membre n'est affecté à cette équipe.</p>
                                                )}
                                            </section>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <ModalModifierEquipe isOpen={isEditModalOpen} onClose={handleCloseModals} onSave={handleSaveChanges} equipe={equipeSelectionnee} />
            <ModalAjouterMembre isOpen={isAddMemberModalOpen} onClose={handleCloseModals} onAdd={handleAddMember} equipe={equipeSelectionnee} allUsers={allUsers} allPostes={allPostes}/>
        </>
    );
};

export default MesEquipesChefPage;