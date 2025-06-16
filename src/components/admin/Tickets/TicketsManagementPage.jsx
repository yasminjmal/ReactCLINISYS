// src/components/admin/Tickets/TicketsManagementPage.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, LayoutGrid, Filter as FilterIcon, ArrowUpDown, RefreshCw, ChevronDown, ChevronUp, Columns, List, PlusCircle, User, ChevronsRight, AlertTriangle, Package, Calendar, Shield } from 'lucide-react';import { useLocation } from 'react-router-dom';

// --- Services ---
import ticketService from '../../../services/ticketService';
import utilisateurService from '../../../services/utilisateurService';
import clientService from '../../../services/clientService';
import moduleService from '../../../services/moduleService';

// --- Sous-composants ---
import TicketTableRow from './TicketTableRow';
import TicketCard from './TicketCard';
import TicketRow from './TicketRow';
import TicketDetailsPage from './TicketDetailsPage';
import PageAffectationTicket from './PageAffectationTicket';
import PageDiffractionTicket from './PageDiffractionTicket';

const Spinner = () => <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto my-10"></div>;

// NOTE: This component is not used here anymore but might be useful elsewhere.
const PageMessage = ({ message, onDismiss }) => {
    if (!message) return null;
    const colors = {
        success: 'bg-green-100 dark:bg-green-800/70 border-green-500 text-green-700 dark:text-green-100',
        error: 'bg-red-100 dark:bg-red-800/70 border-red-500 text-red-700 dark:text-red-100',
        info: 'bg-blue-100 dark:bg-blue-800/70 border-blue-500 text-blue-700 dark:text-blue-100',
        warning: 'bg-yellow-100 dark:bg-yellow-800/70 border-yellow-500 text-yellow-700 dark:text-yellow-100',
    };
    return (
        <div className={`fixed top-24 right-6 p-4 rounded-md shadow-lg z-[100] flex items-center space-x-3 animate-slide-in-right border-l-4 ${colors[message.type]}`} role="alert">
            <span className="font-medium flex-grow">{message.text}</span>
            <button onClick={onDismiss} className="ml-auto p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full">X</button>
        </div>
    );
};

const AddTicketModal = ({ onAddTicket, onCancel, showTemporaryMessage, availableClients, availableUsers, availableModules }) => {
    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        priorite: 'MOYENNE',
        idClient: '',
        idModule: '',
        idUtilisateur: '',
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.titre.trim()) newErrors.titre = "Le titre est requis.";
        if (!formData.idClient) newErrors.idClient = "Le client est requis.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            const dataToSubmit = { ...formData, statue: 'EN_ATTENTE' };
            onAddTicket(dataToSubmit);
        } else {
            showTemporaryMessage('error', 'Veuillez corriger les erreurs dans le formulaire.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-lg w-full animate-slide-in-up overflow-y-auto max-h-[90vh]">
                <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">Ajouter un Nouveau Ticket</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label text-xs">Titre *</label>
                        <input type="text" name="titre" value={formData.titre} onChange={handleInputChange} className="form-input" placeholder="Sujet principal du ticket" />
                        {errors.titre && <p className="form-error-text">{errors.titre}</p>}
                    </div>
                    <div>
                        <label className="form-label text-xs">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-textarea" rows="3" placeholder="Détails du problème ou de la demande"></textarea>
                    </div>
                    <div>
                        <label className="form-label text-xs">Client *</label>
                        <select name="idClient" value={formData.idClient} onChange={handleInputChange} className="form-select">
                            <option value="">Sélectionner un client</option>
                            {availableClients.map(client => (
                                <option key={client.id} value={client.id}>{client.nomComplet}</option>
                            ))}
                        </select>
                        {errors.idClient && <p className="form-error-text">{errors.idClient}</p>}
                    </div>
                    <div>
                        <label className="form-label text-xs">Priorité</label>
                        <select name="priorite" value={formData.priorite} onChange={handleInputChange} className="form-select">
                            <option value="HAUTE">Haute</option>
                            <option value="MOYENNE">Moyenne</option>
                            <option value="FAIBLE">Faible</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-xs">Module (optionnel)</label>
                        <select name="idModule" value={formData.idModule} onChange={handleInputChange} className="form-select">
                            <option value="">Sélectionner un module</option>
                            {availableModules.map(module => (
                                <option key={module.id} value={module.id}>{module.nom}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-xs">Assigné à (optionnel)</label>
                        <select name="idUtilisateur" value={formData.idUtilisateur} onChange={handleInputChange} className="form-select">
                            <option value="">Sélectionner un employé</option>
                            {availableUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.prenom} {user.nom}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onCancel} className="btn btn-secondary">Annuler</button>
                        <button type="submit" className="btn btn-primary">Créer Ticket</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TicketsManagementPage = ({ showTemporaryMessage, initialFilterStatus }) => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ statut: [], priorite: [], client: [], module: [], assigneA: [] });
    const [activeSort, setActiveSort] = useState({ field: 'dateCreation', order: 'desc' });
    const filterDropdownRef = useRef(null);
    const sortDropdownRef = useRef(null);
    const [activeModal, setActiveModal] = useState(null);
    const [selectedTicketForModal, setSelectedTicketForModal] = useState(null);
    const [highlightedItemId, setHighlightedItemId] = useState(null);
    const [newlyCreatedTicketIds, setNewlyCreatedTicketIds] = useState([]);
    const [autoExpandTicketId, setAutoExpandTicketId] = useState(null);
    const [availableClients, setAvailableClients] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [availableModules, setAvailableModules] = useState([]);

    useEffect(() => {
        if (initialFilterStatus) {
            if (initialFilterStatus === 'ALL' || !initialFilterStatus) {
                setActiveFilters({ statut: [], priorite: [], client: [], module: [], assigneA: [] });
            } else if (initialFilterStatus === 'ACCEPTE_OR_EN_COURS') {
                setActiveFilters(prev => ({ ...prev, statut: ['ACCEPTE', 'EN_COURS'] }));
            } else {
                setActiveFilters(prev => ({ ...prev, statut: [initialFilterStatus] }));
            }
        }
    }, [initialFilterStatus]);

    const fetchAllNecessaryData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [ticketsRes, clientsRes, usersRes, modulesRes] = await Promise.all([
                ticketService.getAllTickets(),
                clientService.getAllClients(),
                utilisateurService.getAllUtilisateurs(),
                moduleService.getAllModules(),
            ]);
            setTickets(ticketsRes);
            setAvailableClients(clientsRes.data || []);
            setAvailableUsers(usersRes.data || []);
            setAvailableModules(modulesRes.data || []);
        } catch (error) {
            console.error("Erreur lors du chargement des données initiales:", error);
            showTemporaryMessage('error', 'Erreur lors du chargement des données des tickets.');
        } finally {
            setIsLoading(false);
        }
    }, [showTemporaryMessage]);

    useEffect(() => {
        fetchAllNecessaryData();
    }, [fetchAllNecessaryData]);

    const handleNavigateToTicketDetails = useCallback(async (ticketId, isSubTicket = false) => {
        try {
            const fullTicket = await ticketService.getTicketById(ticketId);
            if (isSubTicket && fullTicket.parentId) {
                const parentTicket = await ticketService.getTicketById(fullTicket.parentId);
                fullTicket._parentInfo = { id: parentTicket.id, ref: parentTicket.ref };
            }
            setSelectedTicketForModal(fullTicket);
            if (fullTicket.statue === 'EN_ATTENTE') {
                setActiveModal('details_en_attente');
            } else {
                setActiveModal('details_affectes');
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du ticket pour les détails:", error);
            showTemporaryMessage('error', "Impossible d'afficher les détails du ticket.");
        }
    }, [showTemporaryMessage]);

    const handleNavigateToAffectation = useCallback((ticketId) => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
            setSelectedTicketForModal(ticket);
            setActiveModal('affectation');
        }
    }, [tickets]);

    const handleNavigateToDiffraction = useCallback((ticketId) => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
            setSelectedTicketForModal(ticket);
            setActiveModal('diffraction');
        }
    }, [tickets]);

    const handleCancelModal = useCallback(() => {
        setActiveModal(null);
        setSelectedTicketForModal(null);
        setHighlightedItemId(null);
        setNewlyCreatedTicketIds([]);
        setAutoExpandTicketId(null);
    }, []);

    const handleOpenAddTicketModal = useCallback(() => {
        setActiveModal('add');
    }, []);

    const handleAddTicket = async (ticketData) => {
        try {
            const newTicket = await ticketService.createTicket(ticketData);
            showTemporaryMessage('success', `Ticket ${newTicket.ref} créé avec succès.`);
            setHighlightedItemId(newTicket.id);
            handleCancelModal();
            await fetchAllNecessaryData();
        } catch (error) {
            console.error("Erreur lors de la création du ticket:", error.response?.data || error.message);
            showTemporaryMessage('error', error.response?.data?.message || "Erreur lors de la création du ticket.");
        }
    };

    const handleAcceptTicket = async (ticketId) => {
        try {
            const updatedTicket = await ticketService.accepterTicket(ticketId);
            showTemporaryMessage('success', `Ticket ${updatedTicket.ref} accepté.`);
            setHighlightedItemId(updatedTicket.id);
            handleCancelModal();
            await fetchAllNecessaryData();
        } catch (error) {
            showTemporaryMessage('error', error.response?.data?.message || "Erreur lors de l'acceptation du ticket.");
        }
    };

    const handleRefuseTicket = async (ticketId, motifRefus) => {
        try {
            const updatedTicket = await ticketService.refuserTicket(ticketId, motifRefus);
            showTemporaryMessage('info', `Ticket ${updatedTicket.ref} refusé.`);
            setHighlightedItemId(updatedTicket.id);
            handleCancelModal();
            await fetchAllNecessaryData();
        } catch (error) {
            showTemporaryMessage('error', error.response?.data?.message || "Erreur lors du refus du ticket.");
        }
    };

    const handleConfirmAffectation = async (ticketId, affectationData) => {
        try {
            const updatedTicket = await ticketService.affecterTicket(ticketId, affectationData);
            showTemporaryMessage('success', `Ticket ${updatedTicket.ref} affecté.`);
            setHighlightedItemId(updatedTicket.id);
            handleCancelModal();
            await fetchAllNecessaryData();
        } catch (error) {
            showTemporaryMessage('error', error.response?.data?.message || "Erreur lors de l'affectation du ticket.");
        }
    };

    const handleConfirmDiffraction = async (parentTicketId, subTicketsData) => {
        try {
            const createdSubTickets = await ticketService.diffracterTicket(parentTicketId, subTicketsData);
            showTemporaryMessage('success', `Ticket ${selectedTicketForModal.ref} diffracté. ${createdSubTickets.length} sous-ticket(s) créé(s).`);
            setNewlyCreatedTicketIds(createdSubTickets.map(t => t.id));
            setAutoExpandTicketId(parentTicketId);
            handleCancelModal();
            await fetchAllNecessaryData();
        } catch (error) {
            showTemporaryMessage('error', error.response?.data?.message || "Erreur lors de la diffraction du ticket.");
        }
    };

    const handleShowNoSubTicketsMessage = useCallback(() => {
        showTemporaryMessage('info', "Ce ticket n'a pas de sous-tickets.");
    }, [showTemporaryMessage]);

    const uniqueClientsForFilter = useMemo(() => {
        if (!Array.isArray(tickets)) return [];
        const clients = tickets.map(ticket => (ticket.idClient?.nomComplet)).filter(Boolean);
        return [...new Set(clients)].sort();
    }, [tickets]);
    
    const uniqueModulesForFilter = useMemo(() => {
        if (!Array.isArray(tickets)) return [];
        const modules = tickets.map(ticket => ticket.idModule?.nom).filter(Boolean);
        return [...new Set(modules)].sort();
    }, [tickets]);
    
    const uniqueAssignedUsersForFilter = useMemo(() => {
        if (!Array.isArray(tickets)) return [];
        const users = tickets.map(ticket => (ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom || ''} ${ticket.idUtilisateur.nom || ''}`.trim() : null)).filter(Boolean);
        return [...new Set(users)].sort();
    }, [tickets]);

    const priorityOptions = [{ value: 'HAUTE', label: 'Haute' }, { value: 'MOYENNE', label: 'Moyenne' }, { value: 'FAIBLE', label: 'Faible' }];
    const statusOptionsForFilter = [{ value: 'EN_ATTENTE', label: 'En attente' }, { value: 'ACCEPTE', label: 'Accepté' }, { value: 'EN_COURS', label: 'En cours' }, { value: 'RESOLU', label: 'Résolu' }, { value: 'FERME', label: 'Fermé' }, { value: 'REFUSE', label: 'Refusé' }];
    const sortOptions = [{ value: 'dateCreation', label: 'Date de création' }, { value: 'ref', label: 'Référence' }, { value: 'priorite', label: 'Priorité' }, { value: 'client', label: 'Client' }, { value: 'titre', label: 'Titre' }];

    const handleFilterChange = (category, value) => {
        setActiveFilters(prev => ({ ...prev, [category]: prev[category].includes(value) ? prev[category].filter(item => item !== value) : [...prev[category], value] }));
    };

    const handleSortChange = (field) => {
        setActiveSort(prev => ({ field, order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc' }));
        setIsSortDropdownOpen(false);
    };

    const clearAllFilters = () => {
        setActiveFilters({ statut: [], priorite: [], client: [], module: [], assigneA: [] });
        setDateRange({ from: '', to: '' });
        setSearchTerm('');
        setIsFilterDropdownOpen(false);
    };

    const countActiveFilters = () => {
        let count = Object.values(activeFilters).reduce((acc, curr) => acc + (curr.length > 0 ? 1 : 0), 0);
        if (dateRange.from || dateRange.to) count++;
        return count;
    };

    const filteredAndSortedTickets = useMemo(() => {
        let processedTickets = [...tickets];
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            processedTickets = processedTickets.filter(t =>
                (t.ref?.toLowerCase().includes(lower)) ||
                (t.idClient?.nomComplet?.toLowerCase().includes(lower)) ||
                (t.titre?.toLowerCase().includes(lower))
            );
        }
        if (activeFilters.priorite.length > 0) processedTickets = processedTickets.filter(t => activeFilters.priorite.includes(t.priorite));
        if (activeFilters.client.length > 0) processedTickets = processedTickets.filter(t => activeFilters.client.includes(t.idClient?.nomComplet));
        if (activeFilters.module.length > 0) processedTickets = processedTickets.filter(t => activeFilters.module.includes(t.idModule?.nom));
        if (activeFilters.assigneA.length > 0) processedTickets = processedTickets.filter(t => activeFilters.assigneA.includes(`${t.idUtilisateur?.prenom} ${t.idUtilisateur?.nom}`));
        if (activeFilters.statut.length > 0) {
            processedTickets = processedTickets.filter(t => {
                const isEnCours = t.idUtilisateur && t.statue !== 'RESOLU' && t.statue !== 'FERME';
                const displayStatus = isEnCours ? 'EN_COURS' : t.statue;
                return activeFilters.statut.includes(displayStatus);
            });
        }
        if (dateRange.from) processedTickets = processedTickets.filter(t => new Date(t.dateCreation) >= new Date(dateRange.from));
        if (dateRange.to) {
            const to = new Date(dateRange.to);
            to.setDate(to.getDate() + 1);
            processedTickets = processedTickets.filter(t => new Date(t.dateCreation) < to);
        }
        if (activeSort.field) {
            processedTickets.sort((a, b) => {
                let valA = a[activeSort.field];
                let valB = b[activeSort.field];
                if (activeSort.field === 'client') { valA = a.idClient?.nomComplet; valB = b.idClient?.nomComplet; }
                if (activeSort.field === 'module') { valA = a.idModule?.nom; valB = b.idModule?.nom; }
                if (activeSort.field === 'assigneA') { valA = `${a.idUtilisateur?.prenom} ${a.idUtilisateur?.nom}`; valB = `${b.idUtilisateur?.prenom} ${b.idUtilisateur?.nom}`; }
                let comp = 0;
                if (valA > valB) comp = 1; else if (valA < valB) comp = -1;
                return activeSort.order === 'asc' ? comp : -comp;
            });
        }
        return processedTickets;
    }, [tickets, searchTerm, activeFilters, dateRange, activeSort]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) setIsFilterDropdownOpen(false);
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) setIsSortDropdownOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const totalTicketsAffiches = filteredAndSortedTickets.length;

    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-100 dark:bg-slate-900 min-h-full">
            {/* --- THIS LINE WAS REMOVED ---
            <PageMessage message={pageMessage} onDismiss={() => setPageMessage(null)} />
            */}

            {activeModal === 'add' && (
                <AddTicketModal
                    onAddTicket={handleAddTicket}
                    onCancel={handleCancelModal}
                    showTemporaryMessage={showTemporaryMessage}
                    availableClients={availableClients}
                    availableUsers={availableUsers}
                    availableModules={availableModules}
                />
            )}
            {activeModal === 'details_en_attente' && selectedTicketForModal && (
                <TicketDetailsPage ticket={selectedTicketForModal} onAccepterTicket={handleAcceptTicket} onRefuserTicket={handleRefuseTicket} onCancelToList={handleCancelModal} />
            )}
            {activeModal === 'details_affectes' && selectedTicketForModal && (
                <TicketAccepteDetailsPage ticket={selectedTicketForModal} onNavigateToAffectation={handleNavigateToAffectation} onNavigateToDiffraction={handleNavigateToDiffraction} onCancelToList={handleCancelModal} />
            )}
            {activeModal === 'affectation' && selectedTicketForModal && (
                <PageAffectationTicket ticketObject={selectedTicketForModal} onConfirmAffectation={handleConfirmAffectation} onCancel={handleCancelModal} availableModules={availableModules} availableUsers={availableUsers} />
            )}
            {activeModal === 'diffraction' && selectedTicketForModal && (
                <PageDiffractionTicket parentTicket={selectedTicketForModal} onConfirmDiffraction={handleConfirmDiffraction} onCancel={handleCancelModal} />
            )}

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                        Gestion des Tickets ({totalTicketsAffiches})
                    </h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleOpenAddTicketModal} className="btn btn-primary">
                            <PlusCircle size={18} className="mr-2"/> Ajouter Ticket
                        </button>
                        <button onClick={fetchAllNecessaryData} className="btn btn-secondary-icon" title="Rafraîchir" disabled={isLoading}>
                            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <button onClick={() => setViewMode('table')} className={`btn-icon ${viewMode === 'table' ? 'btn-active' : 'btn-inactive'}`} title="Vue Tableau"><Columns size={20} /></button>
                        <button onClick={() => setViewMode('list')} className={`btn-icon ${viewMode === 'list' ? 'btn-active' : 'btn-inactive'}`} title="Vue Ligne"><List size={20} /></button>
                        <button onClick={() => setViewMode('card')} className={`btn-icon ${viewMode === 'card' ? 'btn-active' : 'btn-inactive'}`} title="Vue Cartes"><LayoutGrid size={20} /></button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end mb-5">
                    <div className="relative lg:col-span-2">
                        <label htmlFor="search-tickets" className="sr-only">Rechercher</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" /> </div>
                        <input type="text" id="search-tickets" placeholder="Rechercher (Réf, Client, Titre, Module, Assigné...)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input-icon w-full py-2 text-sm pl-10"/>
                    </div>
                    <div className="relative" ref={filterDropdownRef}>
                        <button onClick={() => setIsFilterDropdownOpen(o => !o)} className="btn btn-default w-full flex items-center justify-between group">
                            <div className="flex items-center"> <FilterIcon size={16} className="mr-2 text-slate-500 dark:text-slate-400 group-hover:text-sky-500" /> <span className="text-sm">Filtrer</span> {countActiveFilters() > 0 && (<span className="ml-2 bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{countActiveFilters()}</span>)} </div>
                            <ChevronDown size={18} className={`text-slate-400 dark:text-slate-500 group-hover:text-sky-500 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isFilterDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-full md:w-80 bg-white dark:bg-slate-800 rounded-md shadow-xl border border-slate-200 dark:border-slate-700 z-20 p-4 space-y-4">
                                <div><h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Priorité</h5>{priorityOptions.map(opt => (<label key={opt.value} className="flex items-center space-x-2 cursor-pointer text-sm p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50"><input type="checkbox" value={opt.value} checked={activeFilters.priorite.includes(opt.value)} onChange={() => handleFilterChange('priorite', opt.value)} className="form-checkbox"/><span>{opt.label}</span></label>))}</div><hr className="dark:border-slate-600"/>
                                <div><h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Statut</h5>{statusOptionsForFilter.map(opt => (<label key={opt.value} className="flex items-center space-x-2 cursor-pointer text-sm p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50"><input type="checkbox" value={opt.value} checked={activeFilters.statut.includes(opt.value)} onChange={() => handleFilterChange('statut', opt.value)} className="form-checkbox"/><span>{opt.label}</span></label>))}</div><hr className="dark:border-slate-600"/>
                                <div><h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Client</h5><div className="max-h-32 overflow-y-auto space-y-1 pr-1">{uniqueClientsForFilter.map(c => (<label key={c} className="flex items-center space-x-2 cursor-pointer text-sm p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50"><input type="checkbox" value={c} checked={activeFilters.client.includes(c)} onChange={() => handleFilterChange('client', c)} className="form-checkbox"/><span>{c}</span></label>))}{uniqueClientsForFilter.length === 0 && <p className="text-xs italic p-1.5">Aucun client.</p>}</div></div><hr className="dark:border-slate-600"/>
                                <div><h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Module</h5><div className="max-h-32 overflow-y-auto space-y-1 pr-1">{uniqueModulesForFilter.map(m => (<label key={m} className="flex items-center space-x-2 cursor-pointer text-sm p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50"><input type="checkbox" value={m} checked={activeFilters.module.includes(m)} onChange={() => handleFilterChange('module', m)} className="form-checkbox"/><span>{m}</span></label>))}{uniqueModulesForFilter.length === 0 && <p className="text-xs italic p-1.5">Aucun module.</p>}</div></div><hr className="dark:border-slate-600"/>
                                <div><h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Assigné à</h5><div className="max-h-32 overflow-y-auto space-y-1 pr-1">{uniqueAssignedUsersForFilter.map(u => (<label key={u} className="flex items-center space-x-2 cursor-pointer text-sm p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50"><input type="checkbox" value={u} checked={activeFilters.assigneA.includes(u)} onChange={() => handleFilterChange('assigneA', u)} className="form-checkbox"/><span>{u}</span></label>))}{uniqueAssignedUsersForFilter.length === 0 && <p className="text-xs italic p-1.5">Aucun employé.</p>}</div></div><hr className="dark:border-slate-600"/>
                                <div><h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Date de création</h5><div className="grid grid-cols-2 gap-2"><div><input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({...p, from: e.target.value}))} className="form-input py-1.5 text-xs w-full" title="Du"/></div><div><input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({...p, to: e.target.value}))} className="form-input py-1.5 text-xs w-full" title="Au"/></div></div></div>
                                <div className="pt-3 border-t dark:border-slate-600 flex justify-end mt-3"><button onClick={clearAllFilters} className="btn btn-link text-xs">Réinitialiser</button></div>
                            </div>
                        )}
                    </div>
                    <div className="relative" ref={sortDropdownRef}>
                        <button onClick={() => setIsSortDropdownOpen(o => !o)} className="btn btn-default w-full flex items-center justify-between group">
                           <div className="flex items-center"><ArrowUpDown size={16} className="mr-2 text-slate-500 dark:text-slate-400 group-hover:text-sky-500" /> <span className="text-sm truncate">Trier par: {sortOptions.find(o => o.value === activeSort.field)?.label || 'Défaut'}</span></div>
                           {activeSort.order === 'asc' ? <ChevronUp size={16} className="ml-1 text-slate-400"/> : <ChevronDown size={16} className="ml-1 text-slate-400"/>}
                        </button>
                        {isSortDropdownOpen && (
                            <div className="absolute top-full right-0 mt-1 w-full md:w-56 bg-white dark:bg-slate-800 rounded-md shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-1">
                                {sortOptions.map(opt => (<button key={opt.value} onClick={() => handleSortChange(opt.value)} className={`w-full text-left px-3 py-2 text-sm flex justify-between items-center ${activeSort.field === opt.value ? 'bg-sky-50 dark:bg-sky-700/20 text-sky-600 dark:text-sky-300 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>{opt.label} {activeSort.field === opt.value && (activeSort.order === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}</button>))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <Spinner />
            ) : filteredAndSortedTickets.length > 0 ? (
                <div className="mt-6">
                    {viewMode === 'table' && (
                        <div className="overflow-x-auto shadow-xl rounded-lg border border-slate-400 dark:border-slate-600">
                            <table className="min-w-full">
                                <thead className="bg-slate-200 dark:bg-slate-700">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                      <div className="flex items-center"><User size={14} className="mr-2"/>Client/Demandeur</div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                      <div className="flex items-center"><ChevronsRight size={14} className="mr-2"/>Titre</div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                      <div className="flex items-center"><AlertTriangle size={14} className="mr-2"/>Priorité/Statut</div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                      <div className="flex items-center"><Package size={14} className="mr-2"/>Module</div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                      <div className="flex items-center"><User size={14} className="mr-2"/>Affecté à</div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                      <div className="flex items-center"><Calendar size={14} className="mr-2"/>Créé le</div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                      <div className="flex items-center"><Shield size={14} className="mr-2"/>Actif</div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                      Action  s
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-300 dark:divide-slate-600">
                                    {filteredAndSortedTickets.map(ticket => (
                                        <TicketTableRow key={ticket.id} ticket={ticket} onNavigateToDetailsCallback={handleNavigateToTicketDetails} highlightedItemId={highlightedItemId} actionStatus={activeModal} newlyCreatedTicketIds={newlyCreatedTicketIds} isExpanded={autoExpandTicketId === ticket.id} onToggleExpand={(id) => setAutoExpandTicketId(id === autoExpandTicketId ? null : id)} onShowNoSubTicketsMessage={handleShowNoSubTicketsMessage} availableUsers={availableUsers} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {viewMode === 'list' && (
                        <div className="space-y-3">
                            {filteredAndSortedTickets.map(ticket => (<TicketRow key={ticket.id} ticket={ticket} onNavigateToDetails={handleNavigateToTicketDetails} isHighlighted={highlightedItemId === ticket.id || (newlyCreatedTicketIds && newlyCreatedTicketIds.includes(ticket.id))} />))}
                        </div>
                    )}
                    {viewMode === 'card' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                            {filteredAndSortedTickets.map(ticket => (<TicketCard key={ticket.id} ticket={ticket} onNavigateToDetails={handleNavigateToTicketDetails} isHighlighted={highlightedItemId === ticket.id || (newlyCreatedTicketIds && newlyCreatedTicketIds.includes(ticket.id))} />))}
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 py-10">Aucun ticket ne correspond à vos critères.</p>
            )}
        </div>
    );
};

export default TicketsManagementPage;