import React, { useState } from 'react';
import {
  Home as HomeIcon,
  LayoutDashboard,
  Ticket as TicketIcon, // Assurez-vous que TicketIcon est bien importé
  Users2 as Users2IconFE, // Gardé si utilisé ailleurs, sinon peut être nettoyé
  UserCircle as UserCircleIcon,
  Package,
  Briefcase as BriefcaseIcon,
  Users, // Utilisé pour Equipes
  Package as PackageIconModule, // Utilisé pour Modules
  X,
  ChevronDown,
  ChevronUp,
  Circle,
  CheckCircle2
} from 'lucide-react';

// Assurez-vous que le chemin vers votre logo est correct
import logoClinisysImage_Sidebar from '../../assets/images/logoTRANSPARENT.png'; // Ajustez le chemin si nécessaire

const SidebarAdmin = ({ activePage, setActivePage, isSidebarOpen, toggleSidebar }) => {
  const [openDropdownKey, setOpenDropdownKey] = useState(null);

  const menuItems = [
    { id: 'home', label: 'HOME', icon: HomeIcon, path: '#' },
    { id: 'dashboards', label: 'DASHBOARDS', icon: LayoutDashboard, path: '#' },
    {
      id: 'tickets_main', // ID pour le menu principal des tickets
      label: 'TICKETS',
      icon: TicketIcon,
      subItems: [
        { id: 'tickets_consulter_demandes', label: 'Consulter les demandes', path: '#' },
        { id: 'tickets_affecter_acceptes', label: 'Affecter les tickets acceptés', path: '#' },
        { id: 'tickets_consulter_affectes', label: 'Consulter les tickets affectés', path: '#' },
        { id: 'tickets_voir_refuses', label: 'Voir les tickets refusés', path: '#' },
      ],
    },
    {
      id: 'equipes_main',
      label: 'EQUIPES',
      icon: Users, // Icône Users pour Equipes
      subItems: [
        { id: 'equipes_consulter_equipes', label: 'Consulter les équipes', path: '#' },
        { id: 'equipes_consulter_avancement', label: 'Avancement des équipes', path: '#' },
      ],
    },
    {
      id: 'utilisateurs_main',
      label: 'UTILISATEURS',
      icon: UserCircleIcon,
      subItems: [
        { id: 'utilisateurs_consulter_utilisateurs', label: 'Consulter les utilisateurs', path: '#' },
        { id: 'utilisateurs_consulter_chefs_equipes', label: 'Consulter les chefs d\'équipes', path: '#' }, // Si vous gardez cette option
      ],
    },
    {
      id: 'modules_main',
      label: 'MODULES',
      icon: PackageIconModule, // Icône Package pour Modules
      subItems: [
        { id: 'modules_consulter_modules', label: 'Consulter les modules', path: '#' },
      ],
    },
    {
      id: 'postes_main',
      label: 'POSTES',
      icon: BriefcaseIcon,
      subItems: [
        { id: 'postes_consulter_postes', label: 'Consulter les postes', path: '#' },
      ],
    },
  ];

  const handleMainMenuClick = (item) => {
    if (item.subItems) {
      setOpenDropdownKey(openDropdownKey === item.id ? null : item.id);
      // Optionnel: si un menu principal avec sous-menu est cliqué, ne pas changer activePage immédiatement
      // ou alors, faire pointer vers le premier sous-élément par défaut si souhaité.
      // Pour l'instant, cliquer sur un menu avec sous-menu ne fait qu'ouvrir/fermer le dropdown.
    } else {
      setActivePage(item.id);
      setOpenDropdownKey(null); // Fermer tout dropdown ouvert si un item sans sous-menu est cliqué
      if (isSidebarOpen) { // Fermer la sidebar sur mobile si un lien direct est cliqué
        toggleSidebar();
      }
    }
  };

  const handleSubMenuClick = (subItemId) => {
    setActivePage(subItemId);
    if (isSidebarOpen) { // Fermer la sidebar sur mobile
      toggleSidebar();
    }
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      <aside
        className={`fixed top-0 left-0 h-full bg-slate-800 dark:bg-slate-900 text-slate-100 dark:text-slate-200 w-64 p-4 pt-5 space-y-4 transition-transform transform ease-in-out duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 z-40 shadow-lg flex flex-col`}
      >
        <div className="relative text-center px-2 pt-2 pb-4">
          <img
            src={logoClinisysImage_Sidebar}
            alt="Clinisys Logo"
            className="h-28 w-auto inline-block object-contain"
            onError={(e) => e.currentTarget.style.display='none'}
          />
          <button
            onClick={toggleSidebar}
            className="md:hidden absolute top-2 right-2 p-1 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="space-y-1 flex-grow overflow-y-auto pr-1">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => handleMainMenuClick(item)}
                className={`group w-full flex items-center justify-between space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ease-in-out transform hover:translate-x-1
                  ${
                    (activePage === item.id && !item.subItems) || (item.subItems && openDropdownKey === item.id) || (item.subItems && item.subItems.some(sub => sub.id === activePage))
                      ? 'bg-sky-600 dark:bg-sky-500 text-white shadow-md'
                      : 'hover:bg-slate-700 dark:hover:bg-slate-700/60 text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-slate-100'
                  }
                  ${activePage === item.id && !item.subItems ? 'scale-105' : ''}
                `}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={20} className={`transition-transform duration-200 ease-in-out ${activePage === item.id && !item.subItems ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span>{item.label}</span>
                </div>
                {item.subItems && (
                  openDropdownKey === item.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />
                )}
              </button>
              {item.subItems && openDropdownKey === item.id && (
                <div className="ml-4 mt-1 space-y-1 pl-5 border-l-2 border-slate-700 dark:border-slate-600">
                  {item.subItems.map((subItem) => (
                    <a // Changé en 'a' pour la sémantique, mais le comportement est géré par onClick
                      key={subItem.id}
                      href={subItem.path} // href="#" pour l'instant
                      onClick={(e) => {
                        e.preventDefault(); // Empêche le comportement par défaut du lien
                        handleSubMenuClick(subItem.id);
                      }}
                      className={`group flex items-center space-x-2.5 py-2 px-2 rounded-md text-xs font-medium transition-all duration-150 ease-in-out hover:translate-x-0.5
                        ${
                          activePage === subItem.id
                            ? 'text-sky-400 dark:text-sky-300 font-semibold'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-200 dark:hover:text-slate-300'
                        }`}
                    >
                      {activePage === subItem.id ? <CheckCircle2 size={14} className="text-sky-500" /> : <Circle size={14} className="text-slate-500 group-hover:text-slate-400" />}
                      <span>{subItem.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};
export default SidebarAdmin;