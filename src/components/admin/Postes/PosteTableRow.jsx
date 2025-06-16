// src/components/admin/Postes/PosteTableRow.jsx
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { formatDateFromArray } from '../../../utils/dateFormatter'; // <-- IMPORTER LA FONCTION

const StatusBadge = ({ isActive }) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center ${
        isActive 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }`}>
        <span className={`h-2 w-2 mr-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {isActive ? 'Actif' : 'Inactif'}
    </span>
);

const PosteTableRow = ({ poste, onEdit, onDelete }) => {
  return (
    <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
      <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
        {poste.designation}
      </th>
      <td className="px-6 py-4">
        <StatusBadge isActive={poste.actif} />
      </td>
      <td className="px-6 py-4">
        {poste.userCreation || 'N/A'}
      </td>
      <td className="px-6 py-4">
        {formatDateFromArray(poste.dateCreation)}
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center space-x-2">
            <button onClick={onEdit} className="p-2 text-sky-600 hover:text-sky-800 hover:bg-sky-100 dark:hover:bg-sky-700/50 rounded-full" title="Modifier">
                <Edit size={16} />
            </button>
            <button onClick={onDelete} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-700/50 rounded-full" title="Supprimer">
                <Trash2 size={16} />
            </button>
        </div>
      </td>
    </tr>
  );
};

export default PosteTableRow;