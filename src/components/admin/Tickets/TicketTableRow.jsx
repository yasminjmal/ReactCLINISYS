// src/components/admin/Tickets/TicketTableRow.jsx
import React, { Fragment } from 'react';
import { Edit, Trash2, Info, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { formatDateFromArray } from '../../../utils/dateFormatterTicket';
import ticketService from '../../../services/ticketService';
import { ToastContainer, toast } from 'react-toastify';

// --- Petits composants pour les badges ---
const PriorityBadge = ({ priority }) => {
  const normalizedPriority = priority?.toUpperCase();
  let dotColors = ['bg-slate-300', 'bg-slate-300', 'bg-slate-300']; // Tous gris par défaut (vides)

  switch (normalizedPriority) {
    case 'HAUTE':
      dotColors = ['bg-red-500', 'bg-red-500', 'bg-red-500']; // Trois cercles rouges
      break;
    case 'MOYENNE':
      dotColors = ['bg-blue-500', 'bg-blue-500', 'bg-slate-300']; // Deux cercles bleus, un gris
      break;
    case 'BASSE':
      dotColors = ['bg-green-500', 'bg-slate-300', 'bg-slate-300']; // Un cercle vert, deux gris
      break;
    default:
      dotColors = ['bg-slate-300', 'bg-slate-300', 'bg-slate-300'];
  }

  return (
    // MODIFICATION: Suppression de 'inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-md gap-1 border'
    // et de `colorClass` pour n'afficher que les points.
    // Ajout de 'flex' et 'justify-center' pour centrer les points dans la cellule.
    <span className="flex items-center justify-center gap-1"> {/* Simplification du style */}
      {dotColors.map((dotColor, index) => (
        <span key={index} className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
      ))}
      {/* MODIFICATION: Suppression du texte de la priorité */}
      {/* <span>{priority || 'N/A'}</span> */}
    </span>
  );
};
const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';

    let date;

    if (Array.isArray(dateInput) && dateInput.length >= 3) {
        const [year, month, day, hours = 0, minutes = 0, seconds = 0] = dateInput;
        date = new Date(year, month - 1, day, hours, minutes, seconds);
    } else {
        // ISO 8601 string like "2025-07-04T00:00:00"
        date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) {
        console.error('Invalid date input:', dateInput);
        return 'Date invalide';
    }

    return date.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};



const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toUpperCase();
  let text = status || 'N/A';
  let className = 'text-slate-500'; // Couleur par défaut

  switch (normalizedStatus) {
    case 'EN_COURS':
      text = 'En cours';
      className = 'text-orange-600 dark:text-orange-400'; // Orange
      break;
    case 'EN_ATTENTE':
      text = 'En attente';
      className = 'text-gray-600 dark:text-gray-400'; // Gris (utilisé grey pour une meilleure visibilité)
      break;
    case 'ACCEPTE':
      text = 'Accepté';
      className = 'text-green-600 dark:text-green-400'; // Vert
      break;
    case 'REFUSE':
      text = 'Refusé';
      className = 'text-red-600 dark:text-red-400'; // Rouge
      break;
    case 'TERMINE':
      text = 'Terminé';
      className = 'text-blue-600 dark:text-blue-400'; // Bleu
      break;
    // Les autres statuts comme RESOLU, FERME conserveront leurs couleurs existantes si déjà définies,
    // sinon ils prendront le style par défaut ou pourront être ajoutés ici si nécessaire.
    case 'RESOLU':
      text = 'Résolu';
      className = 'text-teal-600 dark:text-teal-400';
      break;
    case 'FERME':
      text = 'Fermé';
      className = 'text-slate-600 dark:text-slate-400'; // Gris légèrement plus foncé pour Fermé
      break;
  }
  return <span className={`text-xs font-semibold ${className}`}>{text}</span>;
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

   const handleDeleteTicket = async (ticket) => {
    if (ticket.idUtilisateur == null && ticket.idModule == null && !hasSubTickets) {
        try {
            await ticketService.deleteTicket(ticket.id);
            toast.success("Ticket deleted successfully");
        } catch (error) {
            console.error("Failed to delete ticket:", error);
            toast.error("Error while deleting ticket");
        }
    } else {
        toast.error("❌ Cannot delete a ticket that is assigned to a user or module");
    }

    
}


    const clientNom = ticket.idClient?.nomComplet || ticket.client || 'N/A';
    const demandeurNom = ticket.userCreation || (ticket.demandeur ? `${ticket.demandeur.prenom} ${ticket.demandeur.nom}`.trim() : 'N/A');
    const employeNom = ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom || ''} ${ticket.idUtilisateur.nom || ''}`.trim() : 'N/A';

    // Ligne pour le ticket parent
    const parentRow = (
        <tr className={`bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-200 dark:border-slate-700 ${isHighlighted ? 'highlight-row' : ''}`}>
            {/* Colonne ST (Sous-tickets) */}
            <td className="px-1 py-1 text-sm separateur-colonne-leger text-center" style={{ width: '40px' }}> {/* Très petite colonne */}
                <button
                    onClick={() => hasSubTickets && onToggleExpand(ticket.id)}
                    disabled={!hasSubTickets}
                    className={`flex items-center justify-center space-x-0.5 p-1 rounded-md text-xs transition-colors ${!hasSubTickets ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    title={hasSubTickets ? "Afficher/Masquer les sous-tickets" : "Aucun sous-ticket"}
                >
                    <span className={`font-bold text-xs px-1 py-0.5 rounded-sm ${!hasSubTickets ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-300 dark:bg-slate-600'}`}>{ticket.childTickets?.length || 0}</span>
                    {hasSubTickets && (isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </button>
            </td>
            {/* Colonne Client */}
            {visibleColumns.client && ( // Nouvelle colonne client
                <td className="px-4 py-1 text-sm separateur-colonne-leger">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{clientNom}</div>
                </td>
            )}
            {/* Colonne Demandeur */}
            {visibleColumns.demandeur && ( // Nouvelle colonne demandeur
                <td className="px-3 py-1 text-sm separateur-colonne-leger">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{demandeurNom}</div>
                </td>
            )}
            {visibleColumns.titre && (
                <td className="px-4 py-1 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate separateur-colonne-leger" title={ticket.titre}>
                    {ticket.titre}
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
                <td className="px-2 py-1 text-sm text-slate-500 separateur-colonne-leger">
                    {formatDate(ticket.date_echeance)}
                </td>
            )}
            {visibleColumns.dateCreation && (
                <td className="px-2 py-1 text-sm text-slate-500 separateur-colonne-leger">
                    {formatDate(ticket.dateCreation)}
                </td>
            )}
            {visibleColumns.priorite &&(
                <td className="px-2 py-1 text-sm separateur-colonne-leger">
                    <PriorityBadge priority={ticket.priorite} />
                </td>
            )}
            {visibleColumns.statut && ( 
                <td className="px-2 py-1 text-sm separateur-colonne-leger">
                    <StatusBadge status={ticket.statue} />
                </td>
            )}
            {visibleColumns.actif && (
                <td className="px-2 py-1 separateur-colonne-leger">
                    <ActifBadge actif={ticket.actif} />
                </td>
            )}
            <td className="px-4 py-1">
                <div className="flex items-center space-x-1">
                    {/* Les actions de la ligne */}
                    <button onClick={() => onNavigateToUpdate(ticket.id)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-full" title="Modifier/Gérer"><Edit size={16}/></button>
                    <button onClick={() => handleDeleteTicket(ticket)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full" title="Supprimer"><Trash2 size={16}/></button>
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
                <td className="px-1 py-1 text-sm separateur-colonne-leger">
                    <span className="ml-4 text-slate-400">↳</span> {/* Indentation visuelle */}
                </td>
                {visibleColumns.client && (
                    <td className="px-4 py-1 text-sm separateur-colonne-leger">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{subTicket.idClient?.nomComplet || 'N/A'}</div>
                    </td>
                )}
                {visibleColumns.demandeur && (
                    <td className="px-3 py-1 text-sm separateur-colonne-leger">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Sous-ticket</div> {/* Indication visuelle */}
                    </td>
                )}
                {visibleColumns.titre && (
                    <td className="px-4 py-1 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate separateur-colonne-leger" title={subTicket.titre}>{subTicket.titre}</td>
                )}
                {visibleColumns.module && (
                    <td className="px-4 py-1 text-sm separateur-colonne-leger">{subTicket.idModule?.designation || 'N/A'}</td>
                )}
                {visibleColumns.affecteA && (
                    <td className="px-4 py-1 text-sm separateur-colonne-leger">{subEmployeNom === 'N/A' ? 'Non assigné' : subEmployeNom}</td>
                )}
                {visibleColumns.dateEcheance && (
                    <td className="px-2 py-1 text-sm text-slate-500 separateur-colonne-leger">{formatDateFromArray(subTicket.date_echeance)}</td>
                )}
                {visibleColumns.dateCreation && (
                    <td className="px-2 py-1 text-sm text-slate-500 separateur-colonne-leger">{formatDateFromArray(subTicket.dateCreation)}</td>
                )}
                {visibleColumns.priorite && (
                    <td className="px-2 py-1 text-sm separateur-colonne-leger">
                        <PriorityBadge priority={subTicket.priorite} />
                    </td>
                )}
                {visibleColumns.statut && (
                    <td className="px-2 py-1 text-sm separateur-colonne-leger">
                        <StatusBadge status={subTicket.statue} />
                    </td>
                )}
                {visibleColumns.actif && (
                    <td className="px-2 py-1 separateur-colonne-leger">
                        <ActifBadge actif={subTicket.actif} />
                    </td>
                )}
                <td className="px-4 py-1"> 
                    <div className="flex items-center justify-center space-x-1">
                        <button onClick={() => onNavigateToUpdate(subTicket.id)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-full" title="Modifier/Gérer"><Edit size={16}/></button>
                        <button onClick={() => alert(`Suppression pour sous-ticket ${subTicket.id}`)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full" title="Supprimer"><Trash2 size={16}/></button>
                        <button onClick={() => onNavigateToDetails(subTicket.id)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-slate-700 rounded-full" title="Détails du sous-ticket"><Info size={16}/></button>

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