// src/components/chefEquipe/NavbarChefEquipe.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Bell, UserCircle, LogOut, ChevronDown, ChevronUp, User as UserIconLucide } from 'lucide-react';
// import defaultUserProfileImage_Navbar from '../../assets/images/default-profile.png'; // Décommentez et ajustez le chemin si besoin

const NavbarChefEquipe = ({ 
  user, 
  onLogout, 
  toggleTheme, 
  isDarkMode,
  onNavigateToUserProfile 
  // currentLanguage, // Décommentez si vous gérez la langue
  // toggleLanguage   // Décommentez si vous gérez la langue
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const userName = user ? (user.name || `${user.prenom || ''} ${user.nom || ''}`.trim() || user.nom_utilisateur) : 'Chef d\'Équipe';
  const userEmail = user ? (user.email || 'chef@example.com') : 'email@example.com';
  // const userProfilePic = user?.profileImage || defaultUserProfileImage_Navbar; // Adaptez selon votre objet user

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

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white dark:bg-slate-800 shadow-md z-40 flex items-center justify-between px-4 md:px-6 transition-all duration-300 ease-in-out">
      <div>
        {/* Espace pour titre de page dynamique ou logo si besoin */}
        <h1 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Interface Chef d'Équipe</h1>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors relative"
          title="Notifications"
        >
          <Bell size={20} />
          {/* <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800" /> */}
        </button>

        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={toggleProfileDropdown}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {/* {user.profileImage ? (
              <img src={userProfilePic} alt="Profil" className="w-8 h-8 rounded-full object-cover" onError={(e) => e.target.src = defaultUserProfileImage_Navbar} />
            ) : ( */}
              <UserCircle size={28} className="text-slate-600 dark:text-slate-300" />
            {/* )} */}
            <span className="hidden md:inline text-sm font-medium text-slate-700 dark:text-slate-200">
              {userName}
            </span>
            {isProfileDropdownOpen ? <ChevronUp size={16} className="text-slate-500 dark:text-slate-400" /> : <ChevronDown size={16} className="text-slate-500 dark:text-slate-400" />}
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-100 truncate" title={userName}>
                  {userName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={userEmail}>
                  {userEmail}
                </p>
              </div>
              {onNavigateToUserProfile && (
                <button
                  onClick={() => {
                    onNavigateToUserProfile();
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center"
                >
                  <UserIconLucide size={16} className="mr-2.5 text-slate-500 dark:text-slate-400" />
                  Mon Profil
                </button>
              )}
              <button
                onClick={() => {
                  if(onLogout) onLogout();
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/30 flex items-center"
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

export default NavbarChefEquipe;
