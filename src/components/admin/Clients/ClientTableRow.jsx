import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { formatDateFromArray } from '../../../utils/dateFormatter'; // Assurez-vous que ce fichier existe et exporte bien formatDateFromISOString

// Composant pour afficher un badge de statut (Actif/Inactif)
const StatusBadge = ({ isActive }) => (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-md inline-flex items-center gap-2 border ${ // py-0.5 pour réduire l'espace
        isActive
        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'
        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-700'
    }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
        {isActive ? 'Actif' : 'Non actif'}
    </span>
);

// Ajout de highlightedClientId aux props, renommage onEditRequest/onDeleteRequest en onEdit/onDelete pour consistance
const ClientTableRow = ({ client, onEdit, onDelete, visibleColumns, highlightedClientId }) => {

    // Détermine si la ligne doit être surlignée
    const isHighlighted = highlightedClientId === client.id;

    return (
        // Ajout conditionnel de la classe highlight-row
        <tr className={`border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isHighlighted ? 'highlight-row' : ''}`}>
            {visibleColumns.nomComplet && (
                <td scope="row" className="px-6 py-1 text-slate-800 dark:text-slate-100 whitespace-nowrap separateur-colonne-leger">
                    <div className="font-medium">{client.nomComplet}</div>
                </td>
            )}
            {visibleColumns.regionName && (
                <td className="px-6 py-1 text-slate-600 dark:text-slate-300 separateur-colonne-leger">
                    {client.regionName || 'N/A'}
                </td>
            )}
            {visibleColumns.email && (
                 <td className="px-6 py-1 text-slate-600 dark:text-slate-300 separateur-colonne-leger">
                    {client.email || 'N/A'}
                </td>
            )}
            {visibleColumns.adress && (
                <td className="px-6 py-1 text-slate-600 dark:text-slate-300 separateur-colonne-leger truncate" title={client.adress}>
                    {client.adress || 'N/A'}
                </td>
            )}
            {visibleColumns.creePar && (
                <td className="px-6 py-1 text-slate-600 dark:text-slate-300 separateur-colonne-leger"> {/* Colonne "Créé par" */}
                    {client.userCreation || 'N/A'}
                </td>
            )}
            {visibleColumns.dateCreation && (
                <td className="px-6 py-1 text-slate-600 dark:text-slate-300 separateur-colonne-leger"> {/* Colonne "Date de création" */}
                    {formatDateFromArray(client.dateCreation)}
                </td>
            )}
            {visibleColumns.statut && (
                <td className="px-6 py-1 separateur-colonne-leger">
                    <StatusBadge isActive={client.actif} />
                </td>
            )}
            <td className="px-6 py-1 text-center">
                <div className="flex items-center justify-center space-x-2">
                    <button
                        onClick={() => onEdit(client)}
                        className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
                        title="Modifier"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(client)}
                        className={`p-2 rounded-full transition-colors ${
                            client.actif // Si le client est actif, on ne peut pas le supprimer
                                ? 'text-slate-400 cursor-not-allowed'
                                : 'text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-slate-700'
                        }`}
                        title={client.actif ? "Ne peut pas supprimer un client actif" : "Supprimer le client"}
                        disabled={client.actif}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ClientTableRow;