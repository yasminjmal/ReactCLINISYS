// src/components/admin/Tickets/AffecterTicketsPage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, LayoutGrid, Filter as FilterIcon, ArrowUpDown, RefreshCw, ChevronDown, ChevronUp, Columns } from 'lucide-react';
import TicketTableRow from './TicketTableRow'; // Assurez-vous que l'import est correct

// ... (Le reste de votre code, fonctions de tri, filtres, etc. reste identique) ...

const AffecterTicketsPage = ({
    tickets: allTicketsFromProps = [],
    onNavigateToTicketDetails,
    onNavigateToUpdate, // Assurez-vous que cette prop est passée depuis le composant parent
    pageMessage,
    highlightedItemId, 
    actionStatus,         
    autoExpandTicketId, 
    newlyCreatedTicketIds,
    clearPageMessage,
    clearAutoExpand, 
    onShowNoSubTicketsMessage, 
    pageTitle = "Gestion des Tickets Actifs", 
    availableUsers = [] 
}) => {
    // ... (tous vos états existants : searchTerm, viewMode, etc. restent ici) ...
    const [viewMode, setViewMode] = useState('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ETAT POUR GERER LES LIGNES DEPLIEES
    const [expandedRows, setExpandedRows] = useState({}); 

    // ... (Le reste de vos useEffect, et fonctions de filtrage/tri restent ici) ...
    const ticketsToDisplayAsParents = useMemo(() => {
        return allTicketsFromProps.filter(t => !t.parentId && (t.statut === 'Accepté' || t.statut === 'En cours' || (t.childTickets && t.childTickets.length > 0)));
    }, [allTicketsFromProps]);

    const filteredAndSortedTickets = useMemo(() => {
       // Votre logique de filtre et de tri
       return ticketsToDisplayAsParents.filter(t => t.titre?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [ticketsToDisplayAsParents, searchTerm]);


    // FONCTION POUR OUVRIR/FERMER UNE LIGNE
    const toggleRowExpansion = (ticketId) => {
        setExpandedRows(prev => ({
            ...prev,
            [ticketId]: !prev[ticketId]
        }));
    };
    
    // Déplie automatiquement une ligne si l'ID est fourni
    useEffect(() => {
        if (autoExpandTicketId) {
          setExpandedRows(prev => ({ ...prev, [autoExpandTicketId]: true }));
          if(clearAutoExpand) clearAutoExpand(); 
        }
    }, [autoExpandTicketId, clearAutoExpand]);


    const tableHeaderClass = "px-3 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b-2 border-slate-400 dark:border-slate-500";
    const fixedWidthClass = "whitespace-nowrap";

    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-100 dark:bg-slate-900 min-h-full">
            {/* ... (votre JSX pour l'en-tête, la recherche, les filtres reste ici) ... */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl">
                 <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">{pageTitle}</h2>
                 <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input mt-4 w-full"/>
            </div>

            {viewMode === 'table' ? (
                <div className="overflow-x-auto shadow-xl rounded-lg border border-slate-400 dark:border-slate-600">
                    <table className="min-w-full">
                        <thead className="bg-slate-200 dark:bg-slate-700">
                            <tr>
                                {/* Vos en-têtes de colonnes */}
                                <th scope="col" className={`${tableHeaderClass} ${fixedWidthClass} w-[7%]`}>Réf.</th>
                                <th scope="col" className={`${tableHeaderClass} w-[15%]`}>Client / Demandeur</th>
                                <th scope="col" className={`${tableHeaderClass} w-[20%]`}>Titre</th>
                                <th scope="col" className={`${tableHeaderClass} ${fixedWidthClass} w-[12%]`}>Priorité / Statut</th>
                                <th scope="col" className={`${tableHeaderClass} w-[16%]`}>Module</th>
                                <th scope="col" className={`${tableHeaderClass} w-[14%]`}>Affecté à</th>
                                <th scope="col" className={`${tableHeaderClass} ${fixedWidthClass} w-[8%]`}>Créé le</th>
                                <th scope="col" className={`${tableHeaderClass} ${fixedWidthClass} w-[8%]`}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-300 dark:bg-slate-900 dark:divide-slate-700">
                            {filteredAndSortedTickets.map(ticket => (
                                <TicketTableRow
                                    key={ticket.id}
                                    ticket={ticket}
                                    isSubTicket={false}
                                    depth={0}
                                    onNavigateToDetails={onNavigateToTicketDetails}
                                    onNavigateToUpdate={onNavigateToUpdate} // Passer la prop
                                    
                                    // --- PROPS IMPORTANTES POUR L'EXPANSION ---
                                    isExpanded={!!expandedRows[ticket.id]}
                                    onToggleExpand={toggleRowExpansion}
                                    // ---------------------------------------------
                                    
                                    highlightedItemId={highlightedItemId}
                                    actionStatus={actionStatus}
                                    newlyCreatedTicketIds={newlyCreatedTicketIds}
                                    availableUsers={availableUsers}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                 // Votre vue en mode 'carte' ou 'liste'
                 <div>Autre vue...</div>
            )}
        </div>
    );
};

export default AffecterTicketsPage;
