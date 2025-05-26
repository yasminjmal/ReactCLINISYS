import React from 'react';
import { Info, CalendarDays, UserCircle, Building, Tag, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const TicketRow = ({ ticket, onNavigateToDetails }) => {
  if (!ticket) {
    return null; // Ou un placeholder si un ticket est attendu mais non fourni
  }

  const getPriorityClasses = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'haute':
        return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300 border-red-500';
      case 'moyenne':
        return 'bg-sky-100 text-sky-700 dark:bg-sky-700/30 dark:text-sky-300 border-sky-500';
      case 'faible':
        return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300 border-green-500';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'en attente':
        return <AlertTriangle size={14} className="text-yellow-500 mr-1" />;
      case 'accepté':
        return <CheckCircle size={14} className="text-green-500 mr-1" />;
      case 'refusé':
        return <XCircle size={14} className="text-red-500 mr-1" />;
      case 'affecté':
        return <UserCircle size={14} className="text-blue-500 mr-1" />; // Exemple, à adapter
      default:
        return null;
    }
  };
  
  const demandeurNom = ticket.demandeur ? `${ticket.demandeur.prenom || ''} ${ticket.demandeur.nom || ''}`.trim() : 'N/A';

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg flex items-center p-3.5 space-x-3 transition-shadow duration-200">
      {/* Réf */}
      <div className="flex-none w-20 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">Réf.</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate" title={ticket.ref}>{ticket.ref || 'N/A'}</p>
      </div>

      {/* Client & Demandeur */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-0.5">
          <Building size={14} className="mr-1.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate" title={ticket.client}>
            {ticket.client || 'N/A'}
          </p>
        </div>
        <div className="flex items-center">
          <UserCircle size={14} className="mr-1.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={demandeurNom}>
            {demandeurNom}
          </p>
        </div>
      </div>

      {/* Titre */}
      <div className="flex-1 min-w-0 sm:w-1/3 md:w-2/5 lg:w-1/2">
         <div className="flex items-start">
            <FileText size={14} className="mr-1.5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 dark:text-slate-200 truncate" title={ticket.titre}>
                {ticket.titre || 'Sans titre'}
            </p>
        </div>
      </div>
      
      {/* Priorité */}
      <div className="flex-none w-28 text-center hidden md:block">
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getPriorityClasses(ticket.priorite)}`}>
          {ticket.priorite ? ticket.priorite.charAt(0).toUpperCase() + ticket.priorite.slice(1) : 'N/A'}
        </span>
      </div>

      {/* Statut */}
      <div className="flex-none w-32 text-center hidden lg:flex items-center justify-center">
        {getStatusIcon(ticket.statut)}
        <span className="text-xs text-slate-600 dark:text-slate-300">
            {ticket.statut ? ticket.statut.charAt(0).toUpperCase() + ticket.statut.slice(1) : 'N/A'}
        </span>
      </div>
      
      {/* Date Création */}
      <div className="flex-none w-32 text-center hidden md:block">
        <div className="flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
            <CalendarDays size={14} className="mr-1.5"/>
            {ticket.dateCreation ? new Date(ticket.dateCreation).toLocaleDateString('fr-CA') : 'N/A'}
        </div>
         <p className="text-[10px] text-slate-400 dark:text-slate-500">
            {ticket.dateCreation ? new Date(ticket.dateCreation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit'}) : ''}
        </p>
      </div>

      {/* Actions */}
      <div className="flex-none">
        <button
          onClick={() => onNavigateToDetails(ticket.id)}
          className="p-2 rounded-full text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Voir détails du ticket"
        >
          <Info size={18} />
        </button>
      </div>
    </div>
  );
};

export default TicketRow;