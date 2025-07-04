// src/components/chefEquipe/InterfaceChefEquipe.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';

// --- Services ---
import equipeService from '../../services/equipeService';
import ticketService from '../../services/ticketService';
import moduleService from '../../services/moduleService';
import userService from '../../services/userService';
import utilisateurService from '../../services/utilisateurService';

// --- Composants Redessinés ---
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

  const showTemporaryMessage = (type, text) => {
    // Implémentez votre système de notification (ex: react-toastify)
    console.log(`Notification (${type}): ${text}`);
  };

  // --- Requêtes de données avec react-query ---
  const { data: currentUserState, isLoading: isUserLoading } = useQuery(
    ['currentUserProfile', user?.login],
    () => userService.getUserByLogin(user.login),
    { enabled: !!user?.login, staleTime: 1000 * 60 * 5 } // Cache de 5 minutes
  );

  const { data, isLoading: isDataLoading, refetch: refetchAllData } = useQuery(
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
    { enabled: !!currentUserState?.id }
  );

  const { allEquipes = [], allTickets = [], allModules = [] } = data || {};

  // --- Logique de dérivation des données (useMemo) ---
  const equipesDuChefConnecte = useMemo(() => allEquipes, [allEquipes]);
  
  const tousLesMembresDesEquipes = useMemo(() => {
    const membresMap = new Map();
    (equipesDuChefConnecte || []).forEach(equipe => {
        (equipe.utilisateurs || []).forEach(membre => {
            if (membre.actif) membresMap.set(membre.id, membre);
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

  const ticketsPourChefATraiter = useMemo(() => ticketsVisiblesPourChef.filter(t => !t.idUtilisateur && t.statue !== 'Refuse'), [ticketsVisiblesPourChef]);
  const ticketsAssignesParChefPourSuivi = useMemo(() => ticketsVisiblesPourChef.filter(t => !!t.idUtilisateur), [ticketsVisiblesPourChef]);
  const ticketsRefuseParChefPourSuivi = useMemo(() => ticketsVisiblesPourChef.filter(t => t.statue === "Refuse"), [ticketsVisiblesPourChef]);

  // --- Fonctions de gestion ---
  const refetchDataAndProfile = useCallback(() => {
    queryClient.invalidateQueries(['chefDashboardData', currentUserState?.id]);
    queryClient.invalidateQueries(['currentUserProfile', user?.login]);
  }, [queryClient, currentUserState, user]);

  const handleTicketAction = async (action, successMessage, errorMessage) => {
    try {
      await action();
      showTemporaryMessage('success', successMessage);
      refetchAllData();
    } catch (error) {
      showTemporaryMessage('error', `${errorMessage}: ${error.message}`);
    }
  };

  const handleAssignerTicketAEmploye = (ticketId, employe) => handleTicketAction(() => ticketService.updateTicket(ticketId, { idUtilisateur: employe.id, statue: 'En_cours' }), `Ticket assigné à ${employe.prenom}.`, "Erreur lors de l'assignation");
  const handleReassignTicket = (ticketId, newUser) => handleTicketAction(() => ticketService.updateTicket(ticketId, { idUtilisateur: newUser?.id || null, statue: newUser ? 'En_cours' : 'Nouveau' }), newUser ? `Ticket réassigné à ${newUser.prenom}.` : 'Affectation retirée.', 'Erreur lors de la réassignation');
  const handleRefuserTicketParChef = (ticketId, motif) => handleTicketAction(() => ticketService.updateTicket(ticketId, { statue: 'Refuse', description: motif, priorite: 'Basse' }), `Ticket refusé.`, 'Erreur lors du refus');

  // --- Routage interne ---
  const renderActivePage = () => {
    if (isUserLoading || isDataLoading) {
      return <div className="p-8 text-center text-slate-500">Chargement des données...</div>;
    }
    if (!currentUserState) {
        return <div className="p-8 text-center text-red-500">Erreur critique : impossible de charger le profil utilisateur.</div>
    }

    switch (activePage) {
      case 'dashboard': return <TableauDeBordChef user={currentUserState} tickets={ticketsVisiblesPourChef} equipes={equipesDuChefConnecte} />;
      case 'profile': return <ProfilChefEquipe currentUser={currentUserState} refetchData={refetchDataAndProfile} showTemporaryMessage={showTemporaryMessage} />;
      case 'teams': return <MesEquipesChefPage equipesChef={equipesDuChefConnecte} allModules={allModules} refetchData={refetchAllData} />;
      case 'tickets-to-do': return <TicketsATraiterChefPage ticketsNonAssignes={ticketsPourChefATraiter} equipesDuChef={equipesDuChefConnecte} onAssignerTicketAEmploye={handleAssignerTicketAEmploye} onRefuserTicketParChef={handleRefuserTicketParChef} />;
      case 'tickets-follow-up': return <SuiviAffectationsChefPage ticketsAssignesParChef={ticketsAssignesParChefPourSuivi} onReassignTicket={handleReassignTicket} tousLesMembresDesEquipes={tousLesMembresDesEquipes} />;
      case 'tickets-refused': return <TicketsRefuse ticketRefuse={ticketsRefuseParChefPourSuivi} />;
      default: return <TableauDeBordChef user={currentUserState} tickets={ticketsVisiblesPourChef} equipes={equipesDuChefConnecte} />;
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
