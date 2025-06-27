// src/components/admin/Tickets/CommentManager.jsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, PlusCircle, Edit, Trash2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import commentService from '../../../services/commentService';
import { formatDate } from '../../../utils/dateFormatter'; // Assurez-vous que le chemin est correct

// Composant utilitaire pour le spinner (si non déjà globalement défini)
const Spinner = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>;

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

const CommentManager = ({ ticketId, comments: initialComments, onCommentChange, showTemporaryMessage }) => {
    const [comments, setComments] = useState(initialComments || []);
    const [newCommentText, setNewCommentText] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false); // État pour masquer/afficher le bloc

    const newCommentTextAreaRef = useRef(null);
    useAutosizeTextArea(newCommentTextAreaRef, newCommentText);

    useEffect(() => {
        setComments(initialComments || []);
    }, [initialComments]);

    // L'ID de l'utilisateur est géré côté backend (Helper.getUserAuthenticated())
    // donc pas besoin de le passer depuis le frontend dans le payload addComment/updateComment
    const handleAddComment = async () => {
        if (newCommentText.trim() === '') {
            if (showTemporaryMessage) showTemporaryMessage('warning', 'Le commentaire ne peut pas être vide.');
            return;
        }
        setIsAdding(true);
        try {
            // Le backend `dateCommentaire` et `idUtilisateur` sont gérés automatiquement
            await commentService.addComment({ commentaire: newCommentText, idTicket: ticketId });
            if (showTemporaryMessage) showTemporaryMessage('success', 'Commentaire ajouté avec succès.');
            setNewCommentText('');
            onCommentChange(); // Demande au parent de rafraîchir toutes les données du ticket
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
            // Le backend `dateCommentaire` et `idUtilisateur` sont gérés automatiquement
            await commentService.updateComment(commentId, { commentaire: editingCommentText, idTicket: ticketId });
            if (showTemporaryMessage) showTemporaryMessage('success', 'Commentaire modifié avec succès.');
            setEditingCommentId(null);
            setEditingCommentText('');
            onCommentChange(); // Demande au parent de rafraîchir
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
                onCommentChange(); // Demande au parent de rafraîchir
            } catch (error) {
                console.error("Erreur lors de la suppression du commentaire:", error);
                const errorMessage = error.response?.data?.message || "Erreur lors de la suppression du commentaire.";
                if (showTemporaryMessage) showTemporaryMessage('error', errorMessage);
            }
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 flex items-center">
                    <MessageSquare size={20} className="mr-2" /> Commentaires ({comments?.length || 0})
                </h2>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                    title={isCollapsed ? "Afficher les commentaires" : "Masquer les commentaires"}
                >
                    {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
            </div>

            {!isCollapsed && (
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
                                className="btn btn-primary-sm"
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
                                                                className="p-1.5 text-green-500 hover:text-green-700"
                                                                title="Enregistrer"
                                                            ><Check size={16}/></button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="p-1.5 text-slate-500 hover:text-slate-700"
                                                                title="Annuler"
                                                            ><X size={16}/></button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditClick(comment)}
                                                                className="p-1.5 text-slate-500 hover:text-blue-500"
                                                                title="Modifier"
                                                            ><Edit size={16}/></button>
                                                            <button
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className="p-1.5 text-slate-500 hover:text-red-500"
                                                                title="Supprimer"
                                                            ><Trash2 size={16}/></button>
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
                        <p className="text-center text-slate-500 dark:text-slate-400 italic">Aucun commentaire pour ce ticket.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default CommentManager;