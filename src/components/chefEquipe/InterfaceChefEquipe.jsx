import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- Services ---
import equipeService from '../../services/equipeService';
import ticketService from '../../services/ticketService';
import moduleService from '../../services/moduleService';
import utilisateurService from '../../services/utilisateurService'; // Utiliser le service consolidé

// --- Composants ---
import NavbarChefEquipe from './NavbarChefEquipe';
import SidebarChefEquipe from './SidebarChefEquipe';
import MesEquipesChefPage from './MesEquipesChefPage';
import TicketsATraiterChefPage from './TicketsATraiterChefPage';
import SuiviAffectationsChefPage from './SuiviAffectationsChefPage';
import TicketsRefuse from './TicketsRefuse';
import TableauDeBordChef from './TableauDeBordChef';
import ProfilChefEquipe from './ProfilChefEquipe'; // Importer le nouveau composant
import userService from '../../services/userService';


const InterfaceChefEquipe = ({ user, onLogout: appLogoutHandler }) => {
  const [activePage, setActivePage] = useState('home_chef');
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

  const equipesDuChefConnecte = useMemo(() => allEquipes, [allEquipes]);
  
  const tousLesMembresDesEquipes = useMemo(() => {
    const membresMap = new Map();
    (equipesDuChefConnecte || []).forEach(equipe => {
        (equipe.utilisateurs || []).forEach(membre => {
            if (membre.actif === true) {
                membresMap.set(membre.id, membre);
            }
        });
    });
    return Array.from(membresMap.values());
  }, [equipesDuChefConnecte]);

  const idsModulesGeresParLeChef = useMemo(() => {
    if (equipesDuChefConnecte.length === 0 || !Array.isArray(allModules)) return [];
    const idsEquipesDuChef = equipesDuChefConnecte.map(e => e.id);
    return allModules
      .filter(module => module.equipe && idsEquipesDuChef.includes(module.equipe.id))
      .map(module => module.id);
  }, [equipesDuChefConnecte, allModules]);

  const ticketsVisiblesPourChef = useMemo(() => {
    if (idsModulesGeresParLeChef.length === 0 || !Array.isArray(allTickets)) return [];
    return allTickets.filter(ticket =>
      ticket.idModule &&
      idsModulesGeresParLeChef.includes(ticket.idModule.id)
    );
  }, [allTickets, idsModulesGeresParLeChef]);

  const ticketsPourChefATraiter = useMemo(() => {
    return ticketsVisiblesPourChef.filter(ticket => !ticket.idUtilisateur && ticket.statue !== 'Refuse');
  }, [ticketsVisiblesPourChef]);

  const ticketsAssignesParChefPourSuivi = useMemo(() => {
    return ticketsVisiblesPourChef.filter(ticket => !!ticket.idUtilisateur);
  }, [ticketsVisiblesPourChef]);

  const ticketsRefuseParChefPourSuivi = useMemo(() => {
    return ticketsVisiblesPourChef.filter(ticket => ticket.statue === "Refuse");
  }, [ticketsVisiblesPourChef]);
  
  const handleAssignerTicketAEmploye = async (ticketId, employe) => {
    try {
      await ticketService.updateTicket(ticketId, {
        idUtilisateur: employe.id,
        statue: 'En_cours'
      });
      showTemporaryMessage('success', `Ticket assigné à ${employe.prenom}.`);
      fetchAllData(currentUserState.id);
    } catch (error) {
      showTemporaryMessage('error', "Erreur lors de l'assignation.");
    }
  };

  const handleReassignTicket = async (ticketId, newUser) => {
    try {
      await ticketService.updateTicket(ticketId, {
        idUtilisateur: newUser ? newUser.id : null
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
        statue: 'Refuse',
        description: motif,
        priorite: 'Basse'
      });
      showTemporaryMessage('info', `Ticket refusé.`);
      fetchAllData(currentUserState.id);
    } catch (error)
      {
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
        return <TableauDeBordChef 
          user={currentUserState}
          equipes={equipesDuChefConnecte}
          tickets={ticketsVisiblesPourChef}
          ticketsATraiter={ticketsPourChefATraiter}
          setActivePage={setActivePage}
        />;
      case 'mes_equipes_chef': 
        return <MesEquipesChefPage 
          equipesChef={equipesDuChefConnecte} 
          allModules={allModules}
          refetchData={() => fetchAllData(currentUserState.id)}
        />;
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
          tousLesMembresDesEquipes={tousLesMembresDesEquipes}
        />;
      case 'ticket_refuse': {
        return <TicketsRefuse ticketRefuse={ticketsRefuseParChefPourSuivi} />;
      }
      case 'consulter_profil_chef':
        return <ProfilChefEquipe
            currentUser={currentUserState}
            equipesDuChef={equipesDuChefConnecte}
            refetchData={() => fetchAllData(currentUserState.id)}
            showTemporaryMessage={showTemporaryMessage}
        />;
      default: 
        return <div className="p-6">Page non trouvée.</div>;
    }
  };

  return (
    <div className={`flex h-screen bg-slate-100 dark:bg-slate-950 ${isDarkMode ? 'dark' : ''}`}>
      <SidebarChefEquipe {...{ activePage, setActivePage, isSidebarOpen, toggleSidebar }} />
      <div className="flex-1 flex flex-col">
        <NavbarChefEquipe {...{ user: currentUserState, onLogout: appLogoutHandler, toggleTheme, isDarkMode, onNavigateToUserProfile: () => setActivePage('consulter_profil_chef') }} />
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