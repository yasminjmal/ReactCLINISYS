import React from 'react';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';

const TicketsRefuse = ({ ticketRefuse }) => {
  const tableHeaderClass =
    'px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider';

  const getPriorityStyling = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'Haute':
        return {
          badge: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300',
          icon: <AlertTriangle size={12} className="text-red-500 mr-1" />
        };
      case 'Moyenne':
        return {
          badge: 'bg-sky-100 text-sky-700 dark:bg-sky-700/20 dark:text-sky-300',
          icon: <AlertTriangle size={12} className="text-sky-500 mr-1" />
        };
      case 'Basse':
        return {
          badge: 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300',
          icon: <CheckCircle size={12} className="text-green-500 mr-1" />
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-700 dark:bg-slate-700/20 dark:text-slate-300',
          icon: null
        };
    }
  };

  const cellClass =
    "px-4 py-3 text-sm text-slate-700 dark:text-slate-200 align-middle border-b border-slate-200 dark:border-slate-700";

  if (!ticketRefuse || ticketRefuse.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
        <Info size={40} className="mx-auto text-slate-400 mb-3" />
        <p className="text-slate-500 dark:text-slate-400">Aucun ticket refusé à afficher.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="overflow-x-auto shadow-xl rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full">
          <thead className="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th className={tableHeaderClass}>Réf.</th>
              <th className={tableHeaderClass}>Titre / Client</th>
              <th className={tableHeaderClass}>Priorité</th>
              <th className={tableHeaderClass}>Module</th>
              <th className={tableHeaderClass}>Statut</th>
              <th className={tableHeaderClass}>Demandeur</th>
              <th className={tableHeaderClass}>Créé le</th>
              <th className={`${tableHeaderClass} text-center`}>Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {ticketRefuse.map((ticket) => {
              const priorityStyle = getPriorityStyling(ticket.priorite);
              const dateCreationFormatted = ticket.dateCreation
                ? new Date(ticket.dateCreation[0], ticket.dateCreation[1] - 1, ticket.dateCreation[2]).toLocaleDateString('fr-CA')
                : 'N/A';
              const demandeurNom = ticket.userCreation || (ticket.idClient?.nomComplet ?? 'N/A');

              return (
                <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/60">
                  <td className={`${cellClass} font-mono`}>{ticket.ref}</td>
                  <td className={cellClass}>
                    <p className="font-semibold">{ticket.titre}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Client: {ticket.idClient?.nomComplet || 'N/A'}</p>
                  </td>
                  <td className={cellClass}>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${priorityStyle.badge}`}>
                      {priorityStyle.icon}
                      {ticket.priorite}
                    </span>
                  </td>
                  <td className={cellClass}>
                    {ticket.idModule?.designation || <span className="text-slate-400 italic">Non spécifié</span>}
                  </td>
                  <td className={cellClass}>{ticket.statue}</td>
                  <td className={cellClass}>{demandeurNom}</td>
                  <td className={cellClass}>{dateCreationFormatted}</td>
                  <td className={`${cellClass} text-center text-slate-400 italic`}>Aucune action</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketsRefuse;
