import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, List, LayoutGrid, Filter, ArrowUpDown, ChevronDown, ChevronUp, Briefcase, Plus, X, Edit, Trash2, Save, XCircle, AlertTriangle, Table } from 'lucide-react';

// --- SERVICE API (Simulation) ---
// Ce bloc simule les appels à votre backend. Vous le remplacerez par votre véritable service.
const api = {
  get: async (url, config) => {
    console.log(`GET: ${url}`, config);
    await new Promise(res => setTimeout(res, 500));
    if (url.startsWith('/postes/')) {
        const id = parseInt(url.split('/')[2]);
        const poste = mockPostes.find(p => p.id === id);
        return { data: poste };
    }
    const params = new URLSearchParams(config?.params);
    const actifs = params.get('actifs');
    let data = [...mockPostes];
    if (actifs === 'true') data = mockPostes.filter(p => p.actif === true);
    if (actifs === 'false') data = mockPostes.filter(p => p.actif === false);
    return { data };
  },
  post: async (url, data) => {
    console.log(`POST: ${url}`, data);
    await new Promise(res => setTimeout(res, 500));
    const newPoste = { id: Math.max(...mockPostes.map(p => p.id)) + 1, ...data, dateCreation: [2025, 6, 12, 15, 42, 19, 973264300], userCreation: "samsamina" };
    mockPostes.push(newPoste);
    return { data: newPoste, status: 201 };
  },
  put: async (url, data) => {
    console.log(`PUT: ${url}`, data);
    await new Promise(res => setTimeout(res, 500));
    const id = parseInt(url.split('/')[2]);
    let posteToUpdate = mockPostes.find(p => p.id === id);
    if (posteToUpdate) {
        posteToUpdate.designation = data.designation;
        posteToUpdate.actif = data.actif;
    }
    return { data: posteToUpdate };
  },
  delete: async (url) => {
    console.log(`DELETE: ${url}`, url);
    await new Promise(res => setTimeout(res, 500));
    const id = parseInt(url.split('/')[2]);
    mockPostes = mockPostes.filter(p => p.id !== id);
    return { status: 204 };
  },
};
let mockPostes = [ { "id": 1, "designation": "Développeur Full-Stack", "actif": true, "dateCreation": [2023, 10, 1, 10, 0], "userCreation": "admin" }, { "id": 2, "designation": "Chef de Projet Technique", "actif": true, "dateCreation": [2023, 9, 15, 11, 30], "userCreation": "admin" }, { "id": 4, "designation": "Data Scientist", "actif": false, "dateCreation": [2023, 8, 20, 14, 0], "userCreation": "admin" }, { "id": 5, "designation": "Architecte Cloud", "actif": true, "dateCreation": [2024, 1, 5, 9, 45], "userCreation": "samsamina" }, { "id": 6, "designation": "Testeur QA", "actif": false, "dateCreation": [2024, 2, 10, 16, 20], "userCreation": "samsamina" } ];
const posteService = { getAllPostes: (params = {}) => api.get('/postes', { params }), getPosteById: (id) => api.get(`/postes/${id}`), createPoste: (posteData) => api.post('/postes', posteData), updatePoste: (id, posteData) => api.put(`/postes/${id}`, posteData), deletePoste: (id) => api.delete(`/postes/${id}`) };

// --- UTILITAIRES & COMPOSANTS ENFANTS ---
const formatDate = (dateArray) => { if (!Array.isArray(dateArray) || dateArray.length < 3) return "Date invalide"; return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); };
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, poste }) => { if (!isOpen) return null; return ( <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in"><div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-sm w-full transform transition-all animate-slide-in-up"><AlertTriangle size={48} className="text-red-500 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Confirmer la suppression</h3><p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Voulez-vous vraiment supprimer le poste : <br /><strong className="font-semibold">{poste?.designation}</strong> ?</p><div className="flex justify-center space-x-4"><button onClick={onClose} className="btn btn-secondary px-6 py-2">Annuler</button><button onClick={onConfirm} className="btn btn-danger px-6 py-2">Supprimer</button></div></div></div>); };
const PosteFormModal = ({ isOpen, onClose, onSave, posteToEdit }) => { const [designation, setDesignation] = useState(''); const [actif, setActif] = useState(true); const [error, setError] = useState(''); const isEditMode = !!posteToEdit; useEffect(() => { if (isOpen) { if (isEditMode) { setDesignation(posteToEdit.designation); setActif(posteToEdit.actif); } else { setDesignation(''); setActif(true); } setError(''); } }, [isOpen, posteToEdit, isEditMode]); if (!isOpen) return null; const handleSubmit = (e) => { e.preventDefault(); if (!designation.trim()) { setError('La désignation est requise.'); return; } onSave({ designation, actif }); }; return (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}><div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-slide-in-up" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{isEditMode ? `Modifier: ${posteToEdit.designation}` : 'Ajouter un poste'}</h2><button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"><X size={20} /></button></div><form onSubmit={handleSubmit} className="space-y-5"><div><label htmlFor="designation" className="form-label">Désignation</label><input type="text" id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} className={`form-input w-full ${error ? 'border-red-500' : ''}`} placeholder="Ex: Ingénieur Logiciel" />{error && <p className="form-error-text mt-1">{error}</p>}</div><div><label className="form-label">Statut</label><div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md"><input type="checkbox" id="actif" checked={actif} onChange={(e) => setActif(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" /><label htmlFor="actif" className="text-sm text-slate-700 dark:text-slate-200">{actif ? 'Actif' : 'Inactif'}</label></div></div><div className="pt-4 flex justify-end space-x-3"><button type="button" onClick={onClose} className="btn btn-secondary"><XCircle size={18} className="mr-2" />Annuler</button><button type="submit" className="btn btn-primary"><Save size={18} className="mr-2" />{isEditMode ? 'Sauvegarder' : 'Créer'}</button></div></form></div></div>); };
const PostesTable = ({ postes, onEdit, onDelete }) => ( <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700"><thead className="bg-slate-50 dark:bg-slate-700/50"><tr><th scope="col" className="th-cell">Poste</th><th scope="col" className="th-cell">Statut</th><th scope="col" className="th-cell">Créé par</th><th scope="col" className="th-cell">Date création</th><th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">{postes.map((p) => ( <tr key={p.id} className="tr-hover"><td className="td-cell font-medium text-slate-900 dark:text-slate-100">{p.designation}</td><td className="td-cell"><span className={`status-badge ${p.actif ? 'status-green' : 'status-red'}`}>{p.actif ? 'Actif' : 'Inactif'}</span></td><td className="td-cell text-slate-500 dark:text-slate-400">{p.userCreation}</td><td className="td-cell text-slate-500 dark:text-slate-400">{formatDate(p.dateCreation)}</td><td className="td-cell text-right"><div className="flex items-center justify-end space-x-4"><button onClick={() => onEdit(p)} className="action-btn text-sky-600" title="Modifier"><Edit size={18} /></button><button onClick={() => onDelete(p)} className="action-btn text-red-600" title="Supprimer"><Trash2 size={18} /></button></div></td></tr>))}</tbody></table></div>);
const PosteRow = ({ poste, onEdit, onDelete }) => ( <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg p-4 flex items-center space-x-4 transition-all duration-200"><div className="flex-none p-2 bg-amber-100 dark:bg-amber-700/30 rounded-lg"><Briefcase className="text-amber-600 dark:text-amber-400" size={24} /></div><div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 items-center"><div className="truncate"><p className="text-md font-semibold text-slate-800 dark:text-slate-100 truncate" title={poste.designation}>{poste.designation}</p><span className={`status-badge ${poste.actif ? 'status-green' : 'status-red'}`}>{poste.actif ? 'Actif' : 'Inactif'}</span></div><div className="text-sm text-slate-500 dark:text-slate-400"><p>Créé par : <span className="font-medium text-slate-700 dark:text-slate-300">{poste.userCreation}</span></p></div><div className="text-sm text-slate-500 dark:text-slate-400"><p>Le : <span className="font-medium text-slate-700 dark:text-slate-300">{formatDate(poste.dateCreation)}</span></p></div></div><div className="flex items-center space-x-2"><button onClick={() => onEdit(poste)} className="action-btn text-sky-600" title="Modifier"><Edit size={18}/></button><button onClick={() => onDelete(poste)} className="action-btn text-red-600" title="Supprimer"><Trash2 size={18}/></button></div></div>);
const PosteCard = ({ poste, onEdit, onDelete }) => ( <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"><div className="flex-grow mb-4"><div className="flex items-start justify-between mb-2"><div className="flex items-center"><div className="p-2 bg-amber-100 dark:bg-amber-700/30 rounded-lg mr-3"><Briefcase className="text-amber-600 dark:text-amber-400" size={20} /></div><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{poste.designation}</h3></div><span className={`status-badge ${poste.actif ? 'status-green' : 'status-red'}`}>{poste.actif ? 'Actif' : 'Inactif'}</span></div><div className="text-sm text-slate-500 dark:text-slate-400 space-y-1 pl-12"><p>Créé par : <span className="font-medium text-slate-600 dark:text-slate-300">{poste.userCreation}</span></p><p>Le : <span className="font-medium text-slate-600 dark:text-slate-300">{formatDate(poste.dateCreation)}</span></p></div></div><div className="flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-700 pt-3"><button onClick={() => onEdit(poste)} className="btn btn-secondary-outline btn-sm group"><Edit size={16} className="mr-1.5"/> Modifier</button><button onClick={() => onDelete(poste)} className="btn btn-danger-outline btn-sm group"><Trash2 size={16} className="mr-1.5"/> Supprimer</button></div></div>);

// --- COMPOSANT PRINCIPAL DE LA PAGE ---
const ConsulterPostesPage = () => {
    const [postes, setPostes] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(null); const [pageMessage, setPageMessage] = useState({ text: '', type: '' });
    const [viewMode, setViewMode] = useState('table'); const [searchTerm, setSearchTerm] = useState(''); const [statusFilter, setStatusFilter] = useState('all'); const [activeSort, setActiveSort] = useState({ field: 'dateCreation', order: 'desc' });
    const [isAddOrEditModalOpen, setAddOrEditModalOpen] = useState(false); const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); const [selectedPoste, setSelectedPoste] = useState(null);
    const sortDropdownRef = useRef(null); const filterDropdownRef = useRef(null); const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false); const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const sortOptions = [ { value: 'dateCreation', label: 'Date Création' }, { value: 'designation', label: 'Désignation (A-Z)' }, ];
    const fetchPostes = useCallback(async () => { setLoading(true); setError(null); try { let params = {}; if(statusFilter === 'actif') params.actifs = true; if(statusFilter === 'inactif') params.actifs = false; const response = await posteService.getAllPostes(params); setPostes(response.data); } catch (err) { setError('Erreur de récupération.'); console.error(err); } finally { setLoading(false); } }, [statusFilter]);
    useEffect(() => { fetchPostes(); }, [fetchPostes]);
    useEffect(() => { const handleClickOutside = (event) => { if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) setIsSortDropdownOpen(false); if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) setIsFilterDropdownOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
    const processedPostes = useMemo(() => { let filtered = Array.isArray(postes) ? [...postes] : []; if (searchTerm) { filtered = filtered.filter(p => p.designation.toLowerCase().includes(searchTerm.toLowerCase())); } filtered.sort((a, b) => { let valA = a[activeSort.field]; let valB = b[activeSort.field]; if (activeSort.field === 'dateCreation') { valA = new Date(valA[0], valA[1]-1, valA[2]); valB = new Date(valB[0], valB[1]-1, valB[2]); } if (typeof valA === 'string') valA = valA.toLowerCase(); if (typeof valB === 'string') valB = valB.toLowerCase(); if (valA < valB) return activeSort.order === 'asc' ? -1 : 1; if (valA > valB) return activeSort.order === 'asc' ? 1 : -1; return 0; }); return filtered; }, [postes, searchTerm, activeSort]);
    const showMessage = (text, type = 'success') => { setPageMessage({ text, type }); setTimeout(() => setPageMessage({ text: '', type: '' }), 4000); };
    const handleAddClick = () => { setSelectedPoste(null); setAddOrEditModalOpen(true); }; const handleEditClick = (poste) => { setSelectedPoste(poste); setAddOrEditModalOpen(true); }; const handleDeleteClick = (poste) => { setSelectedPoste(poste); setIsDeleteModalOpen(true); };
    const handleSave = async (data) => { try { if (selectedPoste) { await posteService.updatePoste(selectedPoste.id, { ...selectedPoste, ...data }); showMessage('Poste mis à jour !'); } else { await posteService.createPoste(data); showMessage('Poste créé !'); } setAddOrEditModalOpen(false); fetchPostes(); } catch (err) { showMessage("Erreur.", 'error'); }};
    const confirmDelete = async () => { if (!selectedPoste) return; try { await posteService.deletePoste(selectedPoste.id); showMessage('Poste supprimé.'); setIsDeleteModalOpen(false); fetchPostes(); } catch (err) { showMessage("Erreur.", 'error'); }};

    return (<> <div className="space-y-6 bg-slate-50 dark:bg-slate-900 p-4 md:p-6 min-h-full"> {pageMessage.text && (<div className={`fixed top-20 right-5 p-4 rounded-md shadow-lg z-[100] text-white flex items-center space-x-3 animate-slide-in-right ${pageMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}><span>{pageMessage.text}</span><button onClick={() => setPageMessage({ text: '', type: '' })} className="p-1 hover:bg-black/20 rounded-full"><X size={16}/></button></div>)} <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md"><div className="flex flex-wrap items-center justify-between gap-4 mb-4"><div className="flex items-center"><h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Gestion des Postes</h1><span className="ml-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium me-2 px-2.5 py-0.5 rounded-full">{processedPostes.length}</span></div><div className="flex items-center space-x-2"><button onClick={handleAddClick} className="btn btn-primary group"><Plus size={18} className="mr-2" />Ajouter</button><button onClick={() => setViewMode('table')} className={`view-btn ${viewMode === 'table' && 'active'}`} title="Vue Tableau"><Table size={20}/></button><button onClick={() => setViewMode('list')} className={`view-btn ${viewMode === 'list' && 'active'}`} title="Vue Liste"><List size={20}/></button><button onClick={() => setViewMode('grid')} className={`view-btn ${viewMode === 'grid' && 'active'}`} title="Vue Grille"><LayoutGrid size={20}/></button></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start"><div className="relative md:col-span-1"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input w-full pl-10"/></div><div className="relative" ref={filterDropdownRef}><button onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)} className="form-input w-full flex items-center justify-between"><div className="flex items-center space-x-2"><Filter size={16} /><span>{statusFilter === 'all' && 'Tous les statuts'}{statusFilter === 'actif' && 'Statut: Actif'}{statusFilter === 'inactif' && 'Statut: Inactif'}</span></div><ChevronDown size={16} className={`transition-transform ${isFilterDropdownOpen && "rotate-180"}`} /></button>{isFilterDropdownOpen && ( <div className="dropdown-menu"><button onClick={() => { setStatusFilter('all'); setIsFilterDropdownOpen(false); }} className="dropdown-item">Tous les statuts</button><button onClick={() => { setStatusFilter('actif'); setIsFilterDropdownOpen(false); }} className="dropdown-item">Actif</button><button onClick={() => { setStatusFilter('inactif'); setIsFilterDropdownOpen(false); }} className="dropdown-item">Inactif</button></div>)}</div><div className="relative" ref={sortDropdownRef}><button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="form-input w-full flex items-center justify-between"><div className="flex items-center space-x-2"><ArrowUpDown size={16} /><span>Trier par: {sortOptions.find(o => o.value === activeSort.field)?.label}</span></div><ChevronDown size={16} className={`transition-transform ${isSortDropdownOpen && "rotate-180"}`} /></button>{isSortDropdownOpen && ( <div className="dropdown-menu">{sortOptions.map(option => ( <button key={option.value} onClick={() => { setActiveSort(prev => ({ field: option.value, order: prev.field === option.value && prev.order === 'asc' ? 'desc' : 'asc' })); setIsSortDropdownOpen(false); }} className="dropdown-item justify-between"><span>{option.label}</span>{activeSort.field === option.value && (activeSort.order === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}</button>))}</div>)}</div></div></div> {loading ? <div className="text-center py-20 text-slate-500 dark:text-slate-400">Chargement...</div> : error ? <div className="text-center py-20 text-red-500">{error}</div> : processedPostes.length === 0 ? <div className="text-center py-20 text-slate-500 dark:text-slate-400"><h3 className="text-lg font-semibold">Aucun poste trouvé</h3><p>Essayez de modifier vos filtres ou <button onClick={handleAddClick} className="text-sky-500 hover:underline">créez un nouveau poste</button>.</p></div> : (<> {viewMode === 'table' && <PostesTable postes={processedPostes} onEdit={handleEditClick} onDelete={handleDeleteClick} />} {viewMode === 'list' && <div className="space-y-4">{processedPostes.map(p => <PosteRow key={p.id} poste={p} onEdit={handleEditClick} onDelete={handleDeleteClick}/>)}</div>} {viewMode === 'grid' && <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{processedPostes.map(p => <PosteCard key={p.id} poste={p} onEdit={handleEditClick} onDelete={handleDeleteClick}/>)}</div>} </>)} </div> <PosteFormModal isOpen={isAddOrEditModalOpen} onClose={() => setAddOrEditModalOpen(false)} onSave={handleSave} posteToEdit={selectedPoste} /> <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} poste={selectedPoste} /> </> );
};


// --- EXPORTATION DU COMPOSANT AUTONOME ---
export default function App() {
  // Les styles globaux sont inclus ici pour que le composant soit autonome.
  // Dans votre projet, vous pourriez les déplacer dans votre fichier CSS principal (ex: index.css).
  const GlobalStyles = () => (
    <style>{`
      .btn { @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50; }
      .btn-primary { @apply text-white bg-sky-600 hover:bg-sky-700 focus:ring-sky-500; }
      .btn-secondary { @apply text-slate-700 bg-slate-100 hover:bg-slate-200 focus:ring-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600; }
      .btn-secondary-outline { @apply text-slate-600 bg-white border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700;}
      .btn-danger { @apply text-white bg-red-600 hover:bg-red-700 focus:ring-red-500; }
      .btn-danger-outline { @apply text-red-600 bg-white border-red-300 hover:bg-red-50 dark:bg-slate-800 dark:border-red-600 dark:text-red-300 dark:hover:bg-slate-700; }
      .btn-sm { @apply px-3 py-1.5 text-xs rounded; }
      
      .form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1; }
      .form-input { @apply block w-full px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm; }
      .form-error-text { @apply text-xs text-red-600 dark:text-red-400; }

      .view-btn { @apply p-2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600; }
      .view-btn.active { @apply bg-sky-500 text-white; }
      
      .dropdown-menu { @apply absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 z-20 py-1; }
      .dropdown-item { @apply w-full text-left flex px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700; }

      .th-cell { @apply px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider; }
      .td-cell { @apply px-6 py-4 whitespace-nowrap text-sm; }
      .tr-hover:hover { @apply bg-slate-50 dark:hover:bg-slate-700/50 transition-colors; }
      .status-badge { @apply px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full; }
      .status-green { @apply bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300; }
      .status-red { @apply bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300; }
      .action-btn { @apply p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors; }

      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      @keyframes slide-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-slide-in-up { animation: slide-in-up 0.4s ease-out forwards; }
      @keyframes slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } } .animate-slide-in-right { animation: slide-in-right 0.4s ease-out forwards; }
    `}</style>
  );

  return (
    <>
      <GlobalStyles />
      <ConsulterPostesPage />
    </>
  );
}
