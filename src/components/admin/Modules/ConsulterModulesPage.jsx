// src/components/admin/Modules/ConsulterModulesPage.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, List, LayoutGrid, Rows3, PackagePlus, Filter, AlertTriangle, Save, XCircle, Edit, Trash2, ChevronDown, X as XIcon } from 'lucide-react';

import moduleService from '../../../services/moduleService';
import equipeService from '../../../services/equipeService';
import { formatDateFromArray } from '../../../utils/dateFormatter';

import AjouterModulePage from './AjouterModulePage';
import ModuleCard from './ModuleCard';
import ModuleRow from './ModuleRow';
import ModuleTableRow from './ModuleTableRow';

// --- Composants UI Internes ---
const Spinner = () => <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto my-10"></div>;
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
            <button onClick={onDismiss} className="ml-auto p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"> <XIcon size={18} /> </button>
        </div>
    );
};
const DeleteConfirmationModal = ({ module, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-md w-full">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Confirmer la suppression</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 my-2">Voulez-vous vraiment supprimer le module <strong className="font-semibold">"{module?.designation}"</strong> ?</p>
            <div className="flex justify-center space-x-3 mt-6"><button onClick={onCancel} className="btn btn-secondary">Annuler</button><button onClick={onConfirm} className="btn btn-danger">Supprimer</button></div>
        </div>
    </div>
);

const EditModal = ({ module, equipes, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({
        designation: '',
        idEquipe: '',
        actif: true,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (module) {
            setFormData({
                designation: module.designation || '',
                idEquipe: module.equipe?.id || '',
                actif: module.actif === true,
            });
        }
    }, [module]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = () => {
        const newErrors = {};
        if (!formData.designation.trim()) newErrors.designation = "La désignation est requise.";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        const payload = {
            designation: formData.designation,
            idEquipe: formData.idEquipe ? parseInt(formData.idEquipe, 10) : null,
            actif: formData.actif,
        };
        
        onUpdate(module.id, payload);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Modifier le Module</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="designation" className="form-label">Nom du Module</label>
                        <input type="text" id="designation" name="designation" value={formData.designation} onChange={handleInputChange} className={`form-input ${errors.designation ? 'border-red-500' : ''}`} />
                        {errors.designation && <p className="form-error-text">{errors.designation}</p>}
                    </div>
                    <div>
                        <label htmlFor="idEquipe" className="form-label">Équipe (Optionnel)</label>
                        <select id="idEquipe" name="idEquipe" value={formData.idEquipe} onChange={handleInputChange} className="form-select">
                            <option value="">-- Non assignée --</option>
                            {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.designation}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center pt-2">
                        <input type="checkbox" id="actif" name="actif" checked={formData.actif} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                        <label htmlFor="actif" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300">Actif</label>
                    </div>
                </div>
                <div className="pt-8 flex justify-end space-x-2">
                    <button type="button" onClick={onCancel} className="btn btn-secondary">Annuler</button>
                    <button type="button" onClick={handleSubmit} className="btn btn-primary">Confirmer</button>
                </div>
            </div>
        </div>
    );
};


const ConsulterModulesPage = ({ initialModules = null }) => {
    const [view, setView] = useState('list');
    const [modules, setModules] = useState([]);
    const [equipes, setEquipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageMessage, setPageMessage] = useState(null);
    const [moduleToEdit, setModuleToEdit] = useState(null);
    const [moduleToDelete, setModuleToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEquipeId, setFilterEquipeId] = useState('');

  // After Correction
const showTemporaryMessage = useCallback((type, text) => {
    setPageMessage({ type, text });
    setTimeout(() => setPageMessage(null), 5000);
}, []); // An empty dependency array stabilizes the function

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const filters = filterEquipeId ? { equipeId: filterEquipeId } : {};
            const equipesRes = await equipeService.getAllEquipes();
            setEquipes(equipesRes.data || []);
            
            if (initialModules) {
                setModules(initialModules);
            } else {
                const modulesRes = await moduleService.getAllModules(filters);
                setModules(modulesRes.data || []);
            }
        } catch (err) {
            showTemporaryMessage('error', 'Erreur de chargement des données.');
        } finally {
            setIsLoading(false);
        }
    }, [filterEquipeId, initialModules, showTemporaryMessage]);

    useEffect(() => {
        if (view === 'list') {
            fetchAllData();
        }
    }, [view, fetchAllData]);

    const handleAddModule = async (moduleData) => {
        try {
            await moduleService.createModule(moduleData);
            showTemporaryMessage('success', 'Module ajouté avec succès.');
            setView('list');
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Erreur lors de l'ajout du module.";
            showTemporaryMessage('error', errorMsg);
        }
    };
    const handleUpdateModule = async (id, moduleData) => {
        try {
            await moduleService.updateModule(id, moduleData);
            showTemporaryMessage('success', 'Module mis à jour.');
            setModuleToEdit(null);
            fetchAllData();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Erreur lors de la mise à jour.';
            showTemporaryMessage('error', errorMsg);
        }
    };
    const handleDeleteModule = async () => {
        if (!moduleToDelete) return;
        try {
            await moduleService.deleteModule(moduleToDelete.id);
            showTemporaryMessage('info', 'Module supprimé.');
            setModuleToDelete(null);
            fetchAllData();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Impossible de supprimer, le module est peut-être utilisé.';
            showTemporaryMessage('error', errorMsg);
        }
    };

    const filteredModules = useMemo(() => {
        if (!Array.isArray(modules)) return [];
        return modules.filter(mod => mod.designation.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [modules, searchTerm]);

    if (view === 'add') {
        return <AjouterModulePage onAddModule={handleAddModule} onCancel={() => setView('list')} availableEquipes={equipes} />;
    }
    
    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
            <PageMessage message={pageMessage} onDismiss={() => setPageMessage(null)} />
            {moduleToDelete && <DeleteConfirmationModal module={moduleToDelete} onConfirm={handleDeleteModule} onCancel={() => setModuleToDelete(null)} />}
            {moduleToEdit && <EditModal module={moduleToEdit} equipes={equipes} onUpdate={handleUpdateModule} onCancel={() => setModuleToEdit(null)} />}
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                 <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Gestion des Modules ({filteredModules.length})</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setView('add')} className="btn btn-primary group"><PackagePlus size={18} className="mr-2"/> Ajouter Module</button>
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`} title="Tableau"><List size={20} /></button>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`} title="Grille"><LayoutGrid size={20} /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`} title="Lignes"><Rows3 size={20} /></button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <input type="text" placeholder="Rechercher par désignation..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="form-input" />
                    <select value={filterEquipeId} onChange={e => setFilterEquipeId(e.target.value)} className="form-select">
                        <option value="">Filtrer par équipe (Toutes)</option>
                        {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.designation}</option>)}
                    </select>
                </div>
            </div>

            {isLoading ? <Spinner /> : (
                <div className="mt-6">
                    {filteredModules.length === 0 ? (<p className="text-center text-slate-500 py-10">Aucun module trouvé.</p>) : (
                        <>
                            {viewMode === 'table' && 
                                <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
                                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                        <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                                            <tr>
                                                <th scope="col" className="px-6 py-3">Module</th>
                                                <th scope="col" className="px-6 py-3">Statut</th>
                                                <th scope="col" className="px-6 py-3">Équipe</th>
                                                <th scope="col" className="px-6 py-3">Créé par</th>
                                                <th scope="col" className="px-6 py-3">Date Création</th>
                                                <th scope="col" className="px-6 py-3">Tickets</th>
                                                <th scope="col" className="px-6 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredModules.map(mod => <ModuleTableRow key={mod.id} module={mod} onEdit={() => setModuleToEdit(mod)} onDelete={() => setModuleToDelete(mod)} />)}
                                        </tbody>
                                    </table>
                                </div>
                            }
                            {viewMode === 'grid' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{filteredModules.map(mod => <ModuleCard key={mod.id} module={mod} onEdit={() => setModuleToEdit(mod)} onDelete={() => setModuleToDelete(mod)} />)}</div>}
                            {viewMode === 'list' && <div className="space-y-3">{filteredModules.map(mod => <ModuleRow key={mod.id} module={mod} onEdit={() => setModuleToEdit(mod)} onDelete={() => setModuleToDelete(mod)} />)}</div>}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
export default ConsulterModulesPage;