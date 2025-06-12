import React from 'react';
import { Info, Users as UsersIcon, UserCheck } from 'lucide-react'; // Edit3 et Trash2 enlevées d'ici, seront sur la page de détails
import defaultProfilePicImport_EquipeCard from '../../../assets/images/default-profile.png';

const EquipeCard = ({ equipe, onNavigateToEquipeDetails, onShowMoreMembers, isMembersExpanded }) => {
  const MAX_MEMBERS_TO_SHOW_NAMES = 3;
  const members = Array.isArray(equipe.membres) ? equipe.membres : [];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col relative transition-all duration-300 hover:shadow-2xl min-h-[240px]">
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => onNavigateToEquipeDetails(equipe.id)}
          className="text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Voir détails de l'équipe"
        >
          <Info size={18} /> {/* Icône Info pour "détails" */}
        </button>
      </div>
      
      <div className="mb-3 pr-10"> {/* Espace pour l'icône détails */}
        <div className="flex items-center mb-1">
            <div className="p-2 bg-sky-100 dark:bg-sky-700/30 rounded-lg mr-3">
                <UsersIcon className="text-sky-600 dark:text-sky-400" size={20} />
            </div>
            <h3 
                className="text-xl font-semibold text-slate-700 dark:text-slate-100 truncate"
                title={equipe.nom}
            >
                {equipe.nom}
            </h3>
        </div>
      </div>

      <div className="mb-3 pl-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center">
            <UserCheck size={14} className="mr-1.5 text-slate-400 dark:text-slate-500"/> Chef d'équipe :
        </p>
        <div className="flex items-center space-x-2 pl-1">
            <img 
                src={equipe.chefEquipe?.profileImage || defaultProfilePicImport_EquipeCard} 
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
            Membres ({members.length}) :
        </p>
        {members.length > 0 ? (
            <div className="space-y-1.5 max-h-[70px] overflow-y-auto pr-1">
            {members.slice(0, MAX_MEMBERS_TO_SHOW_NAMES).map(membre => (
                <div key={membre.id} className="flex items-center space-x-1.5">
                <img
                    src={membre.profileImage || defaultProfilePicImport_EquipeCard}
                    alt={membre.nom}
                    className="h-5 w-5 rounded-full object-cover"
                    onError={(e) => { e.currentTarget.src = defaultProfilePicImport_EquipeCard; }}
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                    {membre.prenom} {membre.nom} 
                    <span className="text-slate-500 dark:text-slate-400"> ({membre.poste || 'N/A'})</span>
                </span>
                </div>
            ))}
            {members.length > MAX_MEMBERS_TO_SHOW_NAMES && (
                 <button
                    onClick={(e) => { e.stopPropagation(); onShowMoreMembers(equipe.id);}} // Ajout de stopPropagation
                    className="text-xs text-sky-500 dark:text-sky-400 mt-1 hover:underline"
                >
                    + {members.length - MAX_MEMBERS_TO_SHOW_NAMES} autre(s) membre(s)
                </button>
            )}
            </div>
        ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">Aucun membre assigné</p>
        )}
      </div>
      {/* Statut actif/inactif enlevé */}
    </div>
  );
};
export default EquipeCard;