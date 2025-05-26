// src/components/admin/Tickets/AffecterTicketsPage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, List, LayoutGrid, Filter as FilterIcon, ArrowUpDown, RefreshCw, ChevronDown, ChevronUp, Columns } from 'lucide-react';
import TicketAccepteRow from './TicketAccepteRow';

const AffecterTicketsPage = ({
  tickets: initialTickets = [],
  onNavigateToTicketDetails,
  pageMessage,
  newlyAddedItemId,
  clearPageMessage
}) => {
  const [viewMode, setViewMode] = useState('block'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    priorite: [],
    client: [],
  });
  const [activeSort, setActiveSort] = useState({ field: 'dateAcceptation', order: 'desc' });
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedTicketId, setHighlightedTicketId] = useState(null); // Défini ici

  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const priorityOptions = [
    { value: 'haute', label: 'Haute' },
    { value: 'moyenne', label: 'Moyenne' },
    { value: 'faible', label: 'Faible' },
  ];

  const sortOptions = [
    { value: 'dateAcceptation', label: "Date d'acceptation" },
    { value: 'dateCreation', label: 'Date de création' },
    { value: 'ref', label: 'Référence' },
    { value: 'titre', label: 'Titre' },
    { value: 'client', label: 'Client' },
  ];
  
  const uniqueClientsForFilter = useMemo(() => {
    if (!Array.isArray(initialTickets)) return [];
    const clients = initialTickets.map(ticket => ticket.client).filter(Boolean);
    return [...new Set(clients)].sort();
  }, [initialTickets]);

  useEffect(() => {
    if (newlyAddedItemId) {
        setHighlightedTicketId(newlyAddedItemId); // Utilise newlyAddedItemId pour mettre à jour highlightedTicketId
        const timer = setTimeout(() => {
            setHighlightedTicketId(null);
        }, 7000);
        return () => clearTimeout(timer);
    }
  }, [newlyAddedItemId]);

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
    setActiveFilters({ priorite: [], client: [] });
    setDateRange({ from: '', to: '' });
    setSearchTerm('');
    setIsFilterDropdownOpen(false);
  };
  
  const countActiveFilters = () => Object.values(activeFilters).reduce((acc, curr) => acc + (curr.length > 0 ? 1 : 0), 0) + ((dateRange.from || dateRange.to) ? 1 : 0);

  const filteredAndSortedTickets = useMemo(() => {
    let processedTickets = Array.isArray(initialTickets) ? [...initialTickets] : [];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      processedTickets = processedTickets.filter(t =>
        (t.ref?.toLowerCase().includes(lower)) ||
        (t.client?.toLowerCase().includes(lower)) ||
        (t.demandeur && `${t.demandeur.prenom || ''} ${t.demandeur.nom || ''}`.toLowerCase().includes(lower)) ||
        (t.titre?.toLowerCase().includes(lower))
      );
    }
    if (activeFilters.priorite.length > 0) processedTickets = processedTickets.filter(t => activeFilters.priorite.includes(t.priorite?.toLowerCase()));
    if (activeFilters.client.length > 0) processedTickets = processedTickets.filter(t => activeFilters.client.includes(t.client));
    if (dateRange.from) processedTickets = processedTickets.filter(t => new Date(t.dateAcceptation || t.dateCreation) >= new Date(dateRange.from));
    if (dateRange.to) {
      const to = new Date(dateRange.to); to.setDate(to.getDate() + 1);
      processedTickets = processedTickets.filter(t => new Date(t.dateAcceptation || t.dateCreation) < to);
    }
    if (activeSort.field) {
      processedTickets.sort((a, b) => {
        const valA = a[activeSort.field]; const valB = b[activeSort.field];
        let comp = 0;
        if (typeof valA === 'string' && typeof valB === 'string') comp = valA.localeCompare(valB);
        else { if (valA > valB) comp = 1; else if (valA < valB) comp = -1; }
        return activeSort.order === 'asc' ? comp : comp * -1;
      });
    }
    // *** VÉRIFIEZ CETTE LIGNE DANS VOTRE CODE LOCAL ***
    // Elle doit utiliser `highlightedTicketId`, et non `ticketId`.
    return processedTickets.map(t => ({ ...t, isHighlighted: t.id === highlightedTicketId }));
  }, [initialTickets, searchTerm, activeFilters, dateRange, activeSort, highlightedTicketId]);

  const totalTicketsAcceptes = initialTickets.length;

  const tableStyles = `
    .custom-table-affectation { width: 100%; border-collapse: collapse; background-color: white; }
    .dark .custom-table-affectation { background-color: #1e293b; }
    .custom-table-affectation th, .custom-table-affectation td { border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; font-size: 0.875rem; color: #334155; }
    .dark .custom-table-affectation th, .dark .custom-table-affectation td { border-color: #334155; color: #cbd5e1; }
    .custom-table-affectation th { background-color: #f8fafc; font-weight: 600; }
    .dark .custom-table-affectation th { background-color: #273244; }
    .highlighted-row-affectation.ticket-row > td, .highlighted-row-affectation.sub-ticket-row > td { background-color: #dcfce7 !important; }
    .dark .highlighted-row-affectation.ticket-row > td, .dark .highlighted-row-affectation.sub-ticket-row > td { background-color: #15803d !important; color: #f0fdf4 !important; }
    .icon-button { background: none; border: none; cursor: pointer; padding: 5px; color: #0ea5e9; }
    .dark .icon-button { color: #38bdf8; }
    .icon-button:hover { color: #0284c7; }
    .dark .icon-button:hover { color: #0ea5e9; }
    .actions-column { text-align: center; }
  `;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
      <style>{tableStyles}</style>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
            Affecter les Tickets Acceptés ({totalTicketsAcceptes} acceptés)
          </h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleRefresh} className="btn btn-secondary-icon" title="Rafraîchir" disabled={isLoading}>
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setViewMode('block')} className={`btn-icon ${viewMode === 'block' ? 'btn-active' : 'btn-inactive'}`} title="Vue Blocs">
              <Columns size={20} />
            </button>
            <button onClick={() => setViewMode('card')} className={`btn-icon ${viewMode === 'card' ? 'btn-active' : 'btn-inactive'}`} title="Vue Cartes">
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div className="relative lg:col-span-2">
            <label htmlFor="search-tickets-acceptes" className="sr-only">Rechercher</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" /> </div>
            <input type="text" id="search-tickets-acceptes" placeholder="Rechercher par réf, client, titre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input-icon w-full py-2 text-sm pl-10"/>
          </div>
          <div className="relative" ref={filterDropdownRef}>
            <button onClick={() => setIsFilterDropdownOpen(o => !o)} className="btn btn-default w-full flex items-center justify-between group">
              <div className="flex items-center"> <FilterIcon size={16} className="mr-2 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition-colors" /> <span className="text-sm">Filtrer</span> {countActiveFilters() > 0 && (<span className="ml-2 bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{countActiveFilters()}</span>)} </div>
              <ChevronDown size={18} className={`text-slate-400 dark:text-slate-500 group-hover:text-sky-500 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isFilterDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full md:w-80 bg-white dark:bg-slate-800 rounded-md shadow-xl border dark:border-slate-700 z-20 p-4 space-y-4">
                <div> <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Priorité</h5> {priorityOptions.map(opt => ( <label key={opt.value} className="flex items-center space-x-2 cursor-pointer text-sm p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50"> <input type="checkbox" value={opt.value} checked={activeFilters.priorite.includes(opt.value)} onChange={() => handleFilterChange('priorite', opt.value)} className="form-checkbox"/> <span>{opt.label}</span> </label> ))} </div> <hr className="dark:border-slate-600"/>
                <div> <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Client</h5> <div className="max-h-32 overflow-y-auto space-y-1 pr-1"> {uniqueClientsForFilter.map(c => ( <label key={c} className="flex items-center space-x-2 cursor-pointer text-sm p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50"> <input type="checkbox" value={c} checked={activeFilters.client.includes(c)} onChange={() => handleFilterChange('client', c)} className="form-checkbox"/> <span>{c}</span> </label> ))} {uniqueClientsForFilter.length === 0 && <p className="text-xs italic p-1.5">Aucun client.</p>} </div> </div> <hr className="dark:border-slate-600"/>
                <div> <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Date d'acceptation</h5> <div className="grid grid-cols-2 gap-2"> <div><input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({...p, from: e.target.value}))} className="form-input py-1.5 text-xs w-full" title="Début"/></div> <div><input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({...p, to: e.target.value}))} className="form-input py-1.5 text-xs w-full" title="Fin"/></div> </div> </div>
                <div className="pt-3 border-t dark:border-slate-600 flex justify-end mt-3"> <button onClick={clearAllFilters} className="btn btn-link text-xs">Réinitialiser</button> </div>
              </div>
            )}
          </div>
          <div className="relative" ref={sortDropdownRef}>
            <button onClick={() => setIsSortDropdownOpen(o => !o)} className="btn btn-default w-full flex items-center justify-between group">
               <div className="flex items-center"> <ArrowUpDown size={16} className="mr-2 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition-colors" /> <span className="text-sm truncate">Trier: {sortOptions.find(o => o.value === activeSort.field)?.label || 'Défaut'}</span> </div>
               {activeSort.order === 'asc' ? <ChevronUp size={16} className="ml-1 text-slate-400 dark:text-slate-500"/> : <ChevronDown size={16} className="ml-1 text-slate-400 dark:text-slate-500"/>}
            </button>
            {isSortDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-full md:w-56 bg-white dark:bg-slate-800 rounded-md shadow-xl border dark:border-slate-700 z-20 py-1">
                {sortOptions.map(opt => ( <button key={opt.value} onClick={() => handleSortChange(opt.value)} className={`w-full text-left px-3 py-2 text-sm flex justify-between items-center ${activeSort.field === opt.value ? 'bg-sky-50 dark:bg-sky-700/20 text-sky-600 dark:text-sky-300 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}> {opt.label} {activeSort.field === opt.value && (activeSort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)} </button>))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-500 dark:text-slate-400"> <RefreshCw size={24} className="animate-spin inline-block mr-2" /> Chargement... </div>
      ) : filteredAndSortedTickets.length > 0 ? (
        viewMode === 'block' ? (
          <div className="space-y-0">
            {filteredAndSortedTickets.map(ticket => (
              <TicketAccepteRow 
                key={ticket.id} 
                ticket={ticket} 
                onNavigateToDetailsCallback={onNavigateToTicketDetails}
                isHighlighted={ticket.isHighlighted}
              />
            ))}
          </div>
        ) : ( 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {filteredAndSortedTickets.map(ticket => (
              <div 
                key={ticket.id} 
                className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl ${ticket.isHighlighted ? 'ring-2 ring-green-500 scale-105' : 'hover:scale-[1.02]'}`}
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
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        Accepté: {ticket.dateAcceptation ? new Date(ticket.dateAcceptation).toLocaleDateString() : 'N/A'}
                    </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 truncate h-10" title={ticket.description || ''}>
                    {ticket.description || 'Pas de description.'}
                </p>
                <button 
                    onClick={() => onNavigateToTicketDetails(ticket.id)} 
                    className="btn btn-primary-outline btn-sm w-full mt-2"
                >
                    Détails et Affectation
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <p className="text-center text-slate-500 dark:text-slate-400 py-10">
          Aucun ticket "Accepté" ne correspond à vos critères.
        </p>
      )}
    </div>
  );
};

export default AffecterTicketsPage;
