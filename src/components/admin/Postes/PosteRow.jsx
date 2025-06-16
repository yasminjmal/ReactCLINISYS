// src/components/admin/Postes/PosteRow.jsx
import React from 'react';
import { Briefcase, Edit, Trash2 } from 'lucide-react';
import { formatDateFromArray } from '../../../utils/dateFormatter'; // <-- IMPORTER LA FONCTION

const StatusBadge = ({ isActive }) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center ${
        isActive 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }`}>
        {isActive ? 'Actif' : 'Inactif'}
    </span>
);

const PosteRow = ({ poste, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg flex items-center p-3 space-x-4 transition-shadow duration-200">
      <div className="flex-none w-10 h-10 bg-amber-100 dark:bg-amber-700/30 rounded-lg flex items-center justify-center">
        <Briefcase className="text-amber-600 dark:text-amber-400" size={20} />
      </div>
      
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-x-4 items-center min-w-0">
        <div className="truncate sm:col-span-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={poste.designation}>
            {poste.designation}
          </p>
          
        </div>
        
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <StatusBadge isActive={poste.actif} />
        </div>

        <div className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
          <p className="font-semibold">{poste.userCreation || 'N/A'}</p>
          <p className="text-xs">{formatDateFromArray(poste.dateCreation)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
         <button onClick={onEdit} className="p-2 text-slate-500 hover:text-sky-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Modifier">
            <Edit size={16}/>
          </button>
          <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Supprimer">
            <Trash2 size={16}/>
          </button>
      </div>
    </div>
  );
};
export default PosteRow;