// src/components/chefEquipe/SidebarChefEquipe.jsx
import React from 'react';
import { LayoutDashboard, User, Settings, LogOut, Ticket, Users, ListChecks, BadgeX } from 'lucide-react';

// À remplacer par votre logo si vous en avez un
const Logo = () => (
    <div className="bg-violet-600 w-10 h-10 rounded-full flex items-center justify-center">
        <Ticket size={22} className="text-white" />
    </div>
);

const NavItem = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-2.5 rounded-lg transition-colors duration-200 ${
            isActive
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-slate-500 hover:bg-violet-100 hover:text-violet-600'
        }`}
    >
        {React.cloneElement(icon, { size: 20, className: "mr-4 flex-shrink-0" })}
        <span className="font-medium">{label}</span>
    </button>
);

const SidebarChefEquipe = ({ activePage, setActivePage, onLogout }) => {
    // Menu simplifié pour correspondre au nouveau design
    const menuItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard /> },
        // Vous pouvez décommenter et ajouter d'autres pages ici
        // { id: 'teams', label: 'Mes Équipes', icon: <Users /> },
        // { id: 'tickets-to-do', label: 'Tickets à Traiter', icon: <ListChecks /> },
        // { id: 'tickets-refused', label: 'Tickets Refusés', icon: <BadgeX /> },
    ];
    
    return (
        <aside className="w-64 bg-white h-screen flex flex-col p-4 shadow-lg sticky top-0">
            <div className="flex items-center gap-3 mb-10 px-2">
                <Logo />
                <h1 className="text-xl font-bold text-slate-800">Ticketing</h1>
            </div>

            <nav className="flex-1 flex flex-col space-y-2">
                <p className="px-4 text-xs text-slate-400 uppercase font-semibold tracking-wider">Menu</p>
                {menuItems.map(item => (
                    <NavItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        isActive={activePage === item.id}
                        onClick={() => setActivePage(item.id)}
                    />
                ))}
            </nav>

            <div className="mt-auto">
                <div className="space-y-2">
                   <NavItem
                        icon={<User />}
                        label="Mon Profil"
                        isActive={activePage === 'profile'}
                        onClick={() => setActivePage('profile')}
                    />
                     <NavItem
                        icon={<LogOut />}
                        label="Déconnexion"
                        isActive={false}
                        onClick={onLogout}
                    />
                </div>
            </div>
        </aside>
    );
};

export default SidebarChefEquipe;