import React from 'react';
import { Edit, Trash2, Users as UsersIcon, UserCheck } from 'lucide-react';
import defaultProfilePic from '../../../assets/images/default-profile.png';

const EquipeCard = ({ equipe, onEditRequest, onDeleteRequest }) => {
    const members = Array.isArray(equipe.utilisateurs) ? equipe.utilisateurs : [];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col relative transition-all duration-300 hover:shadow-2xl min-h-[250px]">
            {/* Display active/inactive status */}
            <div className={`absolute top-4 left-4 px-2 py-1 text-xs font-semibold rounded-full flex items-center ${equipe.actif ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                <span className={`h-2 w-2 mr-2 rounded-full ${equipe.actif ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {equipe.actif ? 'Actif' : 'Inactif'}
            </div>

            <div className="absolute top-4 right-4 flex space-x-1">
                <button onClick={() => onEditRequest(equipe)} className="p-1.5 rounded-full text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-700" title="Modifier">
                    <Edit size={16} />
                </button>
                <button onClick={() => onDeleteRequest(equipe)} className="p-1.5 rounded-full text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700" title="Supprimer">
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="mb-3 pt-8">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100 truncate" title={equipe.designation}>{equipe.designation}</h3>
            </div>

            <div className="mb-3 pl-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center"><UserCheck size={14} className="mr-1.5"/> Chef :</p>
                <div className="flex items-center space-x-2 pl-1">
                    <img src={equipe.chefEquipe?.photoUrl || defaultProfilePic} alt={equipe.chefEquipe?.nom || "Chef"} className="h-7 w-7 rounded-full object-cover"/>
                    <span className="text-sm text-slate-700 dark:text-slate-200">{equipe.chefEquipe ? `${equipe.chefEquipe.prenom} ${equipe.chefEquipe.nom}` : 'N/A'}</span>
                </div>
            </div>

            <div className="flex-grow">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Membres ({members.length})</p>
                {/* Display members here if needed */}
            </div>
        </div>
    );
};
export default EquipeCard;