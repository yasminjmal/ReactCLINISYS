// src/components/admin/Tickets/TicketDetailPage.jsx
import React, { useState, useEffect } from 'react';
import ticketService from '../../../services/ticketService';
import { X, Calendar, User, Tag, Info, Loader, AlertTriangle, ChevronsRight, ChevronDown, CheckCircle, Package as ModuleIcon, Shield, Clock, MessageSquare, Edit, Trash2, Eye, EyeOff } from 'lucide-react'; // Ajout des icônes pour les sous-tickets

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

// --- Petits composants pour les badges de statut et priorité (standardisés) ---

const PriorityBadge = ({ priority }) => {
  const styles = {
    Haute: { className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-600/50', dotColor: 'bg-red-500' },
    Moyenne: { className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-600/50', dotColor: 'bg-blue-500' },
    Basse: { className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-600/50', dotColor: 'bg-green-500' },
  };
  const info = styles[priority?.toUpperCase()] || { className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-700', dotColor: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-md gap-1 border ${info.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${info.dotColor}`}></span>
      {priority || 'N/A'}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const statusInfo = {
    En_attente: { text: 'En attente', className: 'text-orange-600 dark:text-orange-400' },
    En_cours: { text: 'En cours', className: 'text-blue-600 dark:text-blue-400' },
    Accepte: { text: 'Accepté', className: 'text-green-600 dark:text-green-400' },
    Termine: { text: 'Terminé', className: 'text-teal-600 dark:text-teal-400' },
    Refuse: { text: 'Refusé', className: 'text-red-600 dark:text-red-400' },
    RESOLU: { text: 'Résolu', className: 'text-cyan-600 dark:text-cyan-400' },
    FERME: { text: 'Fermé', className: 'text-gray-600 dark:text-gray-400' },
  };
  const info = statusInfo[status?.toUpperCase()] || { text: status, className: 'text-slate-500' };
  return <span className={`text-sm font-semibold ${info.className}`}>{info.text}</span>;
};

const DetailItem = ({ icon, label, value }) => (
  <div>
    <dt className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-1">{icon}{label}</dt>
    <dd className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words">{value || <span className="italic text-slate-400">N/A</span>}</dd>
  </div>
);

// --- Composant principal de la page de détails ---

const TicketDetailPage = ({ ticketId, onClose }) => {
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSubTicketDescriptions, setExpandedSubTicketDescriptions] = useState(new Set()); // Pour les descriptions des sous-tickets
  const [expandedSubTicketComments, setExpandedSubTicketComments] = useState(new Set()); // Pour les commentaires des sous-tickets

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await ticketService.getTicketById(ticketId);
        setTicket(data);
      } catch (err) {
        setError("Impossible de charger les détails du ticket.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicket();
  }, [ticketId]);

  const toggleSubTicketDescriptionExpansion = (subTicketId) => {
        setExpandedSubTicketDescriptions(prevSet => {
            const newSet = new Set(prevSet);
            if (newSet.has(subTicketId)) { newSet.delete(subTicketId); } else { newSet.add(subTicketId); }
            return newSet;
        });
    };

    const toggleSubTicketCommentExpansion = (subTicketId) => {
        setExpandedSubTicketComments(prevSet => {
            const newSet = new Set(prevSet);
            if (newSet.has(subTicketId)) { newSet.delete(subTicketId); } else { newSet.add(subTicketId); }
            return newSet;
        });
    };


  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full"><Loader className="animate-spin text-blue-500" size={48} /></div>;
    }
    if (error) {
      return <div className="flex justify-center items-center h-full text-red-500">{error}</div>;
    }
    if (!ticket) {
      return <div className="flex justify-center items-center h-full text-slate-500">Aucun ticket sélectionné.</div>;
    }

    const { titre, description, userCreation, dateCreation, date_echeance, priorite, statue, idClient, idModule, idUtilisateur, actif, childTickets, commentaireList } = ticket;

    const formattedDateCreation = formatDate(dateCreation);
    const formattedDateEcheance = formatDate(date_echeance);

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{titre}</h2>
            <p className="text-xs text-slate-500">Créé par {userCreation} le {formattedDateCreation}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
            <X size={24} />
          </button>
        </header>

        {/* Body */}
        <div className="flex-grow p-6 overflow-y-auto space-y-8">
          {/* Section des détails principaux */}
          <section>
            <h3 className="text-sm font-semibold uppercase text-slate-400 mb-4">Détails</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem icon={<User size={14} className="mr-2"/>} label="Client" value={idClient?.nomComplet} />
              <DetailItem icon={<Tag size={14} className="mr-2"/>} label="Priorité" value={<PriorityBadge priority={priorite} />} />
              <DetailItem icon={<Info size={14} className="mr-2"/>} label="Statut" value={<StatusBadge status={statue} />} />
              <DetailItem icon={<ModuleIcon size={14} className="mr-2"/>} label="Module" value={idModule?.designation} />
              <DetailItem icon={<User size={14} className="mr-2"/>} label="Affecté à" value={idUtilisateur ? `${idUtilisateur.prenom} ${idUtilisateur.nom}` : ''} />
              <DetailItem icon={<Shield size={14} className="mr-2"/>} label="Actif" value={actif ? 'Oui' : 'Non'} />
              <DetailItem icon={<Calendar size={14} className="mr-2"/>} label="Date d'échéance" value={formattedDateEcheance} />
            </dl>
          </section>

          {/* Section description */}
          <section>
             <h3 className="text-sm font-semibold uppercase text-slate-400 mb-3">Description</h3>
             <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md">
                {description || "Aucune description fournie."}
             </p>
          </section>

          {/* Section commentaires du ticket parent */}
          <section>
            <h3 className="text-sm font-semibold uppercase text-slate-400 mb-4 flex items-center">
                <MessageSquare size={16} className="mr-2"/> Commentaires du Ticket ({commentaireList?.length || 0})
            </h3>
            {commentaireList && commentaireList.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium">Commentaire</th>
                                <th className="px-3 py-2 text-left font-medium">Créé par</th>
                                <th className="px-3 py-2 text-left font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {commentaireList.map(comment => (
                                <tr key={comment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 align-top">
                                    <td className="px-3 py-2">
                                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{comment.commentaire}</p>
                                    </td>
                                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                                        {comment.utilisateur?.prenom} {comment.utilisateur?.nom}
                                    </td>
                                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                                        {formatDate(comment.dateCommentaire)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 italic">Aucun commentaire pour ce ticket.</p>
            )}
          </section>

          {/* Section sous-tickets - Colonnes alignées avec TicketUpdateView */}
          {childTickets && childTickets.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase text-slate-400 mb-4">Sous-tickets ({childTickets.length})</h3>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
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
                      <th className="px-3 py-2 text-center font-medium">Commentaires</th> {/* Ajout pour visibilité des commentaires dans le modal de détail */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {childTickets.map(sub => (
                      <React.Fragment key={sub.id}>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 align-top">
                          <td className="px-3 py-2 font-medium">{sub.titre}</td>
                          <td className="px-3 py-2 max-w-xs">
                                <div className="flex items-start justify-between gap-2">
                                    <p className={`text-sm text-slate-600 dark:text-slate-300 ${expandedSubTicketDescriptions.has(sub.id) ? 'whitespace-pre-wrap break-words' : 'truncate'}`} title={!expandedSubTicketDescriptions.has(sub.id) ? sub.description : ''}>
                                        {sub.description || <span className="italic">Pas de desciption</span>}
                                    </p>
                                    {sub.description && sub.description.length > 50 && (
                                        <button onClick={() => toggleSubTicketDescriptionExpansion(sub.id)} className="p-1 text-slate-400 hover:text-blue-500 flex-shrink-0" title={expandedSubTicketDescriptions.has(sub.id) ? 'Réduire' : 'Afficher plus'}>
                                            {expandedSubTicketDescriptions.has(sub.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    )}
                                </div>
                            </td>
                          <td className="px-3 py-2">{sub.idModule?.designation || 'N/A'}</td>
                          <td className="px-3 py-2">{sub.idUtilisateur ? `${sub.idUtilisateur.prenom} ${sub.idUtilisateur.nom}` : 'Aucun employé affecté'}</td>
                          <td className="px-3 py-2">{formatDate(sub.date_echeance)}</td>
                          <td className="px-3 py-2"><PriorityBadge priority={sub.priorite} /></td>
                          <td className="px-3 py-2"><StatusBadge status={sub.statue} /></td>
                          <td className="px-3 py-2">{formatDate(sub.dateCreation)}</td>
                          <td className="px-3 py-2 text-center">
                            <button onClick={() => toggleSubTicketCommentExpansion(sub.id)} className="p-1.5 text-slate-500 hover:text-indigo-500" title={expandedSubTicketComments.has(sub.id) ? "Masquer les commentaires" : "Afficher les commentaires"}>
                                <MessageSquare size={16}/> ({sub.commentaireList?.length || 0})
                            </button>
                          </td>
                        </tr>
                        {expandedSubTicketComments.has(sub.id) && (
                            <tr className="bg-slate-50 dark:bg-slate-900/50">
                                <td colSpan="9" className="p-4">
                                    <div className="bg-slate-100 dark:bg-slate-800/70 p-4 rounded-md shadow-inner">
                                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center">
                                            <MessageSquare size={16} className="mr-2" /> Commentaires du Sous-ticket ({sub.commentaireList?.length || 0})
                                        </h4>
                                        {sub.commentaireList && sub.commentaireList.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-xs">
                                                    <thead className="bg-slate-200 dark:bg-slate-700">
                                                        <tr>
                                                            <th className="px-2 py-1 text-left font-medium">Commentaire</th>
                                                            <th className="px-2 py-1 text-left font-medium">Créé par</th>
                                                            <th className="px-2 py-1 text-left font-medium w-32">Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                        {sub.commentaireList.map(comment => (
                                                            <tr key={comment.id} className="hover:bg-slate-100 dark:hover:bg-slate-800 align-top">
                                                                <td className="px-2 py-1">
                                                                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{comment.commentaire}</p>
                                                                </td>
                                                                <td className="px-2 py-1 text-slate-600 dark:text-slate-300">
                                                                    {comment.utilisateur?.prenom} {comment.utilisateur?.nom}
                                                                </td>
                                                                <td className="px-2 py-1 text-slate-500 dark:text-slate-400">
                                                                    {formatDate(comment.dateCommentaire)}
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
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}>
      <div 
        className="fixed top-0 right-0 h-full w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out" // max-w-4xl pour plus de place
        onClick={(e) => e.stopPropagation()}
        style={{ transform: ticketId ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default TicketDetailPage;