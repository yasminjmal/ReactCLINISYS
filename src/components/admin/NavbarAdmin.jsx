// src/components/admin/NavbarAdmin.jsx
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, UserCircle, LogOut, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import userService from '../../services/userService';
import { toast } from 'react-toastify';
import SearchAiBar from '../shared/SearchAiBar';

const NavbarAdmin = ({ onNavigate }) => {
    const { currentUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { notifications, unreadCount, markAsRead, loading } = useNotifications();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);
    const notificationDropdownRef = useRef(null);
    const [fulluser, setFullUser] = useState({});

    useEffect(() => {
        const fetchFullUser = async () => {
            if (currentUser?.id) {
                try {
                    const response = await userService.getUserById(currentUser.id);
                    setFullUser(response);
                } catch (error) {
                    toast.error("Erreur de chargement des données de l'utilisateur.");
                }
            }
        };
        fetchFullUser();
    }, [currentUser]);

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

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            console.log(`Navigation vers : ${notification.link}`);
        }
        setNotificationDropdownOpen(false);
    };

    const userProfilePic = fulluser.photo ? `data:image/jpeg;base64,${fulluser.photo}` : `https://i.pravatar.cc/150?u=${fulluser?.id || 'default'}`;

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
           
            <div className="flex items-center gap-4 md:gap-6 ml-auto">
                <button onClick={toggleTheme} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="relative" ref={notificationDropdownRef}>
                    <button
                        onClick={() => setNotificationDropdownOpen(p => !p)}
                        className="relative pt-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500"
                    >
                        <Bell size={22} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white ring-2 ring-white dark:ring-slate-900">
                                {unreadCount}
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
                                    <li className="px-4 py-3 text-sm text-center text-slate-500 dark:text-slate-400">Chargement...</li>
                                ) : notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <li key={n.id} className="border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                                            <a href="#" onClick={() => handleNotificationClick(n)} className="block px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.message}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                            </a>
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-3 text-sm text-center text-slate-500 dark:text-slate-400">
                                        Aucune notification
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
                <img src={userProfilePic} alt="Profil" className="w-9 h-9 rounded-full object-cover" />

                <div className=" border-b border-slate-200 dark:border-slate-700">

                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{`${fulluser.prenom} ${fulluser.nom}`}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{fulluser.email}</p>
                </div>
                <button onClick={() => setDropdownOpen(p => !p)} className="flex items-center gap-2">
                    <ChevronDown size={16} className={`text-slate-500 dark:text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className="relative" ref={dropdownRef}>


                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-200 dark:border-slate-700">

                            <button
                                onClick={() => { onNavigate('consulter_profil_admin'); setDropdownOpen(false); }}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <UserCircle size={16} /> Profil
                            </button>
                            <button onClick={logout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <LogOut size={16} /> Déconnexion
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavbarAdmin;