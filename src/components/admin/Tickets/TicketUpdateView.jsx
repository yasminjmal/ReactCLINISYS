// src/components/admin/Tickets/TicketUpdateView.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ticketService from '../../../services/ticketService';
import moduleService from '../../../services/moduleService';
import documentService from '../../../services/documentService';
import commentService from '../../../services/commentService'; // Importez le nouveau service de commentaires

// Utilisation de la fonction de formatage de date universelle
const formatDate = (dateInput) => {
    if (!dateInput) {
        return 'N/A';
    }
    let date;
    if (Array.isArray(dateInput) && dateInput.length >= 3) {
        // Handle LocalDateTime array from Java backend (year, month (1-based), day, hour, minute, second)
        const [year, month, day, hours = 0, minutes = 0, seconds = 0] = dateInput;
        date = new Date(year, month - 1, day, hours, minutes, seconds);
    } else {
        date = new Date(dateInput); // Assume it's a valid date string or Date object
    }
    if (isNaN(date.getTime())) {
        return 'Date invalide';
    }
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit', // Ajout de l'heure
        minute: '2-digit' // Ajout des minutes
    });
};

import {
    ArrowLeft, Check, X, GitFork, Loader, Send, PlusCircle, User, Tag, Info, Calendar,
    Package as ModuleIcon, UserCheck, Shield, Edit, Trash2, Eye, EyeOff, MessageSquare, ChevronDown, ChevronUp,
} from 'lucide-react';

// --- COMPOSANTS UTILITAIRES ---
const Spinner = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>;
const useAutosizeTextArea = (textAreaRef, value) => {
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "0px";
            const scrollHeight = textAreaRef.current.scrollHeight;
            textAreaRef.current.style.height = scrollHeight + "px";
        }
    }, [textAreaRef, value]);
};

// --- MODAL DE DIFFRACTION --- (Pas de changement ici, conservé pour le contexte)
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
        const creationPromises = ticketsToCreate.map(subTicket => ticketService.createTicket({ ...subTicket, idParentTicket: parentTicket.id, idClient: parentTicket.idClient?.id, statue: 'ACCEPTE', actif: true, })); // Utilisation de ACCEPTE
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

// --- COMPOSANTS D'ÉDITION --- (Pas de changement ici, conservé pour le contexte)
const EditableField = ({ initialValue, onSave, fieldName, isTextarea = false }) => {const [isEditing, setIsEditing] = useState(false); const [value, setValue] = useState(initialValue); const handleSave = () => { onSave(fieldName, value); setIsEditing(false); }; if (isEditing) { return ( <div className="flex items-center gap-2 w-full">{isTextarea ? (<textarea value={value} onChange={(e) => setValue(e.target.value)} className="form-textarea flex-grow" rows={5} />) : (<input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="form-input flex-grow" />)}<button onClick={handleSave} className="btn btn-success-icon"><Check size={18} /></button><button onClick={() => setIsEditing(false)} className="btn btn-danger-icon"><X size={18} /></button></div> ); } return ( <div className="flex items-start gap-2">{isTextarea ? (<p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md w-full">{initialValue || <span className="italic">Aucune description.</span>}</p>) : (<h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{initialValue}</h1>)}<button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-sky-500"><Edit size={16} /></button></div> );};
const DetailItem = ({ icon, label, value, children }) => (<div><dt className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-0.5">{icon}{label}</dt><dd className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words">{children || value || <span className="italic text-slate-400">N/A</span>}</dd></div>);
const ModuleEditor = ({ ticket, onUpdate, onRemove, allModules }) => { const [isEditing, setIsEditing] = useState(false); const [searchTerm, setSearchTerm] = useState(''); if (isEditing) { return ( <div className="p-2 border rounded-md bg-white dark:bg-slate-900 w-48 shadow-lg"><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input w-full mb-2 text-sm" /><div className="max-h-40 overflow-y-auto">{allModules.filter(m => m.designation.toLowerCase().includes(searchTerm.toLowerCase())).map(module => (<div key={module.id} onClick={() => { onUpdate('idModule', module.id); setIsEditing(false);}} className="p-2 rounded-md hover:bg-sky-100 dark:hover:bg-sky-800 cursor-pointer text-sm">{module.designation}</div>))}</div><button onClick={() => setIsEditing(false)} className="btn btn-secondary btn-xs w-full mt-2">Annuler</button></div> ); } return ( <div className="flex items-center gap-2 min-h-[38px]"><span className="text-sm font-medium">{ticket.idModule?.designation || <span className="italic">Aucun module</span>}</span><button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-sky-500"><Edit size={14} /></button>{ticket.idModule && <button onClick={onRemove} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>}</div> );};
const PriorityEditor = ({ ticket, onUpdate }) => {const priorities = ["Basse", "Moyenne", "Haute"]; return (<select value={ticket.priorite} onChange={(e) => onUpdate('priorite', e.target.value)} className="form-select text-sm font-medium bg-transparent border-0 focus:ring-0 p-0">{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select>);};


// Composant pour la gestion des commentaires dans les sous-tickets (NOUVEAU)
const SubTicketCommentRow = ({ subTicket, onCommentChange, showTemporaryMessage }) => {
    const [comments, setComments] = useState(subTicket.commentaireList || []);
    const [newCommentText, setNewCommentText] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    const newCommentTextAreaRef = useRef(null);
    useAutosizeTextArea(newCommentTextAreaRef, newCommentText);

    // NOTE: Pour simuler l'utilisateur connecté. Dans une vraie application,
    // vous obtiendriez cela de votre contexte d'authentification ou d'un hook.
    const getCurrentUserId = () => 1; // Exemple: renvoie l'ID 1. À remplacer par votre logique d'authentification.

    useEffect(() => {
        setComments(subTicket.commentaireList || []);
    }, [subTicket.commentaireList]);

    const handleAddComment = async () => {
        if (newCommentText.trim() === '') {
            if (showTemporaryMessage) showTemporaryMessage('warning', 'Le commentaire ne peut pas être vide.');
            return;
        }
        setIsAdding(true);
        try {
            await commentService.addComment(
                { commentaire: newCommentText, idTicket: subTicket.id },
                getCurrentUserId()
            );
            if (showTemporaryMessage) showTemporaryMessage('success', 'Commentaire ajouté avec succès.');
            setNewCommentText('');
            onCommentChange(subTicket.id); // Demande au parent de rafraîchir le sous-ticket spécifique
        } catch (error) {
            console.error("Erreur lors de l'ajout du commentaire:", error);
            const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout du commentaire.";
            if (showTemporaryMessage) showTemporaryMessage('error', errorMessage);
        } finally {
            setIsAdding(false);
        }
    };

    const handleEditClick = (comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentText(comment.commentaire);
    };

    const handleSaveEdit = async (commentId) => {
        if (editingCommentText.trim() === '') {
            if (showTemporaryMessage) showTemporaryMessage('warning', 'Le commentaire modifié ne peut pas être vide.');
            return;
        }
        try {
            await commentService.updateComment(
                commentId,
                { commentaire: editingCommentText, idTicket: subTicket.id }, // Passe idTicket si votre PUT le requiert
                getCurrentUserId()
            );
            if (showTemporaryMessage) showTemporaryMessage('success', 'Commentaire modifié avec succès.');
            setEditingCommentId(null);
            setEditingCommentText('');
            onCommentChange(subTicket.id);
        } catch (error) {
            console.error("Erreur lors de la modification du commentaire:", error);
            const errorMessage = error.response?.data?.message || "Erreur lors de la modification du commentaire.";
            if (showTemporaryMessage) showTemporaryMessage('error', errorMessage);
        }
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
            try {
                await commentService.deleteComment(commentId);
                if (showTemporaryMessage) showTemporaryMessage('success', 'Commentaire supprimé avec succès.');
                onCommentChange(subTicket.id);
            } catch (error) {
                console.error("Erreur lors de la suppression du commentaire:", error);
                const errorMessage = error.response?.data?.message || "Erreur lors de la suppression du commentaire.";
                if (showTemporaryMessage) showTemporaryMessage('error', errorMessage);
            }
        }
    };


    return (
        <tr className="bg-slate-50 dark:bg-slate-900/50">
            <td colSpan="9" className="p-4">
                <div className="bg-slate-100 dark:bg-slate-800/70 p-4 rounded-md shadow-inner">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center">
                        <MessageSquare size={16} className="mr-2" /> Commentaires du Sous-ticket ({comments?.length || 0})
                    </h4>

                    {/* Zone d'ajout de commentaire */}
                    <div className="mb-4 p-3 border border-slate-300 dark:border-slate-700 rounded-lg">
                        <textarea
                            ref={newCommentTextAreaRef}
                            className="form-textarea w-full text-sm resize-none overflow-hidden"
                            rows="1"
                            placeholder="Ajouter un nouveau commentaire pour ce sous-ticket..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            disabled={isAdding}
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleAddComment}
                                className="btn btn-primary-xs"
                                disabled={isAdding}
                            >
                                {isAdding ? <Spinner /> : <PlusCircle size={14} className="mr-1" />}
                                {isAdding ? 'Ajout...' : 'Ajouter'}
                            </button>
                        </div>
                    </div>

                    {/* Liste des commentaires */}
                    {comments && comments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs">
                                <thead className="bg-slate-200 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-2 py-1 text-left font-medium">Commentaire</th>
                                        <th className="px-2 py-1 text-left font-medium">Créé par</th>
                                        <th className="px-2 py-1 text-left font-medium w-32">Date</th>
                                        <th className="px-2 py-1 text-center font-medium w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {comments.map(comment => (
                                        <tr key={comment.id} className="hover:bg-slate-100 dark:hover:bg-slate-800 align-top">
                                            <td className="px-2 py-1">
                                                {editingCommentId === comment.id ? (
                                                    <textarea
                                                        value={editingCommentText}
                                                        onChange={(e) => setEditingCommentText(e.target.value)}
                                                        className="form-textarea w-full text-xs resize-none overflow-hidden"
                                                        rows="1"
                                                    />
                                                ) : (
                                                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{comment.commentaire}</p>
                                                )}
                                            </td>
                                            <td className="px-2 py-1 text-slate-600 dark:text-slate-300">
                                                {comment.utilisateur?.prenom} {comment.utilisateur?.nom}
                                            </td>
                                            <td className="px-2 py-1 text-slate-500 dark:text-slate-400">
                                                {formatDate(comment.dateCommentaire)}
                                            </td>
                                            <td className="px-2 py-1">
                                                <div className="flex items-center justify-center space-x-1">
                                                    {editingCommentId === comment.id ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleSaveEdit(comment.id)}
                                                                className="p-1 text-green-500 hover:text-green-700"
                                                                title="Enregistrer"
                                                            ><Check size={14}/></button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="p-1 text-slate-500 hover:text-slate-700"
                                                                title="Annuler"
                                                            ><X size={14}/></button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditClick(comment)}
                                                                className="p-1 text-slate-500 hover:text-blue-500"
                                                                title="Modifier"
                                                            ><Edit size={14}/></button>
                                                            <button
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className="p-1 text-slate-500 hover:text-red-500"
                                                                title="Supprimer"
                                                            ><Trash2 size={14}/></button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 italic text-xs">Aucun commentaire pour ce sous-ticket.</p>
                    )}
                </div>
            </td>
        </tr>
    );
};


// --- TABLEAU & LIGNES DE SOUS-TICKETS (MODIFIÉ) ---
const EditableSubTicketRow = ({ sub, allModules, onSave, onCancel, onRemoveModule, onToggleComments, isCommentsExpanded }) => {
    const [editableData, setEditableData] = useState({ ...sub });
    const [isSaving, setIsSaving] = useState(false);
    const textAreaRef = useRef(null);
    useAutosizeTextArea(textAreaRef, editableData.description);
    const [moduleSearchTerm, setSearchTerm] = useState('');
    const [isSearchingModule, setIsSearchingModule] = useState(!sub.idModule);

    const handleChange = (field, value) => setEditableData(prev => ({ ...prev, [field]: value }));
    const handleModuleChange = (module) => {
        setEditableData(prev => ({ ...prev, idModule: module }));
        setIsSearchingModule(false);
    };
    const handleSaveClick = async () => { setIsSaving(true); await onSave(sub, editableData); setIsSaving(false); };

    useEffect(() => {
        setEditableData({ ...sub });
    }, [sub]);

    const renderModuleCell = () => {
        if (editableData.idModule && editableData.idUtilisateur) {
            return <span className="text-sm text-slate-500 italic">{editableData.idModule.designation} (verrouillé)</span>;
        }

        if (isSearchingModule || !editableData.idModule) {
            return (
                <div className="relative">
                    <input
                        type="text"
                        className="form-input text-sm w-full"
                        value={moduleSearchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher un module..."
                        autoFocus
                    />
                    {moduleSearchTerm && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {allModules
                                .filter(m => m.designation.toLowerCase().includes(moduleSearchTerm.toLowerCase()))
                                .map(module => (
                                    <div key={module.id} onClick={() => handleModuleChange(module)} className="p-2 text-sm hover:bg-sky-100 dark:hover:bg-sky-800 cursor-pointer">
                                        {module.designation}
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>
            );
        }

        if (editableData.idModule) {
            return (
                <div className="flex items-center justify-between">
                    <span className="text-sm">{editableData.idModule.designation}</span>
                    <div className="flex items-center">
                        <button onClick={() => setIsSearchingModule(true)} className="p-1 text-slate-400 hover:text-sky-500" title="Modifier le module">
                            <Edit size={14}/>
                        </button>
                        <button onClick={() => onRemoveModule(sub.id)} className="p-1 text-slate-400 hover:text-red-500" title="Supprimer le module">
                            <Trash2 size={14}/>
                        </button>
                    </div>
                </div>
            );
        }
    };

    return (
        <tr className="bg-sky-50 dark:bg-sky-900/50 align-top">
            <td className="px-2 py-2"><input type="text" value={editableData.titre} onChange={(e) => handleChange('titre', e.target.value)} className="form-input text-sm"/></td>
            <td className="px-2 py-2">
                <textarea ref={textAreaRef} value={editableData.description || ''} onChange={(e) => handleChange('description', e.target.value)} className="form-textarea text-sm w-full overflow-hidden resize-none" rows={1} placeholder="Ajouter une description..."></textarea>
            </td>
            <td className="px-2 py-2">
                {renderModuleCell()}
            </td>
            <td className="px-2 py-2 text-xs">{editableData.idUtilisateur ? `${editableData.idUtilisateur.prenom} ${editableData.idUtilisateur.nom}` : 'N/A'}</td>
            <td className="px-2 py-2 text-xs">{formatDate(editableData.date_echeance)}</td>
            <td className="px-2 py-2">
                <select value={editableData.priorite} onChange={(e) => handleChange('priorite', e.target.value)} className="form-select text-sm">
                    {["Basse", "Moyenne", "Haute"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </td>
            <td className="px-2 py-2 text-sm">{editableData.statue}</td>
            <td className="px-2 py-2 text-xs">{formatDate(editableData.dateCreation)}</td>
            <td className="px-2 py-2">
                <div className="flex items-center justify-center space-x-1">
                    <button onClick={handleSaveClick} className="p-1.5 text-green-500 hover:text-green-700" title="Enregistrer" disabled={isSaving}>{isSaving ? <Spinner/> : <Check size={16}/>}</button>
                    <button onClick={onCancel} className="p-1.5 text-slate-500 hover:text-slate-700" title="Annuler" disabled={isSaving}><X size={16}/></button>
                    <button onClick={() => onToggleComments(sub.id)} className="p-1.5 text-slate-500 hover:text-indigo-500" title={isCommentsExpanded ? "Masquer les commentaires" : "Afficher les commentaires"}>
                        <MessageSquare size={16}/>
                    </button>
                </div>
            </td>
        </tr>
    );
};

const DisplaySubTicketRow = ({ sub, onEdit, onDelete, allModules, isDescriptionExpanded, onToggleDescription, onToggleComments, isCommentsExpanded }) => {
    const isAssigned = !!sub.idUtilisateur;
    const getModuleName = (moduleId) => {
        if (!moduleId || !allModules || allModules.length === 0) return 'N/A';
        const idToFind = typeof moduleId === 'object' && moduleId !== null ? moduleId.id : moduleId;
        const module = allModules.find(m => Number(m.id) === Number(idToFind));
        return module ? module.designation : 'N/A';
    };
    const descriptionIsLong = sub.description && sub.description.length > 50;

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 align-top">
            <td className="px-3 py-2">{sub.titre}</td>
            <td className="px-3 py-2 max-w-xs">
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm text-slate-600 dark:text-slate-300 ${isDescriptionExpanded ? 'whitespace-pre-wrap break-words' : 'truncate'}`} title={!isDescriptionExpanded ? sub.description : ''}>
                        {sub.description || <span className="italic">Pas de desciption</span>}
                    </p>
                    {descriptionIsLong && (
                        <button onClick={() => onToggleDescription(sub.id)} className="p-1 text-slate-400 hover:text-sky-500 flex-shrink-0" title={isDescriptionExpanded ? 'Réduire' : 'Afficher plus'}>
                            {isDescriptionExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                </div>
            </td>
            <td className="px-3 py-2">{getModuleName(sub.idModule )}</td>
            <td className="px-3 py-2">{sub.idUtilisateur ? `${sub.idUtilisateur.prenom} ${sub.idUtilisateur.nom}` : 'Aucun employé affecté'}</td>
            <td className="px-3 py-2">{formatDate(sub.date_echeance) }</td>
            <td className="px-3 py-2">{sub.priorite}</td>
            <td className="px-3 py-2">{sub.statue}</td>
            <td className="px-3 py-2">{formatDate(sub.dateCreation)}</td>
            <td className="px-3 py-2">
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => onEdit(sub.id)} className="p-1.5 text-slate-500 hover:text-blue-500" title="Modifier"><Edit size={16}/></button>
                    <button onClick={() => onDelete(sub.id)} className="p-1.5 text-slate-500 hover:text-red-500" title="Supprimer" disabled={isAssigned}><Trash2 size={16}/></button>
                    <button onClick={() => onToggleComments(sub.id)} className="p-1.5 text-slate-500 hover:text-indigo-500" title={isCommentsExpanded ? "Masquer les commentaires" : "Afficher les commentaires"}>
                        <MessageSquare size={16}/>
                    </button>
                </div>
            </td>
        </tr>
    );
};

const SubTicketsTable = ({ subTickets, onSaveSubTicket, onDelete, onAdd, allModules, onRemoveModule, onRefreshTicketData, showTemporaryMessage }) => {
    const [editingTicketId, setEditingTicketId] = useState(null);
    const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
    const [expandedComments, setExpandedComments] = useState(new Set()); // Nouveau état pour les commentaires des sous-tickets

    const toggleDescriptionExpansion = (subTicketId) => {
        setExpandedDescriptions(prevSet => {
            const newSet = new Set(prevSet);
            if (newSet.has(subTicketId)) { newSet.delete(subTicketId); } else { newSet.add(subTicketId); }
            return newSet;
        });
    };

    const toggleCommentExpansion = (subTicketId) => {
        setExpandedComments(prevSet => {
            const newSet = new Set(prevSet);
            if (newSet.has(subTicketId)) { newSet.delete(subTicketId); } else { newSet.add(subTicketId); }
            return newSet;
        });
    };

    const handleSaveAndClose = async (originalSubTicket, editedSubTicket) => {
        await onSaveSubTicket(originalSubTicket, editedSubTicket);
        setEditingTicketId(null);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold">Sous-tickets</h2><button onClick={onAdd} className="btn btn-primary-icon" title="Ajouter un sous-ticket"><PlusCircle size={20} /></button></div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700"><tr><th className="px-3 py-2 text-left font-medium">Titre</th><th className="px-3 py-2 text-left font-medium">Description</th><th className="px-3 py-2 text-left font-medium">Module</th><th className="px-3 py-2 text-left font-medium">Affecté à</th><th className="px-3 py-2 text-left font-medium">Échéance</th><th className="px-3 py-2 text-left font-medium">Priorité</th><th className="px-3 py-2 text-left font-medium">Statut</th><th className="px-3 py-2 text-left font-medium">Créé le</th><th className="px-3 py-2 text-center font-medium">Actions</th></tr></thead>
                    <tbody className="divide-y dark:divide-slate-700">
                        {subTickets.map(sub => (
                            <React.Fragment key={sub.id}>
                                {editingTicketId === sub.id
                                    ? <EditableSubTicketRow
                                        sub={sub}
                                        allModules={allModules}
                                        onSave={handleSaveAndClose}
                                        onCancel={() => setEditingTicketId(null)}
                                        onRemoveModule={onRemoveModule}
                                        onToggleComments={toggleCommentExpansion} // Passer la fonction
                                        isCommentsExpanded={expandedComments.has(sub.id)} // Passer l'état
                                    />
                                    : <DisplaySubTicketRow
                                        sub={sub}
                                        onEdit={setEditingTicketId}
                                        onDelete={onDelete}
                                        allModules={allModules}
                                        isDescriptionExpanded={expandedDescriptions.has(sub.id)}
                                        onToggleDescription={toggleDescriptionExpansion}
                                        onToggleComments={toggleCommentExpansion} // Passer la fonction
                                        isCommentsExpanded={expandedComments.has(sub.id)} // Passer l'état
                                    />
                                }
                                {/* Ligne des commentaires du sous-ticket, rendue conditionnellement */}
                                {expandedComments.has(sub.id) && (
                                    <SubTicketCommentRow
                                        subTicket={sub}
                                        onCommentChange={onRefreshTicketData} // Rafraîchir toutes les données du ticket parent
                                        showTemporaryMessage={showTemporaryMessage}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- VUE PRINCIPALE DE MODIFICATION ---
import DocumentManager from './DocumentManager';
import CommentManager from './CommentManager'; // Importez le nouveau composant CommentManager

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

    // Fonction d'aide pour nettoyer le payload avant d'envoyer au backend
    const cleanTicketPayload = (ticketObject) => {
        const cleanedPayload = { ...ticketObject };
        // Supprimer les objets complexes ou listes qui ne sont pas attendus dans un DTO de requête direct
        if (cleanedPayload.idClient) cleanedPayload.idClient = cleanedPayload.idClient.id;
        if (cleanedPayload.idModule) cleanedPayload.idModule = cleanedPayload.idModule.id;
        if (cleanedPayload.idUtilisateur) cleanedPayload.idUtilisateur = cleanedPayload.idUtilisateur.id;
        if (cleanedPayload.parentTicket) cleanedPayload.idParentTicket = cleanedPayload.parentTicket.id;
        
        delete cleanedPayload.documentJointesList;
        delete cleanedPayload.commentaireList;
        delete cleanedPayload.childTickets;
        delete cleanedPayload.parentTicket; // S'assurer que l'objet parent n'est pas envoyé
        delete cleanedPayload.userCreation; // Ne pas envoyer userCreation si le backend le gère automatiquement
        delete cleanedPayload.dateCreation; // Ne pas envoyer dateCreation si le backend le gère automatiquement

        // Assurez-vous que les champs requis par le backend DTO de requête sont présents et du bon type
        // Exemple: si votre backend attend un ID d'utilisateur pour l'affectation, il doit être là.
        // Si 'statue' est un enum, assurez-vous que la valeur est en majuscules si c'est ce que le backend attend.
        return cleanedPayload;
    };


    const _updateField = async (id, originalData, fieldName, value) => {
        const updatedData = {
            ...originalData,
            [fieldName]: value
        };
        const payload = cleanTicketPayload(updatedData);
        
        await ticketService.updateTicket(id, payload);
    };

    const handleUpdateParentField = async (fieldName, value) => {
        if (!ticket) return;
        try {
            await _updateField(ticketId, ticket, fieldName, value);
            if (showTemporaryMessage) showTemporaryMessage('success', 'Mise à jour réussie.');
            await fetchInitialData(); // Recharger les données après la mise à jour
        } catch (err) { if (showTemporaryMessage) showTemporaryMessage('error', 'La mise à jour a échoué.'); console.error(err); }
    };

    const handleUpdateLocalSubTicketState = (updatedSubTicket) => {
        // Cette fonction n'est plus strictement nécessaire si fetchInitialData est appelé
        // après chaque modification de sous-ticket ou de commentaire de sous-ticket,
        // car fetchInitialData rafraîchira le ticket complet depuis le backend.
        setTicket(currentParentTicket => {
            if (!currentParentTicket) return null;
            const newChildTickets = currentParentTicket.childTickets.map(sub => sub.id === updatedSubTicket.id ? updatedSubTicket : sub);
            return { ...currentParentTicket, childTickets: newChildTickets };
        });
    };

    const handleSaveSubTicket = async (originalSubTicket, editedSubTicket) => {
        const payload = cleanTicketPayload({
            ...originalSubTicket,
            ...editedSubTicket, // Appliquer les modifications du sous-ticket
            id: originalSubTicket.id // S'assurer que l'ID du sous-ticket est dans le payload
        });
        
        try {
            await ticketService.updateTicket(originalSubTicket.id, payload);
            if (showTemporaryMessage) showTemporaryMessage('success', 'Sous-ticket mis à jour.');
            await fetchInitialData(); // Recharger les données pour que les commentaires soient à jour
        } catch(err) {
            console.error(err);
            if (showTemporaryMessage) showTemporaryMessage('error', 'Une erreur est survenue lors de la mise à jour du sous-ticket.');
            throw err;
        }
    };

    const handleDirectStatusUpdate = async (newStatus) => {
        setIsActionLoading(true);
        await handleUpdateParentField('statue', newStatus);
        setIsActionLoading(false);
    };

    const handleDiffractionSuccess = () => { setIsDiffractionModalOpen(false); fetchInitialData(); if (showTemporaryMessage) showTemporaryMessage('success', 'Sous-tickets créés.'); };

    const handleDeleteSubTicket = async (subTicketId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce sous-ticket ?")) {
            try {
                await ticketService.deleteTicket(subTicketId);
                if (showTemporaryMessage) showTemporaryMessage('success', 'Sous-ticket supprimé.');
                await fetchInitialData(); // Recharger les données pour s'assurer que la liste est à jour
            } catch (error) {
                if (showTemporaryMessage) showTemporaryMessage('error', 'La suppression a échoué.');
                console.error("Erreur lors de la suppression du sous-ticket:", error);
            }
        }
    };

    const handleRemoveSubTicketModule = async (subTicketId) => {
        const subTicketToUpdate = ticket.childTickets.find(sub => sub.id === subTicketId);
        if (!subTicketToUpdate) return;

        if (window.confirm("Voulez-vous vraiment supprimer le module de ce sous-ticket ?")) {
            try {
                const payload = cleanTicketPayload({
                    ...subTicketToUpdate,
                    idModule: null, // Mettre le module à null
                    id: subTicketToUpdate.id // Assurez-vous que l'ID est là pour l'update
                });
                
                await ticketService.updateTicket(subTicketToUpdate.id, payload);
                if (showTemporaryMessage) showTemporaryMessage('success', 'Module du sous-ticket supprimé.');
                await fetchInitialData(); // Recharger toutes les données du ticket pour rafraîchir l'UI
            } catch (err) {
                if (showTemporaryMessage) showTemporaryMessage('error', 'La suppression du module a échoué.');
                console.error("Erreur lors de la suppression du module du sous-ticket:", err);
            }
        }
    };

    const renderActions = () => {
        if (!ticket) return null;
        switch (ticket.statue) {
            case 'EN_ATTENTE':
                return (
                    <div className="flex items-center space-x-3">
                        <button onClick={() => handleDirectStatusUpdate('REFUSE')} className="btn btn-danger">
                            <X size={18} className="mr-2"/> Refuser
                        </button>
                        <button onClick={() => handleDirectStatusUpdate('ACCEPTE')} className="btn btn-success">
                            <Check size={18} className="mr-2"/> Accepter
                        </button>
                    </div>
                );
            case 'ACCEPTE':
                if (!ticket.childTickets || ticket.childTickets.length === 0) {
                    return (
                        <button onClick={() => setIsDiffractionModalOpen(true)} className="btn btn-primary">
                            <GitFork size={18} className="mr-2"/> Diffracter
                        </button>
                    );
                }
                return null;
            default:
                return null;
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
    if (!ticket) return null;
    const hasSubTickets = ticket.childTickets && ticket.childTickets.length > 0;

    // Conditions pour afficher le bloc de commentaires du ticket parent
    const showParentComments = !hasSubTickets && (
        ticket.statue === 'EN_COURS' ||
        ticket.statue === 'TERMINE' ||
        (ticket.statue === 'ACCEPTE' && ticket.idModule)
    );

    let affectedToValue;
    if (hasSubTickets && !ticket.idUtilisateur) {
        affectedToValue = <span className="italic text-slate-500 dark:text-slate-400">Géré par le chef d'équipe</span>;
    } else if (ticket.idUtilisateur) {
        affectedToValue = `${ticket.idUtilisateur.prenom} ${ticket.idUtilisateur.nom}`;
    } else {
        affectedToValue = <span className="italic text-slate-500 dark:text-slate-400">Non affecté</span>;
    }

    let dueDateValue;
    if (hasSubTickets && !ticket.date_echeance) {
        dueDateValue = <span className="italic text-slate-500 dark:text-slate-400">Géré par l'employé affecté</span>;
    } else {
        dueDateValue = formatDate(ticket.date_echeance);
    }

    return (
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <div className="flex justify-between items-center mb-6"><button onClick={onBack} className="btn btn-secondary"><ArrowLeft size={18} className="mr-2"/> Retour</button><div>{isActionLoading ? <Spinner /> : renderActions()}</div></div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
                 <div className="flex flex-col md:flex-row gap-8">
                     <div className="flex-grow md:w-2/3 space-y-6">
                         <EditableField initialValue={ticket.titre} onSave={handleUpdateParentField} fieldName="titre" />
                         <div><h3 className="text-sm font-semibold uppercase text-slate-400 mb-2">Description</h3><EditableField initialValue={ticket.description} onSave={handleUpdateParentField} fieldName="description" isTextarea={true} /></div>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t dark:border-slate-700">
                              <DetailItem icon={<ModuleIcon size={14} className="mr-2"/>} label="Module"><ModuleEditor ticket={ticket} onUpdate={handleUpdateParentField} onRemove={() => handleUpdateParentField('idModule', null)} allModules={allModules} /></DetailItem>
                              <DetailItem icon={<UserCheck size={14} className="mr-2"/>} label="Affecté à">{affectedToValue}</DetailItem>
                              <DetailItem icon={<Calendar size={14} className="mr-2"/>} label="Échéance">{dueDateValue}</DetailItem>
                         </div>
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
                         <div className="pt-4 space-y-4 border-t dark:border-slate-700">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-4"><DetailItem icon={<User size={14} className="mr-2"/>} label="Client" value={ticket.idClient?.nomComplet} /><DetailItem icon={<User size={14} className="mr-2"/>} label="Créé par" value={ticket.userCreation} /></div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-4"><DetailItem icon={<Calendar size={14} className="mr-2"/>} label="Créé le" value={formatDate(ticket.dateCreation)} /><DetailItem icon={<Shield size={14} className="mr-2"/>} label="Actif"><select value={ticket.actif.toString()} onChange={(e) => handleUpdateParentField('actif', e.target.value === 'true')} className="form-select text-sm font-medium bg-transparent border-0 focus:ring-0 p-0"><option value="true">Oui</option><option value="false">Non</option></select></DetailItem></div>
                         </div>
                     </div>
                 </div>
            </div>

            {/* Zone des documents joints - Toujours présente */}
            <DocumentManager
                ticketId={ticket.id}
                documents={ticket.documentJointesList}
                onDocumentChange={fetchInitialData} // Re-fetch les données du ticket pour mettre à jour les documents
                showTemporaryMessage={showTemporaryMessage}
            />

            {/* Zone des commentaires du ticket parent (conditionnelle) */}
            {showParentComments && (
                <CommentManager
                    ticketId={ticket.id}
                    comments={ticket.commentaireList}
                    onCommentChange={fetchInitialData} // Re-fetch les données du ticket pour mettre à jour les commentaires
                    showTemporaryMessage={showTemporaryMessage}
                />
            )}

            {/* Tableau des sous-tickets - Conditionnel si présence de sous-tickets */}
            {hasSubTickets && (
                <div className="mt-8">
                    <SubTicketsTable
                        subTickets={ticket.childTickets}
                        onDelete={handleDeleteSubTicket}
                        onAdd={() => setIsDiffractionModalOpen(true)}
                        onSaveSubTicket={handleSaveSubTicket}
                        allModules={allModules}
                        onRemoveModule={handleRemoveSubTicketModule}
                        onRefreshTicketData={fetchInitialData} // Passer la fonction de rafraîchissement global
                        showTemporaryMessage={showTemporaryMessage}
                    />
                </div>
            )}

            {isDiffractionModalOpen && (
                <DiffractionForm
                    parentTicket={ticket}
                    onClose={() => setIsDiffractionModalOpen(false)}
                    onSuccess={handleDiffractionSuccess}
                    showTemporaryMessage={showTemporaryMessage}
                />
            )}
        </div>
    );
};

export default TicketUpdateView;