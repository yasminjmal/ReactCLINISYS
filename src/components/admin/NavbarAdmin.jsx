// src/components/admin/NavbarAdmin.jsx

import { useState, useEffect, useRef } from 'react';
// AJOUT : Ajout de l'icône Bell
import { ChevronDown, User, LogOut, Sun, Moon, UserCircle, Bell } from 'lucide-react'; 
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// Simulez un service si vous ne l'avez pas
// import { getUnreadNotifications } from '../../services/notificationService';

const NavbarAdmin = ({ toggleSidebar, user, onLogout, onSearch, isSidebarOpen, onNavigate }) => {
    const { currentUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme(); // On conserve votre gestion de thème originale
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

    // J'utilise des données statiques pour que l'exemple soit visible immédiatement
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false); // Mis à false pour la démo

    const userId = localStorage.getItem('userId');
    const getAuthToken = () => {
        const token = localStorage.getItem('authToken'); 
        return token ? `Bearer ${token}` : null;
    };

    const dropdownRef = useRef(null);
    const notificationDropdownRef = useRef(null);

    useEffect(() => {
        // CORRECTION : `token` n'était pas défini. Ajout de cette ligne pour éviter un crash.
        const token = getAuthToken(); 
        if (userId && token) {
            /*
            // Décommentez pour utiliser votre API
            getUnreadNotifications(userId, token)
                .then(response => setNotifications(response.data))
                .catch(err => console.error("Failed to fetch notifications:", err));
            */
        }
    }, []);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
                setNotificationDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
            <div className="flex items-center">
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
                {/* Theme Toggle (votre code original, inchangé) */}
                <button onClick={toggleTheme} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* AJOUT : La cloche de notification et son menu déroulant */}
                <div className="relative " ref={notificationDropdownRef}>
                    <button 
                        onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)} 
                        className="relative pt-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500"
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white ">
                                {notifications.length}
                            </span>
                        )}
                    </button>
                    {notificationDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Notifications</h3>
                            </div>
                            <ul className="py-1 max-h-80 overflow-y-auto">
                                {loading ? (
                                    <li className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">Chargement...</li>
                                ) : notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <li key={n.id} className="border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                                            <a href="#" className="block px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.message}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.timestamp}</p>
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

                {/* DÉPLACÉ : Votre liste de notifications est maintenant dans le menu déroulant de la cloche */}

                {/* Profile Dropdown (votre code original, inchangé) */}
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
                        <User size={24} className="text-slate-600 dark:text-slate-300" />
                        <ChevronDown size={16} className="text-slate-500 dark:text-slate-400" />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => onNavigate('consulter_profil_admin')}
                                className="flex items-center text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-200"
                                title="Voir le profil"
                            >
                                <UserCircle className="h-6 w-6 mr-2" />
                                <span className="hidden md:inline">{user?.prenom || 'Profil'}</span>
                            </button>
                            <button onClick={logout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavbarAdmin;