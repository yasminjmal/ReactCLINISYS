import React, { useState, useEffect, useRef } from 'react';
import { Search, List, LayoutGrid, Filter, ArrowUpDown, ChevronDown, ChevronUp, PackagePlus, XCircle as AlertXCircle, CheckCircle2 as AlertCheckCircle, X as XIcon } from 'lucide-react';
import ModuleCard from './ModuleCard';
import ModuleRow from './ModuleRow';

const ConsulterModulesPage = ({ 
    modules = [], 
    equipes = [], 
    onNavigateToAjouterModule, 
    onNavigateToModuleDetails,
    onDeleteModuleRequest,
    pageMessage, 
    newlyAddedModuleId, 
    clearPageMessage 
}) => {
  
  const [viewMode, setViewMode] = useState('list'); // Vue liste par défaut
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ equipeId: null });
  const [activeSort, setActiveSort] = useState({ field: 'dateCreation', order: 'desc' });
  const [highlightedModuleId, setHighlightedModuleId] = useState(null);

  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const newlyAddedModuleRef = useRef(null);

  const safeEquipes = Array.isArray(equipes) ? equipes : [];
  const sortOptionsModules = [
    { value: 'dateCreation', label: 'Date Création' },
    { value: 'nom', label: 'Nom (A-Z)' },
    { value: 'id', label: 'ID' },
    { value: 'nbTicketsAssignes', label: 'Nb Tickets Assignés' }
  ];

  useEffect(() => { /* ... (gestion clic extérieur) ... */ 
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) setIsFilterDropdownOpen(false);
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) setIsSortDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { /* ... (gestion highlight) ... */
    if (pageMessage && pageMessage.text && newlyAddedModuleId) {
      setHighlightedModuleId(newlyAddedModuleId);
      if (newlyAddedModuleRef.current) {
        newlyAddedModuleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const timer = setTimeout(() => {
        setHighlightedModuleId(null);
        if(clearPageMessage) clearPageMessage();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pageMessage, newlyAddedModuleId, clearPageMessage]);

  const handleFilterChange = (category, value) => {
    setActiveFilters(prev => ({ ...prev, [category]: value === prev[category] ? null : value }));
    setIsFilterDropdownOpen(false);
  };
  const handleSortChange = (field) => {
    setActiveSort(prev => ({ field, order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc' }));
    setIsSortDropdownOpen(false);
  };
  const clearFilters = () => {
    setActiveFilters({ equipeId: null });
    setIsFilterDropdownOpen(false);
  };

  const modulesToProcess = Array.isArray(modules) ? modules : [];
  let processedModules = [...modulesToProcess]; 
  
  if (searchTerm) {
    processedModules = processedModules.filter(module =>
        module && module.nom && module.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (activeFilters.equipeId) {
    processedModules = processedModules.filter(module => module && module.equipeId === activeFilters.equipeId);
  }

  if (activeSort.field) {
    processedModules.sort((a, b) => { 
        if (!a || !b || !a.hasOwnProperty(activeSort.field) || !b.hasOwnProperty(activeSort.field)) return 0;
        let valA = a[activeSort.field]; 
        let valB = b[activeSort.field];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return activeSort.order === 'asc' ? -1 : 1;
        if (valA > valB) return activeSort.order === 'asc' ? 1 : -1;
        return 0;
    });
  }

  const countActiveFilters = () => activeFilters.equipeId ? 1 : 0;

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
      {pageMessage && pageMessage.text && ( <div className={`fixed top-20 right-6 p-4 rounded-md shadow-lg z-50 flex items-center space-x-3 animate-slide-in-right ${pageMessage.type === 'success' ? 'bg-green-100 dark:bg-green-700 border-green-500 dark:border-green-600 text-green-700 dark:text-green-100' : pageMessage.type === 'error' ? 'bg-red-100 dark:bg-red-700 border-red-500 dark:border-red-600 text-red-700 dark:text-red-100' : 'bg-blue-100 dark:bg-blue-700 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-100'}`}><button onClick={clearPageMessage} className="ml-auto p-1 hover:bg-black/10 rounded-full"><XIcon size={16}/></button><span>{pageMessage.text}</span></div>)}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
         <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
            Consulter les Modules ({processedModules.length} au total)
          </h2>
          <div className="flex items-center space-x-2">
            <button onClick={onNavigateToAjouterModule} className="btn btn-primary-outline group">
              <PackagePlus size={18} className="mr-2 transition-transform duration-200 group-hover:scale-110" />
              Ajouter Module
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`} title="Vue Liste">
              <List size={20} />
            </button>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`} title="Vue Grille">
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
            <input type="text" placeholder="Rechercher un module..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="relative" ref={filterDropdownRef}>
            <button onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)} className="w-full flex items-center justify-between px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">
              <div className="flex items-center space-x-2"><Filter size={18} /><span>Filtrer par Équipe</span>{activeFilters.equipeId && (<span className="bg-sky-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">1</span>)}</div>
              {isFilterDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isFilterDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full md:w-72 bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 z-10 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Équipe</h4>
                {safeEquipes.map(equipe => (
                    <label key={equipe.id} className="flex items-center space-x-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200">
                        <input type="radio" name="equipeFilterModule" value={equipe.id} checked={activeFilters.equipeId === equipe.id} onChange={() => handleFilterChange('equipeId', equipe.id)}
                        className="form-radio h-3.5 w-3.5 text-sky-600 border-slate-300 dark:border-slate-600 focus:ring-sky-500"/>
                        <span>{equipe.nom}</span>
                    </label>
                ))}
                {safeEquipes.length === 0 && <p className="text-xs text-slate-500">Aucune équipe disponible.</p>}
                <div className="pt-2 border-t dark:border-slate-700 flex justify-end mt-2">
                    <button onClick={clearFilters} className="text-xs text-sky-600 dark:text-sky-400 hover:underline">Réinitialiser</button>
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={sortDropdownRef}>
            <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="w-full flex items-center justify-between px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">
               <div className="flex items-center space-x-2"><ArrowUpDown size={18} /><span>Trier par: {sortOptionsModules.find(opt => opt.value === activeSort.field)?.label || 'Défaut'} ({activeSort.order === 'asc' ? '↑' : '↓'})</span></div>
              {isSortDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isSortDropdownOpen && ( /* Dropdown Tri */ <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 z-10 py-1">
                {sortOptionsModules.map(option => (
                  <button key={option.value} onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center ${activeSort.field === option.value ? 'bg-sky-50 dark:bg-sky-700/30 text-sky-600 dark:text-sky-300 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                    {option.label}
                    {activeSort.field === option.value && (activeSort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </button>
                ))}
              </div>)}
          </div>
        </div>
      </div>

      {viewMode === 'list' ? ( // Vue liste par défaut
        <div className="space-y-3">
          {processedModules.map(moduleObj => (
             <div key={moduleObj.id} ref={moduleObj.id === newlyAddedModuleId ? newlyAddedModuleRef : null}
                  className={`${moduleObj.id === highlightedModuleId ? 'ring-2 ring-green-500 ring-offset-1 dark:ring-offset-slate-900 rounded-md bg-green-50 dark:bg-green-500/10' : ''} transition-all duration-500`}>
              <ModuleRow 
                module={moduleObj}
                equipeNom={safeEquipes.find(eq => eq.id === moduleObj.equipeId)?.nom}
                onNavigateToModuleDetails={onNavigateToModuleDetails}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {processedModules.map(moduleObj => (
            <div key={moduleObj.id} ref={moduleObj.id === newlyAddedModuleId ? newlyAddedModuleRef : null} 
                 className={`${moduleObj.id === highlightedModuleId ? 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-slate-900 rounded-lg bg-green-50 dark:bg-green-500/10' : ''} transition-all duration-500`}>
              <ModuleCard 
                module={moduleObj}
                equipeNom={safeEquipes.find(eq => eq.id === moduleObj.equipeId)?.nom}
                onNavigateToModuleDetails={onNavigateToModuleDetails}
              />
            </div>
          ))}
        </div>
      )}
      {processedModules.length === 0 && (
        <p className="text-center text-slate-500 dark:text-slate-400 py-10">Aucun module trouvé.</p>
      )}
    </div>
  );
};
export default ConsulterModulesPage;