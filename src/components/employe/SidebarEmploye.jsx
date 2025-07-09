// src/components/employe/SidebarEmploye.jsx
import React from 'react';
import { Home, ListChecks, Edit3, CheckSquare, MessageSquare, HelpCircle, Phone } from 'lucide-react';
import logoClinisys from '../../assets/images/logoTRANSPARENT.png';

const NavItem = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`group w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-200
            ${isActive
                ? 'bg-blue-500/20 text-blue-800 font-semibold border-l-4 border-blue-500'
                : 'text-slate-600 hover:bg-blue-500/10 hover:text-slate-800'
            }`
        }
        style={isActive ? { paddingLeft: '8px' } : {}}
    >
        {Icon && <Icon size={20} className={isActive ? 'text-blue-600' : ''} />}
        <span>{label}</span>
    </button>
);

const SidebarEmploye = ({ activePage, setActivePage, isSidebarOpen }) => {
  const navItems = [
    { id: 'dashboard_employe', label: 'Tableau de Bord', icon: Home },
    { id: 'tickets_en_attente_employe', label: 'Mes Tickets en Attente', icon: ListChecks },
    { id: 'travail_en_cours_employe', label: 'Mon Travail en Cours', icon: Edit3 },
    { id: 'tickets_resolus_employe', label: 'Tickets Résolus', icon: CheckSquare },
    { id: 'mes_travaux_employe', label: 'Mes Travaux', icon: ListChecks },
  ];
  
  const isChatActive = activePage === 'chat_employe';

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 transition-transform transform ease-in-out duration-300 z-50 flex flex-col shadow-lg
        bg-gradient-to-b from-sky-100 to-blue-200
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}
    >
      <div className="h-16 flex items-center px-4 space-x-3 border-b border-black/10 flex-shrink-0">
        <img src={logoClinisys} alt="Logo Clinisys" className="h-15 w-auto object-contain" />
      </div>

      <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
        <div className="px-3 pt-4 pb-2 text-xs font-bold uppercase text-slate-500">
          MENU PRINCIPAL
        </div>
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activePage === item.id}
            onClick={() => setActivePage(item.id)}
          />
        ))}
      </nav>

      <div className="p-2 border-t border-black/10 flex-shrink-0">
        <div className="flex items-center justify-around mt-2">
          <button
            onClick={() => setActivePage('chat_employe')}
            className={`p-2 rounded-md transition-colors ${isChatActive ? 'text-blue-700 bg-blue-500/20' : 'text-slate-500 hover:bg-blue-500/10 hover:text-blue-700'}`}
          >
            <MessageSquare size={20} />
          </button>
          <button className="p-2 rounded-md text-slate-500 hover:bg-blue-500/10 hover:text-blue-700 transition-colors">
            <HelpCircle size={20} />
          </button>
          <button className="p-2 rounded-md text-slate-500 hover:bg-blue-500/10 hover:text-blue-700 transition-colors">
            <Phone size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SidebarEmploye;