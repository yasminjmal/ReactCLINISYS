import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const PosteTableRow = ({ poste, onEdit, onDelete, visibleColumns }) => {

    const formatDate = (dateArray) => {
        if (!Array.isArray(dateArray) || dateArray.length < 3) return 'N/A';
        return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
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

    return (
        <tr className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
            {visibleColumns.poste && (
                <td scope="row" className="px-6 py-2 font-medium text-slate-800 dark:text-slate-100 whitespace-nowrap separateur-colonne-leger">
                    {poste.designation}
                </td>
            )}
            {visibleColumns.statut && (
                <td className="px-6 py-2 separateur-colonne-leger">
                    <StatusBadge isActive={poste.actif} />
                </td>
            )}
            {visibleColumns.creePar && (
                <td className="px-6 py-2 text-slate-600 dark:text-slate-300 separateur-colonne-leger">
                    {poste.userCreation || 'N/A'}
                </td>
            )}
            {visibleColumns.dateCreation && (
                <td className="px-6 py-2 text-slate-600 dark:text-slate-300 separateur-colonne-leger">
                    {formatDate(poste.dateCreation)}
                </td>
            )}
            <td className="px-6 py-2 text-center">
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => onEdit(poste)} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors" title="Modifier">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => onDelete(poste)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-slate-700 transition-colors" title="Supprimer">
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default PosteTableRow;