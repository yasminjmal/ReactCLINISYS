import React from 'react';
import { Package as PackageIconRow, Edit, Trash2, Users, User as UserIcon, Ticket as TicketIcon } from 'lucide-react';

const RowStatusBadge = ({ isActive }) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center ${isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
        <span className={`h-2 w-2 mr-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {isActive ? 'Actif' : 'Inactif'}
    </span>
);

const ModuleRow = ({ module, onEdit, onDelete }) => {
  const ticketCount = module.ticketList ? module.ticketList.length : 0;
  const equipeNom = module.equipe ? module.equipe.designation : 'Non assignée';

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg flex items-center p-3.5 space-x-4">
      <div className="flex-none w-10 h-10 bg-indigo-100 dark:bg-indigo-700/30 rounded-lg flex items-center justify-center"><PackageIconRow className="text-indigo-600 dark:text-indigo-400" size={20} /></div>
      
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-6 gap-x-4 items-center min-w-0">
        <div className="truncate sm:col-span-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={module.designation}>{module.designation}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">ID: {module.id}</p>
        </div>
        <div className="hidden sm:block">
            <RowStatusBadge isActive={module.actif} />
        </div>
        <div className="hidden sm:flex items-center space-x-1.5 truncate">
            <Users size={14} className="text-slate-500 dark:text-slate-400 flex-shrink-0"/>
            <span className="text-sm text-slate-600 dark:text-slate-300 truncate" title={equipeNom}>{equipeNom}</span>
        </div>
        <div className="hidden sm:flex items-center space-x-1.5 truncate">
            <UserIcon size={14} className="text-slate-500 dark:text-slate-400 flex-shrink-0"/>
            <span className="text-sm text-slate-600 dark:text-slate-300 truncate" title={module.userCreation}>{module.userCreation || 'N/A'}</span>
        </div>
        <div className="hidden sm:flex items-center space-x-1.5 text-sm text-slate-600 dark:text-slate-300 justify-start sm:justify-end">
            <TicketIcon size={14} className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
           <span>{ticketCount}</span>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <button onClick={onEdit} className="p-2 text-slate-500 hover:text-sky-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Modifier"><Edit size={16}/></button>
        <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Supprimer"><Trash2 size={16}/></button>
      </div>
    </div>
  );
};
export default ModuleRow;