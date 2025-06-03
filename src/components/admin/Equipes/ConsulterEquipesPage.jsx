import React, { useState, useEffect, useRef } from 'react';
import { Search, List, LayoutGrid, Filter, ArrowUpDown, ChevronDown, ChevronUp, Users as UsersIconPage, X as XIcon, UserPlus } from 'lucide-react';
import EquipeCard from './EquipeCard';
import EquipeRow from './EquipeRow';
import AjouterEquipePage from './AjouterEquipePage';
import EquipeDetailsPage from './EquipeDetailsPage';
import equipeService from '../../../services/equipeService';
import utilisateurService from '../../../services/utilisateurService';
import posteService from '../../../services/posteService';

const Spinner = () => <div className="flex justify-center items-center h-full py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div></div>;

const processEquipeData = (equipe) => {
  if (!equipe || typeof equipe !== 'object') {
    console.warn("processEquipeData received invalid equipe object:", equipe);
    return { id: Date.now(), designation: 'Erreur Data Equipe', chefEquipe: null, equipePosteutilisateurSet: [], membresCount: 0, actif: false };
  }
  const processUserPhoto = (user) => {
    if (!user) return { profileImage: null };
    let profileImage = null;
    if (user.photo) {
      profileImage = typeof user.photo === 'string' && !user.photo.startsWith('data:image') ? `data:image/jpeg;base64,${user.photo}` : user.photo;
    }
    return { ...user, profileImage };
  };
  const processedChefEquipe = equipe.chefEquipe ? processUserPhoto(equipe.chefEquipe) : null;
  const processedEpuSet = (Array.isArray(equipe.equipePosteutilisateurSet) ? equipe.equipePosteutilisateurSet : []).map(epu => {
    if (!epu || typeof epu !== 'object') return null;
    return {
      ...epu,
      utilisateur: epu.utilisateur ? processUserPhoto(epu.utilisateur) : { nom: 'N/A', prenom: '', id: `unknown-user-${Math.random()}` },
      poste: epu.poste || { designation: 'N/A', id: `unknown-poste-${Math.random()}` },
      idPoste: epu.poste?.id,
      idUtilisateur: epu.utilisateur?.id,
      idEquipe: equipe.id
    };
  }).filter(Boolean);

  return {
    ...equipe,
    id: equipe.id || `fallback-id-${Math.random()}`,
    designation: equipe.designation || 'Nom d\'équipe Inconnu',
    chefEquipe: processedChefEquipe,
    equipePosteutilisateurSet: processedEpuSet,
    membresCount: processedEpuSet.length,
    membres: processedEpuSet.map(epu => ({
        id: epu.utilisateur.id,
        nom: epu.utilisateur.nom,
        prenom: epu.utilisateur.prenom,
        profileImage: epu.utilisateur.profileImage,
        poste: epu.poste.designation
    })),
    actif: equipe.actif === undefined ? true : !!equipe.actif,
  };
};

const ConsulterEquipesPage = () => {
  const [view, setView] = useState('list');
  const [equipes, setEquipes] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availablePostes, setAvailablePostes] = useState([]);
  const [selectedEquipe, setSelectedEquipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pageMessage, setPageMessage] = useState(null);
  const [newlyAddedEquipeId, setNewlyAddedEquipeId] = useState(null);
  const adminName = "Admin User";
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMembers, setExpandedMembers] = useState({});
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ chefEquipe: null });
  const [activeSort, setActiveSort] = useState({ field: 'dateCreation', order: 'desc' });
  const [highlightedEquipeId, setHighlightedEquipeId] = useState(null);

  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const newlyAddedEquipeRef = useRef(null);

  const potentialChefsForFilter = Array.isArray(availableUsers) ? availableUsers.filter(u => u.role === 'Chef_Equipe' || u.role === 'Admin') : [];
  const sortOptionsEquipes = [
    { value: 'dateCreation', label: 'Date Création' },
    { value: 'designation', label: 'Nom (A-Z)' },
    { value: 'membresCount', label: 'Nb Membres' }
  ];

  const fetchAllInitialData = () => {
      setIsLoading(true);
      setErrorMessage(null);
      Promise.all([
        equipeService.getAllEquipes(),
        utilisateurService.getAllUtilisateurs(),
        posteService.getAllPostes()
      ])
      .then(([equipesResponse, usersResponse, postesResponse]) => {
        setEquipes(Array.isArray(equipesResponse.data) ? equipesResponse.data.map(processEquipeData) : []);
        setAvailableUsers(Array.isArray(usersResponse.data) ? usersResponse.data.map(u => ({...u, profileImage: u.photo ? `data:image/jpeg;base64,${u.photo}` : null })) : []);
        setAvailablePostes(Array.isArray(postesResponse.data) ? postesResponse.data : []);
      })
      .catch(err => {
        console.error("Error fetching data for equipes page:", err);
        setErrorMessage("Erreur de chargement des données. " + (err.response?.data?.message || err.message || 'Vérifiez la console.'));
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (view === 'list') {
      fetchAllInitialData();
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

  useEffect(() => {
    if (pageMessage?.text && (newlyAddedEquipeId || highlightedEquipeId)) {
      const idToHighlight = newlyAddedEquipeId || highlightedEquipeId;
      setHighlightedEquipeId(idToHighlight);
      if (newlyAddedEquipeRef.current) {
        newlyAddedEquipeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const timer = setTimeout(() => { setHighlightedEquipeId(null); clearPageMessageLocal(); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pageMessage, newlyAddedEquipeId, highlightedEquipeId]);

  const handleAddEquipe = async (formDataFromChild) => {
    setIsLoading(true);
    setErrorMessage(null);
    const payload = {
        designation: formDataFromChild.nomEquipe,
        chefEquipe: { id: parseInt(formDataFromChild.chefEquipeId, 10) },
        userCreation: adminName,
    };
    try {
        const response = await equipeService.createEquipe(payload);
        setNewlyAddedEquipeId(response.data.id);
        setPageMessage({ type: 'success', text: `L'équipe "${response.data.designation}" a été créée.`});
        setView('list');
    } catch (err) {
        console.error("Add Equipe Error:", err.response || err);
        setErrorMessage(err.response?.data?.message || "Erreur lors de la création de l'équipe.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleUpdateEquipe = async (equipeId, formDataFromChild) => {
    setIsLoading(true);
    setErrorMessage(null);
    const payload = {
        id: equipeId,
        designation: formDataFromChild.designation,
        chefEquipe: formDataFromChild.chefEquipe?.id ? { id: formDataFromChild.chefEquipe.id } : null,
        actif: formDataFromChild.actif,
    };
    try {
        const response = await equipeService.updateEquipe(equipeId, payload);
        setHighlightedEquipeId(response.data.id);
        setPageMessage({ type: 'success', text: `L'équipe "${response.data.designation}" a été mise à jour.`});
        setView('list');
    } catch (err) {
        console.error("Update Equipe Error:", err.response || err);
        setErrorMessage(err.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleDeleteEquipeRequest = async (equipeId, equipeName) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
        await equipeService.deleteEquipe(equipeId);
        setPageMessage({type: 'info', text: `L'équipe "${equipeName}" a été supprimée.`});
        setView('list');
    } catch (err) {
        console.error("Delete Equipe Error:", err.response || err);
        setErrorMessage(err.response?.data?.message || "Erreur: L'équipe ne peut être supprimée.");
    } finally {
        setIsLoading(false);
    }
  };

  const refreshSelectedEquipeData = async (equipeId) => {
    if (!equipeId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
        const response = await equipeService.getEquipeById(equipeId);
        const freshlyProcessedEquipe = processEquipeData(response.data);
        setEquipes(prev => prev.map(eq => eq.id === equipeId ? freshlyProcessedEquipe : eq));
        setSelectedEquipe(freshlyProcessedEquipe);
    } catch (error) {
        console.error("Error refreshing equipe data:", error);
        setErrorMessage("Impossible de rafraîchir les données de l'équipe.");
        setView('list'); // Go back to list if refresh fails
    } finally {
        setIsLoading(false);
    }
  };

  const handleNavigateToEquipeDetails = (id) => {
    setIsLoading(true);
    setErrorMessage(null);
    equipeService.getEquipeById(id)
        .then(response => {
            setSelectedEquipe(processEquipeData(response.data));
            setView('details');
        })
        .catch(err => {
            setErrorMessage("Équipe non trouvée ou erreur de chargement.");
            console.error("Error fetching equipe details:", err);
        })
        .finally(() => setIsLoading(false));
  };

  const handleNavigateToAjouterEquipe = () => { setSelectedEquipe(null); setView('add'); };
  const handleCancel = (type, message) => { setView('list'); setSelectedEquipe(null); setErrorMessage(null); if(type && message) setPageMessage({type, text: message}); };
  const clearPageMessageLocal = () => { setPageMessage(null); setNewlyAddedEquipeId(null); setHighlightedEquipeId(null); };
  const handleFilterChange = (category, value) => { setActiveFilters(prev => ({ ...prev, [category]: value === prev[category] ? null : value })); setIsFilterDropdownOpen(false); };
  const handleSortChange = (field) => { setActiveSort(prev => ({ field, order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc' })); setIsSortDropdownOpen(false); };
  const clearFiltersLocal = () => { setActiveFilters({ chefEquipe: null }); setIsFilterDropdownOpen(false); };
  const handleShowMoreMembersLogic = (equipeId) => { setExpandedMembers(prev => ({ ...prev, [equipeId]: !prev[equipeId] })); };

  if (view === 'add') {
    return <AjouterEquipePage onAddEquipe={handleAddEquipe} onCancel={handleCancel} availableUsers={availableUsers} adminName={adminName} isLoading={isLoading} />;
  }
  
  if (view === 'details') {
    return selectedEquipe ? <EquipeDetailsPage
                                equipe={selectedEquipe}
                                onUpdateEquipe={handleUpdateEquipe}
                                onDeleteEquipeRequest={handleDeleteEquipeRequest}
                                onCancelToList={handleCancel}
                                availableUsers={availableUsers}
                                availablePostes={availablePostes}
                                adminName={adminName}
                                isLoading={isLoading}
                                refreshEquipe={() => refreshSelectedEquipeData(selectedEquipe.id)}
                                setIsLoading={setIsLoading}
                                setPageMessage={setPageMessage}
                                setErrorMessage={setErrorMessage}
                            />
                        : (isLoading ? <Spinner /> : <div className="p-6 text-center text-red-500 dark:text-red-300">Détails de l'équipe indisponibles. <button onClick={() => setView('list')} className="text-sky-500 underline">Retour à la liste.</button></div>);
  }

  let filteredEquipesList = Array.isArray(equipes) ? [...equipes] : [];
  if (searchTerm) { filteredEquipesList = filteredEquipesList.filter(equipe => (equipe.designation && equipe.designation.toLowerCase().includes(searchTerm.toLowerCase())) || (equipe.chefEquipe && `${equipe.chefEquipe.prenom || ''} ${equipe.chefEquipe.nom || ''}`.toLowerCase().includes(searchTerm.toLowerCase()))); }
  if (activeFilters.chefEquipe) { filteredEquipesList = filteredEquipesList.filter(equipe => equipe.chefEquipe && equipe.chefEquipe.id === parseInt(activeFilters.chefEquipe,10)); }
  if (activeSort.field) {
    filteredEquipesList.sort((a, b) => {
      let valA, valB;
      if (activeSort.field === 'designation') {
        valA = a.designation || '';
        valB = b.designation || '';
      } else if (activeSort.field === 'membresCount') {
        valA = a.membresCount || 0;
        valB = b.membresCount || 0;
      } else { // dateCreation
        valA = a.dateCreation || 0;
        valB = b.dateCreation || 0;
      }
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return activeSort.order === 'asc' ? -1 : 1;
      if (valA > valB) return activeSort.order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
      {pageMessage?.text && ( <div className={`fixed top-20 right-6 p-4 rounded-md shadow-lg z-[100] flex items-center space-x-3 animate-slide-in-right ${pageMessage.type === 'success' ? 'bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-100' : pageMessage.type === 'error' ? 'bg-red-100 dark:bg-red-700 text-red-700 dark:text-red-100' : 'bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-100'}`}><button onClick={clearPageMessageLocal} className="ml-auto p-1 hover:bg-black/10 rounded-full"><XIcon size={16}/></button><span>{pageMessage.text}</span></div>)}
      {errorMessage && ( <div className="fixed top-20 right-6 p-4 rounded-md shadow-lg z-[100] flex items-center space-x-3 animate-slide-in-right bg-red-100 dark:bg-red-700 text-red-700 dark:text-red-100"><button onClick={() => setErrorMessage(null)} className="ml-auto p-1 hover:bg-black/10 rounded-full"><XIcon size={16}/></button><span>{errorMessage}</span></div>)}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
         <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Consulter les Équipes ({filteredEquipesList.length} au total)</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleNavigateToAjouterEquipe} className="btn btn-primary-outline group" disabled={isLoading}><UserPlus size={18} className="mr-2 transition-transform duration-200 group-hover:scale-110" />Ajouter Équipe</button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`} title="Vue Liste"><List size={20} /></button>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`} title="Vue Grille"><LayoutGrid size={20} /></button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div><input type="text" placeholder="Rechercher une équipe..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"/></div>
          <div className="relative" ref={filterDropdownRef}><button onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)} className="w-full flex items-center justify-between px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600"><div className="flex items-center space-x-2"><Filter size={18} /><span>Filtrer par Chef</span>{activeFilters.chefEquipe && (<span className="bg-sky-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">1</span>)}</div>{isFilterDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
            {isFilterDropdownOpen && ( <div className="absolute top-full left-0 mt-1 w-full md:w-72 bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 z-10 p-4 space-y-2"><h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Chef d'équipe</h4>{potentialChefsForFilter.map(chef => (<label key={chef.id} className="flex items-center space-x-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200"><input type="radio" name="chefEquipeFilter" value={chef.id} checked={activeFilters.chefEquipe === chef.id} onChange={() => handleFilterChange('chefEquipe', chef.id)} className="form-radio h-3.5 w-3.5 text-sky-600 border-slate-300 dark:border-slate-600 focus:ring-sky-500"/><span>{chef.prenom} {chef.nom}</span></label>))}<div className="pt-2 border-t dark:border-slate-700 flex justify-end mt-2"><button onClick={clearFiltersLocal} className="text-xs text-sky-600 dark:text-sky-400 hover:underline">Réinitialiser</button></div></div>)}
          </div>
          <div className="relative" ref={sortDropdownRef}><button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="w-full flex items-center justify-between px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600"><div className="flex items-center space-x-2"><ArrowUpDown size={18} /><span>Trier par: {sortOptionsEquipes.find(opt => opt.value === activeSort.field)?.label || 'Défaut'} ({activeSort.order === 'asc' ? '↑' : '↓'})</span></div>{isSortDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
            {isSortDropdownOpen && ( <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 z-10 py-1">{sortOptionsEquipes.map(option => (<button key={option.value} onClick={() => handleSortChange(option.value)} className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center ${activeSort.field === option.value ? 'bg-sky-50 dark:bg-sky-700/30 text-sky-600 dark:text-sky-300 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{option.label}{activeSort.field === option.value && (activeSort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</button>))}</div>)}
          </div>
        </div>
      </div>

      {isLoading && view === 'list' ? <Spinner /> : (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">{filteredEquipesList.map(equipeObj => (<div key={equipeObj.id} ref={equipeObj.id === newlyAddedEquipeId ? newlyAddedEquipeRef : null} className={`${equipeObj.id === highlightedEquipeId ? 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-slate-900 rounded-lg bg-green-50 dark:bg-green-500/10' : ''} transition-all duration-500`}><EquipeCard equipe={equipeObj} onShowMoreMembers={handleShowMoreMembersLogic} isMembersExpanded={!!expandedMembers[equipeObj.id]} onNavigateToEquipeDetails={handleNavigateToEquipeDetails} /></div>))}</div>
        ) : (
          <div className="space-y-3">{filteredEquipesList.map(equipeObj => (<div key={equipeObj.id} ref={equipeObj.id === newlyAddedEquipeId ? newlyAddedEquipeRef : null} className={`${equipeObj.id === highlightedEquipeId ? 'ring-2 ring-green-500 ring-offset-1 dark:ring-offset-slate-900 rounded-md bg-green-50 dark:bg-green-500/10' : ''} transition-all duration-500`}><EquipeRow equipe={equipeObj} onShowMoreMembers={handleShowMoreMembersLogic} isMembersExpanded={!!expandedMembers[equipeObj.id]} onNavigateToEquipeDetails={handleNavigateToEquipeDetails} /></div>))}</div>
        )
      )}
      {!isLoading && filteredEquipesList.length === 0 && (<p className="text-center text-slate-500 dark:text-slate-400 py-10">Aucune équipe trouvée.</p>)}
    </div>
  );
};

export default ConsulterEquipesPage;