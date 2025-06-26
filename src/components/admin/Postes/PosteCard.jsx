import React from 'react';
import { Briefcase, Edit, Trash2 } from 'lucide-react';

const PosteCard = ({ poste, onEdit, onDelete }) => {
    
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
            {isActive ? 'Actif' : 'Inactif'}
        </span>
    );

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col transition-all duration-300 hover:shadow-md hover:border-blue-300">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 pr-4" title={poste.designation}>
                    {poste.designation}
                </h3>
                <StatusBadge isActive={poste.actif} />
            </div>

            <div className="flex-grow space-y-2 text-sm text-slate-500 dark:text-slate-400 my-4">
                <div className="flex">
                     <span className="w-24 font-medium text-slate-400">Créé par</span>
                     <span className="font-semibold text-slate-600 dark:text-slate-300">{poste.userCreation || 'N/A'}</span>
                </div>
                 <div className="flex">
                     <span className="w-24 font-medium text-slate-400">Le</span>
                     <span className="font-semibold text-slate-600 dark:text-slate-300">{formatDate(poste.dateCreation)}</span>
                </div>
            </div>
            
            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex items-center justify-end space-x-2">
                 <button onClick={() => onEdit(poste)} className="btn btn-secondary py-1 px-3 text-xs"><Edit size={14} className="mr-1"/> Modifier</button>
                 <button onClick={() => onDelete(poste)} className="btn btn-danger py-1 px-3 text-xs"><Trash2 size={14} className="mr-1"/> Supprimer</button>
            </div>
        </div>
    );
};
export default PosteCard;