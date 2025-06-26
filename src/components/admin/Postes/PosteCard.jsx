import React from 'react';
import { Briefcase, Edit, Trash2 } from 'lucide-react';
// import { formatDateFromArray } from '../../../utils/dateFormatter';

const PosteCard = ({ poste, onEdit, onDelete }) => {
    
    const formatDate = (dateArray) => {
        if (!Array.isArray(dateArray) || dateArray.length < 3) return 'N/A';
        return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-blue-300">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Briefcase className="text-blue-600 dark:text-blue-400" size={20}/>
                    </div>
                    <h3 className="text-md font-bold text-slate-800 dark:text-slate-100" title={poste.designation}>
                        {poste.designation}
                    </h3>
                </div>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${poste.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {poste.actif ? 'Actif' : 'Inactif'}
                </span>
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