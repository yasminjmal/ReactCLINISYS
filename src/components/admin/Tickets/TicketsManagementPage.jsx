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
import TicketDetailPage from './TicketDetailPage';
import PageAffectationTicket from './PageAffectationTicket';
import PageDiffractionTicket from './PageDiffractionTicket';


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
        statue:'En_attenteee',
    });
    // ... (le reste du composant AddTicketModal reste identique)
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
     const handleSubmit = async (e) => {
        e.preventDefault();
        onAddTicket({ ...formData, statue: 'EN_ATTENTE' });
    };

    return (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-lg w-full animate-slide-in-up overflow-y-auto max-h-[90vh]">
                <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">Ajouter un Nouveau Ticket</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                   {/* Le contenu du formulaire reste le même */}
                    <div>
                        <label className="form-label text-xs">Titre *</label>
                        <input type="text" name="titre" value={formData.titre} onChange={handleInputChange} className="form-input" placeholder="Sujet principal du ticket" required/>
                    </div>
                     <div>
                        <label className="form-label text-xs">Client *</label>
                        <select name="idClient" value={formData.idClient} onChange={handleInputChange} className="form-select" required>
                            <option value="">Sélectionner un client</option>
                            {availableClients.map(client => (
                                <option key={client.id} value={client.id}>{client.nomComplet}</option>
                            ))}
                        </select>
                    </div>
                     {/* ... autres champs ... */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onCancel} className="btn btn-secondary">Annuler</button>
                        <button type="submit" className="btn btn-primary">Créer Ticket</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TicketsManagementPage = ({ showTemporaryMessage, initialFilterStatus, initialTickets = null }) => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeModal, setActiveModal] = useState(null);
    const [selectedTicketForModal, setSelectedTicketForModal] = useState(null);
    const [availableClients, setAvailableClients] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [availableModules, setAvailableModules] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null);

    // --- LOGIQUE POUR L'EXPANSION DES LIGNES ---
    const [expandedRows, setExpandedRows] = useState({});
    const toggleRowExpansion = (ticketId) => {
        setExpandedRows(prev => ({
            ...prev,
            [ticketId]: !prev[ticketId]
        }));
    };
    // ---------------------------------------------

    const fetchAllNecessaryData = useCallback(async () => {
        setIsLoading(true);
        try {
            // ... (votre logique de fetch existante) ...
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
            console.error("Erreur chargement données:", error);
            if(showTemporaryMessage) showTemporaryMessage('error', 'Erreur de chargement des données.');
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
            if(showTemporaryMessage) showTemporaryMessage('success', 'Ticket créé avec succès.');
            setActiveModal(null);
            await fetchAllNecessaryData();
        } catch (error) {
            if(showTemporaryMessage) showTemporaryMessage('error', error.response?.data?.message || "Erreur lors de la création du ticket.");
        }
    };
    
    const handleShowDetails = (ticketId) => setSelectedTicketId(ticketId);
    const handleCloseDetails = () => setSelectedTicketId(null);
    
    // Placeholder pour la navigation vers la page de mise à jour
    const handleNavigateToUpdate = (ticketId) => {
        console.log(`Navigation vers la page de mise à jour pour le ticket ID: ${ticketId}`);
        // Implémentez votre logique de navigation ici (ex: history.push(...))
    };

    const filteredAndSortedTickets = useMemo(() => {
        // Filtre les tickets parents uniquement
        return tickets.filter(t => 
            !t.parentId && (
                (t.titre?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (t.idClient?.nomComplet?.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        );
    }, [tickets, searchTerm]);

    const totalTicketsAffiches = filteredAndSortedTickets.length;

    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-100 dark:bg-slate-900 min-h-full">
            
            {selectedTicketId && <TicketDetailPage ticketId={selectedTicketId} onClose={handleCloseDetails} />}
            {activeModal === 'add' && <AddTicketModal onAddTicket={handleAddTicket} onCancel={() => setActiveModal(null)} showTemporaryMessage={showTemporaryMessage} availableClients={availableClients} availableUsers={availableUsers} availableModules={availableModules} />}
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Gestion des Tickets ({totalTicketsAffiches})</h2>
                    <div className="flex items-center space-x-2">
                         <button onClick={() => setActiveModal('add')} className="btn btn-primary"><PlusCircle size={18} className="mr-2"/> Ajouter Ticket</button>
                         <button onClick={fetchAllNecessaryData} className="btn btn-secondary-icon" title="Rafraîchir" disabled={isLoading}><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /></button>
                         {/* ... autres boutons de vue ... */}
                    </div>
                </div>
            </div>

            {isLoading ? <Spinner /> : filteredAndSortedTickets.length > 0 ? (
                <div className="overflow-x-auto shadow-xl rounded-lg border border-slate-400 dark:border-slate-600">
                    <table className="min-w-full">
                        <thead className="bg-slate-200 dark:bg-slate-700 text-xs uppercase text-slate-600 dark:text-slate-300">
                           <tr>
                                <th className="px-4 py-3 text-left font-semibold">Client/Demandeur</th>
                                <th className="px-4 py-3 text-left font-semibold">Titre</th>
                                <th className="px-4 py-3 text-left font-semibold">Priorité/Statut</th>
                                <th className="px-4 py-3 text-left font-semibold">Module</th>
                                <th className="px-4 py-3 text-left font-semibold">Affecté à</th>
                                <th className="px-4 py-3 text-left font-semibold">Date Échéance</th>
                                <th className="px-4 py-3 text-left font-semibold">Créé le</th>
                                <th className="px-4 py-3 text-left font-semibold">Actif</th>
                                <th className="px-4 py-3 text-left font-semibold">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300 dark:divide-slate-600">
                            {filteredAndSortedTickets.map(ticket => (
                                <TicketTableRow 
                                    key={ticket.id} 
                                    ticket={ticket} 
                                    onNavigateToDetails={handleShowDetails}
                                    onNavigateToUpdate={handleNavigateToUpdate}
                                    isExpanded={!!expandedRows[ticket.id]}
                                    onToggleExpand={toggleRowExpansion} // LA PROP EST MAINTENANT PASSÉE
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 py-10">Aucun ticket trouvé.</p>
            )}
        </div>
    );
};

export default TicketsManagementPage;
