// src/components/admin/Equipes/ConsulterEquipesPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Search, Plus, X, Filter, AlertTriangle, Save, XCircle, Settings2, Eye,
    EyeOff, ChevronLeft, ChevronRight, ArrowUpDown, RefreshCw, LayoutGrid, Rows3,
    Printer, File, FileSpreadsheet, Info, CheckCircle, Users as UsersIconPage, UserPlus
} from 'lucide-react';

// --- Services ---
import equipeService from '../../../services/equipeService';
import equipePosteUtilisateurService from '../../../services/equipePosteUtilisateurService';
import utilisateurService from '../../../services/utilisateurService';
import posteService from '../../../services/posteService';

// --- Utilitaires ---
import { exportToPdf } from '../../../utils/exportPdf';
import { exportTableToExcel } from '../../../utils/exportExcel';
import { printHtmlContent } from '../../../utils/printContent';
import { useExport } from '../../../context/ExportContext'; // Importer useExport
import { formatDateFromArray } from '../../../utils/dateFormatter';
import defaultProfilePic from '../../../assets/images/default-profile.png'; // AJOUT DE L'IMPORTATION DE defaultProfilePic

// --- Sous-composants ---
import EquipeCard from './EquipeCard';
import EquipeTableRow from './EquipeTableRow';
import AjouterEquipePage from './AjouterEquipePage';

// --- Composants UI Internes (Standardisés) ---
const Spinner = () => <div className="text-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div></div>;

// Composant de message de notification (Toast) - Réutilisé
const ToastMessage = ({ message, type, onClose }) => {
    let bgColor, icon, titleColor, borderColor;
    switch (type) {
        case 'success':
            bgColor = 'bg-green-500';
            titleColor = 'text-white';
            borderColor = 'border-green-600';
            icon = <CheckCircle size={20} className="text-white" />;
            break;
        case 'error':
            bgColor = 'bg-red-500';
            titleColor = 'text-white';
            borderColor = 'border-red-600';
            icon = <AlertTriangle size={20} className="text-white" />;
            break;
        case 'info':
            bgColor = 'bg-blue-500';
            titleColor = 'text-white';
            borderColor = 'border-blue-600';
            icon = <Info size={20} className="text-white" />;
            break;
        default:
            bgColor = 'bg-gray-500';
            titleColor = 'text-white';
            borderColor = 'border-gray-600';
            icon = null;
    }

    return (
        <div className={`fixed bottom-4 right-4 ${bgColor} ${titleColor} px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transform transition-transform duration-300 ease-out translate-y-0 opacity-100 border-2 ${borderColor} font-semibold`}>
            {icon}
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                <X size={16} />
            </button>
        </div>
    );
};

const DeleteConfirmationModal = ({ equipe, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-md w-full">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Confirmer la suppression</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 my-2">Voulez-vous vraiment supprimer l'équipe <strong className="font-semibold text-slate-800 dark:text-slate-200">"{equipe?.designation}"</strong>?</p>
            <div className="flex justify-center space-x-3 mt-6">
                <button onClick={onCancel} className="btn btn-secondary">Annuler</button>
                <button onClick={onConfirm} className="btn btn-danger">Supprimer</button>
            </div>
        </div>
    </div>
);

// MODALE DE MODIFICATION D'ÉQUIPE (Intégrée dans ConsulterEquipesPage)
const EditEquipeModal = ({ equipe, onUpdate, onCancel, onRefreshEquipes, setToast }) => {
    const [designation, setDesignation] = useState(equipe?.designation || '');
    const [selectedChefId, setSelectedChefId] = useState(equipe?.chefEquipe?.id?.toString() || ''); // Convertir en string
    const [actif, setActif] = useState(equipe?.actif ?? false);
    const [allUsers, setAllUsers] = useState([]);
    const [allPostes, setAllPostes] = useState([]);
    const [currentTeamAssignments, setCurrentTeamAssignments] = useState([]);
    const [newMemberSelection, setNewMemberSelection] = useState({ userId: '', postId: '' });
    const [loadingResources, setLoadingResources] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchResources = async () => {
            setLoadingResources(true);
            try {
                const [usersRes, postesRes, assignmentsRes] = await Promise.all([
                    utilisateurService.getAllUtilisateurs(),
                    posteService.getAllPostes(),
                    equipePosteUtilisateurService.getAllAssignmentsForEquipe(equipe.id)
                ]);

                setAllUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
                setAllPostes(Array.isArray(postesRes.data) ? postesRes.data : []);
                setCurrentTeamAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);

            } catch (error) {
                console.error("Erreur lors du chargement des ressources pour EditEquipeModal:", error);
                setToast({ type: 'error', message: 'Erreur lors du chargement des données pour la modification.' });
            } finally {
                setLoadingResources(false);
            }
        };
        fetchResources();
    }, [equipe.id, setToast]);
    const userwithrolechef = useMemo(() => {
        return allUsers.filter(user => user.role?.includes('C'));
    }, [allUsers]);

    const userWithJustEmployeeRole = useMemo(() => {
        return allUsers.filter(user => user.role?.includes('E'));
    }, [allUsers]);



    const handleUpdate = async (e) => {
        e.preventDefault(); // Empêcher le rechargement de la page
        const newErrors = {};
        if (!designation.trim()) newErrors.designation = "La désignation est requise.";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        const updatedEquipeDTO = {
            designation: designation,
            idChefEquipe: selectedChefId ? parseInt(selectedChefId) : null,
            actif: actif
        };

        try {
            await onUpdate(equipe.id, updatedEquipeDTO);
            // onCancel est appelé par le onUpdate dans ConsulterEquipesPage.jsx qui ferme le modal
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'équipe:", error);
            setToast({ type: 'error', message: error.response?.data?.message || "Erreur lors de la mise à jour de l'équipe." });
        }
    };

    const handleAddMember = async () => {
        if (!newMemberSelection.userId || !newMemberSelection.postId) {
            setToast({ type: 'warning', message: 'Veuillez sélectionner un utilisateur et un poste.' });
            return;
        }

        const isAlreadyAssigned = currentTeamAssignments.some(
            assignment =>
                assignment.utilisateur?.id === parseInt(newMemberSelection.userId) &&
                assignment.poste?.id === parseInt(newMemberSelection.postId)
        );

        if (isAlreadyAssigned) {
            setToast({ type: 'info', message: 'Cet utilisateur est déjà assigné à ce poste dans cette équipe.' });
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
            setCurrentTeamAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
            onRefreshEquipes(); // Demande un refresh des données de l'équipe parente
            setToast({ type: 'success', message: 'Membre ajouté à l\'équipe.' });
        } catch (error) {
            console.error("Erreur lors de l'ajout du membre:", error);
            setToast({ type: 'error', message: error.response?.data?.message || "Erreur lors de l'ajout du membre." });
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
            setCurrentTeamAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
            onRefreshEquipes(); // Demande un refresh des données de l'équipe parente
            setToast({ type: 'info', message: 'Membre retiré de l\'équipe.' });
        } catch (error) {
            console.error("Erreur lors de la suppression du membre:", error);
            setToast({ type: 'error', message: error.response?.data?.message || "Erreur lors de la suppression du membre." });
        }
    };

    if (loadingResources) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-lg w-full text-center">
                    <Spinner />
                    <p className="text-slate-600 dark:text-slate-300 mt-4">Chargement des ressources de l'équipe...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl w-full overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Modifier l'équipe "{equipe?.designation || '...'}"</h2>

                {/* Section Informations Générales */}
                <form onSubmit={handleUpdate} className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 space-y-4">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200">Informations Générales</h4>
                    <div>
                        <label htmlFor="edit-designation" className="form-label">Désignation de l'équipe</label>
                        <input
                            type="text"
                            id="edit-designation"
                            value={designation}
                            onChange={(e) => { setDesignation(e.target.value); setErrors(prev => ({...prev, designation: null})); }}
                            className={`form-input ${errors.designation ? 'border-red-500' : ''}`}
                        />
                        {errors.designation && <p className="form-error-text">{errors.designation}</p>}
                    </div>
                    <div>
                        <label htmlFor="edit-chef" className="form-label">Chef d'équipe</label>
                        <select
                            id="edit-chef"
                            value={selectedChefId}
                            onChange={(e) => setSelectedChefId(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Sélectionner un chef</option>
                            {userwithrolechef.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.prenom} {user.nom}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center pt-2">
                        <input
                            type="checkbox"
                            id="edit-actif"
                            checked={actif}
                            onChange={(e) => setActif(e.target.checked)}
                            className="form-checkbox"
                        />
                        <label htmlFor="edit-actif" className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                            Équipe active
                        </label>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="btn btn-primary"><Save size={16} className="mr-2"/>Sauvegarder les modifications générales</button>
                    </div>
                </form>

                {/* Section Gestion des Membres */}
                <div className="mb-6 space-y-4">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200">Gestion des Membres</h4>

                    <div className="flex flex-col sm:flex-row items-end gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                        <div className="flex-1 w-full">
                            <label className="form-label">Ajouter Membre</label>
                            <select
                                value={newMemberSelection.userId}
                                onChange={(e) => setNewMemberSelection(prev => ({ ...prev, userId: e.target.value }))}
                                className="form-select"
                            >
                                <option value="">Sélectionner un utilisateur</option>
                                {userWithJustEmployeeRole.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.prenom} {user.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="form-label">Assigner Poste</label>
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
                        <button onClick={handleAddMember} type="button" className="btn btn-secondary flex-none h-10 w-10 flex items-center justify-center p-0" title="Ajouter ce membre">
                            <UserPlus size={18} />
                        </button>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300">Membres actuels de l'équipe ({currentTeamAssignments.length}):</p>
                    {currentTeamAssignments.length === 0 ? (
                        <p className="text-center text-slate-500 text-sm italic">Aucun membre assigné à cette équipe.</p>
                    ) : (
                        <ul className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-md p-2">
                            {currentTeamAssignments.map(assignment => (
                                <li key={`${assignment.equipe?.id}-${assignment.utilisateur?.id}-${assignment.poste?.id}`} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-md shadow-sm">
                                    <span className="text-sm text-slate-700 dark:text-slate-200">
                                        {assignment.utilisateur?.prenom} {assignment.utilisateur?.nom} (<span className="font-semibold">{assignment.poste?.designation}</span>)
                                    </span>
                                    <button onClick={() => handleRemoveMember(assignment)} type="button" className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900" title="Retirer ce membre">
                                        <XCircle size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex justify-end space-x-3 mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <button onClick={onCancel} type="button" className="btn btn-secondary">Fermer</button>
                </div>
            </div>
        </div>
    );
};

const DropdownMenu = ({ children, align = 'right' }) => (
    <div className={`absolute top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg z-20 py-1 border border-slate-200 dark:border-slate-700 ${align === 'right' ? 'right-0' : 'left-0'}`}>
        {children}
    </div>
);
const DropdownMenuItem = ({ children, onClick, isSelected, disabled }) => (
    <button onClick={onClick} disabled={disabled} className={`w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 ${isSelected ? 'font-bold text-blue-600' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {children}
    </button>
);

// Composant TableHeader pour Équipes
const TableHeader = ({ visibleColumns, handleSort, sortConfig }) => {
    return (
        <thead className="text-sm text-black bg-sky-100 dark:bg-blue-200">
            <tr>
                {visibleColumns.designation && (
                    <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">
                        <button onClick={() => handleSort('designation')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Équipe</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}
                {visibleColumns.chefEquipe && (
                    <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">
                        <button onClick={() => handleSort('chefEquipe')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Chef d'équipe</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}
                {visibleColumns.membresCount && (
                    <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">
                        <button onClick={() => handleSort('membresCount')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Membres</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}
                {visibleColumns.creePar && (
                    <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">
                        <button onClick={() => handleSort('creePar')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Créé par</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}
                {visibleColumns.dateCreation && (
                    <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">
                        <button onClick={() => handleSort('dateCreation')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Date de création</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}
                {visibleColumns.statut && (
                    <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">
                        <button onClick={() => handleSort('actif')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Statut</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}
                <th scope="col" className="px-6 py-3 font-sans text-center">Actions</th>
            </tr>
        </thead>
    );
};

// Composant PaginationControls - Réutilisé
const PaginationControls = ({ currentPage, totalPages, setCurrentPage, processedEquipes, entriesPerPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-6">
            <div className="text-sm text-slate-600 dark:text-slate-400">
                Affichage de <strong>{(currentPage - 1) * entriesPerPage + 1}</strong>-<strong>{Math.min(currentPage * entriesPerPage, processedEquipes.length)}</strong> sur <strong>{processedEquipes.length}</strong>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="pagination-btn"><ChevronLeft size={16} /></button>
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => setCurrentPage(number)}
                        className={`px-3 py-1.5 text-sm rounded-md ${currentPage === number ? 'bg-blue-500 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                    >
                        {number}
                    </button>
                ))}
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="pagination-btn"><ChevronRight size={16} /></button>
            </div>
        </div>
    );
};


// ===================================================================
//  COMPOSANT PRINCIPAL ConsulterEquipesPage
// ===================================================================
const ConsulterEquipesPage = ({ initialEquipes = null }) => {
    // --- STATE MANAGEMENT COMPLET ---
    const [view, setView] = useState('list');
    const [viewMode, setViewMode] = useState('table');
    const [equipes, setEquipes] = useState([]);
    const [allUsers, setAllUsers] = useState([]); // Pour les filtres et les modales
    const [isLoading, setIsLoading] = useState(true);
    const [equipeToEdit, setEquipeToEdit] = useState(null);
    const [equipeToDelete, setEquipeToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterChefId, setFilterChefId] = useState('tous'); // 'tous' ou l'ID d'un chef
    const [filterActif, setFilterActif] = useState('tous'); // 'tous', 'true', 'false'
    const [sortConfig, setSortConfig] = useState({ key: 'designation', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    // Colonnes visibles mises à jour pour les équipes
    const [visibleColumns, setVisibleColumns] = useState({ designation: true, chefEquipe: true, membresCount: true, creePar: true, dateCreation: true, statut: true });
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownsRef = useRef(null);
    // NOUVEAU: États pour le surlignage et les messages de notification
    const [highlightedEquipeId, setHighlightedEquipeId] = useState(null);
    const highlightEquipeRef = useRef(null); // Ref pour l'ID de l'équipe à surligner
    const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' | 'info' }

    // Récupérer les fonctions d'exportation depuis le contexte
    const { setExportFunctions, currentExportPdfFunction, currentExportExcelFunction, currentPrintFunction } = useExport();

    // --- LOGIQUE DE DONNÉES ET D'EFFETS ---
    const fetchEquipesAndUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const [equipesRes, usersRes] = await Promise.all([
                equipeService.getAllEquipes(),
                utilisateurService.getAllUtilisateurs()
            ]);
            setEquipes(Array.isArray(equipesRes.data) ? equipesRes.data : []);
            setAllUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        } catch (err) {
            console.error("Erreur lors du chargement des données:", err);
            setToast({ message: "Erreur lors du chargement des équipes ou utilisateurs.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view === 'list') {
            if (initialEquipes) {
                setEquipes(initialEquipes);
                setIsLoading(false);
            } else {
                fetchEquipesAndUsers();
            }
        }
    }, [view, fetchEquipesAndUsers, initialEquipes]);

    // Gère le clic en dehors des dropdowns (général)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownsRef.current && !dropdownsRef.current.contains(event.target)) {
                 const isExportButton = event.target.closest('.btn-export-dropdown');
                if (!isExportButton) {
                    setOpenDropdown(null);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Effet pour gérer le surlignage (disparaît après 4 secondes)
    useEffect(() => {
        if (highlightedEquipeId) {
            const timer = setTimeout(() => {
                setHighlightedEquipeId(null);
            }, 4000); // 4 secondes
            return () => clearTimeout(timer);
        }
    }, [highlightedEquipeId]);

    // Effet pour gérer l'affichage et la disparition du toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 3000); // 3 secondes
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // --- LOGIQUE D'AFFICHAGE (FILTRE, TRI, PAGINATION) ---
    const processedEquipes = useMemo(() => {
        let filtered = [...equipes];
        
        // Filtre par désignation
        if (searchTerm) {
            filtered = filtered.filter(equipe => equipe.designation.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Filtre par chef d'équipe
        if (filterChefId !== 'tous' && filterChefId !== '') {
            filtered = filtered.filter(equipe => equipe.chefEquipe?.id?.toString() === filterChefId);
        }

        // Filtre par statut actif/inactif
        if (filterActif !== 'tous') {
            const isActive = filterActif === 'true';
            filtered = filtered.filter(equipe => equipe.actif === isActive);
        }

        // Tri
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let valA, valB;

                switch (sortConfig.key) {
                    case 'designation':
                    case 'creePar':
                        valA = (a[sortConfig.key] || '').toLowerCase();
                        valB = (b[sortConfig.key] || '').toLowerCase();
                        break;
                    case 'chefEquipe':
                        valA = (a.chefEquipe ? `${a.chefEquipe.prenom} ${a.chefEquipe.nom}` : '').toLowerCase();
                        valB = (b.chefEquipe ? `${b.chefEquipe.prenom} ${b.chefEquipe.nom}` : '').toLowerCase();
                        break;
                    case 'membresCount':
                        valA = a.utilisateurs ? a.utilisateurs.length : 0;
                        valB = b.utilisateurs ? b.utilisateurs.length : 0;
                        break;
                    case 'dateCreation':
                        const dateA = new Date(a.dateCreation);
                        const dateB = new Date(b.dateCreation);
                        valA = dateA.getTime();
                        valB = dateB.getTime();
                        break;
                    case 'actif':
                        valA = a.actif;
                        valB = b.actif;
                        break;
                    default:
                        valA = a[sortConfig.key];
                        valB = b[sortConfig.key];
                }
                
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [equipes, searchTerm, filterChefId, filterActif, sortConfig]);

    // Effet pour gérer le surlignage et la pagination après la mise à jour de 'equipes'
    useEffect(() => {
        if (highlightEquipeRef.current && Array.isArray(processedEquipes) && processedEquipes.length > 0) {
            const targetId = highlightEquipeRef.current;
            highlightEquipeRef.current = null;

            const targetEquipeIndex = processedEquipes.findIndex(e => e.id === targetId);

            if (targetEquipeIndex !== -1) {
                const calculatedTargetPage = Math.ceil((targetEquipeIndex + 1) / entriesPerPage);

                if (currentPage !== calculatedTargetPage) {
                    setCurrentPage(calculatedTargetPage);
                }

                requestAnimationFrame(() => {
                    setHighlightedEquipeId(targetId);
                });
            }
        }
    }, [processedEquipes, entriesPerPage, currentPage, setCurrentPage]);

    const totalPages = Math.ceil(processedEquipes.length / entriesPerPage);

    const paginatedEquipes = useMemo(() => {
        const startIndex = (currentPage - 1) * entriesPerPage;
        return processedEquipes.slice(startIndex, startIndex + entriesPerPage);
    }, [processedEquipes, currentPage, entriesPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [entriesPerPage, searchTerm, filterChefId, filterActif]); // Réinitialiser la page si les filtres ou la recherche changent

    // --- HANDLERS POUR LES ACTIONS CRUD ---
    const handleAddEquipe = async (equipeData) => {
        try {
            const response = await equipeService.createEquipe(equipeData);
            setView('list');
            await fetchEquipesAndUsers(); // Rafraîchit les données
            const newEquipeId = response.data?.id;
            if (newEquipeId) {
                highlightEquipeRef.current = newEquipeId;
            }
            setToast({ message: `L'équipe '${equipeData.designation}' a été créée avec succès !`, type: 'success' });
        } catch (err) {
            console.error("Erreur lors de la création de l'équipe:", err);
            setToast({ message: err.response?.data?.message || "Erreur lors de la création de l'équipe.", type: 'error' });
        }
    };

    const handleUpdateEquipe = async (equipeId, updatedData) => {
        try {
            await equipeService.updateEquipe(equipeId, updatedData);
            setEquipeToEdit(null); // Ferme le modal
            await fetchEquipesAndUsers(); // Rafraîchit les données
            highlightEquipeRef.current = equipeId;
            setToast({ message: 'Équipe mise à jour avec succès !', type: 'success' });
        } catch (err) {
            console.error('Erreur lors de la mise à jour:', err);
            setToast({ message: err.response?.data?.message || 'Erreur lors de la mise à jour de l\'équipe.', type: 'error' });
        }
    };

    const handleDeleteEquipe = async () => {
        if (!equipeToDelete) return;
        try {
            await equipeService.deleteEquipe(equipeToDelete.id);
            setToast({ message: 'Équipe supprimée avec succès !', type: 'success' });
            setEquipeToDelete(null);
            fetchEquipesAndUsers(); // Rafraîchit la liste
        } catch (err) {
            console.error('Erreur de suppression:', err);
            setToast({ message: err.response?.data?.message || 'Impossible de supprimer cette équipe.', type: 'error' });
            setEquipeToDelete(null);
        }
    };

    // --- HANDLERS POUR LES CONTRÔLES UI ---
    const handleSort = useCallback((key) => {
        setSortConfig(p => ({ key, direction: p.key === key && p.direction === 'asc' ? 'desc' : 'asc' }));
    }, []);
    const handleToggleColumn = useCallback((key) => setVisibleColumns(p => ({ ...p, [key]: !p[key] })), []);
    const toggleDropdownGlobal = useCallback((name) => {
        setOpenDropdown(prev => (prev === name ? null : name));
    }, []);

    // --- PRÉPARATION DES DONNÉES ET FONCTIONS D'EXPORTATION POUR LE CONTEXTE ---
    const pdfHeaders = useMemo(() => [['ID', 'Équipe', 'Chef d\'équipe', 'Membres', 'Créé par', 'Date Création', 'Statut']], []);
    const pdfData = useMemo(() => processedEquipes.map(equipe => [
        equipe.id,
        equipe.designation,
        equipe.chefEquipe ? `${equipe.chefEquipe.prenom} ${equipe.chefEquipe.nom}` : 'N/A',
        equipe.utilisateurs ? equipe.utilisateurs.length : 0,
        equipe.userCreation || 'N/A',
        formatDateFromArray(equipe.dateCreation),
        equipe.actif ? 'Actif' : 'Non actif'
    ]), [processedEquipes]);

    const excelData = useMemo(() => {
        return processedEquipes.map(equipe => ({
            ID: equipe.id,
            'Équipe': equipe.designation,
            'Chef d\'équipe': equipe.chefEquipe ? `${equipe.chefEquipe.prenom} ${equipe.chefEquipe.nom}` : 'N/A',
            'Membres': equipe.utilisateurs ? equipe.utilisateurs.length : 0,
            'Créé par': equipe.userCreation || 'N/A',
            'Date Création': formatDateFromArray(equipe.dateCreation),
            'Statut': equipe.actif ? 'Actif' : 'Inactif'
        }));
    }, [processedEquipes]);

    const handleExportPdfEquipes = useCallback(() => {
        exportToPdf('Liste des Équipes', pdfHeaders, pdfData, 'liste_equipes.pdf');
        setOpenDropdown(null);
    }, [pdfHeaders, pdfData]);

    const handleExportExcelEquipes = useCallback(() => {
        exportTableToExcel(pdfHeaders, pdfData, 'liste_equipes.xlsx', 'Équipes');
        setOpenDropdown(null);
    }, [pdfHeaders, pdfData]);

    const handlePrintEquipes = useCallback(() => {
        let tableHtml = `<h2 style="text-align:center; font-size: 24px; margin-bottom: 20px;">Liste des Équipes</h2>
                         <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                                <tr style="background-color:#f2f2f2;">
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Équipe</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Chef d'équipe</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Membres</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Créé par</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Date Création</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Statut</th>
                                </tr>
                            </thead>
                            <tbody>`;
        processedEquipes.forEach(equipe => {
            tableHtml += `<tr>
                            <td style="padding: 8px; border: 1px solid #ddd;">${equipe.id}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${equipe.designation}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${equipe.chefEquipe ? `${equipe.chefEquipe.prenom} ${equipe.chefEquipe.nom}` : 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${equipe.utilisateurs ? equipe.utilisateurs.length : 0}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${equipe.userCreation || 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${formatDateFromArray(equipe.dateCreation)}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${equipe.actif ? 'Actif' : 'Non actif'}</td>
                          </tr>`;
        });
        tableHtml += `</tbody></table>`;
        printHtmlContent(tableHtml, 'Impression Liste des Équipes');
        setOpenDropdown(null);
    }, [processedEquipes]);

    useEffect(() => {
        setExportFunctions(handleExportPdfEquipes, handleExportExcelEquipes, handlePrintEquipes);
        return () => {
            setExportFunctions(null, null, null);
        };
    }, [setExportFunctions, handleExportPdfEquipes, handleExportExcelEquipes, handlePrintEquipes]);

    // --- RENDU PRINCIPAL ---
    if (view === 'add') {
        return <AjouterEquipePage onAddEquipe={handleAddEquipe} onCancel={() => { setView('list'); setToast({ message: "Ajout d'équipe annulé.", type: 'info' }); }} />;
    }

    return (
        <div className="p-0 md:p-0 bg-slate-50 dark:bg-slate-900 min-h-screen">
            {/* Styles CSS personnalisés intégrés dans le composant */}
            <style>{`
                .btn { @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150; }
                .btn-primary { @apply text-white bg-blue-600 hover:bg-blue-700 border-transparent focus:ring-blue-500; }
                .btn-secondary { @apply text-slate-700 bg-white hover:bg-slate-50 border-slate-300 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600; }
                .btn-danger { @apply text-white bg-red-600 hover:bg-red-700 border-transparent focus:ring-red-500; }
                .form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300; }
                .form-input { @apply block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm; }
                .form-textarea { @apply block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y; }
                .form-checkbox { @apply h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-500 dark:bg-slate-700 dark:checked:bg-blue-600 dark:checked:border-transparent; }
                .form-select { @apply block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm; }
                .form-icon-wrapper { @apply relative; }
                .form-icon { @apply absolute left-3 top-1/2 -translate-y-1/2 text-slate-400; }
                .form-input-icon { @apply block w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm; }
                .form-error-text { @apply text-xs text-red-500 mt-1; }
                .pagination-btn { @apply p-2 rounded-md text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .separateur-colonne-leger:not(:last-child) {
                    box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.05);
                }
                .dark .separateur-colonne-leger:not(:last-child) {
                    box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.05);
                }
                /* Styles pour le surlignage des lignes ajoutées/modifiées */
                .highlight-row {
                    background-color: #e0f2fe !important; /* Bleu très clair */
                    transition: background-color 0.5s ease-out; /* Transition douce */
                }
                .dark .highlight-row {
                    background-color: #0b2f4f !important; /* Couleur plus sombre pour le mode sombre */
                }
            `}</style>

            {/* Modals */}
            {equipeToDelete && <DeleteConfirmationModal equipe={equipeToDelete} onConfirm={handleDeleteEquipe} onCancel={() => setEquipeToDelete(null)} />}
            {equipeToEdit && <EditEquipeModal equipe={equipeToEdit} onUpdate={handleUpdateEquipe} onCancel={() => { setEquipeToEdit(null); setToast({ message: "Modification d'équipe annulée.", type: 'info' }); }} onRefreshEquipes={fetchEquipesAndUsers} setToast={setToast} />}

            {/* Message de notification */}
            {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Titre de la page */}
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Gestion des Équipes</h1>

            {/* Barre de contrôles */}
            <div className="bg-white dark:bg-slate-800/80 px-4 py-0 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700 mb-0">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-grow max-w-xs">
                        <Search className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input pl-10 w-full" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap" ref={dropdownsRef}>
                        <button onClick={() => setView('add')} className="btn btn-primary h-full px-3"><Plus size={20} /></button>
                        <button onClick={fetchEquipesAndUsers} className="btn btn-secondary h-full px-3" title="Rafraîchir"><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /></button>
                        
                        <div className="relative">
                            <button onClick={() => toggleDropdownGlobal('filterChef')} className="btn btn-secondary">
                                <Filter size={16} className="mr-2" />
                                {filterChefId === 'tous' ? 'Filtrer par chef' : `Chef: ${allUsers.find(u => u.id?.toString() === filterChefId)?.prenom || 'N/A'}`}
                            </button>
                            {openDropdown === 'filterChef' &&
                                <DropdownMenu>
                                    <DropdownMenuItem isSelected={filterChefId === 'tous'} onClick={() => { setFilterChefId('tous'); toggleDropdownGlobal('filterChef'); }}>Tous les chefs</DropdownMenuItem>
                                    {allUsers.filter(u => u.role === 'C').map(user => ( // Filtrer seulement les chefs
                                        <DropdownMenuItem key={user.id} isSelected={filterChefId === user.id?.toString()} onClick={() => { setFilterChefId(user.id?.toString()); toggleDropdownGlobal('filterChef'); }}>{user.prenom} {user.nom}</DropdownMenuItem>
                                    ))}
                                </DropdownMenu>
                            }
                        </div>
                        <div className="relative">
                            <button onClick={() => toggleDropdownGlobal('filterActif')} className="btn btn-secondary">
                                <Filter size={16} className="mr-2" />
                                {filterActif === 'tous' ? 'Filtrer par statut' : `Statut: ${filterActif === 'true' ? 'Actives' : 'Inactives'}`}
                            </button>
                            {openDropdown === 'filterActif' &&
                                <DropdownMenu>
                                    <DropdownMenuItem isSelected={filterActif === 'tous'} onClick={() => { setFilterActif('tous'); toggleDropdownGlobal('filterActif'); }}>Tous les statuts</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filterActif === 'true'} onClick={() => { setFilterActif('true'); toggleDropdownGlobal('filterActif'); }}>Actives</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filterActif === 'false'} onClick={() => { setFilterActif('false'); toggleDropdownGlobal('filterActif'); }}>Inactives</DropdownMenuItem>
                                </DropdownMenu>
                            }
                        </div>
                        
                        <div className="relative"><button onClick={() => toggleDropdownGlobal('columns')} className="btn btn-secondary"><Eye size={16} className="mr-2" />Colonnes</button>
                            {openDropdown === 'columns' && <DropdownMenu>{Object.keys(visibleColumns).map(key => (<DropdownMenuItem key={key} onClick={() => handleToggleColumn(key)}>{visibleColumns[key] ? <Eye size={16} className="mr-2 text-blue-500" /> : <EyeOff size={16} className="mr-2 text-slate-400" />}<span className="capitalize">{key.replace(/([A-Z])/g, ' $1').replace('Datecreation', 'Date Création').replace('Chefequipe', 'Chef d\'équipe').replace('Membrescount', 'Membres').replace('CreePar', 'Créé par')}</span></DropdownMenuItem>))}</DropdownMenu>}
                        </div>
                        <div className="relative"><button onClick={() => toggleDropdownGlobal('entries')} className="btn btn-secondary">{entriesPerPage} / page</button>
                            {openDropdown === 'entries' && <DropdownMenu>{[10, 25, 50].map(num => (<DropdownMenuItem isSelected={entriesPerPage === num} key={num} onClick={() => { setEntriesPerPage(num); toggleDropdownGlobal('entries'); }}>{num} lignes</DropdownMenuItem>))}</DropdownMenu>}
                        </div>
                        <button
                            onClick={handlePrintEquipes}
                            className={`btn btn-secondary h-full px-3 ${!currentPrintFunction ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!currentPrintFunction}
                            title="Imprimer la page"
                        >
                            <Printer size={18} />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => toggleDropdownGlobal('export')}
                                className={`btn btn-secondary h-full px-3 btn-export-dropdown ${(!currentExportPdfFunction && !currentExportExcelFunction) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!currentExportPdfFunction && !currentExportExcelFunction}
                                title="Exporter"
                            >
                                <File size={18} />
                            </button>
                            {openDropdown === 'export' && (
                                <DropdownMenu align="right">
                                    <DropdownMenuItem onClick={handleExportPdfEquipes} disabled={!currentExportPdfFunction}>
                                        <File size={16} className="mr-2" /> Exporter en PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleExportExcelEquipes} disabled={!currentExportExcelFunction}>
                                        <FileSpreadsheet size={16} className="mr-2" /> Exporter en Excel
                                    </DropdownMenuItem>
                                </DropdownMenu>
                            )}
                        </div>
                        <button onClick={() => setViewMode(p => p === 'table' ? 'grid' : 'table')} className="btn btn-secondary h-full px-3" title="Changer de vue">
                            {viewMode === 'table' ? <LayoutGrid size={18} /> : <Rows3 size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenu Principal (Tableau ou Grille) */}
            {isLoading ? <Spinner /> : (
                processedEquipes.length === 0 ? (
                    <div className="text-center py-10 text-slate-600 dark:text-slate-400">Aucune équipe trouvée pour la sélection actuelle.</div>
                ) : (
                    viewMode === 'table' ? (
                        <div className="bg-white dark:bg-slate-800/80 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <TableHeader
                                        visibleColumns={visibleColumns}
                                        handleSort={handleSort}
                                        sortConfig={sortConfig}
                                    />
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {paginatedEquipes.map(equipe => (
                                            <EquipeTableRow
                                                key={equipe.id}
                                                equipe={equipe}
                                                onEdit={setEquipeToEdit}
                                                onDelete={setEquipeToDelete}
                                                visibleColumns={visibleColumns}
                                                highlightedEquipeId={highlightedEquipeId}
                                                // defaultProfilePic={defaultProfilePic} // Cette prop n'est plus nécessaire ici
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {processedEquipes.length > 0 &&
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    setCurrentPage={setCurrentPage}
                                    processedEquipes={processedEquipes}
                                    entriesPerPage={entriesPerPage}
                                />
                            }
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
                            {paginatedEquipes.map(equipe => (
                                <EquipeCard key={equipe.id} equipe={equipe} onEditRequest={setEquipeToEdit} onDeleteRequest={setEquipeToDelete} />
                            ))}
                        </div>
                    )
                )
            )}
        </div>
    );
};

export default ConsulterEquipesPage;