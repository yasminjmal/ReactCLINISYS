// src/components/admin/Tickets/TicketsManagementPage.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, LayoutGrid, Filter as FilterIcon, ArrowUpDown, RefreshCw, ChevronDown, ChevronUp, Columns, List, PlusCircle, User, ChevronsRight, AlertTriangle, Package, Calendar, Shield, Clock } from 'lucide-react';

// --- Services ---
import ticketService from '../../../services/ticketService';
import utilisateurService from '../../../services/utilisateurService';
import clientService from '../../../services/clientService';
import moduleService from '../../../services/moduleService';

// --- Sous-composants ---
import TicketTableRow from './TicketTableRow';
import TicketCard from './TicketCard';
import TicketRow from './TicketRow';
import TicketDetailPage from './TicketDetailPage'; // La nouvelle page de détails
import PageAffectationTicket from './PageAffectationTicket';
import PageDiffractionTicket from './PageDiffractionTicket';
import TicketAccepteDetailsPage from './TicketAccepteDetailsPage';


const Spinner = () => <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto my-10"></div>;

const AddTicketModal = ({ onAddTicket, onCancel, showTemporaryMessage, availableClients, availableUsers, availableModules }) => {
    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        priorite: 'MOYENNE',
        idClient: '',
        idModule: '',
        idUtilisateur: '',
        date_echeance: '',
        actif: true,
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
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
                            <option value="BASSE">Basse</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-xs">Date d'échéance</label>
                        <input type="date" name="date_echeance" value={formData.date_echeance} onChange={handleInputChange} className="form-input" />
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
    const [availableClients, setAvailableClients] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [availableModules, setAvailableModules] = useState([]);

    // Nouvel état pour gérer l'affichage du panneau de détails
    const [selectedTicketId, setSelectedTicketId] = useState(null);

    const fetchAllNecessaryData = useCallback(async () => {
        setIsLoading(true);
        try {
            // MODIFICATION : On utilise le nouveau service pour ne récupérer que les tickets parents
            const [ticketsRes, clientsRes, usersRes, modulesRes] = await Promise.all([
                ticketService.getAllParentTickets(),
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
            showTemporaryMessage('error', 'Erreur lors du chargement des données.');
        } finally {
            setIsLoading(false);
        }
    }, [showTemporaryMessage]);

    useEffect(() => {
        fetchAllNecessaryData();
    }, [fetchAllNecessaryData]);

    const handleAddTicket = async (ticketData) => {
        try {
            await ticketService.createTicket(ticketData);
            showTemporaryMessage('success', 'Ticket créé avec succès.');
            setActiveModal(null);
            await fetchAllNecessaryData();
        } catch (error) {
            showTemporaryMessage('error', error.response?.data?.message || "Erreur lors de la création du ticket.");
        }
    };
    
    // GESTION DE L'AFFICHAGE DU PANNEAU DE DÉTAILS
    const handleShowDetails = (ticketId) => {
        setSelectedTicketId(ticketId);
    };

    const handleCloseDetails = () => {
        setSelectedTicketId(null);
    };

    const handleCancelModal = useCallback(() => {
        setActiveModal(null);
        setSelectedTicketForModal(null);
    }, []);

    const filteredAndSortedTickets = useMemo(() => {
        let processedTickets = [...tickets];
        // Appliquer la recherche
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            processedTickets = processedTickets.filter(t =>
                (t.titre?.toLowerCase().includes(lower)) ||
                (t.idClient?.nomComplet?.toLowerCase().includes(lower))
            );
        }
        // Appliquer les filtres
        // ... votre logique de filtrage ici ...

        // Appliquer le tri
        // ... votre logique de tri ici ...

        return processedTickets;
    }, [tickets, searchTerm, activeFilters, dateRange, activeSort]);

    const totalTicketsAffiches = filteredAndSortedTickets.length;

    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-100 dark:bg-slate-900 min-h-full">
            
            {/* Le panneau de détails s'affichera par-dessus la liste */}
            {selectedTicketId && (
                <TicketDetailPage 
                    ticketId={selectedTicketId} 
                    onClose={handleCloseDetails} 
                />
            )}

            {/* Modale pour ajouter un ticket */}
            {activeModal === 'add' && (
                <AddTicketModal
                    onAddTicket={handleAddTicket}
                    onCancel={() => setActiveModal(null)}
                    showTemporaryMessage={showTemporaryMessage}
                    availableClients={availableClients}
                    availableUsers={availableUsers}
                    availableModules={availableModules}
                />
            )}
            {/* Autres modales */}
            {activeModal === 'affectation' && selectedTicketForModal && (
                <PageAffectationTicket ticketObject={selectedTicketForModal} onConfirmAffectation={() => {}} onCancel={handleCancelModal} availableModules={availableModules} availableUsers={availableUsers} />
            )}


            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                        Gestion des Tickets ({totalTicketsAffiches})
                    </h2>
                    <div className="flex items-center space-x-2">
                         <button onClick={() => setActiveModal('add')} className="btn btn-primary">
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
                {/* La section des filtres et du tri ici... */}
            </div>

            {isLoading ? (
                <Spinner />
            ) : filteredAndSortedTickets.length > 0 ? (
                <div className="mt-6">
                    {viewMode === 'table' && (
                        <div className="overflow-x-auto shadow-xl rounded-lg border border-slate-400 dark:border-slate-600">
                            <table className="min-w-full">
                                <thead className="bg-slate-200 dark:bg-slate-700 text-xs uppercase text-slate-600 dark:text-slate-300">
                                  <tr>
                                    <th className="px-4 py-3 text-left font-semibold"><div className="flex items-center"><User size={14} className="mr-2"/>Client/Demandeur</div></th>
                                    <th className="px-4 py-3 text-left font-semibold"><div className="flex items-center"><ChevronsRight size={14} className="mr-2"/>Titre</div></th>
                                    <th className="px-4 py-3 text-left font-semibold"><div className="flex items-center"><AlertTriangle size={14} className="mr-2"/>Priorité/Statut</div></th>
                                    <th className="px-4 py-3 text-left font-semibold"><div className="flex items-center"><Package size={14} className="mr-2"/>Module</div></th>
                                    <th className="px-4 py-3 text-left font-semibold"><div className="flex items-center"><User size={14} className="mr-2"/>Affecté à</div></th>
                                    <th className="px-4 py-3 text-left font-semibold"><div className="flex items-center"><Clock size={14} className="mr-2"/>Date Échéance</div></th>
                                    <th className="px-4 py-3 text-left font-semibold"><div className="flex items-center"><Calendar size={14} className="mr-2"/>Créé le</div></th>
                                    <th className="px-4 py-3 text-left font-semibold"><div className="flex items-center"><Shield size={14} className="mr-2"/>Actif</div></th>
                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-300 dark:divide-slate-600">
                                    {filteredAndSortedTickets.map(ticket => (
                                        <TicketTableRow 
                                            key={ticket.id} 
                                            ticket={ticket} 
                                            onNavigateToDetails={handleShowDetails} 
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {viewMode === 'list' && (
                        <div className="space-y-3">
                            {filteredAndSortedTickets.map(ticket => (<TicketRow key={ticket.id} ticket={ticket} onNavigateToDetails={handleShowDetails} />))}
                        </div>
                    )}
                    {viewMode === 'card' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                            {filteredAndSortedTickets.map(ticket => (<TicketCard key={ticket.id} ticket={ticket} onNavigateToDetails={handleShowDetails} />))}
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