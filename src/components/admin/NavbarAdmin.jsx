// src/components/admin/NavbarAdmin.jsx
import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import defaultProfilePic from '../../assets/images/default-profile.png';
import ThemeToggleButton from '../shared/ThemeToggleButton'; // Import the button

const NavbarAdmin = () => {
    const { currentUser, handleLogout } = useOutletContext();

    const userLogin = currentUser?.login || "Admin";
    const profileImage = currentUser?.photo ? `data:image/jpeg;base64,${currentUser.photo}` : defaultProfilePic;

    return (
        <nav className="bg-white dark:bg-slate-800 shadow-md h-16 flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Tableau de bord</h1>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors" title="Notifications">
                    <Bell size={20} />
                </button>

                {/* Add the theme toggle button here */}
                <ThemeToggleButton />

                <div className="relative">
                    <Link to="/admin/profil" className="flex items-center space-x-2">
                        <img src={profileImage} alt="Profil" className="h-9 w-9 rounded-full object-cover" />
                        <span className="hidden md:inline text-sm font-medium text-slate-700 dark:text-slate-200">{userLogin}</span>
                    </Link>
                </div>

                <button onClick={handleLogout} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors" title="Déconnexion">
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    );
};

export default NavbarAdmin;