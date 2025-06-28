// src/pages/Admin/Clients/ConsulterClientPage.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Search, Plus, X, Filter, AlertTriangle, Save, XCircle, Settings2, Eye,
    EyeOff, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ArrowUpDown, RefreshCw, LayoutGrid, Rows3,
    Printer, File, FileSpreadsheet, Info, CheckCircle // Importez les icônes nécessaires ici
} from 'lucide-react';
import clientService from '../../../services/clientService'; // Assurez-vous que ce chemin est correct
import ClientTableRow from './ClientTableRow';
import ClientCard from './ClientCard'; // Assurez-vous que ce composant existe et est bien stylisé
import AjouterClientPage from './AjouterClientPage';
import { exportToPdf } from '../../../utils/exportPdf';
import { exportTableToExcel } from '../../../utils/exportExcel';
import { printHtmlContent } from '../../../utils/printContent';
import { useExport } from '../../../context/ExportContext'; // Importer useExport
import { formatDateFromArray } from '../../../utils/dateFormatter'; // Supposons que vos dates clients sont ISO strings

// --- Composants Modaux et Dropdowns (réutilisés de la page Postes) ---
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

const DeleteConfirmationModal = ({ client, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-md w-full">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Confirmer la suppression</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 my-2">Voulez-vous vraiment supprimer le client <strong className="font-semibold text-slate-800 dark:text-slate-200">"{client?.nomComplet}"</strong>?</p>
            <div className="flex justify-center space-x-3 mt-6">
                <button onClick={onCancel} className="btn btn-secondary">Annuler</button>
                <button onClick={onConfirm} className="btn btn-danger">Supprimer</button>
            </div>
        </div>
    </div>
);

// MODAL DE MODIFICATION POUR CLIENT (Adapté de EditClientModal.jsx)
const EditClientModal = ({ client, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({
        nomComplet: '',
        email: '',
        adress: '',
        region: '',
        actif: true,
    });
    const [error, setError] = useState(''); // Pour les erreurs de validation

    useEffect(() => {
        if (client) {
            setFormData({
                nomComplet: client.nomComplet || '',
                email: client.email || '',
                adress: client.adress || '',
                region: client.region || '',
                actif: client.actif ?? true,
            });
        }
    }, [client]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setError(''); // Effacer l'erreur lors de la modification
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nomComplet.trim()) {
            setError('Le nom complet est requis.');
            return;
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Veuillez saisir une adresse email valide.');
            return;
        }
        onUpdate(client.id, formData);
    };

    if (!client) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Modifier le Client</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Champ Nom Complet */}
                    <div>
                        <label htmlFor="edit-nomComplet" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Nom Complet
                        </label>
                        <input
                            type="text"
                            id="edit-nomComplet"
                            name="nomComplet"
                            value={formData.nomComplet}
                            onChange={handleInputChange}
                            className={`
                                block w-full px-3 py-2
                                bg-white dark:bg-slate-900/50
                                border rounded-md shadow-sm
                                placeholder-slate-400 dark:placeholder-slate-500
                                focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                                sm:text-sm
                                ${error && error.includes('nom complet') ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
                            `}
                        />
                        {error && error.includes('nom complet') && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>
                    {/* Champ Email */}
                    <div>
                        <label htmlFor="edit-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="edit-email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`
                                block w-full px-3 py-2
                                bg-white dark:bg-slate-900/50
                                border rounded-md shadow-sm
                                placeholder-slate-400 dark:placeholder-slate-500
                                focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                                sm:text-sm
                                ${error && error.includes('email') ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
                            `}
                        />
                        {error && error.includes('email') && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>
                    {/* Champ Région */}
                    <div>
                        <label htmlFor="edit-region" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Région
                        </label>
                        <input
                            type="text"
                            id="edit-region"
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    {/* Champ Adresse */}
                    <div>
                        <label htmlFor="edit-adress" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Adresse
                        </label>
                        <textarea
                            id="edit-adress"
                            name="adress"
                            value={formData.adress}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            rows="2"
                        ></textarea>
                    </div>
                    {/* Champ Actif (Checkbox) */}
                    <div className="flex items-center pt-2">
                        <input
                            type="checkbox"
                            id="edit-actif"
                            name="actif"
                            checked={formData.actif}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-500 dark:bg-slate-700 dark:checked:bg-blue-600 dark:checked:border-transparent"
                        />
                        <label htmlFor="edit-actif" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                            Actif
                        </label>
                    </div>
                    {/* Boutons d'action */}
                    <div className="pt-6 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onCancel} className="btn btn-secondary">
                            <XCircle size={16} className="mr-1.5" /> Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={16} className="mr-1.5" /> Confirmer
                        </button>
                    </div>
                </form>
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

// NOUVEAU: Composant TableHeader pour Client
const TableHeader = ({ visibleColumns, handleSort, sortConfig }) => {
    return (
        <thead className="text-sm text-black bg-sky-100 dark:bg-blue-200">
            <tr>
                {visibleColumns.nomComplet && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Nom Complet</th>}
                {visibleColumns.region && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Région</th>}
                {visibleColumns.email && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Email</th>}
                {visibleColumns.adress && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Adresse</th>}
                {visibleColumns.creePar && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Créé par</th>} {/* Déplacé avant Date de création */}
                {visibleColumns.dateCreation && (
                    <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">
                        <button onClick={() => handleSort('dateCreation')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Date de création</span> {/* Texte changé */}
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
const PaginationControls = ({ currentPage, totalPages, setCurrentPage, processedClients, entriesPerPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-6">
            <div className="text-sm text-slate-600 dark:text-slate-400">
                Affichage de <strong>{(currentPage - 1) * entriesPerPage + 1}</strong>-<strong>{Math.min(currentPage * entriesPerPage, processedClients.length)}</strong> sur <strong>{processedClients.length}</strong>
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


const ConsulterClientPage = () => {
    // --- STATE MANAGEMENT COMPLET ---
    const [view, setView] = useState('list');
    const [viewMode, setViewMode] = useState('table');
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [clientToEdit, setClientToEdit] = useState(null);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('tous'); // 'tous', 'actif', 'inactif'
    const [sortConfig, setSortConfig] = useState({ key: 'dateCreation', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [visibleColumns, setVisibleColumns] = useState({ nomComplet: true, region: true, email: true, adress: true, creePar: true, dateCreation: true, statut: true });
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownsRef = useRef(null);
    // NOUVEAU: États pour le surlignage et les messages de notification (adaptés pour les clients)
    const [highlightedClientId, setHighlightedClientId] = useState(null);
    const highlightClientRef = useRef(null); // Ref pour l'ID du client à surligner
    const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' | 'info' }

    // Récupérer les fonctions d'exportation depuis le contexte
    const { setExportFunctions, currentExportPdfFunction, currentExportExcelFunction, currentPrintFunction } = useExport();

    // --- LOGIQUE DE DONNÉES ET D'EFFETS ---
    const fetchClients = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await clientService.getAllClients();
            setClients(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Erreur lors de la récupération des clients:", err);
            setToast({ message: "Erreur lors du chargement des clients.", type: 'error' });
        }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        if (view === 'list') {
            fetchClients();
        }
    }, [view, fetchClients]);

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
        if (highlightedClientId) {
            const timer = setTimeout(() => {
                setHighlightedClientId(null);
            }, 4000); // 4 secondes comme demandé
            return () => clearTimeout(timer);
        }
    }, [highlightedClientId]);

    // Effet pour gérer l'affichage et la disparition du toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 3000); // Les messages toast disparaissent après 3 secondes
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // --- LOGIQUE D'AFFICHAGE (FILTRE, TRI, PAGINATION) ---
    const processedClients = useMemo(() => {
        let filtered = [...clients];
        
        // Filtre par statut
        if (filterStatus !== 'tous') {
            filtered = filtered.filter(c => (c.actif ? 'actif' : 'inactif') === filterStatus);
        }

        // Filtre par terme de recherche
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.region || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Tri
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                if (sortConfig.key === 'dateCreation') {
                    // Les dates clients sont des chaînes ISO, les convertir en Date pour la comparaison
                    const dateA = new Date(valA);
                    const dateB = new Date(valB);
                    valA = dateA.getTime();
                    valB = dateB.getTime();
                } else if (typeof valA === 'string' && typeof valB === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [clients, searchTerm, filterStatus, sortConfig]);

    // Effet pour gérer le surlignage et la pagination après la mise à jour de 'clients'
    useEffect(() => {
        if (highlightClientRef.current && Array.isArray(processedClients) && processedClients.length > 0) {
            const targetId = highlightClientRef.current;
            highlightClientRef.current = null;

            const targetClientIndex = processedClients.findIndex(c => c.id === targetId);

            if (targetClientIndex !== -1) {
                const calculatedTargetPage = Math.ceil((targetClientIndex + 1) / entriesPerPage);

                if (currentPage !== calculatedTargetPage) {
                    setCurrentPage(calculatedTargetPage);
                }

                requestAnimationFrame(() => {
                    setHighlightedClientId(targetId);
                });
            }
        }
    }, [processedClients, entriesPerPage, currentPage, setCurrentPage]);
    const TableHeader = ({ visibleColumns, handleSort, sortConfig }) => {
    return (
        <thead className="text-sm text-black bg-sky-100 dark:bg-blue-200">
            <tr>
                {visibleColumns.nomComplet && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Nom Complet</th>}{/* Pas d'espace ici */}
                {visibleColumns.region && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Région</th>}{/* Pas d'espace ici */}
                {visibleColumns.email && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Email</th>}{/* Pas d'espace ici */}
                {visibleColumns.adress && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Adresse</th>}{/* Pas d'espace ici */}
                {visibleColumns.creePar && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Créé par</th>}{/* Pas d'espace ici */}
                {visibleColumns.dateCreation && (
                    <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">
                        <button onClick={() => handleSort('dateCreation')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Date de création</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}{/* Pas d'espace ici */}
                {visibleColumns.statut && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Statut</th>}
                <th scope="col" className="px-6 py-3 font-sans text-center">Actions</th>
            </tr>
        </thead>
    );
};

    const totalPages = Math.ceil(processedClients.length / entriesPerPage);

    const paginatedClients = useMemo(() => {
        const startIndex = (currentPage - 1) * entriesPerPage;
        return processedClients.slice(startIndex, startIndex + entriesPerPage);
    }, [processedClients, currentPage, entriesPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [entriesPerPage, filterStatus, searchTerm]);

    // --- HANDLERS POUR LES ACTIONS CRUD ---
    const handleAddClient = async (clientData) => {
        try {
            const response = await clientService.createClient(clientData);
            setView('list');
            await fetchClients();
            const newClientId = response.data?.id;
            if (newClientId) {
                highlightClientRef.current = newClientId;
            }
            setToast({ message: "Client ajouté avec succès !", type: 'success' });
        } catch (err) {
            console.error("Erreur lors de l'ajout du client:", err);
            setToast({ message: err.response?.data?.message || "Erreur lors de l'ajout du client.", type: 'error' });
        }
    };

    const handleUpdateClient = async (id, clientData) => {
        try {
            await clientService.updateClient(id, clientData);
            setClientToEdit(null);
            await fetchClients();
            highlightClientRef.current = id;
            setToast({ message: "Client modifié avec succès !", type: 'success' });
        } catch (err) {
            console.error('Erreur de mise à jour:', err);
            setToast({ message: err.response?.data?.message || "Erreur lors de la modification du client.", type: 'error' });
        }
    };

    const handleDeleteClient = async () => {
        if (!clientToDelete) return;
        try {
            await clientService.deleteClient(clientToDelete.id);
            setClientToDelete(null);
            fetchClients();
            setToast({ message: "Client supprimé avec succès !", type: 'success' });
        } catch (err) {
            console.error('Erreur de suppression:', err);
            setClientToDelete(null);
            setToast({ message: err.response?.data?.message || "Erreur lors de la suppression du client.", type: 'error' });
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
    const pdfHeaders = useMemo(() => [['ID', 'Nom Complet', 'Email', 'Région', 'Adresse', 'Créé par', 'Date Création', 'Statut']], []);
    const pdfData = useMemo(() => processedClients.map(client => [
        client.id,
        client.nomComplet,
        client.email || 'N/A',
        client.region || 'N/A',
        client.adress || 'N/A',
        client.userCreation || 'N/A',
        formatDateFromArray(client.dateCreation), // Assurez-vous que formatDateFromArray gère les dates ISO
        client.actif ? 'Actif' : 'Non actif'
    ]), [processedClients]);

    const excelData = useMemo(() => {
        return processedClients.map(client => ({
            ID: client.id,
            'Nom Complet': client.nomComplet,
            'Email': client.email || 'N/A',
            'Région': client.region || 'N/A',
            'Adresse': client.adress || 'N/A',
            'Créé par': client.userCreation || 'N/A',
            'Date Création': formatDateFromArray(client.dateCreation),
            'Statut': client.actif ? 'Actif' : 'Inactif'
        }));
    }, [processedClients]);

    const handleExportPdfClients = useCallback(() => {
        exportToPdf('Liste des Clients', pdfHeaders, pdfData, 'liste_clients.pdf');
        setOpenDropdown(null);
    }, [pdfHeaders, pdfData]);

    const handleExportExcelClients = useCallback(() => {
        exportTableToExcel(pdfHeaders, pdfData, 'liste_clients.xlsx', 'Clients');
        setOpenDropdown(null);
    }, [pdfHeaders, pdfData]);

    const handlePrintClients = useCallback(() => {
        let tableHtml = `<h2 style="text-align:center; font-size: 24px; margin-bottom: 20px;">Liste des Clients</h2>
                         <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                                <tr style="background-color:#f2f2f2;">
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Nom Complet</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Email</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Région</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Adresse</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Créé par</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Date Création</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Statut</th>
                                </tr>
                            </thead>
                            <tbody>`;
        processedClients.forEach(client => {
            tableHtml += `<tr>
                            <td style="padding: 8px; border: 1px solid #ddd;">${client.id}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${client.nomComplet}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${client.email || 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${client.region || 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${client.adress || 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${client.userCreation || 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${formatDateFromArray(client.dateCreation)}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${client.actif ? 'Actif' : 'Non actif'}</td>
                          </tr>`;
        });
        tableHtml += `</tbody></table>`;
        printHtmlContent(tableHtml, 'Impression Liste des Clients');
        setOpenDropdown(null);
    }, [processedClients]);

    useEffect(() => {
        setExportFunctions(handleExportPdfClients, handleExportExcelClients, handlePrintClients);
        return () => {
            setExportFunctions(null, null, null);
        };
    }, [setExportFunctions, handleExportPdfClients, handleExportExcelClients, handlePrintClients]);

    // --- RENDU PRINCIPAL ---
    if (view === 'add') {
        return <AjouterClientPage onAddClient={handleAddClient} onCancel={() => { setView('list'); setToast({ message: "Ajout de client annulé.", type: 'info' }); }} />;
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
            {clientToDelete && <DeleteConfirmationModal client={clientToDelete} onConfirm={handleDeleteClient} onCancel={() => setClientToDelete(null)} />}
            {clientToEdit && <EditClientModal client={clientToEdit} onUpdate={handleUpdateClient} onCancel={() => { setClientToEdit(null); setToast({ message: "Modification de client annulée.", type: 'info' }); }} />}

            {/* Message de notification */}
            {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Titre de la page */}
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Gestion des Clients</h1>

            {/* Barre de contrôles */}
            <div className="bg-white dark:bg-slate-800/80 px-4 py-0 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700 mb-0">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-grow max-w-xs">
                        <Search className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input pl-10 w-full" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap" ref={dropdownsRef}>
                        <button onClick={() => setView('add')} className="btn btn-primary h-full px-3"><Plus size={20} /></button>
                        <button onClick={fetchClients} className="btn btn-secondary h-full px-3" title="Rafraîchir"><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /></button>
                        <div className="relative">
                            <button onClick={() => toggleDropdownGlobal('filter')} className="btn btn-secondary">
                                <Filter size={16} className="mr-2" />
                                {filterStatus === 'tous' ? 'Filtre' : `Filtre: ${filterStatus === 'actif' ? 'Actifs' : 'Non actifs'}`}
                            </button>
                            {openDropdown === 'filter' &&
                                <DropdownMenu>
                                    <DropdownMenuItem isSelected={filterStatus === 'tous'} onClick={() => { setFilterStatus('tous'); toggleDropdownGlobal('filter'); }}>Tous</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filterStatus === 'actif'} onClick={() => { setFilterStatus('actif'); toggleDropdownGlobal('filter'); }}>Actifs</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filterStatus === 'inactif'} onClick={() => { setFilterStatus('inactif'); toggleDropdownGlobal('filter'); }}>Non actifs</DropdownMenuItem>
                                </DropdownMenu>
                            }
                        </div>
                        <div className="relative"><button onClick={() => toggleDropdownGlobal('columns')} className="btn btn-secondary"><Eye size={16} className="mr-2" />Colonnes</button>
                            {openDropdown === 'columns' && <DropdownMenu>{Object.keys(visibleColumns).map(key => (<DropdownMenuItem key={key} onClick={() => handleToggleColumn(key)}>{visibleColumns[key] ? <Eye size={16} className="mr-2 text-blue-500" /> : <EyeOff size={16} className="mr-2 text-slate-400" />}<span className="capitalize">{key.replace(/([A-Z])/g, ' $1').replace('Nomcomplet', 'Nom Complet').replace('Datecreation', 'Date Création').replace('Creepar', 'Créé par')}</span></DropdownMenuItem>))}</DropdownMenu>}
                        </div>
                        <div className="relative"><button onClick={() => toggleDropdownGlobal('entries')} className="btn btn-secondary">{entriesPerPage} / page</button>
                            {openDropdown === 'entries' && <DropdownMenu>{[10, 25, 50].map(num => (<DropdownMenuItem isSelected={entriesPerPage === num} key={num} onClick={() => { setEntriesPerPage(num); toggleDropdownGlobal('entries'); }}>{num} lignes</DropdownMenuItem>))}</DropdownMenu>}
                        </div>
                        <button
                            onClick={handlePrintClients}
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
                                    <DropdownMenuItem onClick={handleExportPdfClients} disabled={!currentExportPdfFunction}>
                                        <File size={16} className="mr-2" /> Exporter en PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleExportExcelClients} disabled={!currentExportExcelFunction}>
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
                processedClients.length === 0 ? (
                    <div className="text-center py-10 text-slate-600 dark:text-slate-400">Aucun client trouvé pour la sélection actuelle.</div>
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
                                        {paginatedClients.map(client => (
                                            <ClientTableRow
                                                key={client.id}
                                                client={client}
                                                onEdit={setClientToEdit}
                                                onDelete={setClientToDelete}
                                                visibleColumns={visibleColumns}
                                                highlightedClientId={highlightedClientId}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {processedClients.length > 0 &&
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    setCurrentPage={setCurrentPage}
                                    processedClients={processedClients}
                                    entriesPerPage={entriesPerPage}
                                />
                            }
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
                            {paginatedClients.map(client => (
                                <ClientCard key={client.id} client={client} onEditRequest={setClientToEdit} onDeleteRequest={setClientToDelete} />
                            ))}
                        </div>
                    )
                )
            )}
        </div>
    );
};
export default ConsulterClientPage;