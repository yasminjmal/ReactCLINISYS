// src/components/admin/Tickets/TicketsManagementPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, PlusCircle, RefreshCw } from 'lucide-react';

// --- Services ---
import ticketService from '../../../services/ticketService';
import clientService from '../../../services/clientService';
import utilisateurService from '../../../services/utilisateurService';
import moduleService from '../../../services/moduleService';

// --- Sous-composants ---
import TicketTableRow from './TicketTableRow';
import TicketDetailPage from './TicketDetailPage';
import TicketUpdateView from './TicketUpdateView'; // NOUVEL IMPORT

const Spinner = () => <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto my-10"></div>;
const AddTicketModal = ({ onAddTicket, onCancel, ...props }) => { /* ... Le code de votre AddTicketModal ... */ return null; };


const TicketsManagementPage = ({ showTemporaryMessage }) => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeModal, setActiveModal] = useState(null);
    const [availableData, setAvailableData] = useState({ clients: [], users: [], modules: [] });
    const [selectedTicketIdForDetails, setSelectedTicketIdForDetails] = useState(null);

    // --- NOUVEL ÉTAT POUR GÉRER LA VUE ---
    const [currentView, setCurrentView] = useState({ view: 'list', ticketId: null });

    // --- LOGIQUE POUR L'EXPANSION DES LIGNES ---
    const [expandedRows, setExpandedRows] = useState({});
    const toggleRowExpansion = (ticketId) => {
        setExpandedRows(prev => ({ ...prev, [ticketId]: !prev[ticketId] }));
    };

    const fetchAllNecessaryData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [ticketsRes, clientsRes, usersRes, modulesRes] = await Promise.all([
                ticketService.getAllParentTickets(),
                clientService.getAllClients(),
                utilisateurService.getAllUtilisateurs(),
                moduleService.getAllModules(),
            ]);
            setTickets(ticketsRes);
            setAvailableData({
                clients: clientsRes.data || [],
                users: usersRes.data || [],
                modules: modulesRes.data || []
            });
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

    // --- FONCTIONS DE NAVIGATION INTERNE ---
    const handleNavigateToUpdate = (ticketId) => {
        setCurrentView({ view: 'update', ticketId: ticketId });
    };

    const handleBackToList = () => {
        setCurrentView({ view: 'list', ticketId: null });
        fetchAllNecessaryData(); // Rafraîchir la liste au cas où des changements ont eu lieu
    };

    const handleShowDetails = (ticketId) => setSelectedTicketIdForDetails(ticketId);
    const handleCloseDetails = () => setSelectedTicketIdForDetails(null);

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => 
            !t.parentId && (
                (t.titre?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (t.idClient?.nomComplet?.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        );
    }, [tickets, searchTerm]);


    // --- Rendu conditionnel de la vue ---
    if (currentView.view === 'update') {
        return <TicketUpdateView 
                 ticketId={currentView.ticketId} 
                 onBack={handleBackToList} 
                 showTemporaryMessage={showTemporaryMessage} 
               />;
    }

    // --- Rendu de la vue LISTE ---
    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-100 dark:bg-slate-900 min-h-full">
            {selectedTicketIdForDetails && <TicketDetailPage ticketId={selectedTicketIdForDetails} onClose={handleCloseDetails} />}
            {/* ... Votre modal d'ajout ... */}

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Gestion des Tickets ({filteredTickets.length})</h2>
                    <div className="flex items-center space-x-2">
                         <button onClick={() => setActiveModal('add')} className="btn btn-primary"><PlusCircle size={18} className="mr-2"/> Ajouter Ticket</button>
                         <button onClick={fetchAllNecessaryData} className="btn btn-secondary-icon" title="Rafraîchir" disabled={isLoading}><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /></button>
                    </div>
                </div>
            </div>

            {isLoading ? <Spinner /> : filteredTickets.length > 0 ? (
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
                            {filteredTickets.map(ticket => (
                                <TicketTableRow 
                                    key={ticket.id} 
                                    ticket={ticket} 
                                    onNavigateToDetails={handleShowDetails}
                                    onNavigateToUpdate={handleNavigateToUpdate} // Connecté à la nouvelle fonction
                                    isExpanded={!!expandedRows[ticket.id]}
                                    onToggleExpand={toggleRowExpansion}
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
