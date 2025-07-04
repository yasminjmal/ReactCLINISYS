// src/components/chefEquipe/SidebarChefEquipe.jsx
import React from 'react';
import { LayoutDashboard, User, LogOut, Ticket, Users, ListChecks, BadgeX, ClipboardList } from 'lucide-react';

const Logo = () => (
    <div className="bg-green-400 w-10 h-10 rounded-full flex items-center justify-center">
        <Ticket size={22} className="text-white" />
    </div>
);

const NavItem = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2.5 rounded-lg transition-colors duration-200 ${
            isActive
                ? 'bg-green-400 text-white shadow-lg'
                : 'text-slate-500 hover:bg-white-400 hover:text-green-600'
        }`}
    >
        {React.cloneElement(icon, { size: 20, className: "mr-4 flex-shrink-0" })}
        <span className="font-medium">{label}</span>
    </button>
);

const SidebarChefEquipe = ({ activePage, setActivePage, onLogout }) => {
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
        <aside className="w-75 bg-white h-screen flex flex-col p-4 shadow-lg sticky top-0">
            <div className="flex items-center gap-3 mb-10 px-2">
                <Logo />
                <h1 className="text-xl font-bold text-slate-800">Ticketing</h1>
            </div>

            <nav className="flex-1 flex flex-col space-y-1">
                <p className="px-4 text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Menu</p>
                {menuItems.map(item => (
                    <NavItem key={item.id} {...item} isActive={activePage === item.id} onClick={() => setActivePage(item.id)} />
                ))}

                <p className="px-4 pt-6 text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Tickets</p>
                {ticketItems.map(item => (
                     <NavItem key={item.id} {...item} isActive={activePage === item.id} onClick={() => setActivePage(item.id)} />
                ))}
            </nav>

            <div className="mt-auto space-y-2">
               <NavItem icon={<User />} label="Mon Profil" isActive={activePage === 'profile'} onClick={() => setActivePage('profile')} />
               <NavItem icon={<LogOut />} label="Déconnexion" isActive={false} onClick={onLogout} />
            </div>
        </aside>
    );
};

export default SidebarChefEquipe;
