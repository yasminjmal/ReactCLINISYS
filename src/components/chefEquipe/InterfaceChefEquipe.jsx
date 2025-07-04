// src/components/chefEquipe/InterfaceChefEquipe.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';

// --- Services ---
import equipeService from '../../services/equipeService';
import ticketService from '../../services/ticketService';
import moduleService from '../../services/moduleService';
import userService from '../../services/userService';
import utilisateurService from '../../services/utilisateurService';

// --- Composants ---
import SidebarChefEquipe from './SidebarChefEquipe';
import TableauDeBordChef from './TableauDeBordChef';
import ProfilChefEquipe from './ProfilChefEquipe';
import MesEquipesChefPage from './MesEquipesChefPage';
import TicketsATraiterChefPage from './TicketsATraiterChefPage';
import SuiviAffectationsChefPage from './SuiviAffectationsChefPage';
import TicketsRefuse from './TicketsRefuse';

const InterfaceChefEquipe = ({ user, onLogout: appLogoutHandler }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const queryClient = useQueryClient();

  const { data: currentUserState, isLoading: isUserLoading } = useQuery(
    ['currentUserProfile', user?.login],
    () => userService.getUserByLogin(user.login),
    { enabled: !!user?.login }
  );

  const { data, isLoading: isDataLoading } = useQuery(
    ['chefDashboardData', currentUserState?.id],
    async () => {
      const [equipesRes, ticketsRes, modulesRes, allUsersRes] = await Promise.all([
        equipeService.getMyEquipes(currentUserState.id),
        ticketService.getTickets(),
        moduleService.getAllModules(),
        utilisateurService.getAllUtilisateurs() // Ajouté pour MesEquipes
      ]);
      return {
        allEquipes: equipesRes.data || [],
        allTickets: Array.isArray(ticketsRes.data) ? ticketsRes.data : [],
        allModules: modulesRes.data || [],
        allUsers: allUsersRes.data || [] // Ajouté pour MesEquipes
      };
    },
    { enabled: !!currentUserState?.id }
  );

  const { allEquipes = [], allTickets = [], allModules = [], allUsers = [] } = data || {};
  
  const refetchData = useCallback(() => {
    queryClient.invalidateQueries(['chefDashboardData', currentUserState?.id]);
  }, [queryClient, currentUserState]);

  const refetchDataAndProfile = useCallback(() => {
    queryClient.invalidateQueries(['chefDashboardData', currentUserState?.id]);
    queryClient.invalidateQueries(['currentUserProfile', user?.login]);
  }, [queryClient, currentUserState, user]);

  const showTemporaryMessage = (type, text) => {
    console.log(`Message: [${type}] ${text}`);
    // Implémentez votre système de notification (ex: react-toastify)
  };

  // --- Dérivation des données (logique inchangée) ---
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
    if (!equipesDuChefConnecte || !Array.isArray(allModules)) return [];
    const idsEquipesDuChef = equipesDuChefConnecte.map(e => e.id);
    return allModules
      .filter(module => module.equipe && idsEquipesDuChef.includes(module.equipe.id))
      .map(module => module.id);
  }, [equipesDuChefConnecte, allModules]);

  const ticketsVisiblesPourChef = useMemo(() => {
    if (idsModulesGeresParLeChef.length === 0 || !Array.isArray(allTickets)) return [];
    return allTickets.filter(ticket => ticket.idModule && idsModulesGeresParLeChef.includes(ticket.idModule.id));
  }, [allTickets, idsModulesGeresParLeChef]);

  const ticketsPourChefATraiter = useMemo(() => {
    return ticketsVisiblesPourChef.filter(ticket => !ticket.idUtilisateur && ticket.statue !== 'Refuse');
  }, [ticketsVisiblesPourChef]);

  const ticketsAssignesParChefPourSuivi = useMemo(() => {
    return ticketsVisiblesPourChef.filter(ticket => !!ticket.idUtilisateur && ticket.statue !== 'Refuse');
  }, [ticketsVisiblesPourChef]);

  const ticketsRefuseParChefPourSuivi = useMemo(() => {
    return ticketsVisiblesPourChef.filter(ticket => ticket.statue === "Refuse");
  }, [ticketsVisiblesPourChef]);

  // --- Gestionnaires d'événements (logique inchangée) ---
  const handleAssignerTicketAEmploye = async (ticketId, employe) => {
    try {
      await ticketService.updateTicket(ticketId, { idUtilisateur: employe.id, statue: 'En_cours' });
      showTemporaryMessage('success', `Ticket assigné à ${employe.prenom}.`);
      refetchData();
    } catch (error) { showTemporaryMessage('error', "Erreur lors de l'assignation."); }
  };

  const handleReassignTicket = async (ticketId, newUser) => {
    try {
      await ticketService.updateTicket(ticketId, { idUtilisateur: newUser ? newUser.id : null, statue: newUser ? 'En_cours' : 'Nouveau' });
      showTemporaryMessage('success', newUser ? `Ticket réassigné à ${newUser.prenom}.` : 'Affectation retirée.');
      refetchData();
    } catch (error) { showTemporaryMessage('error', 'Erreur lors de la réassignation.'); }
  };

  const handleRefuserTicketParChef = async (ticketId, motif) => {
    try {
      await ticketService.updateTicket(ticketId, { statue: 'Refuse', description: motif, priorite: 'Basse' });
      showTemporaryMessage('info', `Ticket refusé.`);
      refetchData();
    } catch (error) { showTemporaryMessage('error', 'Erreur lors du refus.'); }
  };

  const renderActivePage = () => {
    if (isUserLoading || isDataLoading) {
      return <div className="p-8 text-center text-slate-500">Chargement des données...</div>;
    }

    switch (activePage) {
      case 'dashboard':
        return <TableauDeBordChef user={currentUserState} tickets={ticketsVisiblesPourChef} equipes={equipesDuChefConnecte} />;
      case 'teams':
        return <MesEquipesChefPage equipesChef={equipesDuChefConnecte} allModules={allModules} allUsers={allUsers} refetchData={refetchData} />;
      case 'tickets-to-do':
        return <TicketsATraiterChefPage ticketsNonAssignes={ticketsPourChefATraiter} equipesDuChef={equipesDuChefConnecte} onAssignerTicketAEmploye={handleAssignerTicketAEmploye} onRefuserTicketParChef={handleRefuserTicketParChef} />;
      case 'tickets-follow-up':
        return <SuiviAffectationsChefPage ticketsAssignesParChef={ticketsAssignesParChefPourSuivi} onReassignTicket={handleReassignTicket} tousLesMembresDesEquipes={tousLesMembresDesEquipes} />;
      case 'tickets-refused':
        return <TicketsRefuse ticketRefuse={ticketsRefuseParChefPourSuivi} />;
      case 'profile':
        return <ProfilChefEquipe currentUser={currentUserState} refetchData={refetchDataAndProfile} showTemporaryMessage={showTemporaryMessage} />;
      default:
        return <TableauDeBordChef user={currentUserState} tickets={ticketsVisiblesPourChef} equipes={equipesDuChefConnecte} />;
    }
  };

  return (
    <div className="bg-[#F4F7FE] min-h-screen font-sans flex text-slate-800">
      <SidebarChefEquipe activePage={activePage} setActivePage={setActivePage} onLogout={appLogoutHandler} />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {renderActivePage()}
      </main>
    </div>
  );
};

export default InterfaceChefEquipe;
