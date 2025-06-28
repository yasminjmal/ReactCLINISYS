// src/components/admin/Tickets/TicketTableRow.jsx
import React, { Fragment } from 'react';
import { Edit, Trash2, Info, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { formatDateFromArray } from '../../../utils/dateFormatter';

// --- Petits composants pour les badges ---
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
    En_attente: { text: 'En attente', className: 'text-yellow-600 dark:text-yellow-400' },
    En_cours: { text: 'En cours', className: 'text-orange-600 dark:text-orange-400' },
    Accepte: { text: 'Accepté', className: 'text-green-600 dark:text-green-400' },
    Termine: { text: 'Terminé', className: 'text-blue-600 dark:text-blue-400' }, // Changé de sky à blue pour cohérence
    Refuse: { text: 'Refusé', className: 'text-red-600 dark:text-red-400' },
    // Nouveaux statuts possibles
    RESOLU: { text: 'Résolu', className: 'text-teal-600 dark:text-teal-400' },
    FERME: { text: 'Fermé', className: 'text-gray-600 dark:text-gray-400' },
  };
  const info = statusInfo[status?.toUpperCase()] || { text: status, className: 'text-slate-500' };
  return <span className={`text-xs font-semibold ${info.className}`}>{info.text}</span>;
};

const ActifBadge = ({ actif }) => {
    const isActif = actif === true;
    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium gap-1 border ${isActif ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20' : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-700'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${isActif ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
        {isActif ? 'Actif' : 'Inactif'}
      </div>
    );
};

// --- Composant principal de la ligne de ticket ---

const TicketTableRow = ({ 
    ticket,
    isExpanded,
    onToggleExpand,
    onNavigateToDetails, 
    onNavigateToUpdate, 
    highlightedTicketId, // Ajout de la prop highlightedTicketId
    visibleColumns // Ajout de la prop visibleColumns
}) => {
    
    const hasSubTickets = ticket.childTickets && ticket.childTickets.length > 0;
    
    // Détermine si la ligne doit être surlignée
    const isHighlighted = highlightedTicketId === ticket.id;

    const clientNom = ticket.idClient?.nomComplet || ticket.client || 'N/A';
    const demandeurNom = ticket.userCreation || (ticket.demandeur ? `${ticket.demandeur.prenom} ${ticket.demandeur.nom}`.trim() : 'N/A');
    const employeNom = ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom || ''} ${ticket.idUtilisateur.nom || ''}`.trim() : 'N/A';

    // Ligne pour le ticket parent
    const parentRow = (
        <tr className={`bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-200 dark:border-slate-700 ${isHighlighted ? 'highlight-row' : ''}`}>
            {visibleColumns.clientDemandeur && (
                <td className="px-4 py-1 text-sm separateur-colonne-leger"> {/* py-1 pour réduire l'espace */}
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{clientNom}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Par: {demandeurNom}</div>
                </td>
            )}
            {visibleColumns.titre && (
                <td className="px-4 py-1 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate separateur-colonne-leger" title={ticket.titre}>
                    {ticket.titre}
                </td>
            )}
            {visibleColumns.prioriteStatut && (
                <td className="px-4 py-1 text-sm separateur-colonne-leger">
                    <div className="flex flex-col space-y-1 items-start"> {/* space-y-1 */}
                        <PriorityBadge priority={ticket.priorite} />
                        <StatusBadge status={ticket.statue} />
                    </div>
                </td>
            )}
            {visibleColumns.module && (
                <td className="px-4 py-1 text-sm separateur-colonne-leger">
                    {ticket.idModule?.designation || 'N/A'}
                </td>
            )}
            {visibleColumns.affecteA && (
                <td className="px-4 py-1 text-sm separateur-colonne-leger">
                    {employeNom === 'N/A' ? 'Non assigné' : employeNom}
                </td>
            )}
            {visibleColumns.dateEcheance && (
                <td className="px-4 py-1 text-sm text-slate-500 separateur-colonne-leger">
                    {formatDateFromArray(ticket.date_echeance)}
                </td>
            )}
            {visibleColumns.dateCreation && (
                <td className="px-4 py-1 text-sm text-slate-500 separateur-colonne-leger">
                    {formatDateFromArray(ticket.dateCreation)}
                </td>
            )}
            {visibleColumns.actif && (
                <td className="px-4 py-1 separateur-colonne-leger">
                    <ActifBadge actif={ticket.actif} />
                </td>
            )}
            <td className="px-4 py-1">
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => hasSubTickets && onToggleExpand(ticket.id)}
                        disabled={!hasSubTickets}
                        className={`flex items-center space-x-1 p-1.5 rounded-md text-xs transition-colors ${!hasSubTickets ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        title={hasSubTickets ? "Afficher/Masquer les sous-tickets" : "Aucun sous-ticket"}
                    >
                        <span className={`font-bold px-1 py-0.5 rounded-sm ${!hasSubTickets ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-300 dark:bg-slate-600'}`}>{ticket.childTickets?.length || 0}</span>
                        {hasSubTickets && (isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </button>
                    <button onClick={() => onNavigateToUpdate(ticket.id)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-full" title="Modifier/Gérer"><Edit size={16}/></button>
                    <button onClick={() => alert("Logique de suppression à implémenter")} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full" title="Supprimer"><Trash2 size={16}/></button>
                    <button onClick={() => onNavigateToDetails(ticket.id)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-slate-700 rounded-full" title="Détails"><Info size={16}/></button>
                </div>
            </td>
        </tr>
    );
    
    // Lignes pour les sous-tickets si la ligne parente est dépliée
    const subTicketRows = isExpanded && hasSubTickets && ticket.childTickets.map(subTicket => {
        const subEmployeNom = subTicket.idUtilisateur ? `${subTicket.idUtilisateur.prenom || ''} ${subTicket.idUtilisateur.nom || ''}`.trim() : 'N/A';
        return (
             <tr key={subTicket.id} className="bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-slate-200 dark:border-slate-700">
                {visibleColumns.clientDemandeur && (
                    <td className="px-4 py-1 text-sm separateur-colonne-leger" style={{ paddingLeft: '3rem' }}> {/* Indentation */}
                        <div className="font-semibold text-slate-800 dark:text-slate-100">Sous-ticket</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Client: {subTicket.idClient?.nomComplet || 'N/A'}</div>
                    </td>
                )}
                {visibleColumns.titre && (
                    <td className="px-4 py-1 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate separateur-colonne-leger" title={subTicket.titre}>{subTicket.titre}</td>
                )}
                {visibleColumns.prioriteStatut && (
                    <td className="px-4 py-1 text-sm separateur-colonne-leger">
                        <div className="flex flex-col space-y-1 items-start">
                            <PriorityBadge priority={subTicket.priorite} />
                            <StatusBadge status={subTicket.statue} />
                        </div>
                    </td>
                )}
                {visibleColumns.module && (
                    <td className="px-4 py-1 text-sm separateur-colonne-leger">{subTicket.idModule?.designation || 'N/A'}</td>
                )}
                {visibleColumns.affecteA && (
                    <td className="px-4 py-1 text-sm separateur-colonne-leger">{subEmployeNom === 'N/A' ? 'Non assigné' : subEmployeNom}</td>
                )}
                {visibleColumns.dateEcheance && (
                    <td className="px-4 py-1 text-sm text-slate-500 separateur-colonne-leger">{formatDateFromArray(subTicket.date_echeance)}</td>
                )}
                {visibleColumns.dateCreation && (
                    <td className="px-4 py-1 text-sm text-slate-500 separateur-colonne-leger">{formatDateFromArray(subTicket.dateCreation)}</td>
                )}
                {visibleColumns.actif && (
                    <td className="px-4 py-1 separateur-colonne-leger">
                        <ActifBadge actif={subTicket.actif} />
                    </td>
                )}
                <td className="px-4 py-1"> 
                    <div className="flex items-center justify-center space-x-1">
                        <button onClick={() => onNavigateToUpdate(subTicket.id)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-full" title="Modifier/Gérer"><Edit size={16}/></button>
                        <button onClick={() => alert(`Suppression pour sous-ticket ${subTicket.id}`)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full" title="Supprimer"><Trash2 size={16}/></button>
                    </div>
                </td>
            </tr>
        );
    });

    return (
        <Fragment>
            {parentRow}
            {subTicketRows}
        </Fragment>
    );
};

export default TicketTableRow;