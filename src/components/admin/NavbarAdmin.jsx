import React, { useState, useEffect, useRef } from 'react';
import { Bell, Sun, Moon, LogOut, User as UserIcon, ChevronDown } from 'lucide-react'; 
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import defaultUserProfileImage from '../../assets/images/default-profile.png';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../shared/LanguageSwitcher';
import { useWebSocket } from '../../context/WebSocketContext';

const MetaAiIcon = () => {
  return (
    <div className="meta-ai-icon"></div>
  );
};

const NavbarAdmin = ({ onSearch, isSidebarOpen }) => { 
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  
  const { notifications, clearNotifications } = useWebSocket(); 

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userName = currentUser ? `${currentUser.prenom || ''} ${currentUser.nom || ''}`.trim() : 'Utilisateur';
  const userProfilePic = currentUser?.photo ? `data:image/jpeg;base64,${currentUser.photo}` : defaultUserProfileImage;

  const handleNotificationClick = () => {
      setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
  };

  return (
    // La nav est fixe en haut de son conteneur parent (qui est décalé par la sidebar).
    // Elle a relative z-20 pour que son contenu soit correctement positionné.
    <nav className="fixed w-full top-0 left-0 bg-white dark:bg-slate-800 shadow-md h-16 flex items-center justify-between px-6 relative z-20">
      
      {/* Le bouton de bascule de la sidebar a été déplacé dans InterfaceAdmin.jsx */}
      
      

      {/* Zone de recherche: ml-auto mr-auto pour la pousser et la centrer dans l'espace restant */}
      <div className="flex-grow flex justify-center ml-auto mr-auto px-4"> 
        <div className="search-container relative flex items-center w-full max-w-md bg-slate-900 rounded-full px-3 py-1.5">
          <MetaAiIcon />
          <input
            type="text"
            placeholder="Ask CliniAI or Search"
            className="w-full ml-3 bg-transparent text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <LanguageSwitcher />
        
        <button onClick={toggleTheme} title={t('pages.navbar.lightMode')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          {theme === 'dark' ? <Sun className="text-slate-300" size={20} /> : <Moon className="text-slate-600" size={20} />}
        </button>

        <div className="relative" ref={notificationDropdownRef}>
            <button onClick={handleNotificationClick} title={t('pages.navbar.notifications')} className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <Bell className="text-slate-600 dark:text-slate-300" size={20} />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-slate-800" />
                )}
            </button>
            {isNotificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 z-50">
                    <div className="p-3 border-b dark:border-slate-700 flex justify-between items-center">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">Notifications</p>
                        {notifications.length > 0 && (
                            <button onClick={clearNotifications} className="text-xs text-blue-500 hover:underline">Clear all</button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notif, index) => (
                                <div key={index} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{notif.content}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No new notifications</p>
                        )}
                    </div>
                </div>
            )}
        </div>

        <div className="relative" ref={profileDropdownRef}>
          <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center space-x-2">
            <img src={userProfilePic} alt="Profil" className="h-9 w-9 rounded-full object-cover" onError={(e) => { e.currentTarget.src = defaultUserProfileImage; }}/>
            <ChevronDown size={16} className={`transition-transform text-slate-500 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 py-1 z-50">
              <div className="px-4 py-2 border-b dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{userName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
              </div>
              <button onClick={() => {/* Navigate to profile */}} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <UserIcon size={16} className="mr-2" />
                {t('pages.navbar.profile')}
              </button>
              <button onClick={logout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50">
                <LogOut size={16} className="mr-2" />
                {t('pages.navbar.logout')}
              </button>
            </div>  
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarAdmin;