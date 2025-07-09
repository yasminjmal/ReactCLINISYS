// src/components/chefEquipe/TicketRow.jsx
import React from 'react';
import { Edit, Info, Calendar } from 'lucide-react'; // Removed XCircle as "Refuser" is out

import { formatDateFromArray } from '../../utils/dateFormatter'; // Import the utility function

// --- Sous-composants visuels ---
// Removed getProfileImageUrl as no image is needed for client
// Removed PriorityIndicator as it's not directly related to this request. Assume it's still used if needed elsewhere.

const PriorityIndicator = ({ priority }) => { // Kept for completeness, assume it's still desired for priority column
    const normalizedPriority = priority?.toUpperCase();
    let colorClass = 'bg-gray-300';

    switch (normalizedPriority) {
        case 'HAUTE':
            colorClass = 'bg-red-500';
            break;
        case 'MOYENNE':
            colorClass = 'bg-blue-500';
            break;
        case 'BASSE':
            colorClass = 'bg-green-500';
            break;
        default:
            colorClass = 'bg-gray-300';
    }

    return <span className={`inline-block h-2.5 w-2.5 rounded-full ${colorClass}`}></span>;
};

const StatusBadge = ({ status }) => {
    const styles = {
        'En_attente': 'bg-blue-100 text-blue-700',
        'En_cours': 'bg-yellow-100 text-yellow-700',
        'Accepte': 'bg-cyan-100 text-cyan-700',
        'Termine': 'bg-emerald-100 text-emerald-700',
        'Refuse': 'bg-red-100 text-red-700',
    };
    const formattedStatus = status ? status.replace(/_/g, ' ') : 'N/A';
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles?.[status] || 'bg-gray-100 text-gray-700'}`}>{formattedStatus}</span>;
};

const TicketRow = ({ ticket, onOpenModal, showDebutTraitementColumn }) => {
    // Using the imported utility function for date formatting
    const formatDate = (dateInput) => {
        return formatDateFromArray(dateInput);
    };

    return (
        <tr className="hover:bg-gray-50">
            {/* Client column: Only nomComplet, no image, no Ref */}
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                {ticket.idClient?.nomComplet || 'N/A'}
            </td>
            <td className="px-4 py-2 text-sm text-gray-500">{ticket.titre}</td>
            <td className="px-4 py-2 text-sm text-gray-500">{ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom} ${ticket.idUtilisateur.nom}` : <span className="italic text-gray-400">Non assigné</span>}</td>
            <td className="px-4 py-2 text-sm text-gray-500">{formatDate(ticket.dateCreation)}</td>
            {showDebutTraitementColumn && (
                <td className="px-4 py-2 text-sm text-gray-500">{ticket.debutTraitement ? formatDate(ticket.debutTraitement) : 'N/A'}</td>
            )}
            <td className="px-4 py-2">
                <PriorityIndicator priority={ticket.priorite} />
            </td>
            <td className="px-4 py-2">
                <StatusBadge status={ticket.statue} />
            </td>
            <td className="px-4 py-2 text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                    {/* "Modifier affectation" button */}
                    <button onClick={() => onOpenModal('assign', ticket)} className="text-indigo-600 hover:text-indigo-900" title="Modifier l'affectation">
                        <Edit className="h-4 w-4" />
                    </button>
                    {/* "Ajouter date d'échéance" button - only if not already resolved/refused */}
                    {ticket.statue !== 'Termine' && ticket.statue !== 'Refuse' && (
                        <button onClick={() => onOpenModal('date', ticket)} className="text-green-600 hover:text-green-900" title="Ajouter date d'échéance">
                            <Calendar className="h-4 w-4" />
                        </button>
                    )}
                    {/* "Détail" button */}
                    <button onClick={() => onOpenModal('detail', ticket)} className="text-gray-600 hover:text-gray-900" title="Voir les détails">
                        <Info className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default TicketRow;