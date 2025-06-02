// src/components/admin/SidebarAdmin.jsx
import React, { useState, useEffect } from 'react'; // Ajout de useEffect ici
import {
  Home as HomeIcon,
  LayoutDashboard,
  Ticket as TicketIcon,
  UserCircle as UserCircleIcon,
  Users, 
  Package as PackageIconModule,
  Briefcase as BriefcaseIcon,
  X,
  ChevronDown,
  ChevronUp,
  Circle,
  CheckCircle2,
  FileText, // Pour "Demandes en attente"
  ListChecks, // Pour "Tickets à Traiter"
  ArchiveX // Pour "Tickets Refusés"
} from 'lucide-react';

import logoClinisysImage_Sidebar from '../../assets/images/logoTRANSPARENT.png';

const SidebarAdmin = ({ activePage, setActivePage, isSidebarOpen, toggleSidebar }) => {
  const [openDropdownKey, setOpenDropdownKey] = useState(null);

  const menuItems = [
    { id: 'home', label: 'HOME', icon: HomeIcon, path: '#' },
    { id: 'dashboards', label: 'DASHBOARDS', icon: LayoutDashboard, path: '#' },
    {
      id: 'tickets_main', 
      label: 'TICKETS',
      icon: TicketIcon,
      subItems: [
        { id: 'tickets_consulter_demandes', label: 'Demandes en Attente', icon: FileText, path: '#' },
        { id: 'tickets_gerer', label: 'Tickets à Traiter', icon: ListChecks, path: '#' }, // Page centralisée
        { id: 'tickets_voir_refuses', label: 'Tickets Refusés', icon: ArchiveX, path: '#' },
      ],
    },
    {
      id: 'equipes_main',
      label: 'EQUIPES',
      icon: Users,
      subItems: [
        { id: 'equipes_consulter_equipes', label: 'Consulter les équipes', path: '#' },
        // { id: 'equipes_consulter_avancement', label: 'Avancement des équipes', path: '#' }, // Si besoin
      ],
    },
    {
      id: 'utilisateurs_main',
      label: 'UTILISATEURS',
      icon: UserCircleIcon,
      subItems: [
        { id: 'utilisateurs_consulter_utilisateurs', label: 'Consulter les utilisateurs', path: '#' },
      ],
    },
    {
      id: 'modules_main',
      label: 'MODULES',
      icon: PackageIconModule,
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
    } else {
      setActivePage(item.id);
      setOpenDropdownKey(null); 
      if (isSidebarOpen && window.innerWidth < 768) { 
        toggleSidebar();
      }
    }
  };

  const handleSubMenuClick = (subItemId) => {
    setActivePage(subItemId);
    if (isSidebarOpen && window.innerWidth < 768) { 
      toggleSidebar();
    }
  };
  
  // Auto-open dropdown if a sub-item is active on load or page change
  useEffect(() => { // C'est la ligne 95 où l'erreur se produisait
    const activeParent = menuItems.find(item => item.subItems?.some(sub => sub.id === activePage));
    if (activeParent) {
      setOpenDropdownKey(activeParent.id);
    } else {
      // Optionnel: fermer les dropdowns si aucun sous-menu n'est actif
      // setOpenDropdownKey(null); 
    }
  }, [activePage]); // Correction: ajout de activePage comme dépendance


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
                    <a 
                      key={subItem.id}
                      href={subItem.path} 
                      onClick={(e) => {
                        e.preventDefault(); 
                        handleSubMenuClick(subItem.id);
                      }}
                      className={`group flex items-center space-x-2.5 py-2 px-2 rounded-md text-xs font-medium transition-all duration-150 ease-in-out hover:translate-x-0.5
                        ${
                          activePage === subItem.id
                            ? 'text-sky-400 dark:text-sky-300 font-semibold'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-200 dark:hover:text-slate-300'
                        }`}
                    >
                      {subItem.icon ? <subItem.icon size={14} className={activePage === subItem.id ? "text-sky-500" : "text-slate-500 group-hover:text-slate-400"} /> : (activePage === subItem.id ? <CheckCircle2 size={14} className="text-sky-500" /> : <Circle size={14} className="text-slate-500 group-hover:text-slate-400" />)}
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
