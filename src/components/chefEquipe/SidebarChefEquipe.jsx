// src/components/chefEquipe/SidebarChefEquipe.jsx
import React from 'react';
// Icônes mises à jour et X pour fermer
import { Home, Users, Briefcase, UserCheck, ShieldCheck, ClipboardEdit, ListChecks, X } from 'lucide-react'; 

// Logo (optionnel, à remplacer par votre logo)
// import logoClinisys from '../../assets/images/logo-clinisys-transparent.png'; 

const SidebarChefEquipe = ({ activePage, setActivePage, isSidebarOpen, toggleSidebar }) => {
  const menuItemsChef = [
    { id: 'home_chef', label: 'Tableau de Bord', icon: Home },
    { id: 'mes_equipes_chef', label: 'Mes Équipes', icon: Users }, // Pour voir ses équipes, membres, modules
    { id: 'tickets_a_traiter_chef', label: 'Tickets à Traiter', icon: ClipboardEdit }, // Tickets acceptés par admin, à assigner/refuser
    { id: 'suivi_affectations_chef', label: 'Suivi des Affectations', icon: ListChecks }, // Suivi des tickets assignés aux employés
    // { id: 'valider_conges_absences_chef', label: 'Congés & Absences', icon: CalendarCheck }, // Si vous souhaitez ajouter cette fonctionnalité plus tard
  ];

  const handleNavigation = (pageId) => {
    setActivePage(pageId);
    if (isSidebarOpen && window.innerWidth < 768) { // Fermer le sidebar sur mobile après clic
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={toggleSidebar}></div>}

      <aside 
        className={`fixed top-0 left-0 h-full bg-sky-700 dark:bg-slate-900 text-white shadow-lg z-50 transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:w-64`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-sky-600 dark:border-slate-700">
          <a href="#home_chef" onClick={(e) => {e.preventDefault(); handleNavigation('home_chef')}} className="flex items-center space-x-2">
            {/* <img src={logoClinisys} alt="Clinisys Logo" className="h-8 w-auto" /> */}
            <ShieldCheck size={28} className="text-sky-300" />
            <span className="text-xl font-semibold text-white">Chef d'Équipe</span>
          </a>
          <button onClick={toggleSidebar} className="md:hidden p-1 text-sky-200 hover:text-white">
            <X size={24} /> 
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto" style={{height: 'calc(100% - 4rem)'}}>
          {menuItemsChef.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => { e.preventDefault(); handleNavigation(item.id); }}
              className={`flex items-center py-2.5 px-4 rounded-md mx-2 transition-colors duration-150
                          ${activePage === item.id 
                            ? 'bg-sky-600 dark:bg-sky-700 text-white shadow-inner' 
                            : 'hover:bg-sky-600/80 dark:hover:bg-slate-700/60 text-sky-100 hover:text-white'}`}
            >
              <item.icon size={18} className="mr-3 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </a>
          ))}
          
          <div className="pt-4 mt-4 border-t border-sky-600 dark:border-slate-700 mx-2">
             <a
              href="#consulter_profil_chef" // L'ID pour le profil reste le même que défini dans InterfaceChefEquipe
              onClick={(e) => { e.preventDefault(); handleNavigation('consulter_profil_chef'); }}
              className={`flex items-center py-2.5 px-4 rounded-md transition-colors duration-150
                          ${activePage === 'consulter_profil_chef' 
                            ? 'bg-sky-600 dark:bg-sky-700 text-white shadow-inner' 
                            : 'hover:bg-sky-600/80 dark:hover:bg-slate-700/60 text-sky-100 hover:text-white'}`}
            >
              <UserCheck size={18} className="mr-3 flex-shrink-0" />
              <span className="text-sm font-medium">Mon Profil</span>
            </a>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default SidebarChefEquipe;
