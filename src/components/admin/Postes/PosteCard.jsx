// src/components/admin/Postes/PosteCard.jsx
import React from 'react';
import { Briefcase, Edit, Trash2, User, Calendar } from 'lucide-react';
import { formatDateFromArray } from '../../../utils/dateFormatter'; // <-- IMPORTER LA FONCTION

const StatusBadge = ({ isActive }) => (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
        isActive 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }`}>
        {isActive ? 'Actif' : 'Inactif'}
    </span>
);

const PosteCard = ({ poste, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="absolute top-3 right-3 flex items-center space-x-1">
             <button onClick={onEdit} className="p-2 text-slate-500 hover:text-sky-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Modifier">
                <Edit size={16}/>
              </button>
              <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Supprimer">
                <Trash2 size={16}/>
              </button>
        </div>

        <div className="flex items-start mb-4">
             <div className="p-3 bg-amber-100 dark:bg-amber-700/30 rounded-lg mr-4">
                <Briefcase className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
            <div className="flex-1 pr-8">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate" title={poste.designation}>
                    {poste.designation}
                </h3>
            </div>
        </div>

        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 dark:text-slate-400">Statut</span>
                <StatusBadge isActive={poste.actif} />
            </div>
            <div className="flex items-center">
                 <User size={14} className="mr-2 text-slate-400"/>
                 <span>Créé par: <span className="font-semibold">{poste.userCreation || 'N/A'}</span></span>
            </div>
             <div className="flex items-center">
                 <Calendar size={14} className="mr-2 text-slate-400"/>
                 <span>Créé le: <span className="font-semibold">{formatDateFromArray(poste.dateCreation)}</span></span>
            </div>
        </div>
    </div>
  );
};
export default PosteCard;