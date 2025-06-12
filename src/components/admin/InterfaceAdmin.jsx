import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, List, LayoutGrid, Filter, ArrowUpDown, ChevronDown, ChevronUp, Briefcase, Plus, X, Edit, Trash2, Save, XCircle, AlertTriangle, Table, Users, CreditCard, Calendar, Archive, Menu, LogOut, Home, User, Settings, Shield, Bell, Sun, Moon, LayoutDashboard, Ticket, UserCircle, Package, CheckCircle2, Circle, FileText, ListChecks, ArchiveX } from 'lucide-react';

// --- PLACEHOLDERS POUR LES IMAGES ---
// Remplacez ces chaînes par les chemins réels de vos assets.
const logoClinisysImage_Sidebar = "https://placehold.co/200x80/1e293b/94a3b8?text=ClinisyS";
const defaultUserProfileImage_Navbar = "https://placehold.co/100x100/e2e8f0/334155?text=User";


// --- SERVICE API (Simulation) ---
const api = {
  get: async (url, config) => {
    console.log(`GET: ${url}`, config);
    await new Promise(res => setTimeout(res, 500));
    if (url.startsWith('/postes/')) {
        const id = parseInt(url.split('/')[2]);
        const poste = mockPostesData.find(p => p.id === id);
        return { data: poste };
    }
    const params = new URLSearchParams(config?.params);
    const actifs = params.get('actifs');
    let data = [...mockPostesData];
    if (actifs === 'true') data = data.filter(p => p.actif === true);
    if (actifs === 'false') data = data.filter(p => p.actif === false);
    return { data };
  },
  post: async (url, data) => {
    console.log(`POST: ${url}`, data);
    await new Promise(res => setTimeout(res, 500));
    const newPoste = { id: Math.max(...mockPostesData.map(p => p.id)) + 1, ...data, dateCreation: [2025, 6, 12, 15, 42, 19, 973264300], userCreation: "samsamina" };
    mockPostesData.push(newPoste);
    return { data: newPoste, status: 201 };
  },
  put: async (url, data) => {
    console.log(`PUT: ${url}`, data);
    await new Promise(res => setTimeout(res, 500));
    const id = parseInt(url.split('/')[2]);
    let posteToUpdate = mockPostesData.find(p => p.id === id);
    if (posteToUpdate) {
        posteToUpdate.designation = data.designation;
        posteToUpdate.actif = data.actif;
    }
    return { data: posteToUpdate };
  },
  delete: async (url) => {
    console.log(`DELETE: ${url}`);
    await new Promise(res => setTimeout(res, 500));
    const id = parseInt(url.split('/')[2]);
    mockPostesData = mockPostesData.filter(p => p.id !== id);
    return { status: 204 };
  },
};
let mockPostesData = [ { "id": 1, "designation": "Développeur Full-Stack", "actif": true, "dateCreation": [2023, 10, 1, 10, 0], "userCreation": "admin" }, { "id": 2, "designation": "Chef de Projet Technique", "actif": true, "dateCreation": [2023, 9, 15, 11, 30], "userCreation": "admin" }, { "id": 4, "designation": "Data Scientist", "actif": false, "dateCreation": [2023, 8, 20, 14, 0], "userCreation": "admin" }, { "id": 5, "designation": "Architecte Cloud", "actif": true, "dateCreation": [2024, 1, 5, 9, 45], "userCreation": "samsamina" }, { "id": 6, "designation": "Testeur QA", "actif": false, "dateCreation": [2024, 2, 10, 16, 20], "userCreation": "samsamina" } ];
const posteService = { getAllPostes: (params = {}) => api.get('/postes', { params }), getPosteById: (id) => api.get(`/postes/${id}`), createPoste: (posteData) => api.post('/postes', posteData), updatePoste: (id, posteData) => api.put(`/postes/${id}`, posteData), deletePoste: (id) => api.delete(`/postes/${id}`) };


// --- COMPOSANT DE GESTION DES POSTES (AUTONOME) ---
const formatDate = (dateArray) => { if (!Array.isArray(dateArray) || dateArray.length < 3) return "Date invalide"; return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); };
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, poste }) => { if (!isOpen) return null; return ( <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in"><div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-sm w-full transform transition-all animate-slide-in-up"><AlertTriangle size={48} className="text-red-500 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Confirmer la suppression</h3><p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Voulez-vous vraiment supprimer le poste : <br /><strong className="font-semibold">{poste?.designation}</strong> ?</p><div className="flex justify-center space-x-4"><button onClick={onClose} className="btn btn-secondary px-6 py-2">Annuler</button><button onClick={onConfirm} className="btn btn-danger px-6 py-2">Supprimer</button></div></div></div>); };
const PosteFormModal = ({ isOpen, onClose, onSave, posteToEdit }) => { const [designation, setDesignation] = useState(''); const [actif, setActif] = useState(true); const [error, setError] = useState(''); const isEditMode = !!posteToEdit; useEffect(() => { if (isOpen) { if (isEditMode) { setDesignation(posteToEdit.designation); setActif(posteToEdit.actif); } else { setDesignation(''); setActif(true); } setError(''); } }, [isOpen, posteToEdit, isEditMode]); if (!isOpen) return null; const handleSubmit = (e) => { e.preventDefault(); if (!designation.trim()) { setError('La désignation est requise.'); return; } onSave({ designation, actif }); }; return (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}><div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-slide-in-up" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{isEditMode ? `Modifier: ${posteToEdit.designation}` : 'Ajouter un poste'}</h2><button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"><X size={20} /></button></div><form onSubmit={handleSubmit} className="space-y-5"><div><label htmlFor="designation" className="form-label">Désignation</label><input type="text" id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} className={`form-input w-full ${error ? 'border-red-500' : ''}`} placeholder="Ex: Ingénieur Logiciel" />{error && <p className="form-error-text mt-1">{error}</p>}</div><div><label className="form-label">Statut</label><div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md"><input type="checkbox" id="actif" checked={actif} onChange={(e) => setActif(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" /><label htmlFor="actif" className="text-sm text-slate-700 dark:text-slate-200">{actif ? 'Actif' : 'Inactif'}</label></div></div><div className="pt-4 flex justify-end space-x-3"><button type="button" onClick={onClose} className="btn btn-secondary"><XCircle size={18} className="mr-2" />Annuler</button><button type="submit" className="btn btn-primary"><Save size={18} className="mr-2" />{isEditMode ? 'Sauvegarder' : 'Créer'}</button></div></form></div></div>); };
const PostesTable = ({ postes, onEdit, onDelete }) => ( <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700"><thead className="bg-slate-50 dark:bg-slate-700/50"><tr><th scope="col" className="th-cell">Poste</th><th scope="col" className="th-cell">Statut</th><th scope="col" className="th-cell">Créé par</th><th scope="col" className="th-cell">Date création</th><th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">{postes.map((p) => ( <tr key={p.id} className="tr-hover"><td className="td-cell font-medium text-slate-900 dark:text-slate-100">{p.designation}</td><td className="td-cell"><span className={`status-badge ${p.actif ? 'status-green' : 'status-red'}`}>{p.actif ? 'Actif' : 'Inactif'}</span></td><td className="td-cell text-slate-500 dark:text-slate-400">{p.userCreation}</td><td className="td-cell text-slate-500 dark:text-slate-400">{formatDate(p.dateCreation)}</td><td className="td-cell text-right"><div className="flex items-center justify-end space-x-4"><button onClick={() => onEdit(p)} className="action-btn text-sky-600" title="Modifier"><Edit size={18} /></button><button onClick={() => onDelete(p)} className="action-btn text-red-600" title="Supprimer"><Trash2 size={18} /></button></div></td></tr>))}</tbody></table></div>);
const PosteRow = ({ poste, onEdit, onDelete }) => ( <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg p-4 flex items-center space-x-4 transition-all duration-200"><div className="flex-none p-2 bg-amber-100 dark:bg-amber-700/30 rounded-lg"><Briefcase className="text-amber-600 dark:text-amber-400" size={24} /></div><div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 items-center"><div className="truncate"><p className="text-md font-semibold text-slate-800 dark:text-slate-100 truncate" title={poste.designation}>{poste.designation}</p><span className={`status-badge ${poste.actif ? 'status-green' : 'status-red'}`}>{poste.actif ? 'Actif' : 'Inactif'}</span></div><div className="text-sm text-slate-500 dark:text-slate-400"><p>Créé par : <span className="font-medium text-slate-700 dark:text-slate-300">{poste.userCreation}</span></p></div><div className="text-sm text-slate-500 dark:text-slate-400"><p>Le : <span className="font-medium text-slate-700 dark:text-slate-300">{formatDate(poste.dateCreation)}</span></p></div></div><div className="flex items-center space-x-2"><button onClick={() => onEdit(poste)} className="action-btn text-sky-600" title="Modifier"><Edit size={18}/></button><button onClick={() => onDelete(poste)} className="action-btn text-red-600" title="Supprimer"><Trash2 size={18}/></button></div></div>);
const PosteCard = ({ poste, onEdit, onDelete }) => ( <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"><div className="flex-grow mb-4"><div className="flex items-start justify-between mb-2"><div className="flex items-center"><div className="p-2 bg-amber-100 dark:bg-amber-700/30 rounded-lg mr-3"><Briefcase className="text-amber-600 dark:text-amber-400" size={20} /></div><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{poste.designation}</h3></div><span className={`status-badge ${poste.actif ? 'status-green' : 'status-red'}`}>{poste.actif ? 'Actif' : 'Inactif'}</span></div><div className="text-sm text-slate-500 dark:text-slate-400 space-y-1 pl-12"><p>Créé par : <span className="font-medium text-slate-600 dark:text-slate-300">{poste.userCreation}</span></p><p>Le : <span className="font-medium text-slate-600 dark:text-slate-300">{formatDate(poste.dateCreation)}</span></p></div></div><div className="flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-700 pt-3"><button onClick={() => onEdit(poste)} className="btn btn-secondary-outline btn-sm group"><Edit size={16} className="mr-1.5"/> Modifier</button><button onClick={() => onDelete(poste)} className="btn btn-danger-outline btn-sm group"><Trash2 size={16} className="mr-1.5"/> Supprimer</button></div></div>);
const ConsulterPostesPage = () => { const [postes, setPostes] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(null); const [pageMessage, setPageMessage] = useState({ text: '', type: '' }); const [viewMode, setViewMode] = useState('table'); const [searchTerm, setSearchTerm] = useState(''); const [statusFilter, setStatusFilter] = useState('all'); const [activeSort, setActiveSort] = useState({ field: 'dateCreation', order: 'desc' }); const [isAddOrEditModalOpen, setAddOrEditModalOpen] = useState(false); const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); const [selectedPoste, setSelectedPoste] = useState(null); const sortDropdownRef = useRef(null); const filterDropdownRef = useRef(null); const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false); const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false); const sortOptions = [ { value: 'dateCreation', label: 'Date Création' }, { value: 'designation', label: 'Désignation (A-Z)' }, ]; const fetchPostes = useCallback(async () => { setLoading(true); setError(null); try { let params = {}; if(statusFilter === 'actif') params.actifs = true; if(statusFilter === 'inactif') params.actifs = false; const response = await posteService.getAllPostes(params); setPostes(response.data); } catch (err) { setError('Erreur de récupération.'); console.error(err); } finally { setLoading(false); } }, [statusFilter]); useEffect(() => { fetchPostes(); }, [fetchPostes]); useEffect(() => { const handleClickOutside = (event) => { if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) setIsSortDropdownOpen(false); if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) setIsFilterDropdownOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []); const processedPostes = useMemo(() => { let filtered = Array.isArray(postes) ? [...postes] : []; if (searchTerm) { filtered = filtered.filter(p => p.designation.toLowerCase().includes(searchTerm.toLowerCase())); } filtered.sort((a, b) => { let valA = a[activeSort.field]; let valB = b[activeSort.field]; if (activeSort.field === 'dateCreation') { valA = new Date(valA[0], valA[1]-1, valA[2]); valB = new Date(valB[0], valB[1]-1, valB[2]); } if (typeof valA === 'string') valA = valA.toLowerCase(); if (typeof valB === 'string') valB = valB.toLowerCase(); if (valA < valB) return activeSort.order === 'asc' ? -1 : 1; if (valA > valB) return activeSort.order === 'asc' ? 1 : -1; return 0; }); return filtered; }, [postes, searchTerm, activeSort]); const showMessage = (text, type = 'success') => { setPageMessage({ text, type }); setTimeout(() => setPageMessage({ text: '', type: '' }), 4000); }; const handleAddClick = () => { setSelectedPoste(null); setAddOrEditModalOpen(true); }; const handleEditClick = (poste) => { setSelectedPoste(poste); setAddOrEditModalOpen(true); }; const handleDeleteClick = (poste) => { setSelectedPoste(poste); setIsDeleteModalOpen(true); }; const handleSave = async (data) => { try { if (selectedPoste) { await posteService.updatePoste(selectedPoste.id, { ...selectedPoste, ...data }); showMessage('Poste mis à jour !'); } else { await posteService.createPoste(data); showMessage('Poste créé !'); } setAddOrEditModalOpen(false); fetchPostes(); } catch (err) { showMessage("Erreur.", 'error'); }}; const confirmDelete = async () => { if (!selectedPoste) return; try { await posteService.deletePoste(selectedPoste.id); showMessage('Poste supprimé.'); setIsDeleteModalOpen(false); fetchPostes(); } catch (err) { showMessage("Erreur.", 'error'); }}; return (<> <div className="space-y-6"> {pageMessage.text && (<div className={`fixed top-20 right-6 p-4 rounded-md shadow-lg z-[100] text-white flex items-center space-x-3 animate-slide-in-right ${pageMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}><span>{pageMessage.text}</span><button onClick={() => setPageMessage({ text: '', type: '' })} className="p-1 hover:bg-black/20 rounded-full"><X size={16}/></button></div>)} <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md"><div className="flex flex-wrap items-center justify-between gap-4 mb-4"><div className="flex items-center"><h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Gestion des Postes</h1><span className="ml-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium me-2 px-2.5 py-0.5 rounded-full">{processedPostes.length}</span></div><div className="flex items-center space-x-2"><button onClick={handleAddClick} className="btn btn-primary group"><Plus size={18} className="mr-2" />Ajouter</button><button onClick={() => setViewMode('table')} className={`view-btn ${viewMode === 'table' && 'active'}`} title="Vue Tableau"><Table size={20}/></button><button onClick={() => setViewMode('list')} className={`view-btn ${viewMode === 'list' && 'active'}`} title="Vue Liste"><List size={20}/></button><button onClick={() => setViewMode('grid')} className={`view-btn ${viewMode === 'grid' && 'active'}`} title="Vue Grille"><LayoutGrid size={20}/></button></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start"><div className="relative md:col-span-1"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input w-full pl-10"/></div><div className="relative" ref={filterDropdownRef}><button onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)} className="form-input w-full flex items-center justify-between"><div className="flex items-center space-x-2"><Filter size={16} /><span>{statusFilter === 'all' && 'Tous les statuts'}{statusFilter === 'actif' && 'Statut: Actif'}{statusFilter === 'inactif' && 'Statut: Inactif'}</span></div><ChevronDown size={16} className={`transition-transform ${isFilterDropdownOpen && "rotate-180"}`} /></button>{isFilterDropdownOpen && ( <div className="dropdown-menu"><button onClick={() => { setStatusFilter('all'); setIsFilterDropdownOpen(false); }} className="dropdown-item">Tous les statuts</button><button onClick={() => { setStatusFilter('actif'); setIsFilterDropdownOpen(false); }} className="dropdown-item">Actif</button><button onClick={() => { setStatusFilter('inactif'); setIsFilterDropdownOpen(false); }} className="dropdown-item">Inactif</button></div>)}</div><div className="relative" ref={sortDropdownRef}><button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="form-input w-full flex items-center justify-between"><div className="flex items-center space-x-2"><ArrowUpDown size={16} /><span>Trier par: {sortOptions.find(o => o.value === activeSort.field)?.label}</span></div><ChevronDown size={16} className={`transition-transform ${isSortDropdownOpen && "rotate-180"}`} /></button>{isSortDropdownOpen && ( <div className="dropdown-menu">{sortOptions.map(option => ( <button key={option.value} onClick={() => { setActiveSort(prev => ({ field: option.value, order: prev.field === option.value && prev.order === 'asc' ? 'desc' : 'asc' })); setIsSortDropdownOpen(false); }} className="dropdown-item justify-between"><span>{option.label}</span>{activeSort.field === option.value && (activeSort.order === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}</button>))}</div>)}</div></div></div> {loading ? <div className="text-center py-20 text-slate-500 dark:text-slate-400">Chargement...</div> : error ? <div className="text-center py-20 text-red-500">{error}</div> : processedPostes.length === 0 ? <div className="text-center py-20 text-slate-500 dark:text-slate-400"><h3 className="text-lg font-semibold">Aucun poste trouvé</h3><p>Essayez de modifier vos filtres ou <button onClick={handleAddClick} className="text-sky-500 hover:underline">créez un nouveau poste</button>.</p></div> : (<> {viewMode === 'table' && <PostesTable postes={processedPostes} onEdit={handleEditClick} onDelete={handleDeleteClick} />} {viewMode === 'list' && <div className="space-y-4">{processedPostes.map(p => <PosteRow key={p.id} poste={p} onEdit={handleEditClick} onDelete={handleDeleteClick}/>)}</div>} {viewMode === 'grid' && <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{processedPostes.map(p => <PosteCard key={p.id} poste={p} onEdit={handleEditClick} onDelete={handleDeleteClick}/>)}</div>} </>)} </div> <PosteFormModal isOpen={isAddOrEditModalOpen} onClose={() => setAddOrEditModalOpen(false)} onSave={handleSave} posteToEdit={selectedPoste} /> <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} poste={selectedPoste} /> </> ); };

// --- INTERFACE ADMIN PRINCIPALE ---
const AdminInterface = ({ user, onLogout: appLogoutHandler }) => {
  const [activePage, setActivePage] = useState('home'); 
  const [isDarkMode, setIsDarkMode] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('theme') === 'dark' : false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUserState, setCurrentUserState] = useState(user || { nom_utilisateur: 'admin_sys', role: 'admin' });
  
  useEffect(() => { if (typeof window !== 'undefined') { if (isDarkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); } }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => { const newMode = !prev; localStorage.setItem('theme', newMode ? 'dark' : 'light'); return newMode; });
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  
  const PlaceholderPage = ({ title }) => ( <div className="p-6 text-slate-700 dark:text-slate-300"><h1 className="text-2xl font-bold">{title}</h1><p className="mt-4">Cette section est en cours de construction.</p></div>);
  const renderActivePage = () => { switch (activePage) { case 'home': return <PlaceholderPage title="Tableau de bord Administrateur" />; case 'utilisateurs_consulter_utilisateurs': return <PlaceholderPage title="Consulter les Utilisateurs" />; case 'equipes_consulter_equipes': return <PlaceholderPage title="Consulter les Équipes" />; case 'modules_consulter_modules': return <PlaceholderPage title="Consulter les Modules" />; case 'postes_consulter_postes': return <ConsulterPostesPage />; case 'tickets_consulter_demandes': return <PlaceholderPage title="Consulter les Demandes de Ticket" />; case 'tickets_gerer': return <PlaceholderPage title="Gérer les Tickets Actifs" />; case 'tickets_voir_refuses': return <PlaceholderPage title="Consulter les Tickets Refusés" />; case 'consulter_profil_admin': return <PlaceholderPage title="Mon Profil" />; default: return <PlaceholderPage title={`Page "${activePage}" non trouvée`} />; } };
  
  const SidebarAdmin = ({ activePage, setActivePage, isSidebarOpen, toggleSidebar }) => {
      const [openDropdownKey, setOpenDropdownKey] = useState(null);
      const menuItems = [
          { id: 'home', label: 'HOME', icon: Home, path: '#' },
          { id: 'dashboards', label: 'DASHBOARDS', icon: LayoutDashboard, path: '#' },
          { id: 'tickets_main', label: 'TICKETS', icon: Ticket, subItems: [
              { id: 'tickets_consulter_demandes', label: 'Demandes en Attente', icon: FileText, path: '#' },
              { id: 'tickets_gerer', label: 'Tickets à Traiter', icon: ListChecks, path: '#' },
              { id: 'tickets_voir_refuses', label: 'Tickets Refusés', icon: ArchiveX, path: '#' },
          ], },
          { id: 'equipes_main', label: 'EQUIPES', icon: Users, subItems: [
              { id: 'equipes_consulter_equipes', label: 'Consulter les équipes', path: '#' },
          ], },
          { id: 'utilisateurs_main', label: 'UTILISATEURS', icon: UserCircle, subItems: [
              { id: 'utilisateurs_consulter_utilisateurs', label: 'Consulter les utilisateurs', path: '#' },
          ], },
          { id: 'modules_main', label: 'MODULES', icon: Package, subItems: [
              { id: 'modules_consulter_modules', label: 'Consulter les modules', path: '#' },
          ], },
          { id: 'postes_consulter_postes', label: 'POSTES', icon: Briefcase, path: '#' },
      ];
      const handleMainMenuClick = (item) => {
          if (item.subItems) {
              setOpenDropdownKey(openDropdownKey === item.id ? null : item.id);
          } else {
              setActivePage(item.id);
              setOpenDropdownKey(null);
              if (isSidebarOpen && window.innerWidth < 768) {
                  toggleSidebar();
              }
          }
      };

      useEffect(() => {
          const activeParent = menuItems.find(item => item.subItems?.some(sub => sub.id === activePage));
          if (activeParent) {
              setOpenDropdownKey(activeParent.id);
          }
      }, [activePage]);

      return ( <> {isSidebarOpen && (<div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={toggleSidebar}></div> )} <aside className={`fixed top-0 left-0 h-full bg-slate-800 dark:bg-slate-900 text-slate-100 dark:text-slate-200 w-64 p-4 pt-5 space-y-4 transition-transform transform ease-in-out duration-300 ${ isSidebarOpen ? 'translate-x-0' : '-translate-x-full' } md:translate-x-0 z-40 shadow-lg flex flex-col`}> <div className="relative text-center px-2 pt-2 pb-4"> <img src={logoClinisysImage_Sidebar} alt="Clinisys Logo" className="h-16 w-auto inline-block object-contain" onError={(e) => e.currentTarget.style.display='none'} /> <button onClick={toggleSidebar} className="md:hidden absolute top-2 right-2 p-1 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"> <X size={20} /> </button> </div> <nav className="space-y-1 flex-grow overflow-y-auto pr-1">{menuItems.map((item) => ( <div key={item.id}> <button onClick={() => handleMainMenuClick(item)} className={`group w-full flex items-center justify-between space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ease-in-out transform hover:translate-x-1 ${ (activePage === item.id && !item.subItems) || (item.subItems && openDropdownKey === item.id) || (item.subItems && item.subItems.some(sub => sub.id === activePage)) ? 'bg-sky-600 dark:bg-sky-500 text-white shadow-md' : 'hover:bg-slate-700 dark:hover:bg-slate-700/60 text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-slate-100' } ${activePage === item.id && !item.subItems ? 'scale-105' : ''} `}> <div className="flex items-center space-x-3"> <item.icon size={20} className={`transition-transform duration-200 ease-in-out ${activePage === item.id && !item.subItems ? 'scale-110' : 'group-hover:scale-110'}`} /> <span>{item.label}</span> </div> {item.subItems && ( openDropdownKey === item.id ? <ChevronUp size={18} /> : <ChevronDown size={18} /> )} </button> {item.subItems && openDropdownKey === item.id && ( <div className="ml-4 mt-1 space-y-1 pl-5 border-l-2 border-slate-700 dark:border-slate-600">{item.subItems.map((subItem) => ( <a key={subItem.id} href={subItem.path} onClick={(e) => { e.preventDefault(); setActivePage(subItem.id); if (isSidebarOpen && window.innerWidth < 768) { toggleSidebar(); } }} className={`group flex items-center space-x-2.5 py-2 px-2 rounded-md text-xs font-medium transition-all duration-150 ease-in-out hover:translate-x-0.5 ${ activePage === subItem.id ? 'text-sky-400 dark:text-sky-300 font-semibold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-200 dark:hover:text-slate-300' }`}> {subItem.icon ? <subItem.icon size={14} className={activePage === subItem.id ? "text-sky-500" : "text-slate-500 group-hover:text-slate-400"} /> : (activePage === subItem.id ? <CheckCircle2 size={14} className="text-sky-500" /> : <Circle size={14} className="text-slate-500 group-hover:text-slate-400" />)} <span>{subItem.label}</span> </a> ))}</div> )} </div> ))} </nav> </aside> </> );
  };
  
  const NavbarAdmin = ({ onLogout, user, toggleTheme, isDarkMode, onNavigateToUserProfile }) => {
      const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
      const profileDropdownRef = useRef(null);
      const userName = user ? (user.name || `${user.prenom || ''} ${user.nom || ''}`.trim() || user.nom_utilisateur) : 'Utilisateur';
      const userRole = user && user.role ? user.role.replace(/_/g, ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()) : 'Rôle';
      const userEmail = user ? (user.email || `${user.nom_utilisateur || 'user'}@example.com`) : 'email@example.com';
      const userProfilePic = user?.profileImage || defaultUserProfileImage_Navbar;
      
      useEffect(() => { const handleClickOutside = (event) => { if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) { setIsProfileDropdownOpen(false); } }; document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside); }, []);

      return (
        <nav className="fixed top-0 left-0 md:left-64 right-0 z-20 h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out">
            <div className="w-10 md:w-0"></div>
            <div className="flex-grow flex justify-center px-4">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400 dark:text-slate-500" /></div>
                    <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-transparent"/>
                </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
                <button onClick={toggleTheme} className="action-btn" title={isDarkMode ? "Mode Clair" : "Mode Sombre"}>{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
                <button className="relative action-btn" title="Notifications"><Bell size={20} /></button>
                <div className="relative" ref={profileDropdownRef}>
                    <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center space-x-2 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
                        <div className="hidden sm:block text-right mr-1">
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[100px]" title={userName}>{userName}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate max-w-[100px]" title={userRole}>{userRole}</div>
                        </div>
                        <img src={userProfilePic} alt="Profil" className="h-9 w-9 md:h-10 md:w-10 rounded-full object-cover border-2 border-transparent group-hover:border-sky-400 dark:group-hover:border-sky-500 transition-all" onError={(e) => { e.currentTarget.src = defaultUserProfileImage_Navbar; }} />
                        {isProfileDropdownOpen ? <ChevronUp size={16} className="text-slate-500 dark:text-slate-400 ml-1 hidden sm:block" /> : <ChevronDown size={16} className="text-slate-500 dark:text-slate-400 ml-1 hidden sm:block" />}
                    </button>
                    {isProfileDropdownOpen && (<div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-md shadow-xl py-1 z-50 border border-slate-200 dark:border-slate-700"> <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700"><p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={userName}>{userName}</p><p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={userEmail}>{userEmail}</p></div><button onClick={() => { onNavigateToUserProfile(); setIsProfileDropdownOpen(false); }} className="w-full text-left flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80"><User size={16} className="mr-2.5 text-slate-500 dark:text-slate-400" /> Consulter mon profil</button><button onClick={() => { onLogout(); setIsProfileDropdownOpen(false); }} className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/30"><LogOut size={16} className="mr-2.5" /> Se déconnecter</button> </div>)}
                </div>
            </div>
        </nav>
      );
  };


  return (
    <div className={`flex h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <GlobalStyles />
      <SidebarAdmin activePage={activePage} setActivePage={setActivePage} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <button onClick={toggleSidebar} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-md shadow"> <Menu size={24} /> </button>
        <NavbarAdmin user={currentUserState} onLogout={appLogoutHandler} toggleTheme={toggleTheme} isDarkMode={isDarkMode} onNavigateToUserProfile={() => setActivePage('consulter_profil_admin')} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto pt-16 md:ml-64 transition-all duration-300 ease-in-out">
            <div className="p-4 md:p-6">
              {renderActivePage()}
            </div>
        </main>
      </div>
    </div>
  );
};

// --- Styles Globaux ---
const GlobalStyles = () => (
    <style>{`
      .btn { @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50; }
      .btn-primary { @apply text-white bg-sky-600 hover:bg-sky-700 focus:ring-sky-500; }
      .btn-secondary { @apply text-slate-700 bg-slate-100 hover:bg-slate-200 focus:ring-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600; }
      .btn-secondary-outline { @apply text-slate-600 bg-white border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700;}
      .btn-danger { @apply text-white bg-red-600 hover:bg-red-700 focus:ring-red-500; }
      .btn-danger-outline { @apply text-red-600 bg-white border-red-300 hover:bg-red-50 dark:bg-slate-800 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-700; }
      .btn-sm { @apply px-3 py-1.5 text-xs rounded; }
      .form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1; }
      .form-input { @apply block w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm; }
      .form-error-text { @apply text-xs text-red-600 dark:text-red-400; }
      .view-btn { @apply p-2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600; }
      .view-btn.active { @apply bg-sky-500 text-white; }
      .dropdown-menu { @apply absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 z-20 py-1; }
      .dropdown-item { @apply w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700; }
      .th-cell { @apply px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider; }
      .td-cell { @apply px-6 py-4 whitespace-nowrap text-sm; }
      .tr-hover:hover { @apply bg-slate-50 dark:hover:bg-slate-700/50 transition-colors; }
      .status-badge { @apply px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full; }
      .status-green { @apply bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300; }
      .status-red { @apply bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300; }
      .action-btn { @apply p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors; }
      .nav-link { @apply flex items-center px-3 py-2.5 text-sm font-medium text-slate-300 dark:text-slate-400 rounded-md hover:bg-slate-700 dark:hover:bg-slate-700/60 hover:text-white dark:hover:text-slate-100; }
      .nav-link.active { @apply bg-sky-600 dark:bg-sky-500 text-white shadow-md font-semibold; }
      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      @keyframes slide-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-slide-in-up { animation: slide-in-up 0.4s ease-out forwards; }
      @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } } .animate-slide-in-right { animation: slide-in-right 0.4s ease-out forwards; }
    `}</style>
  );

// --- COMPOSANT EXPORTÉ ---
export default function App() {
  const user = { nom_utilisateur: 'admin_sys', role: 'admin', prenom: "Admin", nom: "Principal", email: "admin@clinisys.com" };
  const handleLogout = () => alert("Déconnexion !");
  
  return (
    <AdminInterface user={user} onLogout={handleLogout} />
  );
}
