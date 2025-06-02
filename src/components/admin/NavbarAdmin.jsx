// src/components/admin/NavbarAdmin.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Sun, Moon, LogOut, User as UserIconLucide, ChevronDown, ChevronUp } from 'lucide-react'; // Renommé User en UserIconLucide pour éviter conflit

// Importation des images depuis src/assets/images/ - VEUILLEZ VÉRIFIER CES CHEMINS
import defaultUserProfileImage_Navbar from '../../assets/images/default-profile.png';
import frFlagImage_Navbar from '../../assets/images/fr-flag.png';
import gbFlagImage_Navbar from '../../assets/images/gb-flag.png';

const NavbarAdmin = ({ 
  user, 
  onLogout, 
  toggleTheme, 
  isDarkMode, 
  currentLanguage, 
  toggleLanguage,
  onNavigateToUserProfile // Prop ajoutée pour la navigation vers le profil
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null); // Ref pour le dropdown du profil

  // Logique pour afficher les informations de l'utilisateur (adaptée de votre code)
  const userName = user ? (user.name || `${user.prenom || ''} ${user.nom || ''}`.trim() || user.nom_utilisateur) : 'Utilisateur';
  const userRole = user && user.role ? user.role.replace('_', ' ') : 'Rôle';
  const userEmail = user ? (user.email || `${user.nom_utilisateur || 'user'}@example.com`) : 'email@example.com';
  
  // Logique pour l'image de profil (adaptée de votre code)
  const userProfilePic = user && user.profileImage && typeof user.profileImage === 'string' && user.profileImage.length > 0
                       ? user.profileImage
                       : defaultUserProfileImage_Navbar;

  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md fixed top-0 left-0 md:left-64 right-0 z-40 h-16 flex items-center justify-between px-4 md:px-6 transition-all duration-300 ease-in-out">
      {/* Espace réservé à gauche pour le bouton menu sur mobile (géré par InterfaceAdmin) */}
      <div className="w-10 md:w-0"> 
        {/* Ce div peut être utilisé par le bouton menu mobile qui est dans InterfaceAdmin.jsx */}
      </div>

      {/* Barre de recherche au centre */}
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

      {/* Icônes et profil utilisateur à droite */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {toggleLanguage && currentLanguage && (
            <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title={currentLanguage === 'fr' ? "Switch to English" : "Passer en Français"}
            >
            <span className="text-xs font-semibold">{currentLanguage === 'fr' ? 'FR' : 'EN'}</span>
            {currentLanguage === 'fr' ? (
                <img src={gbFlagImage_Navbar} alt="English Flag" className="h-5 w-5 rounded-sm object-cover" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement.querySelector('span').textContent = 'EN'; }}/>
            ) : (
                <img src={frFlagImage_Navbar} alt="French Flag" className="h-5 w-5 rounded-sm object-cover" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement.querySelector('span').textContent = 'FR'; }}/>
            )}
            </button>
        )}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title={isDarkMode ? "Mode Clair" : "Mode Sombre"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title="Notifications"
        >
          <Bell size={20} />
          {/* Exemple de badge de notification */}
          {/* <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800" /> */}
        </button>

        {/* Menu déroulant du profil */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={toggleProfileDropdown}
            className="flex items-center space-x-2 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
          >
            <div className="hidden sm:block text-right mr-1">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[100px]" title={userName}>{userName}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate max-w-[100px]" title={userRole}>{userRole}</div>
            </div>
            <img
              src={userProfilePic}
              alt="Profil"
              className="h-9 w-9 md:h-10 md:w-10 rounded-full object-cover border-2 border-transparent group-hover:border-sky-400 dark:group-hover:border-sky-500 transition-all"
              onError={(e) => { e.currentTarget.src = defaultUserProfileImage_Navbar; }}
            />
             {isProfileDropdownOpen ? <ChevronUp size={16} className="text-slate-500 dark:text-slate-400 ml-1 hidden sm:block" /> : <ChevronDown size={16} className="text-slate-500 dark:text-slate-400 ml-1 hidden sm:block" />}
          </button>
          {isProfileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-md shadow-xl py-1 z-50 border border-slate-200 dark:border-slate-700"
            > 
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={userName}>{userName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={userEmail}>{userEmail}</p>
              </div>
              <button
                onClick={() => {
                  if (onNavigateToUserProfile) onNavigateToUserProfile();
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80"
              >
                <UserIconLucide size={16} className="mr-2.5 text-slate-500 dark:text-slate-400" />
                Consulter mon profil
              </button>
              <button
                onClick={() => {
                  if (onLogout) onLogout();
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/30"
              >
                <LogOut size={16} className="mr-2.5" />
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
