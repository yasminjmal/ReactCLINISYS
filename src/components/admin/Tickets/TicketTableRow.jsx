// src/components/admin/Tickets/TicketTableRow.jsx
import React, { Fragment } from 'react';
import { Edit, Trash2, Info, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { formatDateFromArray } from '../../../utils/dateFormatter';

// --- Petits composants pour les badges ---
const PriorityBadge = ({ priority }) => {
  const styles = {
    HAUTE: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    MOYENNE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    BASSE: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${styles[priority?.toUpperCase()] || 'bg-slate-100'}`}>{priority || 'N/A'}</span>;
};

const StatusBadge = ({ status }) => {
  const statusInfo = {
    EN_ATTENTE: 'text-slate-600 dark:text-slate-300',
    EN_COURS: 'text-orange-600 dark:text-orange-400',
    ACCEPTE: 'text-green-600 dark:text-green-400',
    TERMINE: 'text-sky-600 dark:text-sky-400',
    REFUSE: 'text-red-600 dark:text-red-400',
  };
  return <span className={`text-xs font-semibold ${statusInfo[status?.toUpperCase()] || 'text-slate-500'}`}>{status || 'N/A'}</span>;
};

const ActifBadge = ({ actif }) => {
    const isActif = actif === true;
    return (
      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isActif ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
        {isActif ? <CheckCircle size={14} className="mr-1" /> : <XCircle size={14} className="mr-1" />}
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
}) => {
    
    const hasSubTickets = ticket.childTickets && ticket.childTickets.length > 0;


    
    const clientNom = ticket.idClient?.nomComplet || ticket.client || 'N/A';
    const demandeurNom = ticket.userCreation || (ticket.demandeur ? `${ticket.demandeur.prenom} ${ticket.demandeur.nom}`.trim() : 'N/A');
    const employeNom = ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom || ''} ${ticket.idUtilisateur.nom || ''}`.trim() : 'N/A';

    // Ligne pour le ticket parent
    const parentRow = (
        <tr className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-3 text-sm">
                <div className="font-semibold text-slate-800 dark:text-slate-100">{clientNom}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Par: {demandeurNom}</div>
            </td>
            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate" title={ticket.titre}>{ticket.titre}</td>
            <td className="px-4 py-3 text-sm"><div className="flex flex-col space-y-1.5 items-start"><PriorityBadge priority={ticket.priorite} /><StatusBadge status={ticket.statue} /></div></td>
            <td className="px-4 py-3 text-sm">{ticket.idModule?.designation || 'N/A'}</td>
            <td className="px-4 py-3 text-sm">{employeNom === 'N/A' ? 'Non assigné' : employeNom}</td>
            <td className="px-4 py-3 text-sm text-slate-500">{formatDateFromArray(ticket.date_echeance)}</td>
            <td className="px-4 py-3 text-sm text-slate-500">{formatDateFromArray(ticket.dateCreation)}</td>
            <td className="px-4 py-3"><ActifBadge actif={ticket.actif} /></td>
            <td className="px-4 py-3">
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
                    <button onClick={() => onNavigateToUpdate(ticket.id)} className="p-2 text-slate-500 hover:text-sky-500 hover:bg-sky-100 dark:hover:bg-slate-700 rounded-full" title="Modifier/Gérer"><Edit size={16}/></button>
                    <button onClick={() => alert("Logique de suppression à implémenter")} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full" title="Supprimer"><Trash2 size={16}/></button>
                    <button onClick={() => onNavigateToDetails(ticket.id)} className="p-2 text-slate-500 hover:text-indigo-500 hover:bg-indigo-100 dark:hover:bg-slate-700 rounded-full" title="Détails"><Info size={16}/></button>
                </div>
            </td>
        </tr>
    );
    
    // Lignes pour les sous-tickets si la ligne parente est dépliée
    const subTicketRows = isExpanded && hasSubTickets && ticket.childTickets.map(subTicket => {
        const subEmployeNom = subTicket.idUtilisateur ? `${subTicket.idUtilisateur.prenom || ''} ${subTicket.idUtilisateur.nom || ''}`.trim() : 'N/A';
        return (
             <tr key={subTicket.id} className="bg-slate-50 dark:bg-slate-900/50 hover:bg-sky-50 dark:hover:bg-sky-700/20 border-b border-slate-200 dark:border-slate-700">
                {/* 1. Client (indenté) */}
                <td className="px-4 py-3 text-sm" style={{ paddingLeft: '3rem' }}>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{subTicket.idClient?.nomComplet || 'N/A'}</div>
                </td>
                {/* 2. Titre */}
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate" title={subTicket.titre}>{subTicket.titre}</td>
                {/* 3. Priorité / Statut */}
                <td className="px-4 py-3 text-sm"><div className="flex flex-col space-y-1.5 items-start"><PriorityBadge priority={subTicket.priorite} /><StatusBadge status={subTicket.statue} /></div></td>
                {/* 4. Module */}
                <td className="px-4 py-3 text-sm">{subTicket.idModule?.designation || 'N/A'}</td>
                {/* 5. Affecté à */}
                <td className="px-4 py-3 text-sm">{subEmployeNom === 'N/A' ? 'Non assigné' : subEmployeNom}</td>
                {/* 6. Échéance (vide) */}
                <td></td>
                {/* 7. Créé le (vide) */}
                <td></td>
                {/* 8. Actif (vide) */}
                <td></td>
                {/* 9. Actions pour le sous-ticket */}
                <td className="px-4 py-3"> 
                    <div className="flex items-center space-x-1">
                        <button onClick={() => onNavigateToUpdate(subTicket.id)} className="p-2 text-slate-500 hover:text-sky-500 hover:bg-sky-100 dark:hover:bg-slate-700 rounded-full" title="Modifier/Gérer"><Edit size={16}/></button>
                        <button onClick={() => alert(`Suppression pour sous-ticket ${subTicket.id}`)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full" title="Supprimer"><Trash2 size={16}/></button>
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

