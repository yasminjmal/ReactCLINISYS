import React from 'react';
import { Edit, Trash2 } from 'lucide-react'; // Pas besoin de PackageIcon ici
import { formatDateFromArray } from '../../../utils/dateFormatter';

const StatusBadge = ({ isActive }) => (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-md inline-flex items-center gap-2 border ${ // py-0.5 pour consistance
        isActive
        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'
        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-700'
    }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
        {isActive ? 'Actif' : 'Non actif'}
    </span>
);

const ModuleTableRow = ({ module, onEdit, onDelete, visibleColumns, highlightedModuleId }) => {
    const ticketCount = module.ticketList ? module.ticketList.length : 0;
    const equipeNom = module.equipe ? module.equipe.designation : 'N/A';
    
    // Détermine si la ligne doit être surlignée
    const isHighlighted = highlightedModuleId === module.id;

    return (
        <tr className={`border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isHighlighted ? 'highlight-row' : ''}`}>
            {visibleColumns.designation && (
                <td className="px-6 py-1 font-medium text-slate-800 dark:text-slate-100 whitespace-nowrap separateur-colonne-leger">{module.designation}</td>
            )}
            {visibleColumns.equipe && (
                <td className="px-6 py-1 text-slate-600 dark:text-slate-300 separateur-colonne-leger">{equipeNom}</td>
            )}
            {visibleColumns.tickets && (
                <td className="px-6 py-1 text-slate-600 dark:text-slate-300 separateur-colonne-leger">{ticketCount}</td>
            )}
            {visibleColumns.statut && (
                <td className="px-6 py-1 separateur-colonne-leger"><StatusBadge isActive={module.actif} /></td>
            )}
            {visibleColumns.creePar && (
                <td className="px-6 py-1 text-slate-600 dark:text-slate-300 separateur-colonne-leger">{module.userCreation || 'N/A'}</td>
            )}
            {visibleColumns.dateCreation && (
                <td className="px-6 py-1 text-slate-600 dark:text-slate-300 separateur-colonne-leger">{formatDateFromArray(module.dateCreation)}</td>
            )}
            <td className="px-6 py-1 text-center">
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => onEdit(module)} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors" title="Modifier"><Edit size={16} /></button>
                    <button onClick={() => onDelete(module)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-slate-700 transition-colors" title="Supprimer"><Trash2 size={16} /></button>
                </div>
            </td>
        </tr>
    );
};

export default ModuleTableRow;