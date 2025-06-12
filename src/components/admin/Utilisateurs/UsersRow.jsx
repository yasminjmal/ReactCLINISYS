import React from 'react';
import { MoreVertical } from 'lucide-react';
import defaultProfilePicImport_UsersRow from '../../../assets/images/default-profile.png';

const UsersRow = ({ user, onShowMoreTeams, isTeamsExpanded, onNavigateToDetails }) => {
  const MAX_TEAMS_DISPLAYED = 2;
  const teamsToShow = isTeamsExpanded ? user.equipes : user.equipes.slice(0, MAX_TEAMS_DISPLAYED);
  const remainingTeamsCount = user.equipes.length - MAX_TEAMS_DISPLAYED;
  const imageSrc = user.profileImage || defaultProfilePicImport_UsersRow;
  const posteTextColor = user.role === 'chef_equipe' ? 'text-red-500 dark:text-red-400' : 'text-slate-600 dark:text-slate-300';

  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-md flex items-center p-3 space-x-4 transition-all duration-300 hover:shadow-md">
      <img
        src={imageSrc} 
        alt={`${user.prenom} ${user.nom}`}
        className="h-12 w-12 rounded-full object-cover"
        onError={(e) => { e.currentTarget.src = defaultProfilePicImport_UsersRow; }}
      />
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 items-center">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.prenom} {user.nom}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-40">{user.email}</p>
        </div>
        <p className={`text-sm ${posteTextColor} hidden sm:block font-medium`}>{user.poste}</p>
        <div className="text-xs text-slate-600 dark:text-slate-300 hidden md:block">
          <div className="flex flex-wrap gap-1 items-center">
            {teamsToShow.map(equipe => (
              <span key={equipe.id} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-1.5 py-0.5 rounded-full">
                {equipe.nom}
              </span>
            ))}
            {remainingTeamsCount > 0 && !isTeamsExpanded && (
              <button
                onClick={() => onShowMoreTeams(user.id)}
                className="text-xs text-sky-500 dark:text-sky-400 hover:underline"
              >
                +{remainingTeamsCount}
              </button>
            )}
          </div>
        </div>
        <div className={`h-2.5 w-2.5 rounded-full ml-auto hidden md:block ${user.actif ? 'bg-green-500' : 'bg-red-500'}`} title={user.actif ? 'Actif' : 'Non Actif'}></div>
      </div>
      <button 
        onClick={() => onNavigateToDetails(user.id)}
        className="text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        title="Voir détails/actions"
      >
        <MoreVertical size={20} />
      </button>
    </div>
  );
};
export default UsersRow;