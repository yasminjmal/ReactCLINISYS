// src/components/admin/Tickets/TicketsManagementPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Search, PlusCircle, RefreshCw, Filter, AlertTriangle, Save, XCircle, Settings2, Eye,
    EyeOff, ChevronLeft, ChevronRight, ArrowUpDown, Printer, File, FileSpreadsheet, Info, CheckCircle, GitFork, X
} from 'lucide-react';

// --- Services ---
// Importation des services API pour interagir avec le backend
import ticketService from '../../../services/ticketService';
import clientService from '../../../services/clientService';
import utilisateurService from '../../../services/utilisateurService';
import moduleService from '../../../services/moduleService';

// --- Utilitaires ---
// Importation des fonctions utilitaires pour l'exportation et le formatage
import { exportToPdf } from '../../../utils/exportPdf';
import { exportTableToExcel } from '../../../utils/exportExcel';
import { printHtmlContent } from '../../../utils/printContent';
import { useExport } from '../../../context/ExportContext'; // Contexte pour les fonctions d'exportation globales
import { formatDateFromArray } from '../../../utils/dateFormatter'; // Utilitaire de formatage de date

// --- Sous-composants ---
// Importation des composants enfants spécifiques aux tickets
import TicketTableRow from './TicketTableRow';
import TicketDetailPage from './TicketDetailPage';
import TicketUpdateView from './TicketUpdateView';
import AddTicketModal from './AddTicketModal';

// --- Composants UI Internes (Standardisés) ---
// Composant Spinner pour indiquer un chargement
const Spinner = () => <div className="text-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div></div>;

const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';

    let date;

    if (Array.isArray(dateInput) && dateInput.length >= 3) {
        const [year, month, day, hours = 0, minutes = 0, seconds = 0] = dateInput;
        date = new Date(year, month - 1, day, hours, minutes, seconds);
    } else {
        // ISO 8601 string like "2025-07-04T00:00:00"
        date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) {
        console.error('Invalid date input:', dateInput);
        return 'Date invalide';
    }

    return date.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

// Composant ToastMessage pour afficher des notifications
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

// Composant DropdownMenu pour les menus déroulants
const DropdownMenu = ({ children, align = 'right' }) => (
    <div className={`absolute top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg z-20 py-1 border border-slate-200 dark:border-slate-700 ${align === 'right' ? 'right-0' : 'left-0'}`}>
        {children}
    </div>
);

// Composant pour les titres de section dans un Dropdown
const DropdownSectionTitle = ({ children }) => (
    <div className="px-4 py-2 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 mt-2 first:mt-0">
        {children}
    </div>
);

// Composant pour un élément de menu dans un Dropdown
const DropdownMenuItem = ({ children, onClick, isSelected, disabled }) => (
    <button onClick={onClick} disabled={disabled} className={`w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 ${isSelected ? 'font-bold text-blue-600' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {children}
    </button>
);

// Composant TableHeader pour l'en-tête du tableau des tickets
const TableHeader = ({ visibleColumns, handleSort, sortConfig }) => {
    return (
        <thead className="text-sm text-black bg-sky-100 dark:bg-blue-200">
            <tr>
                {/* Colonne "ST" (Sub-Tickets) - toujours visible */}
                <th scope="col" className="px-1 py-3 font-sans text-center separateur-colonne-leger" style={{ width: '40px' }}>ST</th>
                {/* Colonnes conditionnellement visibles basées sur 'visibleColumns' */}
                {visibleColumns.client && (
                    <th scope="col" className="px-3 py-2 font-sans text-left separateur-colonne-leger" style={{ width: '12%' }}>
                        <span>Client</span>
                    </th>
                )}
                {visibleColumns.demandeur && (
                    <th scope="col" className="px-1 py-2 font-sans text-left separateur-colonne-leger" style={{ width: '10%' }}>
                        <span>Demandeur</span>
                    </th>
                )}
                {visibleColumns.titre && (
                    <th scope="col" className="px-2 py-2 font-sans text-left separateur-colonne-leger" style={{ width: '20%' }}>
                        {/* Bouton de tri pour la colonne 'Titre' */}
                        <button onClick={() => handleSort('titre')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Titre</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}
                {visibleColumns.module && (
                    <th scope="col" className="px-4 py-2 font-sans text-left separateur-colonne-leger" style={{ width: '18%' }}>
                        <span>Module</span>
                    </th>
                )}
                {visibleColumns.affecteA && (
                    <th scope="col" className="px-4 py-3 font-sans text-left separateur-colonne-leger" style={{ width: '10%' }}>
                        <span>Affecté à</span>
                    </th>
                )}
                {visibleColumns.dateEcheance && (
                    <th scope="col" className="px-4 py-3 font-sans text-left separateur-colonne-leger" style={{ width: '10%' }}>
                        {/* Bouton de tri pour la colonne 'Date Échéance' */}
                        <button onClick={() => handleSort('date_echeance')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Date Échéance</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}
                {visibleColumns.dateCreation && (
                    <th scope="col" className="px-4 py-3 font-sans text-left separateur-colonne-leger" style={{ width: '10%' }}>
                        {/* Bouton de tri pour la colonne 'Date de Création' */}
                        <button onClick={() => handleSort('dateCreation')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Date de Création</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}
                {visibleColumns.priorite && (
                    <th scope="col" className="px-1 py-3 font-sans text-left separateur-colonne-leger" style={{ width: '8%' }}>
                        <span>Priorité</span>
                    </th>
                )}
                {visibleColumns.statut && (
                    <th scope="col" className="px-2 py-3 font-sans text-left separateur-colonne-leger" style={{ width: '8%' }}>
                        <span>Statut</span>
                    </th>
                )}
                {visibleColumns.actif && (
                    <th scope="col" className="px-1 py-1 font-sans text-left separateur-colonne-leger" style={{ width: '6%' }}>
                        <span>Actif</span>
                    </th>
                )}
                {/* Colonne 'Actions' - toujours visible */}
                <th scope="col" className="px-4 py-3 font-sans text-center" style={{ width: '100px' }}>Actions</th>
            </tr>
        </thead>
    );
};

// Composant PaginationControls pour la navigation entre les pages
const PaginationControls = ({ currentPage, totalPages, setCurrentPage, processedTickets, entriesPerPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-6">
            <div className="text-sm text-slate-600 dark:text-slate-400">
                Affichage de <strong>{(currentPage - 1) * entriesPerPage + 1}</strong>-<strong>{Math.min(currentPage * entriesPerPage, processedTickets.length)}</strong> sur <strong>{processedTickets.length}</strong>
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


// Composant principal de la page de gestion des tickets
const TicketsManagementPage = () => {
    // --- State Hooks ---
    const [tickets, setTickets] = useState([]); // Liste des tickets principaux
    const [isLoading, setIsLoading] = useState(true); // État de chargement
    const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche
    const [activeModal, setActiveModal] = useState(null); // Gère quelle modale est ouverte ('add', 'details', 'update')

    // Données de référence (clients, utilisateurs, modules) pour les filtres et formulaires
    const [allClients, setAllClients] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allModules, setAllModules] = useState([]);

    const [selectedTicketIdForDetails, setSelectedTicketIdForDetails] = useState(null); // ID du ticket pour afficher les détails

    // Gère la vue actuelle (liste, mise à jour d'un ticket)
    const [currentView, setCurrentView] = useState({ view: 'list', ticketId: null });

    // Gère l'expansion/réduction des lignes de tickets (pour les sous-tickets)
    const [expandedRows, setExpandedRows] = useState({});
    const toggleRowExpansion = (ticketId) => {
        setExpandedRows(prev => ({ ...prev, [ticketId]: !prev[ticketId] }));
    };

    // Filtres appliqués au tableau des tickets
    const [filters, setFilters] = useState({
        priorite: 'tous',
        statue: 'tous',
        actif: 'tous', // Nouveau filtre pour l'état "Actif"
        client: 'tous',
        affecteA: 'tous',
        module: 'tous'
    });
    // Configuration du tri (colonne et direction)
    const [sortConfig, setSortConfig] = useState({ key: 'dateCreation', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1); // Page actuelle de la pagination
    const [entriesPerPage, setEntriesPerPage] = useState(10); // Nombre d'entrées par page
    // Visibilité des colonnes du tableau
    const [visibleColumns, setVisibleColumns] = useState({
        client: true,
        demandeur: true,
        titre: true,
        module: true,
        affecteA: true,
        dateEcheance: true,
        dateCreation: true,
        priorite: true,
        statut: true,
        actif: true // Visibilité de la colonne "Actif"
    });
    const [openDropdown, setOpenDropdown] = useState(null); // Gère quel dropdown est ouvert
    const dropdownsRef = useRef(null); // Ref pour détecter les clics en dehors des dropdowns
    const [highlightedTicketId, setHighlightedTicketId] = useState(null); // ID du ticket à surligner temporairement
    const highlightTicketRef = useRef(null); // Ref pour garder l'ID du ticket à surligner après un rechargement
    const [toast, setToast] = useState(null); // Gère l'affichage des messages toast

    // Contexte d'exportation pour enregistrer les fonctions d'exportation
    const { setExportFunctions, currentExportPdfFunction, currentExportExcelFunction, currentPrintFunction } = useExport();


    // --- Fonctions de Récupération des Données ---
    // useCallback pour mémoriser la fonction et éviter des recréations inutiles
    const fetchAllNecessaryData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Récupération parallèle de toutes les données nécessaires
            const [ticketsRes, clientsRes, usersRes, modulesRes] = await Promise.all([
                ticketService.getAllParentTickets(), // Récupère uniquement les tickets parents
                clientService.getAllClients(),
                utilisateurService.getAllUtilisateurs(),
                moduleService.getAllModules(),
            ]);
            setTickets(ticketsRes);
            setAllClients(clientsRes.data || []);
            setAllUsers(usersRes.data || []);
            setAllModules(modulesRes.data || []);
        } catch (error) {
            console.error("Erreur chargement données:", error);
            // Affichage d'un message d'erreur plus détaillé
            setToast({ message: error.response?.data?.message || error.message || "Erreur de chargement des données.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [setToast]); // Dépendance à setToast pour que la fonction soit stable

    // Effet pour charger les données au montage du composant
    useEffect(() => {
        fetchAllNecessaryData();
    }, [fetchAllNecessaryData]); // Dépendance à fetchAllNecessaryData

    // Effet pour gérer les clics en dehors des dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownsRef.current && !dropdownsRef.current.contains(event.target)) {
                // Vérifie si le clic n'est pas sur un bouton d'exportation pour éviter de fermer prématurément
                const isExportButton = event.target.closest('.btn-export-dropdown');
                if (!isExportButton) {
                    setOpenDropdown(null);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Effet pour gérer la disparition du surlignage des tickets
    useEffect(() => {
        if (highlightedTicketId) {
            const timer = setTimeout(() => {
                setHighlightedTicketId(null);
            }, 4000); // Surlignage disparaît après 4 secondes
            return () => clearTimeout(timer);
        }
    }, [highlightedTicketId]);

    // Effet pour gérer la disparition des messages toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 3000); // Toast disparaît après 3 secondes
            return () => clearTimeout(timer);
        }
    }, [toast]);


    // --- Logique de Traitement des Tickets (Filtrage et Tri) ---
    // useMemo pour mémoriser les résultats du filtrage/tri et éviter des calculs coûteux
    const processedTickets = useMemo(() => {
        // Commence par filtrer les tickets parents (ceux qui n'ont pas d'idParentTicket)
        let filtered = tickets.filter(t => !t.idParentTicket);

        // Application du filtre de recherche par terme
        if (searchTerm) {
            filtered = filtered.filter(t =>
                (t.titre?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (t.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (t.idClient?.nomComplet?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (t.userCreation?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        // Application des filtres de priorité, statut, actif, client, affecté à, module
        if (filters.priorite !== 'tous') {
            filtered = filtered.filter(t => t.priorite?.toLowerCase() === filters.priorite.toLowerCase());
        }
        if (filters.statue !== 'tous') {
            filtered = filtered.filter(t => t.statue?.toLowerCase() === filters.statue.toLowerCase());
        }
        // NOUVEAU: Filtrage par statut "Actif"
        if (filters.actif !== 'tous') {
            const isActiveFilter = filters.actif === 'actif';
            filtered = filtered.filter(t => t.actif === isActiveFilter);
        }
        if (filters.client !== 'tous') {
            filtered = filtered.filter(t => t.idClient?.id?.toString() === filters.client);
        }
        if (filters.affecteA !== 'tous') {
            filtered = filtered.filter(t => t.idUtilisateur?.id?.toString() === filters.affecteA);
        }
        if (filters.module !== 'tous') {
            filtered = filtered.filter(t => t.idModule?.id?.toString() === filters.module);
        }

        // Application du tri
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let valA, valB;

                switch (sortConfig.key) {
                    case 'titre':
                        valA = (a.titre || '').toLowerCase();
                        valB = (b.titre || '').toLowerCase();
                        break;
                    case 'priorite':
                        // Ordre personnalisé pour la priorité
                        const priorityOrder = { 'haute': 3, 'moyenne': 2, 'basse': 1 };
                        valA = priorityOrder[a.priorite?.toLowerCase()] || 0;
                        valB = priorityOrder[b.priorite?.toLowerCase()] || 0;
                        break;
                    case 'statue':
                        valA = (a.statue || '').toLowerCase();
                        valB = (b.statue || '').toLowerCase();
                        break;
                    case 'module':
                        valA = (a.idModule?.designation || '').toLowerCase();
                        valB = (b.idModule?.designation || '').toLowerCase();
                        break;
                    case 'affecteA':
                        valA = (a.idUtilisateur ? `${a.idUtilisateur.prenom} ${a.idUtilisateur.nom}` : '').toLowerCase();
                        valB = (b.idUtilisateur ? `${b.idUtilisateur.prenom} ${b.idUtilisateur.nom}` : '').toLowerCase();
                        break;
                    case 'date_echeance':
                    case 'dateCreation':
                    case 'actif':
                        // Tri direct pour ces clés
                        valA = a[sortConfig.key];
                        valB = b[sortConfig.key];
                        break;
                    case 'client':
                    case 'demandeur':
                        // Ces colonnes ne sont pas triables directement via la fonction handleSort,
                        // mais sont incluses dans le useMemo pour assurer la cohérence si elles étaient gérées ici.
                        return 0;
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
    }, [tickets, searchTerm, filters, sortConfig]); // Dépendances pour useMemo

    // Effet pour gérer le surlignage et la navigation vers la bonne page après ajout/modification
    useEffect(() => {
        if (highlightTicketRef.current && Array.isArray(processedTickets) && processedTickets.length > 0) {
            const targetId = highlightTicketRef.current;
            highlightTicketRef.current = null; // Réinitialise la référence

            const targetTicketIndex = processedTickets.findIndex(t => t.id === targetId);

            if (targetTicketIndex !== -1) {
                const calculatedTargetPage = Math.ceil((targetTicketIndex + 1) / entriesPerPage);

                if (currentPage !== calculatedTargetPage) {
                    setCurrentPage(calculatedTargetPage); // Navigue vers la page du ticket surligné
                }

                // Utilise requestAnimationFrame pour s'assurer que le rendu est terminé avant d'appliquer le surlignage
                requestAnimationFrame(() => {
                    setHighlightedTicketId(targetId);
                });
            }
        }
    }, [processedTickets, entriesPerPage, currentPage, setCurrentPage]); // Dépendances pour useMemo

    // Calcul du nombre total de pages
    const totalPages = Math.ceil(processedTickets.length / entriesPerPage);

    // Tickets paginés (ceux réellement affichés sur la page courante)
    const paginatedTickets = useMemo(() => {
        const startIndex = (currentPage - 1) * entriesPerPage;
        return processedTickets.slice(startIndex, startIndex + entriesPerPage);
    }, [processedTickets, currentPage, entriesPerPage]);

    // Effet pour réinitialiser la page courante à 1 lorsque les filtres ou la recherche changent
    useEffect(() => {
        setCurrentPage(1);
    }, [entriesPerPage, filters, searchTerm]);

    // --- Gestion des Vues et Modales ---
    const handleNavigateToUpdate = (ticketId) => {
        setCurrentView({ view: 'update', ticketId: ticketId });
    };

       const handleBackToList = (updatedTicketId = null, message = null) => {
        setCurrentView({ view: 'list', ticketId: null });

        if (updatedTicketId) {
            // On stocke l'ID dans la ref. L'useEffect s'occupera du surlignage et de la pagination.
            highlightTicketRef.current = updatedTicketId;
        }
        
        if (message) {
             // Affiche le message de succès ou d'info après être revenu à la liste
             // On utilise un petit délai pour s'assurer que le toast s'affiche après le changement de vue.
             setTimeout(() => {
                const messageType = message.includes('annulées') ? 'info' : 'success';
                setToast({ message: message, type: messageType });
            }, 100);
        }

        fetchAllNecessaryData(); // Rafraîchit les données pour afficher la mise à jour
    };

    const handleShowDetails = (ticketId) => setSelectedTicketIdForDetails(ticketId);
    const handleCloseDetails = () => setSelectedTicketIdForDetails(null);

    // Fonction d'ajout de ticket
    const handleAddTicket = async (ticketData) => {
        try {
            const response = await ticketService.createTicket(ticketData);
            setToast({ message: "Ticket ajouté avec succès !", type: 'success' });
            setActiveModal(null);
            fetchAllNecessaryData(); // Rafraîchit la liste des tickets
            const newTicketId = response.data?.id;
            if (newTicketId) {
                highlightTicketRef.current = newTicketId; // Définit l'ID pour surlignage futur
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout du ticket:", error);
            setToast({ message: error.response?.data?.message || "Erreur lors de l'ajout du ticket.", type: 'error' });
        }
    };

    // --- Fonctions de Tri et Visibilité des Colonnes ---
    // useCallback pour la fonction de tri
    const handleSort = useCallback((key) => {
        // Les colonnes 'client', 'demandeur', 'module', 'affecteA', 'priorite', 'statue', 'actif'
        // ne sont pas triables via les flèches dans l'en-tête, car leur tri est géré par les filtres ou n'est pas implémenté directement ici.
        if (key === 'client' || key === 'demandeur' || key === 'module' || key === 'affecteA' || key === 'priorite' || key === 'statue' || key === 'actif') {
            return;
        }
        setSortConfig(p => ({ key, direction: p.key === key && p.direction === 'asc' ? 'desc' : 'asc' }));
    }, []);

    // useCallback pour la bascule de visibilité des colonnes
    const handleToggleColumn = useCallback((key) => setVisibleColumns(p => ({ ...p, [key]: !p[key] })), []);

    // useCallback pour ouvrir/fermer les dropdowns
    const toggleDropdownGlobal = useCallback((name) => {
        setOpenDropdown(prev => (prev === name ? null : name));
    }, []);

    // --- Préparation des Données pour l'Exportation et l'Impression ---
    // En-têtes pour l'exportation PDF
    const pdfHeaders = useMemo(() => [[
        'ST', 'Client', 'Demandeur', 'Titre', 'Module', 'Affecté à',
        'Date Échéance', 'Date de Création', 'Priorité', 'Statut', 'Actif', 'Actions'
    ]], []);

    // Données pour l'exportation PDF (mappage des tickets vers un format de tableau)
    const pdfData = useMemo(() => processedTickets.map(ticket => [
        (ticket.childTickets?.length || 0), // Colonne ST
        ticket.idClient?.nomComplet || 'N/A',
        ticket.userCreation || (ticket.demandeur ? `${ticket.demandeur.prenom} ${ticket.demandeur.nom}` : 'N/A'),
        ticket.titre,
        ticket.idModule?.designation || 'N/A',
        ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom} ${ticket.idUtilisateur.nom}` : 'N/A',
        formatDateFromArray(ticket.date_echeance),
        formatDateFromArray(ticket.dateCreation),
        ticket.priorite,
        ticket.statue,
        ticket.actif ? 'Actif' : 'Non actif',
        '' // Colonne Actions (vide pour l'exportation)
    ]), [processedTickets]);

    // Données pour l'exportation Excel (mappage des tickets vers un objet avec clés pour les en-têtes)
    const excelData = useMemo(() => {
        return processedTickets.map(ticket => ({
            'ST': (ticket.childTickets?.length || 0),
            'Client': ticket.idClient?.nomComplet || 'N/A',
            'Demandeur': ticket.userCreation || (ticket.demandeur ? `${ticket.demandeur.prenom} ${ticket.demandeur.nom}` : 'N/A'),
            'Titre': ticket.titre,
            'Module': ticket.idModule?.designation || 'N/A',
            'Affecté à': ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom} ${ticket.idUtilisateur.nom}` : 'N/A',
            'Date Échéance': formatDateFromArray(ticket.date_echeance),
            'Date de Création': formatDateFromArray(ticket.dateCreation),
            'Priorité': ticket.priorite,
            'Statut': ticket.statue,
            'Actif': ticket.actif ? 'Actif' : 'Non actif'
        }));
    }, [processedTickets]);

    // Fonctions d'exportation PDF, Excel et d'impression
    const handleExportPdfTickets = useCallback(() => {
        exportToPdf('Liste des Tickets', pdfHeaders, pdfData, 'liste_tickets.pdf');
        setOpenDropdown(null);
    }, [pdfHeaders, pdfData]);

    const handleExportExcelTickets = useCallback(() => {
        // Utilise pdfHeaders[0] pour les en-têtes d'Excel car `exportTableToExcel` attend un tableau simple d'en-têtes.
        exportTableToExcel(pdfHeaders[0], excelData, 'liste_tickets.xlsx', 'Tickets');
        setOpenDropdown(null);
    }, [pdfHeaders, excelData]);

    const handlePrintTickets = useCallback(() => {
        // Construction du contenu HTML pour l'impression
        let tableHtml = `<h2 style="text-align:center; font-size: 24px; margin-bottom: 20px;">Liste des Tickets</h2>
                         <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                                <tr style="background-color:#f2f2f2;">
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ST</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Client</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Demandeur</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Titre</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Module</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Affecté à</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Date Échéance</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Date de Création</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Priorité</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Statut</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Actif</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>`;
        processedTickets.forEach(ticket => {
            tableHtml += `<tr>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align:center;">${(ticket.childTickets?.length || 0)}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${ticket.idClient?.nomComplet || 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${ticket.userCreation || (ticket.demandeur ? `${ticket.demandeur.prenom} ${ticket.demandeur.nom}` : 'N/A')}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${ticket.titre}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${ticket.idModule?.designation || 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom} ${ticket.idUtilisateur.nom}` : 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${formatDate(ticket.date_echeance)}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${formatDate(ticket.dateCreation)}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${ticket.priorite}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${ticket.statue}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${ticket.actif ? 'Actif' : 'Non actif'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;"></td>
                          </tr>`;
        });
        tableHtml += `</tbody></table>`;
        printHtmlContent(tableHtml, 'Impression Liste des Tickets');
        setOpenDropdown(null);
    }, [processedTickets]);

    // Effet pour enregistrer les fonctions d'exportation dans le contexte global
    useEffect(() => {
        setExportFunctions(handleExportPdfTickets, handleExportExcelTickets, handlePrintTickets);
        // Fonction de nettoyage pour réinitialiser les fonctions à la sortie du composant
        return () => {
            setExportFunctions(null, null, null);
        };
    }, [setExportFunctions, handleExportPdfTickets, handleExportExcelTickets, handlePrintTickets]);


    // --- Rendu Conditionnel des Vues ---
    // Si currentView est 'update', affiche le composant TicketUpdateView
    if (currentView.view === 'update') {
        return <TicketUpdateView
            ticketId={currentView.ticketId}
            onBack={handleBackToList}
            setToast={setToast}
            onNavigateToParent={(parentId) => setCurrentView({ view: 'update', ticketId: parentId })}

        />;
    }

    // --- Rendu Principal de la Page de Gestion des Tickets (Liste) ---
    return (
        <div className="p-0 md:p-0 bg-slate-50 dark:bg-slate-900 min-h-screen">
            {/* Styles CSS internes pour TailwindCSS (classes utilitaires) */}
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

            {/* Modales et Toast messages */}
            {selectedTicketIdForDetails && <TicketDetailPage ticketId={selectedTicketIdForDetails} onClose={handleCloseDetails} />}
            {activeModal === 'add' && <AddTicketModal onAddTicket={handleAddTicket} onCancel={() => setActiveModal(null)} availableClients={allClients} availableUsers={allUsers} availableModules={allModules} setToast={setToast} />}
            {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Titre de la page */}
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Gestion des Tickets</h1>

            {/* Barre de contrôles (recherche, actions, filtres, colonnes, pagination) */}
            <div className="bg-white dark:bg-slate-800/80 px-4 py-0 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700 mb-0">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {/* Champ de recherche */}
                    <div className="relative flex-grow max-w-xs">
                        <Search className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input pl-10 w-full" />
                    </div>
                    {/* Conteneur des boutons d'action */}
                    <div className="flex items-center gap-2 flex-wrap" ref={dropdownsRef}>
                        {/* Groupe 1: Ajouter, Rafraîchir */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => setActiveModal('add')} className="btn btn-primary h-full px-3" title="Ajouter un nouveau ticket"><PlusCircle size={20} /></button>
                            <button onClick={fetchAllNecessaryData} className="btn btn-secondary h-full px-3" title="Rafraîchir la liste"><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /></button>
                        </div>

                        {/* NOUVEAU: Trois boutons de filtre distincts pour Priorité, Statut et Actif */}
                        {/* Bouton de filtre par Priorité */}
                        <div className="relative shrink-0">
                            <button onClick={() => toggleDropdownGlobal('prioriteFilter')} className="btn btn-secondary">
                                <Filter size={16} className="mr-2" />
                                Priorité
                            </button>
                            {openDropdown === 'prioriteFilter' &&
                                <DropdownMenu>
                                    <DropdownMenuItem isSelected={filters.priorite === 'tous'} onClick={() => { setFilters(f => ({ ...f, priorite: 'tous' })); toggleDropdownGlobal('prioriteFilter'); }}>Toutes</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.priorite === 'Haute'} onClick={() => { setFilters(f => ({ ...f, priorite: 'Haute' })); toggleDropdownGlobal('prioriteFilter'); }}>Haute</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.priorite === 'Moyenne'} onClick={() => { setFilters(f => ({ ...f, priorite: 'Moyenne' })); toggleDropdownGlobal('prioriteFilter'); }}>Moyenne</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.priorite === 'Basse'} onClick={() => { setFilters(f => ({ ...f, priorite: 'Basse' })); toggleDropdownGlobal('prioriteFilter'); }}>Basse</DropdownMenuItem>
                                </DropdownMenu>
                            }
                        </div>

                        {/* Bouton de filtre par Statut */}
                        <div className="relative shrink-0">
                            <button onClick={() => toggleDropdownGlobal('statutFilter')} className="btn btn-secondary">
                                <Filter size={16} className="mr-2" />
                                Statut
                            </button>
                            {openDropdown === 'statutFilter' &&
                                <DropdownMenu>
                                    <DropdownMenuItem isSelected={filters.statue === 'tous'} onClick={() => { setFilters(f => ({ ...f, statue: 'tous' })); toggleDropdownGlobal('statutFilter'); }}>Tous</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.statue === 'En_attente'} onClick={() => { setFilters(f => ({ ...f, statue: 'En_attente' })); toggleDropdownGlobal('statutFilter'); }}>En attente</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.statue === 'Accepte'} onClick={() => { setFilters(f => ({ ...f, statue: 'Accepte' })); toggleDropdownGlobal('statutFilter'); }}>Accepté</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.statue === 'En_cours'} onClick={() => { setFilters(f => ({ ...f, statue: 'En_cours' })); toggleDropdownGlobal('statutFilter'); }}>En cours</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.statue === 'Termine'} onClick={() => { setFilters(f => ({ ...f, statue: 'Termine' })); toggleDropdownGlobal('statutFilter'); }}>Terminé</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.statue === 'REFUSE'} onClick={() => { setFilters(f => ({ ...f, statue: 'REFUSE' })); toggleDropdownGlobal('statutFilter'); }}>Refusé</DropdownMenuItem>
                                </DropdownMenu>
                            }
                        </div>

                        {/* Bouton de filtre par Actif/Non actif */}
                        <div className="relative shrink-0">
                            <button onClick={() => toggleDropdownGlobal('actifFilter')} className="btn btn-secondary">
                                <Filter size={16} className="mr-2" />
                                Actif
                            </button>
                            {openDropdown === 'actifFilter' &&
                                <DropdownMenu>
                                    <DropdownMenuItem isSelected={filters.actif === 'tous'} onClick={() => { setFilters(f => ({ ...f, actif: 'tous' })); toggleDropdownGlobal('actifFilter'); }}>Tous</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.actif === 'actif'} onClick={() => { setFilters(f => ({ ...f, actif: 'actif' })); toggleDropdownGlobal('actifFilter'); }}>Actif</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filters.actif === 'non actif'} onClick={() => { setFilters(f => ({ ...f, actif: 'non actif' })); toggleDropdownGlobal('actifFilter'); }}>Non actif</DropdownMenuItem>
                                </DropdownMenu>
                            }
                        </div>

                        {/* ANCIEN BOUTON DE FILTRE GENERALISTE - REMPLACÉ PAR LES 3 BOUTONS CI-DESSUS */}
                        {/* Ce bloc de code a été commenté ou supprimé car il a été remplacé par des boutons de filtre plus spécifiques pour une meilleure UX.
                           Il contenait un menu déroulant unique avec des sections pour la priorité, le statut, le client, l'employé et le module. */}

                        {/* Groupe 3: Colonnes visibles, Lignes par page */}
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="relative">
                                <button onClick={() => toggleDropdownGlobal('columns')} className="btn btn-secondary" title="Choisir les colonnes à afficher"><Eye size={16} className="mr-2" />Colonnes</button>
                                {openDropdown === 'columns' &&
                                    <DropdownMenu>
                                        {/* Colonne ST (Sub-Tickets) est toujours visible et non désactivable */}
                                        <DropdownMenuItem disabled={true}>
                                            <GitFork size={16} className="mr-2 text-blue-500" /> {/* Icône pour les sous-tickets */}
                                            <span>ST</span>
                                        </DropdownMenuItem>
                                        {/* Mapping des autres colonnes pour permettre leur bascule de visibilité */}
                                        {Object.keys(visibleColumns).map(key => (
                                            <DropdownMenuItem key={key} onClick={() => handleToggleColumn(key)}>
                                                {visibleColumns[key] ? <Eye size={16} className="mr-2 text-blue-500" /> : <EyeOff size={16} className="mr-2 text-slate-400" />}
                                                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').replace('Priorite', 'Priorité').replace('Status', 'Statut').replace('Dateecheance', 'Date Échéance').replace('Datecreation', 'Date de Création').replace('Affectea', 'Affecté à')}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenu>
                                }
                            </div>
                            <div className="relative">
                                <button onClick={() => toggleDropdownGlobal('entries')} className="btn btn-secondary" title="Nombre de lignes par page">{entriesPerPage} / page</button>
                                {openDropdown === 'entries' && <DropdownMenu>{[10, 25, 50].map(num => (<DropdownMenuItem isSelected={entriesPerPage === num} key={num} onClick={() => { setEntriesPerPage(num); toggleDropdownGlobal('entries'); }}>{num} lignes</DropdownMenuItem>))}</DropdownMenu>}
                            </div>
                        </div>

                        {/* Groupe 4: Impression et Export */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handlePrintTickets}
                                className={`btn btn-secondary h-full px-3 ${!currentPrintFunction ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!currentPrintFunction}
                                title="Imprimer la page actuelle"
                            >
                                <Printer size={18} />
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdownGlobal('export')}
                                    className={`btn btn-secondary h-full px-3 btn-export-dropdown ${(!currentExportPdfFunction && !currentExportExcelFunction) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={!currentExportPdfFunction && !currentExportExcelFunction}
                                    title="Exporter les données"
                                >
                                    <File size={18} />
                                </button>
                                {openDropdown === 'export' && (
                                    <DropdownMenu align="right">
                                        <DropdownMenuItem onClick={handleExportPdfTickets} disabled={!currentExportPdfFunction}>
                                            <File size={16} className="mr-2" /> Exporter en PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleExportExcelTickets} disabled={!currentExportExcelFunction}>
                                            <FileSpreadsheet size={16} className="mr-2" /> Exporter en Excel
                                        </DropdownMenuItem>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Affichage conditionnel: Spinner, Message "Aucun ticket", ou Tableau des tickets */}
            {isLoading ? <Spinner /> : processedTickets.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-10">Aucun ticket trouvé pour la sélection actuelle.</p>
            ) : (
                <div className="overflow-x-auto shadow-sm rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="min-w-full text-sm">
                        {/* En-tête du tableau */}
                        <TableHeader
                            visibleColumns={visibleColumns}
                            handleSort={handleSort}
                            sortConfig={sortConfig}
                        />
                        {/* Corps du tableau avec les lignes de tickets paginées */}
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {paginatedTickets.map(ticket => (
                                <TicketTableRow
                                    key={ticket.id}
                                    ticket={ticket}
                                    onNavigateToDetails={handleShowDetails}
                                    onNavigateToUpdate={handleNavigateToUpdate}
                                    isExpanded={!!expandedRows[ticket.id]}
                                    onToggleExpand={toggleRowExpansion}
                                    highlightedTicketId={highlightedTicketId}
                                    visibleColumns={visibleColumns}
                                />
                            ))}
                        </tbody>
                    </table>
                    {/* Contrôles de pagination, affichés si des tickets sont présents */}
                    {processedTickets.length > 0 &&
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            setCurrentPage={setCurrentPage}
                            processedTickets={processedTickets}
                            entriesPerPage={entriesPerPage}
                        />
                    }
                </div>
            )}
        </div>
    );
};

export default TicketsManagementPage;