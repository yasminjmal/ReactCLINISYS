import React from 'react';
import { Info, Edit, Trash2 } from 'lucide-react';
import defaultProfilePic from '../../../assets/images/default-profile.png';

// Small helper component to display status badge
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

const EquipeTableRow = ({ equipe, onEditRequest, onDeleteRequest }) => { // onNavigateToDetails renamed to onEditRequest
    // Backend returns 'utilisateurs' for the list of members
    const members = Array.isArray(equipe.utilisateurs) ? equipe.utilisateurs : [];

    return (
        <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            {/* Team Column */}
            <td className="px-6 py-4">
                <div className="font-semibold text-slate-800 dark:text-white">{equipe.designation}</div>
            </td>

            {/* Team Leader Column */}
            <td className="px-6 py-4">
                {equipe.chefEquipe ? (
                    <div className="flex items-center space-x-3">
                        <img className="h-9 w-9 rounded-full object-cover" src={equipe.chefEquipe.photoUrl || defaultProfilePic} alt={equipe.chefEquipe.nom} />
                        <div>
                            <div className="font-medium text-slate-700 dark:text-slate-200">{equipe.chefEquipe.prenom} {equipe.chefEquipe.nom}</div>
                            <div className="text-xs text-slate-500">{equipe.chefEquipe.email}</div>
                        </div>
                    </div>
                ) : (
                    <span className="text-slate-400 italic">N/A</span>
                )}
            </td>

            {/* Members Column */}
            <td className="px-6 py-4 text-center text-sm font-medium text-slate-700 dark:text-slate-200">
                {members.length}
            </td>

            {/* Status Column */}
            <td className="px-6 py-4">
                <StatusBadge isActive={equipe.actif} /> {/* Uses equipe.actif */}
            </td>

            {/* Creation Date Column */}
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                {new Date(equipe.dateCreation).toLocaleDateString('fr-FR')}
            </td>

            {/* Actions Column */}
            <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                    {/* onClick should pass the whole equipe object */}
                    <button onClick={() => onEditRequest(equipe)} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full" title="Modifier">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => onDeleteRequest(equipe)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Supprimer">
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default EquipeTableRow;