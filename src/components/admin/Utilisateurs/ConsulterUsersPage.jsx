import React, { useState, useEffect, useRef } from 'react';
import { Search, List, LayoutGrid, Filter, ArrowUpDown, ChevronDown, ChevronUp, UserPlus, XCircle as AlertXCircle, CheckCircle2 as AlertCheckCircle, X as XIcon } from 'lucide-react';
import UsersCard from './UsersCard';
import UsersRow from './UsersRow';
import AjouterUserPage from './AjouterUserPage';
import UserDetailsPage from './UserDetailsPage';

import utilisateurService from '../../../services/utilisateurService';
import posteService from '../../../services/posteService';
import equipeService from '../../../services/equipeService';

const Spinner = () => <div className="flex justify-center items-center h-full py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div></div>;

const processUserData = (user) => {
  let profileImage = null;
  if (user.photo) {
    if (typeof user.photo === 'string' && !user.photo.startsWith('data:image')) {
      profileImage = `data:image/jpeg;base64,${user.photo}`;
    } else {
      profileImage = user.photo; 
    }
  }
  return {
    ...user,
    profileImage,
    equipes: user.equipeSet || [], 
    nbTicketsAssignes: user.ticketSet?.length || 0,
    equipePosteSet: user.equipePosteSet || [], 
  };
};

const ConsulterUsersPage = () => {
  const [view, setView] = useState('list'); 
  const [users, setUsers] = useState([]);
  const [postes, setPostes] = useState([]); 
  const [equipes, setEquipes] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // This will be passed as setIsParentLoading
  const [errorMessage, setErrorMessage] = useState(null); // This will be passed as setParentErrorMessage
  const [pageMessage, setPageMessage] = useState(null); // This will be passed as setParentPageMessage
  const [newlyAddedUserId, setNewlyAddedUserId] = useState(null);
  const adminName = "Admin User"; 

  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTeams, setExpandedTeams] = useState({});
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ role: [], activite: [] });
  const [activeSort, setActiveSort] = useState({ field: 'id', order: 'desc' });
  const [highlightedUserId, setHighlightedUserId] = useState(null);

  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const newlyAddedUserRef = useRef(null);

  const filterOptions = {
    role: [ { value: 'Admin', label: 'Admin' }, { value: 'Chef_Equipe', label: 'Chef d\'équipe' }, { value: 'Employe', label: 'Employé'} ],
    activite: [ { value: true, label: 'Actif' }, { value: false, label: 'Non Actif' } ]
  };
  const sortOptions = [
    { value: 'id', label: 'ID' }, { value: 'nom', label: 'Nom (A-Z)' }, 
    { value: 'login', label: 'Login (A-Z)' },
    { value: 'nbTicketsAssignes', label: 'Nb Tickets (Client)' }
  ];

  const fetchAllInitialData = () => {
      setIsLoading(true);
      setErrorMessage(null);
      Promise.all([
        utilisateurService.getAllUtilisateurs(),
        posteService.getAllPostes(),
        equipeService.getAllEquipes()
      ])
        .then(([usersResponse, postesResponse, equipesResponse]) => {
          setUsers(usersResponse.data.map(processUserData));
          setPostes(Array.isArray(postesResponse.data) ? postesResponse.data : []);
          setEquipes(Array.isArray(equipesResponse.data) ? equipesResponse.data : []);
        })
        .catch(err => {
          console.error("Error fetching initial data:", err);
          setErrorMessage('Erreur lors du chargement des données. ' + (err.response?.data?.message || err.message || 'Vérifiez la console.'));
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
    if (pageMessage && pageMessage.text && (newlyAddedUserId || highlightedUserId )) {
      const idToHighlight = newlyAddedUserId || highlightedUserId;
      setHighlightedUserId(idToHighlight);
      const targetRef = newlyAddedUserId ? newlyAddedUserRef : null; 
      if (targetRef?.current) {
        targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const timer = setTimeout(() => {
        setHighlightedUserId(null);
        clearPageMessageLocal(); 
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pageMessage, newlyAddedUserId, highlightedUserId]);

  const handleAddUser = async (userDataFromForm, imageFile) => {
    setIsLoading(true);
    setErrorMessage(null);
    const { confirmer_mot_de_passe, poste, equipeIdForAssignment, ...coreUserData } = userDataFromForm; 
    const apiReadyUserData = { ...coreUserData, numTelephone: userDataFromForm.num_telephone || null, userCreation: adminName };
    try {
      const response = await utilisateurService.createUtilisateur(apiReadyUserData, imageFile);
      const newUserId = response.data.id;
      setNewlyAddedUserId(newUserId);
      let successMessage = `L'utilisateur "${response.data.prenom} ${response.data.nom}" a été créé.`;
      if (poste && equipeIdForAssignment && newUserId) {
        const selectedPosteFull = postes.find(p => p.designation === poste);
        if (selectedPosteFull) {
          try {
            await equipePosteUtilisateurService.createAssignment({
              idUtilisateur: newUserId,
              idPoste: selectedPosteFull.id,
              idEquipe: parseInt(equipeIdForAssignment, 10)
            });
            successMessage += " Assignation poste/équipe ajoutée.";
          } catch (assignError) { 
            console.error("Error assigning poste/equipe after user creation:", assignError);
            setErrorMessage("Utilisateur créé, mais erreur lors de l'assignation du poste/équipe.");
          }
        }
      }
      setPageMessage({ type: 'success', text: successMessage });
      setView('list'); 
    } catch (err) {
      console.error("Add User Error:", err.response || err);
      setErrorMessage(err.response?.data?.message || 'Erreur lors de la création.');
      setIsLoading(false); 
    }
  };

  const handleUpdateUser = async (userId, userDataFromForm, imageFile) => {
    setIsLoading(true);
    setErrorMessage(null);
    const { confirmer_mot_de_passe, profileImage, equipes, nbTicketsAssignes, poste, id, userCreation, dateCreation, ticketSet, equipeSet, equipePosteSet, ...coreUserData } = userDataFromForm;
    const apiReadyUserData = { id: userId, ...coreUserData, numTelephone: userDataFromForm.num_telephone || null };
    if (userDataFromForm.motDePasse && userDataFromForm.motDePasse.length > 0) {
        apiReadyUserData.motDePasse = userDataFromForm.motDePasse;
    }
    try {
      const response = await utilisateurService.updateUtilisateur(userId, apiReadyUserData, imageFile);
      setHighlightedUserId(response.data.id);
      setPageMessage({ type: 'success', text: `L'utilisateur "${response.data.prenom} ${response.data.nom}" (ID: ${userId}) a été mis à jour.` });
      setView('list');
    } catch (err) {
      console.error("Update User Error:", err.response || err);
      setErrorMessage(err.response?.data?.message || 'Erreur lors de la mise à jour.');
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => { 
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await utilisateurService.deleteUtilisateur(userId);
      setPageMessage({ type: 'info', text: `L'utilisateur "${userName}" (ID: ${userId}) a été supprimé.` });
      setView('list'); 
    } catch (err) {
      console.error("Delete User Error:", err.response || err);
      setErrorMessage(err.response?.data?.message || 'Erreur lors de la suppression.');
      setIsLoading(false); 
    }
  };
  
  const refreshSelectedUserData = async (userId) => {
    setIsLoading(true); // Use the main loading state
    setErrorMessage(null);
    try {
      const response = await utilisateurService.getUtilisateurById(userId);
      const freshlyProcessedUser = processUserData(response.data);
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? freshlyProcessedUser : u));
      setSelectedUser(freshlyProcessedUser); 
      // setPageMessage({ type: 'success', text: "Détails de l'utilisateur rafraîchis." }); // Optional
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setErrorMessage("Impossible de rafraîchir les données de l'utilisateur.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToDetails = (id) => {
    setIsLoading(true); 
    setErrorMessage(null);
    utilisateurService.getUtilisateurById(id)
        .then(response => {
            setSelectedUser(processUserData(response.data)); 
            setView('details');
        })
        .catch(err => {
            setErrorMessage('Utilisateur non trouvé ou erreur de chargement.');
            console.error("Error fetching user details by ID:", err);
        })
        .finally(() => setIsLoading(false));
  };
  
  const handleNavigateToAjouterUser = () => { 
    setSelectedUser(null);
    setView('add');
  };
  const handleCancel = (type, message) => { 
    setView('list');
    setSelectedUser(null);
    setErrorMessage(null);
    if (type && message) setPageMessage({ type, text: message });
  };
  const clearPageMessageLocal = () => { setPageMessage(null); setNewlyAddedUserId(null); };
  const handleFilterChange = (category, value) => { setActiveFilters(prev => ({ ...prev, [category]: prev[category]?.includes(value) ? prev[category].filter(item => item !== value) : [...(prev[category] || []), value] }));};
  const handleSortChange = (field) => { setActiveSort(prev => ({ field, order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc' })); setIsSortDropdownOpen(false);};
  const clearFiltersLocal = () => { setActiveFilters({ role: [], activite: [] }); setIsFilterDropdownOpen(false);};
  const handleShowMoreTeams = (userId) => setExpandedTeams(prev => ({ ...prev, [userId]: !prev[userId] }));
  const countActiveFilters = () => Object.values(activeFilters).reduce((count, arr) => count + arr.length, 0);

  // --- Conditional Rendering for Views ---
  if (view === 'add') {
    return <AjouterUserPage 
              onAddUser={handleAddUser} 
              onCancel={handleCancel} 
              availablePostes={postes} 
              availableEquipes={equipes} 
              adminName={adminName} 
              isLoading={isLoading} 
            />;
  }
  if (view === 'details') {
    return selectedUser ? <UserDetailsPage 
                              user={selectedUser} 
                              onUpdateUser={handleUpdateUser} 
                              onDeleteUser={handleDeleteUser} 
                              onCancel={handleCancel} 
                              availablePostes={postes} 
                              availableEquipes={equipes}
                              adminName={adminName} 
                              isLoading={isLoading} // General loading state from parent
                              refreshUser={() => refreshSelectedUserData(selectedUser.id)}
                              // Pass the state setters for the child to control parent's state for its specific operations
                              setIsParentLoading={setIsLoading}
                              setParentPageMessage={setPageMessage}
                              setParentErrorMessage={setErrorMessage}
                           /> 
                        : (isLoading ? <Spinner /> : <div className="text-center p-5 text-red-500 dark:text-red-300">Détails de l'utilisateur non disponibles ou utilisateur non trouvé.</div>) ;
  }

  // --- Filtering and Sorting Logic (from your original file) ---
  let filteredUsersList = Array.isArray(users) ? [...users] : [];
  if (searchTerm) { filteredUsersList = filteredUsersList.filter(user => user && ((user.prenom && user.nom && `${user.prenom} ${user.nom}`.toLowerCase().includes(searchTerm.toLowerCase())) || (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) || (user.login && user.login.toLowerCase().includes(searchTerm.toLowerCase()))));}
  if (activeFilters.role.length > 0) { filteredUsersList = filteredUsersList.filter(user => user && activeFilters.role.includes(user.role));}
  if (activeFilters.activite.length > 0) { filteredUsersList = filteredUsersList.filter(user => user && activeFilters.activite.includes(user.activite));}
  if (activeSort.field) { filteredUsersList.sort((a, b) => { let valA = a[activeSort.field]; let valB = b[activeSort.field]; if(activeSort.field === 'id' || activeSort.field === 'nbTicketsAssignes') { valA = Number(valA); valB = Number(valB); } else if (typeof valA === 'string') { valA = valA.toLowerCase(); } if (typeof valB === 'string') { valB = valB.toLowerCase(); } if (valA < valB) return activeSort.order === 'asc' ? -1 : 1; if (valA > valB) return activeSort.order === 'asc' ? 1 : -1; return 0; });}
  
  // --- YOUR ORIGINAL JSX FOR THE LIST VIEW (main return) ---
  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
      {pageMessage?.text && ( <div className={`fixed top-20 right-6 p-4 rounded-md shadow-lg z-[100] flex items-center space-x-3 animate-slide-in-right ${pageMessage.type === 'success' ? 'bg-green-100 dark:bg-green-700 border-green-500 dark:border-green-600 text-green-700 dark:text-green-100' : pageMessage.type === 'error' ? 'bg-red-100 dark:bg-red-700 border-red-500 dark:border-red-600 text-red-700 dark:text-red-100' : 'bg-blue-100 dark:bg-blue-700 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-100'}`}><button onClick={clearPageMessageLocal} className="ml-auto p-1 hover:bg-black/10 rounded-full"><XIcon size={16}/></button><span>{pageMessage.text}</span></div>)}
      {errorMessage && ( <div className="fixed top-20 right-6 p-4 rounded-md shadow-lg z-[100] flex items-center space-x-3 animate-slide-in-right bg-red-100 dark:bg-red-700 border-red-500 dark:border-red-600 text-red-700 dark:text-red-100"><button onClick={() => setErrorMessage(null)} className="ml-auto p-1 hover:bg-black/10 rounded-full"><XIcon size={16}/></button><span>{errorMessage}</span></div>)}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
         <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Consulter les Utilisateurs ({filteredUsersList.length} au total)</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleNavigateToAjouterUser} className="btn btn-primary-outline group" disabled={isLoading}><UserPlus size={18} className="mr-2 transition-transform duration-200 group-hover:scale-110" />Ajouter Utilisateur</button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`} title="Vue Liste"><List size={20} /></button>
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`} title="Vue Grille"><LayoutGrid size={20} /></button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div><input type="text" placeholder="Rechercher (nom, email, login)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"/></div>
          <div className="relative" ref={filterDropdownRef}><button onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)} className="w-full flex items-center justify-between px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600"><div className="flex items-center space-x-2"><Filter size={18} /><span>Filtrer</span>{countActiveFilters() > 0 && (<span className="bg-sky-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">{countActiveFilters()}</span>)}</div>{isFilterDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
            {isFilterDropdownOpen && ( <div className="absolute top-full left-0 mt-1 w-full md:w-72 bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 z-10 p-4 space-y-4">{Object.entries(filterOptions).map(([categoryKey, options]) => (<div key={categoryKey}><h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 capitalize">{categoryKey.replace('activite', 'activité')}</h4><div className="space-y-1.5">{options.map(option => (<label key={String(option.value)} className="flex items-center space-x-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" checked={activeFilters[categoryKey]?.includes(option.value)} onChange={() => handleFilterChange(categoryKey, option.value)} className="form-checkbox h-4 w-4 text-sky-600 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-sky-500" /><span>{option.label}</span></label>))}</div></div>))}<div className="pt-3 border-t dark:border-slate-700 flex justify-end"><button onClick={clearFiltersLocal} className="text-xs text-sky-600 dark:text-sky-400 hover:underline">Réinitialiser les filtres</button></div></div>)}
          </div>
          <div className="relative" ref={sortDropdownRef}><button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="w-full flex items-center justify-between px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600"><div className="flex items-center space-x-2"><ArrowUpDown size={18} /><span>Trier par: {sortOptions.find(opt => opt.value === activeSort.field)?.label || 'Défaut'} ({activeSort.order === 'asc' ? '↑' : '↓'})</span></div>{isSortDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
            {isSortDropdownOpen && ( <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 z-10 py-1">{sortOptions.map(option => (<button key={option.value} onClick={() => handleSortChange(option.value)} className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center ${activeSort.field === option.value ? 'bg-sky-50 dark:bg-sky-700/30 text-sky-600 dark:text-sky-300 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{option.label}{activeSort.field === option.value && (activeSort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}</button>))}</div>)}
          </div>
        </div>
      </div>

      {isLoading && view === 'list' ? <Spinner /> : (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filteredUsersList.map(userObj => (<div key={userObj.id} ref={userObj.id === newlyAddedUserId ? newlyAddedUserRef : null} className={`${userObj.id === highlightedUserId ? 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-slate-900 rounded-lg bg-green-50 dark:bg-green-500/10' : ''} transition-all duration-500`}><UsersCard user={userObj} onShowMoreTeams={handleShowMoreTeams} isTeamsExpanded={!!expandedTeams[userObj.id]} onNavigateToDetails={handleNavigateToDetails}/></div>))}</div>
        ) : (
          <div className="space-y-3">{filteredUsersList.map(userObj => (<div key={userObj.id} ref={userObj.id === newlyAddedUserId ? newlyAddedUserRef : null} className={`${userObj.id === highlightedUserId ? 'ring-2 ring-green-500 ring-offset-1 dark:ring-offset-slate-900 rounded-md bg-green-50 dark:bg-green-500/10' : ''} transition-all duration-500`}><UsersRow user={userObj} onShowMoreTeams={handleShowMoreTeams} isTeamsExpanded={!!expandedTeams[userObj.id]} onNavigateToDetails={handleNavigateToDetails}/></div>))}</div>
        )
      )}
      {!isLoading && filteredUsersList.length === 0 && (<p className="text-center text-slate-500 dark:text-slate-400 py-10">Aucun utilisateur trouvé.</p>)}
    </div>
  );
};
export default ConsulterUsersPage;