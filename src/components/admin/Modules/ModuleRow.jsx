import React from 'react';
import { Package as PackageIconRow, Info, Users } from 'lucide-react';

const ModuleRow = ({ module, equipeNom, onNavigateToModuleDetails }) => {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg flex items-center p-3.5 space-x-4 transition-shadow duration-200">
      <div className="flex-none w-10 h-10 bg-indigo-100 dark:bg-indigo-700/30 rounded-lg flex items-center justify-center">
        <PackageIconRow className="text-indigo-600 dark:text-indigo-400" size={20} />
      </div>
      
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-x-4 items-center min-w-0">
        <div className="truncate sm:col-span-2">
          <p 
            className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" 
            title={module.nom}
          >
            {module.nom}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">ID: {module.id}</p>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 truncate">
            <Users size={14} className="text-slate-500 dark:text-slate-400 flex-shrink-0"/>
            <span className="text-sm text-slate-600 dark:text-slate-300 truncate" title={equipeNom || 'Non assignée'}>
                {equipeNom || <span className="italic text-slate-400 dark:text-slate-500">N/A</span>}
            </span>
        </div>
        
        <div className="hidden sm:flex items-center space-x-1.5 text-sm text-slate-600 dark:text-slate-300 justify-start sm:justify-end">
           <span>Tickets: {module.nbTicketsAssignes !== undefined ? module.nbTicketsAssignes : 'N/A'}</span>
        </div>
      </div>

      <button 
        onClick={() => onNavigateToModuleDetails(module.id)}
        className="text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        title="Voir détails du module"
      >
        <Info size={18} />
      </button>
    </div>
  );
};
export default ModuleRow;