// src/components/chefEquipe/TicketRow.jsx
import React, { useState, useRef } from 'react';
import { Edit, UserPlus, XCircle, ChevronDown, MessageSquare, Paperclip, Send, Trash2, Download } from 'lucide-react';

// --- Sous-composants visuels ---
const getProfileImageUrl = (user) => user?.photo ? `data:image/jpeg;base64,${user.photo}` : `https://i.pravatar.cc/150?u=${user?.id || 'default'}`;

const PriorityIndicator = ({ priority }) => {
    const styles = { 'Haute': 'text-red-600', 'Moyenne': 'text-orange-600', 'Basse': 'text-sky-600' };
    return <span className={`font-medium ${styles[priority] || 'text-slate-500'}`}>{priority || 'N/A'}</span>;
};

const StatusBadge = ({ status }) => {
    const styles = {
        'En_attente': 'bg-blue-100 text-blue-700', 'En_cours': 'bg-yellow-100 text-yellow-700',
        'Accepte': 'bg-cyan-100 text-cyan-700', 'Termine': 'bg-emerald-100 text-emerald-700',
        'Refuse': 'bg-red-100 text-red-700',
    };
    const formattedStatus = status ? status.replace('_', ' ') : 'N/A';
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-slate-100 text-slate-700'}`}>{formattedStatus}</span>;
};

// --- Section détaillée qui s'affiche au dépliage ---
const TicketDetailView = ({ ticket, currentUser, onAddComment, onDeleteComment, onUploadFile, onDeleteFile, onDownloadFile }) => {
    const [newComment, setNewComment] = useState('');
    const fileInputRef = useRef(null);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;
        onAddComment({ commentaire: newComment, idTicket: ticket.id, idUtilisateur: currentUser.id });
        setNewComment('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) onUploadFile(file, ticket.id);
    };

    return (
        <td colSpan="9" className="p-0">
            <div className="bg-slate-100/80 p-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div>
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><MessageSquare size={18} /> Commentaires</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 border-b pb-3">
                        {(ticket.commentaireList || []).length > 0 ? ticket.commentaireList.map(comment => (
                            <div key={comment.id} className="text-sm">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-slate-800">{comment.utilisateur?.prenom} {comment.utilisateur?.nom}</p>
                                    {currentUser?.id === comment.utilisateur?.id && (
                                        // --- CORRECTION : Ajout de ticket.id à l'appel ---
                                        <button onClick={() => onDeleteComment(comment.id, ticket.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                                    )}
                                </div>
                                <p className="text-slate-600 whitespace-pre-wrap">{comment.commentaire}</p>
                                <p className="text-xs text-slate-400 mt-1">{new Date(comment.dateCreation).toLocaleString('fr-FR')}</p>
                            </div>
                        )) : <p className="text-sm text-slate-500 italic">Aucun commentaire.</p>}
                    </div>
                    <form onSubmit={handleCommentSubmit} className="mt-3 flex gap-2">
                        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Ajouter un commentaire..." className="form-input flex-grow text-sm" />
                        <button type="submit" className="btn btn-primary p-2.5" disabled={!newComment.trim()}><Send size={16} /></button>
                    </form>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Paperclip size={18} /> Pièces Jointes</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 border-b pb-3">
                        {(ticket.documentJointesList || []).length > 0 ? ticket.documentJointesList.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between bg-white p-2 rounded-md border">
                                <p className="text-sm text-slate-700 truncate mr-2">{doc.nomDocument}.{doc.extension}</p>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => onDownloadFile(doc.id, doc.nomDocument)} className="p-1.5 text-slate-500 hover:text-blue-600"><Download size={16} /></button>
                                    <button onClick={() => onDeleteFile(doc.id)} className="p-1.5 text-slate-500 hover:text-red-600"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        )) : <p className="text-sm text-slate-500 italic">Aucune pièce jointe.</p>}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary-outline btn-sm w-full mt-3">Ajouter un fichier</button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>
            </div>
        </td>
    );
};

// --- Composant principal de la ligne ---
const TicketRow = ({ ticket, actions, ...detailHandlers }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const formatDate = (dateArray) => {
        if (!dateArray || !Array.isArray(dateArray)) return 'N/A';
        try { return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString('fr-FR'); }
        catch { return 'Date invalide'; }
    };

    return (
        <>
            <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="p-4 text-sm font-medium text-slate-800 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-3">
                        <img src={getProfileImageUrl(ticket.idClient)} alt="" className="w-9 h-9 rounded-md object-cover" />
                        <div><p>{ticket.idClient?.nomComplet || 'N/A'}</p><p className="text-xs text-slate-500">Réf: {ticket.ref}</p></div>
                    </div>
                </td>
                <td className="p-4 text-sm text-slate-600">{ticket.userCreation || 'N/A'}</td>
                <td className="p-4 text-sm text-slate-800 font-semibold">{ticket.titre}</td>
                <td className="p-4 text-sm text-slate-600">{ticket.idModule?.designation || 'N/A'}</td>
                <td className="p-4 text-sm text-slate-600">{ticket.idUtilisateur && ticket.idUtilisateur !== 0 ? `${ticket.idUtilisateur.prenom} ${ticket.idUtilisateur.nom}` : <span className="italic text-slate-400">Non assigné</span>}</td>
                <td className="p-4 text-sm text-slate-600">{formatDate(ticket.dateCreation)}</td>
                <td className="p-4 text-sm"><PriorityIndicator priority={ticket.priorite} /></td>
                <td className="p-4 text-sm"><StatusBadge status={ticket.statue} /></td>
                <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-1">
                        {actions}
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-md">
                            <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </td>
            </tr>
            {isExpanded && <tr className="bg-slate-50"><TicketDetailView ticket={ticket} {...detailHandlers} /></tr>}
        </>
    );
};

export default TicketRow;