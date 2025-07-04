// src/components/chefEquipe/InterfaceChefEquipe.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';

// --- Services ---
import equipeService from '../../services/equipeService';
import ticketService from '../../services/ticketService';
import moduleService from '../../services/moduleService';
import userService from '../../services/userService';
import commentService from '../../services/commentService'; // Ajouté
import documentService from '../../services/documentService'; // Ajouté

// --- Composants de l'interface ---
import SidebarChefEquipe from './SidebarChefEquipe';
import NavbarChefEquipe from './NavbarChefEquipe';
import TableauDeBordChef from './TableauDeBordChef';
import ProfilChefEquipe from './ProfilChefEquipe';
import MesEquipesChefPage from './MesEquipesChefPage';
import TicketsATraiterChefPage from './TicketsATraiterChefPage';
import SuiviAffectationsChefPage from './SuiviAffectationsChefPage';
import TicketsRefuse from './TicketsRefuse';

const InterfaceChefEquipe = ({ user, onLogout: appLogoutHandler }) => {
  // --- États locaux pour la gestion de l'UI ---
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });
  
  const queryClient = useQueryClient();

  // --- Gestion de l'UI (Sidebar, Thème) ---
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true); // Toujours ouverte sur grand écran
      } else {
        setIsSidebarOpen(false); // Fermée par défaut sur petit écran
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Appel initial pour définir l'état
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const toggleTheme = () => {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      document.documentElement.classList.toggle('dark', newTheme);
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
  
  useEffect(() => {
      document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // --- Récupération des données avec React Query ---
  const { data: currentUserState, isLoading: isUserLoading } = useQuery(
    ['currentUserProfile', user?.login],
    () => userService.getUserByLogin(user.login),
    { enabled: !!user?.login, staleTime: 1000 * 60 * 5 }
  );

  const { data, isLoading: isDataLoading, refetch: refetchAllData } = useQuery(
    ['chefDashboardData', currentUserState?.id],
    async () => {
      if (!currentUserState?.id) return { allEquipes: [], allTickets: [], allModules: [] };
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
    const idsEquipes = new Set(equipesDuChefConnecte.map(e => e.id));
    return (allModules || []).filter(m => m.equipe && idsEquipes.has(m.equipe.id)).map(m => m.id);
  }, [equipesDuChefConnecte, allModules]);

  const ticketsVisiblesPourChef = useMemo(() => (allTickets || []).filter(t => t.idModule && idsModulesGeresParLeChef.includes(t.idModule.id)), [allTickets, idsModulesGeresParLeChef]);
  const ticketsPourChefATraiter = useMemo(() => ticketsVisiblesPourChef.filter(t => t.statue === 'En_attente'), [ticketsVisiblesPourChef]);
  const ticketsAssignesParChefPourSuivi = useMemo(() => ticketsVisiblesPourChef.filter(t => t.idUtilisateur && t.idUtilisateur !== 0), [ticketsVisiblesPourChef]);
  const ticketsRefuseParChefPourSuivi = useMemo(() => ticketsVisiblesPourChef.filter(t => t.statue === "Refuse"), [ticketsVisiblesPourChef]);

  // --- Fonctions de gestion des actions ---
  const showTemporaryMessage = (type, text) => {
    // Ici, vous pouvez intégrer une librairie comme react-toastify
    console.log(`Notification (${type}): ${text}`);
  };

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

  const handleAssignerTicketAEmploye = (ticketId, employe) => handleTicketAction(() => ticketService.updateTicket(ticketId, { idUtilisateur: employe.id, statue: 'En_cours' }), `Ticket assigné à ${employe.prenom}.`, "Erreur d'assignation");
  const handleReassignTicket = (ticketId, newUser) => handleTicketAction(() => ticketService.updateTicket(ticketId, { idUtilisateur: newUser ? newUser.id : 0, statue: newUser ? 'En_cours' : 'En_attente' }), newUser ? `Ticket réassigné.` : 'Affectation retirée.', 'Erreur de réassignation');
  const handleRefuserTicketParChef = (ticketId, motif) => handleTicketAction(() => ticketService.updateTicket(ticketId, { statue: 'Refuse', description: motif }), `Ticket refusé.`, 'Erreur lors du refus');

  // --- NOUVELLES FONCTIONS POUR COMMENTAIRES ET FICHIERS ---
  const handleAddComment = (commentData) => handleTicketAction(() => commentService.addComment(commentData), 'Commentaire ajouté.', 'Erreur d\'ajout du commentaire');
  const handleDeleteComment = (commentId) => window.confirm('Voulez-vous vraiment supprimer ce commentaire ?') && handleTicketAction(() => commentService.deleteComment(commentId), 'Commentaire supprimé.', 'Erreur de suppression du commentaire');
  const handleUploadFile = (file, ticketId) => handleTicketAction(() => documentService.uploadDocument(file, ticketId), 'Fichier ajouté avec succès.', 'Erreur lors de l\'envoi du fichier');
  const handleDeleteFile = (documentId) => window.confirm('Voulez-vous vraiment supprimer ce fichier ?') && handleTicketAction(() => documentService.deleteDocument(documentId), 'Fichier supprimé.', 'Erreur de suppression du fichier');
  const handleDownloadFile = async (documentId, fileName) => {
    try {
      await documentService.downloadDocument(documentId, fileName);
    } catch (error) {
      showTemporaryMessage('error', 'Erreur lors du téléchargement du fichier.');
    }
  };

  // --- Routage interne pour afficher la page active ---
  const renderActivePage = () => {
    if (isUserLoading || isDataLoading) {
      return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Chargement des données...</div>;
    }
    if (!currentUserState) {
        return <div className="p-8 text-center text-red-500">Erreur critique : le profil utilisateur est introuvable.</div>
    }

    const commonTicketHandlers = {
        currentUser: currentUserState,
        onAddComment: handleAddComment,
        onDeleteComment: handleDeleteComment,
        onUploadFile: handleUploadFile,
        onDeleteFile: handleDeleteFile,
        onDownloadFile: handleDownloadFile,
    };

    switch (activePage) {
      case 'dashboard': return <TableauDeBordChef user={currentUserState} tickets={ticketsVisiblesPourChef} equipes={equipesDuChefConnecte} />;
      case 'profile': return <ProfilChefEquipe currentUser={currentUserState} refetchData={refetchDataAndProfile} showTemporaryMessage={showTemporaryMessage} />;
      case 'teams': return <MesEquipesChefPage equipesChef={equipesDuChefConnecte} refetchData={refetchAllData} />;
      case 'tickets-to-do': return <TicketsATraiterChefPage ticketsNonAssignes={ticketsPourChefATraiter} equipesDuChef={equipesDuChefConnecte} onAssignerTicketAEmploye={handleAssignerTicketAEmploye} onRefuserTicketParChef={handleRefuserTicketParChef} {...commonTicketHandlers} />;
      case 'tickets-follow-up': return <SuiviAffectationsChefPage ticketsAssignesParChef={ticketsAssignesParChefPourSuivi} onReassignTicket={handleReassignTicket} tousLesMembresDesEquipes={tousLesMembresDesEquipes} {...commonTicketHandlers} />;
      case 'tickets-refused': return <TicketsRefuse ticketRefuse={ticketsRefuseParChefPourSuivi} {...commonTicketHandlers} />;
      default: return <TableauDeBordChef user={currentUserState} tickets={ticketsVisiblesPourChef} equipes={equipesDuChefConnecte} />;
    }
  };

  return (
    <div className={`bg-slate-100 dark:bg-slate-950 min-h-screen font-sans`}>
        {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black/50 z-40 lg:hidden"></div>}
        <SidebarChefEquipe activePage={activePage} setActivePage={setActivePage} isSidebarOpen={isSidebarOpen} onLogout={appLogoutHandler} />
        <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-64">
            <NavbarChefEquipe user={currentUserState} onLogout={appLogoutHandler} toggleSidebar={toggleSidebar} toggleTheme={toggleTheme} isDarkMode={isDarkMode} setActivePage={setActivePage} />
            <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{renderActivePage()}</main>
        </div>
    </div>
  );
};

export default InterfaceChefEquipe;