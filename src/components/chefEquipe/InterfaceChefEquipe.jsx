// src/components/chefEquipe/InterfaceChefEquipe.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query'; // --- IMPORTATION NÉCESSAIRE ---

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
import TicketsRefuse from './TicketsRefuse';
import TableauDeBordChef from './TableauDeBordChef';
import ProfilChefEquipe from './ProfilChefEquipe';

const InterfaceChefEquipe = ({ user, onLogout: appLogoutHandler }) => {
  const [activePage, setActivePage] = useState('home_chef');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [pageMessage, setPageMessage] = useState(null);
  
  const queryClient = useQueryClient(); // Pour l'invalidation de cache

  const showTemporaryMessage = useCallback((type, text) => {
    setPageMessage({ type, text });
    setTimeout(() => setPageMessage(null), 5000);
  }, []);

  // --- REFACTORISATION AVEC REACT-QUERY ---

  // 1. Requête pour obtenir le profil complet de l'utilisateur
  const { data: currentUserState, isLoading: isUserLoading, error: userError } = useQuery(
    ['currentUserProfile', user?.login],
    () => userService.getUserByLogin(user.login),
    {
      enabled: !!user?.login, // La requête ne s'exécute que si `user.login` existe
      staleTime: Infinity, // Le profil de l'utilisateur ne change pas souvent
    }
  );

  // 2. Requête pour obtenir toutes les données dépendantes de l'ID utilisateur
  const { data, isLoading: isDataLoading, error: dataError } = useQuery(
    ['chefDashboardData', currentUserState?.id],
    async () => {
      const [equipesRes, ticketsRes, modulesRes] = await Promise.all([
        equipeService.getMyEquipes(currentUserState.id),
        ticketService.getTickets(),
        moduleService.getAllModules(),
      ]);
      return {
        allEquipes: equipesRes.data || [],
        allTickets: Array.isArray(ticketsRes) ? ticketsRes : [],
        allModules: modulesRes.data || [],
      };
    },
    {
      enabled: !!currentUserState?.id, // Ne s'exécute que si l'ID de l'utilisateur est disponible
    }
  );

  // Utilisation des données avec des valeurs par défaut
  const { allEquipes = [], allTickets = [], allModules = [] } = data || {};
  
  const refetchAllData = useCallback(() => {
    // Invalide la requête pour forcer un re-fetch
    queryClient.invalidateQueries(['chefDashboardData', currentUserState?.id]);
  }, [queryClient, currentUserState]);


  // --- TOUS LES `useMemo` RESTENT IDENTIQUES ---
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
    if (!equipesDuChefConnecte || equipesDuChefConnecte.length === 0 || !Array.isArray(allModules)) return [];
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
  

  // --- LES GESTIONNAIRES D'ÉVÉNEMENTS RESTENT IDENTIQUES ---
  const handleAssignerTicketAEmploye = async (ticketId, employe) => {
    try {
      await ticketService.updateTicket(ticketId, {
        idUtilisateur: employe.id,
        statue: 'En_cours'
      });
      showTemporaryMessage('success', `Ticket assigné à ${employe.prenom}.`);
      refetchAllData();
    } catch (error) {
      showTemporaryMessage('error', "Erreur lors de l'assignation.");
    }
  };

  const handleReassignTicket = async (ticketId, newUser) => {
    try {
      await ticketService.updateTicket(ticketId, {
        idUtilisateur: newUser ? newUser.id : null,
        statue: newUser ? 'En_cours' : 'Nouveau'
      });
      showTemporaryMessage('success', newUser ? `Ticket réassigné à ${newUser.prenom}.` : 'Affectation retirée.');
      refetchAllData();
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
      refetchAllData();
    } catch (error) {
      showTemporaryMessage('error', 'Erreur lors du refus.');
    }
  };
    
  const toggleTheme = () => {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
  
  const toggleSidebar = () => setIsSidebarOpen(p => !p);

  // --- RENDER LOGIC ---
  const renderActivePageChef = () => {
    // Gère les états de chargement et d'erreur de react-query
    if (isUserLoading || isDataLoading) {
      return <div className="p-6 text-center text-slate-500 dark:text-slate-400">Chargement...</div>;
    }
    
    if (userError || dataError) {
        return <div className="p-6 text-center text-red-500">Erreur: Impossible d'afficher l'interface. {userError?.message || dataError?.message}</div>;
    }
    
    if (!currentUserState) {
        return <div className="p-6 text-center text-red-500">Erreur: Les données de l'utilisateur n'ont pas pu être chargées.</div>;
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
          refetchData={refetchAllData}
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
            refetchData={() => {
              queryClient.invalidateQueries(['currentUserProfile', user?.login]);
              refetchAllData();
            }}
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
        <NavbarChefEquipe {...{ user: currentUserState, onLogout: appLogoutHandler, toggleTheme, isDarkMode, onNavigate: setActivePage }} />
        <main className={`flex-1 overflow-y-auto pt-16 transition-all ${isSidebarOpen ? 'md:ml-64' : ''}`}>
          {pageMessage && (
            <div className={`fixed top-20 right-6 p-4 rounded-md shadow-lg z-50 text-white ${pageMessage.type === 'success' ? 'bg-green-500' : pageMessage.type === 'info' ? 'bg-blue-500' : 'bg-red-500'}`}>
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