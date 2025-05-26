import React from 'react';
import { Briefcase as BriefcaseIconCard, Info, Users } from 'lucide-react';

const PosteCard = ({ poste, onNavigateToPosteDetails }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col relative transition-all duration-300 hover:shadow-2xl min-h-[150px]">
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => onNavigateToPosteDetails(poste.id)}
          className="text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Voir détails du poste"
        >
          <Info size={18} />
        </button>
      </div>
      
      <div className="mb-2 pr-10">
        <div className="flex items-center mb-1">
            <div className="p-2 bg-amber-100 dark:bg-amber-700/30 rounded-lg mr-3">
                <BriefcaseIconCard className="text-amber-600 dark:text-amber-400" size={20} />
            </div>
            <h3 
                className="text-lg font-semibold text-slate-700 dark:text-slate-100 truncate"
                title={poste.designation}
            >
                {poste.designation}
            </h3>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 ml-12">ID: {poste.id}</p>
      </div>

      <div className="mt-auto">
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
            <Users size={14} className="mr-1.5"/>
            <span>{poste.nbUtilisateurs} Utilisateur{poste.nbUtilisateurs === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
};
export default PosteCard;
