// src/components/admin/Postes/ConsulterPostesPage.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, List, LayoutGrid, Rows3, ArrowUpDown, ChevronDown, ChevronUp, Briefcase as BriefcasePlus, X, Filter, AlertTriangle, Save, XCircle } from 'lucide-react';
import posteService from '../../../services/posteService';
import PosteCard from './PosteCard';
import PosteRow from './PosteRow';
import PosteTableRow from './PosteTableRow';
import AjouterPostePage from './AjouterPostePage';

// --- VÉRIFIE BIEN QUE TOUS CES PETITS COMPOSANTS SONT PRÉSENTS EN HAUT DE TON FICHIER ---

const Spinner = () => <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto my-10"></div>;

const PageMessage = ({ message, onDismiss }) => {
    if (!message) return null;
    const colors = {
        success: 'bg-green-100 dark:bg-green-800/70 border-green-500 text-green-700 dark:text-green-100',
        error: 'bg-red-100 dark:bg-red-800/70 border-red-500 text-red-700 dark:text-red-100',
        info: 'bg-blue-100 dark:bg-blue-800/70 border-blue-500 text-blue-700 dark:text-blue-100',
    };
    return (
        <div className={`fixed top-24 right-6 p-4 rounded-md shadow-lg z-[100] flex items-center space-x-3 animate-slide-in-right border-l-4 ${colors[message.type]}`} role="alert">
            <span className="font-medium flex-grow">{message.text}</span>
            <button onClick={onDismiss} className="ml-auto p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"> <X size={18} /> </button>
        </div>
    );
};

// ** C'EST LA DÉFINITION QUI MANQUAIT PROBABLEMENT **
const DeleteConfirmationModal = ({ poste, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-md w-full">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Confirmer la suppression</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 my-2">
                Voulez-vous vraiment supprimer le poste <strong className="font-semibold">"{poste?.designation}"</strong> ? Cette action est irréversible.
            </p>
            <div className="flex justify-center space-x-3 mt-6">
                <button onClick={onCancel} className="btn btn-secondary">Annuler</button>
                <button onClick={onConfirm} className="btn btn-danger">Supprimer</button>
            </div>
        </div>
    </div>
);

// ** AINSI QUE CELLE-CI **
const EditModal = ({ poste, onUpdate, onCancel }) => {
    // ÉTAT 1: pour la désignation
    const [designation, setDesignation] = useState(poste?.designation || '');
    
    // ÉTAT 2: On ajoute un état pour le statut "actif"
    const [actif, setActif] = useState(poste?.actif === true); // S'assurer que c'est bien un booléen
    
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!designation.trim()) {
            setError('La désignation est requise.');
            return;
        }
        // On envoie maintenant un objet avec les DEUX champs
        onUpdate(poste.id, { designation, actif });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Modifier le Poste</h2>
                <div className="space-y-4">
                    {/* Champ Désignation (inchangé) */}
                    <div>
                        <label htmlFor="designation" className="form-label">Désignation du poste</label>
                        <input
                            type="text"
                            id="designation"
                            value={designation}
                            onChange={(e) => { setDesignation(e.target.value); setError(''); }}
                            className={`form-input ${error ? 'border-red-500' : ''}`}
                        />
                        {error && <p className="form-error-text">{error}</p>}
                    </div>

                    {/* Champ Actif (NOUVEAU) */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="actif"
                            checked={actif}
                            onChange={(e) => setActif(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        />
                        <label htmlFor="actif" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Actif
                        </label>
                    </div>
                </div>

                {/* Boutons (inchangés) */}
                <div className="pt-8 flex justify-end space-x-2">
                    <button type="button" onClick={onCancel} className="btn btn-secondary"><XCircle size={16} className="mr-1.5"/> Annuler</button>
                    <button type="button" onClick={handleSubmit} className="btn btn-primary"><Save size={16} className="mr-1.5"/> Confirmer</button>
                </div>
            </div>
        </div>
    );
};


// --- Composant Principal ---
const ConsulterPostesPage = ({ initialPostes = null }) => {
    // --- STATE MANAGEMENT ---
    const [view, setView] = useState('list');
    const [postes, setPostes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageMessage, setPageMessage] = useState(null);
    const [posteToEdit, setPosteToEdit] = useState(null);
    const [posteToDelete, setPosteToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('tous');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const sortDropdownRef = useRef(null);
    const filterDropdownRef = useRef(null);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

    // --- DATA FETCHING ---
    const fetchPostes = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await posteService.getAllPostes(filterStatus);
            setPostes(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setPageMessage({ type: 'error', text: 'Erreur lors de la récupération des postes.' });
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        if (view === 'list') {
            if (initialPostes) {
                setPostes(initialPostes);
                setIsLoading(false);
            } else {
                fetchPostes();
            }
        }
    }, [view, fetchPostes, initialPostes]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) setIsSortDropdownOpen(false);
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) setIsFilterDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const showTemporaryMessage = (type, text) => {
        setPageMessage({ type, text });
        setTimeout(() => setPageMessage(null), 5000);
    };

    // --- CRUD HANDLERS ---
    const handleAddPoste = async (posteData) => {
        try {
            const response = await posteService.createPoste(posteData);
            showTemporaryMessage('success', `Le poste "${response.data.designation}" a été ajouté.`);
            setView('list');
        } catch (err) {
            showTemporaryMessage('error', "Erreur lors de l'ajout du poste.");
        }
    };

    const handleUpdatePoste = async (id, posteData) => {
        try {
            const response = await posteService.updatePoste(id, posteData);
            setPosteToEdit(null);
            showTemporaryMessage('success', `Le poste "${response.data.designation}" a été mis à jour.`);
            fetchPostes();
        } catch (err) {
            showTemporaryMessage('error', 'Erreur lors de la mise à jour.');
        }
    };

    const handleDeletePoste = async () => {
        if (!posteToDelete) return;
        try {
            await posteService.deletePoste(posteToDelete.id);
            showTemporaryMessage('info', `Le poste "${posteToDelete.designation}" a été supprimé.`);
            setPosteToDelete(null);
            fetchPostes();
        } catch (err) {
            let errorMessage = 'Une erreur est survenue lors de la suppression.';
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            } else if (err.response && (err.response.status === 409 || err.response.status === 400)) {
                 errorMessage = `Impossible de supprimer : ce poste est probablement encore utilisé.`;
            }
            showTemporaryMessage('error', errorMessage);
            setPosteToDelete(null);
        }
    };

    // --- UI LOGIC (SORTING/FILTERING) ---
    const processedPostes = useMemo(() => {
        let filteredPostes = [...postes];
        if (searchTerm) {
            filteredPostes = filteredPostes.filter(p => p.designation.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        filteredPostes.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return filteredPostes;
    }, [postes, searchTerm, sortConfig]);

    const handleSortChange = (key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
        setIsSortDropdownOpen(false);
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        setIsFilterDropdownOpen(false);
    };
    
    if (view === 'add') {
        return <AjouterPostePage onAddPoste={handleAddPoste} onCancel={() => setView('list')} adminName="Admin Connecté" />;
    }

    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
            <PageMessage message={pageMessage} onDismiss={() => setPageMessage(null)} />
            {posteToDelete && <DeleteConfirmationModal poste={posteToDelete} onConfirm={handleDeletePoste} onCancel={() => setPosteToDelete(null)} />}
            {posteToEdit && <EditModal poste={posteToEdit} onUpdate={handleUpdatePoste} onCancel={() => setPosteToEdit(null)} />}

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                        Gestion des Postes <span className="text-sm font-normal text-slate-500">({processedPostes.length})</span>
                    </h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setView('add')} className="btn btn-primary group">
                            <BriefcasePlus size={18} className="mr-2"/> Ajouter un Poste
                        </button>
                        
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`} title="Vue Tableau">
                            <List size={20} />
                        </button>
                        
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`} title="Vue Grille">
                            <LayoutGrid size={20} />
                        </button>
                        
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`} title="Vue Lignes">
                            <Rows3 size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="relative md:col-span-1">
                        <Search className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input type="text" placeholder="Rechercher par désignation..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input pl-10" />
                    </div>
                    <div className="relative" ref={filterDropdownRef}>
                        <button onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)} className="w-full btn btn-secondary flex items-center justify-between">
                            <div className="flex items-center"><Filter size={16} className="mr-2"/> <span>Filtrer par: <span className="font-semibold capitalize">{filterStatus}</span></span></div>
                            {isFilterDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {isFilterDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg z-10 py-1 border dark:border-slate-700">
                                {['tous', 'actif', 'inactif'].map(status => ( <button key={status} onClick={() => handleFilterChange(status)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 capitalize">{status}</button>))}
                            </div>
                        )}
                    </div>
                    <div className="relative" ref={sortDropdownRef}>
                        <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="w-full btn btn-secondary flex items-center justify-between">
                            <div className="flex items-center"><ArrowUpDown size={16} className="mr-2" /><span>Trier par: <span className="font-semibold">{sortConfig.key}</span></span></div>
                            {isSortDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {isSortDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 rounded-md shadow-lg z-10 py-1 border dark:border-slate-700">
                                {[{key: 'designation', label: 'Désignation'}, {key: 'dateCreation', label: 'Date Création'}, {key: 'id', label: 'ID'}].map(option => ( <button key={option.key} onClick={() => handleSortChange(option.key)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">{option.label}</button>))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <Spinner />
            ) : processedPostes.length === 0 ? (
                <div className="text-center py-10 text-slate-500">Aucun poste trouvé.</div>
            ) : (
                <div className="mt-6">
                    {/* Vue Tableau */}
                    {viewMode === 'table' && (
                        <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Poste</th>
                                        <th scope="col" className="px-6 py-3">Statut</th>
                                        <th scope="col" className="px-6 py-3">Créé par</th>
                                        <th scope="col" className="px-6 py-3">Date Création</th>
                                        <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedPostes.map(poste => ( <PosteTableRow key={poste.id} poste={poste} onEdit={() => setPosteToEdit(poste)} onDelete={() => setPosteToDelete(poste)} /> ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Vue Grille */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {processedPostes.map(poste => ( <PosteCard key={poste.id} poste={poste} onEdit={() => setPosteToEdit(poste)} onDelete={() => setPosteToDelete(poste)} /> ))}
                        </div>
                    )}

                    {/* Vue Lignes */}
                    {viewMode === 'list' && (
                        <div className="space-y-3">
                            {processedPostes.map(poste => ( <PosteRow key={poste.id} poste={poste} onEdit={() => setPosteToEdit(poste)} onDelete={() => setPosteToDelete(poste)} /> ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ConsulterPostesPage;