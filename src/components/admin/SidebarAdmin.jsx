  import React, { useState, useEffect, useCallback } from 'react';
  import {
    Home,
    LayoutDashboard,
    Ticket,
    UserCircle,
    Users,
    Package,
    Briefcase,
    ChevronDown,
    ChevronUp,
    LogOut,
    ChevronsLeft,
    ChevronsRight
  } from 'lucide-react';

  // Les éléments du menu sont définis à l'extérieur pour la performance.
  const menuItems = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'dashboards', label: 'DASHBOARDS', icon: LayoutDashboard },
    { id: 'tickets_management', label: 'TICKETS', icon: Ticket },
    {
      id: 'equipes_main',
      label: 'EQUIPES',
      icon: Users,
      subItems: [{ id: 'equipes_consulter_equipes', label: 'Consulter les équipes' }],
    },
    { id: 'utilisateurs_consulter_utilisateurs', label: 'UTILISATEURS', icon: UserCircle },
    { id: 'modules_consulter_modules', label: 'MODULES', icon: Package },
    { id: 'postes_consulter_postes', label: 'POSTES', icon: Briefcase },
    { id: 'clients_consulter_clients', label: 'Clients', icon: Users },
  ];

  const defaultUserProfileImage = 'https://placehold.co/100x100/E2E8F0/4A5568?text=User';

  const SidebarAdmin = ({
    activePage,
    setActivePage,
    isSidebarOpen,
    isSidebarPinned,
    toggleSidebarPin,
    currentUser, // Reçoit l'utilisateur authentifié
    logout,      // Reçoit la fonction de déconnexion
  }) => {
    const [openDropdownKey, setOpenDropdownKey] = useState(null);

    // Ouvre le menu déroulant parent si une de ses pages est active
    useEffect(() => {
      const currentActivePageId = typeof activePage === 'object' ? activePage.id : activePage;
      const activeParent = menuItems.find(item =>
        item.subItems?.some(sub => sub.id === currentActivePageId)
      );
      setOpenDropdownKey(activeParent ? activeParent.id : null);
    }, [activePage]);

    // Gère le clic sur un élément du menu principal
    const handleMainMenuClick = (item) => {
      if (item.subItems) {
        setOpenDropdownKey(prevKey => (prevKey === item.id ? null : item.id));
      } else {
        setActivePage(item.id);
      }
    };

    // Gère le clic sur un sous-élément
    const handleSubMenuClick = (subItem) => {
      setActivePage(subItem.id);
    };

    // Détermine si un élément ou sous-élément est actif
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

    const userName = currentUser ? `${currentUser.prenom || ''} ${currentUser.nom || ''}`.trim() : 'Utilisateur';
    const userProfilePic = currentUser?.photo ? `data:image/jpeg;base64,${currentUser.photo}` : defaultUserProfileImage;

    return (
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 w-64 transition-transform transform ease-in-out duration-300 z-40 flex flex-col shadow-lg
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isSidebarPinned ? 'md:translate-x-0' : ''} 
        `}
      >
        {/* En-tête avec le nom de la société et le bouton pour épingler/désépingler */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">CliniSYS</h1>
          <button
            onClick={toggleSidebarPin}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            {isSidebarPinned ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isItemActive = isActive(item);
            return (
              <div key={item.id}>
                <button
                  onClick={() => handleMainMenuClick(item)}
                  className={`group w-full flex items-center justify-between space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isItemActive
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </div>
                  {item.subItems && (
                    openDropdownKey === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </button>
                {item.subItems && openDropdownKey === item.id && (
                  <div className="mt-2 pl-7 space-y-1">
                    {item.subItems.map((subItem) => {
                      const isSubItemActive = isActive(item, subItem);
                      return (
                        <a
                          key={subItem.id}
                          href="#"
                          onClick={(e) => { e.preventDefault(); handleSubMenuClick(subItem); }}
                          className={`group flex items-center space-x-3 py-2 px-3 rounded-md text-xs font-medium transition-colors duration-150 ${
                            isSubItemActive
                              ? 'text-sky-600 dark:text-sky-400 font-semibold'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isSubItemActive ? 'bg-sky-500' : 'bg-slate-400 group-hover:bg-slate-500'}`}></div>
                          <span>{subItem.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Pied de page avec le profil utilisateur */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center">
            <img src={userProfilePic} alt="Profil" className="h-10 w-10 rounded-full object-cover" onError={(e) => { e.currentTarget.src = defaultUserProfileImage; }} />
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.role || 'Rôle'}</p>
            </div>
            <button onClick={logout} title="Déconnexion" className="ml-auto flex-shrink-0 p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    );
  };

  export default SidebarAdmin;