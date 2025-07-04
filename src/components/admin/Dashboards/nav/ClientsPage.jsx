// src/components/admin/Dashboards/nav/ClientsPage.jsx
import React from 'react';
import { Briefcase, UserPlus } from 'lucide-react';

const ClientsPage = () => {
  // Données d'exemple
  const recentClients = [
    { id: 1, name: 'Société A', industry: 'Technologie' },
    { id: 2, name: 'Entreprise B', industry: 'Santé' },
    { id: 3, name: 'Corporation C', industry: 'Finance' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-0">
       <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Gestion des Clients</h2>
         <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors shadow">
          <UserPlus size={20} />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Cartes de stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total des Clients</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">84</p>
        </div>
         <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Nouveaux Clients (ce mois-ci)</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">5</p>
        </div>
      </div>

      {/* Tableau des clients récents */}
       <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
         <h3 className="font-semibold text-lg mb-4 text-slate-900 dark:text-slate-100">Clients Récemment Ajoutés</h3>
         <table className="w-full text-sm text-left">
            {/* ... Tableau ... */}
         </table>
       </div>
    </div>
  );
};

export default ClientsPage;