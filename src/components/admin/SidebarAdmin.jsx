// src/components/admin/SidebarAdmin.jsx
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
  MessageSquare,
  HelpCircle,
  Phone,
  Aperture,
} from 'lucide-react';
import logoClinisys from '../../assets/images/logoTRANSPARENT.png';


const menuItems = [
  { type: 'header', label: 'MENU PRINCIPAL' },
  { id: 'home', label: 'HOME', icon: Home },
  { id: 'dashboards', label: 'DASHBOARDS', icon: LayoutDashboard },
  { id: 'tickets_management', label: 'TICKETS', icon: Ticket },
  {
    id: 'equipes_consulter_equipes',
    label: 'EQUIPES',
    icon: Users,
  },
  { id: 'utilisateurs_consulter_utilisateurs', label: 'UTILISATEURS', icon: UserCircle },
  { id: 'modules_consulter_modules', label: 'MODULES', icon: Package },
  { id: 'postes_consulter_postes', label: 'POSTES', icon: Briefcase },
  { id: 'clients_consulter_clients', label: 'CLIENTS', icon: Users },
  // NOTE: 'discussions' is handled by the icon at the bottom, but we can add it here
  // for state management if needed, or handle it separately. We'll handle it separately.
];


const defaultUserProfileImage = 'https://placehold.co/100x100/E2E8F0/4A5568?text=User';
const profileBackgroundImage = 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb91?q=80&w=2574&auto=format&fit=crop';


const SidebarAdmin = ({
  activePage,
  setActivePage,
  isSidebarOpen,
  isSidebarPinned,
  currentUser,
}) => {
  const [openDropdownKey, setOpenDropdownKey] = useState(null);

  useEffect(() => {
    const currentActivePageId = typeof activePage === 'object' ? activePage.id : activePage;
    const activeParent = menuItems.find(item =>
      item.subItems?.some(sub => sub.id === currentActivePageId)
    );
    setOpenDropdownKey(activeParent ? activeParent.id : null);
  }, [activePage]);

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

  // Define if the chat icon is active
  const isChatActive = activePage === 'discussions';

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
            src={logoClinisys}
            alt="Logo CliniSYS"
            className="h-15 w-auto object-contain"
          />
        </div>
      </div>
      <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
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

      {/* MODIFICATION HERE: The buttons at the bottom */}
      <div className="flex-shrink-0 p-2 border-t border-black/10">
        <div className="flex items-center justify-around">
            {/* THIS IS THE BUTTON YOU WANT TO CLICK */}
          <button 
                onClick={() => setActivePage('discussions')}
                className={`p-2 rounded-md transition-colors ${isChatActive ? 'text-blue-700 bg-blue-500/20' : 'text-slate-500 hover:bg-blue-500/10 hover:text-blue-700'}`}>
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

export default SidebarAdmin;