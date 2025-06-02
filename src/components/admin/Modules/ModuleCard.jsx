import React from 'react';
import { Package as PackageIconCard, Info, Users } from 'lucide-react';

const ModuleCard = ({ module, onNavigateToModuleDetails }) => {
  // The parent now passes the full module object, including the nested idEquipe
  const equipeNom = module.idEquipe?.designation;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col relative min-h-[160px]">
      <div className="absolute top-4 right-4">
        <button onClick={() => onNavigateToModuleDetails(module.id)} className="p-1.5 rounded-full hover:bg-slate-100" title="Voir détails">
          <Info size={18} />
        </button>
      </div>
      
      <div className="mb-2 pr-10">
        <div className="flex items-center mb-1">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <PackageIconCard className="text-indigo-600" size={20} />
            </div>
            {/* Use designation instead of nom */}
            <h3 className="text-lg font-semibold text-slate-700 truncate" title={module.designation}>
                {module.designation}
            </h3>
        </div>
        <p className="text-xs text-slate-400 ml-12">ID: {module.id}</p>
      </div>

      <div className="mb-1 pl-1 flex-grow">
        <p className="text-xs font-medium text-slate-500 mb-1 flex items-center">
            <Users size={14} className="mr-1.5"/> Équipe :
        </p>
        <span className="text-sm text-slate-700 pl-5">
            {equipeNom || <span className="italic">Non assignée</span>}
        </span>
      </div>
      
      <div className="mt-auto text-right">
         {/* Use the calculated nbTicketsAssignes */}
         <span className="text-xs text-slate-400">Tickets: {module.nbTicketsAssignes}</span>
      </div>
    </div>
  );
};
export default ModuleCard;