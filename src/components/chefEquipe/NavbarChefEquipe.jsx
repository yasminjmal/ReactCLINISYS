import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Bell, UserCircle, LogOut, ChevronDown, ChevronUp, User as UserIconLucide } from 'lucide-react';

const NavbarAdmin = ({ 
  user, 
  onLogout, 
  toggleTheme, 
  isDarkMode,
  onNavigate // Fonction pour changer de page (ex: onNavigate('profil'))
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Helper pour obtenir l'URL de l'image de profil (Base64 ou placeholder)
  const getProfileImageUrl = (user) => {
      if (user?.photo) {
          return `data:image/jpeg;base64,${user.photo}`;
      }
      return null;
  };

  const userName = user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : 'Administrateur';
  const userEmail = user ? user.email : 'admin@example.com';
  const userProfilePic = getProfileImageUrl(user);

  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);

  // Gère la fermeture du dropdown si on clique en dehors
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
    <nav className="sticky top-0 h-16 bg-white dark:bg-slate-800 shadow-md z-40 flex items-center justify-between px-4 md:px-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Panneau d'Administration</h1>
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
          {/* Exemple de badge de notification */}
          {/* <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800" /> */}
        </button>

        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={toggleProfileDropdown}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {userProfilePic ? (
              <img src={userProfilePic} alt="Profil" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <UserCircle size={28} className="text-slate-600 dark:text-slate-300" />
            )}
            <span className="hidden md:inline text-sm font-medium text-slate-700 dark:text-slate-200">
              {userName}
            </span>
            {isProfileDropdownOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} />}
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-100 truncate" title={userName}>
                  {userName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={userEmail}>
                  {userEmail}
                </p>
              </div>
              <button
                  onClick={() => {
                    if (onNavigate) onNavigate('profil');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center"
                >
                  <UserIconLucide size={16} className="mr-2.5 text-slate-500 dark:text-slate-400" />
                  Mon Profil
                </button>
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

export default NavbarAdmin;