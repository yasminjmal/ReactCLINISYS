// src/components/admin/Dashboards/DashboardNav.jsx
import React from 'react';
import { Ticket, Users, Briefcase, Puzzle, Building, UserCheck } from 'lucide-react';

const navOptions = [
  { id: 'tickets', name: 'Tickets', icon: Ticket },
  { id: 'clients', name: 'Clients', icon: Briefcase },
  { id: 'utilisateurs', name: 'Utilisateurs', icon: Users },
  { id: 'equipes', name: 'Équipes', icon: UserCheck },
  { id: 'modules', name: 'Modules', icon: Puzzle },
  { id: 'postes', name: 'Postes', icon: Building },
];

// Le composant reçoit maintenant des "props" de son parent
const DashboardNav = ({ activePage, onNavClick }) => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 mb-8">
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {navOptions.map(option => {
          const isActive = activePage === option.id; // On utilise la prop pour savoir qui est actif
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => onNavClick(option.id)} // On appelle la fonction du parent
              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold transition-all duration-300 rounded-t-lg border-b-2 ${
                isActive
                  ? 'border-sky-500 text-sky-500'
                  : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-sky-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{option.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardNav;