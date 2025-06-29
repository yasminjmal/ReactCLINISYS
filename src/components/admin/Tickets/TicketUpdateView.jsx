// src/components/admin/Tickets/TicketUpdateView.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ticketService from '../../../services/ticketService';
import moduleService from '../../../services/moduleService';
import commentService from '../../../services/commentService';
import documentService from '../../../services/documentService';
import userService from '../../../services/userService'; // <-- Assure-toi que cet import est bien là

// Utilisation de la fonction de formatage de date universelle
const formatDate = (dateInput) => {
    if (!dateInput) {
        return 'N/A';
    }
    let date;
    if (Array.isArray(dateInput) && dateInput.length >= 3) {
        const [year, month, day, hours = 0, minutes = 0, seconds = 0] = dateInput;
        date = new Date(year, month - 1, day, hours, minutes, seconds);
    } else {
        date = new Date(dateInput);
    }
    if (isNaN(date.getTime())) {
        return 'Date invalide';
    }
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

import {
    ArrowLeft, Check, X, GitFork, Loader, Send, PlusCircle, User, Tag, Info, Calendar,
    Package as ModuleIcon, UserCheck, Shield, Edit, Trash2, Eye, EyeOff, MessageSquare, ChevronDown, ChevronUp,
    AlertTriangle, CheckCircle
} from 'lucide-react';

// --- COMPOSANTS UTILITAIRES ---
const Spinner = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>;

// Composant de message de notification (Toast) - Réutilisé
const ToastMessage = ({ message, type, onClose }) => {
    let bgColor, icon, titleColor, borderColor;
    switch (type) {
        case 'success':
            bgColor = 'bg-green-500';
            titleColor = 'text-white';
            borderColor = 'border-green-600';
            icon = <CheckCircle size={20} className="text-white" />;
            break;
        case 'error':
            bgColor = 'bg-red-500';
            titleColor = 'text-white';
            borderColor = 'border-red-600';
            icon = <AlertTriangle size={20} className="text-white" />;
            break;
        case 'info':
            bgColor = 'bg-blue-500';
            titleColor = 'text-white';
            borderColor = 'border-blue-600';
            icon = <Info size={20} className="text-white" />;
            break;
        default:
            bgColor = 'bg-gray-500';
            titleColor = 'text-white';
            borderColor = 'border-gray-600';
            icon = null;
    }

    return (
        <div className={`fixed bottom-4 right-4 ${bgColor} ${titleColor} px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transform transition-transform duration-300 ease-out translate-y-0 opacity-100 border-2 ${borderColor} font-semibold`}>
            {icon}
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                <X size={16} />
            </button>
        </div>
    );
};


const useAutosizeTextArea = (textAreaRef, value) => {
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "0px";
            const scrollHeight = textAreaRef.current.scrollHeight;
            textAreaRef.current.style.height = scrollHeight + "px";
        }
    }, [textAreaRef, value]);
};

// --- MODAL DE DIFFRACTION (avec styles unifiés) ---
import DiffractionForm from './DiffractionForm';

// --- COMPOSANTS D'ÉDITION (Standardisés) ---
const EditableField = ({ initialValue, onSave, fieldName, isTextarea = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const textAreaRef = useRef(null);
    useAutosizeTextArea(textAreaRef, value);

    const handleSave = () => { onSave(fieldName, value); setIsEditing(false); };
    if (isEditing) {
        return (
            <div className="flex items-center gap-2 w-full">
                {isTextarea ? (
                    <textarea
                        ref={textAreaRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="form-textarea flex-grow resize-none overflow-hidden"
                        rows={1}
                    />
                ) : (
                    <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="form-input flex-grow" />
                )}
                <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-100 rounded-full" title="Enregistrer"><Check size={18} /></button>
                <button onClick={() => setIsEditing(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full" title="Annuler"><X size={18} /></button>
            </div>
        );
    }
    return (
        <div className="flex items-start gap-2">
            {isTextarea ? (
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md w-full">{initialValue || <span className="italic">Aucune description.</span>}</p>
            ) : (
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{initialValue}</h1>
            )}
            <button onClick={() => setIsEditing(true)} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700" title="Modifier"><Edit size={16} /></button>
        </div>
    );
};
const DetailItem = ({ icon, label, value, children }) => (
    <div>
        <dt className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-0.5">{icon}<span className="ml-1">{label}</span></dt>
        <dd className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words">{children || value || <span className="italic text-slate-400">N/A</span>}</dd>
    </div>
);
const ModuleEditor = ({ ticket, onUpdate, onRemove, allModules }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchingModule, setIsSearchingModule] = useState(false);

    useEffect(() => {
        if (!ticket.idModule) {
            setIsSearchingModule(true);
        } else {
            setIsSearchingModule(false);
        }
    }, [ticket.idModule]);

    const handleSelectModule = (module) => {
        onUpdate('idModule', module.id);
        setIsEditing(false);
        setIsSearchingModule(false);
    };

    if (isEditing) {
        return (
            <div className="p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 w-48 shadow-lg z-10">
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input w-full mb-2 text-sm"
                    autoFocus
                />
                <div className="max-h-40 overflow-y-auto">
                    {allModules
                        .filter(m => m.designation.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(module => (
                            <div key={module.id} onClick={() => handleSelectModule(module)} className="p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer text-sm">
                                {module.designation}
                            </div>
                        ))
                    }
                    {allModules.filter(m => m.designation.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 &&
                        <p className="text-center text-xs text-slate-500 py-2">Aucun module trouvé.</p>
                    }
                </div>
                <button onClick={() => setIsEditing(false)} className="btn btn-secondary w-full mt-2">Annuler</button>
            </div>
        );
    }
    
    if (!ticket.idModule || isSearchingModule) {
        return (
            <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Rechercher un module..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchingModule(true)}
                        className="form-input text-sm w-full"
                    />
                    {isSearchingModule && searchTerm && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {allModules
                                .filter(m => m.designation.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(module => (
                                    <div key={module.id} onClick={() => handleSelectModule(module)} className="p-2 text-sm hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer">
                                        {module.designation}
                                    </div>
                                ))
                            }
                            {allModules.filter(m => m.designation.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 &&
                                <p className="text-center text-xs text-slate-500 py-2">Aucun module trouvé.</p>
                            }
                        </div>
                    )}
                </div>
                {!ticket.idModule && (
                     <button onClick={() => { setSearchTerm(''); setIsSearchingModule(false); }} className="p-1 text-slate-400 hover:text-red-500" title="Annuler la recherche">
                         <X size={14}/>
                     </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{ticket.idModule.designation}</span>
            <button onClick={() => setIsEditing(true)} className="p-1 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700" title="Modifier le module">
                <Edit size={14} />
            </button>
            <button onClick={onRemove} className="p-1 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-slate-700" title="Supprimer le module">
                <Trash2 size={14} />
            </button>
        </div>
    );
};

const PriorityEditor = ({ ticket, onUpdate }) => {
    const priorities = ["Basse", "Moyenne", "Haute"]; 
    return (
        <select value={ticket.priorite} onChange={(e) => onUpdate('priorite', e.target.value)} className="form-select text-sm font-medium bg-transparent border-0 focus:ring-0 p-0">
            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
    );
};

// Composant pour la gestion des commentaires dans les sous-tickets
const SubTicketCommentRow = ({ subTicket, onCommentChange, setToast, currentUserId }) => {
    const [comments, setComments] = useState(subTicket.commentaireList || []);
    const [newCommentText, setNewCommentText] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    const newCommentTextAreaRef = useRef(null);
    useAutosizeTextArea(newCommentTextAreaRef, newCommentText);

    useEffect(() => {
        setComments(subTicket.commentaireList || []);
    }, [subTicket.commentaireList]);

    const handleAddComment = async () => {
        if (newCommentText.trim() === '') {
            setToast({ type: 'warning', message: 'Le commentaire ne peut pas être vide.' });
            return;
        }
        setIsAdding(true);
        // Log pour débogage
        console.log("SubTicketCommentRow: Tentative d'ajout de commentaire. Payload:", { commentaire: newCommentText, idTicket: subTicket.id, idUtilisateur: currentUserId });
        try {
            await commentService.addComment({ commentaire: newCommentText, idTicket: subTicket.id ,idUtilisateur: currentUserId});
            setToast({ type: 'success', message: 'Commentaire ajouté avec succès.' });
            setNewCommentText('');
            onCommentChange(subTicket.id);
        } catch (error) {
            console.error("Erreur lors de l'ajout du commentaire:", error);
            const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout du commentaire.";
            setToast({ type: 'error', message: errorMessage });
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
            setToast({ type: 'warning', message: 'Le commentaire modifié ne peut pas être vide.' });
            return;
        }
        // Log pour débogage
        console.log("SubTicketCommentRow: Tentative de modification de commentaire. Payload:", { commentaire: editingCommentText, idTicket: subTicket.id, idUtilisateur: currentUserId });
        try {
            await commentService.updateComment(commentId, { commentaire: editingCommentText, idTicket: subTicket.id ,idUtilisateur: currentUserId});
            setToast({ type: 'success', message: 'Commentaire modifié avec succès.' });
            setEditingCommentId(null);
            setEditingCommentText('');
            onCommentChange(subTicket.id);
        } catch (error) {
            console.error("Erreur lors de la modification du commentaire:", error);
            const errorMessage = error.response?.data?.message || "Erreur lors de la modification du commentaire.";
            setToast({ type: 'error', message: errorMessage });
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
                setToast({ type: 'success', message: 'Commentaire supprimé avec succès.' });
                onCommentChange(subTicket.id);
            } catch (error) {
                console.error("Erreur lors de la suppression du commentaire:", error);
                const errorMessage = error.response?.data?.message || "Erreur lors de la suppression du commentaire.";
                setToast({ type: 'error', message: errorMessage });
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
                                className="btn btn-primary-sm"
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
                                                                className="p-1.5 text-green-500 hover:text-green-700 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30"
                                                                title="Enregistrer"
                                                            ><Check size={14}/></button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="p-1.5 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900/30"
                                                                title="Annuler"
                                                            ><X size={14}/></button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditClick(comment)}
                                                                className="p-1.5 text-slate-500 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                                title="Modifier"
                                                            ><Edit size={14}/></button>
                                                            <button
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className="p-1.5 text-slate-500 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
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
const EditableSubTicketRow = ({ sub, allModules, onSave, onCancel, onRemoveModule, onToggleComments, isCommentsExpanded, setToast }) => {
    const [editableData, setEditableData] = useState({ ...sub });
    const [isSaving, setIsSaving] = useState(false);
    const textAreaRef = useRef(null);
    useAutosizeTextArea(textAreaRef, editableData.description);
    const [moduleSearchTerm, setSearchTerm] = useState('');
    const [isSearchingModule, setIsSearchingModule] = useState(false);

    useEffect(() => {
        if (!sub.idModule) {
            setIsSearchingModule(true);
        } else {
            setIsSearchingModule(false);
        }
    }, [sub.idModule]);

    const handleChange = (field, value) => setEditableData(prev => ({ ...prev, [field]: value }));
    const handleModuleChange = (module) => {
        setEditableData(prev => ({ ...prev, idModule: module }));
        setIsSearchingModule(false);
        setSearchTerm('');
    };
    const handleSaveClick = async () => { setIsSaving(true); await onSave(sub, editableData); setIsSaving(false); };

    useEffect(() => {
        setEditableData({ ...sub });
    }, [sub]);

    const renderModuleCell = () => {
        if (editableData.idUtilisateur && editableData.idModule) {
            return <span className="text-sm text-slate-500 dark:text-slate-400 italic">{editableData.idModule.designation} (verrouillé)</span>;
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
                        onFocus={() => setIsSearchingModule(true)}
                        autoFocus={true}
                    />
                    {isSearchingModule && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {allModules
                                .filter(m => m.designation.toLowerCase().includes(moduleSearchTerm.toLowerCase()))
                                .map(module => (
                                    <div key={module.id} onClick={() => handleModuleChange(module)} className="p-2 text-sm hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer">
                                        {module.designation}
                                    </div>
                                ))
                            }
                             {allModules.filter(m => m.designation.toLowerCase().includes(moduleSearchTerm.toLowerCase())).length === 0 &&
                                <p className="text-center text-xs text-slate-500 py-2">Aucun module trouvé.</p>
                            }
                        </div>
                    )}
                </div>
            );
        }

        if (editableData.idModule) {
            return (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-200">{editableData.idModule.designation}</span>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setIsEditing(true)} className="p-1 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700" title="Modifier le module">
                            <Edit size={14}/>
                        </button>
                        <button onClick={() => onRemoveModule(sub.id)} className="p-1 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-slate-700" title="Supprimer le module">
                            <Trash2 size={14}/>
                        </button>
                    </div>
                </div>
            );
        }
    };

    return (
        <tr className="bg-blue-50 dark:bg-blue-900/50 align-top border-b border-blue-200 dark:border-blue-700">
            <td className="px-2 py-2">
                <input type="text" value={editableData.titre} onChange={(e) => handleChange('titre', e.target.value)} className="form-input text-sm w-full" />
            </td>
            <td className="px-2 py-2">
                <textarea ref={textAreaRef} value={editableData.description || ''} onChange={(e) => handleChange('description', e.target.value)} className="form-textarea text-sm w-full overflow-hidden resize-none" rows={1} placeholder="Ajouter une description..."></textarea>
            </td>
            <td className="px-2 py-2">
                {renderModuleCell()}
            </td>
            <td className="px-2 py-2 text-xs text-slate-600 dark:text-slate-300">
                {editableData.idUtilisateur ? `${editableData.idUtilisateur.prenom} ${editableData.idUtilisateur.nom}` : 'N/A'}
            </td>
            <td className="px-2 py-2">
                <input type="date" value={editableData.date_echeance ? new Date(editableData.date_echeance[0], editableData.date_echeance[1]-1, editableData.date_echeance[2]).toISOString().slice(0, 10) : ''} onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    handleChange('date_echeance', date ? [date.getFullYear(), date.getMonth() + 1, date.getDate()] : null);
                }} className="form-input text-sm w-full" />
            </td>
            <td className="px-2 py-2">
                <select value={editableData.priorite} onChange={(e) => handleChange('priorite', e.target.value)} className="form-select text-sm w-full">
                    {["Basse", "Moyenne", "Haute"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </td>
            <td className="px-2 py-2">
                <select value={editableData.statue} onChange={(e) => handleChange('statue', e.target.value)} className="form-select text-sm w-full">
                    {["En_attente", "En_cours", "Accepte", "Termine", "Refuse", "RESOLU", "FERME"].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
            </td>
            <td className="px-2 py-2 text-xs text-slate-600 dark:text-slate-300">
                {formatDate(editableData.dateCreation)}
            </td>
            <td className="px-2 py-2">
                <div className="flex items-center justify-center space-x-1">
                    <button onClick={handleSaveClick} className="p-1.5 text-green-600 hover:bg-green-100 rounded-full" title="Enregistrer" disabled={isSaving}>{isSaving ? <Spinner/> : <Check size={16}/>}</button>
                    <button onClick={onCancel} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full" title="Annuler" disabled={isSaving}><X size={16}/></button>
                    <button onClick={() => onToggleComments(sub.id)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full" title={isCommentsExpanded ? "Masquer les commentaires" : "Afficher les commentaires"}>
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
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 align-top border-b border-slate-200 dark:border-slate-700">
            <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-100">{sub.titre}</td>
            <td className="px-3 py-2 max-w-xs">
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm text-slate-600 dark:text-slate-300 ${isDescriptionExpanded ? 'whitespace-pre-wrap break-words' : 'truncate'}`} title={!isDescriptionExpanded ? sub.description : ''}>
                        {sub.description || <span className="italic">Pas de description</span>}
                    </p>
                    {descriptionIsLong && (
                        <button onClick={() => onToggleDescription(sub.id)} className="p-1 text-slate-500 hover:text-blue-600 flex-shrink-0 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700" title={isDescriptionExpanded ? 'Réduire' : 'Afficher plus'}>
                            {isDescriptionExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                </div>
            </td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{getModuleName(sub.idModule )}</td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{sub.idUtilisateur ? `${sub.idUtilisateur.prenom} ${sub.idUtilisateur.nom}` : 'Aucun employé affecté'}</td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{formatDate(sub.date_echeance) }</td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{sub.priorite}</td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{sub.statue}</td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{formatDate(sub.dateCreation)}</td>
            <td className="px-3 py-2">
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => onEdit(sub.id)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700" title="Modifier"><Edit size={16}/></button>
                    <button onClick={() => onDelete(sub.id)} className={`p-1.5 rounded-full ${isAssigned ? 'text-slate-400 cursor-not-allowed' : 'text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-slate-700'}`} title={isAssigned ? 'Ne peut pas supprimer un sous-ticket assigné' : 'Supprimer'} disabled={isAssigned}><Trash2 size={16}/></button>
                    <button onClick={() => onToggleComments(sub.id)} className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-indigo-100 dark:hover:bg-slate-700" title={isCommentsExpanded ? "Masquer les commentaires" : "Afficher les commentaires"}>
                        <MessageSquare size={16}/>
                    </button>
                </div>
            </td>
        </tr>
    );
};

const SubTicketsTable = ({ subTickets, onSaveSubTicket, onDelete, onAdd, allModules, onRemoveModule, onRefreshTicketData, setToast, currentUserId }) => { // <-- currentUserId ajouté ici
    const [editingTicketId, setEditingTicketId] = useState(null);
    const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
    const [expandedComments, setExpandedComments] = useState(new Set());

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
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Sous-tickets</h2>
                <button onClick={onAdd} className="btn btn-primary-icon" title="Ajouter un sous-ticket">
                    <PlusCircle size={20} className="mr-2"/> Ajouter
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium">Titre</th>
                            <th className="px-3 py-2 text-left font-medium">Description</th>
                            <th className="px-3 py-2 text-left font-medium">Module</th>
                            <th className="px-3 py-2 text-left font-medium">Affecté à</th>
                            <th className="px-3 py-2 text-left font-medium">Échéance</th>
                            <th className="px-3 py-2 text-left font-medium">Priorité</th>
                            <th className="px-3 py-2 text-left font-medium">Statut</th>
                            <th className="px-3 py-2 text-left font-medium">Créé le</th>
                            <th className="px-3 py-2 text-center font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {subTickets.map(sub => (
                            <React.Fragment key={sub.id}>
                                {editingTicketId === sub.id
                                    ? <EditableSubTicketRow
                                        sub={sub}
                                        allModules={allModules}
                                        onSave={handleSaveAndClose}
                                        onCancel={() => setEditingTicketId(null)}
                                        onRemoveModule={onRemoveModule}
                                        onToggleComments={toggleCommentExpansion}
                                        isCommentsExpanded={expandedComments.has(sub.id)}
                                        setToast={setToast}
                                        currentUserId={currentUserId} // <-- PASSE currentUserId
                                    />
                                    : <DisplaySubTicketRow
                                        sub={sub}
                                        onEdit={setEditingTicketId}
                                        onDelete={onDelete}
                                        allModules={allModules}
                                        isDescriptionExpanded={expandedDescriptions.has(sub.id)}
                                        onToggleDescription={toggleDescriptionExpansion}
                                        onToggleComments={toggleCommentExpansion}
                                        isCommentsExpanded={expandedComments.has(sub.id)}
                                        setToast={setToast}
                                        currentUserId={currentUserId} // <-- PASSE currentUserId
                                    />
                                }
                                {expandedComments.has(sub.id) && (
                                    <SubTicketCommentRow
                                        subTicket={sub}
                                        onCommentChange={onRefreshTicketData}
                                        currentUserId={currentUserId} // <-- PASSE currentUserId
                                        setToast={setToast}
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
import CommentManager from './CommentManager';
// import userService from '../../../services/userService'; // Importé plus haut, assurez-vous qu'il n'y a pas de doublon

const TicketUpdateView = ({ ticketId, onBack, setToast }) => {
    const [ticket, setTicket] = useState(null);
    const [allModules, setAllModules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDiffractionModalOpen, setIsDiffractionModalOpen] = useState(false);
    const [userId, setUserId] = useState(null); // Ajoute cet état

        useEffect(() => {
            const fetchCurrentUser = async () => {
                try {
                    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
                    const login = storedUser?.login;
                    if (login) {
                        const userProfile = await userService.getUserByLogin(login); // Utilise ton userService
                        setUserId(userProfile.id);
                        console.log("Utilisateur connecté ID:", userProfile.id); // Log pour vérification
                    } else {
                        console.warn("Aucun login trouvé dans le localStorage pour récupérer l'ID utilisateur.");
                    }
                } catch (error) {
                    console.error("Erreur lors de la récupération de l'utilisateur connecté:", error);
                    setToast({type: 'error', message: "Erreur lors de la récupération de l'utilisateur."});
                }
            };
            fetchCurrentUser();
        }, []); // S'exécute une seule fois au montage


    const fetchInitialData = useCallback(async () => {
        try {
            const [ticketData, modulesData] = await Promise.all([ticketService.getTicketById(ticketId), moduleService.getAllModules()]);
            setTicket(ticketData);
            setAllModules(modulesData.data || []);
            console.log("TicketData reçu par getTicketById dans TicketUpdateView:", ticketData);
        } catch (err) {
            setError("Impossible de charger les données.");
            console.error("Erreur lors du chargement des données initiales dans TicketUpdateView:", err);
            setToast({type: 'error', message: "Impossible de charger les détails du ticket."});
        } finally {
            setIsLoading(false);
        }
    }, [ticketId, setToast]);

    // NOUVEL EFFET POUR VÉRIFIER ET CHARGER LES SOUS-TICKETS SI MANQUANTS
    // Ce useEffect est un contournement si getTicketById ne renvoie pas toujours les childTickets.
    useEffect(() => {
        if (ticket && !isLoading) {
            const isParentTicketNow = ticket.idParentTicket === null;
            const hasNoChildTicketsData = !ticket.childTickets || ticket.childTickets.length === 0;

            if (isParentTicketNow && hasNoChildTicketsData) {
                console.warn("Ticket parent chargé sans childTickets. Tentative de re-fetch via getAllParentTickets...");
                const reFetchParents = async () => {
                    try {
                        const allParentsWithChildren = await ticketService.getAllParentTickets();
                        const foundTicketWithChildren = allParentsWithChildren.find(t => t.id === ticket.id);

                        if (foundTicketWithChildren && foundTicketWithChildren.childTickets && foundTicketWithChildren.childTickets.length > 0) {
                            console.log("Trouvé le ticket parent avec childTickets via getAllParentTickets:", foundTicketWithChildren);
                            setTicket(foundTicketWithChildren);
                            setToast({type: 'info', message: 'Détails du ticket mis à jour (sous-tickets chargés).'});
                        } else {
                            console.log("Le ticket parent n'a toujours pas de childTickets, même après getAllParentTickets.");
                        }
                    } catch (err) {
                        console.error("Erreur lors du re-fetch des tickets parents:", err);
                        setToast({type: 'error', message: 'Erreur lors du chargement des sous-tickets.'});
                    }
                };
                reFetchParents();
            }
        }
    }, [ticket, isLoading, ticketId, setToast]);

    useEffect(() => { setIsLoading(true); fetchInitialData(); }, [fetchInitialData]);

    const cleanTicketPayload = (ticketObject) => {
        const cleanedPayload = { ...ticketObject };
        if (cleanedPayload.idClient && typeof cleanedPayload.idClient === 'object') cleanedPayload.idClient = cleanedPayload.idClient.id;
        if (cleanedPayload.idModule && typeof cleanedPayload.idModule === 'object') cleanedPayload.idModule = cleanedPayload.idModule.id;
        if (cleanedPayload.idUtilisateur && typeof cleanedPayload.idUtilisateur === 'object') cleanedPayload.idUtilisateur = cleanedPayload.idUtilisateur.id;
        if (cleanedPayload.parentTicket && typeof cleanedPayload.parentTicket === 'object') cleanedPayload.idParentTicket = cleanedPayload.parentTicket.id;
        
        if (typeof cleanedPayload.date_echeance === 'string') {
            const [year, month, day] = cleanedPayload.date_echeance.split('-').map(Number);
            cleanedPayload.date_echeance = [year, month, day, 0, 0, 0];
        } else if (!Array.isArray(cleanedPayload.date_echeance)) {
            cleanedPayload.date_echeance = null;
        }

        delete cleanedPayload.documentJointesList;
        delete cleanedPayload.commentaireList;
        delete cleanedPayload.childTickets;
        delete cleanedPayload.parentTicket;
        delete cleanedPayload.userCreation;
        delete cleanedPayload.dateCreation;

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
            setToast({ type: 'success', message: 'Mise à jour réussie.' });
            await fetchInitialData();
        } catch (err) { setToast({ type: 'error', message: 'La mise à jour a échoué.' }); console.error(err); }
    };

    const handleSaveSubTicket = async (originalSubTicket, editedSubTicket) => {
        const payload = cleanTicketPayload({
            ...originalSubTicket,
            ...editedSubTicket,
            id: originalSubTicket.id,
            idParentTicket: ticket.id,
            idClient: ticket.idClient?.id
        });
        
        try {
            await ticketService.updateTicket(originalSubTicket.id, payload);
            setToast({ type: 'success', message: 'Sous-ticket mis à jour.' });
            await fetchInitialData();
        } catch(err) {
            console.error(err);
            setToast({ type: 'error', message: 'Une erreur est survenue lors de la mise à jour du sous-ticket.' });
            throw err;
        }
    };

    const handleDirectStatusUpdate = async (newStatus) => {
        setIsActionLoading(true);
        await handleUpdateParentField('statue', newStatus);
        setIsActionLoading(false);
    };

    const handleDiffractionSuccess = () => { setIsDiffractionModalOpen(false); fetchInitialData(); setToast({ type: 'success', message: 'Sous-tickets créés.' }); };

    const handleDeleteSubTicket = async (subTicketId) => {
        const subTicketToDelete = ticket.childTickets.find(sub => sub.id === subTicketId);
        if (subTicketToDelete && subTicketToDelete.idUtilisateur) {
            setToast({ type: 'error', message: "Impossible de supprimer un sous-ticket déjà affecté à un employé." });
            return;
        }

        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce sous-ticket ?")) {
            try {
                await ticketService.deleteTicket(subTicketId);
                setToast({ type: 'success', message: 'Sous-ticket supprimé.' });
                await fetchInitialData();
            } catch (error) {
                setToast({ type: 'error', message: 'La suppression a échoué.' });
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
                    idModule: null,
                    id: subTicketToUpdate.id
                });
                
                await ticketService.updateTicket(subTicketToUpdate.id, payload);
                setToast({ type: 'success', message: 'Module du sous-ticket supprimé.' });
                await fetchInitialData();
            } catch (err) {
                setToast({ type: 'error', message: 'La suppression du module a échoué.' });
                console.error("Erreur lors de la suppression du module du sous-ticket:", err);
            }
        }
    };

    const isSubTicket = ticket && ticket.idParentTicket !== null;
    const isParentTicket = ticket && ticket.idParentTicket === null;

    const renderActions = () => {
        if (!ticket || isActionLoading) return <Spinner />;
        if (isSubTicket) {
            return null;
        }
        
        switch (ticket.statue) {
            case 'En_attente':
                return (
                    <div className="flex items-center space-x-3">
                        <button onClick={() => handleDirectStatusUpdate('Refuse')} className="btn btn-danger" disabled={isActionLoading}>
                            {isActionLoading ? <Spinner /> : <X size={18} className="mr-2"/>} Refuser
                        </button>
                        <button onClick={() => handleDirectStatusUpdate('Accepte')} className="btn btn-success" disabled={isActionLoading}>
                            {isActionLoading ? <Spinner /> : <Check size={18} className="mr-2"/>} Accepter
                        </button>
                    </div>
                );
            case 'Accepte':
                if (!ticket.childTickets || ticket.childTickets.length === 0) {
                    return (
                        <button onClick={() => setIsDiffractionModalOpen(true)} className="btn btn-primary" disabled={isActionLoading}>
                            {isActionLoading ? <Spinner /> : <GitFork size={18} className="mr-2"/>} Diffracter
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
    const showSubTicketsTable = hasSubTickets; 

    console.log("--- Débug TicketUpdateView Final ---");
    console.log("Ticket ID:", ticketId);
    console.log("Ticket data (direct from state):", ticket);
    console.log("isSubTicket (calculated):", isSubTicket);
    console.log("isParentTicket (calculated):", isParentTicket);
    console.log("hasSubTickets (calculated):", hasSubTickets);
    console.log("showSubTicketsTable (final decision):", showSubTicketsTable);
    console.log("------------------------------------");

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
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="btn btn-secondary"><ArrowLeft size={18} className="mr-2"/> Retour</button>
                <div>{renderActions()}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
                 <div className="flex flex-col md:flex-row gap-8">
                     <div className="flex-grow md:w-2/3 space-y-6">
                         <EditableField initialValue={ticket.titre} onSave={handleUpdateParentField} fieldName="titre" />
                         <div><h3 className="text-sm font-semibold uppercase text-slate-400 mb-2">Description</h3><EditableField initialValue={ticket.description} onSave={handleUpdateParentField} fieldName="description" isTextarea={true} /></div>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                              <DetailItem icon={<ModuleIcon size={14} className="mr-2"/>} label="Module"><ModuleEditor ticket={ticket} onUpdate={handleUpdateParentField} onRemove={() => handleUpdateParentField('idModule', null)} allModules={allModules} /></DetailItem>
                              <DetailItem icon={<UserCheck size={14} className="mr-2"/>} label="Affecté à">{affectedToValue}</DetailItem>
                              <DetailItem icon={<Calendar size={14} className="mr-2"/>} label="Échéance">{dueDateValue}</DetailItem>
                         </div>
                     </div>
                     <div className="flex-shrink-0 md:w-1/3 space-y-4">
                         <div className="grid grid-cols-2 gap-x-4 gap-y-4 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                              <DetailItem icon={<Tag size={14} className="mr-2"/>} label="Priorité">
                                   <PriorityEditor ticket={ticket} onUpdate={handleUpdateParentField} />
                              </DetailItem>
                              <DetailItem icon={<Info size={14} className="mr-2"/>} label="Statut" value={ticket.statue} />
                         </div>
                         <div className="pt-4 space-y-4 border-t border-slate-200 dark:border-slate-700">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-4"><DetailItem icon={<User size={14} className="mr-2"/>} label="Client" value={ticket.idClient?.nomComplet} /><DetailItem icon={<User size={14} className="mr-2"/>} label="Créé par" value={ticket.userCreation} /></div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-4"><DetailItem icon={<Calendar size={14} className="mr-2"/>} label="Créé le" value={formatDate(ticket.dateCreation)} /><DetailItem icon={<Shield size={14} className="mr-2"/>} label="Actif"><select value={ticket.actif.toString()} onChange={(e) => handleUpdateParentField('actif', e.target.value === 'true')} className="form-select text-sm font-medium bg-transparent border-0 focus:ring-0 p-0"><option value="true">Oui</option><option value="false">Non</option></select></DetailItem></div>
                         </div>
                     </div>
                 </div>
            </div>

            {/* Nouvelle section pour Documents et Commentaires côte à côte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Zone des commentaires du ticket (toujours présente) */}
                <CommentManager
                    ticketId={ticket.id}
                    comments={ticket.commentaireList}
                    onCommentChange={fetchInitialData}
                    setToast={setToast}
                />

                {/* Zone des documents joints (toujours présente) */}
                <DocumentManager
                    ticketId={ticket.id}
                    documents={ticket.documentJointesList}
                    onDocumentChange={fetchInitialData}
                    setToast={setToast}
                />
            </div>
            {/* Tableau des sous-tickets - Conditionnel si présence de sous-tickets */}
            {showSubTicketsTable && (
                <div className="mt-8">
                    <SubTicketsTable
                        subTickets={ticket.childTickets}
                        onAdd={() => setIsDiffractionModalOpen(true)}
                        onSaveSubTicket={handleSaveSubTicket}
                        onDelete={handleDeleteSubTicket}
                        allModules={allModules}
                        onRemoveModule={handleRemoveSubTicketModule}
                        onRefreshTicketData={fetchInitialData}
                        currentUserId={userId} 
                        setToast={setToast}
                    />
                </div>
            )}

            {isDiffractionModalOpen && (
                <DiffractionForm
                    parentTicket={ticket}
                    onClose={() => setIsDiffractionModalOpen(false)}
                    onSuccess={handleDiffractionSuccess}
                    setToast={setToast}
                />
            )}
        </div>
    );
};

export default TicketUpdateView;