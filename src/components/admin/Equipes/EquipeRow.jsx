import React from 'react';
import { Info as InfoIconRow, Users as UsersIconRowLucide, UserCheck as UserCheckIconRow } from 'lucide-react';
import defaultProfilePicImport_EquipeRow from '../../../assets/images/default-profile.png';

const EquipeRow = ({ equipe, onNavigateToEquipeDetails }) => {
  const membersWithPostes = equipe.equipePosteutilisateurSet || [];

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg flex items-center p-3.5 space-x-4 transition-shadow duration-200">
      <div className="flex-none w-10 h-10 bg-sky-100 dark:bg-sky-700/30 rounded-lg flex items-center justify-center">
        <UsersIconRowLucide className="text-sky-600 dark:text-sky-400" size={20} />
      </div>
      
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-x-4 items-center min-w-0">
        <div className="truncate">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={equipe.designation}>
            {equipe.designation}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">ID: {equipe.id}</p>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 truncate">
            <UserCheckIconRow size={14} className="text-slate-500 dark:text-slate-400 flex-shrink-0"/>
            <span className="text-sm text-slate-600 dark:text-slate-300 truncate" title={equipe.chefEquipe ? `${equipe.chefEquipe.prenom} ${equipe.chefEquipe.nom}` : 'Non assigné'}>
                {equipe.chefEquipe ? `${equipe.chefEquipe.prenom} ${equipe.chefEquipe.nom}` : 'N/A'}
            </span>
        </div>
        
        <div className="hidden sm:flex items-center space-x-1.5 text-sm text-slate-600 dark:text-slate-300">
           <UsersIconRowLucide size={14} className="text-slate-500 dark:text-slate-400 flex-shrink-0"/>
           <span>{membersWithPostes.length} Membre{membersWithPostes.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      <button 
        onClick={() => onNavigateToEquipeDetails(equipe.id)}
        className="text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        title="Voir détails de l'équipe"
      >
        <InfoIconRow size={18} />
      </button>
    </div>
  );
};
export default EquipeRow;