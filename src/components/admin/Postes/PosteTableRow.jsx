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
        <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-2 ${
            isActive 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300' 
            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
        }`}>
            <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
            {isActive ? 'Actif' : 'Inactif'}
        </span>
    );

    return (
        <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-blue-50/50 dark:hover:bg-slate-800">
            {visibleColumns.poste && (
                <td scope="row" className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100 whitespace-nowrap">
                    {poste.designation}
                </td>
            )}
            {visibleColumns.statut && (
                <td className="px-6 py-4">
                    <StatusBadge isActive={poste.actif} />
                </td>
            )}
            {visibleColumns.creePar && (
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {poste.userCreation || 'N/A'}
                </td>
            )}
            {visibleColumns.dateCreation && (
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {formatDate(poste.dateCreation)}
                </td>
            )}
            <td className="px-6 py-4 text-center">
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