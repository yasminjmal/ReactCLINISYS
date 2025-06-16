// src/components/admin/Tickets/TicketRow.jsx
import React from 'react';
import { Info, CalendarDays, UserCircle, Building, Tag, FileText, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

const TicketRow = ({ ticket, onNavigateToDetails, isHighlighted }) => {
  if (!ticket) {
    return null;
  }

  const getPriorityClasses = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'haute':
        return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300';
      case 'moyenne':
        return 'bg-sky-100 text-sky-700 dark:bg-sky-700/30 dark:text-sky-300';
      case 'faible':
        return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300';
    }
  };

  const getStatusInfo = (status) => {
    const s = status?.toUpperCase();
    switch (s) {
      case 'EN_ATTENTE':
        return { icon: <AlertTriangle size={14} className="text-slate-500 mr-1.5" />, textClass: 'text-slate-600 dark:text-slate-400', label: 'En attente' };
      case 'EN_COURS':
        return { icon: <Clock size={14} className="text-orange-500 mr-1.5" />, textClass: 'text-orange-600 dark:text-orange-400', label: 'En cours' };
      case 'ACCEPTE':
        return { icon: <CheckCircle size={14} className="text-green-500 mr-1.5" />, textClass: 'text-green-600 dark:text-green-400', label: 'Accepté' };
      case 'TERMINE':
        return { icon: <CheckCircle size={14} className="text-sky-500 mr-1.5" />, textClass: 'text-sky-600 dark:text-sky-400', label: 'Terminé' };
      case 'REFUSE':
        return { icon: <XCircle size={14} className="text-red-500 mr-1.5" />, textClass: 'text-red-600 dark:text-red-400', label: 'Refusé' };
      default:
        return { icon: <Tag size={14} className="text-slate-500 mr-1.5" />, textClass: 'text-slate-600', label: status || 'N/A' };
    }
  };
  
  const statusInfo = getStatusInfo(ticket.statue);
  const demandeurNom = ticket.demandeur ? `${ticket.demandeur.prenom || ''} ${ticket.demandeur.nom || ''}`.trim() : 'N/A';
  const clientNom = ticket.idClient?.nom || ticket.client || 'N/A'; // Adapte le chemin du client
  const priorityClass = getPriorityClasses(ticket.priorite);

  return (
    <div
      className={`ticket-block-container mb-2.5 rounded-lg bg-white dark:bg-slate-800 shadow hover:shadow-md transition-all duration-200 overflow-hidden border border-slate-200 dark:border-slate-700/80
                  ${isHighlighted ? 'ring-2 ring-sky-500 scale-[1.01]' : ''}`}
    >
      <div className="p-3.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Réf. - Largeur fixe */}
        <div className="flex-none w-[80px] text-left self-start">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Réf.</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate" title={ticket.ref}>{ticket.ref || 'N/A'}</p>
        </div>

        {/* Client & Demandeur - Flex-grow, min-width */}
        <div className="flex-grow min-w-[180px] sm:w-auto self-start">
          <div className="flex items-center mb-0.5">
            <Building size={14} className="mr-1.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate" title={clientNom}>
              {clientNom} {/* Utilise clientNom */}
            </p>
          </div>
          <div className="flex items-center">
            <UserCircle size={14} className="mr-1.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={demandeurNom}>
              {demandeurNom}
            </p>
          </div>
        </div>

        {/* Titre - Flex-grow, prendra l'espace restant, avec une largeur max */}
        <div className="flex-grow w-full md:w-auto md:max-w-[300px] lg:max-w-[400px] xl:max-w-[500px] flex items-start self-start">
            <FileText size={14} className="mr-1.5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 dark:text-slate-200 truncate" title={ticket.titre}>
                {ticket.titre || 'Sans titre'}
            </p>
        </div>
        
        {/* Section droite alignée : Priorité, Statut, Date, Actions */}
        <div className="flex-none flex flex-col items-end space-y-1.5 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 ml-auto self-start">
            {/* Priorité - Largeur fixe */}
            <div className="w-[90px] text-center">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${priorityClass}`}>
                {ticket.priorite ? ticket.priorite.charAt(0).toUpperCase() + ticket.priorite.slice(1) : 'N/A'}
              </span>
            </div>

            {/* Statut - Largeur fixe */}
            <div className="w-[110px] flex items-center justify-center text-xs font-medium ${statusInfo.textClass}">
              {statusInfo.icon}
              <span>{statusInfo.label}</span>
            </div>
            
            {/* Date Création - Largeur fixe */}
            <div className="w-[100px] text-center">
              <div className="flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                  <CalendarDays size={14} className="mr-1.5"/>
                  {ticket.dateCreation ? new Date(ticket.dateCreation).toLocaleDateString('fr-CA') : 'N/A'}
              </div>
               <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {ticket.dateCreation ? new Date(ticket.dateCreation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit'}) : ''}
              </p>
            </div>

            {/* Actions - Largeur fixe */}
            <div className="w-[40px] flex items-center justify-end">
              <button
                onClick={() => onNavigateToDetails(ticket.id)}
                className="p-2 rounded-full text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Voir détails du ticket"
              >
                <Info size={18} />
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TicketRow;