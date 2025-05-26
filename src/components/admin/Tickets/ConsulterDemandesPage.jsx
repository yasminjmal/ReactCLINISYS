import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, List, LayoutGrid, Filter as FilterIcon, ArrowUpDown, RefreshCw, CalendarDays, User, Tag, XCircle as AlertXCircle, CheckCircle2 as AlertCheckCircle, X as XIcon, ChevronDown, ChevronUp } from 'lucide-react';
import TicketRow from './TicketRow';
import TicketCard from './TicketCard';

const ConsulterDemandesPage = ({
  tickets: initialTickets = [],
  clients: initialClients = [],
  onNavigateToTicketDetails,
  pageMessage,
  newlyAddedItemId,
  clearPageMessage
}) => {
  const [viewMode, setViewMode] = useState('row');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    priorite: [],
    client: [],
  });
  const [activeSort, setActiveSort] = useState({ field: 'dateCreation', order: 'desc' });
  const [isLoading, setIsLoading] = useState(false);

  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const priorityOptions = [
    { value: 'haute', label: 'Haute' },
    { value: 'moyenne', label: 'Moyenne' },
    { value: 'faible', label: 'Faible' },
  ];

  const sortOptions = [
    { value: 'dateCreation', label: 'Date de création' },
    { value: 'ref', label: 'Référence' },
  ];
  
  const uniqueClientsForFilter = useMemo(() => {
    if (!Array.isArray(initialTickets)) return [];
    const clients = initialTickets.map(ticket => ticket.client).filter(Boolean);
    return [...new Set(clients)].sort();
  }, [initialTickets]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleFilterChange = (category, value) => {
    setActiveFilters(prev => {
      const currentCategoryFilters = prev[category] || [];
      const newCategoryFilters = currentCategoryFilters.includes(value)
        ? currentCategoryFilters.filter(item => item !== value)
        : [...currentCategoryFilters, value];
      return { ...prev, [category]: newCategoryFilters };
    });
  };
  
  const handleSortChange = (field) => {
    setActiveSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
    setIsSortDropdownOpen(false);
  };

  const clearAllFilters = () => {
    setActiveFilters({ priorite: [], client: [] });
    setDateRange({ from: '', to: '' });
    setIsFilterDropdownOpen(false);
  };
  
  const countActiveFilters = () => {
    let count = 0;
    if (activeFilters.priorite.length > 0) count++;
    if (activeFilters.client.length > 0) count++;
    if (dateRange.from || dateRange.to) count++;
    return count;
  };

  const filteredAndSortedTickets = useMemo(() => {
    let processedTickets = Array.isArray(initialTickets) ? [...initialTickets] : [];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      processedTickets = processedTickets.filter(ticket =>
        (ticket.ref && ticket.ref.toLowerCase().includes(lowerSearchTerm)) ||
        (ticket.client && ticket.client.toLowerCase().includes(lowerSearchTerm)) ||
        (ticket.demandeur && `${ticket.demandeur.prenom || ''} ${ticket.demandeur.nom || ''}`.toLowerCase().includes(lowerSearchTerm)) ||
        (ticket.titre && ticket.titre.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (activeFilters.priorite.length > 0) {
      processedTickets = processedTickets.filter(ticket =>
        activeFilters.priorite.includes(ticket.priorite?.toLowerCase())
      );
    }
    
    if (activeFilters.client.length > 0) {
      processedTickets = processedTickets.filter(ticket =>
        activeFilters.client.includes(ticket.client)
      );
    }

    if (dateRange.from) {
        processedTickets = processedTickets.filter(ticket => 
            new Date(ticket.dateCreation) >= new Date(dateRange.from)
        );
    }
    if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setDate(toDate.getDate() + 1);
        processedTickets = processedTickets.filter(ticket => 
            new Date(ticket.dateCreation) < toDate
        );
    }

    if (activeSort.field) {
      processedTickets.sort((a, b) => {
        const valA = a[activeSort.field];
        const valB = b[activeSort.field];
        let comparison = 0;
        if (valA > valB) comparison = 1;
        else if (valA < valB) comparison = -1;
        return activeSort.order === 'asc' ? comparison : comparison * -1;
      });
    }
    return processedTickets;
  }, [initialTickets, searchTerm, activeFilters, dateRange, activeSort]);

  const totalTicketsEnAttente = initialTickets.length;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
            Consulter les Demandes ({totalTicketsEnAttente} en attente)
          </h2>
          <div className="flex items-center space-x-2">
            <button 
                onClick={handleRefresh} 
                className="btn btn-secondary-icon" // Style plus concis pour icône seule
                title="Rafraîchir les données"
                disabled={isLoading}
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setViewMode('row')} className={`btn-icon ${viewMode === 'row' ? 'btn-active' : 'btn-inactive'}`} title="Vue Ligne">
              <List size={20} />
            </button>
            <button onClick={() => setViewMode('card')} className={`btn-icon ${viewMode === 'card' ? 'btn-active' : 'btn-inactive'}`} title="Vue Carte">
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div className="relative lg:col-span-2">
            <label htmlFor="search-tickets-acceptes" className="sr-only">Rechercher</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              id="search-tickets-acceptes"
              placeholder="Rechercher par réf, client, titre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // AJOUTEZ pl-10 (ou une valeur appropriée) ici
              className="form-input-icon w-full py-2 text-sm pl-10" 
            />
          </div>

          {/* Bouton Filtrer amélioré */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="btn btn-default w-full flex items-center justify-between group" // btn-default pour un style de base
            >
              <div className="flex items-center">
                <FilterIcon size={16} className="mr-2 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
                <span className="text-sm">Filtrer</span>
                {countActiveFilters() > 0 && (
                    <span className="ml-2 bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{countActiveFilters()}</span>
                )}
              </div>
              <ChevronDown size={18} className={`text-slate-400 dark:text-slate-500 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isFilterDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full md:w-80 bg-white dark:bg-slate-800 rounded-md shadow-xl border dark:border-slate-700 z-20 p-4 space-y-4">
                {/* Contenu du dropdown de filtre (inchangé) */}
                <div>
                  <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Priorité</h5>
                  {priorityOptions.map(opt => (
                    <label key={opt.value} className="flex items-center space-x-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-md">
                      <input type="checkbox" value={opt.value} checked={activeFilters.priorite.includes(opt.value)} onChange={() => handleFilterChange('priorite', opt.value)} className="form-checkbox h-4 w-4 text-sky-600 focus:ring-sky-500"/>
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                <hr className="dark:border-slate-600"/>
                <div>
                    <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Client</h5>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                        {uniqueClientsForFilter.map(clientName => (
                            <label key={clientName} className="flex items-center space-x-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-md">
                                <input type="checkbox" value={clientName} checked={activeFilters.client.includes(clientName)} onChange={() => handleFilterChange('client', clientName)} className="form-checkbox h-4 w-4 text-sky-600 focus:ring-sky-500"/>
                                <span>{clientName}</span>
                            </label>
                        ))}
                        {uniqueClientsForFilter.length === 0 && <p className="text-xs italic text-slate-400 dark:text-slate-500 p-1.5">Aucun client à filtrer.</p>}
                    </div>
                </div>
                <hr className="dark:border-slate-600"/>
                <div>
                    <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Date de création</h5>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label htmlFor="dateFrom" className="sr-only">Du</label>
                            <input type="date" id="dateFrom" value={dateRange.from} onChange={e => setDateRange(prev => ({...prev, from: e.target.value}))} className="form-input py-1.5 text-xs w-full" title="Date de début"/>
                        </div>
                        <div>
                            <label htmlFor="dateTo" className="sr-only">Au</label>
                            <input type="date" id="dateTo" value={dateRange.to} onChange={e => setDateRange(prev => ({...prev, to: e.target.value}))} className="form-input py-1.5 text-xs w-full" title="Date de fin"/>
                        </div>
                    </div>
                </div>
                <div className="pt-3 border-t dark:border-slate-600 flex justify-end mt-3">
                    <button onClick={clearAllFilters} className="btn btn-link text-xs">Réinitialiser</button>
                </div>
              </div>
            )}
          </div>

          {/* Bouton Trier par amélioré */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="btn btn-default w-full flex items-center justify-between group" // btn-default pour un style de base
            >
               <div className="flex items-center">
                <ArrowUpDown size={16} className="mr-2 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
                <span className="text-sm truncate">Trier par: {sortOptions.find(opt => opt.value === activeSort.field)?.label || 'Défaut'}</span>
              </div>
              {activeSort.order === 'asc' ? <ChevronUp size={16} className="ml-1 text-slate-400 dark:text-slate-500 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180':''}" /> : <ChevronDown size={16} className="ml-1 text-slate-400 dark:text-slate-500 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180':''}" />}
            </button>
            {isSortDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-full md:w-56 bg-white dark:bg-slate-800 rounded-md shadow-xl border dark:border-slate-700 z-20 py-1">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-3 py-2 text-sm flex justify-between items-center 
                                ${activeSort.field === option.value ? 'bg-sky-50 dark:bg-sky-700/20 text-sky-600 dark:text-sky-300 font-medium' 
                                                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                  >
                    {option.label}
                    {activeSort.field === option.value && (activeSort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
          <RefreshCw size={24} className="animate-spin inline-block mr-2" /> Chargement...
        </div>
      ) : filteredAndSortedTickets.length > 0 ? (
        viewMode === 'row' ? (
          <div className="space-y-3">
            {filteredAndSortedTickets.map(ticket => (
              <TicketRow key={ticket.id} ticket={ticket} onNavigateToDetails={onNavigateToTicketDetails} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5"> {/* Ajusté pour 3 cartes par ligne sur grand écran */}
            {filteredAndSortedTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} onNavigateToDetails={onNavigateToTicketDetails} />
            ))}
          </div>
        )
      ) : (
        <p className="text-center text-slate-500 dark:text-slate-400 py-10">
          Aucun ticket "en attente" ne correspond à vos critères.
        </p>
      )}
    </div>
  );
};

export default ConsulterDemandesPage;
