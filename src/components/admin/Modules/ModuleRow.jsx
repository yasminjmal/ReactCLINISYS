import React from 'react';
import { Package as PackageIconRow, Info, Users } from 'lucide-react';

const ModuleRow = ({ module, onNavigateToModuleDetails }) => {
  // The parent now passes the full module object, including the nested idEquipe
  const equipeNom = module.idEquipe?.designation;

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg flex items-center p-3.5 space-x-4">
      <div className="flex-none w-10 h-10 bg-indigo-100 flex items-center justify-center rounded-lg">
        <PackageIconRow className="text-indigo-600" size={20} />
      </div>
      
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-x-4 items-center min-w-0">
        <div className="truncate sm:col-span-2">
          {/* Use designation instead of nom */}
          <p className="text-sm font-semibold text-slate-800" title={module.designation}>
            {module.designation}
          </p>
          <p className="text-xs text-slate-500">ID: {module.id}</p>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 truncate">
            <Users size={14} className="text-slate-500"/>
            <span className="text-sm text-slate-600 truncate" title={equipeNom || 'Non assignée'}>
                {equipeNom || <span className="italic">N/A</span>}
            </span>
        </div>
        
        <div className="hidden sm:flex justify-end">
           {/* Use the calculated nbTicketsAssignes */}
           <span className="text-sm text-slate-600">Tickets: {module.nbTicketsAssignes}</span>
        </div>
      </div>

      <button onClick={() => onNavigateToModuleDetails(module.id)} className="p-1.5 rounded-full hover:bg-slate-100" title="Voir détails">
        <Info size={18} />
      </button>
    </div>
  );
};
export default ModuleRow;