// src/components/chefEquipe/TicketsATraiterChefPage.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Info, XCircle, Eye, Calendar, ChevronLeft, ChevronRight, UserPlus, MessageSquare, Paperclip, Download, Trash2, Send, Filter, SortAsc, SortDesc } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// --- UTILS ---
const parseDate = (dateInput) => {
    if (!dateInput) return null;
    if (Array.isArray(dateInput)) {
        return new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0, dateInput[5] || 0);
    }
    const date = new Date(dateInput);
    return !isNaN(date.getTime()) ? date : null;
};

const formatDisplayDate = (dateObject, defaultText = 'N/A') => {
    if (dateObject && !isNaN(dateObject.getTime())) {
        return dateObject.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return defaultText;
};

// --- SOUS-COMPOSANTS UI ---

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
    };
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full ${sizeClasses[size]} relative animate-fade-in-up`}>
                <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><XCircle size={22} /></button>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">{title}</h3>
                {children}
            </div>
        </div>
    );
};

const PriorityIndicator = ({ priority }) => {
    const priorityConfig = {
        'Haute': { color: 'bg-red-500', activeCount: 3 },
        'Moyenne': { color: 'bg-blue-500', activeCount: 2 },
        'Basse': { color: 'bg-green-500', activeCount: 1 },
    };
    const config = priorityConfig[priority] || { activeCount: 0 };
    const totalDots = 3;

    return (
        <div className="absolute top-2.5 right-2.5 flex gap-1">
            {Array.from({ length: totalDots }).map((_, index) => (
                <span key={index} className={`w-2 h-2 rounded-full ${index < config.activeCount ? config.color : 'bg-slate-300 dark:bg-slate-600'}`}></span>
            ))}
        </div>
    );
};

const TicketCard = ({ ticket, onOpenModal }) => {
    const dueDate = parseDate(ticket.dateEcheance);
    return (
        <div className="relative rounded-lg shadow-md border p-3 flex flex-col gap-2 transition-all hover:shadow-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-600">
            <PriorityIndicator priority={ticket.priorite} />
            <div className="flex-grow space-y-1.5 text-xs pr-8">
                <p className="font-bold text-slate-800 dark:text-slate-100 truncate"><span className="font-semibold text-slate-500 dark:text-slate-400">Titre : </span>{ticket.titre}</p>
                <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold">Client : </span><strong className="text-slate-700 dark:text-slate-200">{ticket.idClient?.nomComplet || 'N/A'}</strong></p>
                <div className="flex items-center gap-2"><span className="font-semibold">Module :</span><span className="bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 text-xs font-semibold px-2 py-0.5 rounded-full">{ticket.idModule?.designation || 'N/A'}</span></div>
                <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold">Échéance : </span><span className={`font-medium ${dueDate ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 italic'}`}>{formatDisplayDate(dueDate, "Pas d'échéance")}</span></p>
            </div>
            <div className="border-t border-slate-200/80 dark:border-slate-700/80 pt-2 flex items-center justify-between">
                <div className="flex gap-3">
                    <button onClick={() => onOpenModal('comments', ticket)} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline" title="Voir les commentaires"><MessageSquare size={15} /><span>{ticket.commentaireList?.length || 0}</span></button>
                    <button onClick={() => onOpenModal('documents', ticket)} className="flex items-center gap-1.5 text-sm text-green-600 hover:underline" title="Voir les documents"><Paperclip size={15} /><span>{ticket.documentJointesList?.length || 0}</span></button>
                </div>
                <div className="flex items-center"><button onClick={() => onOpenModal('detail', ticket)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50" title="Voir les détails"><Eye size={15}/></button><button onClick={() => onOpenModal('date', ticket)} className="p-1.5 text-slate-500 hover:text-green-600 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50" title="Date d'échéance"><Calendar size={15}/></button><button onClick={() => onOpenModal('assign', ticket)} className="p-1.5 text-slate-500 hover:text-sky-600 rounded-full hover:bg-sky-100 dark:hover:bg-sky-900/50" title="Assigner"><UserPlus size={15}/></button><button onClick={() => onOpenModal('refus', ticket)} className="p-1.5 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title="Refuser"><XCircle size={15}/></button></div>
            </div>
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <nav className="flex justify-center items-center gap-2">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronLeft size={20} /></button>
            {pageNumbers.map(number => (<button key={number} onClick={() => onPageChange(number)} className={`px-4 py-2 rounded-md text-sm font-medium ${currentPage === number ? 'bg-sky-600 text-white' : 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{number}</button>))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronRight size={20} /></button>
        </nav>
    );
};

// --- COMPOSANT PRINCIPAL ---
const TicketsATraiterChefPage = ({ ticketsNonAssignes, equipesDuChef, onAssignerTicketAEmploye, onRefuserTicketParChef, onSetDueDate, currentUser, onAddComment, onDeleteComment, onUploadFile, onDeleteFile, onDownloadFile }) => {
  const [filters, setFilters] = useState({ priority: 'Tous', module: 'Tous' });
  const [sortConfig, setSortConfig] = useState({ key: 'dateCreation', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const TICKETS_PER_PAGE = 9;
  
  const [modalState, setModalState] = useState({ type: null, ticket: null });
  const [refusMotif, setRefusMotif] = useState('');
  const [newDueDate, setNewDueDate] = useState(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const openModal = (type, ticket) => {
      setModalState({ type, ticket });
      if (type === 'refus') setRefusMotif('');
      if (type === 'date') setNewDueDate(parseDate(ticket.dateEcheance) || new Date());
      if (type === 'assign') setSelectedAssigneeId('');
  };
  const closeModal = () => setModalState({ type: null, ticket: null });

  const handleActionSubmit = (e, action) => {
      e.preventDefault();
      action();
      closeModal();
  };
  
  const uniqueModules = useMemo(() => {
    const modules = new Map();
    (ticketsNonAssignes || []).forEach(ticket => {
        if (ticket.idModule && ticket.idModule.id) {
            modules.set(ticket.idModule.id, ticket.idModule.designation);
        }
    });
    return Array.from(modules.entries()).map(([id, designation]) => ({ id, designation }));
  }, [ticketsNonAssignes]);

  const processedTickets = useMemo(() => {
    let items = [...(ticketsNonAssignes || [])];
    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        items = items.filter(t => t.titre?.toLowerCase().includes(lowerSearch) || t.idClient?.nomComplet.toLowerCase().includes(lowerSearch));
    }
    if (filters.priority !== 'Tous') items = items.filter(t => t.priorite === filters.priority);
    if (filters.module !== 'Tous') items = items.filter(t => t.idModule?.id.toString() === filters.module);
    
    items.sort((a, b) => {
        const valA = parseDate(a[sortConfig.key]);
        const valB = parseDate(b[sortConfig.key]);
        if (!valA) return 1;
        if (!valB) return -1;
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    });
    return items;
  }, [ticketsNonAssignes, searchTerm, filters, sortConfig]);

  const totalPages = Math.ceil(processedTickets.length / TICKETS_PER_PAGE);
  const paginatedTickets = useMemo(() => {
      const startIndex = (currentPage - 1) * TICKETS_PER_PAGE;
      return processedTickets.slice(startIndex, startIndex + TICKETS_PER_PAGE);
  }, [processedTickets, currentPage]);
  
  useEffect(() => {
      if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * TICKETS_PER_PAGE;
  const endIndex = Math.min(startIndex + TICKETS_PER_PAGE, processedTickets.length);

  return (
    <div>
        <header className="flex items-baseline gap-x-3 mb-3">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Tickets à Traiter</h1>
            <p className="text-sm text-slate-500">Assignez ou refusez les tickets en attente validés.</p>
        </header>

        <div className="mb-3 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex flex-wrap items-center gap-x-2 gap-y-2">
            <div className="relative flex-grow min-w-[200px] lg:flex-grow-0 lg:w-64">
                <Search className="h-4 w-4 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none" />
                <input type="text" placeholder="Rechercher par titre, client..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input-sm w-full pl-9" />
            </div>
            <div className="flex items-center gap-1.5">
                <Filter size={15} className="text-slate-500" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Filtrer :</span>
            </div>
            <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} className="form-select-sm"><option value="Tous">Priorité (toutes)</option><option value="Haute">Haute</option><option value="Moyenne">Moyenne</option><option value="Basse">Basse</option></select>
            <select value={filters.module} onChange={(e) => handleFilterChange('module', e.target.value)} className="form-select-sm"><option value="Tous">Module (tous)</option>{uniqueModules.map(m => <option key={m.id} value={m.id}>{m.designation}</option>)}</select>
            <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Trier par :</span>
                <button onClick={() => handleSort('dateCreation')} className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium ${sortConfig.key === 'dateCreation' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                    {sortConfig.key === 'dateCreation' && (sortConfig.direction === 'desc' ? <SortDesc size={14}/> : <SortAsc size={14}/>)} Création
                </button>
                <button onClick={() => handleSort('dateEcheance')} className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium ${sortConfig.key === 'dateEcheance' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                    {sortConfig.key === 'dateEcheance' && (sortConfig.direction === 'desc' ? <SortDesc size={14}/> : <SortAsc size={14}/>)} Échéance
                </button>
            </div>
        </div>

        {paginatedTickets.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-lg"><Info size={48} className="mx-auto text-slate-400 mb-4" /><p className="text-slate-500">Aucun ticket ne correspond à vos critères.</p></div>
        ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {paginatedTickets.map(ticket => (<TicketCard key={ticket.id} ticket={ticket} onOpenModal={openModal} />))}
                </div>
                <div className="mt-4 flex justify-end items-center gap-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{startIndex + 1}-{endIndex} sur {processedTickets.length}</span>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </>
        )}
        
        {/* --- Modales --- */}
        <Modal isOpen={modalState.type === 'detail'} onClose={closeModal} title={`Détail du Ticket ${modalState.ticket?.ref}`}>{modalState.ticket && <TicketDetailContent ticket={modalState.ticket} />}</Modal>
        <Modal isOpen={modalState.type === 'comments'} onClose={closeModal} title="Commentaires" size="lg">{modalState.ticket && <CommentsModalContent ticket={modalState.ticket} currentUser={currentUser} onAddComment={onAddComment} onDeleteComment={onDeleteComment} />}</Modal>
        <Modal isOpen={modalState.type === 'documents'} onClose={closeModal} title="Documents Joints" size="lg">{modalState.ticket && <DocumentsModalContent ticket={modalState.ticket} onUploadFile={onUploadFile} onDeleteFile={onDeleteFile} onDownloadFile={onDownloadFile} />}</Modal>
        <Modal isOpen={modalState.type === 'assign'} onClose={closeModal} title="Assigner le Ticket">
            <form onSubmit={(e) => handleActionSubmit(e, () => { const employe = equipesDuChef.flatMap(eq => eq.utilisateurs).find(u => u.id.toString() === selectedAssigneeId); if (employe) onAssignerTicketAEmploye(modalState.ticket.id, employe);})}>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">{equipesDuChef.flatMap(e => e.utilisateurs || []).filter(u => u.actif).map(m => (<label key={m.id} className="flex items-center p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"><input type="radio" name="assignee" value={m.id} checked={selectedAssigneeId === m.id.toString()} onChange={(e) => setSelectedAssigneeId(e.target.value)} className="form-radio" /><span className="ml-3 text-slate-700 dark:text-slate-200">{m.prenom} {m.nom}</span></label>))}</div>
                <div className="flex justify-end space-x-3"><button type="button" onClick={closeModal} className="btn btn-secondary">Annuler</button><button type="submit" className="btn btn-primary" disabled={!selectedAssigneeId}>Confirmer</button></div>
            </form>
        </Modal>
        <Modal isOpen={modalState.type === 'refus'} onClose={closeModal} title={`Refuser le Ticket ${modalState.ticket?.ref}`}>
            <form onSubmit={(e) => handleActionSubmit(e, () => onRefuserTicketParChef(modalState.ticket.id, refusMotif))}><textarea value={refusMotif} onChange={(e) => setRefusMotif(e.target.value)} className="form-textarea w-full mb-4" rows="4" placeholder="Veuillez spécifier le motif du refus..." required /><div className="flex justify-end space-x-3"><button type="button" onClick={closeModal} className="btn btn-secondary">Annuler</button><button type="submit" className="btn btn-danger" disabled={!refusMotif.trim()}>Confirmer le Refus</button></div></form>
        </Modal>
        <Modal isOpen={modalState.type === 'date'} onClose={closeModal} title="Définir la date d'échéance">
            <form onSubmit={(e) => handleActionSubmit(e, () => onSetDueDate(modalState.ticket.id, newDueDate.toISOString().slice(0, 19)))} className="flex flex-col items-center"><DatePicker selected={newDueDate} onChange={(date) => setNewDueDate(date)} inline /><div className="flex justify-end space-x-3 mt-4 w-full"><button type="button" onClick={closeModal} className="btn btn-secondary">Annuler</button><button type="submit" className="btn btn-primary">Enregistrer</button></div></form>
        </Modal>
    </div>
  );
};

// --- Contenus des Modales ---
const TicketDetailContent = ({ ticket }) => (<div className="text-sm space-y-3 text-slate-600 dark:text-slate-300"><p><strong>Titre:</strong> {ticket.titre}</p><div><strong>Description:</strong><p className="whitespace-pre-wrap pl-2 mt-1 border-l-2 border-slate-200 dark:border-slate-600">{ticket.description || 'Aucune'}</p></div><p><strong>Client:</strong> {ticket.idClient?.nomComplet}</p><p><strong>Demandeur:</strong> {ticket.userCreation}</p><p><strong>Module:</strong> {ticket.idModule?.designation}</p><p><strong>Priorité:</strong> {ticket.priorite}</p><p><strong>Créé le:</strong> {formatDisplayDate(parseDate(ticket.dateCreation))}</p></div>);
const CommentsModalContent = ({ ticket, currentUser, onAddComment, onDeleteComment }) => {
    const [newComment, setNewComment] = useState('');
    const commentsEndRef = useRef(null);
    useEffect(() => { commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [ticket.commentaireList]);
    const handleCommentSubmit = (e) => { e.preventDefault(); if (!newComment.trim()) return; onAddComment({ commentaire: newComment, idTicket: ticket.id, idUtilisateur: currentUser.id }); setNewComment(''); };
    return (<div><div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-4">{(ticket.commentaireList || []).length > 0 ? ticket.commentaireList.map(comment => (<div key={comment.id} className="text-sm"><div className="flex items-center justify-between"><p className="font-semibold text-slate-800 dark:text-slate-100">{comment.utilisateur?.prenom} {comment.utilisateur?.nom}</p><div className="flex items-center gap-2"><span className="text-xs text-slate-400">{formatDisplayDate(parseDate(comment.dateCreation))}</span>{currentUser?.id === comment.utilisateur?.id && (<button onClick={() => onDeleteComment(comment.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>)}</div></div><p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap mt-1">{comment.commentaire}</p></div>)) : <p className="text-sm text-slate-500 italic text-center py-4">Aucun commentaire pour ce ticket.</p>}<div ref={commentsEndRef} /></div><form onSubmit={handleCommentSubmit} className="mt-3 flex gap-2 border-t pt-4"><input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Ajouter un commentaire..." className="form-input flex-grow text-sm" /><button type="submit" className="btn btn-primary p-2.5" disabled={!newComment.trim()}><Send size={16} /></button></form></div>);
};
const DocumentsModalContent = ({ ticket, onUploadFile, onDeleteFile, onDownloadFile }) => {
    const fileInputRef = useRef(null);
    const handleFileChange = (e) => { const file = e.target.files[0]; if (file) onUploadFile(file, ticket.id); };
    return (<div><div className="space-y-2 max-h-80 overflow-y-auto pr-2 mb-4">{(ticket.documentJointesList || []).length > 0 ? ticket.documentJointesList.map(doc => (<div key={doc.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-2 rounded-md border dark:border-slate-600"><p className="text-sm text-slate-700 dark:text-slate-200 truncate mr-2">{doc.nomDocument}.{doc.extension}</p><div className="flex gap-1 flex-shrink-0"><button onClick={() => onDownloadFile(doc.id, `${doc.nomDocument}.${doc.extension}`)} className="p-1.5 text-slate-500 hover:text-blue-600" title="Télécharger"><Download size={16} /></button><button onClick={() => onDeleteFile(doc.id)} className="p-1.5 text-slate-500 hover:text-red-600" title="Supprimer"><Trash2 size={16} /></button></div></div>)) : <p className="text-sm text-slate-500 italic text-center py-4">Aucune pièce jointe.</p>}</div><div className="border-t pt-4"><button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary-outline w-full">Ajouter un fichier</button><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" /></div></div>);
};

export default TicketsATraiterChefPage;
