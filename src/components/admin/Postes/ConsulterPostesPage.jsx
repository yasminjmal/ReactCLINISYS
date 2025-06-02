import React, { useState, useEffect, useRef } from 'react';
import { Search, List, LayoutGrid, ArrowUpDown, ChevronDown, ChevronUp, Briefcase as BriefcasePlus, XIcon } from 'lucide-react';

import posteService from '../../../services/posteService'; // Adjust path if necessary
import PosteCard from './PosteCard';
import PosteRow from './PosteRow';
import AjouterPostePage from './AjouterPostePage';
import PosteDetailsPage from './PosteDetailsPage';

const Spinner = () => <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto my-10"></div>;

// --- Data Processing Helper ---
const processPosteData = (poste) => {
  let nbUtilisateurs = 0;
  if (poste.equipePosteutilisateurSet && Array.isArray(poste.equipePosteutilisateurSet)) {
    // Count unique users by adding their IDs to a Set
    const uniqueUserIds = new Set(poste.equipePosteutilisateurSet.map(item => item.idUtilisateur));
    nbUtilisateurs = uniqueUserIds.size;
  }
  return { ...poste, nbUtilisateurs };
};


const ConsulterPostesPage = () => {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState('list'); // 'list', 'add', 'details'
  const [postes, setPostes] = useState([]);
  const [selectedPoste, setSelectedPoste] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const [pageMessage, setPageMessage] = useState(null);
  const [newlyAddedPosteId, setNewlyAddedPosteId] = useState(null);
  
  const adminName = "Admin User";

  // State for UI
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [activeSort, setActiveSort] = useState({ field: 'id', order: 'desc' });
  const [highlightedPosteId, setHighlightedPosteId] = useState(null);

  const sortDropdownRef = useRef(null);
  const newlyAddedPosteRef = useRef(null);

  // --- DATA FETCHING ---
  const fetchPostes = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await posteService.getAllPostes();
      const rawPostes = Array.isArray(response.data) ? response.data : [];
      // Process each poste to calculate nbUtilisateurs
      const processedPostes = rawPostes.map(processPosteData);
      setPostes(processedPostes);
    } catch (err) {
      setErrorMessage('Erreur lors de la récupération des postes.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchPostes();
    }
  }, [view]);
  
  useEffect(() => {
    if (pageMessage && (newlyAddedPosteId || selectedPoste)) {
      setHighlightedPosteId(newlyAddedPosteId || selectedPoste?.id);
      if (newlyAddedPosteRef.current) {
        newlyAddedPosteRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const timer = setTimeout(() => {
        setHighlightedPosteId(null);
        clearPageMessage();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pageMessage, newlyAddedPosteId, selectedPoste]);

  // --- CRUD & NAVIGATION HANDLERS ---
  const handleAddPoste = async (posteData) => {
    setIsLoading(true);
    try {
      const response = await posteService.createPoste({ designation: posteData.designation });
      setNewlyAddedPosteId(response.data.id);
      setPageMessage({ type: 'success', text: `Le poste "${response.data.designation}" a été ajouté.` });
      setView('list');
    } catch (err) {
      setErrorMessage('Erreur lors de l\'ajout du poste.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdatePoste = async (posteData) => {
    setIsLoading(true);
    try {
      await posteService.updatePoste(posteData.id, { designation: posteData.designation });
      setPageMessage({ type: 'success', text: `Le poste "${posteData.designation}" a été mis à jour.` });
      setView('list');
    } catch (err) {
       setErrorMessage(`Erreur lors de la mise à jour.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeletePoste = async (id, designation) => {
    setIsLoading(true);
    try {
        await posteService.deletePoste(id);
        setPageMessage({ type: 'info', text: `Le poste "${designation}" a été supprimé.` });
        setView('list');
    } catch (err) {
        setErrorMessage(`Erreur lors de la suppression.`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleNavigateToDetails = async (id) => {
    setIsLoading(true);
    try {
        const response = await posteService.getPosteById(id);
        // Process the single poste data as well
        const processedPoste = processPosteData(response.data);
        setSelectedPoste(processedPoste);
        setView('details');
    } catch (err) {
        setErrorMessage('Impossible de charger les détails du poste.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedPoste(null);
    setErrorMessage(null);
    setView('list');
  };
  
  const clearPageMessage = () => {
    setPageMessage(null);
    setNewlyAddedPosteId(null);
  };
  
  // --- UI LOGIC (SORTING/FILTERING) ---
  const sortOptionsPostes = [
    { value: 'dateCreation', label: 'Date Création' },
    { value: 'designation', label: 'Désignation (A-Z)' },
    { value: 'id', label: 'ID' },
    { value: 'nbUtilisateurs', label: 'Nb Utilisateurs' }
  ];

  const handleSortChange = (field) => {
    setActiveSort(prev => ({ field, order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc' }));
    setIsSortDropdownOpen(false);
  };
  
  let processedPostesForDisplay = [...postes];
  if (searchTerm) {
    processedPostesForDisplay = processedPostesForDisplay.filter(p => p.designation.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  if (activeSort.field) {
    processedPostesForDisplay.sort((a, b) => { 
        let valA = a[activeSort.field]; 
        let valB = b[activeSort.field];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return activeSort.order === 'asc' ? -1 : 1;
        if (valA > valB) return activeSort.order === 'asc' ? 1 : -1;
        return 0;
    });
  }

  // --- CONDITIONAL RENDERING ---
  if (view === 'add') {
    return <AjouterPostePage onAddPoste={handleAddPoste} onCancel={handleCancel} adminName={adminName} />;
  }

  if (view === 'details') {
    return selectedPoste ? (
      <PosteDetailsPage 
        initialPoste={selectedPoste}
        onUpdatePoste={handleUpdatePoste}
        onDeletePosteRequest={handleDeletePoste}
        onCancelToList={handleCancel}
        adminName={adminName}
      />
    ) : (isLoading ? <Spinner /> : <div>Poste non trouvé.</div>);
  }

  // --- DEFAULT LIST VIEW ---
  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
      {pageMessage?.text && ( <div className={`fixed top-20 right-6 p-4 rounded-md shadow-lg z-50 flex items-center space-x-3 animate-slide-in-right ${pageMessage.type === 'success' ? 'bg-green-100 dark:bg-green-700' : 'bg-red-100 dark:bg-red-700'}`}><button onClick={clearPageMessage} className="p-1 hover:bg-black/10 rounded-full"><XIcon size={16}/></button><span>{pageMessage.text}</span></div>)}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
         <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
            Consulter les Postes ({processedPostesForDisplay.length} au total)
          </h2>
          <div className="flex items-center space-x-2">
            <button onClick={() => setView('add')} className="btn btn-primary-outline group">
              <BriefcasePlus size={18} className="mr-2"/>
              Ajouter Poste
            </button>
             <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`} title="Vue Liste"><List size={20} /></button>
             <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`} title="Vue Grille"><LayoutGrid size={20} /></button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="relative">
            <Search className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
            <input type="text" placeholder="Rechercher un poste..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
            />
          </div>
          <div className="relative" ref={sortDropdownRef}>
            <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="w-full flex items-center justify-between px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600">
               <span>Trier par: {sortOptionsPostes.find(o => o.value === activeSort.field)?.label}</span>
              {isSortDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isSortDropdownOpen && ( <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg z-10 py-1">
                {sortOptionsPostes.map(option => (
                  <button key={option.value} onClick={() => handleSortChange(option.value)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
                    {option.label}
                  </button>
                ))}
              </div>)}
          </div>
        </div>
      </div>
        {isLoading ? <Spinner /> : errorMessage ? <div className="text-red-500 text-center py-10">{errorMessage}</div> : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {processedPostesForDisplay.map(poste => (
                <div key={poste.id} ref={poste.id === newlyAddedPosteId ? newlyAddedPosteRef : null}
                  className={`${poste.id === highlightedPosteId ? 'ring-2 ring-green-500 rounded-lg' : ''}`}>
                    <PosteCard poste={poste} onNavigateToPosteDetails={handleNavigateToDetails} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {processedPostesForDisplay.map(poste => (
                 <div key={poste.id} ref={poste.id === newlyAddedPosteId ? newlyAddedPosteRef : null}
                      className={`${poste.id === highlightedPosteId ? 'ring-2 ring-green-500 rounded-lg' : ''}`}>
                  <PosteRow poste={poste} onNavigateToPosteDetails={handleNavigateToDetails}/>
                </div>
              ))}
            </div>
          )
        )}
      { !isLoading && processedPostesForDisplay.length === 0 && (
        <p className="text-center text-slate-500 py-10">Aucun poste trouvé pour votre recherche.</p>
      )}
    </div>
  );
};

export default ConsulterPostesPage;