import React from 'react';
import { Edit, Trash2, User as UserIcon, ShieldCheck, ShieldOff } from 'lucide-react';

const ClientRow = ({ client, onEditRequest, onDeleteRequest }) => {
    return (
        <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg flex items-center p-3.5 space-x-4 transition-shadow duration-200">
            <div className="flex-none w-10 h-10 bg-green-100 dark:bg-green-700/30 rounded-lg flex items-center justify-center">
                <UserIcon className="text-green-600 dark:text-green-400" size={20} />
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-x-4 items-center min-w-0">
                <div className="truncate sm:col-span-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={client.nomComplet}>{client.nomComplet}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={client.email}>{client.email}</p>
                </div>
                <div className="hidden sm:block text-sm text-slate-600 dark:text-slate-300 truncate">
                    {client.adresse}
                </div>
                <div className="hidden sm:flex items-center space-x-2 text-xs font-medium">
                    {client.actif 
                        ? <span className="flex items-center text-green-600"><ShieldCheck size={14} className="mr-1"/> Actif</span> 
                        : <span className="flex items-center text-red-600"><ShieldOff size={14} className="mr-1"/> Inactif</span>
                    }
                </div>
            </div>

            <div className="flex items-center space-x-1">
                <button onClick={() => onEditRequest(client)} className="p-2 text-slate-500 hover:text-sky-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Modifier">
                    <Edit size={16} />
                </button>
                <button onClick={() => onDeleteRequest(client)} className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Supprimer">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

export default ClientRow;