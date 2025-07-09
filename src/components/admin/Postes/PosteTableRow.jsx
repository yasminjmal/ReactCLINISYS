import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { formatDateFromArray } from '../../../utils/dateFormatter';

// Ajout de highlightedPostId aux props
const PosteTableRow = ({ poste, onEdit, onDelete, visibleColumns, highlightedPostId }) => {

   const formatDate = (isoString) => {
    return formatDateFromArray(isoString)
};


    const StatusBadge = ({ isActive }) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-md inline-flex items-center gap-2 border ${
            isActive
            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'
            : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-700'
        }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
            {isActive ? 'Actif' : 'Non actif'}
        </span>
    );

    // Détermine si le bouton de suppression doit être désactivé
    const isDeleteDisabled = poste.actif;
    // Message de l'infobulle pour le bouton de suppression
    const deleteTooltip = isDeleteDisabled ? "On ne peut pas supprimer un poste actif" : "Supprimer le poste";

    // Détermine si la ligne doit être surlignée
    const isHighlighted = highlightedPostId === poste.id;

    return (
        // Ajout conditionnel de la classe highlight-row
        <tr className={`border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isHighlighted ? 'highlight-row' : ''}`}>
            {visibleColumns.poste && (
                <td scope="row" className="px-6 py-1 font-medium text-slate-800 dark:text-slate-100 whitespace-nowrap separateur-colonne-leger">
                    {poste.designation}
                </td>
            )}
            {visibleColumns.statut && (
                <td className="px-6 py-1 separateur-colonne-leger">
                    <StatusBadge isActive={poste.actif} />
                </td>
            )}
            {visibleColumns.creePar && (
                <td className="px-6 py-1 text-slate-600 dark:text-slate-300 separateur-colonne-leger">
                    {poste.userCreation || 'N/A'}
                </td>
            )}
            {visibleColumns.dateCreation && (
                <td className="px-6 py-1 text-slate-600 dark:text-slate-300 separateur-colonne-leger">
                    {formatDate(poste.dateCreation)}
                </td>
            )}
            <td className="px-6 py-1 text-center">
                <div className="flex items-center justify-center space-x-2">
                    <button
                        onClick={() => onEdit(poste)}
                        className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
                        title="Modifier"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => !isDeleteDisabled && onDelete(poste)} // Empêche l'appel si désactivé
                        className={`p-2 rounded-full transition-colors ${
                            isDeleteDisabled
                                ? 'text-slate-400 cursor-not-allowed' // Styles pour désactivé
                                : 'text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-slate-700' // Styles normaux
                        }`}
                        title={deleteTooltip} // Utilise l'infobulle dynamique
                        disabled={isDeleteDisabled} // Désactive le bouton
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default PosteTableRow;