// src/components/admin/Modules/ConsulterModulesPage.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Search, Plus, X, Filter, AlertTriangle, Save, XCircle, Settings2, Eye,
    EyeOff, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ArrowUpDown, RefreshCw, LayoutGrid, Rows3,
    Printer, File, FileSpreadsheet, Info, CheckCircle, PackagePlus, Users, ChevronDown
} from 'lucide-react';

import moduleService from '../../../services/moduleService';
import equipeService from '../../../services/equipeService';
import { formatDateFromArray } from '../../../utils/dateFormatter';
import { exportToPdf } from '../../../utils/exportPdf';
import { exportTableToExcel } from '../../../utils/exportExcel';
import { printHtmlContent } from '../../../utils/printContent';
import { useExport } from '../../../context/ExportContext';

import AjouterModulePage from './AjouterModulePage';
import ModuleCard from './ModuleCard';
import ModuleTableRow from './ModuleTableRow';

// --- Composants UI Internes (Standardisés avec les autres pages) ---
const Spinner = () => <div className="text-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div></div>;

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

const DeleteConfirmationModal = ({ module, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-md w-full">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Confirmer la suppression</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 my-2">Voulez-vous vraiment supprimer le module <strong className="font-semibold text-slate-800 dark:text-slate-200">"{module?.designation}"</strong>?</p>
            <div className="flex justify-center space-x-3 mt-6">
                <button onClick={onCancel} className="btn btn-secondary">Annuler</button>
                <button onClick={onConfirm} className="btn btn-danger">Supprimer</button>
            </div>
        </div>
    </div>
);

const EditModal = ({ module, equipes, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({
        designation: '',
        idEquipe: '',
        actif: true,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (module) {
            setFormData({
                designation: module.designation || '',
                idEquipe: module.equipe?.id?.toString() || '',
                actif: module.actif === true,
            });
        }
    }, [module]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.designation.trim()) newErrors.designation = "La désignation est requise.";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        const payload = {
            designation: formData.designation,
            idEquipe: formData.idEquipe ? parseInt(formData.idEquipe, 10) : null,
            actif: formData.actif,
        };
        
        onUpdate(module.id, payload);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Modifier le Module</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="edit-designation" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom du Module</label>
                        <input
                            type="text"
                            id="edit-designation"
                            name="designation"
                            value={formData.designation}
                            onChange={handleInputChange}
                            className={`
                                block w-full px-3 py-2
                                bg-white dark:bg-slate-900/50
                                border rounded-md shadow-sm
                                placeholder-slate-400 dark:placeholder-slate-500
                                focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                                sm:text-sm
                                ${errors.designation ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
                            `}
                        />
                        {errors.designation && <p className="text-xs text-red-500 mt-1">{errors.designation}</p>}
                    </div>
                    <div>
                        <label htmlFor="edit-idEquipe" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Équipe (Optionnel)</label>
                        <div className="relative">
                            <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                id="edit-idEquipe"
                                name="idEquipe"
                                value={formData.idEquipe}
                                onChange={handleInputChange}
                                className="form-select-icon appearance-none block w-full px-3 py-2 pl-10 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">-- Non assignée --</option>
                                {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.designation}</option>)}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"/>
                        </div>
                    </div>
                    <div className="flex items-center pt-2">
                        <input
                            type="checkbox"
                            id="edit-actif"
                            name="actif"
                            checked={formData.actif}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-500 dark:bg-slate-700 dark:checked:bg-blue-600 dark:checked:border-transparent"
                        />
                        <label htmlFor="edit-actif" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Actif</label>
                    </div>
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

// NOUVEAU: Composant TableHeader pour Module
const TableHeader = ({ visibleColumns, handleSort, sortConfig }) => {
    return (
        <thead className="text-sm text-black bg-sky-100 dark:bg-blue-200">
            <tr>
                {visibleColumns.designation && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Module</th>}
                {visibleColumns.equipe && <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">Équipe</th>}
                {visibleColumns.tickets && ( // MODIFICATION ICI : Ajout du bouton de tri
                    <th scope="col" className="px-6 py-3 font-sans text-left separateur-colonne-leger">
                        <button onClick={() => handleSort('tickets')} className="flex items-center justify-between w-full hover:text-blue-200">
                            <span>Tickets</span>
                            <ArrowUpDown size={16} className="opacity-70" />
                        </button>
                    </th>
                )}
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
                <th scope="col" className="px-6 py-3 font-sans text-center">Actions</th>
            </tr>
        </thead>
    );
};

const PaginationControls = ({ currentPage, totalPages, setCurrentPage, processedModules, entriesPerPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-6">
            <div className="text-sm text-slate-600 dark:text-slate-400">
                Affichage de <strong>{(currentPage - 1) * entriesPerPage + 1}</strong>-<strong>{Math.min(currentPage * entriesPerPage, processedModules.length)}</strong> sur <strong>{processedModules.length}</strong>
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


const ConsulterModulesPage = ({ initialModules = null }) => {
    const [view, setView] = useState('list');
    const [viewMode, setViewMode] = useState('table');
    const [modules, setModules] = useState([]);
    const [equipes, setEquipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [moduleToEdit, setModuleToEdit] = useState(null);
    const [moduleToDelete, setModuleToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEquipeId, setFilterEquipeId] = useState('tous');
    const [sortConfig, setSortConfig] = useState({ key: 'dateCreation', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [visibleColumns, setVisibleColumns] = useState({ designation: true, equipe: true, tickets: true, statut: true, creePar: true, dateCreation: true });
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownsRef = useRef(null);
    const [highlightedModuleId, setHighlightedModuleId] = useState(null);
    const highlightModuleRef = useRef(null);
    const [toast, setToast] = useState(null);

    const { setExportFunctions, currentExportPdfFunction, currentExportExcelFunction, currentPrintFunction } = useExport();

    const fetchModulesAndEquipes = useCallback(async () => {
        setIsLoading(true);
        try {
            const equipesRes = await equipeService.getAllEquipes();
            setEquipes(Array.isArray(equipesRes.data) ? equipesRes.data : []);
            
            const modulesRes = await moduleService.getAllModules();
            setModules(Array.isArray(modulesRes.data) ? modulesRes.data : []);
        } catch (err) {
            console.error("Erreur lors du chargement des données:", err);
            setToast({ message: "Erreur lors du chargement des modules ou équipes.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view === 'list') {
            fetchModulesAndEquipes();
        }
    }, [view, fetchModulesAndEquipes]);

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

    useEffect(() => {
        if (highlightedModuleId) {
            const timer = setTimeout(() => {
                setHighlightedModuleId(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [highlightedModuleId]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const processedModules = useMemo(() => {
        let filtered = [...modules];
        
        if (filterEquipeId !== 'tous' && filterEquipeId !== '') {
            filtered = filtered.filter(mod => mod.equipe?.id?.toString() === filterEquipeId);
        }

        if (searchTerm) {
            filtered = filtered.filter(mod => mod.designation.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let valA, valB;

                switch (sortConfig.key) {
                    case 'designation':
                    case 'userCreation':
                        valA = a[sortConfig.key]?.toLowerCase() || '';
                        valB = b[sortConfig.key]?.toLowerCase() || '';
                        break;
                    case 'equipe':
                        valA = a.equipe?.designation?.toLowerCase() || '';
                        valB = b.equipe?.designation?.toLowerCase() || '';
                        break;
                    case 'tickets': // MODIFICATION ICI : Logique de tri pour les tickets
                        valA = a.ticketList ? a.ticketList.length : 0;
                        valB = b.ticketList ? b.ticketList.length : 0;
                        break;
                    case 'dateCreation':
                        const dateA = Array.isArray(a.dateCreation) ? new Date(a.dateCreation[0], a.dateCreation[1] - 1, a.dateCreation[2]) : new Date(a.dateCreation);
                        const dateB = Array.isArray(b.dateCreation) ? new Date(b.dateCreation[0], b.dateCreation[1] - 1, b.dateCreation[2]) : new Date(b.dateCreation);
                        valA = dateA.getTime();
                        valB = dateB.getTime();
                        break;
                    case 'statut':
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
    }, [modules, searchTerm, filterEquipeId, sortConfig]);

    useEffect(() => {
        if (highlightModuleRef.current && Array.isArray(processedModules) && processedModules.length > 0) {
            const targetId = highlightModuleRef.current;
            highlightModuleRef.current = null;

            const targetModuleIndex = processedModules.findIndex(m => m.id === targetId);

            if (targetModuleIndex !== -1) {
                const calculatedTargetPage = Math.ceil((targetModuleIndex + 1) / entriesPerPage);

                if (currentPage !== calculatedTargetPage) {
                    setCurrentPage(calculatedTargetPage);
                }

                requestAnimationFrame(() => {
                    setHighlightedModuleId(targetId);
                });
            }
        }
    }, [processedModules, entriesPerPage, currentPage, setCurrentPage]);

    const totalPages = Math.ceil(processedModules.length / entriesPerPage);

    const paginatedModules = useMemo(() => {
        const startIndex = (currentPage - 1) * entriesPerPage;
        return processedModules.slice(startIndex, startIndex + entriesPerPage);
    }, [processedModules, currentPage, entriesPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [entriesPerPage, filterEquipeId, searchTerm]);

    const handleAddModule = async (moduleData) => {
        try {
            const response = await moduleService.createModule(moduleData);
            setView('list');
            await fetchModulesAndEquipes();
            const newModuleId = response.data?.id;
            if (newModuleId) {
                highlightModuleRef.current = newModuleId;
            }
            setToast({ message: "Module ajouté avec succès !", type: 'success' });
        } catch (err) {
            console.error("Erreur lors de l'ajout du module:", err);
            setToast({ message: err.response?.data?.message || "Erreur lors de l'ajout du module.", type: 'error' });
        }
    };

    const handleUpdateModule = async (id, moduleData) => {
        try {
            await moduleService.updateModule(id, moduleData);
            setModuleToEdit(null);
            await fetchModulesAndEquipes();
            highlightModuleRef.current = id;
            setToast({ message: "Module modifié avec succès !", type: 'success' });
        } catch (err) {
            console.error('Erreur de mise à jour:', err);
            setToast({ message: err.response?.data?.message || 'Erreur lors de la mise à jour du module.', type: 'error' });
        }
    };

    const handleDeleteModule = async () => {
        if (!moduleToDelete) return;
        try {
            await moduleService.deleteModule(moduleToDelete.id);
            setModuleToDelete(null);
            fetchModulesAndEquipes();
            setToast({ message: "Module supprimé avec succès !", type: 'success' });
        } catch (err) {
            console.error('Erreur de suppression:', err);
            setModuleToDelete(null);
            setToast({ message: err.response?.data?.message || 'Impossible de supprimer ce module, il est peut-être associé à des tickets.', type: 'error' });
        }
    };

    const handleSort = useCallback((key) => {
        setSortConfig(p => ({ key, direction: p.key === key && p.direction === 'asc' ? 'desc' : 'asc' }));
    }, []);
    const handleToggleColumn = useCallback((key) => setVisibleColumns(p => ({ ...p, [key]: !p[key] })), []);
    const toggleDropdownGlobal = useCallback((name) => {
        setOpenDropdown(prev => (prev === name ? null : name));
    }, []);

    const pdfHeaders = useMemo(() => [['ID', 'Module', 'Équipe', 'Tickets', 'Statut', 'Créé par', 'Date Création']], []);
    const pdfData = useMemo(() => processedModules.map(module => [
        module.id,
        module.designation,
        module.equipe?.designation || 'N/A',
        module.ticketList ? module.ticketList.length : 0,
        module.actif ? 'Actif' : 'Non actif',
        module.userCreation || 'N/A',
        formatDateFromArray(module.dateCreation)
    ]), [processedModules]);

    const excelData = useMemo(() => {
        return processedModules.map(module => ({
            ID: module.id,
            'Module': module.designation,
            'Équipe': module.equipe?.designation || 'N/A',
            'Tickets': module.ticketList ? module.ticketList.length : 0,
            'Statut': module.actif ? 'Actif' : 'Inactif',
            'Créé par': module.userCreation || 'N/A',
            'Date Création': formatDateFromArray(module.dateCreation)
        }));
    }, [processedModules]);

    const handleExportPdfModules = useCallback(() => {
        exportToPdf('Liste des Modules', pdfHeaders, pdfData, 'liste_modules.pdf');
        setOpenDropdown(null);
    }, [pdfHeaders, pdfData]);

    const handleExportExcelModules = useCallback(() => {
        exportTableToExcel(pdfHeaders, pdfData, 'liste_modules.xlsx', 'Modules');
        setOpenDropdown(null);
    }, [pdfHeaders, pdfData]);

    const handlePrintModules = useCallback(() => {
        let tableHtml = `<h2 style="text-align:center; font-size: 24px; margin-bottom: 20px;">Liste des Modules</h2>
                         <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                                <tr style="background-color:#f2f2f2;">
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Module</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Équipe</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Tickets</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Statut</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Créé par</th>
                                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Date Création</th>
                                </tr>
                            </thead>
                            <tbody>`;
        processedModules.forEach(module => {
            tableHtml += `<tr>
                            <td style="padding: 8px; border: 1px solid #ddd;">${module.id}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${module.designation}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${module.equipe?.designation || 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${module.ticketList ? module.ticketList.length : 0}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${module.actif ? 'Actif' : 'Non actif'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${module.userCreation || 'N/A'}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${formatDateFromArray(module.dateCreation)}</td>
                          </tr>`;
        });
        tableHtml += `</tbody></table>`;
        printHtmlContent(tableHtml, 'Impression Liste des Modules');
        setOpenDropdown(null);
    }, [processedModules]);

    useEffect(() => {
        setExportFunctions(handleExportPdfModules, handleExportExcelModules, handlePrintModules);
        return () => {
            setExportFunctions(null, null, null);
        };
    }, [setExportFunctions, handleExportPdfModules, handleExportExcelModules, handlePrintModules]);

    if (view === 'add') {
        return <AjouterModulePage onAddModule={handleAddModule} onCancel={() => { setView('list'); setToast({ message: "Ajout de module annulé.", type: 'info' }); }} availableEquipes={equipes} />;
    }

    return (
        <div className="p-0 md:p-0 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <style>{`
                .btn { @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150; }
                .btn-primary { @apply text-white bg-blue-600 hover:bg-blue-700 border-transparent focus:ring-blue-500; }
                .btn-secondary { @apply text-slate-700 bg-white hover:bg-slate-50 border-slate-300 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600; }
                .btn-danger { @apply text-white bg-red-600 hover:bg-red-700 border-transparent focus:ring-red-500; }
                .form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300; }
                .form-input { @apply block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm; }
                .form-textarea { @apply block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y; }
                .form-checkbox { @apply h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-500 dark:bg-slate-700 dark:checked:bg-blue-600 dark:checked:border-transparent; }
                .form-select-icon { @apply block w-full px-3 py-2 pl-10 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm; }
                .pagination-btn { @apply p-2 rounded-md text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .separateur-colonne-leger:not(:last-child) {
                    box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.05);
                }
                .dark .separateur-colonne-leger:not(:last-child) {
                    box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.05);
                }
                /* Styles pour le surlignage des lignes ajoutées/modifiées */
                .highlight-row {
                    background-color: #e0f2fe !important;
                    transition: background-color 0.5s ease-out;
                }
                .dark .highlight-row {
                    background-color: #0b2f4f !important;
                }
            `}</style>

            {/* Modals */}
            {moduleToDelete && <DeleteConfirmationModal module={moduleToDelete} onConfirm={handleDeleteModule} onCancel={() => setModuleToDelete(null)} />}
            {moduleToEdit && <EditModal module={moduleToEdit} equipes={equipes} onUpdate={handleUpdateModule} onCancel={() => { setModuleToEdit(null); setToast({ message: "Modification de module annulée.", type: 'info' }); }} />}

            {/* Message de notification */}
            {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Titre de la page */}
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Gestion des Modules</h1>

            {/* Barre de contrôles */}
            <div className="bg-white dark:bg-slate-800/80 px-4 py-0 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700 mb-0">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-grow max-w-xs">
                        <Search className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input type="text" placeholder="Rechercher par désignation..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input pl-10 w-full" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap" ref={dropdownsRef}>
                        <button onClick={() => setView('add')} className="btn btn-primary h-full px-3"><Plus size={20} /></button>
                        <button onClick={fetchModulesAndEquipes} className="btn btn-secondary h-full px-3" title="Rafraîchir"><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /></button>
                        
                        <div className="relative">
                            <button onClick={() => toggleDropdownGlobal('filter')} className="btn btn-secondary">
                                <Filter size={16} className="mr-2" />
                                {filterEquipeId === 'tous' ? 'Filtrer par équipe' : `Équipe: ${equipes.find(e => e.id?.toString() === filterEquipeId)?.designation || 'N/A'}`}
                            </button>
                            {openDropdown === 'filter' &&
                                <DropdownMenu>
                                    <DropdownMenuItem isSelected={filterEquipeId === 'tous' || filterEquipeId === ''} onClick={() => { setFilterEquipeId('tous'); toggleDropdownGlobal('filter'); }}>Toutes les équipes</DropdownMenuItem>
                                    {equipes.map(eq => (
                                        <DropdownMenuItem key={eq.id} isSelected={filterEquipeId === eq.id?.toString()} onClick={() => { setFilterEquipeId(eq.id?.toString()); toggleDropdownGlobal('filter'); }}>{eq.designation}</DropdownMenuItem>
                                    ))}
                                </DropdownMenu>
                            }
                        </div>
                        
                        <div className="relative"><button onClick={() => toggleDropdownGlobal('columns')} className="btn btn-secondary"><Eye size={16} className="mr-2" />Colonnes</button>
                            {openDropdown === 'columns' && <DropdownMenu>{Object.keys(visibleColumns).map(key => (<DropdownMenuItem key={key} onClick={() => handleToggleColumn(key)}>{visibleColumns[key] ? <Eye size={16} className="mr-2 text-blue-500" /> : <EyeOff size={16} className="mr-2 text-slate-400" />}<span className="capitalize">{key.replace(/([A-Z])/g, ' $1').replace('Datecreation', 'Date Création').replace('Creepar', 'Créé par')}</span></DropdownMenuItem>))}</DropdownMenu>}
                        </div>
                        <div className="relative"><button onClick={() => toggleDropdownGlobal('entries')} className="btn btn-secondary">{entriesPerPage} / page</button>
                            {openDropdown === 'entries' && <DropdownMenu>{[10, 25, 50].map(num => (<DropdownMenuItem isSelected={entriesPerPage === num} key={num} onClick={() => { setEntriesPerPage(num); toggleDropdownGlobal('entries'); }}>{num} lignes</DropdownMenuItem>))}</DropdownMenu>}
                        </div>
                        <button
                            onClick={handlePrintModules}
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
                                    <DropdownMenuItem onClick={handleExportPdfModules} disabled={!currentExportPdfFunction}>
                                        <File size={16} className="mr-2" /> Exporter en PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleExportExcelModules} disabled={!currentExportExcelFunction}>
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
                processedModules.length === 0 ? (
                    <div className="text-center py-10 text-slate-600 dark:text-slate-400">Aucun module trouvé pour la sélection actuelle.</div>
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
                                        {paginatedModules.map(module => (
                                            <ModuleTableRow
                                                key={module.id}
                                                module={module}
                                                onEdit={setModuleToEdit}
                                                onDelete={setModuleToDelete}
                                                visibleColumns={visibleColumns}
                                                highlightedModuleId={highlightedModuleId}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {processedModules.length > 0 &&
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    setCurrentPage={setCurrentPage}
                                    processedModules={processedModules}
                                    entriesPerPage={entriesPerPage}
                                />
                            }
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
                            {paginatedModules.map(module => (
                                <ModuleCard key={module.id} module={module} onEdit={() => setModuleToEdit(module)} onDelete={() => setModuleToDelete(module)} />
                            ))}
                        </div>
                    )
                )
            )}
        </div>
    );
};
export default ConsulterModulesPage;