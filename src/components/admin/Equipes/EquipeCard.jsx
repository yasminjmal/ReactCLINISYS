import React from 'react';
import { Info, Users as UsersIcon, UserCheck } from 'lucide-react';
import defaultProfilePicImport_EquipeCard from '../../../assets/images/default-profile.png'; 

const EquipeCard = ({ equipe, onNavigateToEquipeDetails, onShowMoreMembers, isMembersExpanded }) => {
  const MAX_MEMBERS_TO_SHOW_NAMES = 3;
  const membersWithPostes = equipe.equipePosteutilisateurSet || [];
  const membersToDisplay = isMembersExpanded ? membersWithPostes : membersWithPostes.slice(0, MAX_MEMBERS_TO_SHOW_NAMES);
  const remainingMembersCount = membersWithPostes.length > MAX_MEMBERS_TO_SHOW_NAMES ? membersWithPostes.length - MAX_MEMBERS_TO_SHOW_NAMES : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col relative transition-all duration-300 hover:shadow-2xl min-h-[240px]">
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => onNavigateToEquipeDetails(equipe.id)}
          className="text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Voir détails de l'équipe"
        >
          <Info size={18} />
        </button>
      </div>
      
      <div className="mb-3 pr-10">
        <div className="flex items-center mb-1">
            <div className="p-2 bg-sky-100 dark:bg-sky-700/30 rounded-lg mr-3">
                <UsersIcon className="text-sky-600 dark:text-sky-400" size={20} />
            </div>
            <h3 
                className="text-xl font-semibold text-slate-700 dark:text-slate-100 truncate"
                title={equipe.designation}
            >
                {equipe.designation}
            </h3>
        </div>
      </div>

      <div className="mb-3 pl-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center">
            <UserCheck size={14} className="mr-1.5 text-slate-400 dark:text-slate-500"/> Chef d'équipe :
        </p>
        <div className="flex items-center space-x-2 pl-1">
            <img 
                src={equipe.chefEquipe?.profileImage || (equipe.chefEquipe?.photo ? `data:image/jpeg;base64,${equipe.chefEquipe.photo}` : defaultProfilePicImport_EquipeCard) }
                alt={equipe.chefEquipe?.nom || "Chef"} 
                className="h-7 w-7 rounded-full object-cover"
                onError={(e) => { e.currentTarget.src = defaultProfilePicImport_EquipeCard; }}
            />
            <span className="text-sm text-slate-700 dark:text-slate-200">
                {equipe.chefEquipe ? `${equipe.chefEquipe.prenom} ${equipe.chefEquipe.nom}` : 'Non assigné'}
            </span>
        </div>
      </div>

      <div className="flex-grow mb-2 pl-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Membres ({membersWithPostes.length}) :
        </p>
        {membersWithPostes.length > 0 ? (
            <div className="space-y-1 max-h-[70px] overflow-y-auto pr-1">
            {membersToDisplay.map(epu => (
                <div key={`${epu.utilisateur.id}-${epu.poste.id}`} className="flex items-center space-x-1.5">
                <img
                    src={epu.utilisateur.profileImage || (epu.utilisateur.photo ? `data:image/jpeg;base64,${epu.utilisateur.photo}`: defaultProfilePicImport_EquipeCard)}
                    alt={epu.utilisateur.nom}
                    className="h-5 w-5 rounded-full object-cover"
                    onError={(e) => { e.currentTarget.src = defaultProfilePicImport_EquipeCard; }}
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                    {epu.utilisateur.prenom} {epu.utilisateur.nom} 
                    <span className="text-slate-500 dark:text-slate-400"> ({epu.poste.designation || 'N/A'})</span>
                </span>
                </div>
            ))}
            {remainingMembersCount > 0 && (
                 <button
                    onClick={(e) => { e.stopPropagation(); onShowMoreMembers(equipe.id);}}
                    className="text-xs text-sky-500 dark:text-sky-400 mt-1 hover:underline"
                >
                    {isMembersExpanded ? 'Voir moins' : `+ ${remainingMembersCount} autre(s)`}
                </button>
            )}
            </div>
        ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">Aucun membre assigné</p>
        )}
      </div>
    </div>
  );
};
export default EquipeCard;