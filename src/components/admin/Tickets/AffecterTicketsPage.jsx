// src/components/admin/Tickets/AffecterTicketsPage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, LayoutGrid, Filter as FilterIcon, ArrowUpDown, RefreshCw, ChevronDown, ChevronUp, Columns } from 'lucide-react';
import TicketTableRow from './TicketTableRow'; 

const AffecterTicketsPage = ({
  tickets: allTicketsFromProps = [],
  onNavigateToTicketDetails, 
  pageMessage,
  highlightedItemId, 
  actionStatus,      
  autoExpandTicketId, 
  newlyCreatedTicketIds, // NOUVELLE PROP
  clearPageMessage,
  clearAutoExpand, 
  onShowNoSubTicketsMessage, 
  pageTitle = "Gestion des Tickets Actifs", 
  availableUsers = [] 
}) => {
  const [viewMode, setViewMode] = useState('table'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    priorite: [],
    client: [],
    statut: [], 
  });
  const [activeSort, setActiveSort] = useState({ field: 'dateCreation', order: 'desc' });
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({}); 

  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    if (autoExpandTicketId) {
      setExpandedRows(prev => ({ ...prev, [autoExpandTicketId]: true }));
      if(clearAutoExpand) clearAutoExpand(); 
    }
  }, [autoExpandTicketId, clearAutoExpand]);

  const priorityOptions = [
    { value: 'haute', label: 'Haute' },
    { value: 'moyenne', label: 'Moyenne' },
    { value: 'faible', label: 'Faible' },
  ];
  const statusOptionsForFilter = [ 
    { value: 'Accepté', label: 'Accepté' },
    { value: 'En cours', label: 'En cours' },
  ];

  const sortOptions = [
    { value: 'dateCreation', label: 'Date de création' },
    { value: 'ref', label: 'Référence' },
    { value: 'priorite', label: 'Priorité' },
    { value: 'client', label: 'Client' },
  ];

  const ticketsToDisplayAsParents = useMemo(() => {
    return allTicketsFromProps.filter(t => {
        if (t.parentId) return false; 
        if (t.statut === 'Accepté' || t.statut === 'En cours') return true;
        if (Array.isArray(t.sousTickets) && t.sousTickets.some(st => st.statut === 'Accepté' || st.statut === 'En cours')) return true; // Modifié pour inclure 'En cours' pour les sous-tickets
        return false;
    });
  }, [allTicketsFromProps]);


  const uniqueClientsForFilter = useMemo(() => {
    if (!Array.isArray(ticketsToDisplayAsParents)) return [];
    const clients = ticketsToDisplayAsParents.map(ticket => ticket.client).filter(Boolean);
    return [...new Set(clients)].sort();
  }, [ticketsToDisplayAsParents]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) setIsFilterDropdownOpen(false);
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) setIsSortDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleFilterChange = (category, value) => {
    setActiveFilters(prev => ({ ...prev, [category]: prev[category].includes(value) ? prev[category].filter(item => item !== value) : [...prev[category], value] }));
  };

  const handleSortChange = (field) => {
    setActiveSort(prev => ({ field, order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc' }));
    setIsSortDropdownOpen(false);
  };

  const clearAllFilters = () => {
    setActiveFilters({ priorite: [], client: [], statut: [] });
    setDateRange({ from: '', to: '' });
    setSearchTerm('');
    setIsFilterDropdownOpen(false);
  };

  const countActiveFilters = () => Object.values(activeFilters).reduce((acc, curr) => acc + (curr.length > 0 ? 1 : 0), 0) + ((dateRange.from || dateRange.to) ? 1 : 0);

  const filteredAndSortedTickets = useMemo(() => {
    let processedParentTickets = [...ticketsToDisplayAsParents];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      processedParentTickets = processedParentTickets.filter(t =>
        (t.ref?.toLowerCase().includes(lower)) ||
        (t.client?.toLowerCase().includes(lower)) ||
        (t.demandeur && `${t.demandeur.prenom || ''} ${t.demandeur.nom || ''}`.toLowerCase().includes(lower)) ||
        (t.titre?.toLowerCase().includes(lower)) ||
        (t.moduleAssigne?.nom?.toLowerCase().includes(lower)) ||
        (t.employeAssigne?.nom?.toLowerCase().includes(lower)) ||
        (t.sousTickets && t.sousTickets.some(st =>
            (st.ref?.toLowerCase().includes(lower)) ||
            (st.titre?.toLowerCase().includes(lower)) ||
            (st.moduleAssigne?.nom?.toLowerCase().includes(lower)) ||
            (st.employeAssigne?.nom?.toLowerCase().includes(lower))
        ))
      );
    }
    if (activeFilters.priorite.length > 0) processedParentTickets = processedParentTickets.filter(t => activeFilters.priorite.includes(t.priorite?.toLowerCase()));
    if (activeFilters.client.length > 0) processedParentTickets = processedParentTickets.filter(t => activeFilters.client.includes(t.client));
    if (activeFilters.statut.length > 0) {
        processedParentTickets = processedParentTickets.filter(t => {
            const isTicketEnCours = t.employeAssigne && t.statut !== 'Résolu' && t.statut !== 'Fermé';
            const currentDisplayStatus = isTicketEnCours ? 'En cours' : t.statut;
            if (activeFilters.statut.includes(currentDisplayStatus)) return true;
            
            if (t.sousTickets?.some(st => {
                const isSubTicketEnCours = st.employeAssigne && st.statut !== 'Résolu' && st.statut !== 'Fermé';
                const subDisplayStatus = isSubTicketEnCours ? 'En cours' : st.statut;
                return activeFilters.statut.includes(subDisplayStatus);
            })) return true;
            
            return false;
        });
    }

    if (dateRange.from) processedParentTickets = processedParentTickets.filter(t => new Date(t.dateCreation) >= new Date(dateRange.from));
    if (dateRange.to) {
      const to = new Date(dateRange.to); to.setDate(to.getDate() + 1);
      processedParentTickets = processedParentTickets.filter(t => new Date(t.dateCreation) < to);
    }

    if (activeSort.field) {
      processedParentTickets.sort((a, b) => {
        const valA = a[activeSort.field]; const valB = b[activeSort.field];
        let comp = 0;
        if (typeof valA === 'string' && typeof valB === 'string') comp = valA.localeCompare(valB);
        else if (typeof valA === 'number' && typeof valB === 'number') comp = valA - valB;
        else { if (valA > valB) comp = 1; else if (valA < valB) comp = -1; }
        return activeSort.order === 'asc' ? comp : comp * -1;
      });
    }
    return processedParentTickets;
  }, [ticketsToDisplayAsParents, searchTerm, activeFilters, dateRange, activeSort]);

  const toggleRowExpansion = (ticketId) => {
    setExpandedRows(prev => ({ ...prev, [ticketId]: !prev[ticketId] }));
  };

  const totalTicketsAffiches = filteredAndSortedTickets.length;
  const totalInitialTicketsPourCetteVue = ticketsToDisplayAsParents.length;

  const tableHeaderClass = "px-3 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b-2 border-slate-400 dark:border-slate-500";
  const fixedWidthClass = "whitespace-nowrap";

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-100 dark:bg-slate-900 min-h-full">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
            {pageTitle} ({totalInitialTicketsPourCetteVue} à traiter)
          </h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleRefresh} className="btn btn-secondary-icon" title="Rafraîchir" disabled={isLoading}>
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setViewMode('table')} className={`btn-icon ${viewMode === 'table' ? 'btn-active' : 'btn-inactive'}`} title="Vue Tableau">
              <Columns size={20} />
            </button>
            <button onClick={() => setViewMode('card')} className={`btn-icon ${viewMode === 'card' ? 'btn-active' : 'btn-inactive'}`} title="Vue Cartes">
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end mb-5">
          <div className="relative lg:col-span-2">
            <label htmlFor="search-tickets-gerer" className="sr-only">Rechercher</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" /> </div>
            <input type="text" id="search-tickets-gerer" placeholder="Rechercher (Réf, Client, Titre, Module, Assigné...)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input-icon w-full py-2 text-sm pl-10"/>
          </div>
          <div className="relative" ref={filterDropdownRef}>
            <button onClick={() => setIsFilterDropdownOpen(o => !o)} className="btn btn-default w-full flex items-center justify-between group">
              <div className="flex items-center"> <FilterIcon size={16} className="mr-2 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition-colors" /> <span className="text-sm">Filtrer</span> {countActiveFilters() > 0 && (<span className="ml-2 bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{countActiveFilters()}</span>)} </div>
              <ChevronDown size={18} className={`text-slate-400 dark:text-slate-500 group-hover:text-sky-500 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isFilterDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full md:w-80 bg-white dark:bg-slate-800 rounded-md shadow-xl border border-slate-200 dark:border-slate-700 z-20 p-4 space-y-4">
                <div> <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Priorité</h5> {priorityOptions.map(opt => ( <label key={opt.value} className="flex items-center space-x-2 cursor-pointer text-sm p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50"> <input type="checkbox" value={opt.value} checked={activeFilters.priorite.includes(opt.value)} onChange={() => handleFilterChange('priorite', opt.value)} className="form-checkbox"/> <span>{opt.label}</span> </label> ))} </div> <hr className="dark:border-slate-600"/>
                <div> <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Client</h5> <div className="max-h-32 overflow-y-auto space-y-1 pr-1"> {uniqueClientsForFilter.map(c => ( <label key={c} className="flex items-center space-x-2 cursor-pointer text-sm p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50"> <input type="checkbox" value={c} checked={activeFilters.client.includes(c)} onChange={() => handleFilterChange('client', c)} className="form-checkbox"/> <span>{c}</span> </label> ))} {uniqueClientsForFilter.length === 0 && <p className="text-xs italic p-1.5">Aucun client.</p>} </div> </div> <hr className="dark:border-slate-600"/>
                <div> <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Statut</h5> {statusOptionsForFilter.map(opt => ( <label key={opt.value} className="flex items-center space-x-2 cursor-pointer text-sm p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50"> <input type="checkbox" value={opt.value} checked={activeFilters.statut.includes(opt.value)} onChange={() => handleFilterChange('statut', opt.value)} className="form-checkbox"/> <span>{opt.label}</span> </label> ))} </div> <hr className="dark:border-slate-600"/>
                <div> <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Date de création</h5> <div className="grid grid-cols-2 gap-2"> <div><input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({...p, from: e.target.value}))} className="form-input py-1.5 text-xs w-full" title="Du"/></div> <div><input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({...p, to: e.target.value}))} className="form-input py-1.5 text-xs w-full" title="Au"/></div> </div> </div>
                <div className="pt-3 border-t dark:border-slate-600 flex justify-end mt-3"> <button onClick={clearAllFilters} className="btn btn-link text-xs">Réinitialiser</button> </div>
              </div>
            )}
          </div>
          <div className="relative" ref={sortDropdownRef}>
            <button onClick={() => setIsSortDropdownOpen(o => !o)} className="btn btn-default w-full flex items-center justify-between group">
               <div className="flex items-center"> <ArrowUpDown size={16} className="mr-2 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition-colors" /> <span className="text-sm truncate">Trier par: {sortOptions.find(o => o.value === activeSort.field)?.label || 'Défaut'}</span> </div>
               {activeSort.order === 'asc' ? <ChevronUp size={16} className="ml-1 text-slate-400 dark:text-slate-500"/> : <ChevronDown size={16} className="ml-1 text-slate-400 dark:text-slate-500"/>}
            </button>
            {isSortDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-full md:w-56 bg-white dark:bg-slate-800 rounded-md shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-1">
                {sortOptions.map(opt => ( <button key={opt.value} onClick={() => handleSortChange(opt.value)} className={`w-full text-left px-3 py-2 text-sm flex justify-between items-center ${activeSort.field === opt.value ? 'bg-sky-50 dark:bg-sky-700/20 text-sky-600 dark:text-sky-300 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}> {opt.label} {activeSort.field === opt.value && (activeSort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)} </button>))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-500 dark:text-slate-400"> <RefreshCw size={24} className="animate-spin inline-block mr-2" /> Chargement... </div>
      ) : totalTicketsAffiches > 0 ? (
        viewMode === 'table' ? (
          <div className="overflow-x-auto shadow-xl rounded-lg border border-slate-400 dark:border-slate-600">
            <table className="min-w-full">
              <thead className="bg-slate-200 dark:bg-slate-700">
                <tr>
                  <th scope="col" className={`${tableHeaderClass} ${fixedWidthClass} w-[7%] border-r border-slate-400 dark:border-slate-500`}>Réf.</th>
                  <th scope="col" className={`${tableHeaderClass} w-[15%] border-r border-slate-400 dark:border-slate-500`}>Client / Demandeur</th>
                  <th scope="col" className={`${tableHeaderClass} w-[20%] border-r border-slate-400 dark:border-slate-500`}>Titre du Ticket</th>
                  <th scope="col" className={`${tableHeaderClass} ${fixedWidthClass} w-[12%] border-r border-slate-400 dark:border-slate-500`}>Priorité / Statut</th>
                  <th scope="col" className={`${tableHeaderClass} w-[16%] border-r border-slate-400 dark:border-slate-500`}>Module</th>
                  <th scope="col" className={`${tableHeaderClass} w-[14%] border-r border-slate-400 dark:border-slate-500`}>Affecté à</th>
                  <th scope="col" className={`${tableHeaderClass} ${fixedWidthClass} w-[8%] border-r border-slate-400 dark:border-slate-500`}>Créé le</th>
                  <th scope="col" className={`${tableHeaderClass} ${fixedWidthClass} w-[8%]`}>ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 dark:divide-slate-600">
                {filteredAndSortedTickets.map(ticket => (
                  <TicketTableRow
                    key={ticket.id}
                    ticket={ticket}
                    isSubTicket={false}
                    depth={0}
                    onNavigateToDetailsCallback={onNavigateToTicketDetails}
                    highlightedItemId={highlightedItemId} 
                    actionStatus={actionStatus}         
                    newlyCreatedTicketIds={newlyCreatedTicketIds} // Passer la nouvelle prop
                    isExpanded={!!expandedRows[ticket.id]}
                    onToggleExpand={toggleRowExpansion}
                    availableUsers={availableUsers}
                    onShowNoSubTicketsMessage={onShowNoSubTicketsMessage} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : ( 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {filteredAndSortedTickets.map(ticket => (
              <div
                key={ticket.id}
                className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl 
                            ${(ticket.id === highlightedItemId && actionStatus === 'success') || (newlyCreatedTicketIds && newlyCreatedTicketIds.includes(ticket.id)) ? 'ring-2 ring-green-500 scale-105 bg-green-50 dark:bg-green-800/30' : 
                             (ticket.id === highlightedItemId && actionStatus === 'error') ? 'ring-2 ring-red-500 scale-105 bg-red-50 dark:bg-red-800/30' :
                             (ticket.id === highlightedItemId && actionStatus === 'info') ? 'ring-2 ring-blue-500 scale-105 bg-blue-50 dark:bg-blue-800/30' : 
                             'hover:scale-[1.02]'}`}
              >
                <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-200 truncate mb-1" title={ticket.titre}>{ticket.titre}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Réf: {ticket.ref} | Client: {ticket.client}</p>
                 <div className="flex justify-between items-center mb-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        ticket.priorite === 'haute' ? 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-400' :
                        ticket.priorite === 'moyenne' ? 'bg-sky-100 text-sky-700 dark:bg-sky-700/30 dark:text-sky-400' :
                        'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-400'
                    }`}>
                        {ticket.priorite?.charAt(0).toUpperCase() + ticket.priorite?.slice(1)}
                    </span>
                     <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        (ticket.employeAssigne && ticket.statut !== 'Résolu' && ticket.statut !== 'Fermé') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-400' :
                        ticket.statut === 'Accepté' ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-400'
                    }`}>
                        {(ticket.employeAssigne && ticket.statut !== 'Résolu' && ticket.statut !== 'Fermé') ? 'En cours' : ticket.statut}
                    </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1 h-10 overflow-hidden text-ellipsis" title={ticket.description || ''}>
                    {ticket.description || 'Pas de description.'}
                </p>
                {ticket.moduleAssigne && <p className="text-xs text-slate-500 dark:text-slate-400">Module: {ticket.moduleAssigne.nom}</p>}
                {ticket.employeAssigne && <p className="text-xs text-slate-500 dark:text-slate-400">Assigné à: {ticket.employeAssigne.nom}</p>}

                {ticket.sousTickets && ticket.sousTickets.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Sous-tickets ({ticket.sousTickets.length})
                    </p>
                  </div>
                )}
                <button
                    onClick={() => onNavigateToTicketDetails(ticket.id, false)}
                    className="btn btn-primary-outline btn-sm w-full mt-3"
                >
                    Détails et Actions
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <p className="text-center text-slate-500 dark:text-slate-400 py-10">
          Aucun ticket ne correspond à vos critères pour "{pageTitle}".
        </p>
      )}
    </div>
  );
};

export default AffecterTicketsPage;
