import React, { useState, useEffect, useRef } from 'react';
import { Search, List, LayoutGrid, Filter, ArrowUpDown, ChevronDown, ChevronUp, Briefcase as BriefcasePlus, XCircle as AlertXCircle, CheckCircle2 as AlertCheckCircle, X as XIcon } from 'lucide-react';
import PosteCard from './PosteCard';
import PosteRow from './PosteRow';

const ConsulterPostesPage = ({ 
    postes = [], 
    onNavigateToAjouterPoste, 
    onNavigateToPosteDetails,
    onDeletePosteRequest,
    pageMessage, 
    newlyAddedPosteId, 
    clearPageMessage 
}) => {
  
  const [viewMode, setViewMode] = useState('list'); // Vue liste par défaut
  const [searchTerm, setSearchTerm] = useState('');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  // Pas de filtre par équipe pour les postes pour l'instant, mais on pourrait l'ajouter si un poste est lié à une équipe.
  const [activeSort, setActiveSort] = useState({ field: 'dateCreation', order: 'desc' });
  const [highlightedPosteId, setHighlightedPosteId] = useState(null);

  const sortDropdownRef = useRef(null);
  const newlyAddedPosteRef = useRef(null);

  const sortOptionsPostes = [
    { value: 'dateCreation', label: 'Date Création' },
    { value: 'designation', label: 'Désignation (A-Z)' },
    { value: 'id', label: 'ID' },
    { value: 'nbUtilisateurs', label: 'Nb Utilisateurs' }
  ];

  useEffect(() => { 
    function handleClickOutside(event) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) setIsSortDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (pageMessage && pageMessage.text && newlyAddedPosteId) {
      setHighlightedPosteId(newlyAddedPosteId);
      if (newlyAddedPosteRef.current) {
        newlyAddedPosteRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const timer = setTimeout(() => {
        setHighlightedPosteId(null);
        if(clearPageMessage) clearPageMessage();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pageMessage, newlyAddedPosteId, clearPageMessage]);

  const handleSortChange = (field) => {
    setActiveSort(prev => ({ field, order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc' }));
    setIsSortDropdownOpen(false);
  };

  const postesToProcess = Array.isArray(postes) ? postes : [];
  let processedPostes = [...postesToProcess]; 
  
  if (searchTerm) {
    processedPostes = processedPostes.filter(poste =>
        poste && poste.designation && poste.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (activeSort.field) {
    processedPostes.sort((a, b) => { 
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

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
      {pageMessage && pageMessage.text && ( <div className={`fixed top-20 right-6 p-4 rounded-md shadow-lg z-50 flex items-center space-x-3 animate-slide-in-right ${pageMessage.type === 'success' ? 'bg-green-100 dark:bg-green-700 border-green-500 dark:border-green-600 text-green-700 dark:text-green-100' : pageMessage.type === 'error' ? 'bg-red-100 dark:bg-red-700 border-red-500 dark:border-red-600 text-red-700 dark:text-red-100' : 'bg-blue-100 dark:bg-blue-700 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-100'}`}><button onClick={clearPageMessage} className="ml-auto p-1 hover:bg-black/10 rounded-full"><XIcon size={16}/></button><span>{pageMessage.text}</span></div>)}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
         <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
            Consulter les Postes ({processedPostes.length} au total)
          </h2>
          <div className="flex items-center space-x-2">
            <button onClick={onNavigateToAjouterPoste} className="btn btn-primary-outline group">
              <BriefcasePlus size={18} className="mr-2 transition-transform duration-200 group-hover:scale-110" />
              Ajouter Poste
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`} title="Vue Liste">
              <List size={20} />
            </button>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`} title="Vue Grille">
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start"> {/* Simplifié à 2 colonnes pour recherche et tri */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
            <input type="text" placeholder="Rechercher un poste..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="relative" ref={sortDropdownRef}>
            <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="w-full flex items-center justify-between px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">
               <div className="flex items-center space-x-2"><ArrowUpDown size={18} /><span>Trier par: {sortOptionsPostes.find(opt => opt.value === activeSort.field)?.label || 'Défaut'} ({activeSort.order === 'asc' ? '↑' : '↓'})</span></div>
              {isSortDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isSortDropdownOpen && ( <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 z-10 py-1">
                {sortOptionsPostes.map(option => (
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
          {processedPostes.map(posteObj => (
             <div key={posteObj.id} ref={posteObj.id === newlyAddedPosteId ? newlyAddedPosteRef : null}
                  className={`${posteObj.id === highlightedPosteId ? 'ring-2 ring-green-500 ring-offset-1 dark:ring-offset-slate-900 rounded-md bg-green-50 dark:bg-green-500/10' : ''} transition-all duration-500`}>
              <PosteRow 
                poste={posteObj}
                onNavigateToPosteDetails={onNavigateToPosteDetails}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> {/* 4 cartes par ligne */}
          {processedPostes.map(posteObj => (
            <div key={posteObj.id} ref={posteObj.id === newlyAddedPosteId ? newlyAddedPosteRef : null} 
                 className={`${posteObj.id === highlightedPosteId ? 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-slate-900 rounded-lg bg-green-50 dark:bg-green-500/10' : ''} transition-all duration-500`}>
              <PosteCard 
                poste={posteObj}
                onNavigateToPosteDetails={onNavigateToPosteDetails}
              />
            </div>
          ))}
        </div>
      )}
      {processedPostes.length === 0 && (
        <p className="text-center text-slate-500 dark:text-slate-400 py-10">Aucun poste trouvé.</p>
      )}
    </div>
  );
};
export default ConsulterPostesPage;
