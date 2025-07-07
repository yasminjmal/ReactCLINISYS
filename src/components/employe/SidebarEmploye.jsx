// src/components/employe/SidebarEmploye.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Home, ListChecks, Edit3, CheckSquare, LogOut, MessageSquare, HelpCircle, Phone, UserCircle } from 'lucide-react';
import logoClinisysTransparent from '../../assets/images/logoTRANSPARENT.png';

const defaultUserProfileImage = 'https://placehold.co/100x100/E2E8F0/4A5568?text=User';

const SidebarEmploye = ({ activePage, setActivePage, currentUser, onLogout, isSidebarOpen }) => {
  const [openDropdownKey, setOpenDropdownKey] = useState(null);

  const navItems = [
    { type: 'header', label: 'MENU PRINCIPAL' },
    { id: 'home_employe', label: 'ACCUEIL', icon: Home }, // Nouveau ID et libellé pour la page d'accueil

    { id: 'dashboard_employe', label: 'Tableau de Bord', icon: Home },
    { id: 'tickets_en_attente_employe', label: 'Mes Tickets en Attente', icon: ListChecks }, // Renommé ici
    { id: 'travail_en_cours_employe', label: 'Mon Travail en Cours', icon: Edit3 },
    { id: 'tickets_resolus_employe', label: 'Tickets Résolus', icon: CheckSquare },
    { id: 'mes_travaux_employe', label: 'Mes Travaux', icon: ListChecks }, // Nouveau menu pour "Mes Travaux"
    // Option 'Tickets Refusés' supprimée de la sidebar
  ];

  useEffect(() => {
    const currentActivePageId = typeof activePage === 'object' ? activePage.id : activePage;
    const activeParent = navItems.find(item =>
      item.subItems?.some(sub => sub.id === currentActivePageId)
    );
    setOpenDropdownKey(activeParent ? activeParent.id : null);
  }, [activePage, navItems]);

  const handleMainMenuClick = (item) => {
    if (item.subItems) {
      setOpenDropdownKey(prevKey => (prevKey === item.id ? null : item.id));
    } else if (item.id) {
      setActivePage(item.id);
    }
  };

  const isActive = useCallback((item, subItem = null) => {
    const pageId = typeof activePage === 'object' ? activePage.id : activePage;
    if (subItem) {
      return pageId === subItem.id;
    }
    if (item.subItems) {
      return item.subItems.some(sub => sub.id === pageId);
    }
    return pageId === item.id;
  }, [activePage]);

  const userName = currentUser ? `${currentUser.prenom || ''} ${currentUser.nom || ''}`.trim() : 'Employé';
  const userProfilePic = currentUser?.photo ? `data:image/jpeg;base64,${currentUser.photo}` : defaultUserProfileImage;

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 transition-transform transform ease-in-out duration-300 z-40 flex flex-col shadow-lg
        bg-gradient-to-b from-sky-100 to-blue-200
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex-shrink-0">
        <div className="h-16 flex items-center px-4 space-x-2 border-b border-black/10">
          <img
            src={logoClinisysTransparent}
            alt="Logo Clinisys"
            className="h-15 w-auto object-contain"
          />
        </div>

        {isSidebarOpen && currentUser && (
          <div >
            
            
          </div>
        )}
      </div>

      <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          if (item.type === 'header') {
            return (
              <div key={`header-${index}`} className="px-3 pt-4 pb-2 text-xs font-bold uppercase text-slate-500">
                {item.label}
              </div>
            );
          }

          const isItemActive = isActive(item);
          return (
            <div key={item.id}>
              <button
                onClick={() => handleMainMenuClick(item)}
                className={`group w-full flex items-center justify-between space-x-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-200
                  ${isItemActive
                    ? 'bg-blue-500/20 text-blue-800 font-semibold border-l-4 border-blue-500'
                    : 'text-slate-600 hover:bg-blue-500/10 hover:text-slate-800'
                  }`
                }
                style={isItemActive ? { paddingLeft: '8px' } : {}}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={20} className={isItemActive ? 'text-blue-600' : ''} />
                  <span>{item.label}</span>
                </div>
              </button>
            </div>
          );
        })}
      </nav>

      <div className="flex-shrink-0 p-2 border-t border-black/10">
        <div className="flex items-center justify-around">
          <button className="p-2 rounded-md text-slate-500 hover:bg-blue-500/10 hover:text-blue-700 transition-colors">
            <MessageSquare size={20} />
          </button>
          <button className="p-2 rounded-md text-slate-500 hover:bg-blue-500/10 hover:text-blue-700 transition-colors">
            <HelpCircle size={20} />
          </button>
          <button className="p-2 rounded-md text-slate-500 hover:bg-blue-500/10 hover:text-blue-700 transition-colors">
            <Phone size={20} />
          </button>
        </div>
        <button
            onClick={onLogout}
            title="Se déconnecter"
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-slate-600 hover:bg-red-600 hover:text-white mt-2`}
          >
            <LogOut size={20} className="flex-shrink-0 group-hover:text-white" />
            <span>Se déconnecter</span>
          </button>
      </div>
    </aside>
  );
};

export default SidebarEmploye;