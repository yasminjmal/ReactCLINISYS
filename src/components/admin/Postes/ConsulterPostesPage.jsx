// src/pages/Admin/Postes/ConsulterPostesPage.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Search, Plus, X, Filter, AlertTriangle, Save, XCircle, Settings2, Eye,
    EyeOff, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ArrowUpDown, RefreshCw, LayoutGrid, Rows3,
    Printer, File, FileSpreadsheet, Info, CheckCircle // Importez les icônes nécessaires ici
} from 'lucide-react';
import posteService from '../../../services/posteService';
import PosteTableRow from './PosteTableRow';
import PosteCard from './PosteCard';
import AjouterPostePage from './AjouterPostePage';
import { exportToPdf } from '../../../utils/exportPdf';
import { exportTableToExcel } from '../../../utils/exportExcel';
import { printHtmlContent } from '../../../utils/printContent';
import { useExport } from '../../../context/ExportContext'; // Importer useExport
import { formatDateFromArray } from '../../../utils/dateFormatter'; // Assurez-vous que ce fichier existe et exporte bien formatDateFromArray

// --- Composants Modaux et Dropdowns (inchangés) ---
const Spinner = () => <div className="text-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div></div>;

// Composant de message de notification (Toast)
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


const DeleteConfirmationModal = ({ poste, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-md w-full">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Confirmer la suppression</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 my-2">Voulez-vous vraiment supprimer le poste <strong className="font-semibold text-slate-800 dark:text-slate-200">"{poste?.designation}"</strong>?</p>
            <div className="flex justify-center space-x-3 mt-6">
                <button onClick={onCancel} className="btn btn-secondary">Annuler</button>
                <button onClick={onConfirm} className="btn btn-danger">Supprimer</button>
            </div>
        </div>
    </div>
);

// MODAL DE MODIFICATION AMÉLIORÉ
const EditModal = ({ poste, onUpdate, onCancel }) => {
    const [designation, setDesignation] = useState(poste?.designation || '');
    const [actif, setActif] = useState(poste?.actif === true);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault(); // Empêcher le rechargement de la page
        if (!designation.trim()) {
            setError('La désignation est requise.');
            return;
        }
        onUpdate(poste.id, { designation, actif });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Modifier le Poste</h2>
                <form onSubmit={handleSubmit} className="space-y-4"> {/* Utilisation d'un formulaire ici */}
                    {/* Champ Désignation */}
                    <div>
                        <label htmlFor="edit-designation" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Désignation
                        </label>
                        <input
                            type="text"
                            id="edit-designation"
                            value={designation}
                            onChange={(e) => { setDesignation(e.target.value); setError(''); }}
                            className={`
                                block w-full px-3 py-2
                                bg-white dark:bg-slate-900/50
                                border rounded-md shadow-sm
                                placeholder-slate-400 dark:placeholder-slate-500
                                focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                                sm:text-sm
                                ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
                            `}
                        />
                        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>
                    {/* Champ Actif (Checkbox) */}
                    <div className="flex items-center pt-2">
                        <input
                            type="checkbox"
                            id="edit-actif"
                            checked={actif}
                            onChange={(e) => setActif(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-500 dark:bg-slate-700 dark:checked:bg-blue-600 dark:checked:border-transparent"
                        />
                        <label htmlFor="edit-actif" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                            Actif
                        </label>
                    </div>
                    {/* Boutons d'action */}
                    <div className="pt-6 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-700"> {/* Ajout de la bordure et padding */}
                        <button type="button" onClick={onCancel} className="btn btn-secondary">
                            <XCircle size={16} className="mr-1.5" /> Annuler
                        </button>
                        <button type="submit" className="btn btn-primary"> {/* Type submit pour déclencher le handleSubmit du formulaire */}
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
const DropdownMenuItem = ({ children, onClick, isSelected, disabled }) => ( // Ajout de disabled
    <button onClick={onClick} disabled={disabled} className={`w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 ${isSelected ? 'font-bold text-blue-600' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {children}
    </button>
);

// --- NOUVEAU: Composant TableHeader extrait de ConsulterPostesPage ---
// Il reçoit les props nécessaires directement, SANS les fonctions d'exportation
const TableHeader = ({ visibleColumns, handleSort, sortConfig }) => {
    return (
        <thead className="text-sm text-black bg-sky-100 dark:bg-blue-200">
            <tr>
                {visibleColumns.poste && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Poste</th>}
                {visibleColumns.statut && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Statut</th>}
                {visibleColumns.creePar && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Créé par</th>}
                {visibleColumns.dateCreation && (
                    <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">
                        <button onClick={() => handleSort('dateCreation')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Date de création</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}
                {/* La colonne Actions a maintenant les boutons ici */}
                <th scope="col" className="px-6 py-3 font-sans text-center">Actions</th>
            </tr>
        </thead>
    );
};

// --- Composant PaginationControls (inchangé) ---
const PaginationControls = ({ currentPage, totalPages, setCurrentPage, processedPostes, entriesPerPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-6">
            <div className="text-sm text-slate-600 dark:text-slate-400">
                Affichage de <strong>{(currentPage - 1) * entriesPerPage + 1}</strong>-<strong>{Math.min(currentPage * entriesPerPage, processedPostes.length)}</strong> sur <strong>{processedPostes.length}</strong>
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


const ConsulterPostesPage = ({ initialPostes }) => {
    // --- STATE MANAGEMENT COMPLET ---
    const [view, setView] = useState('list');
    const [viewMode, setViewMode] = useState('table');
    const [postes, setPostes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [posteToEdit, setPosteToEdit] = useState(null);
    const [posteToDelete, setPosteToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('tous');
    const [sortConfig, setSortConfig] = useState({ key: 'dateCreation', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [visibleColumns, setVisibleColumns] = useState({ poste: true, statut: true, creePar: true, dateCreation: true });
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownsRef = useRef(null);
    // NOUVEAU: États pour le surlignage et les messages de notification
    const [highlightedPostId, setHighlightedPostId] = useState(null);
    const [pendingHighlightId, setPendingHighlightId] = useState(null); // Nouveau state pour l'ID en attente de surlignage
    const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' | 'info' }

    // Récupérer les fonctions d'exportation depuis le contexte (toujours nécessaire pour les appeler)
    const { setExportFunctions, currentExportPdfFunction, currentExportExcelFunction, currentPrintFunction } = useExport();

    // --- LOGIQUE DE DONNÉES ET D'EFFETS ---
    const fetchPostes = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await posteService.getAllPostes();
            setPostes(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Erreur lors de la récupération des postes:", err);
        }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        if (initialPostes && initialPostes.length > 0) {
            setPostes(initialPostes);
            setIsLoading(false);
        } else if (view === 'list') {
            fetchPostes();
        }
    }, [view, fetchPostes, initialPostes]);

    // Gère le clic en dehors des dropdowns (général)
    useEffect(() => {
        const handleClickOutside = (event) => {
            // S'assurer que le clic n'est pas sur le bouton "Exporter" lui-même
            if (dropdownsRef.current && !dropdownsRef.current.contains(event.target)) {
                 // Sauf si l'élément cliqué est l'un des boutons d'exportation
                const isExportButton = event.target.closest('.btn-export-dropdown'); // Ajout d'une classe pour les boutons d'exportation
                if (!isExportButton) {
                    setOpenDropdown(null);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Effet pour gérer le surlignage (disparaît après 3 secondes)
    useEffect(() => {
        if (highlightedPostId) {
            const timer = setTimeout(() => {
                setHighlightedPostId(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [highlightedPostId]);

    // Effet pour gérer l'affichage et la disparition du toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Effet pour appliquer le surlignage et définir la page APRES que les données 'postes' sont confirmées d'inclure l'ID cible
    useEffect(() => {
        if (pendingHighlightId && postes.length > 0) {
            // Assurez-vous que processedPostes est à jour pour trouver l'index correct
            const currentProcessedPostes = (postes) => {
                let filtered = [...postes];
                if (filterStatus !== 'tous') {
                    filtered = filtered.filter(p => (p.actif ? 'actif' : 'inactif') === filterStatus);
                }
                if (searchTerm) {
                    filtered = filtered.filter(p => p.designation.toLowerCase().includes(searchTerm.toLowerCase()));
                }
                if (sortConfig.key) {
                    filtered.sort((a, b) => {
                        let valA = a[sortConfig.key];
                        let valB = b[b[sortConfig.key]];
                        if (sortConfig.key === 'dateCreation') {
                            const dateA = Array.isArray(a.dateCreation) ? new Date(a.dateCreation[0], a.dateCreation[1] - 1, a.dateCreation[2]) : new Date(a.dateCreation);
                            const dateB = Array.isArray(b.dateCreation) ? new Date(b.dateCreation[0], b.dateCreation[1] - 1, b.dateCreation[2]) : new Date(b.dateCreation);
                            valA = dateA.getTime();
                            valB = dateB.getTime();
                        }
                        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                        return 0;
                    });
                }
                return filtered;
            };

            const targetPostIndex = currentProcessedPostes(postes).findIndex(p => p.id === pendingHighlightId);

            if (targetPostIndex !== -1) {
                const targetPage = Math.ceil((targetPostIndex + 1) / entriesPerPage);
                setCurrentPage(targetPage);
                setHighlightedPostId(pendingHighlightId);
                setPendingHighlightId(null); // Clear pending ID after successful highlight/pagination
            }
        }
    }, [pendingHighlightId, postes, entriesPerPage, setCurrentPage, filterStatus, searchTerm, sortConfig]); // processedPostes est une dépendance car il dépend de 'postes' et des filtres/tris


    // --- HANDLERS POUR LES ACTIONS CRUD ---
    const handleAddPoste = async (posteData) => {
        try {
            const response = await posteService.createPoste(posteData);
            setView('list');
            const newPosteId = response.data?.id; // Assurez-vous que l'API retourne l'ID du nouveau poste
            await fetchPostes(); // Attendre la mise à jour des postes
            if (newPosteId) {
                setPendingHighlightId(newPosteId); // Déclencher l'effet de surlignage et pagination
            }
            setToast({ message: "Poste ajouté avec succès !", type: 'success' });
        } catch (err) {
            console.error("Erreur lors de l'ajout du poste:", err);
            setToast({ message: "Erreur lors de l'ajout du poste.", type: 'error' });
        }
    };
    const handleUpdatePoste = async (id, posteData) => {
        try {
            await posteService.updatePoste(id, posteData);
            setPosteToEdit(null);
            await fetchPostes(); // Attendre la mise à jour des postes
            setPendingHighlightId(id); // Déclencher l'effet de surlignage et pagination
            setToast({ message: "Poste modifié avec succès !", type: 'success' });
        } catch (err) {
            console.error('Erreur de mise à jour:', err);
            setToast({ message: "Erreur lors de la modification du poste.", type: 'error' });
        }
    };
    const handleDeletePoste = async () => {
        if (!posteToDelete) return;
        try {
            await posteService.deletePoste(posteToDelete.id);
            setPosteToDelete(null);
            fetchPostes(); // Pas besoin d'attendre pour la suppression si l'ID n'est pas surligné
            setToast({ message: "Poste supprimé avec succès !", type: 'success' });
        } catch (err) {
            console.error('Erreur de suppression:', err);
            setPosteToDelete(null);
            setToast({ message: "Erreur lors de la suppression du poste.", type: 'error' });
        }
    };

    // --- LOGIQUE D'AFFICHAGE (FILTRE, TRI, PAGINATION) ---
    const processedPostes = useMemo(() => {
        let filtered = [...postes];
        if (filterStatus !== 'tous') {
            filtered = filtered.filter(p => (p.actif ? 'actif' : 'inactif') === filterStatus);
        }
        if (searchTerm) {
            filtered = filtered.filter(p => p.designation.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];
                if (sortConfig.key === 'dateCreation') {
                    // S'assurer que les dates sont des objets Date pour la comparaison
                    const dateA = Array.isArray(a.dateCreation) ? new Date(a.dateCreation[0], a.dateCreation[1] - 1, a.dateCreation[2]) : new Date(a.dateCreation);
                    const dateB = Array.isArray(b.dateCreation) ? new Date(b.dateCreation[0], b.dateCreation[1] - 1, b.dateCreation[2]) : new Date(b.dateCreation);
                    valA = dateA.getTime();
                    valB = dateB.getTime();
                }
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [postes, searchTerm, filterStatus, sortConfig]);

    const totalPages = Math.ceil(processedPostes.length / entriesPerPage);

    const paginatedPostes = useMemo(() => {
        const startIndex = (currentPage - 1) * entriesPerPage;
        return processedPostes.slice(startIndex, startIndex + entriesPerPage);
    }, [processedPostes, currentPage, entriesPerPage]);

    useEffect(() => { setCurrentPage(1); }, [entriesPerPage, filterStatus, searchTerm]);

    // --- HANDLERS POUR LES CONTRÔLES UI ---
    const handleSort = useCallback((key) => {
        setSortConfig(p => ({ key, direction: p.key === key && p.direction === 'asc' ? 'desc' : 'asc' }));
    }, []);
    const handleToggleColumn = useCallback((key) => setVisibleColumns(p => ({ ...p, [key]: !p[key] })), []);
    // Le toggleDropdown doit aussi gérer la fermeture du dropdown d'exportation
    const toggleDropdownGlobal = useCallback((name) => {
        setOpenDropdown(prev => (prev === name ? null : name));
    }, []);


    // --- PRÉPARATION DES DONNÉES ET FONCTIONS D'EXPORTATION POUR LE CONTEXTE ---
    const pdfHeaders = useMemo(() => [['ID', 'Poste', 'Statut', 'Créé par', 'Date Création']], []);
    const pdfData = useMemo(() => processedPostes.map(poste => [
        poste.id,
        poste.designation,
        poste.actif ? 'Actif' : 'Non actif',
        // Utilisation de poste.userCreation (si c'est un objet {nom, prenom}) ou poste.creePar (si c'est juste un nom)
        poste.userCreation ? `${poste.userCreation.nom} ${poste.userCreation.prenom}` : (poste.creePar || 'N/A'),
        formatDateFromArray(poste.dateCreation) // Utilisation de la fonction formatDateFromArray
    ]), [processedPostes]);

    const excelData = useMemo(() => {
        return processedPostes.map(poste => ({
            ID: poste.id,
            'Poste': poste.designation,
            'Statut': poste.actif ? 'Actif' : 'Inactif',
            'Créé par': poste.userCreation ? `${poste.userCreation.nom} ${poste.userCreation.prenom}` : (poste.creePar || 'N/A'),
            'Date Création': formatDateFromArray(poste.dateCreation)
        }));
    }, [processedPostes]);

    const handleExportPdfPostes = useCallback(() => {
        exportToPdf('Liste des Postes', pdfHeaders, pdfData, 'liste_postes.pdf');
        setOpenDropdown(null); // Ferme le dropdown après l'action
    }, [pdfHeaders, pdfData]);

    const handleExportExcelPostes = useCallback(() => {
        exportTableToExcel(pdfHeaders, pdfData, 'liste_postes.xlsx', 'Postes');
        setOpenDropdown(null); // Ferme le dropdown après l'action
    }, [pdfHeaders, pdfData]);

    const handlePrintPostes = useCallback(() => {
        let tableHtml = `<h2 style="text-align:center; font-size: 24px; margin-bottom: 20px;">Liste des Postes</h2>
                         <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                                <tr style="background-color:#f2f2f2;">
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Poste</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Statut</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Créé par</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Date Création</th>
                                </tr>
                            </thead>
                            <tbody>`;
        processedPostes.forEach(poste => {
            const creatorName = poste.userCreation ? `${poste.userCreation.nom} ${poste.userCreation.prenom}` : (poste.creePar || 'N/A');
            tableHtml += `<tr>
                            <td style="padding: 8px; border: 1px solid #ddd;">${poste.id}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${poste.designation}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${poste.actif ? 'Actif' : 'Non actif'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${creatorName}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${formatDateFromArray(poste.dateCreation)}</td>
                          </tr>`;
        });
        tableHtml += `</tbody></table>`;
        printHtmlContent(tableHtml, 'Impression Liste des Postes');
        setOpenDropdown(null); // Ferme le dropdown après l'action
    }, [processedPostes]);

    useEffect(() => {
        setExportFunctions(handleExportPdfPostes, handleExportExcelPostes, handlePrintPostes);
        return () => {
            setExportFunctions(null, null, null);
        };
    }, [setExportFunctions, handleExportPdfPostes, handleExportExcelPostes, handlePrintPostes]);


    // --- RENDU PRINCIPAL ---
    if (view === 'add') {
        return <AjouterPostePage onAddPoste={handleAddPoste} onCancel={() => { setView('list'); setToast({ message: "Ajout de poste annulé.", type: 'info' }); }} />;
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
            {posteToDelete && <DeleteConfirmationModal poste={posteToDelete} onConfirm={handleDeletePoste} onCancel={() => setPosteToDelete(null)} />}
            {posteToEdit && <EditModal poste={posteToEdit} onUpdate={handleUpdatePoste} onCancel={() => { setPosteToEdit(null); setToast({ message: "Modification de poste annulée.", type: 'info' }); }} />}

            {/* Message de notification */}
            {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Titre de la page */}
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Gestion des Postes</h1>

            {/* Barre de contrôles */}
            <div className="bg-white dark:bg-slate-800/80 px-4 py-0 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700 mb-0">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-grow max-w-xs">
                        <Search className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input pl-10 w-full" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap" ref={dropdownsRef}>
                        <button onClick={() => setView('add')} className="btn btn-primary h-full px-3"><Plus size={20} /></button>
                        <button onClick={fetchPostes} className="btn btn-secondary h-full px-3" title="Rafraîchir"><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /></button>
                        <div className="relative">
                            <button onClick={() => toggleDropdownGlobal('filter')} className="btn btn-secondary">
                                <Filter size={16} className="mr-2" />
                                {filterStatus === 'tous' ? 'Filtre' : `Filtre: ${filterStatus === 'actif' ? 'Actifs' : 'Non actifs'}`} {/* Texte dynamique */}
                            </button>
                            {openDropdown === 'filter' &&
                                <DropdownMenu>
                                    <DropdownMenuItem isSelected={filterStatus === 'tous'} onClick={() => { setFilterStatus('tous'); toggleDropdownGlobal('filter'); }}>Tous</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filterStatus === 'actif'} onClick={() => { setFilterStatus('actif'); toggleDropdownGlobal('filter'); }}>Actifs</DropdownMenuItem>
                                    <DropdownMenuItem isSelected={filterStatus === 'inactif'} onClick={() => { setFilterStatus('inactif'); toggleDropdownGlobal('filter'); }}>Non actifs</DropdownMenuItem> {/* Changé 'Inactifs' en 'Non actifs' ici */}
                                </DropdownMenu>
                            }
                        </div>
                        <div className="relative"><button onClick={() => toggleDropdownGlobal('columns')} className="btn btn-secondary"><Eye size={16} className="mr-2" />Colonnes</button>
                            {openDropdown === 'columns' && <DropdownMenu>{Object.keys(visibleColumns).map(key => (<DropdownMenuItem key={key} onClick={() => handleToggleColumn(key)}>{visibleColumns[key] ? <Eye size={16} className="mr-2 text-blue-500" /> : <EyeOff size={16} className="mr-2 text-slate-400" />}<span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span></DropdownMenuItem>))}</DropdownMenu>}
                        </div>
                        <div className="relative"><button onClick={() => toggleDropdownGlobal('entries')} className="btn btn-secondary">{entriesPerPage} / page</button>
                            {openDropdown === 'entries' && <DropdownMenu>{[10, 25, 50].map(num => (<DropdownMenuItem isSelected={entriesPerPage === num} key={num} onClick={() => { setEntriesPerPage(num); toggleDropdownGlobal('entries'); }}>{num} lignes</DropdownMenuItem>))}</DropdownMenu>}
                        </div>
                        {/* NOUVELLE POSITION : Boutons Imprimer et Exporter */}
                        <button
                            onClick={handlePrintPostes}
                            className={`btn btn-secondary h-full px-3 ${!currentPrintFunction ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!currentPrintFunction}
                            title="Imprimer la page"
                        >
                            <Printer size={18} />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => toggleDropdownGlobal('export')} // Nouveau dropdown pour l'export
                                className={`btn btn-secondary h-full px-3 ${(!currentExportPdfFunction && !currentExportExcelFunction) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!currentExportPdfFunction && !currentExportExcelFunction}
                                title="Exporter"
                            >
                                <File size={18} />
                            </button>
                            {openDropdown === 'export' && (
                                <DropdownMenu align="right"> {/* Alignez à droite pour ne pas dépasser */}
                                    <DropdownMenuItem onClick={handleExportPdfPostes} disabled={!currentExportPdfFunction}>
                                        <File size={16} className="mr-2" /> Exporter en PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleExportExcelPostes} disabled={!currentExportExcelFunction}>
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
                processedPostes.length === 0 ? (
                    <div className="text-center py-10 text-slate-600 dark:text-slate-400">Aucun poste trouvé pour la sélection actuelle.</div>
                ) : (
                    viewMode === 'table' ? (
                        <div className="bg-white dark:bg-slate-800/80 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <TableHeader // Appel du composant TableHeader
                                        visibleColumns={visibleColumns}
                                        handleSort={handleSort}
                                        sortConfig={sortConfig}
                                    />
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {paginatedPostes.map(poste => (
                                            <PosteTableRow
                                                key={poste.id}
                                                poste={poste}
                                                onEdit={setPosteToEdit}
                                                onDelete={setPosteToDelete}
                                                visibleColumns={visibleColumns}
                                                highlightedPostId={highlightedPostId} // Passe l'ID du poste à surligner
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {processedPostes.length > 0 &&
                                <PaginationControls // Appel du composant PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    setCurrentPage={setCurrentPage}
                                    processedPostes={processedPostes}
                                    entriesPerPage={entriesPerPage}
                                />
                            }
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {paginatedPostes.map(poste => (
                                <PosteCard key={poste.id} poste={poste} onEdit={setPosteToEdit} onDelete={setPosteToDelete} />
                            ))}
                        </div>
                    )
                )
            )}
        </div>
    );
};
export default ConsulterPostesPage;
