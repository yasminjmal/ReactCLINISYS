// src/components/admin/Tickets/CommentManager.jsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, PlusCircle, Edit, Trash2, Check, X, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from 'lucide-react'; // Ajout AlertTriangle, CheckCircle pour ToastMessage
import commentService from '../../../services/commentService';
import { formatDateFromArray } from '../../../utils/dateFormatterTicket';
import userService from '../../../services/userService'; // Assurez-vous que cette fonction existe et est correcte


// Composant utilitaire pour le spinner
const Spinner = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>; // Couleur ajustée
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

// Composant de message de notification (Toast) - Réutilisé pour être cohérent
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
            icon = <Info size={20} className="text-white" />; // Si Info n'est pas importé, ajoutez-le ici
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


// Composant pour l'auto-redimensionnement du textarea
const useAutosizeTextArea = (textAreaRef, value) => {
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "0px";
            const scrollHeight = textAreaRef.current.scrollHeight;
            textAreaRef.current.style.height = scrollHeight + "px";
        }
    }, [textAreaRef, value]);
};

const CommentManager = ({ ticketId, comments: initialComments, onCommentChange, setToast }) => { // showTemporaryMessage remplacé par setToast
    const [comments, setComments] = useState(initialComments || []);
    const [newCommentText, setNewCommentText] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [userId, setUserId] = useState(null); // Pour stocker l'ID de l'utilisateur connecté

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('currentUser'));
                const login = storedUser?.login;

                if (!login) {
                    console.warn("Aucun login trouvé dans le localStorage.");
                    return;
                }

                const user = await userService.getUserByLogin(login); // Appel backend
                setUserId(user.id); // Stocker l'ID récupéré
                console.log("Utilisateur récupéré:", userId);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'utilisateur:", error);
                setToast({
                    type: 'error',
                    message: "Erreur lors de la récupération de l'utilisateur.",
                });
            }
        };

        fetchUser(); // Très important
    }, []);


    const newCommentTextAreaRef = useRef(null);
    useAutosizeTextArea(newCommentTextAreaRef, newCommentText);

    useEffect(() => {
        setComments(initialComments || []);
    }, [initialComments]);

    const handleAddComment = async () => {
        if (newCommentText.trim() === '') {
            setToast({ type: 'warning', message: 'Le commentaire ne peut pas être vide.' }); // Utilisation de setToast
            return;
        }
        setIsAdding(true);
        try {
            await commentService.addComment({ commentaire: newCommentText, idTicket: ticketId, idUtilisateur: userId }); // Utilisation de userId
            setToast({ type: 'success', message: 'Commentaire ajouté avec succès.' }); // Utilisation de setToast
            setNewCommentText('');
            onCommentChange();
        } catch (error) {
            console.error("Erreur lors de l'ajout du commentaire:", error);
            const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout du commentaire.";
            setToast({ type: 'error', message: errorMessage }); // Utilisation de setToast
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
            setToast({ type: 'warning', message: 'Le commentaire modifié ne peut pas être vide.' }); // Utilisation de setToast
            return;
        }
        try {
            await commentService.updateComment(commentId, { commentaire: editingCommentText, idTicket: ticketId, idUtilisateur: userId }); // Utilisation de userId
            setToast({ type: 'success', message: 'Commentaire modifié avec succès.' }); // Utilisation de setToast
            setEditingCommentId(null);
            setEditingCommentText('');
            onCommentChange();
        } catch (error) {
            console.error("Erreur lors de la modification du commentaire:", error);
            const errorMessage = error.response?.data?.message || "Erreur lors de la modification du commentaire.";
            setToast({ type: 'error', message: errorMessage }); // Utilisation de setToast
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
                setToast({ type: 'success', message: 'Commentaire supprimé avec succès.' }); // Utilisation de setToast
                onCommentChange();
            } catch (error) {
                console.error("Erreur lors de la suppression du commentaire:", error);
                const errorMessage = error.response?.data?.message || "Erreur lors de la suppression du commentaire.";
                setToast({ type: 'error', message: errorMessage }); // Utilisation de setToast
            }
        }
    };

    return (
        <div >
            <>
                {/* Zone d'ajout de commentaire */}
                <div className="mb-6 p-4 border border-slate-300 dark:border-slate-700 rounded-lg">
                    <textarea
                        ref={newCommentTextAreaRef}
                        className="form-textarea w-full text-sm resize-none overflow-hidden"
                        rows="2"
                        placeholder="Ajouter un nouveau commentaire..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        disabled={isAdding}
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={handleAddComment}
                            className="btn btn-primary-sm" // Styles standardisés
                            disabled={isAdding}
                        >
                            {isAdding ? <Spinner /> : <PlusCircle size={16} className="mr-1" />}
                            {isAdding ? 'Ajout...' : 'Ajouter Commentaire'}
                        </button>
                    </div>
                </div>

                {/* Liste des commentaires existants */}
                {comments && comments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium">Commentaire</th>
                                    <th className="px-3 py-2 text-left font-medium">Créé par</th>
                                    <th className="px-3 py-2 text-left font-medium">Date</th>
                                    <th className="px-3 py-2 text-center font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {comments.map(comment => (
                                    <tr key={comment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 align-top">
                                        <td className="px-3 py-2">
                                            {editingCommentId === comment.id ? (
                                                <textarea
                                                    value={editingCommentText}
                                                    onChange={(e) => setEditingCommentText(e.target.value)}
                                                    className="form-textarea w-full text-sm resize-none overflow-hidden"
                                                    rows="2"
                                                />
                                            ) : (
                                                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{comment.commentaire}</p>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                                            {comment.utilisateur?.prenom} {comment.utilisateur?.nom}
                                        </td>
                                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                                            {formatDate(comment.dateCommentaire)}
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center justify-center space-x-1">
                                                {editingCommentId === comment.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveEdit(comment.id)}
                                                            className="p-1.5 text-green-500 hover:text-green-700 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30"
                                                            title="Enregistrer"
                                                        ><Check size={16} /></button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="p-1.5 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900/30"
                                                            title="Annuler"
                                                        ><X size={16} /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditClick(comment)}
                                                            className="p-1.5 text-slate-500 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                            title="Modifier"
                                                        ><Edit size={16} /></button>
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="p-1.5 text-slate-500 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                                                            title="Supprimer"
                                                        ><Trash2 size={16} /></button>
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
                    <p className="text-center text-slate-500 dark:text-slate-400 italic">Aucun commentaire pour ce ticket.</p>)}
            </>
        </div>
    );
};

export default CommentManager;