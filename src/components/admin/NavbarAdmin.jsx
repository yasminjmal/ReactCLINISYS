// src/components/admin/NavbarAdmin.jsx

import React, { useState, useEffect, useRef, onNavigate } from 'react';
import { Link } from 'react-router-dom';
import { AlignJustify, Bell, ChevronDown, User, Settings, LogOut, Sun, Moon, UserCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import ConsultProfilPage from './profil/ConsultProfilPage';
import NotificationBell from '../shared/NotificationBell';
import notificationService from '../../services/notificationService';
import authService from '../../services/authService';
import MessageAi from '../shared/messageAI';

const NavbarAdmin = ({ toggleSidebar, user, onLogout, onSearch, isSidebarOpen, onNavigate }) => {
    const { currentUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId'); // Assurez-vous que l'utilisateur est connecté
    const getAuthToken = () => {
        const token = localStorage.getItem('authToken'); // Récupère le token   
        return token ? `Bearer ${token}` : null; // Retourne le token formaté pour l'authentification
    };

    const dropdownRef = useRef(null);
    const notificationDropdownRef = useRef(null);

    useEffect(() => {

        if (userId && token) {
                getUnreadNotifications(userId, token)
                .then(response => setNotifications(response.data))
                .catch(err => console.error("Failed to fetch notifications:", err));
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
                <button onClick={toggleSidebar} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 focus:outline-none">
                    <AlignJustify size={24} />
                </button>
            </div>
            <MessageAi/>

            <div className="flex items-center gap-4 md:gap-6">
                {/* Theme Toggle */}
                <button onClick={toggleTheme} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <nav>
                    {/* Ton UI avec les notifications */}
                    <ul>
                        {notifications.map(n => (
                            <li key={n.id}>{n.message} - {n.timestamp}</li>
                        ))}
                    </ul>
                </nav>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
                        <User size={24} className="text-slate-600 dark:text-slate-300" />
                        <ChevronDown size={16} className="text-slate-500 dark:text-slate-400" />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => onNavigate('consulter_profil_admin')} // <-- C'est la clé !
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