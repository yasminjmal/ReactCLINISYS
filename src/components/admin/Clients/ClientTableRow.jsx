import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const StatusBadge = ({ isActive }) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center ${ isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }`}>
        <span className={`h-2 w-2 mr-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {isActive ? 'Actif' : 'Inactif'}
    </span>
);

const ClientTableRow = ({ client, onEditRequest, onDeleteRequest }) => {
    return (
        <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">{client.nomComplet}</td>
            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{client.email}</td>
            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{client.telephone}</td>
            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{client.adresse}</td>
            <td className="px-6 py-4"><StatusBadge isActive={client.actif} /></td>
            <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => onEditRequest(client)} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full" title="Modifier">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => onDeleteRequest(client)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Supprimer">
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ClientTableRow;