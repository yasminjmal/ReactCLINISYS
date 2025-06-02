// src/components/employe/HeaderEmploye.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Menu, UserCircle, Bell, ChevronDown, LogOut, Edit } from 'lucide-react';

// Ajout de la prop onNavigateToProfile et onLogout vient maintenant d'ici
const HeaderEmploye = ({ pageTitle, user, toggleSidebar, onLogout, onNavigateToProfile }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-30"> {/* z-index augmenté */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 mr-3 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Ouvrir le menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 hidden sm:block truncate max-w-xs md:max-w-md lg:max-w-lg" title={pageTitle}>
            {pageTitle}
          </h1>
        </div>

        <div className="flex items-center space-x-3 md:space-x-4">
          <button className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none relative" title="Notifications">
            <Bell size={22} />
            <span className="absolute top-1 right-1.5 block h-2 w-2 rounded-full bg-sky-500 ring-2 ring-white dark:ring-slate-800"></span>
          </button>
          
          {/* Menu déroulant du profil utilisateur */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800"
              aria-expanded={isProfileDropdownOpen}
              aria-haspopup="true"
              title="Menu utilisateur"
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profil"
                  className="h-8 w-8 rounded-full object-cover border-2 border-slate-300 dark:border-slate-600"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/default-profile.png';}}
                />
              ) : (
                <UserCircle size={28} className="text-slate-500 dark:text-slate-400" />
              )}
              {user?.name && (
                 <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-200 hidden md:block">
                  {user.name}
                </span>
              )}
              <ChevronDown size={18} className={`ml-1 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''} hidden md:block`} />
            </button>

            {isProfileDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-700 rounded-md shadow-xl py-1 z-50 border dark:border-slate-600 animate-fadeIn"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                <div className="px-4 py-3 border-b dark:border-slate-600">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate" title={user?.name}>{user?.name || 'Utilisateur'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={user?.email}>{user?.email || 'email@example.com'}</p>
                </div>
                <button
                  onClick={() => { onNavigateToProfile(); setIsProfileDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center"
                  role="menuitem"
                >
                  <UserCircle size={16} className="mr-2.5 text-slate-500 dark:text-slate-400" />
                  Consulter mon profil
                </button>
                <button
                  onClick={() => { onLogout(); setIsProfileDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/30 flex items-center"
                  role="menuitem"
                >
                  <LogOut size={16} className="mr-2.5" />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
       <style jsx="true">{`
        .animate-fadeIn { animation: fadeInDropdown 0.15s ease-out forwards; }
        @keyframes fadeInDropdown { 
          from { opacity: 0; transform: translateY(-5px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </header>
  );
};

export default HeaderEmploye;
