import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import defaultProfilePic from '../../../assets/images/default-profile.png';

const UsersCard = ({ user, onEdit, onDelete }) => {
    const photoUrl = user.photo ? `data:image/jpeg;base64,${user.photo}` : defaultProfilePic;

    const roleMap = {
        'A': { text: 'Admin', color: 'text-red-500' },
        'C': { text: 'Chef d\'équipe', color: 'text-yellow-600' },
        'E': { text: 'Utilisateur', color: 'text-sky-600' }
    };
    const { text: roleText, color: roleColor } = roleMap[user.role] || { text: user.role, color: 'text-slate-500' };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 flex flex-col relative transition-all duration-300 hover:shadow-xl min-h-[200px]">
            <div className="absolute top-3 right-3 flex items-center space-x-1">
                <button onClick={() => onEdit(user)} className="p-2 text-slate-500 hover:text-sky-600 rounded-full hover:bg-slate-100" title="Modifier"><Edit size={16}/></button>
                <button onClick={() => onDelete(user)} className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-100" title="Supprimer"><Trash2 size={16}/></button>
            </div>
            <div className="flex items-center space-x-4 mb-3">
                <img src={photoUrl} alt={`${user.prenom} ${user.nom}`} className="h-16 w-16 rounded-full object-cover border-2 border-slate-200" onError={(e) => { e.currentTarget.src = defaultProfilePic; }}/>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{user.prenom} {user.nom}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-40">{user.email}</p>
                    <p className={`text-sm font-medium ${roleColor}`}>{roleText}</p>
                </div>
            </div>
            <div className="mb-3 flex-grow">
                <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Équipes / Postes :</h4>
                <div className="flex flex-wrap gap-1">
                    {user.equipePosteSet?.length > 0 ? user.equipePosteSet.map(ep => (
                        <span key={`${ep.equipe?.id}-${ep.poste?.id}`} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">
                            {ep.equipe?.designation}
                        </span>
                    )) : <span className="text-xs italic text-slate-400">Aucune équipe</span>}
                </div>
            </div>
            <div className={`absolute bottom-3 right-3 h-3 w-3 rounded-full ${user.actif ? 'bg-green-500' : 'bg-red-500'}`} title={user.actif ? 'Actif' : 'Inactif'}></div>
        </div>
    );
};
export default UsersCard;