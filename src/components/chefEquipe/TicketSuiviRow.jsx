// src/components/chefEquipe/TicketSuiviRow.jsx
import React from 'react';
import { Tag as TagIcon, Eye, User, Clock, CheckCircle, XCircle } from 'lucide-react';

const TicketSuiviRow = ({ ticket }) => {
    
  const getStatusStyling = (status) => {
    switch (status) {
      case 'En_cours':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-700/20 dark:text-blue-300';
      case 'Termine':
        return 'bg-green-100 text-green-800 dark:bg-green-700/20 dark:text-green-300';
      case 'Refuse':
        return 'bg-red-100 text-red-800 dark:bg-red-700/20 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700/20 dark:text-slate-300';
    }
  };

  const dateModificationFormatted = new Date(ticket.date_modification || ticket.dateCreation).toLocaleDateString('fr-CA');
  const cellClass = "px-4 py-3 text-sm text-slate-700 dark:text-slate-200 align-middle";

  return (
    <tr className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60">
      <td className={`${cellClass} font-mono`}>{ticket.ref || ticket.id}</td>
      <td className={cellClass}>
        <p className="font-semibold">{ticket.titre}</p>
        <p className="text-xs text-slate-500">Client: {ticket.idClient?.nomComplet || 'N/A'}</p>
      </td>
      <td className={cellClass}>
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusStyling(ticket.statue)}`}>
            {ticket.statue}
        </span>
      </td>
      <td className={cellClass}>
        <div className="flex items-center">
            <User size={14} className="mr-2 text-slate-400"/>
            <span>{ticket.idUtilisateur?.prenom || ''} {ticket.idUtilisateur?.nom || 'Non assigné'}</span>
        </div>
      </td>
      <td className={cellClass}>
        <div className="flex items-center">
            <Clock size={14} className="mr-2 text-slate-400"/>
            <span>{dateModificationFormatted}</span>
        </div>
      </td>
      <td className={`${cellClass} text-center`}>
        <button className="p-2 text-slate-500 hover:bg-slate-200 rounded-full" title="Voir les détails">
          <Eye size={16} />
        </button>
      </td>
    </tr>
  );
};

export default TicketSuiviRow;