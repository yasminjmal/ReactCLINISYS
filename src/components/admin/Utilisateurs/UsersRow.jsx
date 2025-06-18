import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import defaultProfilePic from '../../../assets/images/default-profile.png';

const UsersRow = ({ user, onEdit, onDelete }) => {
    const photoUrl = user.photo ? `data:image/jpeg;base64,${user.photo}` : defaultProfilePic;
    
    const roleMap = {
        'A': { text: 'Admin', color: 'text-red-500' },
        'C': { text: 'Chef d\'équipe', color: 'text-yellow-600' },
        'E': { text: 'Utilisateur', color: 'text-sky-600' }
    };
    const { text: roleText, color: roleColor } = roleMap[user.role] || { text: user.role, color: 'text-slate-500' };

    return (
        <div className="bg-white dark:bg-slate-800 shadow rounded-md flex items-center p-3 space-x-4 transition-all hover:shadow-md">
            <img src={photoUrl} alt={`${user.prenom} ${user.nom}`} className="h-12 w-12 rounded-full object-cover" onError={(e) => { e.currentTarget.src = defaultProfilePic; }}/>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-x-4 items-center">
                <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.prenom} {user.nom}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-40">{user.email}</p>
                </div>
                <p className={`text-sm font-medium hidden sm:block ${roleColor}`}>{roleText}</p>
                <div className="text-xs text-slate-600 dark:text-slate-300 hidden md:block">
                    <div className="flex flex-wrap gap-1 items-center">
                         {user.equipePosteSet?.length > 0 ? user.equipePosteSet.map(ep => (
                            <span key={`${ep.equipe?.id}-${ep.poste?.id}`} className="bg-slate-100 text-xs px-1.5 py-0.5 rounded-full">{ep.equipe?.designation}</span>
                        )) : <span className="text-xs italic">N/A</span>}
                    </div>
                </div>
                <div className={`h-2.5 w-2.5 rounded-full ml-auto hidden md:block ${user.actif ? 'bg-green-500' : 'bg-red-500'}`} title={user.actif ? 'Actif' : 'Inactif'}></div>
            </div>
            <div className="flex items-center space-x-1">
                <button onClick={() => onEdit(user)} className="p-2 text-slate-500 hover:text-sky-600 rounded-full hover:bg-slate-100" title="Modifier"><Edit size={18} /></button>
                <button onClick={() => onDelete(user)} className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-100" title="Supprimer"><Trash2 size={18} /></button>
            </div>
        </div>
    );
};
export default UsersRow;