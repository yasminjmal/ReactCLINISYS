// src/components/admin/SidebarAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  FileText,
  ListChecks,
  ArchiveX
} from 'lucide-react';

import logoClinisysImage_Sidebar from '../../assets/images/logoTRANSPARENT.png';

// --- MODIFICATION 1 : Définir les menuItems EN DEHORS du composant ---
// Ceci est la correction la plus importante. Elle empêche la recréation
// de cette liste à chaque rendu et stabilise le comportement du menu.
const menuItems = [
  { id: 'home', label: 'HOME', icon: HomeIcon },
  { id: 'dashboards', label: 'DASHBOARDS', icon: LayoutDashboard },
  {
    id: 'tickets_management',
    label: 'TICKETS',
    icon: TicketIcon,
  },
  {
    id: 'equipes_main',
    label: 'EQUIPES',
    icon: Users,
    subItems: [
      { id: 'equipes_consulter_equipes', label: 'Consulter les équipes' },
    ],
  },
  { id: 'utilisateurs_consulter_utilisateurs', label: 'UTILISATEURS', icon: UserCircleIcon },
  { id: 'modules_consulter_modules', label: 'MODULES', icon: PackageIconModule },
  { id: 'postes_consulter_postes', label: 'POSTES', icon: BriefcaseIcon },
];

const SidebarAdmin = ({ activePage, setActivePage, isSidebarOpen, toggleSidebar }) => {
  const [openDropdownKey, setOpenDropdownKey] = useState(null);

  useEffect(() => {
    const currentActivePageId = typeof activePage === 'object' ? activePage.id : activePage;
    
    const activeParent = menuItems.find(item =>
      item.subItems?.some(sub => {
        if (sub.id.startsWith('tickets_management_')) {
          return currentActivePageId === 'tickets_management';
        }
        return sub.id === currentActivePageId;
      })
    );

    if (activeParent) {
      setOpenDropdownKey(activeParent.id);
    }
  // --- MODIFICATION 2 : Nettoyer le tableau des dépendances ---
  // On ne dépend plus que de 'activePage', ce qui est correct.
  }, [activePage]);

  const handleMainMenuClick = (item) => {
    if (item.subItems && item.subItems.length > 0) {
      setOpenDropdownKey(openDropdownKey === item.id ? null : item.id);
    } else {
      setActivePage(item.id);
      setOpenDropdownKey(null);
      if (isSidebarOpen && window.innerWidth < 768) {
        toggleSidebar();
      }
    }
  };

  const handleSubMenuClick = (subItem) => {
    if (subItem.id.startsWith('tickets_management_')) {
      setActivePage({ id: 'tickets_management', filter: subItem.initialFilterStatus });
    } else {
      setActivePage(subItem.id);
    }
    if (isSidebarOpen && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  // --- MODIFICATION 3 : Corriger la logique de la fonction 'isActive' ---
  const isActive = useCallback((item, subItem = null) => {
    const pageId = typeof activePage === 'object' ? activePage.id : activePage;
    const pageFilter = typeof activePage === 'object' ? activePage.filter : null;

    // Si on vérifie un sous-élément de ticket
    if (subItem && item.id === 'tickets_main') {
      return pageId === 'tickets_management' && pageFilter === subItem.initialFilterStatus;
    }

    // Si on vérifie l'élément principal "TICKETS"
    if (item.id === 'tickets_main') {
      return pageId === 'tickets_management';
    }

    // Pour tous les autres éléments
    return pageId === item.id;
  }, [activePage]);


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
          {menuItems.map((item) => {
            // Détermine si le bouton principal doit être stylisé comme "actif"
            const isParentActive = isActive(item) || (item.subItems && openDropdownKey === item.id);

            return (
              <div key={item.id}>
                <button
                  onClick={() => handleMainMenuClick(item)}
                  className={`group w-full flex items-center justify-between space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ease-in-out transform hover:translate-x-1
                    ${
                      isParentActive
                        ? 'bg-sky-600 dark:bg-sky-500 text-white shadow-md'
                        : 'hover:bg-slate-700 dark:hover:bg-slate-700/60 text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-slate-100'
                    }
                    ${isActive(item) ? 'scale-105' : ''}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} className={`transition-transform duration-200 ease-in-out ${isActive(item) ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.subItems && (
                    openDropdownKey === item.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />
                  )}
                </button>
                {item.subItems && openDropdownKey === item.id && (
                  <div className="ml-4 mt-1 space-y-1 pl-5 border-l-2 border-slate-700 dark:border-slate-600">
                    {item.subItems.map((subItem) => {
                      const isSubItemActive = isActive(item, subItem);
                      return (
                        <a
                          key={subItem.id}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleSubMenuClick(subItem);
                          }}
                          className={`group flex items-center space-x-2.5 py-2 px-2 rounded-md text-xs font-medium transition-all duration-150 ease-in-out hover:translate-x-0.5
                            ${isSubItemActive
                              ? 'text-sky-400 dark:text-sky-300 font-semibold'
                              : 'text-slate-400 dark:text-slate-500 hover:text-slate-200 dark:hover:text-slate-300'
                            }`}
                        >
                          {subItem.icon 
                             ? <subItem.icon size={14} className={isSubItemActive ? "text-sky-500" : "text-slate-500 group-hover:text-slate-400"} /> 
                             : (isSubItemActive ? <CheckCircle2 size={14} className="text-sky-500" /> : <Circle size={14} className="text-slate-500 group-hover:text-slate-400" />)}
                          <span>{subItem.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  );
};

export default SidebarAdmin;