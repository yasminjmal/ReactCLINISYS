import React, { useState, useEffect, useCallback , useRef} from 'react';
import ticketService from '../../../services/ticketService';
import moduleService from '../../../services/moduleService';
import { formatDateFromArray } from '../../../utils/dateFormatter';

import {
    ArrowLeft, Check, X, GitFork, Loader, Send, PlusCircle, User, Tag, Info, Calendar,
    Package as ModuleIcon, UserCheck, Shield, Edit, Trash2, Eye, EyeOff,
} from 'lucide-react';

// --- COMPOSANTS UTILITAIRES ---
const Spinner = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>;
const useAutosizeTextArea = (textAreaRef, value) => {
    useEffect(() => {
        if (textAreaRef.current) {
            // Réinitialise la hauteur pour permettre au champ de rétrécir si du texte est supprimé
            textAreaRef.current.style.height = "0px";
            const scrollHeight = textAreaRef.current.scrollHeight;
            // Définit la hauteur en fonction du contenu
            textAreaRef.current.style.height = scrollHeight + "px";
        }
    }, [textAreaRef, value]);
};
// --- MODAL DE DIFFRACTION ---
const DiffractionForm = ({ parentTicket, onClose, onSuccess, showTemporaryMessage }) => {
    const [subTickets, setSubTickets] = useState([{ titre: '', description: '', priorite: 'Moyenne' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const priorities = ["Basse", "Moyenne", "Haute"];
    const handleAddSubTicket = () => setSubTickets([...subTickets, { titre: '', description: '', priorite: 'Moyenne' }]);
    const handleRemoveSubTicket = (indexToRemove) => setSubTickets(prev => prev.filter((_, index) => index !== indexToRemove));
    const handleSubTicketChange = (index, field, value) => { const newSubTickets = [...subTickets]; newSubTickets[index][field] = value; setSubTickets(newSubTickets); };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const ticketsToCreate = subTickets.filter(t => t.titre.trim() !== '');
        if (ticketsToCreate.length === 0) { if (showTemporaryMessage) showTemporaryMessage('error', 'Veuillez renseigner au moins un sous-ticket.'); return; }
        setIsSubmitting(true);
        const creationPromises = ticketsToCreate.map(subTicket => ticketService.createTicket({ ...subTicket, idParentTicket: parentTicket.id, idClient: parentTicket.idClient?.id, statue: 'Accepte', actif: true, }));
        try { await Promise.all(creationPromises); onSuccess(); } catch (error) { console.error("Erreur:", error); if (showTemporaryMessage) showTemporaryMessage('error', error.response?.data?.message || "Une erreur est survenue."); } finally { setIsSubmitting(false); }
    };
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">Ajouter des Sous-tickets</h3><button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><X size={20}/></button></div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {subTickets.map((st, index) => (
                        <div key={index} className="p-4 border dark:border-slate-700 rounded-md space-y-3 bg-slate-50 dark:bg-slate-800/50 relative">
                            <button type="button" onClick={() => handleRemoveSubTicket(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700" title="Supprimer"><Trash2 size={16} /></button>
                            <h4>Sous-ticket #{index + 1}</h4>
                            <div><label className="form-label text-xs">Titre *</label><input type="text" value={st.titre} onChange={(e) => handleSubTicketChange(index, 'titre', e.target.value)} className="form-input" required /></div>
                            <div><label className="form-label text-xs">Description</label><textarea value={st.description} onChange={(e) => handleSubTicketChange(index, 'description', e.target.value)} className="form-textarea" rows="2"></textarea></div>
                            <div><label className="form-label text-xs">Priorité</label><select value={st.priorite} onChange={(e) => handleSubTicketChange(index, 'priorite', e.target.value)} className="form-select w-full">{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddSubTicket} className="btn btn-secondary w-full mt-2"><PlusCircle size={18} className="mr-2"/>Ajouter</button>
                </form>
                <div className="flex-shrink-0 flex justify-end space-x-3 mt-6 pt-4 border-t dark:border-slate-700">
                    <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>Annuler</button>
                    <button type="submit" onClick={handleSubmit} className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? <Spinner /> : <Send size={16} className="mr-2"/>}{isSubmitting ? "Création..." : "Confirmer"}</button>
                </div>
            </div>
        </div>
    );
};

// --- COMPOSANTS D'ÉDITION ---
const EditableField = ({ initialValue, onSave, fieldName, isTextarea = false }) => {const [isEditing, setIsEditing] = useState(false); const [value, setValue] = useState(initialValue); const handleSave = () => { onSave(fieldName, value); setIsEditing(false); }; if (isEditing) { return ( <div className="flex items-center gap-2 w-full">{isTextarea ? (<textarea value={value} onChange={(e) => setValue(e.target.value)} className="form-textarea flex-grow" rows={5} />) : (<input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="form-input flex-grow" />)}<button onClick={handleSave} className="btn btn-success-icon"><Check size={18} /></button><button onClick={() => setIsEditing(false)} className="btn btn-danger-icon"><X size={18} /></button></div> ); } return ( <div className="flex items-start gap-2">{isTextarea ? (<p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md w-full">{initialValue || <span className="italic">Aucune description.</span>}</p>) : (<h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{initialValue}</h1>)}<button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-sky-500"><Edit size={16} /></button></div> );};
const DetailItem = ({ icon, label, value, children }) => (<div><dt className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-0.5">{icon}{label}</dt><dd className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words">{children || value || <span className="italic text-slate-400">N/A</span>}</dd></div>);
const ModuleEditor = ({ ticket, onUpdate, onRemove, allModules }) => { const [isEditing, setIsEditing] = useState(false); const [searchTerm, setSearchTerm] = useState(''); if (isEditing) { return ( <div className="p-2 border rounded-md bg-white dark:bg-slate-900 w-48 shadow-lg"><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input w-full mb-2 text-sm" /><div className="max-h-40 overflow-y-auto">{allModules.filter(m => m.designation.toLowerCase().includes(searchTerm.toLowerCase())).map(module => (<div key={module.id} onClick={() => { onUpdate('idModule', module.id); setIsEditing(false);}} className="p-2 rounded-md hover:bg-sky-100 dark:hover:bg-sky-800 cursor-pointer text-sm">{module.designation}</div>))}</div><button onClick={() => setIsEditing(false)} className="btn btn-secondary btn-xs w-full mt-2">Annuler</button></div> ); } return ( <div className="flex items-center gap-2 min-h-[38px]"><span className="text-sm font-medium">{ticket.idModule?.designation || <span className="italic">Aucun module</span>}</span><button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-sky-500"><Edit size={14} /></button>{ticket.idModule && <button onClick={onRemove} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>}</div> );};
const PriorityEditor = ({ ticket, onUpdate }) => {const priorities = ["Basse", "Moyenne", "Haute"]; return (<select value={ticket.priorite} onChange={(e) => onUpdate('priorite', e.target.value)} className="form-select text-sm font-medium bg-transparent border-0 focus:ring-0 p-0">{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select>);};

// --- TABLEAU & LIGNES DE SOUS-TICKETS ---
const EditableSubTicketRow = ({ sub, allModules, onSave, onCancel }) => {
    const [editableData, setEditableData] = useState({ ...sub });
    const [isSaving, setIsSaving] = useState(false);
    const textAreaRef = useRef(null);
    useAutosizeTextArea(textAreaRef, editableData.description);
    const [moduleSearchTerm, setModuleSearchTerm] = useState('');

    const handleChange = (field, value) => setEditableData(prev => ({ ...prev, [field]: value }));
    const handleModuleChange = (module) => { 
    // Maintenant, 'module' est bien la variable reçue et le code fonctionne
    setEditableData(prev => ({ ...prev, idModule: module }));
};
    const handleSaveClick = async () => { setIsSaving(true); await onSave(sub, editableData); setIsSaving(false); };
    return (
        <tr className="bg-sky-50 dark:bg-sky-900/50 align-top">
            <td className="px-2 py-2"><input type="text" value={editableData.titre} onChange={(e) => handleChange('titre', e.target.value)} className="form-input text-sm"/></td>
            <td className="px-2 py-2">
                <textarea 
                    ref={textAreaRef}
                    value={editableData.description || ''} 
                    onChange={(e) => handleChange('description', e.target.value)} 
                    className="form-textarea text-sm w-full overflow-hidden resize-none" // `resize-none` est important
                    rows={1} // Commence avec une seule ligne
                    placeholder="Ajouter une description..."
                ></textarea>
            </td>            
            <td className="px-2 py-2">
                 <div className="relative">
                    <input 
                        type="text"
                        className="form-input text-sm w-full"
                        value={moduleSearchTerm || editableData.idModule?.designation || ''}
                        onChange={(e) => setModuleSearchTerm(e.target.value)}
                        onFocus={() => setModuleSearchTerm('')} // Vide le champ pour commencer la recherche
                        placeholder="Rechercher un module..."
                    />
                    {/* Affiche la liste filtrée si on tape quelque chose */}
                    {moduleSearchTerm && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {allModules
                                .filter(m => m.designation.toLowerCase().includes(moduleSearchTerm.toLowerCase()))
                                .map(module => (
                                    <div 
                                        key={module.id} 
                                        onClick={() => {
                                            handleModuleChange(module);
                                            setModuleSearchTerm(''); // Réinitialise la recherche
                                        }}
                                        className="p-2 text-sm hover:bg-sky-100 dark:hover:bg-sky-800 cursor-pointer"
                                    >
                                        {module.designation}
                                    </div>
                                ))
                            }
                        </div>
                    )}
                 </div>
            </td>
            <td className="px-2 py-2 text-xs">{sub.idUtilisateur ? `${sub.idUtilisateur.prenom} ${sub.idUtilisateur.nom}` : 'N/A'}</td>
            <td className="px-2 py-2 text-xs">{formatDateFromArray(sub.date_echeance)}</td>
            <td className="px-2 py-2">
                <select value={editableData.priorite} onChange={(e) => handleChange('priorite', e.target.value)} className="form-select text-sm">
                    {["Basse", "Moyenne", "Haute"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </td>
            <td className="px-2 py-2 text-sm">{sub.statue}</td>
            <td className="px-2 py-2 text-xs">{formatDateFromArray(sub.dateCreation)}</td>
            <td className="px-2 py-2">
                <div className="flex items-center justify-center space-x-1">
                    <button onClick={handleSaveClick} className="p-1.5 text-green-500 hover:text-green-700" title="Enregistrer" disabled={isSaving}>{isSaving ? <Spinner/> : <Check size={16}/>}</button>
                    <button onClick={onCancel} className="p-1.5 text-slate-500 hover:text-slate-700" title="Annuler" disabled={isSaving}><X size={16}/></button>
                </div>
            </td>
        </tr>
    );
};

const DisplaySubTicketRow = ({ sub, onEdit, onDelete, allModules, isDescriptionExpanded, onToggleDescription }) => {
    const isAssigned = !!sub.idUtilisateur;
    const getModuleName = (moduleId) => {
        if (!moduleId || !allModules || allModules.length === 0) return 'N/A';
        const idToFind = typeof moduleId === 'object' && moduleId !== null ? moduleId.id : moduleId;
        // CORRECTION : On force la comparaison entre nombres pour éviter les problèmes de type (ex: "5" vs 5)
        const module = allModules.find(m => Number(m.id) === Number(idToFind));
        return module ? module.designation : 'N/A';
    };
    const descriptionIsLong = sub.description && sub.description.length > 50;


    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 align-top">
            <td className="px-3 py-2">{sub.titre}</td>
            <td className="px-3 py-2 max-w-xs">
                <div className="flex items-start justify-between gap-2">
                    <p 
                        className={`text-sm text-slate-600 dark:text-slate-300 ${isDescriptionExpanded ? 'whitespace-pre-wrap break-words' : 'truncate'}`}
                        title={!isDescriptionExpanded ? sub.description : ''}
                    >
                        {sub.description || <span className="italic">Pas de desciption</span>}
                    </p>
                    {descriptionIsLong && (
                        <button 
                            onClick={() => onToggleDescription(sub.id)} 
                            className="p-1 text-slate-400 hover:text-sky-500 flex-shrink-0" 
                            title={isDescriptionExpanded ? 'Réduire la description' : 'Afficher toute la description'}
                        >
                            {isDescriptionExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                </div>
            </td>            
            <td className="px-3 py-2">{getModuleName(sub.idModule )}</td>
            <td className="px-3 py-2">{sub.idUtilisateur ? `${sub.idUtilisateur.prenom} ${sub.idUtilisateur.nom}` : 'Aucun employé affecté'}</td>
            <td className="px-3 py-2">{formatDateFromArray(sub.date_echeance) }</td>
            <td className="px-3 py-2">{sub.priorite}</td>
            <td className="px-3 py-2">{sub.statue}</td>
            <td className="px-3 py-2">{formatDateFromArray(sub.dateCreation)}</td>
            <td className="px-3 py-2">
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => onEdit(sub.id)} className="p-1.5 text-slate-500 hover:text-blue-500" title="Modifier"><Edit size={16}/></button>
                    <button onClick={() => onDelete(sub.id)} className="p-1.5 text-slate-500 hover:text-red-500" title="Supprimer" disabled={isAssigned}><Trash2 size={16}/></button>
                </div>
            </td>
        </tr>
    );
};
const SubTicketsTable = ({ subTickets, onSaveSubTicket, onDelete, onAdd, allModules }) => {
    const [editingTicketId, setEditingTicketId] = useState(null);
    const handleSaveAndClose = async (originalSubTicket, editedSubTicket) => {
        await onSaveSubTicket(originalSubTicket, editedSubTicket);
        setEditingTicketId(null);
    };
    const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

    // --- AJOUT : Fonction pour basculer l'état d'une description ---
    const toggleDescriptionExpansion = (subTicketId) => {
        setExpandedDescriptions(prevSet => {
            const newSet = new Set(prevSet);
            if (newSet.has(subTicketId)) {
                newSet.delete(subTicketId);
            } else {
                newSet.add(subTicketId);
            }
            return newSet;
        });
    };
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold">Sous-tickets</h2><button onClick={onAdd} className="btn btn-primary-icon" title="Ajouter un sous-ticket"><PlusCircle size={20} /></button></div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700"><tr><th className="px-3 py-2 text-left font-medium">Titre</th><th className="px-3 py-2 text-left font-medium">Description</th><th className="px-3 py-2 text-left font-medium">Module</th><th className="px-3 py-2 text-left font-medium">Affecté à</th><th className="px-3 py-2 text-left font-medium">Échéance</th><th className="px-3 py-2 text-left font-medium">Priorité</th><th className="px-3 py-2 text-left font-medium">Statut</th><th className="px-3 py-2 text-left font-medium">Créé le</th><th className="px-3 py-2 text-center font-medium">Actions</th></tr></thead>
                    <tbody className="divide-y dark:divide-slate-700">
                        {subTickets.map(sub => (
                            editingTicketId === sub.id
                            ? <EditableSubTicketRow key={sub.id} sub={sub} allModules={allModules} onSave={handleSaveAndClose} onCancel={() => setEditingTicketId(null)} />
                            : <DisplaySubTicketRow 
                                key={sub.id} 
                                sub={sub} 
                                onEdit={setEditingTicketId} 
                                onDelete={onDelete} 
                                allModules={allModules} 
                                
                                // --- VÉRIFIEZ BIEN QUE CES DEUX LIGNES SONT PRÉSENTES ---
                                isDescriptionExpanded={expandedDescriptions.has(sub.id)}
                                onToggleDescription={toggleDescriptionExpansion}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- VUE PRINCIPALE DE MODIFICATION ---
const TicketUpdateView = ({ ticketId, onBack, showTemporaryMessage }) => {
    const [ticket, setTicket] = useState(null);
    const [allModules, setAllModules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDiffractionModalOpen, setIsDiffractionModalOpen] = useState(false);

    const fetchInitialData = useCallback(async () => {
        try {
            const [ticketData, modulesData] = await Promise.all([ticketService.getTicketById(ticketId), moduleService.getAllModules()]);
            setTicket(ticketData);
            setAllModules(modulesData.data || []);
        } catch (err) { setError("Impossible de charger les données."); console.error(err); } finally { setIsLoading(false); }
    }, [ticketId]);

    useEffect(() => { setIsLoading(true); fetchInitialData(); }, [fetchInitialData]);

    const _updateField = async (id, originalData, fieldName, value) => {
        const payload = { ...originalData, idModule: originalData.idModule?.id, idClient: originalData.idClient?.id, idUtilisateur: originalData.idUtilisateur?.id, idParentTicket: originalData.idParentTicket?.id, [fieldName]: value };
        await ticketService.updateTicket(id, payload);
    };
    
    const handleUpdateParentField = async (fieldName, value) => {
        if (!ticket) return;
        try {
            await _updateField(ticketId, ticket, fieldName, value);
            if (showTemporaryMessage) showTemporaryMessage('success', 'Mise à jour réussie.');
            await fetchInitialData();
        } catch (err) { if (showTemporaryMessage) showTemporaryMessage('error', 'La mise à jour a échoué.'); }
    };
    const handleUpdateLocalSubTicketState = (updatedSubTicket) => {
        setTicket(currentParentTicket => {
            if (!currentParentTicket) return null;

            const newChildTickets = currentParentTicket.childTickets.map(sub => {
                if (sub.id === updatedSubTicket.id) {
                    return updatedSubTicket; // On remplace l'ancien sous-ticket par le nouveau
                }
                return sub;
            });

            return { ...currentParentTicket, childTickets: newChildTickets };
        });
    };
    
    const handleSaveSubTicket = async (originalSubTicket, editedSubTicket) => {
        // La logique pour déterminer ce qui a changé reste la même
        const updatePromises = [];
        const originalModuleId = originalSubTicket.idModule?.id ?? originalSubTicket.idModule;
        const editedModuleId = editedSubTicket.idModule?.id ?? editedSubTicket.idModule;

        if (originalSubTicket.titre !== editedSubTicket.titre) { updatePromises.push(_updateField(originalSubTicket.id, originalSubTicket, 'titre', editedSubTicket.titre)); }
        if (originalSubTicket.description !== editedSubTicket.description) { updatePromises.push(_updateField(originalSubTicket.id, originalSubTicket, 'description', editedSubTicket.description)); }
        if (originalSubTicket.priorite !== editedSubTicket.priorite) { updatePromises.push(_updateField(originalSubTicket.id, originalSubTicket, 'priorite', editedSubTicket.priorite)); }
        if (originalModuleId !== editedModuleId) { updatePromises.push(_updateField(originalSubTicket.id, originalSubTicket, 'idModule', editedModuleId || null)); }
        
        if (updatePromises.length === 0) {
            if (showTemporaryMessage) showTemporaryMessage('info', 'Aucune modification détectée.');
            // On retourne quand même `editedSubTicket` pour refléter les changements locaux même sans sauvegarde (ex: objet module complet)
            return Promise.resolve(editedSubTicket);
        }

        try {
            await Promise.all(updatePromises);
            if (showTemporaryMessage) showTemporaryMessage('success', 'Sous-ticket mis à jour.');
            
            // EXPLICATION : Au lieu de re-fetcher depuis le serveur (ce qui cause le bug),
            // nous mettons directement à jour l'état local avec le sous-ticket modifié.
            // L'objet `editedSubTicket` contient déjà l'objet module complet `{id: ..., designation: ...}`.
            handleUpdateLocalSubTicketState(editedSubTicket);

        } catch(err) {
            console.error(err);
            if (showTemporaryMessage) showTemporaryMessage('error', 'Une erreur est survenue lors de la mise à jour.');
            // En cas d'erreur, on ne met pas à jour l'état local et on propage l'erreur
            throw err;
        }
    };
    const handleRemoveParentModule = () => handleUpdateParentField('idModule', null);
    const handleDirectStatusUpdate = async (newStatus) => { setIsActionLoading(true); await handleUpdateParentField('statue', newStatus); setIsActionLoading(false); };
    const handleDiffractionSuccess = () => { setIsDiffractionModalOpen(false); fetchInitialData(); if (showTemporaryMessage) showTemporaryMessage('success', 'Sous-tickets créés.'); };
    const handleDeleteSubTicket = async (subTicketId) => { if (window.confirm("Êtes-vous sûr ?")) { try { await ticketService.deleteTicket(subTicketId); if (showTemporaryMessage) showTemporaryMessage('success', 'Sous-ticket supprimé.'); fetchInitialData(); } catch (error) { if (showTemporaryMessage) showTemporaryMessage('error', 'La suppression a échoué.'); } } };
    
    const renderActions = () => { /* Votre code ici */ };
    
    if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
    if (!ticket) return null;
    const hasSubTickets = ticket.childTickets && ticket.childTickets.length > 0;
    
    return (
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <div className="flex justify-between items-center mb-6"><button onClick={onBack} className="btn btn-secondary"><ArrowLeft size={18} className="mr-2"/> Retour</button><div>{isActionLoading ? <Spinner /> : renderActions()}</div></div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
                 <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-grow md:w-2/3 space-y-6">
                          <EditableField initialValue={ticket.titre} onSave={handleUpdateParentField} fieldName="titre" />
                          <div><h3 className="text-sm font-semibold uppercase text-slate-400 mb-2">Description</h3><EditableField initialValue={ticket.description} onSave={handleUpdateParentField} fieldName="description" isTextarea={true} /></div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t dark:border-slate-700"><DetailItem icon={<ModuleIcon size={14} className="mr-2"/>} label="Module"><ModuleEditor ticket={ticket} onUpdate={handleUpdateParentField} onRemove={handleRemoveParentModule} allModules={allModules} /></DetailItem><DetailItem icon={<UserCheck size={14} className="mr-2"/>} label="Affecté à" value={hasSubTickets ? "Géré par chef d'équipe" : (ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom} ${ticket.idUtilisateur.nom}` : 'Non affecté')} /><DetailItem icon={<Calendar size={14} className="mr-2"/>} label="Échéance" value={hasSubTickets ? "Géré par employé affecté" : formatDateFromArray(ticket.date_echeance)} /></div>
                      </div>
                      <div className="flex-shrink-0 md:w-1/3 space-y-4">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-4 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                              <DetailItem icon={<Tag size={14} className="mr-2"/>} label="Priorité">
                                  <select value={ticket.priorite} onChange={(e) => handleUpdateParentField('priorite', e.target.value)} className="form-select text-sm font-medium bg-transparent border-0 focus:ring-0 p-0">
                                    {["Basse", "Moyenne", "Haute"].map(p => <option key={p} value={p}>{p}</option>)}
                                  </select>
                              </DetailItem>
                              <DetailItem icon={<Info size={14} className="mr-2"/>} label="Statut" value={ticket.statue} />
                          </div>
                          <div className="pt-4 space-y-4 border-t dark:border-slate-700"><div className="grid grid-cols-2 gap-x-4 gap-y-4"><DetailItem icon={<User size={14} className="mr-2"/>} label="Client" value={ticket.idClient?.nomComplet} /><DetailItem icon={<User size={14} className="mr-2"/>} label="Créé par" value={ticket.userCreation} /></div><div className="grid grid-cols-2 gap-x-4 gap-y-4"><DetailItem icon={<Calendar size={14} className="mr-2"/>} label="Créé le" value={formatDateFromArray(ticket.dateCreation)} /><DetailItem icon={<Shield size={14} className="mr-2"/>} label="Actif"><select value={ticket.actif.toString()} onChange={(e) => handleUpdateParentField('actif', e.target.value === 'true')} className="form-select text-sm font-medium bg-transparent border-0 focus:ring-0 p-0"><option value="true">Oui</option><option value="false">Non</option></select></DetailItem></div></div>
                      </div>
                  </div>
            </div>
            {hasSubTickets && (<div className="mt-8"><SubTicketsTable subTickets={ticket.childTickets} onDelete={handleDeleteSubTicket} onAdd={() => setIsDiffractionModalOpen(true)} onSaveSubTicket={handleSaveSubTicket} allModules={allModules}/></div>)}
            {isDiffractionModalOpen && (<DiffractionForm parentTicket={ticket} onClose={() => setIsDiffractionModalOpen(false)} onSuccess={handleDiffractionSuccess} showTemporaryMessage={showTemporaryMessage} />)}
        </div>
    );
};

export default TicketUpdateView;