// src/components/admin/Utilisateurs/ConsulterUsersPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Search, Plus, X, Filter, AlertTriangle, Save, XCircle, Settings2, Eye,
    EyeOff, ChevronLeft, ChevronRight, ArrowUpDown, RefreshCw, LayoutGrid, Rows3,
    Printer, File, FileSpreadsheet, Info, CheckCircle, UserPlus, Users // Ajout de Users pour le select de rôle
} from 'lucide-react';

import utilisateurService from '../../../services/utilisateurService';
import AjouterUserPage from './AjouterUserPage';
import UsersCard from './UsersCard';
import UsersTableRow from './UsersTableRow';
import EditUserModal from './EditUserModal';
import { formatDateFromArray } from '../../../utils/dateFormatter'; // Assurez-vous que formatDateFromArray est correct

import { exportToPdf } from '../../../utils/exportPdf';
import { exportTableToExcel } from '../../../utils/exportExcel';
import { printHtmlContent } from '../../../utils/printContent';
import { useExport } from '../../../context/ExportContext';

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

const DeleteConfirmationModal = ({ user, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-md w-full">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Confirmer la suppression</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 my-2">Voulez-vous vraiment supprimer l'utilisateur <strong className="font-semibold text-slate-800 dark:text-slate-200">"{user?.prenom} {user?.nom}"</strong>?</p>
            <div className="flex justify-center space-x-3 mt-6">
                <button onClick={onCancel} className="btn btn-secondary">Annuler</button>
                <button onClick={onConfirm} className="btn btn-danger">Supprimer</button>
            </div>
        </div>
    </div>
);

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

// Composant TableHeader pour Users
const TableHeader = ({ visibleColumns, handleSort, sortConfig }) => {
    return (
        <thead className="text-sm text-black bg-sky-100 dark:bg-blue-200">
            <tr>
                {visibleColumns.utilisateur && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Utilisateur</th>}
                {visibleColumns.email && (
                    <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">
                        <button onClick={() => handleSort('email')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Email</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}
                {visibleColumns.role && (
                    <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">
                        <button onClick={() => handleSort('role')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Rôle</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}
                {visibleColumns.equipeEtPoste && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Équipe et Poste</th>}
                {visibleColumns.creePar && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Créé par</th>}
                {visibleColumns.dateCreation && (
                    <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">
                        <button onClick={() => handleSort('dateCreation')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Date de création</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}
                {visibleColumns.statut && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Statut</th>}
                <th scope="col" className="px-6 py-3 font-sans text-center">Actions</th>
            </tr>
        </thead>
    );
};

// Composant PaginationControls - Réutilisé
const PaginationControls = ({ currentPage, totalPages, setCurrentPage, processedUsers, entriesPerPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-6">
            <div className="text-sm text-slate-600 dark:text-slate-400">
                Affichage de <strong>{(currentPage - 1) * entriesPerPage + 1}</strong>-<strong>{Math.min(currentPage * entriesPerPage, processedUsers.length)}</strong> sur <strong>{processedUsers.length}</strong>
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


// --- MAIN COMPONENT ---
const ConsulterUsersPage = ({ initialUsers = null }) => {
    // --- STATE MANAGEMENT COMPLET ---
    const [view, setView] = useState('list');
    const [viewMode, setViewMode] = useState('table');
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userToEdit, setUserToEdit] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ role: 'tous', actif: 'tous' }); // 'tous', 'A', 'C', 'E' pour rôle; 'tous', 'true', 'false' pour actif
    const [sortConfig, setSortConfig] = useState({ key: 'dateCreation', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    // Mise à jour des colonnes visibles
    const [visibleColumns, setVisibleColumns] = useState({ utilisateur: true, email: true, role: true, equipeEtPoste: true, creePar: true, dateCreation: true, statut: true });
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownsRef = useRef(null);
    // NOUVEAU: États pour le surlignage et les messages de notification
    const [highlightedUserId, setHighlightedUserId] = useState(null);
    const highlightUserRef = useRef(null); // Ref pour l'ID de l'utilisateur à surligner
    const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' | 'info' }

    // Récupérer les fonctions d'exportation depuis le contexte
    const { setExportFunctions, currentExportPdfFunction, currentExportExcelFunction, currentPrintFunction } = useExport();


    // --- LOGIQUE DE DONNÉES ET D'EFFETS ---
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await utilisateurService.getAllUtilisateurs(); // Pas de filtre direct ici pour getAll
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
            setToast({ message: 'Erreur lors du chargement des utilisateurs.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view === 'list') {
            if (initialUsers) {
                setUsers(initialUsers);
                setIsLoading(false);
            } else {
                fetchUsers();
            }
        }
    }, [view, fetchUsers, initialUsers]);

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
        if (highlightedUserId) {
            const timer = setTimeout(() => {
                setHighlightedUserId(null);
            }, 4000); // 4 secondes
            return () => clearTimeout(timer);
        }
    }, [highlightedUserId]);

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
    const processedUsers = useMemo(() => {
        let filtered = [...users];

        // Filtre par rôle
        if (filters.role !== 'tous') {
            filtered = filtered.filter(user => user.role === filters.role);
        }

        // Filtre par statut actif/inactif
        if (filters.actif !== 'tous') {
            const isActive = filters.actif === 'true';
            filtered = filtered.filter(user => user.actif === isActive);
        }

        // Filtre par terme de recherche
        if (searchTerm) {
            filtered = filtered.filter(user =>
                (user.prenom?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.nom?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.login?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Tri
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let valA, valB;

                switch (sortConfig.key) {
                    case 'dateCreation':
                        // Assurez-vous que les dates sont des objets Date pour la comparaison
                        const dateA = Array.isArray(a.dateCreation) ? new Date(a.dateCreation[0], a.dateCreation[1] - 1, a.dateCreation[2]) : new Date(a.dateCreation);
                        const dateB = Array.isArray(b.dateCreation) ? new Date(b.dateCreation[0], b.dateCreation[1] - 1, b.dateCreation[2]) : new Date(b.dateCreation);
                        valA = dateA.getTime();
                        valB = dateB.getTime();
                        break;
                    case 'utilisateur': // Tri par nom complet
                        valA = `${a.prenom} ${a.nom}`.toLowerCase();
                        valB = `${b.prenom} ${b.nom}`.toLowerCase();
                        break;
                    case 'role':
                        valA = a.role.toLowerCase();
                        valB = b.role.toLowerCase();
                        break;
                    case 'email': // Tri par email
                        valA = (a.email || '').toLowerCase();
                        valB = (b.email || '').toLowerCase();
                        break;
                    case 'statut':
                        valA = a.actif;
                        valB = b.actif;
                        break;
                    case 'creePar': // Tri par créateur (si applicable)
                         valA = (a.userCreation || '').toLowerCase();
                         valB = (b.userCreation || '').toLowerCase();
                         break;
                    default:
                        valA = (a[sortConfig.key] || '').toLowerCase();
                        valB = (b[sortConfig.key] || '').toLowerCase();
                }
                
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [users, searchTerm, filters, sortConfig]);

    // Effet pour gérer le surlignage et la pagination après la mise à jour de 'users'
    useEffect(() => {
        if (highlightUserRef.current && Array.isArray(processedUsers) && processedUsers.length > 0) {
            const targetId = highlightUserRef.current;
            highlightUserRef.current = null;

            const targetUserIndex = processedUsers.findIndex(u => u.id === targetId);

            if (targetUserIndex !== -1) {
                const calculatedTargetPage = Math.ceil((targetUserIndex + 1) / entriesPerPage);

                if (currentPage !== calculatedTargetPage) {
                    setCurrentPage(calculatedTargetPage);
                }

                requestAnimationFrame(() => {
                    setHighlightedUserId(targetId);
                });
            }
        }
    }, [processedUsers, entriesPerPage, currentPage, setCurrentPage]);

    const totalPages = Math.ceil(processedUsers.length / entriesPerPage);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * entriesPerPage;
        return processedUsers.slice(startIndex, startIndex + entriesPerPage);
    }, [processedUsers, currentPage, entriesPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [entriesPerPage, filters, searchTerm]); // Réinitialiser la page si les filtres ou la recherche changent

    // --- HANDLERS POUR LES ACTIONS CRUD ---
     const handleAddUser = async (userData, photoFile) => {
        try {
            const response = await utilisateurService.createUtilisateur(userData, photoFile);
            setView('list');
            await fetchUsers(); // Rafraîchit les données
            const newUserId = response.data?.id;
            if (newUserId) {
                highlightUserRef.current = newUserId;
            }
            setToast({ message: 'Utilisateur ajouté avec succès !', type: 'success' });
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'utilisateur:", error);
            setToast({ message: error.response?.data?.message || "Erreur lors de l'ajout de l'utilisateur.", type: 'error' });
        }
    };
    
    const handleUpdateUser = async (id, userData, photoFile) => {
        try {
            switch (userData.role) {
                case "A":
                    userData.role = "A";
                    break // Convertit le rôle en code
                case "C":
                    userData.role = "C";
                    break // Convertit le rôle en code
                case "E":
                    userData.role = "E"; // Convertit le rôle en code
                    break;
            
                default:
                    userData.role = ""; // Défaut à Utilisateur si le rôle n'est pas reconnu
                    break;
            }
            console.log("Mise à jour de l'utilisateur avec ID:", id, "et données:", userData);
            await utilisateurService.updateUtilisateur(id, userData, photoFile);
            setUserToEdit(null);
            await fetchUsers(); // Rafraîchit les données
            highlightUserRef.current = id;
            setToast({ message: 'Utilisateur mis à jour avec succès !', type: 'success' });
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
            setToast({ message: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur.', type: 'error' });
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await utilisateurService.deleteUtilisateur(userToDelete.id);
            setToast({ message: 'Utilisateur supprimé avec succès !', type: 'success' });
            setUserToDelete(null);
            fetchUsers(); // Rafraîchit la liste
        } catch (error) {
            console.error('Erreur de suppression:', error);
            setToast({ message: error.response?.data?.error || 'Impossible de supprimer l\'utilisateur.', type: 'error' });
            setUserToDelete(null);
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
    const pdfHeaders = useMemo(() => [['ID', 'Nom Complet', 'Email', 'Rôle', 'Équipes / Postes', 'Créé par', 'Date Création', 'Statut']], []);
    const pdfData = useMemo(() => processedUsers.map(user => [
        user.id,
        `${user.prenom} ${user.nom}`,
        user.email,
        user.role,
        user.equipePosteSet?.map(ep => `${ep.equipe?.designation || 'N/A'} (${ep.poste?.designation || 'N/A'})`).join(', ') || 'N/A', // Formatage amélioré
        user.userCreation || 'N/A',
        formatDateFromArray(user.dateCreation),
        user.actif ? 'Actif' : 'Non actif'
    ]), [processedUsers]);

    const excelData = useMemo(() => {
        return processedUsers.map(user => ({
            ID: user.id,
            'Nom Complet': `${user.prenom} ${user.nom}`,
            'Email': user.email,
            'Rôle': user.role,
            'Équipes / Postes': user.equipePosteSet?.map(ep => `${ep.equipe?.designation || 'N/A'} (${ep.poste?.designation || 'N/A'})`).join(', ') || 'N/A', // Formatage amélioré
            'Créé par': user.userCreation || 'N/A',
            'Date Création': formatDateFromArray(user.dateCreation),
            'Statut': user.actif ? 'Actif' : 'Inactif'
        }));
    }, [processedUsers]);

    const handleExportPdfUsers = useCallback(() => {
        exportToPdf('Liste des Utilisateurs', pdfHeaders, pdfData, 'liste_utilisateurs.pdf');
        setOpenDropdown(null);
    }, [pdfHeaders, pdfData]);

    const handleExportExcelUsers = useCallback(() => {
        exportTableToExcel(pdfHeaders, pdfData, 'liste_utilisateurs.xlsx', 'Utilisateurs');
        setOpenDropdown(null);
    }, [pdfHeaders, pdfData]);

    const handlePrintUsers = useCallback(() => {
        let tableHtml = `<h2 style="text-align:center; font-size: 24px; margin-bottom: 20px;">Liste des Utilisateurs</h2>
                         <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                                <tr style="background-color:#f2f2f2;">
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Nom Complet</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Email</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Rôle</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Équipes / Postes</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Créé par</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Date Création</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Statut</th>
                                </tr>
                            </thead>
                            <tbody>`;
        processedUsers.forEach(user => {
            const equipesPostesStr = user.equipePosteSet?.map(ep => `${ep.equipe?.designation || 'N/A'} (${ep.poste?.designation || 'N/A'})`).join(', ') || 'N/A';
            tableHtml += `<tr>
                            <td style="padding: 8px; border: 1px solid #ddd;">${user.id}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${user.prenom} ${user.nom}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${user.email}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${user.role}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${equipesPostesStr}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${user.userCreation || 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${formatDateFromArray(user.dateCreation)}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${user.actif ? 'Actif' : 'Non actif'}</td>
                          </tr>`;
        });
        tableHtml += `</tbody></table>`;
        printHtmlContent(tableHtml, 'Impression Liste des Utilisateurs');
        setOpenDropdown(null);
    }, [processedUsers]);

    useEffect(() => {
        setExportFunctions(handleExportPdfUsers, handleExportExcelUsers, handlePrintUsers);
        return () => {
            setExportFunctions(null, null, null);
        };
    }, [setExportFunctions, handleExportPdfUsers, handleExportExcelUsers, handlePrintUsers]);


    // --- RENDU PRINCIPAL ---
    if (view === 'add') {
        return <AjouterUserPage onAddUser={handleAddUser} onCancel={() => { setView('list'); setToast({ message: "Ajout d'utilisateur annulé.", type: 'info' }); }} />;
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
            {userToDelete && <DeleteConfirmationModal user={userToDelete} onConfirm={handleDeleteUser} onCancel={() => setUserToDelete(null)} />}
            {userToEdit && <EditUserModal user={userToEdit} onUpdateUser={handleUpdateUser} onCancel={() => { setUserToEdit(null); setToast({ message: "Modification d'utilisateur annulée.", type: 'info' }); }} />}

            {/* Message de notification */}
            {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Titre de la page */}
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Gestion des Utilisateurs</h1>

            {/* Barre de contrôles */}
            <div className="bg-white dark:bg-slate-800/80 px-4 py-0 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700 mb-0">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-grow max-w-xs">
                        <Search className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input pl-10 w-full" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap" ref={dropdownsRef}>
                        <button onClick={() => setView('add')} className="btn btn-primary h-full px-3"><Plus size={20} /></button>
                        <button onClick={fetchUsers} className="btn btn-secondary h-full px-3" title="Rafraîchir"><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /></button>
                        
                        <div className="relative">
                            <button onClick={() => toggleDropdownGlobal('filterRole')} className="btn btn-secondary">
                                <Filter size={16} className="mr-2" />
                                {filters.role === 'tous' ? 'Filtrer par rôle' : `Rôle: ${filters.role === 'A' ? 'Admin' : filters.role === 'C' ? 'Chef' : 'Utilisateur'}`}
                            </button>
                            {openDropdown === 'filterRole' &&
                                <DropdownMenu>
                                    <DropdownMenuItem isSelected={filters.role === 'tous'} onClick={() => { setFilters(f => ({...f, role: 'tous'})); toggleDropdownGlobal('filterRole'); }}>Tous les rôles</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.role === 'A'} onClick={() => { setFilters(f => ({...f, role: 'A'})); toggleDropdownGlobal('filterRole'); }}>Administrateur</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.role === 'C'} onClick={() => { setFilters(f => ({...f, role: 'C'})); toggleDropdownGlobal('filterRole'); }}>Chef d'équipe</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.role === 'E'} onClick={() => { setFilters(f => ({...f, role: 'E'})); toggleDropdownGlobal('filterRole'); }}>Utilisateur</DropdownMenuItem>
                                </DropdownMenu>
                            }
                        </div>
                        <div className="relative">
                            <button onClick={() => toggleDropdownGlobal('filterActif')} className="btn btn-secondary">
                                <Filter size={16} className="mr-2" />
                                {filters.actif === 'tous' ? 'Filtrer par statut' : `Statut: ${filters.actif === 'true' ? 'Actifs' : 'Inactifs'}`}
                            </button>
                            {openDropdown === 'filterActif' &&
                                <DropdownMenu>
                                    <DropdownMenuItem isSelected={filters.actif === 'tous'} onClick={() => { setFilters(f => ({...f, actif: 'tous'})); toggleDropdownGlobal('filterActif'); }}>Tous les statuts</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.actif === 'true'} onClick={() => { setFilters(f => ({...f, actif: 'true'})); toggleDropdownGlobal('filterActif'); }}>Actifs</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.actif === 'false'} onClick={() => { setFilters(f => ({...f, actif: 'false'})); toggleDropdownGlobal('filterActif'); }}>Inactifs</DropdownMenuItem>
                                </DropdownMenu>
                            }
                        </div>
                        
                        <div className="relative"><button onClick={() => toggleDropdownGlobal('columns')} className="btn btn-secondary"><Eye size={16} className="mr-2" />Colonnes</button>
                            {openDropdown === 'columns' && <DropdownMenu>{Object.keys(visibleColumns).map(key => (<DropdownMenuItem key={key} onClick={() => handleToggleColumn(key)}>{visibleColumns[key] ? <Eye size={16} className="mr-2 text-blue-500" /> : <EyeOff size={16} className="mr-2 text-slate-400" />}<span className="capitalize">{key.replace(/([A-Z])/g, ' $1').replace('Datecreation', 'Date Création').replace('Equipeetposte', 'Équipe et Poste').replace('CreePar', 'Créé par')}</span></DropdownMenuItem>))}</DropdownMenu>}
                        </div>
                        <div className="relative"><button onClick={() => toggleDropdownGlobal('entries')} className="btn btn-secondary">{entriesPerPage} / page</button>
                            {openDropdown === 'entries' && <DropdownMenu>{[10, 25, 50].map(num => (<DropdownMenuItem isSelected={entriesPerPage === num} key={num} onClick={() => { setEntriesPerPage(num); toggleDropdownGlobal('entries'); }}>{num} lignes</DropdownMenuItem>))}</DropdownMenu>}
                        </div>
                        <button
                            onClick={handlePrintUsers}
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
                                    <DropdownMenuItem onClick={handleExportPdfUsers} disabled={!currentExportPdfFunction}>
                                        <File size={16} className="mr-2" /> Exporter en PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleExportExcelUsers} disabled={!currentExportExcelFunction}>
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
                processedUsers.length === 0 ? (
                    <div className="text-center py-10 text-slate-600 dark:text-slate-400">Aucun utilisateur trouvé pour la sélection actuelle.</div>
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
                                        {paginatedUsers.map(user => (
                                            <UsersTableRow
                                                key={user.id}
                                                user={user}
                                                onEdit={setUserToEdit}
                                                onDelete={setUserToDelete}
                                                visibleColumns={visibleColumns}
                                                highlightedUserId={highlightedUserId}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {processedUsers.length > 0 &&
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    setCurrentPage={setCurrentPage}
                                    processedUsers={processedUsers}
                                    entriesPerPage={entriesPerPage}
                                />
                            }
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
                            {paginatedUsers.map(user => (
                                <UsersCard key={user.id} user={user} onEdit={setUserToEdit} onDelete={setUserToDelete} />
                            ))}
                        </div>
                    )
                )
            )}
        </div>
    );
};
export default ConsulterUsersPage;