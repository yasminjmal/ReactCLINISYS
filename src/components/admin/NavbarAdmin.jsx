// src/components/admin/NavbarAdmin.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AlignJustify, Bell, ChevronDown, User, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';


const NavbarAdmin = ({ toggleSidebar }) => {
    const { currentUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const dropdownRef = useRef(null);
    const notificationDropdownRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (currentUser?.id) {
                try {
                    setLoading(true);
                    const data = await notificationService.getUnreadNotifications(currentUser.id);
                    setNotifications(data || []);
                } catch (error) {
                    console.error("Failed to fetch notifications:", error);
                    setNotifications([]); // Ensure notifications is always an array
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchNotifications();
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

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.filter(notif => notif.id !== id));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 focus:outline-none">
                    <AlignJustify size={24} />
                </button>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                {/* Theme Toggle */}
                <button onClick={toggleTheme} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationDropdownRef}>
                    <button onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)} className="relative text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500">
                        <Bell size={22} />
                        {/* --- THE FIX IS HERE --- */}
                        {/* Use optional chaining `?.` to prevent crash if notifications is undefined */}
                        {(notifications?.length > 0) && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
                                    {notifications.length}
                                </span>
                            </span>
                        )}
                    </button>

                    {notificationDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <div className="p-3 font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">Notifications</div>
                            <div className="max-h-80 overflow-y-auto">
                                {loading ? (
                                    <div className="p-4 text-center text-slate-500">Loading...</div>
                                ) : (notifications?.length > 0) ? (
                                    notifications.map(notif => (
                                        <div key={notif.id} className="p-3 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{notif.message}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <time className="text-xs text-slate-400">{new Date(notif.dateCreation).toLocaleString()}</time>
                                                <button onClick={() => markAsRead(notif.id)} className="text-xs text-blue-500 hover:underline">Mark as read</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-slate-500">No new notifications</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
                        <User size={24} className="text-slate-600 dark:text-slate-300" />
                        <ChevronDown size={16} className="text-slate-500 dark:text-slate-400" />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-200 dark:border-slate-700">
                            <Link to="/admin/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                <Settings size={16} /> Profile
                            </Link>
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