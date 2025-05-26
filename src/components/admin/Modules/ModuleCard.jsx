import React from 'react';
import { Package as PackageIconCard, Info, Users } from 'lucide-react';

const ModuleCard = ({ module, equipeNom, onNavigateToModuleDetails }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col relative transition-all duration-300 hover:shadow-2xl min-h-[160px]">
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => onNavigateToModuleDetails(module.id)}
          className="text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Voir détails du module"
        >
          <Info size={18} />
        </button>
      </div>
      
      <div className="mb-2 pr-10">
        <div className="flex items-center mb-1">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-700/30 rounded-lg mr-3">
                <PackageIconCard className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
            <h3 
                className="text-lg font-semibold text-slate-700 dark:text-slate-100 truncate"
                title={module.nom}
            >
                {module.nom}
            </h3>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 ml-12">ID: {module.id}</p>
      </div>

      <div className="mb-1 pl-1 flex-grow">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center">
            <Users size={14} className="mr-1.5 text-slate-400 dark:text-slate-500"/> Équipe :
        </p>
        <span className="text-sm text-slate-700 dark:text-slate-200 pl-5">
            {equipeNom || <span className="italic text-slate-400 dark:text-slate-500">Non assignée</span>}
        </span>
      </div>
      
      <div className="mt-auto text-right">
         <span className="text-xs text-slate-400 dark:text-slate-500">
            Tickets: {module.nbTicketsAssignes !== undefined ? module.nbTicketsAssignes : 'N/A'}
         </span>
      </div>
    </div>
  );
};
export default ModuleCard;
