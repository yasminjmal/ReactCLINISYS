import React from 'react';
import { Info } from 'lucide-react';
import defaultProfilePicImport_UsersCard from '../../../assets/images/default-profile.png'; // Ensure this path is correct

const UsersCard = ({ user, onShowMoreTeams, isTeamsExpanded, onNavigateToDetails }) => {
  const MAX_TEAMS_DISPLAYED = 2;
  const teamsToDisplay = user.equipePosteSet || [];
  const teamsToShow = isTeamsExpanded ? teamsToDisplay : teamsToDisplay.slice(0, MAX_TEAMS_DISPLAYED);
  const remainingTeamsCount = teamsToDisplay.length > MAX_TEAMS_DISPLAYED ? teamsToDisplay.length - MAX_TEAMS_DISPLAYED : 0;
  
  const imageSrc = user.profileImage || defaultProfilePicImport_UsersCard;
  const roleDisplay = user.role ? user.role.replace('_', ' ') : 'N/A';
  const roleTextColor = user.role === 'Chef_Equipe' ? 'text-red-500 dark:text-red-400' : 'text-sky-600 dark:text-sky-400';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 flex flex-col relative transition-all duration-300 hover:shadow-xl min-h-[200px]">
      <button 
        onClick={() => onNavigateToDetails(user.id)}
        className="absolute top-3 right-3 text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        title="Voir détails"
      >
        <Info size={18} />
      </button>
      <div className="flex items-center space-x-4 mb-3">
        <img
          src={imageSrc}
          alt={`${user.prenom || ''} ${user.nom || ''}`}
          className="h-16 w-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
          onError={(e) => { e.currentTarget.src = defaultProfilePicImport_UsersCard; }}
        />
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{user.prenom || ''} {user.nom || ''}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-40">{user.email || ''}</p>
          <p className={`text-sm ${roleTextColor} font-medium`}>{roleDisplay}</p>
        </div>
      </div>
      <div className="mb-3 flex-grow">
        <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Équipes :</h4>
        <div className="flex flex-wrap gap-1">
          {teamsToShow.map(equipe => (
            <span key={equipe.id} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">
              {equipe.equipe.designation}
            </span>
          ))}
          {remainingTeamsCount > 0 && !isTeamsExpanded && (
            <button
              onClick={(e) => { e.stopPropagation(); onShowMoreTeams(user.id);}}
              className="text-xs text-sky-500 dark:text-sky-400 hover:underline"
            >
              +{remainingTeamsCount}
            </button>
          )}
           {teamsToDisplay.length === 0 && <span className="text-xs italic text-slate-400 dark:text-slate-500">Aucune équipe</span>}
        </div>
      </div>
      <div className={`absolute bottom-3 right-3 h-3 w-3 rounded-full ${user.activite ? 'bg-green-500' : 'bg-red-500'}`} title={user.activite ? 'Actif' : 'Non Actif'}></div>
    </div>
  );
};
export default UsersCard;