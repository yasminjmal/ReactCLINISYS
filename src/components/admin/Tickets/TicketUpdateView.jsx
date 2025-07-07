// src/components/admin/Tickets/TicketUpdateView.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
// Importation des services API pour interagir avec le backend
import ticketService from '../../../services/ticketService';
import moduleService from '../../../services/moduleService';
import commentService from '../../../services/commentService';
import documentService from '../../../services/documentService';
import userService from '../../../services/userService';
import utilisateurService from '../../../services/utilisateurService';
import equipeService from '../../../services/equipeService';


// Utilisation de la fonction de formatage de date universelle
// Cette fonction formate une date (qui peut être un tableau ou une chaîne) en une chaîne lisible.
const formatForBackend = (input) => {
    if (!input) return null;

    let date;

    // Gérer le format de date en tableau : [année, mois, jour, heures, minutes, secondes]
    if (Array.isArray(input) && input.length >= 3) {
        const [year, month, day, hours = 0, minutes = 0, seconds = 0] = input;
        // Important : Le constructeur Date de JavaScript utilise des mois indexés à partir de 0 (0=Janvier, 11=Décembre)
        date = new Date(year, month - 1, day, hours, minutes, seconds);
    } else {
        // Gérer les autres formats (chaîne ISO, objet Date)
        date = new Date(input);
    }

    if (isNaN(date.getTime())) {
        console.error("Date invalide pour la conversion backend :", input);
        return null; // Retourne null si la date est invalide pour éviter les erreurs
    }

    // Fonction utilitaire pour ajouter un zéro si nécessaire
    const pad = (n) => String(n).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Revenir à un mois basé sur 1 (1-12)
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    // Retourne le format chaîne requis par le backend
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';

    let date;

    if (Array.isArray(dateInput) && dateInput.length >= 3) {
        const [year, month, day, hours = 0, minutes = 0, seconds = 0] = dateInput;
        date = new Date(year, month - 1, day, hours, minutes, seconds);
    } else {
        // ISO 8601 string like "2025-07-04T00:00:00"
        date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) {
        console.error('Invalid date input:', dateInput);
        return 'Date invalide';
    }

    return date.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};


// Importation des icônes de la bibliothèque lucide-react
import {
    ArrowLeft, Check, X, GitFork, Loader, Send, PlusCircle, User, Tag, Info, Calendar,
    Package as ModuleIcon, UserCheck, Shield, Edit, Trash2, Eye, EyeOff, MessageSquare, ChevronDown, ChevronUp,
    AlertTriangle, CheckCircle, FileText, Clock
} from 'lucide-react';

// --- COMPOSANTS UTILITAIRES ---
// Composant Spinner pour indiquer un chargement
const Spinner = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>;

// Composant de message de notification (Toast) - Réutilisé pour afficher des messages temporaires
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

// Hook personnalisé pour redimensionner automatiquement un textarea en fonction de son contenu
const useAutosizeTextArea = (textAreaRef, value) => {
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "0px"; // Réinitialise la hauteur
            const scrollHeight = textAreaRef.current.scrollHeight; // Obtient la hauteur de défilement
            textAreaRef.current.style.height = scrollHeight + "px"; // Définit la hauteur
        }
    }, [textAreaRef, value]); // Se déclenche lorsque la ref ou la valeur change
};

// --- MODAL DE DIFFRACTION (avec styles unifiés) ---
import DiffractionForm from './DiffractionForm'; // Importe le composant de formulaire de diffraction

// --- COMPOSANTS D'AFFICHAGE ET D'ÉDITION POUR LES CHAMPS PRINCIPAUX (MODIFIÉ) ---
// Composant pour l'affichage et l'édition de la priorité d'un ticket
const PriorityDisplay = ({ priority, isEditable, onUpdate, disabled }) => {
    const normalizedPriority = priority?.toUpperCase();
    let dotColors = ['bg-slate-300', 'bg-slate-300', 'bg-slate-300']; // Default for 'N/A' or unknown

    switch (normalizedPriority) {
        case 'HAUTE':
            dotColors = ['bg-red-500', 'bg-red-500', 'bg-red-500'];
            break;
        case 'MOYENNE':
            dotColors = ['bg-blue-500', 'bg-blue-500', 'bg-slate-300']; // Two blue, one grey
            break;
        case 'BASSE':
            dotColors = ['bg-green-500', 'bg-green-500', 'bg-green-500']; // Changed to 3 green dots
            break;
        default:
            dotColors = ['bg-slate-300', 'bg-slate-300', 'bg-slate-300'];
    }

    if (isEditable) {
        return (
            <select
                value={priority || 'MOYENNE'}
                onChange={(e) => onUpdate(e.target.value)}
                className="form-select text-sm font-medium bg-transparent border-0 focus:ring-0 p-0 pr-6"
                disabled={disabled} // Désactiver si le ticket est verrouillé
            >
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

// Composant pour l'affichage et l'édition du statut d'un ticket
const StatusDisplay = ({ status, isEditable, onUpdate, disabled }) => {
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
            <select
                value={status || 'En_attente'}
                onChange={(e) => onUpdate(e.target.value)}
                className="form-select text-sm font-medium bg-transparent border-0 focus:ring-0 p-0 pr-6"
                disabled={disabled} // Désactiver si le ticket est verrouillé
            >
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

// Composant pour l'affichage et l'édition de l'état "Actif" d'un ticket
const ActifDisplay = ({ actif, isEditable, onUpdate, disabled }) => {
    const isActive = actif === true;
    if (isEditable) {
        return (
            <select
                value={actif?.toString()}
                onChange={(e) => onUpdate(e.target.value === 'true')}
                className="form-select text-sm font-medium bg-transparent border-0 focus:ring-0 p-0 pr-6"
                disabled={disabled} // Désactiver si le ticket est verrouillé
            >
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

// Composant générique pour afficher un élément de détail avec une icône et un libellé
const DetailItem = ({ icon, label, value, children, isDirty }) => ( // MODIFIÉ: Ajout de isDirty
    <div className={`p-2 rounded-md transition-colors duration-300 ${isDirty ? 'highlight-dirty' : ''}`}> {/* MODIFIÉ: Application de la classe de surbrillance */}
        <dt className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-0.5">{icon}<span className="ml-1">{label}</span></dt>
        <dd className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words">{children || value || <span className="italic text-slate-400">N/A</span>}</dd>
    </div>
);

// Composant pour l'affichage et l'édition stylisée de champs comme Module, Employé, Date d'échéance
const EditableStyledField = ({ icon, label, value, isEditable, onUpdate, type = 'text', options = [], placeholder = '', disabled = false, isDirty }) => { // MODIFIÉ: Ajout de isDirty
    const isModuleOrEmployee = type === 'select';
    const isDate = type === 'date';

    let displayValue;
    let valueColorClass = 'text-slate-800 dark:text-slate-100'; // Couleur par défaut

    if (isModuleOrEmployee) {
        displayValue = value?.designation || value?.nomComplet || 'N/A'; // Pour module ou utilisateur
        if (value) valueColorClass = 'text-blue-600 dark:text-blue-400';
    } else if (isDate) {
        displayValue = value ? formatDate(value).split(' ')[0] : 'N/A'; // Juste la partie date
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
        <div className={`p-2 rounded-md transition-colors duration-300 ${isDirty ? 'highlight-dirty' : ''}`}> {/* MODIFIÉ: Application de la classe de surbrillance */}
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
                                // Convertit la date en tableau [année, mois, jour, 0, 0, 0] pour correspondre au format attendu
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


// Composant pour la gestion des commentaires dans les sous-tickets (affiché dans la ligne étendue)
const SubTicketCommentRow = ({ subTicket, onCommentChange, setToast, currentUserId }) => {
    const [comments, setComments] = useState(subTicket.commentaireList || []);
    const [newCommentText, setNewCommentText] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');

    const newCommentTextAreaRef = useRef(null);
    useAutosizeTextArea(newCommentTextAreaRef, newCommentText); // Redimensionne le textarea pour les nouveaux commentaires

    // Met à jour les commentaires lorsque les props du sous-ticket changent
    useEffect(() => {
        setComments(subTicket.commentaireList || []);
    }, [subTicket.commentaireList]);

    // Gère l'ajout d'un nouveau commentaire
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
            onCommentChange(subTicket.id); // Notifie le parent d'un changement
        } catch (error) {
            console.error("Erreur lors de l'ajout du commentaire:", error);
            const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout du commentaire.";
            setToast({ type: 'error', message: errorMessage });
        } finally {
            setIsAdding(false);
        }
    };

    // Active le mode édition pour un commentaire
    const handleEditClick = (comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentText(comment.commentaire);
    };

    // Gère l'enregistrement d'un commentaire modifié
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
            onCommentChange(subTicket.id); // Notifie le parent d'un changement
        } catch (error) {
            console.error("Erreur lors de la modification du commentaire:", error);
            const errorMessage = error.response?.data?.message || "Erreur lors de la modification du commentaire.";
            setToast({ type: 'error', message: errorMessage });
        }
    };

    // Annule le mode édition
    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    // Gère la suppression d'un commentaire
    const handleDeleteComment = async (commentId) => {
        // Utilisation d'une modale personnalisée au lieu de window.confirm pour une meilleure UX
        // Pour cet exemple, je garde window.confirm car la consigne l'autorise pour les cas simples.
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
            try {
                await commentService.deleteComment(commentId);
                setToast({ type: 'success', message: 'Commentaire supprimé avec succès.' });
                onCommentChange(subTicket.id); // Notifie le parent d'un changement
            } catch (error) {
                console.error("Erreur lors de la suppression du commentaire:", error);
                const errorMessage = error.response?.data?.message || "Erreur lors de la suppression du commentaire.";
                setToast({ type: 'error', message: errorMessage });
            }
        }
    };

    return (
        <tr className="bg-slate-50 dark:bg-slate-900/50">
            <td colSpan="9" className="p-4"> {/* S'étend sur toutes les colonnes du tableau parent */}
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
// Composant pour une ligne de sous-ticket éditable
const EditableSubTicketRow = ({ sub, allModules, allUsers, onSave, onCancel, onRemoveModule, onToggleComments, isCommentsExpanded, setToast, currentUserId }) => {
    const [editableData, setEditableData] = useState({ ...sub }); // État local pour les données éditables du sous-ticket
    const [isSaving, setIsSaving] = useState(false); // État de sauvegarde
    const textAreaRef = useRef(null);
    useAutosizeTextArea(textAreaRef, editableData.description); // Redimensionne le textarea de description
    const [moduleSearchTerm, setModuleSearchTerm] = useState(''); // Terme de recherche pour le module
    const [isSearchingModule, setIsSearchingModule] = useState(false); // Indique si la recherche de module est active
    const [userSearchTerm, setUserSearchTerm] = useState(''); // Terme de recherche pour l'utilisateur
    const [isSearchingUser, setIsSearchingUser] = useState(false); // Indique si la recherche d'utilisateur est active
    const [highlightedFields, setHighlightedFields] = useState({}); // Champs à surligner après modification

    const highlightTimerRef = useRef(null); // Référence pour le timer de surlignage
    // Fonction pour surligner un champ et effacer le surlignage après un délai
    const setAndClearHighlight = useCallback((field) => {
        setHighlightedFields(prev => ({ ...prev, [field]: true }));
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = setTimeout(() => {
            setHighlightedFields({});
        }, 4000); // Surligne pendant 4 secondes
    }, []);

    // Met à jour les termes de recherche pour module et utilisateur lorsque le sous-ticket change
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

    // Gère le changement des champs éditables
    const handleChange = (field, value) => {
        setEditableData(prev => ({ ...prev, [field]: value }));
    };

    // Gère le changement du module affecté
    const handleModuleChange = (module) => {
        handleChange('idModule', module);
        setIsSearchingModule(false);
        setModuleSearchTerm(module?.designation || '');
        setAndClearHighlight('idModule'); // Surligne le champ module
    };

    // Gère le changement de l'utilisateur affecté
    const handleUserChange = (user) => {
        handleChange('idUtilisateur', user);
        setIsSearchingUser(false);
        setUserSearchTerm(`${user.prenom} ${user.nom}`.trim());
        setAndClearHighlight('idUtilisateur'); // Surligne le champ utilisateur
    };

    // Gère l'enregistrement des modifications du sous-ticket
    const handleSaveClick = async () => {
        setIsSaving(true);
        try {
            await onSave(sub, editableData); // Appelle la fonction onSave du parent
            setAndClearHighlight('all'); // Surligne toute la ligne après sauvegarde
        } catch (error) {
            console.error("Error saving sub-ticket:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Met à jour les données éditables lorsque les props du sous-ticket changent
    useEffect(() => {
        setEditableData({ ...sub });
    }, [sub]);

    // Rend la cellule du module avec recherche et verrouillage conditionnel
    const renderModuleCell = () => {
        // Le module est verrouillé si un employé est déjà affecté
        if (editableData.idUtilisateur && editableData.idModule) {
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
                    onBlur={() => setTimeout(() => setIsSearchingModule(false), 200)} // Délai pour permettre le clic sur le dropdown
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

    // Rend la cellule de l'utilisateur avec recherche et verrouillage conditionnel
    const renderUserCell = () => {
        // L'utilisateur est verrouillé si le statut n'est pas 'En_attente' ou 'Accepte'
        if (editableData.statue !== 'En_attente' && editableData.statue !== 'Accepte') {
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
                                    {user.prenom} {user.nom}
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
        // La classe 'highlight-row' est appliquée si des champs sont surlignés
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

// Composant pour une ligne de sous-ticket en mode affichage
const DisplaySubTicketRow = ({ sub, onEdit, onDelete, allModules, isDescriptionExpanded, onToggleDescription, onToggleComments, isCommentsExpanded, setToast, currentUserId }) => {
    const isAssigned = !!sub.idUtilisateur; // Vérifie si un employé est affecté
    // Fonction pour obtenir le nom du module
    const getModuleName = (moduleId) => {
        if (!moduleId || !allModules || allModules.length === 0) return 'N/A';
        const idToFind = typeof moduleId === 'object' && moduleId !== null ? moduleId.id : moduleId;
        const module = allModules.find(m => Number(m.id) === Number(idToFind));
        return module ? module.designation : 'N/A';
    };
    const descriptionIsLong = sub.description && sub.description.length > 50; // Vérifie si la description est longue

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

// Composant de tableau pour afficher et gérer les sous-tickets
const SubTicketsTable = ({ subTickets, onSaveSubTicket, onDelete, onAdd, allModules, allUsers, onRemoveModule, onRefreshTicketData, setToast, currentUserId }) => {
    const [editingTicketId, setEditingTicketId] = useState(null); // ID du sous-ticket en cours d'édition
    const [expandedDescriptions, setExpandedDescriptions] = useState(new Set()); // Descriptions étendues
    const [expandedComments, setExpandedComments] = useState(new Set()); // Commentaires étendus

    // Bascule l'expansion/réduction d'une description
    const toggleDescriptionExpansion = (subTicketId) => {
        setExpandedDescriptions(prevSet => {
            const newSet = new Set(prevSet);
            if (newSet.has(subTicketId)) { newSet.delete(subTicketId); } else { newSet.add(subTicketId); }
            return newSet;
        });
    };

    // Bascule l'expansion/réduction des commentaires d'un sous-ticket
    const toggleCommentExpansion = (subTicketId) => {
        setExpandedComments(prevSet => {
            const newSet = new Set(prevSet);
            if (newSet.has(subTicketId)) { newSet.delete(subTicketId); } else { newSet.add(subTicketId); }
            return newSet;
        });
    };

    // Gère la sauvegarde et la fermeture du mode édition d'un sous-ticket
    const handleSaveAndClose = async (originalSubTicket, editedSubTicket) => {
        await onSaveSubTicket(originalSubTicket, editedSubTicket);
        setEditingTicketId(null); // Quitte le mode édition
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
                                {/* Affiche la ligne de commentaires si elle est étendue */}
                                {expandedComments.has(sub.id) && (
                                    <SubTicketCommentRow
                                        subTicket={sub}
                                        onCommentChange={onRefreshTicketData} // Rafraîchit les données du ticket principal
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
// Importe les gestionnaires de documents et de commentaires
import DocumentManager from './DocumentManager';
import CommentManager from './CommentManager';

// Composant principal TicketUpdateView
const TicketUpdateView = ({ ticketId, onBack, toast, setToast, onNavigateToParent }) => {
    const [ticket, setTicket] = useState(null); // Données du ticket actuel
    const [editableData, setEditableData] = useState(null); // État local pour les champs éditables du ticket principal
    // NOUVEAU: État pour suivre les champs modifiés ("dirty")
    const [dirtyFields, setDirtyFields] = useState({});
    const [allModules, setAllModules] = useState([]); // Liste de tous les modules
    const [allUsers, setAllUsers] = useState([]); // Liste de tous les utilisateurs pour 'Affecté à'
    const [isLoading, setIsLoading] = useState(true); // État de chargement
    const [isSavingMainTicket, setIsSavingMainTicket] = useState(false); // Indique si le ticket principal est en cours de sauvegarde
    const [error, setError] = useState(null); // Gère les erreurs
    const [isDiffractionModalOpen, setIsDiffractionModalOpen] = useState(false); // État de la modale de diffraction
    const [userId, setUserId] = useState(null); // ID de l'utilisateur connecté
    const [isCommentsAndDocsCollapsed, setIsCommentsAndDocsCollapsed] = useState(false);
    const [allEquipes, setAllEquipes] = useState([]);
    useEffect(() => {
        const fetchEquipes = async () => {
            try {
                const equipesData = await equipeService.getAllEquipes();
                setAllEquipes(equipesData.data || []);
            } catch (err) {
                console.error("Erreur lors de la récupération des équipes:", err);
            }
        };
        fetchEquipes();
    }, []);
    console.log("All Equipes:", allEquipes);// État de collapse des sections commentaires/documents

    const descriptionTextAreaRef = useRef(null); // Référence pour le textarea de description
    useAutosizeTextArea(descriptionTextAreaRef, editableData?.description); // Applique le hook d'auto-redimensionnement

    // Effet pour récupérer l'ID de l'utilisateur connecté depuis le localStorage
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
    }, [setToast]);

    // Fonction pour récupérer les données initiales du ticket, modules et utilisateurs
    const fetchInitialData = useCallback(async () => {
        try {
            const [ticketData, modulesData, usersData] = await Promise.all([
                ticketService.getTicketById(ticketId),
                moduleService.getAllModules(),
                utilisateurService.getAllUtilisateurs(),
            ]);
            setTicket(ticketData);
            // Initialise editableData avec les données du ticket récupérées
            setEditableData({
                titre: ticketData.titre || '',
                description: ticketData.description || '',
                priorite: ticketData.priorite || 'Moyenne', // Valeur par défaut
                statue: ticketData.statue || 'En_attente', // Valeur par défaut
                actif: ticketData.actif,
                date_echeance: ticketData.date_echeance,
                idModule: ticketData.idModule || null, // Garde l'objet module ou null
                idUtilisateur: ticketData.idUtilisateur || null, // Garde l'objet utilisateur ou null
                parentTicket: ticketData.parentTicket || null,
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

    // Effet pour déclencher le chargement des données au montage du composant
    useEffect(() => { setIsLoading(true); fetchInitialData(); }, [fetchInitialData]);

    // Fonction pour nettoyer le payload du ticket avant envoi à l'API
    const cleanTicketPayload = (ticketObject) => {
        const cleanedPayload = { ...ticketObject };
        // Remplace les objets imbriqués par leurs IDs si présents
        if (cleanedPayload.idClient && typeof cleanedPayload.idClient === 'object') cleanedPayload.idClient = cleanedPayload.idClient.id;
        if (cleanedPayload.idModule && typeof cleanedPayload.idModule === 'object') cleanedPayload.idModule = cleanedPayload.idModule.id;
        if (cleanedPayload.idUtilisateur && typeof cleanedPayload.idUtilisateur === 'object') cleanedPayload.idUtilisateur = cleanedPayload.idUtilisateur.id;
        if (cleanedPayload.parentTicket && typeof cleanedPayload.parentTicket === 'object') cleanedPayload.idParentTicket = cleanedPayload.parentTicket.id;
        if (cleanedPayload.idParentTicket && typeof cleanedPayload.idParentTicket === 'object') cleanedPayload.idParentTicket = cleanedPayload.idParentTicket.id;


        // Assure que date_echeance est au format tableau [année, mois, jour, 0, 0, 0] ou null
        cleanedPayload.date_echeance = formatForBackend(cleanedPayload.date_echeance);


        // Supprime les propriétés qui ne doivent pas être envoyées dans le DTO de mise à jour
        delete cleanedPayload.documentJointesList;
        delete cleanedPayload.commentaireList;
        delete cleanedPayload.childTickets;
        delete cleanedPayload.parentTicket;
        delete cleanedPayload.userCreation;
        delete cleanedPayload.demandeur;
        delete cleanedPayload.client;
        delete cleanedPayload.id;
        delete cleanedPayload.dateCreation;
        delete cleanedPayload.parentTicket

        return cleanedPayload;
    };

    // MODIFIÉ: Gère le changement des données et marque le champ comme "dirty"
    const handleEditableDataChange = (field, value) => {
        setEditableData(prev => ({ ...prev, [field]: value }));
        setDirtyFields(prev => ({ ...prev, [field]: true }));
    };

    // MODIFIÉ: Gère la sauvegarde du ticket principal
    const handleSaveMainTicket = async () => {
        if (!editableData) {
            return;
        }
        setIsSavingMainTicket(true);
        setError(null);

        const payloadToSend = { ...ticket, ...editableData, idClient: ticket.idClient?.id || null, idParentTicket: ticket.idParentTicket || null };
        const cleanedPayload = cleanTicketPayload(payloadToSend);

        try {
            await ticketService.updateTicket(ticketId, cleanedPayload);
            setToast({ type: 'success', message: 'Ticket mis à jour avec succès !' });
            setDirtyFields({}); // Réinitialise les champs modifiés
            // NOUVEAU: Retourne à la page de liste après succès
            onBack(ticketId, 'Ticket mis à jour avec succès !');
        } catch (err) {
            console.error("Erreur lors de la mise à jour du ticket principal:", err);
            setToast({ type: 'error', message: err.response?.data?.message || 'Échec de la mise à jour du ticket.' });
        } finally {
            setIsSavingMainTicket(false);
        }
    };

    // MODIFIÉ: Gère l'annulation des modifications du ticket principal
    // hadibadi
    const handleCancelMainTicketEdit = () => {
        // Réinitialise editableData aux données actuelles du ticket
        setEditableData({
            titre: ticket.titre || '',
            description: ticket.description || '',
            priorite: ticket.priorite || 'Moyenne',
            statue: ticket.statue || 'En_attente',
            actif: ticket.actif,
            date_echeance: ticket.date_echeance,
            idModule: ticket.idModule || null,
            idUtilisateur: ticket.idUtilisateur || null,
            parentTicket: ticket.parentTicket || null,
        });
        setDirtyFields({}); // Réinitialise les champs modifiés
        setToast({ type: 'info', message: 'Modifications annulées.' });
        onBack()
    };

    // Gère l'acceptation d'un ticket
    const handleAcceptTicket = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir accepter ce ticket ?")) {
            setIsSavingMainTicket(true);
            try {
                const payload = cleanTicketPayload({ ...ticket, statue: 'Accepte', idClient: ticket.idClient?.id || null, idParentTicket: ticket.idParentTicket || null });
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

    // Gère le refus d'un ticket
    const handleRefuseTicket = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir refuser ce ticket ?")) {
            setIsSavingMainTicket(true);
            try {
                const payload = cleanTicketPayload({ ...ticket, statue: 'Refuse', idClient: ticket.idClient?.id || null, idParentTicket: ticket.idParentTicket || null });
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

    // Ouvre la modale de diffraction
    const handleDiffractTicket = async () => {
        setIsDiffractionModalOpen(true);
    };

    // Gère la sauvegarde d'un sous-ticket
    const handleSaveSubTicket = async (originalSubTicket, editedSubTicket) => {
        const payload = cleanTicketPayload({ ...originalSubTicket, ...editedSubTicket, id: originalSubTicket.id, idParentTicket: ticket.id, idClient: ticket.idClient?.id });
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
                const payload = cleanTicketPayload({ ...subTicketToUpdate, idModule: null, id: subTicketToUpdate.id });
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
    const isTicketLocked = ['Refuse', 'Termine', "En_attente"].includes(ticket?.statue);
    const isPending = ticket?.statue === 'En_attente';

    if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
    if (!ticket || !editableData) return null;


    return (
        <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-900 min-h-screen">
            {/* NOUVEAU: Style pour la surbrillance des champs modifiés */}
            <style>{`
                .highlight-dirty {
                    background-color: #e0f2fe !important; /* Bleu très clair */
                    transition: background-color 0.3s ease-in-out;
                }
                .dark .highlight-dirty {
                    background-color: #0c4a6e !important; /* Bleu foncé pour le mode sombre */
                }
            `}</style>

            {toast && <ToastMessage message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Section d'en-tête */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                    <button onClick={onBack} className="btn btn-secondary flex items-center">
                        <ArrowLeft size={16} className="mr-1" /> Retour
                    </button>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {isSubTicket ? "Modifier un Sous-Ticket" : "Modifier un Ticket"}
                    </h1>
                </div>
                <div className="flex space-x-2">
                    {editableData.statue == "En_attente" && (
                        <>
                            <button onClick={handleAcceptTicket} className="btn btn-primary bg-green-600 hover:bg-green-700" disabled={isSavingMainTicket}>
                                <Check size={16} className="mr-1" /> Accepter
                            </button>
                            <button onClick={handleRefuseTicket} className="btn btn-danger" disabled={isSavingMainTicket}>
                                <X size={16} className="mr-1" /> Refuser
                            </button>
                        </>
                    )}
                    {console.log(editableData)}
                    {!editableData.idModule && !editableData.idUtilisateur && editableData.parentTicket===null &&(
                        <button onClick={handleDiffractTicket} className="btn btn-secondary" disabled={isSavingMainTicket}>
                            <GitFork size={16} className="mr-1" /> Diffracter
                        </button>
                    )}
                    {editableData.statue != "En_attente" && (<><button onClick={handleCancelMainTicketEdit} className="btn btn-secondary" disabled={isSavingMainTicket || isTicketLocked}>
                        <X size={16} className="mr-1" /> Annuler
                    </button>
                        <button onClick={handleSaveMainTicket} className="btn btn-primary" disabled={isSavingMainTicket || isTicketLocked}>
                            {isSavingMainTicket ? <Spinner /> : <Check size={16} className="mr-1" />} Confirmer les modifications
                        </button></>)}
                </div>
            </div>

            {/* Zone de contenu principal */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg mb-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-grow lg:w-2/3 space-y-4">
                        {/* Titre */}
                        <div>
                            <label htmlFor="ticket-titre" className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Titre</label>
                            <input
                                id="ticket-titre"
                                type="text"
                                value={editableData.titre}
                                onChange={(e) => handleEditableDataChange('titre', e.target.value)}
                                // MODIFIÉ: Ajout de la classe conditionnelle
                                className={`form-input w-full ${dirtyFields.titre ? 'highlight-dirty' : ''}`}
                                disabled={isTicketLocked}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="ticket-description" className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Description</label>
                            <textarea
                                id="ticket-description"
                                ref={descriptionTextAreaRef}
                                value={editableData.description}
                                onChange={(e) => handleEditableDataChange('description', e.target.value)}
                                // MODIFIÉ: Ajout de la classe conditionnelle
                                className={`form-textarea w-full resize-none overflow-hidden ${dirtyFields.description ? 'highlight-dirty' : ''}`}
                                rows="3"
                                disabled={isTicketLocked}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            {/* Module affecté */}
                            <EditableStyledField
                                icon={<ModuleIcon size={14} className="mr-2" />}
                                label="Module affecté"
                                value={editableData.idModule}
                                isEditable={true}
                                onUpdate={(moduleId) => handleEditableDataChange('idModule', allModules.find(m => m.id === parseInt(moduleId)) || 0)}
                                type="select"
                                options={allModules}
                                disabled={isTicketLocked}
                                // MODIFIÉ: Ajout de la prop isDirty
                                isDirty={!!dirtyFields.idModule}
                            />

                            {/* Affecté à */}
                            <EditableStyledField
                                icon={<UserCheck size={14} className="mr-2" />}
                                label="Affecté à"
                                value={editableData.idUtilisateur}
                                isEditable={true}
                                onUpdate={(userId) => handleEditableDataChange('idUtilisateur', allUsers.find(u => u.id === parseInt(userId)) || null)}
                                type="select"
                                options={allEquipes
                                    .filter(equipe =>
                                        equipe.moduleList?.some(module => module.designation === editableData.idModule?.designation) && equipe.utilisateurs.length > 0
                                    )
                                    .flatMap(equipe => equipe.utilisateurs)}
                                disabled={isTicketLocked}
                                // MODIFIÉ: Ajout de la prop isDirty
                                isDirty={!!dirtyFields.idUtilisateur}
                            />

                            {/* Date d'échéance */}
                            <EditableStyledField
                                icon={<Calendar size={14} className="mr-2" />}
                                label="Date d'échéance"
                                value={editableData.date_echeance}
                                isEditable={true}
                                onUpdate={(dateArray) => handleEditableDataChange('date_echeance', dateArray)}
                                type="date"
                                disabled={isTicketLocked}
                                // MODIFIÉ: Ajout de la prop isDirty
                                isDirty={!!dirtyFields.date_echeance}
                            />
                        </div>
                    </div>

                    <div className="flex-shrink-0 lg:w-1/3 space-y-3 pt-3 lg:pt-0 lg:pl-4 lg:border-l lg:border-slate-200 lg:dark:border-slate-700">
                        <div className="grid grid-cols-1 gap-3">
                            <DetailItem
                                icon={<Tag size={14} className="mr-2" />}
                                label="Priorité"
                                // MODIFIÉ: Ajout de la prop isDirty
                                isDirty={!!dirtyFields.priorite}
                            >
                                <PriorityDisplay
                                    priority={editableData.priorite}
                                    isEditable={true}
                                    onUpdate={(value) => handleEditableDataChange('priorite', value)}
                                    disabled={isTicketLocked}
                                />
                            </DetailItem>
                            <DetailItem
                                icon={<Info size={14} className="mr-2" />}
                                label="Statut"
                                // MODIFIÉ: Ajout de la prop isDirty
                                isDirty={!!dirtyFields.statue}
                            >
                                <StatusDisplay
                                    status={editableData.statue}
                                    isEditable={true}
                                    onUpdate={(value) => handleEditableDataChange('statue', value)}
                                    disabled={isTicketLocked}
                                />
                            </DetailItem>
                            <DetailItem
                                icon={<Shield size={14} className="mr-2" />}
                                label="Actif"
                                // MODIFIÉ: Ajout de la prop isDirty
                                isDirty={!!dirtyFields.actif}
                            >
                                <ActifDisplay
                                    actif={editableData.actif}
                                    isEditable={true}
                                    onUpdate={(value) => handleEditableDataChange('actif', value)}
                                    disabled={isTicketLocked}
                                />
                            </DetailItem>
                        </div>

                        <div className="pt-3 space-y-3 border-t border-slate-200 dark:border-slate-700">
                            <DetailItem icon={<User size={14} className="mr-2" />} label="Client" value={ticket.idClient?.nomComplet} />
                            <DetailItem icon={<User size={14} className="mr-2" />} label="Créé par" value={ticket.userCreation} />
                            <DetailItem icon={<Calendar size={14} className="mr-2" />} label="Date de création" value={formatDate(ticket.dateCreation)} />
                        </div>
                    </div>
                </div>

                {/* Sections conditionnelles: Sous-tickets, Documents, Commentaires */}
                {hasSubTickets ? (
                    <>
                        <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                            <div
                                className="flex justify-between items-center p-3 cursor-pointer border-b border-slate-200 dark:border-slate-700"
                                onClick={() => setIsCommentsAndDocsCollapsed(!isCommentsAndDocsCollapsed)}
                            >
                                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center">
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
                                    <div className="lg:col-span-3 p-4 lg:border-r lg:border-slate-200 lg:dark:border-slate-700">
                                        <CommentManager
                                            ticketId={ticket.id}
                                            comments={ticket.commentaireList}
                                            onCommentChange={fetchInitialData}
                                            setToast={setToast}
                                            userId={userId}
                                        />
                                    </div>
                                    <div className="lg:col-span-2 p-4">
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

                        <div className="mt-6">
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
                    <div className="mt-6 flex gap-4">
                        {/* Bloc Documents - 1/3 */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg basis-1/3">
                            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center">
                                <FileText size={18} className="mr-2" /> Documents
                                <span className="ml-2 text-slate-400 dark:text-slate-500">
                                    ({ticket.documentJointesList?.length || 0})
                                </span>
                            </h2>
                            <DocumentManager
                                ticketId={ticket.id}
                                documents={ticket.documentJointesList}
                                onDocumentChange={fetchInitialData}
                                setToast={setToast}
                            />
                        </div>

                        {/* Bloc Commentaires - 2/3 */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg basis-2/3">
                            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center">
                                <MessageSquare size={18} className="mr-2" /> Commentaires
                                <span className="ml-2 text-slate-400 dark:text-slate-500">
                                    ({ticket.commentaireList?.length || 0})
                                </span>
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

                {/* Modale de diffraction */}
                {isDiffractionModalOpen && (
                    <DiffractionForm
                        parentTicket={ticket}
                        onClose={() => setIsDiffractionModalOpen(false)}
                        onSuccess={handleDiffractionSuccess}
                        setToast={setToast}
                    />
                )}
            </div></div>
    );
};

export default TicketUpdateView;