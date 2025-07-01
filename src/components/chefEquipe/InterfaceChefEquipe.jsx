// src/components/chefEquipe/InterfaceChefEquipe.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- Services ---
import equipeService from '../../services/equipeService';
import ticketService from '../../services/ticketService';
import moduleService from '../../services/moduleService';
import userService from '../../services/userService';

// --- Composants ---
import NavbarChefEquipe from './NavbarChefEquipe';
import SidebarChefEquipe from './SidebarChefEquipe';
import MesEquipesChefPage from './MesEquipesChefPage';
import TicketsATraiterChefPage from './TicketsATraiterChefPage';
import SuiviAffectationsChefPage from './SuiviAffectationsChefPage';
import ConsultProfilPage from '../admin/profil/ConsultProfilPage'; 
import { Menu as MenuIconLucide, XCircle as XCircleLucide } from 'lucide-react';
import TicketsRefuse from './TicketsRefuse';

const InterfaceChefEquipe = ({ user, onLogout: appLogoutHandler }) => {
  const [activePage, setActivePage] = useState('tickets_a_traiter_chef');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const [allEquipes, setAllEquipes] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserState, setCurrentUserState] = useState(null);
  const [pageMessage, setPageMessage] = useState(null);

  const showTemporaryMessage = useCallback((type, text) => {
    setPageMessage({ type, text });
    setTimeout(() => setPageMessage(null), 5000);
  }, []);

  const fetchAllData = useCallback(async (userId) => {
    setIsLoading(true);
    try {
      const [equipesRes, ticketsRes, modulesRes] = await Promise.all([
        equipeService.getMyEquipes(userId),
        ticketService.getTickets(),
        moduleService.getAllModules()
      ]);
      setAllEquipes(equipesRes.data || []);
      setAllTickets(Array.isArray(ticketsRes) ? ticketsRes : []);
      setAllModules(modulesRes.data || []);
      
    } catch (error) {
      console.error("Erreur de chargement des données:", error);
      showTemporaryMessage('error', 'Impossible de charger les données.');
    } finally {
      setIsLoading(false);
    }
  }, [showTemporaryMessage]);

  useEffect(() => {
    const fetchUserAndData = async () => {
      if (!user || !user.login) return;
      try {
        const fullUser = await userService.getUserByLogin(user.login);
        setCurrentUserState(fullUser);
        if (fullUser.id) {
          fetchAllData(fullUser.id);
        }
      } catch (error) {
        console.error("Erreur de récupération du profil:", error);
      }
    };
    fetchUserAndData();
  }, [user, fetchAllData]);

  // --- Logique de filtrage (CORRIGÉE) ---
  const equipesDuChefConnecte = useMemo(() => allEquipes, [allEquipes]);

  const idsModulesGeresParLeChef = useMemo(() => {
    if (equipesDuChefConnecte.length === 0 || !Array.isArray(allModules)) return [];
    const idsEquipesDuChef = equipesDuChefConnecte.map(e => e.id);
    return allModules
      .filter(module => module.equipe && idsEquipesDuChef.includes(module.equipe.id))
      .map(module => module.id);
  }, [equipesDuChefConnecte, allModules]);

  // Règle 1: Le chef voit tous les tickets de ses modules, SAUF ceux avec le statut "En_attente"
  const ticketsVisiblesPourChef = useMemo(() => {
    if (idsModulesGeresParLeChef.length === 0 || !Array.isArray(allTickets)) return [];
   
    return allTickets.filter(ticket =>
      ticket.idModule &&
      idsModulesGeresParLeChef.includes(ticket.idModule.id)
    );
  }, [allTickets, idsModulesGeresParLeChef]);


  // Règle 2: Les tickets "À Traiter" sont les tickets visibles qui ne sont pas encore assignés
  const ticketsPourChefATraiter = useMemo(() => {
    return ticketsVisiblesPourChef.filter(ticket => !ticket.idUtilisateur && ticket.statue !== 'Refuse');
  }, [ticketsVisiblesPourChef]);

  // Règle 3: Les tickets "en Suivi" sont les tickets visibles qui sont déjà assignés
  const ticketsAssignesParChefPourSuivi = useMemo(() => {
    return ticketsVisiblesPourChef.filter(ticket => !!ticket.idUtilisateur);
  }, [ticketsVisiblesPourChef]);

  const ticketsRefuseParChefPourSuivi = useMemo(() => {
    return ticketsVisiblesPourChef.filter(ticket => ticket.statue=="Refuse");
  }, [ticketsVisiblesPourChef]);
  // --- Actions ---
  const handleAssignerTicketAEmploye = async (ticketId, employe) => {
    try {
      await ticketService.updateTicket(ticketId, {
        idUtilisateur: employe.id,
        statue: 'En_cours' // Passage au statut "En_cours"
      });
      showTemporaryMessage('success', `Ticket assigné à ${employe.prenom}.`);
      fetchAllData(currentUserState.id); // Recharger les données
    } catch (error) {
      showTemporaryMessage('error', "Erreur lors de l'assignation.");
    }
  };

const handleReassignTicket = async (ticketId, newUser) => {
  try {
    await ticketService.updateTicket(ticketId, {
      idUtilisateur: newUser ? newUser.id : 0 // ✅ null, not 0
    });
    showTemporaryMessage('success', newUser ? `Ticket réassigné à ${newUser.prenom}.` : 'Affectation retirée.');
    fetchAllData(currentUserState.id);
  } catch (error) {
    showTemporaryMessage('error', 'Erreur lors de la réassignation.');
  }
};


  const handleRefuserTicketParChef = async (ticketId, motif) => {
    try {
      await ticketService.updateTicket(ticketId, {
        statue: 'Refuse', // Passage au statut "Refuse"
        description: motif ,// Assurez-vous que votre backend gère ce champ
        priorite: 'Basse'
      });
      showTemporaryMessage('info', `Ticket refusé.`);
      fetchAllData(currentUserState.id);
    } catch (error) {
      showTemporaryMessage('error', 'Erreur lors du refus.');
    }
  };
    
  const toggleTheme = () => { /* ... */ };
  const toggleSidebar = () => setIsSidebarOpen(p => !p);

  const renderActivePageChef = () => {
  if (isLoading) {
    return <div className="p-6 text-center text-slate-500">Chargement...</div>;
  }
  switch (activePage) {
    case 'home_chef': 
      return <div className="p-6"><h1 className="text-2xl">Tableau de Bord</h1></div>;
    case 'mes_equipes_chef': 
      return <MesEquipesChefPage equipesChef={equipesDuChefConnecte} allModules={allModules} />;
    case 'tickets_a_traiter_chef':
      return <TicketsATraiterChefPage 
              ticketsNonAssignes={ticketsPourChefATraiter}
              equipesDuChef={equipesDuChefConnecte} 
              onAssignerTicketAEmploye={handleAssignerTicketAEmploye}
              onRefuserTicketParChef={handleRefuserTicketParChef}
          />;
    case 'suivi_affectations_chef':
      return <SuiviAffectationsChefPage
  ticketsAssignesParChef={ticketsAssignesParChefPourSuivi}
  onReassignTicket={handleReassignTicket}
/>;
    case 'ticket_refuse': {
      return <TicketsRefuse ticketRefuse={ticketsRefuseParChefPourSuivi} />;
    }
    default: 
      return <div className="p-6">Page non trouvée.</div>;
  }
};


  return (
    <div className={`flex h-screen bg-slate-100 dark:bg-slate-950 ${isDarkMode ? 'dark' : ''}`}>
        <SidebarChefEquipe {...{ activePage, setActivePage, isSidebarOpen, toggleSidebar }} />
        <div className="flex-1 flex flex-col">
            <NavbarChefEquipe {...{ user: currentUserState, onLogout: appLogoutHandler, toggleTheme, isDarkMode }} />
            <main className={`flex-1 overflow-y-auto pt-16 transition-all ${isSidebarOpen ? 'md:ml-64' : ''}`}>
                {pageMessage && (
                    <div className={`fixed top-20 right-6 p-4 rounded-md shadow-lg z-50 text-white ${pageMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {pageMessage.text} <button onClick={() => setPageMessage(null)} className="ml-4 font-bold">X</button>
                    </div>
                )}
                {renderActivePageChef()}
            </main>
        </div>
    </div>
  );
};

export default InterfaceChefEquipe;