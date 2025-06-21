// src/components/admin/NavbarAdmin.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Sun, Moon, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import defaultUserProfileImage from '../../assets/images/default-profile.png';
import { useAuth } from '../../context/AuthContext';

const NavbarAdmin = ({ onSearch }) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userName = currentUser ? `${currentUser.prenom || ''} ${currentUser.nom || ''}`.trim() : 'Utilisateur';
  const userProfilePic = currentUser?.photo ? `data:image/jpeg;base64,${currentUser.photo}` : defaultUserProfileImage;

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md h-16 flex items-center justify-between px-6">
      <div className="flex-grow flex justify-center">
        <div className="relative w-full max-w-md ">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder={t('search')}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-700 dark:border-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button onClick={toggleLanguage} title={i18n.language === 'fr' ? t('switchToEnglish') : t('switchToFrench')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          <span className="font-semibold text-slate-600 dark:text-slate-300">{i18n.language.toUpperCase()}</span>
        </button>
        <button onClick={toggleTheme} title={theme === 'dark' ? t('lightMode') : t('darkMode')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          {theme === 'dark' ? <Sun className="text-slate-300" size={20} /> : <Moon className="text-slate-600" size={20} />}
        </button>
        <button title={t('notifications')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          <Bell className="text-slate-600 dark:text-slate-300" size={20} />
        </button>
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
                {t('viewProfile')}
              </button>
              <button onClick={logout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50">
                <LogOut size={16} className="mr-2" />
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarAdmin;