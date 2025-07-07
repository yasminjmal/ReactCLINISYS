// src/components/employe/HeaderEmploye.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Menu, UserCircle, Bell, ChevronDown, LogOut } from 'lucide-react';

// ✅ ÉTAPE 1: Importer le hook pour utiliser le contexte de notifications
import { useNotifications } from '../../context/NotificationContext';

const HeaderEmploye = ({ pageTitle, user, toggleSidebar, onLogout, onNavigateToProfile }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // ✅ ÉTAPE 2: Ajouter un état local pour gérer l'ouverture du menu des notifications
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null); // ✅ Référence pour le menu des notifications

  // ✅ ÉTAPE 3: Consommer le contexte de notifications pour obtenir les données et les actions
  const { notifications, unreadCount, markAsRead, loading } = useNotifications();

  // Gérer la fermeture des menus déroulants lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      // ✅ Gérer le clic en dehors du menu de notifications
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Gérer le clic sur une notification
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      // Vous pouvez utiliser votre système de navigation ici si nécessaire
      // Par exemple: navigate(notification.link);
      console.log(`Navigation vers : ${notification.link}`);
    }
    setIsNotificationDropdownOpen(false); // Ferme le menu après le clic
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 mr-3 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Ouvrir le menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 hidden sm:block truncate">
            {pageTitle}
          </h1>
        </div>

        <div className="flex items-center space-x-3 md:space-x-4">
          {/* ✅ ÉTAPE 4: Rendre la cloche et le menu des notifications dynamiques */}
          <div className="relative" ref={notificationDropdownRef}>
            <button 
                onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)} 
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none relative" 
                title="Notifications"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-xs text-white ring-2 ring-white dark:ring-slate-800">
                  {unreadCount}
                </span>
              )}
            </button>
            {isNotificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-slate-700 rounded-md shadow-xl z-50 border dark:border-slate-600">
                <div className="p-3 border-b dark:border-slate-600">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Notifications</h3>
                </div>
                <ul className="py-1 max-h-80 overflow-y-auto">
                  {loading ? (
                    <li className="px-4 py-3 text-sm text-center text-slate-500 dark:text-slate-400">Chargement...</li>
                  ) : notifications.length > 0 ? (
                    notifications.map(n => (
                      <li key={n.id} className="border-b border-slate-100 dark:border-slate-600 last:border-b-0">
                        <a href="#" onClick={() => handleNotificationClick(n)} className="block px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-600">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.message}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-center text-slate-500 dark:text-slate-400">
                      Aucune nouvelle notification
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          
          {/* Menu déroulant du profil utilisateur (inchangé) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profil" className="h-8 w-8 rounded-full object-cover"/>
              ) : (
                <UserCircle size={28} className="text-slate-500 dark:text-slate-400" />
              )}
              <ChevronDown size={18} className={`ml-1 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''} hidden md:block`} />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-700 rounded-md shadow-xl py-1 z-50 border dark:border-slate-600">
                <div className="px-4 py-3 border-b dark:border-slate-600">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user?.name || 'Utilisateur'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'email@example.com'}</p>
                </div>
                <button
                  onClick={() => { onNavigateToProfile(); setIsProfileDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center"
                >
                  <UserCircle size={16} className="mr-2.5 text-slate-500 dark:text-slate-400" />
                  Consulter mon profil
                </button>
                <button
                  onClick={() => { onLogout(); setIsProfileDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/30 flex items-center"
                >
                  <LogOut size={16} className="mr-2.5" />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderEmploye;