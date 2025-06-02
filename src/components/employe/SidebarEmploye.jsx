// src/components/employe/SidebarEmploye.jsx
import React from 'react';
import { Home, ListChecks, Edit3, CheckSquare, XCircle, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'; // Ajout de XCircle
import logoClinisysTransparent from '../../assets/images/logoTRANSPARENT.png'; // Assurez-vous que le chemin est correct

const SidebarEmploye = ({ activePage, setActivePage, user, onLogout, isSidebarOpen, toggleSidebar }) => {
  const navItems = [
    { id: 'dashboard_employe', label: 'Tableau de Bord', icon: Home },
    { id: 'tickets_assignes_employe', label: 'Mes Tickets Assignés', icon: ListChecks },
    { id: 'travail_en_cours_employe', label: 'Mon Travail en Cours', icon: Edit3 },
    { id: 'tickets_resolus_employe', label: 'Tickets Résolus', icon: CheckSquare },
    { id: 'tickets_refuses_employe', label: 'Tickets Refusés', icon: XCircle }, // Nouveau lien
  ];

  return (
    <>
      {/* Overlay pour les petits écrans */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-slate-800 text-slate-100 transition-all duration-300 ease-in-out flex flex-col
                   ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'} overflow-hidden`}
      >
        {/* Logo et Toggle */}
        <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} p-4 h-20 border-b border-slate-700`}>
          {isSidebarOpen && (
            <img src={logoClinisysTransparent} alt="Logo Clinisys" className="h-12 w-auto" />
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 lg:hidden"
            aria-label={isSidebarOpen ? "Fermer la sidebar" : "Ouvrir la sidebar"}
          >
            <ChevronLeft size={24} className={`${isSidebarOpen ? '' : 'hidden'}`} />
          </button>
           <button
            onClick={toggleSidebar}
            className={`p-2 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 hidden lg:block ${isSidebarOpen && 'ml-auto'}`}
            aria-label={isSidebarOpen ? "Réduire la sidebar" : "Agrandir la sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>

        {/* Liens de navigation */}
        <nav className="flex-grow mt-4 space-y-2 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              title={item.label}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                          ${activePage === item.id
                            ? 'bg-sky-600 text-white shadow-md'
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                          }
                          ${!isSidebarOpen ? 'justify-center' : ''}`}
            >
              <item.icon size={isSidebarOpen ? 20 : 24} className="flex-shrink-0" />
              {isSidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Section utilisateur et déconnexion en bas */}
        <div className="p-3 border-t border-slate-700 mt-auto">
           {isSidebarOpen && user && (
            <div className="mb-3 p-2 rounded-md bg-slate-700/50">
              <p className="text-sm font-semibold truncate" title={user.name}>{user.name}</p>
              <p className="text-xs text-slate-400 truncate" title={user.role || 'Employé'}>Employé</p> {/* Assurer que le rôle est affiché */}
            </div>
          )}
          <button
            onClick={onLogout}
            title="Se déconnecter"
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-slate-300 hover:bg-red-600 hover:text-white group
                        ${!isSidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut size={isSidebarOpen ? 20 : 24} className="flex-shrink-0 group-hover:text-white" />
            {isSidebarOpen && <span className="truncate">Se déconnecter</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarEmploye;
