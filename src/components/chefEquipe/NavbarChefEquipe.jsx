// src/components/chefEquipe/NavbarChefEquipe.jsx
import React, { useState, useEffect, useRef } from 'react';
import { AlignJustify, Bell, ChevronDown, User, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { IoNotifications } from "react-icons/io5";
import MessageAi from '../shared/messageAI';
const getProfileImageUrl = (user) => user?.photo ? `data:image/jpeg;base64,${user.photo}` : `https://i.pravatar.cc/150?u=${user?.id || 'default'}`;

const NavbarChefEquipe = ({ user, onLogout, toggleSidebar, toggleTheme, isDarkMode, setActivePage }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const userName = user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : 'Chef d\'équipe';
    const userProfilePic = getProfileImageUrl(user);

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
                <MessageAi/>
            {/* Left: Sidebar Toggle */}
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-500 focus:outline-none lg:hidden">
                    <AlignJustify size={24} />
                </button>
            </div>

            {/* Right: Notification + Theme + Profile */}
            <div className="flex items-center gap-4 md:gap-6 ml-auto">
                {/* Notification Icon */}
                <div className="text-slate-600 dark:text-white pt-1 mt-1">
                    <button>
                        <IoNotifications size={24} />
                    </button>
                </div>

                {/* Theme Toggle */}
                <button onClick={toggleTheme} className="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-500">
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-3">
                        <img src={userProfilePic} alt="Profil" className="w-9 h-9 rounded-full object-cover" />
                        <div className="hidden md:flex flex-col items-start">
                            <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{userName}</span>
                            <span className="text-xs text-slate-500">Chef d'équipe</span>
                        </div>
                        <ChevronDown size={16} className="text-slate-500 dark:text-slate-400" />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-200 dark:border-slate-700">
                            <button onClick={() => { setActivePage('profile'); setDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                <Settings size={16} /> Mon Profil
                            </button>
                            <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <LogOut size={16} /> Déconnexion
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>

    );
};

export default NavbarChefEquipe;