import React from 'react';
import { Edit, Trash2, Package as PackageIcon } from 'lucide-react';
import { formatDateFromArray } from '../../../utils/dateFormatter';

const StatusBadge = ({ isActive }) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center ${isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
        <span className={`h-2 w-2 mr-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {isActive ? 'Actif' : 'Inactif'}
    </span>
);

const ModuleTableRow = ({ module, onEdit, onDelete }) => {
    const ticketCount = module.ticketList ? module.ticketList.length : 0;
    const equipeNom = module.equipe ? module.equipe.designation : 'N/A';
    
    return (
        <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{module.designation}</td>
            <td className="px-6 py-4"><StatusBadge isActive={module.actif} /></td>
            <td className="px-6 py-4">{equipeNom}</td>
            <td className="px-6 py-4">{module.userCreation || 'N/A'}</td>
            <td className="px-6 py-4">{formatDateFromArray(module.dateCreation)}</td>
            {/* CHANGEMENT ICI : Suppression de la classe "text-center" */}
            <td className="px-6 py-4">{ticketCount}</td>
            <td className="px-6 py-4">
                 {/* CHANGEMENT ICI : Suppression de "justify-center" pour aligner à gauche */}
                <div className="flex items-center space-x-2">
                    <button onClick={onEdit} className="p-2 text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-700/50 rounded-full" title="Modifier"><Edit size={16} /></button>
                    <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-700/50 rounded-full" title="Supprimer"><Trash2 size={16} /></button>
                </div>
            </td>
        </tr>
    );
};

export default ModuleTableRow;