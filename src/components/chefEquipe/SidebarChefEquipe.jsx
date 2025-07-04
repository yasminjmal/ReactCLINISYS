// src/components/chefEquipe/SidebarChefEquipe.jsx
import React from 'react';
import {
  LayoutDashboard,
  Users,
  User,
  LogOut,
  ListChecks,
  ClipboardList,
  BadgeX,
  Ticket
} from 'lucide-react';

// --- CORRECTION : Ajout de l'importation pour votre logo ---
// Assurez-vous que le chemin vers votre logo est correct.
import logoClinisys from '../../assets/images/logoTRANSPARENT.png'; 

const NavItem = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`group w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-200
            ${isActive
                ? 'bg-violet-500/20 text-violet-800 font-semibold border-l-4 border-violet-500'
                : 'text-slate-600 hover:bg-violet-500/10 hover:text-slate-800'
            }`
        }
        style={isActive ? { paddingLeft: '8px' } : {}}
    >
        {React.cloneElement(icon, { size: 20, className: isActive ? 'text-violet-600' : '' })}
        <span>{label}</span>
    </button>
);

const SidebarChefEquipe = ({ activePage, setActivePage, isSidebarOpen, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard /> },
        { id: 'teams', label: 'Mes Équipes', icon: <Users /> },
    ];

    const ticketItems = [
        { id: 'tickets-to-do', label: 'Tickets à Traiter', icon: <ListChecks /> },
        { id: 'tickets-follow-up', label: 'Suivi Affectations', icon: <ClipboardList /> },
        { id: 'tickets-refused', label: 'Tickets Refusés', icon: <BadgeX /> },
    ];

    return (
        <aside
            className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 transition-transform transform ease-in-out duration-300 z-50 flex flex-col shadow-lg
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            `}
        >
            <div className="h-16 flex items-center px-4 space-x-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                {/* --- CORRECTION : Utilisation de votre logo --- */}
                <img
                    src={logoClinisys}
                    alt="Logo de l'entreprise"
                    className="h-15 w-auto object-contain" // Vous pouvez ajuster la hauteur (h-12)
                />
            </div>

            <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
                <div className="px-3 pt-4 pb-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    Menu Principal
                </div>
                {menuItems.map(item => (
                    <NavItem key={item.id} {...item} isActive={activePage === item.id} onClick={() => setActivePage(item.id)} />
                ))}

                <div className="px-3 pt-4 pb-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    Tickets
                </div>
                {ticketItems.map(item => (
                     <NavItem key={item.id} {...item} isActive={activePage === item.id} onClick={() => setActivePage(item.id)} />
                ))}
            </nav>

            <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                 <NavItem icon={<User />} label="Mon Profil" isActive={activePage === 'profile'} onClick={() => setActivePage('profile')} />
                 <NavItem icon={<LogOut />} label="Déconnexion" isActive={false} onClick={onLogout} />
            </div>
        </aside>
    );
};

export default SidebarChefEquipe;