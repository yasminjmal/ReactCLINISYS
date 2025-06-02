import React, { useState, useEffect, useRef } from 'react';
import { Search, List, LayoutGrid, Filter, ArrowUpDown, ChevronDown, ChevronUp, PackagePlus, XIcon } from 'lucide-react';
import ModuleCard from './ModuleCard';
import ModuleRow from './ModuleRow';
import AjouterModulePage from './AjouterModulePage';
import ModuleDetailsPage from './ModuleDetailsPage';

import moduleService from '../../../services/moduleService';
import equipeService from '../../../services/equipeService';

const Spinner = () => <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto my-10"></div>;

const processModuleData = (module) => ({
  ...module,
  nbTicketsAssignes: module.ticketSet ? module.ticketSet.length : 0,
  equipeId: module.idEquipe ? module.idEquipe.id : null,
});

const ConsulterModulesPage = () => {
  const [view, setView] = useState('list');
  const [modules, setModules] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pageMessage, setPageMessage] = useState(null);
  const [newlyAddedModuleId, setNewlyAddedModuleId] = useState(null);
  const adminName = "Admin User";

  // UI State from your original component
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ equipeId: null });
  const [activeSort, setActiveSort] = useState({ field: 'id', order: 'desc' });
  const [highlightedModuleId, setHighlightedModuleId] = useState(null);

  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const newlyAddedModuleRef = useRef(null);

  const sortOptionsModules = [
    { value: 'dateCreation', label: 'Date Création' },
    { value: 'designation', label: 'Désignation (A-Z)' },
    { value: 'id', label: 'ID' },
    { value: 'nbTicketsAssignes', label: 'Nb Tickets Assignés' }
  ];

  useEffect(() => {
    if (view === 'list') {
      setIsLoading(true);
      Promise.all([moduleService.getAllModules(), equipeService.getAllEquipes()])
        .then(([modulesResponse, equipesResponse]) => {
          setModules(modulesResponse.data.map(processModuleData));
          setEquipes(equipesResponse.data);
        })
        .catch(err => setErrorMessage('Erreur de chargement.'))
        .finally(() => setIsLoading(false));
    }
  }, [view]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) setIsFilterDropdownOpen(false);
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) setIsSortDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handler functions (handleAddModule, handleUpdateModule, etc.)
  const handleAddModule = async (moduleData) => {
    // ... logic from previous response
    try {
      const response = await moduleService.createModule(moduleData);
      setPageMessage({ type: 'success', text: `Le module "${response.data.designation}" a été ajouté.` });
      setView('list');
    } catch (err) { setErrorMessage('Erreur lors de l\'ajout'); }
  };
  const handleUpdateModule = async (moduleData) => {
    try {
      await moduleService.updateModule(moduleData.id, moduleData);
      setPageMessage({ type: 'success', text: `Le module "${moduleData.designation}" a été mis à jour.` });
      setView('list');
    } catch (err) { setErrorMessage('Erreur lors de la mise à jour'); }
  };
  const handleDeleteModule = async (id, designation) => {
    try {
      await moduleService.deleteModule(id);
      setPageMessage({ type: 'info', text: `Le module "${designation}" a été supprimé.` });
      setView('list');
    } catch (err) { setErrorMessage('Erreur lors de la suppression'); }
  };
  const handleNavigateToDetails = async (id) => {
    try {
      const response = await moduleService.getModuleById(id);
      setSelectedModule(processModuleData(response.data));
      setView('details');
    } catch (err) { setErrorMessage('Erreur de chargement du module'); }
  };
  const handleCancel = () => setView('list');
  const clearPageMessage = () => setPageMessage(null);
  
  const handleFilterChange = (category, value) => {
    setActiveFilters(prev => ({ ...prev, [category]: value === prev[category] ? null : value }));
    setIsFilterDropdownOpen(false);
  };
  const handleSortChange = (field) => {
    setActiveSort(prev => ({ field, order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc' }));
    setIsSortDropdownOpen(false);
  };
  const clearFilters = () => setActiveFilters({ equipeId: null });

  // Conditional Rendering
  if (view === 'add') {
    return <AjouterModulePage onAddModule={handleAddModule} onCancel={handleCancel} availableEquipes={equipes} adminName={adminName} />;
  }
  if (view === 'details') {
    return selectedModule ? <ModuleDetailsPage module={selectedModule} availableEquipes={equipes} onUpdateModule={handleUpdateModule} onDeleteModuleRequest={handleDeleteModule} onCancelToList={handleCancel} adminName={adminName} /> : <Spinner />;
  }

  // Filtering & Sorting Logic
  let processedModules = modules
    .filter(module => module.designation.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(module => !activeFilters.equipeId || module.equipeId === activeFilters.equipeId);
  
  processedModules.sort((a, b) => {
    let valA = a[activeSort.field];
    let valB = b[activeSort.field];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return activeSort.order === 'asc' ? -1 : 1;
    if (valA > valB) return activeSort.order === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
      {pageMessage?.text && ( <div className={`fixed top-20 right-6 p-4 rounded-md shadow-lg z-50 flex items-center space-x-3 animate-slide-in-right bg-green-100`}><button onClick={clearPageMessage} className="ml-auto p-1 hover:bg-black/10 rounded-full"><XIcon size={16}/></button><span>{pageMessage.text}</span></div>)}
      {errorMessage && ( <div className={`fixed top-20 right-6 p-4 rounded-md shadow-lg z-50 flex items-center space-x-3 animate-slide-in-right bg-red-100`}><button onClick={() => setErrorMessage(null)} className="ml-auto p-1 hover:bg-black/10 rounded-full"><XIcon size={16}/></button><span>{errorMessage}</span></div>)}
      
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
         <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
            Consulter les Modules ({processedModules.length} au total)
          </h2>
          <div className="flex items-center space-x-2">
            <button onClick={() => setView('add')} className="btn btn-primary-outline group">
              <PackagePlus size={18} className="mr-2 transition-transform duration-200 group-hover:scale-110" />
              Ajouter Module
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`} title="Vue Liste"><List size={20} /></button>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`} title="Vue Grille"><LayoutGrid size={20} /></button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
            <input type="text" placeholder="Rechercher un module..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            />
          </div>
          <div className="relative" ref={filterDropdownRef}>
            <button onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)} className="w-full flex items-center justify-between px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600">
              <div className="flex items-center space-x-2"><Filter size={18} /><span>Filtrer par Équipe</span>{activeFilters.equipeId && (<span className="bg-sky-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">1</span>)}</div>
              <ChevronDown size={16} />
            </button>
            {isFilterDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full md:w-72 bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 z-10 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Équipe</h4>
                {equipes.map(equipe => (
                    <label key={equipe.id} className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input type="radio" name="equipeFilterModule" value={equipe.id} checked={activeFilters.equipeId === equipe.id} onChange={() => handleFilterChange('equipeId', equipe.id)} className="form-radio h-3.5 w-3.5"/>
                        <span>{equipe.designation}</span>
                    </label>
                ))}
                <div className="pt-2 border-t flex justify-end mt-2">
                    <button onClick={clearFilters} className="text-xs text-sky-600 hover:underline">Réinitialiser</button>
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={sortDropdownRef}>
            <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="w-full flex items-center justify-between px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600">
               <div className="flex items-center space-x-2"><ArrowUpDown size={18} /><span>Trier par: {sortOptionsModules.find(opt => opt.value === activeSort.field)?.label}</span></div>
              <ChevronDown size={16} />
            </button>
            {isSortDropdownOpen && ( <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg z-10 py-1">
                {sortOptionsModules.map(option => (
                  <button key={option.value} onClick={() => handleSortChange(option.value)} className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center hover:bg-slate-100`}>
                    {option.label}
                  </button>
                ))}
              </div>)}
          </div>
        </div>
      </div>

      {isLoading ? <Spinner /> : (
        viewMode === 'list' ? (
            <div className="space-y-3">
            {processedModules.map(moduleObj => (
                <div key={moduleObj.id} ref={moduleObj.id === newlyAddedModuleId ? newlyAddedModuleRef : null}
                    className={`${moduleObj.id === highlightedModuleId ? 'ring-2 ring-green-500' : ''}`}>
                    <ModuleRow 
                        module={moduleObj}
                        onNavigateToModuleDetails={handleNavigateToDetails}
                    />
                </div>
            ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {processedModules.map(moduleObj => (
                <div key={moduleObj.id} ref={moduleObj.id === newlyAddedModuleId ? newlyAddedModuleRef : null}
                    className={`${moduleObj.id === highlightedModuleId ? 'ring-2 ring-green-500' : ''}`}>
                    <ModuleCard 
                        module={moduleObj}
                        onNavigateToModuleDetails={handleNavigateToModuleDetails}
                    />
                </div>
            ))}
            </div>
        )
      )}
      {!isLoading && processedModules.length === 0 && (
        <p className="text-center text-slate-500 dark:text-slate-400 py-10">Aucun module trouvé.</p>
      )}
    </div>
  );
};

export default ConsulterModulesPage;