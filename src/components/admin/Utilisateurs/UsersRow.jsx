import React from 'react';
import { MoreVertical } from 'lucide-react';
import defaultProfilePicImport_UsersRow from '../../../assets/images/default-profile.png'; // Ensure this path is correct

const UsersRow = ({ user, onShowMoreTeams, isTeamsExpanded, onNavigateToDetails }) => {
  const MAX_TEAMS_DISPLAYED = 2;
  const teamsToDisplay = user.equipes || [];
  const teamsToShow = isTeamsExpanded ? teamsToDisplay : teamsToDisplay.slice(0, MAX_TEAMS_DISPLAYED);
  const remainingTeamsCount = teamsToDisplay.length > MAX_TEAMS_DISPLAYED ? teamsToDisplay.length - MAX_TEAMS_DISPLAYED : 0;

  const imageSrc = user.profileImage || defaultProfilePicImport_UsersRow;
  const roleDisplay = user.role ? user.role.replace('_', ' ') : 'N/A';
  // Using the original posteTextColor logic, but applying it to role
  const roleTextColor = user.role === 'Chef_Equipe' ? 'text-red-500 dark:text-red-400' : 'text-slate-600 dark:text-slate-300';


  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-md flex items-center p-3 space-x-4 transition-all duration-300 hover:shadow-md">
      <img
        src={imageSrc} 
        alt={`${user.prenom || ''} ${user.nom || ''}`}
        className="h-12 w-12 rounded-full object-cover"
        onError={(e) => { e.currentTarget.src = defaultProfilePicImport_UsersRow; }}
      />
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 items-center">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.prenom || ''} {user.nom || ''}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-40">{user.email || ''}</p>
        </div>
        <p className={`text-sm ${roleTextColor} hidden sm:block font-medium`}>{roleDisplay}</p>
        <div className="text-xs text-slate-600 dark:text-slate-300 hidden md:block">
          <div className="flex flex-wrap gap-1 items-center">
            {teamsToShow.map(equipe => (
              <span key={equipe.id} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-1.5 py-0.5 rounded-full">
                {equipe.designation}
              </span>
            ))}
            {remainingTeamsCount > 0 && !isTeamsExpanded && (
              <button onClick={(e) => { e.stopPropagation(); onShowMoreTeams(user.id);}} className="text-xs text-sky-500 dark:text-sky-400 hover:underline">
                +{remainingTeamsCount}
              </button>
            )}
            {teamsToDisplay.length === 0 && <span className="text-xs italic text-slate-400">Aucune équipe</span>}
          </div>
        </div>
        <div className={`h-2.5 w-2.5 rounded-full ml-auto hidden md:block ${user.activite ? 'bg-green-500' : 'bg-red-500'}`} title={user.activite ? 'Actif' : 'Non Actif'}></div>
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