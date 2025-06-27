import React from 'react';
import { Package as PackageIconCard, Edit, Trash2, Users, User as UserIcon } from 'lucide-react';

const CardStatusBadge = ({ isActive }) => (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isActive ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300'}`}>
        {/* Changé les couleurs pour correspondre au thème général (bleu/gris au lieu de vert/rouge) */}
        {isActive ? 'Actif' : 'Inactif'}
    </span>
);

const ModuleCard = ({ module, onEdit, onDelete }) => {
  const ticketCount = module.ticketList ? module.ticketList.length : 0;
  const equipeNom = module.equipe ? module.equipe.designation : 'Non assignée';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col relative transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="absolute top-3 right-3 flex items-center space-x-1">
          <button onClick={() => onEdit(module)} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors" title="Modifier"><Edit size={16}/></button>
          <button onClick={() => onDelete(module)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-slate-700 transition-colors" title="Supprimer"><Trash2 size={16}/></button>
      </div>
      
      <div className="mb-2 pr-10">
        <div className="flex items-center mb-1">
            <div className="p-2 bg-blue-100 dark:bg-blue-700/30 rounded-lg mr-3"><PackageIconCard className="text-blue-600 dark:text-blue-400" size={20} /></div> {/* Changé couleur icône */}
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-100 truncate" title={module.designation}>{module.designation}</h3>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 ml-12">ID: {module.id}</p>
      </div>

      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 flex-grow">
        <div className="flex items-center justify-between">
            <span className="font-medium text-slate-500 dark:text-slate-400">Statut</span>
            <CardStatusBadge isActive={module.actif} />
        </div>
        <div className="flex items-center">
            <Users size={14} className="mr-2 text-slate-400"/>
            <span>Équipe: <span className="font-semibold">{equipeNom}</span></span>
        </div>
        <div className="flex items-center">
            <UserIcon size={14} className="mr-2 text-slate-400"/>
            <span>Créé par: <span className="font-semibold">{module.userCreation || 'N/A'}</span></span>
        </div>
      </div>
      
      <div className="mt-2 text-right">
         <span className="text-xs text-slate-400 dark:text-slate-500">Tickets: {ticketCount}</span>
      </div>
    </div>
  );
};
export default ModuleCard;