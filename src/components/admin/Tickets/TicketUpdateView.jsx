// src/components/admin/Tickets/TicketUpdateView.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ticketService from '../../../services/ticketService';
import moduleService from '../../../services/moduleService';
import commentService from '../../../services/commentService';
import documentService from '../../../services/documentService';
import userService from '../../../services/userService';
import utilisateurService from '../../../services/utilisateurService';


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
    AlertTriangle, CheckCircle, FileText, Clock
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
            <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity%20 transition-colors duration-200">
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

// --- COMPOSANTS D'AFFICHAGE ET D'ÉDITION POUR LES CHAMPS PRINCIPAUX (MODIFIÉ) ---
// Composant pour le badge de priorité (réutilisé et adapté de TicketTableRow)
const PriorityDisplay = ({ priority, isEditable, onUpdate }) => {
    const normalizedPriority = priority?.toUpperCase();
    let dotColors = ['bg-slate-300', 'bg-slate-300', 'bg-slate-300'];

    switch (normalizedPriority) {
        case 'HAUTE':
            dotColors = ['bg-red-500', 'bg-red-500', 'bg-red-500'];
            break;
        case 'MOYENNE':
            dotColors = ['bg-blue-500', 'bg-blue-500', 'bg-slate-300'];
            break;
        case 'BASSE':
            dotColors = ['bg-green-500', 'bg-green-500', 'bg-green-500']; // Changé pour 3 points verts
            break;
        default:
            dotColors = ['bg-slate-300', 'bg-slate-300', 'bg-slate-300'];
    }

    if (isEditable) {
        return (
            <select value={priority || 'MOYENNE'} onChange={(e) => onUpdate(e.target.value)} className="form-select text-sm font-medium bg-transparent border-0 focus:ring-0 p-0 pr-6">
                <option value="Basse">Basse</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Haute">Haute</option>
            </select>
        );
    }
    return (
        <span className="flex items-center justify-center gap-1">
            {dotColors.map((dotColor, index) => (
                <span key={index} className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
            ))}
            <span className="ml-1 text-sm text-slate-700 dark:text-slate-200">{priority || 'N/A'}</span>
        </span>
    );
};

// Composant pour le badge de statut (réutilisé et adapté de TicketTableRow)
const StatusDisplay = ({ status, isEditable, onUpdate }) => {
    const normalizedStatus = status?.toUpperCase();
    let text = status || 'N/A';
    let className = 'text-slate-500';

    switch (normalizedStatus) {
        case 'EN_COURS': text = 'En cours'; className = 'text-orange-600 dark:text-orange-400'; break;
        case 'EN_ATTENTE': text = 'En attente'; className = 'text-gray-600 dark:text-gray-400'; break;
        case 'ACCEPTE': text = 'Accepté'; className = 'text-green-600 dark:text-green-400'; break;
        case 'REFUSE': text = 'Refusé'; className = 'text-red-600 dark:text-red-400'; break;
        case 'TERMINE': text = 'Terminé'; className = 'text-blue-600 dark:text-blue-400'; break;
        default: text = status || 'N/A'; className = 'text-slate-500'; break;
    }

    if (isEditable) {
        return (
            <select value={status || 'En_attente'} onChange={(e) => onUpdate(e.target.value)} className="form-select text-sm font-medium bg-transparent border-0 focus:ring-0 p-0 pr-6">
                <option value="En_attente">En attente</option>
                <option value="En_cours">En cours</option>
                <option value="Accepte">Accepté</option>
                <option value="Termine">Terminé</option>
                <option value="Refuse">Refusé</option>
            </select>
        );
    }
    return <span className={`text-sm font-semibold ${className}`}>{text}</span>;
};

// Composant pour le badge Actif (réutilisé et adapté de PosteTableRow)
const ActifDisplay = ({ actif, isEditable, onUpdate }) => {
    const isActive = actif === true;
    if (isEditable) {
        return (
            <select value={actif?.toString()} onChange={(e) => onUpdate(e.target.value === 'true')} className="form-select text-sm font-medium bg-transparent border-0 focus:ring-0 p-0 pr-6">
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
            </select>
        );
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium gap-1 border ${isActive ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20' : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-700'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
            {isActive ? 'Actif' : 'Inactif'}
        </span>
    );
};

// Composant générique pour afficher un détail avec icône et label
const DetailItem = ({ icon, label, value, isHighlighted = false, children }) => (
    <div className={`p-2 rounded-md ${isHighlighted ? 'bg-blue-100 dark:bg-blue-900/20 transition-colors duration-500' : ''}`}>
        <dt className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-0.5">{icon}<span className="ml-1">{label}</span></dt>
        <dd className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words">{children || value || <span className="italic text-slate-400">N/A</span>}</dd>
    </div>
);

// Composant pour l'affichage stylisé d'un champ éditable (Module, Employé, Date d'échéance)
const EditableStyledField = ({ icon, label, value, isEditable, onUpdate, type = 'text', options = [], placeholder = '', isHighlighted = false, disabled = false }) => {
    const isModuleOrEmployee = type === 'select';
    const isDate = type === 'date';

    let displayValue;
    let valueColorClass = 'text-slate-800 dark:text-slate-100'; // Default color

    if (isModuleOrEmployee) {
        displayValue = value?.designation || value?.nomComplet || 'N/A'; // For module or user
        if (value) valueColorClass = 'text-blue-600 dark:text-blue-400';
    } else if (isDate) {
        displayValue = value ? formatDate(value).split(' ')[0] : 'N/A'; // Just the date part
        if (value) valueColorClass = 'text-blue-600 dark:text-blue-400';
    } else {
        displayValue = value;
    }

    const placeholderText = isModuleOrEmployee
        ? `Aucun ${label.toLowerCase().replace('affecté', '').trim()} affecté`
        : isDate
            ? "Aucune date d'échéance configurée"
            : placeholder;

    return (
        <div className={`
            p-2 rounded-md transition-colors duration-500
            ${isHighlighted ? 'bg-blue-100 dark:bg-blue-900/20' : ''}
        `}>
            <label className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-0.5">
                {icon}<span className="ml-1">{label}</span>
            </label>
            {isEditable && !disabled ? (
                <>
                    {isModuleOrEmployee ? (
                        <select
                            value={value?.id || ''}
                            onChange={(e) => onUpdate(e.target.value)}
                            className="form-select text-sm w-full bg-white dark:bg-slate-900/50"
                            disabled={disabled}
                        >
                            <option value="">{placeholderText}</option>
                            {options.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.designation || opt.nomComplet || opt.nom}</option>
                            ))}
                        </select>
                    ) : isDate ? (
                        <input
                            type="date"
                            value={value ? (Array.isArray(value) ? new Date(value[0], value[1] - 1, value[2]).toISOString().slice(0, 10) : new Date(value).toISOString().slice(0, 10)) : ''}
                            onChange={(e) => {
                                const date = e.target.value ? new Date(e.target.value) : null;
                                onUpdate(date ? [date.getFullYear(), date.getMonth() + 1, date.getDate(), 0, 0, 0] : null);
                            }}
                            className="form-input text-sm w-full"
                            disabled={disabled}
                        />
                    ) : (
                        <input
                            type={type}
                            value={value || ''}
                            onChange={(e) => onUpdate(e.target.value)}
                            className="form-input text-sm w-full"
                            placeholder={placeholder}
                            disabled={disabled}
                        />
                    )}
                </>
            ) : (
                <p className={`text-sm font-medium ${value ? valueColorClass : 'italic text-slate-400 dark:text-slate-500'}`}>
                    {displayValue || placeholderText}
                </p>
            )}
        </div>
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
        try {
            await commentService.addComment({ commentaire: newCommentText, idTicket: subTicket.id, idUtilisateur: currentUserId });
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
        try {
            await commentService.updateComment(commentId, { commentaire: editingCommentText, idTicket: subTicket.id, idUtilisateur: currentUserId });
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
                                                            ><Check size={14} /></button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="p-1.5 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900/30"
                                                                title="Annuler"
                                                            ><X size={14} /></button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditClick(comment)}
                                                                className="p-1.5 text-slate-500 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                                title="Modifier"
                                                            ><Edit size={14} /></button>
                                                            <button
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className="p-1.5 text-slate-500 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                                                                title="Supprimer"
                                                            ><Trash2 size={14} /></button>
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
const EditableSubTicketRow = ({ sub, allModules, allUsers, onSave, onCancel, onRemoveModule, onToggleComments, isCommentsExpanded, setToast, currentUserId }) => {
    const [editableData, setEditableData] = useState({ ...sub });
    const [isSaving, setIsSaving] = useState(false);
    const textAreaRef = useRef(null);
    useAutosizeTextArea(textAreaRef, editableData.description);
    const [moduleSearchTerm, setModuleSearchTerm] = useState('');
    const [isSearchingModule, setIsSearchingModule] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [isSearchingUser, setIsSearchingUser] = useState(false);
    const [highlightedFields, setHighlightedFields] = useState({});

    const highlightTimerRef = useRef(null);
    const setAndClearHighlight = useCallback((field) => {
        setHighlightedFields(prev => ({ ...prev, [field]: true }));
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = setTimeout(() => {
            setHighlightedFields({});
        }, 4000);
    }, []);

    useEffect(() => {
        if (!sub.idModule) {
            setIsSearchingModule(true);
        } else {
            setIsSearchingModule(false);
            setModuleSearchTerm(sub.idModule?.designation || '');
        }
        if (!sub.idUtilisateur) {
            setIsSearchingUser(true);
        } else {
            setIsSearchingUser(false);
            setUserSearchTerm(`${sub.idUtilisateur.prenom} ${sub.idUtilisateur.nom}`.trim());
        }
    }, [sub.idModule, sub.idUtilisateur]);

    const handleChange = (field, value) => {
        setEditableData(prev => ({ ...prev, [field]: value }));
    };

    const handleModuleChange = (module) => {
        handleChange('idModule', module);
        setIsSearchingModule(false);
        setModuleSearchTerm(module?.designation || '');
        setAndClearHighlight('idModule');
    };

    const handleUserChange = (user) => {
        handleChange('idUtilisateur', user);
        setIsSearchingUser(false);
        setUserSearchTerm(`${user.prenom} ${user.nom}`.trim());
        setAndClearHighlight('idUtilisateur');
    };

    const handleSaveClick = async () => {
        setIsSaving(true);
        try {
            await onSave(sub, editableData);
            setAndClearHighlight('all'); // Highlight the whole row after saving
        } catch (error) {
            console.error("Error saving sub-ticket:", error);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        setEditableData({ ...sub });
    }, [sub]);

    const renderModuleCell = () => {
        if (editableData.idUtilisateur && editableData.idModule) { // Module is locked if employee is assigned
            return <span className={`text-sm text-slate-500 dark:text-slate-400 italic ${highlightedFields.idModule ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}>
                {editableData.idModule.designation} (verrouillé)
            </span>;
        }

        return (
            <div className="relative">
                <input
                    type="text"
                    className={`form-input text-sm w-full ${highlightedFields.idModule ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}
                    value={moduleSearchTerm}
                    onChange={(e) => setModuleSearchTerm(e.target.value)}
                    placeholder="Rechercher..."
                    onFocus={() => setIsSearchingModule(true)}
                    onBlur={() => setTimeout(() => setIsSearchingModule(false), 200)} // Delay to allow click on dropdown
                />
                {isSearchingModule && moduleSearchTerm && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {allModules
                            .filter(m => m.designation.toLowerCase().includes(moduleSearchTerm.toLowerCase()))
                            .map(module => (
                                <div key={module.id} onMouseDown={() => handleModuleChange(module)} className="p-2 text-sm hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer">
                                    {module.designation}
                                </div>
                            ))
                        }
                        {allModules.filter(m => m.designation.toLowerCase().includes(moduleSearchTerm.toLowerCase())).length === 0 &&
                            <p className="text-center text-xs text-slate-500 py-2">Aucun module trouvé.</p>
                        }
                    </div>
                )}
                 {!editableData.idModule && <span className="text-xs italic text-slate-400 mt-1 block">Aucun module affecté</span>}
            </div>
        );
    };

    const renderUserCell = () => {
        if (editableData.statue !== 'En_attente' && editableData.statue !== 'Accepte') { // User is locked if status is not En_attente or Accepte
            return <span className={`text-sm text-slate-500 dark:text-slate-400 italic ${highlightedFields.idUtilisateur ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}>
                {editableData.idUtilisateur ? `${editableData.idUtilisateur.prenom} ${editableData.idUtilisateur.nom}` : 'N/A'} (verrouillé)
            </span>;
        }
        return (
            <div className="relative">
                <input
                    type="text"
                    className={`form-input text-sm w-full ${highlightedFields.idUtilisateur ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Rechercher un employé..."
                    onFocus={() => setIsSearchingUser(true)}
                    onBlur={() => setTimeout(() => setIsSearchingUser(false), 200)}
                />
                {isSearchingUser && userSearchTerm && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {allUsers
                            .filter(u => `${u.prenom} ${u.nom}`.toLowerCase().includes(userSearchTerm.toLowerCase()))
                            .map(user => (
                                <div key={user.id} onMouseDown={() => handleUserChange(user)} className="p-2 text-sm hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer">
                                    {u.prenom} {u.nom}
                                </div>
                            ))
                        }
                        {allUsers.filter(u => `${u.prenom} ${u.nom}`.toLowerCase().includes(userSearchTerm.toLowerCase())).length === 0 &&
                            <p className="text-center text-xs text-slate-500 py-2">Aucun employé trouvé.</p>
                        }
                    </div>
                )}
                {!editableData.idUtilisateur && <span className="text-xs italic text-slate-400 mt-1 block">Aucun employé affecté</span>}
            </div>
        );
    };


    return (
        <tr className={`bg-blue-50 dark:bg-blue-900/50 align-top border-b border-blue-200 dark:border-blue-700 ${Object.keys(highlightedFields).length > 0 ? 'highlight-row' : ''}`}>
            <td className={`px-2 py-2 ${highlightedFields.titre ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}>
                <input type="text" value={editableData.titre} onChange={(e) => { handleChange('titre', e.target.value); setAndClearHighlight('titre'); }} className="form-input text-sm w-full" />
            </td>
            <td className={`px-2 py-2 ${highlightedFields.description ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}>
                <textarea ref={textAreaRef} value={editableData.description || ''} onChange={(e) => { handleChange('description', e.target.value); setAndClearHighlight('description'); }} className="form-textarea text-sm w-full overflow-hidden resize-none" rows={1} placeholder="Ajouter une description..."></textarea>
            </td>
            <td className="px-2 py-2">
                {renderModuleCell()}
            </td>
            <td className="px-2 py-2">
                {renderUserCell()}
            </td>
            <td className={`px-2 py-2 ${highlightedFields.date_echeance ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}>
                <input type="date" value={editableData.date_echeance ? (Array.isArray(editableData.date_echeance) ? new Date(editableData.date_echeance[0], editableData.date_echeance[1] - 1, editableData.date_echeance[2]).toISOString().slice(0, 10) : new Date(editableData.date_echeance).toISOString().slice(0, 10)) : ''} onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    handleChange('date_echeance', date ? [date.getFullYear(), date.getMonth() + 1, date.getDate()] : null);
                    setAndClearHighlight('date_echeance');
                }} className="form-input text-sm w-full" />
            </td>
            <td className={`px-2 py-2 ${highlightedFields.priorite ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}>
                <select value={editableData.priorite} onChange={(e) => { handleChange('priorite', e.target.value); setAndClearHighlight('priorite'); }} className="form-select text-sm w-full">
                    {["Basse", "Moyenne", "Haute"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </td>
            <td className={`px-2 py-2 ${highlightedFields.statue ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}>
                <select value={editableData.statue} onChange={(e) => { handleChange('statue', e.target.value); setAndClearHighlight('statue'); }} className="form-select text-sm w-full">
                    {["En_attente", "En_cours", "Accepte", "Termine", "Refuse"].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
            </td>
            <td className="px-2 py-2 text-xs text-slate-600 dark:text-slate-300">
                {formatDate(editableData.dateCreation)}
            </td>
            <td className="px-2 py-2">
                <div className="flex items-center justify-center space-x-1">
                    <button onClick={handleSaveClick} className="p-1.5 text-green-600 hover:bg-green-100 rounded-full" title="Enregistrer" disabled={isSaving}>{isSaving ? <Spinner /> : <Check size={16} />}</button>
                    <button onClick={onCancel} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full" title="Annuler" disabled={isSaving}><X size={16} /></button>
                    <button onClick={() => onToggleComments(sub.id)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full" title={isCommentsExpanded ? "Masquer les commentaires" : "Afficher les commentaires"}>
                        <MessageSquare size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

const DisplaySubTicketRow = ({ sub, onEdit, onDelete, allModules, isDescriptionExpanded, onToggleDescription, onToggleComments, isCommentsExpanded, setToast, currentUserId }) => {
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
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{getModuleName(sub.idModule)}</td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{sub.idUtilisateur ? `${sub.idUtilisateur.prenom} ${sub.idUtilisateur.nom}` : 'Aucun employé affecté'}</td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{formatDate(sub.date_echeance)}</td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{sub.priorite}</td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{sub.statue}</td>
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{formatDate(sub.dateCreation)}</td>
            <td className="px-3 py-2">
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => onEdit(sub.id)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700" title="Modifier"><Edit size={16} /></button>
                    <button onClick={() => onDelete(sub.id)} className={`p-1.5 rounded-full ${isAssigned ? 'text-slate-400 cursor-not-allowed' : 'text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-slate-700'}`} title={isAssigned ? 'Ne peut pas supprimer un sous-ticket assigné' : 'Supprimer'} disabled={isAssigned}><Trash2 size={16} /></button>
                    <button onClick={() => onToggleComments(sub.id)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full" title={isCommentsExpanded ? "Masquer les commentaires" : "Afficher les commentaires"}>
                        <MessageSquare size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

const SubTicketsTable = ({ subTickets, onSaveSubTicket, onDelete, onAdd, allModules, allUsers, onRemoveModule, onRefreshTicketData, setToast, currentUserId }) => { // <-- currentUserId ajouté ici
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
        <div className="card-white p-4"> {/* Reduced padding */}
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">Sous-tickets</h3> {/* Reduced margin */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="px-3 py-2 text-left">Titre</th>
                            <th className="px-3 py-2 text-left">Description</th>
                            <th className="px-3 py-2 text-left">Module</th>
                            <th className="px-3 py-2 text-left">Affecté à</th>
                            <th className="px-3 py-2 text-left">Échéance</th>
                            <th className="px-3 py-2 text-left">Priorité</th>
                            <th className="px-3 py-2 text-left">Statut</th>
                            <th className="px-3 py-2 text-left">Créé le</th>
                            <th className="px-3 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {subTickets.map(sub => (
                            <React.Fragment key={sub.id}>
                                {editingTicketId === sub.id
                                    ? <EditableSubTicketRow
                                        sub={sub}
                                        allModules={allModules}
                                        allUsers={allUsers}
                                        onSave={handleSaveAndClose}
                                        onCancel={() => setEditingTicketId(null)}
                                        onRemoveModule={onRemoveModule}
                                        onToggleComments={toggleCommentExpansion}
                                        isCommentsExpanded={expandedComments.has(sub.id)}
                                        setToast={setToast}
                                        currentUserId={currentUserId}
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
                                        currentUserId={currentUserId}
                                    />
                                }
                                {expandedComments.has(sub.id) && (
                                    <SubTicketCommentRow
                                        subTicket={sub}
                                        onCommentChange={onRefreshTicketData}
                                        currentUserId={currentUserId}
                                        setToast={setToast}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-3 flex justify-end"> {/* Reduced margin */}
                <button onClick={onAdd} className="btn btn-primary-icon" title="Ajouter un sous-ticket">
                    <PlusCircle size={20} className="mr-2" /> Ajouter
                </button>
            </div>
        </div>
    );
};


// --- VUE PRINCIPALE DE MODIFICATION ---
import DocumentManager from './DocumentManager';
import CommentManager from './CommentManager';

const TicketUpdateView = ({ ticketId, onBack, toast, setToast, onNavigateToParent }) => {
    const [ticket, setTicket] = useState(null);
    const [editableData, setEditableData] = useState(null); // Local state for main ticket's editable fields
    const [allModules, setAllModules] = useState([]);
    const [allUsers, setAllUsers] = useState([]); // All users for 'Affecté à' dropdown
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingMainTicket, setIsSavingMainTicket] = useState(false);
    const [error, setError] = useState(null);
    const [isDiffractionModalOpen, setIsDiffractionModalOpen] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isCommentsAndDocsCollapsed, setIsCommentsAndDocsCollapsed] = useState(false);
    const [highlightedFields, setHighlightedFields] = useState({}); // To highlight modified fields

    const descriptionTextAreaRef = useRef(null); // Declare useRef at the top level
    useAutosizeTextArea(descriptionTextAreaRef, editableData?.description); // Use it here


    const highlightTimerRef = useRef(null); // Ref for the timer


    const setAndClearHighlight = useCallback((field) => {
        setHighlightedFields(prev => ({ ...prev, [field]: true }));
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = setTimeout(() => {
            setHighlightedFields({});
        }, 4000); // Highlight for 4 seconds
    }, []);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('currentUser'));
                const login = storedUser?.login;
                if (login) {
                    const userProfile = await userService.getUserByLogin(login);
                    setUserId(userProfile.id);
                } else {
                    console.warn("Aucun login trouvé dans le localStorage pour récupérer l'ID utilisateur.");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de l'utilisateur connecté:", error);
                setToast({ type: 'error', message: "Erreur lors de la récupération de l'utilisateur." });
            }
        };
        fetchCurrentUser();
    }, []);

    const fetchInitialData = useCallback(async () => {
        try {
            const [ticketData, modulesData, usersData] = await Promise.all([
                ticketService.getTicketById(ticketId),
                moduleService.getAllModules(),
                utilisateurService.getAllUtilisateurs(),
            ]);
            setTicket(ticketData);
            // Initialize editableData with fetched ticket data
            setEditableData({
                titre: ticketData.titre || '',
                description: ticketData.description || '',
                priorite: ticketData.priorite || 'Moyenne', // Default to Moyenne as per enum
                statue: ticketData.statue || 'En_attente', // Default to En_attente as per enum
                actif: ticketData.actif,
                date_echeance: ticketData.date_echeance,
                idModule: ticketData.idModule || null, // Keep as object or null
                idUtilisateur: ticketData.idUtilisateur || null, // Keep as object or null
            });
            setAllModules(modulesData.data || []);
            setAllUsers(usersData.data || []);
        } catch (err) {
            setError("Impossible de charger les données.");
            console.error("Erreur lors du chargement des données initiales dans TicketUpdateView:", err);
            setToast({ type: 'error', message: "Impossible de charger les détails du ticket." });
        } finally {
            setIsLoading(false);
        }
    }, [ticketId, setToast]);

    useEffect(() => { setIsLoading(true); fetchInitialData(); }, [fetchInitialData]);

    const cleanTicketPayload = (ticketObject) => {
        const cleanedPayload = { ...ticketObject };
        if (cleanedPayload.idClient && typeof cleanedPayload.idClient === 'object') cleanedPayload.idClient = cleanedPayload.idClient.id;
        if (cleanedPayload.idModule && typeof cleanedPayload.idModule === 'object') cleanedPayload.idModule = cleanedPayload.idModule.id;
        if (cleanedPayload.idUtilisateur && typeof cleanedPayload.idUtilisateur === 'object') cleanedPayload.idUtilisateur = cleanedPayload.idUtilisateur.id;
        if (cleanedPayload.parentTicket && typeof cleanedPayload.parentTicket === 'object') cleanedPayload.idParentTicket = cleanedPayload.parentTicket.id;
        
        // Ensure date_echeance is in array format [year, month, day, 0, 0, 0] or null
        if (typeof cleanedPayload.date_echeance === 'string') {
            const [year, month, day] = cleanedPayload.date_echeance.split('-').map(Number);
            cleanedPayload.date_echeance = [year, month, day, 0, 0, 0];
        } else if (Array.isArray(cleanedPayload.date_echeance) && cleanedPayload.date_echeance.length === 3) {
            // If already [year, month, day], convert to [year, month, day, 0, 0, 0]
            cleanedPayload.date_echeance = [...cleanedPayload.date_echeance, 0, 0, 0];
        } else if (!Array.isArray(cleanedPayload.date_echeance)) {
            cleanedPayload.date_echeance = null;
        }

        // Remove properties that should not be sent in the update DTO
        delete cleanedPayload.documentJointesList;
        delete cleanedPayload.commentaireList;
        delete cleanedPayload.childTickets;
        delete cleanedPayload.parentTicket;
        delete cleanedPayload.userCreation;
        delete cleanedPayload.demandeur; // Assuming demandeur is nested and not part of flat DTO
        delete cleanedPayload.client; // Assuming client is nested and not part of flat DTO
        delete cleanedPayload.id; // ID is in the URL, not in the body for PUT
        delete cleanedPayload.dateCreation; // <-- Removed dateCreation from payload
        
        return cleanedPayload;
    };


    const handleEditableDataChange = (field, value) => {
        setEditableData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveMainTicket = async () => {
        if (!editableData) return;
        setIsSavingMainTicket(true);
        setError(null);

        const payloadToSend = {
            ...ticket, // Start with original ticket to ensure all non-edited fields are present
            ...editableData, // Overlay with edited data
            idClient: ticket.idClient?.id || null, // Ensure client ID is included from original ticket
            idParentTicket: ticket.idParentTicket || null, // Ensure parent ticket ID is included
            // dateCreation: ticket.dateCreation, // Removed from here
        };

        const cleanedPayload = cleanTicketPayload(payloadToSend);
        
        try {
            await ticketService.updateTicket(ticketId, cleanedPayload);
            setToast({ type: 'success', message: 'Ticket mis à jour avec succès !' });
            setAndClearHighlight('mainTicket'); // Highlight entire section
            await fetchInitialData(); // Re-fetch to get latest state from backend
        } catch (err) {
            console.error("Erreur lors de la mise à jour du ticket principal:", err);
            setToast({ type: 'error', message: err.response?.data?.message || 'Échec de la mise à jour du ticket.' });
        } finally {
            setIsSavingMainTicket(false);
        }
    };

    const handleCancelMainTicketEdit = () => {
        // Reset editableData to the current ticket's actual data
        setEditableData({
            titre: ticket.titre || '',
            description: ticket.description || '',
            priorite: ticket.priorite || 'Moyenne',
            statue: ticket.statue || 'En_attente',
            actif: ticket.actif,
            date_echeance: ticket.date_echeance,
            idModule: ticket.idModule || null,
            idUtilisateur: ticket.idUtilisateur || null,
        });
        setToast({ type: 'info', message: 'Modifications annulées.' });
    };

    const handleAcceptTicket = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir accepter ce ticket ?")) {
            setIsSavingMainTicket(true);
            try {
                const payload = cleanTicketPayload({
                    ...ticket,
                    statue: 'Accepte', // Use 'Accepte' as per enum
                    idClient: ticket.idClient?.id || null,
                    idParentTicket: ticket.idParentTicket || null,
                    // dateCreation: ticket.dateCreation, // Removed from here
                });
                await ticketService.updateTicket(ticketId, payload);
                setToast({ type: 'success', message: 'Ticket accepté avec succès !' });
                await fetchInitialData();
            } catch (error) {
                console.error("Erreur lors de l'acceptation du ticket:", error);
                setToast({ type: 'error', message: error.response?.data?.message || "Échec de l'acceptation du ticket." });
            } finally {
                setIsSavingMainTicket(false);
            }
        }
    };

    const handleRefuseTicket = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir refuser ce ticket ?")) {
            setIsSavingMainTicket(true);
            try {
                const payload = cleanTicketPayload({
                    ...ticket,
                    statue: 'Refuse', // Use 'Refuse' as per enum
                    idClient: ticket.idClient?.id || null,
                    idParentTicket: ticket.idParentTicket || null,
                    // dateCreation: ticket.dateCreation, // Removed from here
                });
                await ticketService.updateTicket(ticketId, payload);
                setToast({ type: 'success', message: 'Ticket refusé avec succès !' });
                await fetchInitialData();
            } catch (error) {
                console.error("Erreur lors du refus du ticket:", error);
                setToast({ type: 'error', message: error.response?.data?.message || "Échec du refus du ticket." });
            } finally {
                setIsSavingMainTicket(false);
            }
        }
    };

    const handleDiffractTicket = async () => {
        // No clearing logic needed here as the button is conditionally hidden
        // if idModule is not null, or if it's a sub-ticket.
        setIsDiffractionModalOpen(true);
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
        } catch (err) {
            console.error(err);
            setToast({ type: 'error', message: 'Une erreur est survenue lors de la mise à jour du sous-ticket.' });
            throw err;
        }
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
    const hasSubTickets = ticket?.childTickets && ticket.childTickets.length > 0;
    // Ticket is locked if its status is Accepte, Refuse, or Termine (as per user's enum)
    const isTicketLocked = ['Accepte', 'Refuse', 'Termine'].includes(ticket?.statue);
    const isPending = ticket?.statue === 'En_attente';


    if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
    if (!ticket || !editableData) return null; // Ensure editableData is loaded


    return (
        <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-900 min-h-screen"> {/* Reduced padding */}
            {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header section */}
            <div className="flex justify-between items-center mb-4"> {/* Reduced margin-bottom */}
                <div className="flex items-center space-x-3"> {/* Reduced space-x */}
                    <button onClick={onBack} className="btn btn-secondary flex items-center">
                        <ArrowLeft size={16} className="mr-1" /> Retour
                    </button>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100"> {/* Reduced font size */}
                        {isSubTicket ? "Modifier un Sous-Ticket" : "Modifier un Ticket"}
                    </h1>
                </div>
                {/* Action Buttons for main ticket */}
                <div className="flex space-x-2">
                    {isPending && !isTicketLocked && (
                        <>
                            <button onClick={handleAcceptTicket} className="btn btn-primary bg-green-600 hover:bg-green-700" disabled={isSavingMainTicket}>
                                <Check size={16} className="mr-1" /> Accepter
                            </button>
                            <button onClick={handleRefuseTicket} className="btn btn-danger" disabled={isSavingMainTicket}>
                                <X size={16} className="mr-1" /> Refuser
                            </button>
                        </>
                    )}
                    {/* Diffract button: visible if not a sub-ticket, not locked, and no module assigned */}
                    {!isSubTicket && !isTicketLocked && !editableData.idModule && (
                        <button onClick={handleDiffractTicket} className="btn btn-secondary" disabled={isSavingMainTicket}>
                            <GitFork size={16} className="mr-1" /> Diffracter
                        </button>
                    )}
                    <button onClick={handleCancelMainTicketEdit} className="btn btn-secondary" disabled={isSavingMainTicket || isTicketLocked}>
                        <X size={16} className="mr-1" /> Annuler
                    </button>
                    <button onClick={handleSaveMainTicket} className="btn btn-primary" disabled={isSavingMainTicket || isTicketLocked}>
                        {isSavingMainTicket ? <Spinner /> : <Check size={16} className="mr-1" />} Confirmer les modifications
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg mb-4 ${highlightedFields.mainTicket ? 'highlight-row' : ''}`}> {/* Reduced padding and margin-bottom */}
                <div className="flex flex-col lg:flex-row gap-6"> {/* Reduced gap */}
                    {/* Left Column - Main editable fields */}
                    <div className="flex-grow lg:w-2/3 space-y-4"> {/* Reduced space-y */}
                        {/* Titre */}
                        <div>
                            <label htmlFor="ticket-titre" className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Titre</label> {/* Reduced margin-bottom */}
                            <input
                                id="ticket-titre"
                                type="text"
                                value={editableData.titre}
                                onChange={(e) => handleEditableDataChange('titre', e.target.value)}
                                className={`form-input w-full ${highlightedFields.titre ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}
                                onBlur={() => setAndClearHighlight('titre')}
                                disabled={isTicketLocked}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="ticket-description" className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Description</label> {/* Reduced margin-bottom */}
                            <textarea
                                id="ticket-description"
                                ref={descriptionTextAreaRef} // Use the ref declared at the top
                                value={editableData.description}
                                onChange={(e) => handleEditableDataChange('description', e.target.value)}
                                className={`form-textarea w-full resize-none overflow-hidden ${highlightedFields.description ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}
                                rows="3"
                                onBlur={() => setAndClearHighlight('description')}
                                disabled={isTicketLocked}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700"> {/* Reduced gap and padding */}
                            {/* Module affecté */}
                            <EditableStyledField
                                icon={<ModuleIcon size={14} className="mr-2" />}
                                label="Module affecté"
                                value={editableData.idModule}
                                isEditable={true}
                                onUpdate={(moduleId) => handleEditableDataChange('idModule', allModules.find(m => m.id === parseInt(moduleId)) || null)}
                                type="select"
                                options={allModules}
                                isHighlighted={highlightedFields.idModule}
                                disabled={isTicketLocked}
                            />

                            {/* Affecté à */}
                            <EditableStyledField
                                icon={<UserCheck size={14} className="mr-2" />}
                                label="Affecté à"
                                value={editableData.idUtilisateur}
                                isEditable={true}
                                onUpdate={(userId) => handleEditableDataChange('idUtilisateur', allUsers.find(u => u.id === parseInt(userId)) || null)}
                                type="select"
                                options={allUsers}
                                isHighlighted={highlightedFields.idUtilisateur}
                                disabled={isTicketLocked}
                            />

                            {/* Date d'échéance */}
                            <EditableStyledField
                                icon={<Calendar size={14} className="mr-2" />}
                                label="Date d'échéance"
                                value={editableData.date_echeance}
                                isEditable={true}
                                onUpdate={(dateArray) => handleEditableDataChange('date_echeance', dateArray)}
                                type="date"
                                isHighlighted={highlightedFields.date_echeance}
                                disabled={isTicketLocked}
                            />
                        </div>
                    </div>

                    {/* Right Column - Badges and non-editable details */}
                    <div className="flex-shrink-0 lg:w-1/3 space-y-3 pt-3 lg:pt-0 lg:pl-4 lg:border-l lg:border-slate-200 lg:dark:border-slate-700"> {/* Reduced space-y and padding */}
                        {/* Priority, Status, Active - Editable badges */}
                        <div className="grid grid-cols-1 gap-3"> {/* Reduced gap */}
                            <DetailItem
                                icon={<Tag size={14} className="mr-2" />}
                                label="Priorité"
                                isHighlighted={highlightedFields.priorite}
                            >
                                <PriorityDisplay
                                    priority={editableData.priorite}
                                    isEditable={true}
                                    onUpdate={(value) => { handleEditableDataChange('priorite', value); setAndClearHighlight('priorite'); }}
                                    disabled={isTicketLocked}
                                />
                            </DetailItem>
                            <DetailItem
                                icon={<Info size={14} className="mr-2" />}
                                label="Statut"
                                isHighlighted={highlightedFields.statue}
                            >
                                <StatusDisplay
                                    status={editableData.statue}
                                    isEditable={true}
                                    onUpdate={(value) => { handleEditableDataChange('statue', value); setAndClearHighlight('statue'); }}
                                    disabled={isTicketLocked}
                                />
                            </DetailItem>
                            <DetailItem
                                icon={<Shield size={14} className="mr-2" />}
                                label="Actif"
                                isHighlighted={highlightedFields.actif}
                            >
                                <ActifDisplay
                                    actif={editableData.actif}
                                    isEditable={true}
                                    onUpdate={(value) => { handleEditableDataChange('actif', value); setAndClearHighlight('actif'); }}
                                    disabled={isTicketLocked}
                                />
                            </DetailItem>
                        </div>
                        
                        {/* Non-editable details */}
                        <div className="pt-3 space-y-3 border-t border-slate-200 dark:border-slate-700"> {/* Reduced padding and space-y */}
                            <DetailItem icon={<User size={14} className="mr-2" />} label="Client" value={ticket.idClient?.nomComplet} />
                            <DetailItem icon={<User size={14} className="mr-2" />} label="Créé par" value={ticket.userCreation} />
                            <DetailItem icon={<Calendar size={14} className="mr-2" />} label="Date de création" value={formatDate(ticket.dateCreation)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Conditional Sections: Sub-tickets, Documents, Comments */}
            {hasSubTickets ? (
                // If parent ticket with sub-tickets, render sub-tickets table, and docs/comments side-by-side
                <>
                    <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg"> {/* Reduced margin-top */}
                        <div
                            className="flex justify-between items-center p-3 cursor-pointer border-b border-slate-200 dark:border-slate-700" 
                            onClick={() => setIsCommentsAndDocsCollapsed(!isCommentsAndDocsCollapsed)}
                        >
                            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center"> {/* Reduced font size */}
                                <MessageSquare size={18} className="mr-2" />
                                <span className="mr-1">Commentaires</span>
                                <span className="text-slate-400 dark:text-slate-500">({ticket.commentaireList?.length || 0})</span>
                                <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                                <FileText size={18} className="mr-2" />
                                <span className="mr-1">Documents</span>
                                <span className="text-slate-400 dark:text-slate-500">({ticket.documentJointesList?.length || 0})</span>
                            </h2>
                            <button
                                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400" 
                                title={isCommentsAndDocsCollapsed ? "Afficher" : "Masquer"}
                            >
                                {isCommentsAndDocsCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                            </button>
                        </div>

                        {!isCommentsAndDocsCollapsed && (
                            <div className="grid grid-cols-1 lg:grid-cols-5">
                                <div className="lg:col-span-3 p-4 lg:border-r lg:border-slate-200 lg:dark:border-slate-700"> {/* Reduced padding */}
                                    <CommentManager
                                        ticketId={ticket.id}
                                        comments={ticket.commentaireList}
                                        onCommentChange={fetchInitialData}
                                        setToast={setToast}
                                        userId={userId}
                                    />
                                </div>
                                <div className="lg:col-span-2 p-4"> {/* Reduced padding */}
                                    <DocumentManager
                                        ticketId={ticket.id}
                                        documents={ticket.documentJointesList}
                                        onDocumentChange={fetchInitialData}
                                        setToast={setToast}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6"> {/* Reduced margin-top */}
                        <SubTicketsTable
                            subTickets={ticket.childTickets}
                            onAdd={() => setIsDiffractionModalOpen(true)}
                            onSaveSubTicket={handleSaveSubTicket}
                            onDelete={handleDeleteSubTicket}
                            allModules={allModules}
                            allUsers={allUsers}
                            onRemoveModule={handleRemoveSubTicketModule}
                            onRefreshTicketData={fetchInitialData}
                            currentUserId={userId}
                            setToast={setToast}
                        />
                    </div>
                </>
            ) : (
                // If no sub-tickets, or it's a sub-ticket, stack documents and comments
                <div className="mt-6 space-y-4"> {/* Reduced margin-top and space-y */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg"> {/* Reduced padding */}
                        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center"> {/* Reduced font size and margin-bottom */}
                            <FileText size={18} className="mr-2" /> Documents
                            <span className="ml-2 text-slate-400 dark:text-slate-500">({ticket.documentJointesList?.length || 0})</span>
                        </h2>
                        <DocumentManager
                            ticketId={ticket.id}
                            documents={ticket.documentJointesList}
                            onDocumentChange={fetchInitialData}
                            setToast={setToast}
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg"> {/* Reduced padding */}
                        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center"> {/* Reduced font size and margin-bottom */}
                            <MessageSquare size={18} className="mr-2" /> Commentaires
                            <span className="ml-2 text-slate-400 dark:text-slate-500">({ticket.commentaireList?.length || 0})</span>
                        </h2>
                        <CommentManager
                            ticketId={ticket.id}
                            comments={ticket.commentaireList}
                            onCommentChange={fetchInitialData}
                            setToast={setToast}
                            userId={userId}
                        />
                    </div>
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