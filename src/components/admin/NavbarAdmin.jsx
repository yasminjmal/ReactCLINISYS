import React, { useState } from 'react'; // Assurez-vous que React et useState sont importés
import { Bell, Search, Sun, Moon, LogOut, User } from 'lucide-react';

// Importation des images depuis src/assets/images/
import defaultUserProfileImage_Navbar from '../../assets/images/default-profile.png';
import frFlagImage_Navbar from '../../assets/images/fr-flag.png';
import gbFlagImage_Navbar from '../../assets/images/gb-flag.png';

const NavbarAdmin = ({ user, onLogout, toggleTheme, isDarkMode, currentLanguage, toggleLanguage }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const userName = user ? user.name : 'Utilisateur';
  const userRole = user ? user.role.replace('_', ' ') : 'Rôle';
  const userEmail = user ? (user.email || `${user.username || 'user'}@example.com`) : 'email@example.com';
  // Utiliser l'image importée si user.profileImage n'est pas défini ou est une chaîne vide.
  const userProfilePic = user && user.profileImage && typeof user.profileImage === 'string' && user.profileImage.startsWith('/')
                         ? user.profileImage
                         : (user.profileImage || defaultUserProfileImage_Navbar);


  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md fixed top-0 left-0 right-0 z-30 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="w-10 md:w-64">
      </div>
      <div className="flex-grow flex justify-center px-4">
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-1.5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title={currentLanguage === 'fr' ? "Switch to English" : "Passer en Français"}
        >
          <span className="text-xs font-semibold">{currentLanguage === 'fr' ? 'FR' : 'EN'}</span>
          {currentLanguage === 'fr' ? (
            <img src={gbFlagImage_Navbar} alt="English Flag" className="h-5 w-5 rounded-sm object-cover" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.previousElementSibling.textContent = 'EN'; }}/>
          ) : (
            <img src={frFlagImage_Navbar} alt="French Flag" className="h-5 w-5 rounded-sm object-cover" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.previousElementSibling.textContent = 'FR'; }}/>
          )}
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title={isDarkMode ? "Mode Clair" : "Mode Sombre"}
        >
          {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>
        <button
          className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title="Notifications"
        >
          <Bell size={22} />
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800"></span>
        </button>
        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center space-x-2 rounded-full p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
          >
            <div className="hidden sm:block text-right mr-1">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{userName}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{userRole}</div>
            </div>
            <img
              src={userProfilePic} 
              alt="Profil"
              className="h-10 w-10 rounded-full object-cover border-2 border-transparent group-hover:border-sky-400 dark:group-hover:border-sky-500 transition-all"
              onError={(e) => { e.currentTarget.src = defaultUserProfileImage_Navbar; }}
            />
          </button>
          {isProfileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-xl py-1 z-50 border border-slate-200 dark:border-slate-700"
              onMouseLeave={() => setIsProfileDropdownOpen(false)}
            >
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{userName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
              </div>
              <hr className="border-slate-200 dark:border-slate-700"/>
              <a
                href="#profile"
                onClick={(e) => { e.preventDefault(); setIsProfileDropdownOpen(false); }}
                className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <User size={16} className="mr-2" />
                Consulter mon profil
              </a>
              <button
                onClick={() => { onLogout(); setIsProfileDropdownOpen(false); }}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20"
              >
                <LogOut size={16} className="mr-2" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
export default NavbarAdmin;