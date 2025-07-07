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
  MessageSquare, // Ajout pour les icônes du bas
  HelpCircle,    // Ajout pour les icônes du bas
  Phone,         // Ajout pour les icônes du bas
  Home,          // Ajout pour cohérence si besoin dans le futur
  UserCircle,    // Ajout pour cohérence si besoin dans le futur
  Package,       // Ajout pour cohérence si besoin dans le futur
  Briefcase,     // Ajout pour cohérence si besoin dans le futur
  ChevronDown,   // Ajout pour cohérence si besoin dans le futur
  ChevronUp,     // Ajout pour cohérence si besoin dans le futur
} from 'lucide-react';

import logoClinisys from '../../assets/images/logoTRANSPARENT.png';

// --- MODIFIÉ : NavItem pour correspondre au style de SidebarAdmin ---
const NavItem = ({ icon: IconComponent, label, isActive, onClick }) => ( // Renommé 'icon' en 'IconComponent'
    <button
        onClick={onClick}
        className={`group w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-200
            ${isActive
                ? 'bg-blue-500/20 text-blue-800 font-semibold border-l-4 border-blue-500' // Styles de l'admin sidebar
                : 'text-slate-600 hover:bg-blue-500/10 hover:text-slate-800' // Styles de l'admin sidebar
            }`
        }
        style={isActive ? { paddingLeft: '8px' } : {}}
    >
        {/* Utilisation de IconComponent directement */}
        {IconComponent && <IconComponent size={20} className={isActive ? 'text-blue-600' : ''} />}
        <span>{label}</span>
    </button>
);

const SidebarChefEquipe = ({ activePage, setActivePage, isSidebarOpen, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard }, // Passer l'icône comme composant
        { id: 'teams', label: 'Mes Équipes', icon: Users }, // Passer l'icône comme composant
    ];

    const ticketItems = [
        { id: 'tickets-to-do', label: 'Tickets à Traiter', icon: ListChecks },
        { id: 'tickets-follow-up', label: 'Suivi Affectations', icon: ClipboardList },
        { id: 'tickets-refused', label: 'Tickets Refusés', icon: BadgeX },
    ];

    return (
        <aside
            className={`fixed top-0 left-0 h-full w-64 transition-transform transform ease-in-out duration-300 z-50 flex flex-col shadow-lg
                bg-gradient-to-b from-sky-100 to-blue-200 // Nouveau fond comme l'admin sidebar
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            `}
        >
            <div className="h-16 flex items-center px-4 space-x-3 border-b border-black/10 flex-shrink-0"> {/* Bordure comme l'admin sidebar */}
                <img
                    src={logoClinisys}
                    alt="Logo de l'entreprise"
                    className="h-15 w-auto object-contain"
                />
            </div>

            <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
                <div className="px-3 pt-4 pb-2 text-xs font-bold uppercase text-slate-500"> {/* Couleur de texte comme l'admin sidebar */}
                    Menu Principal
                </div>
                {menuItems.map(item => (
                    <NavItem key={item.id} icon={item.icon} label={item.label} isActive={activePage === item.id} onClick={() => setActivePage(item.id)} />
                ))}

                <div className="px-3 pt-4 pb-2 text-xs font-bold uppercase text-slate-500"> {/* Couleur de texte comme l'admin sidebar */}
                    Tickets
                </div>
                {ticketItems.map(item => (
                    <NavItem key={item.id} icon={item.icon} label={item.label} isActive={activePage === item.id} onClick={() => setActivePage(item.id)} />
                ))}
            </nav>

            <div className="p-2 border-t border-black/10 flex-shrink-0"> {/* Bordure comme l'admin sidebar */}
                <NavItem icon={User} label="Mon Profil" isActive={activePage === 'profile'} onClick={() => setActivePage('profile')} />
                <NavItem icon={LogOut} label="Déconnexion" isActive={false} onClick={onLogout} />

                {/* Ajout des icônes utilitaires du bas comme l'admin sidebar */}
                <div className="flex items-center justify-around mt-2">
                    <button className="p-2 rounded-md text-slate-500 hover:bg-blue-500/10 hover:text-blue-700 transition-colors">
                        <MessageSquare size={20} />
                    </button>
                    <button className="p-2 rounded-md text-slate-500 hover:bg-blue-500/10 hover:text-blue-700 transition-colors">
                        <HelpCircle size={20} />
                    </button>
                    <button className="p-2 rounded-md text-slate-500 hover:bg-blue-500/10 hover:text-blue-700 transition-colors">
                        <Phone size={20} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default SidebarChefEquipe;