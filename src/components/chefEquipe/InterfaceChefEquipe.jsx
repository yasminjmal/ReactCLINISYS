// src/components/chefEquipe/InterfaceChefEquipe.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- Import Services ---
import equipeService from '../../services/equipeService';
import ticketService from '../../services/ticketService';
import moduleService from '../../services/moduleService';

// Importer les composants de layout spécifiques au Chef d'Équipe
import NavbarChefEquipe from './NavbarChefEquipe';
import SidebarChefEquipe from './SidebarChefEquipe';

// Importer les pages spécifiques au Chef d'Équipe
import MesEquipesChefPage from './MesEquipesChefPage';
import TicketsATraiterChefPage from './TicketsATraiterChefPage'; 
import SuiviAffectationsChefPage from './SuiviAffectationsChefPage';
import ConsultProfilPage from '../admin/profil/ConsultProfilPage'; 
import userService from '../../services/userService';

import { Menu as MenuIconLucide, XCircle as XCircleLucide } from 'lucide-react'; 

const InterfaceChefEquipe = ({ user, onLogout: appLogoutHandler }) => {
  const [activePage, setActivePage] = useState('home_chef'); 
  const [isDarkMode, setIsDarkMode] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('theme') === 'dark' : false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  
  // --- STATE FOR REAL DATA ---
  const [allEquipes, setAllEquipes] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentUserState, setCurrentUserState] = useState(null);
  useEffect(() => {
  const fetchUser = async () => {
    const data = await userService.getUserByLogin(user.login);
    setCurrentUserState(data);
  };
  fetchUser();
}, [user.login]);
  const [pageMessage, setPageMessage] = useState(null); 

  // --- DATA FETCHING ---
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [equipesRes, ticketsRes, modulesRes] = await Promise.all([
            equipeService.getMyEquipes(user.id),
            ticketService.getTickets,
            moduleService.getAllModules()
        ]);
        setAllEquipes(equipesRes.data || []);
        setAllTickets(ticketsRes || []);
        setAllModules(modulesRes.data || []);
    } catch (error) {
        console.error("Erreur de chargement des données pour le chef d'équipe:", error);
        showTemporaryMessage('error', 'Impossible de charger les données.');
    } finally {
        setIsLoading(false);
    }
  }, []);
  console.log(allTickets)

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => { 
    if (typeof window !== 'undefined') { 
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } 
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => { 
    const newMode = !prev; 
    if (typeof window !== 'undefined') localStorage.setItem('theme', newMode ? 'dark' : 'light'); 
    return newMode; 
  });

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  
  const showTemporaryMessage = (type, text, nextPage) => {
    setPageMessage({ type, text });
    if(nextPage && nextPage !== activePage) setActivePage(nextPage);
    const messageTimer = setTimeout(() => {
        setPageMessage(null);
    }, 5000); 
    return () => { clearTimeout(messageTimer); };
  };
  
  const handleNavigateToUserProfileChef = () => setActivePage('consulter_profil_chef');
  const handleNavigateToHomeChef = () => setActivePage('home_chef');

  const handleUpdateChefProfile = (updatedUserData) => {
    setCurrentUserState(prev => ({...prev, ...updatedUserData}));
    showTemporaryMessage('success', 'Profil modifié avec succès.', 'consulter_profil_chef');
  };
  
  const handleActualLogout = () => {
    if (appLogoutHandler) {
      appLogoutHandler(); 
    }
  };

  const equipesDuChefConnecte = useMemo(() => {
    if (!currentUserState || !Array.isArray(allEquipes)) return [];
    return allEquipes.filter(eq => eq.chefEquipe?.id === currentUserState.id);
  }, [currentUserState, allEquipes]);

  const modulesGeresParLeChef = useMemo(() => {
      if (equipesDuChefConnecte.length === 0 || !Array.isArray(allModules)) return [];
      const idsEquipesDuChef = equipesDuChefConnecte.map(e => e.id);
      return allModules.filter(module => module.equipe && idsEquipesDuChef.includes(module.equipe.id));
  }, [equipesDuChefConnecte, allModules]);

  const ticketsPourChefATraiter = useMemo(() => {
    if (modulesGeresParLeChef.length === 0 || !Array.isArray(allTickets)) return [];
    const idsModulesGeres = modulesGeresParLeChef.map(m => m.id);
    return allTickets.filter(ticket => 
      ticket.statue === 'ACCEPTE' && 
      ticket.idModule && 
      idsModulesGeres.includes(ticket.idModule.id) &&
      !ticket.idUtilisateur 
    );
  }, [modulesGeresParLeChef, allTickets]);

  const ticketsAssignesParChefPourSuivi = useMemo(() => {
    if (equipesDuChefConnecte.length === 0 || !Array.isArray(allTickets)) return [];
    const idsMembresDesEquipesDuChef = equipesDuChefConnecte.flatMap(eq => eq.utilisateurs?.map(u => u.id) || []);
    
    return allTickets.filter(ticket => 
        ticket.idUtilisateur && 
        idsMembresDesEquipesDuChef.includes(ticket.idUtilisateur.id) &&
        ['EN_COURS', 'RESOLU', 'FERME'].includes(ticket.statue)
    );
  }, [equipesDuChefConnecte, allTickets]);

  const handleAssignerTicketAEmploye = async (ticketId, employe) => {
    const ticket = allTickets.find(t => t.id === ticketId);
    if (!ticket) {
        showTemporaryMessage('error', 'Ticket non trouvé.');
        return;
    }
    const payload = {
        ...ticket, // Garder les autres champs
        idUtilisateur: employe.id,
        statue: 'EN_COURS',
        // Le DTO backend ne requiert probablement pas l'objet complet `idUtilisateur`
        // mais juste l'ID. Assurez-vous que le payload correspond à ce que le backend attend.
        // Par ex. si le backend attend des IDs:
        // idClient: ticket.idClient.id,
        // idModule: ticket.idModule.id,
    };
    try {
        await ticketService.updateTicket(ticketId, payload);
        showTemporaryMessage('success', `Ticket assigné à ${employe.prenom} ${employe.nom}.`);
        fetchAllData(); // Re-fetch all data to update the UI
    } catch (error) {
        showTemporaryMessage('error', "Erreur lors de l'assignation du ticket.");
    }
  };

  const handleRefuserTicketParChef = async (ticketId, motif) => {
    const ticket = allTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const payload = {
        ...ticket,
        statue: 'REFUSE',
        // Ajoutez un champ pour le motif si votre DTO le supporte
    };
    try {
        await ticketService.updateTicket(ticketId, payload);
        showTemporaryMessage('info', `Ticket #${ticket.ref} refusé.`);
        fetchAllData();
    } catch(error) {
        showTemporaryMessage('error', 'Erreur lors du refus du ticket.');
    }
  };
  
  const handleNavigateToTicketDetailsChef = (ticketId) => {
    // Implement navigation to a detailed ticket view if needed
    console.log("Navigation to details of ticket:", ticketId);
  };

  const renderActivePageChef = () => {
    if (isLoading) {
        return <div className="p-6 text-center text-slate-500">Chargement...</div>;
    }
    switch (activePage) {
      case 'home_chef': 
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              Tableau de Bord Chef d'Équipe
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Bienvenue, {currentUserState?.prenom || currentUserState?.nom_utilisateur || "Chef d'équipe"} !
            </p>
          </div>
        );
      case 'mes_equipes_chef': 
        return <MesEquipesChefPage chefId={currentUserState?.id} equipesChef={equipesDuChefConnecte} />;
      
      case 'tickets_a_traiter_chef':
        return (
            <TicketsATraiterChefPage 
                ticketsNonAssignes={ticketsPourChefATraiter}
                equipesDuChef={equipesDuChefConnecte} 
                onAssignerTicketAEmploye={handleAssignerTicketAEmploye}
                onRefuserTicketParChef={handleRefuserTicketParChef}
            />
        );

      case 'suivi_affectations_chef':
        return (
            <SuiviAffectationsChefPage 
                ticketsAssignesParChef={ticketsAssignesParChefPourSuivi} 
                onNavigateToTicketDetails={handleNavigateToTicketDetailsChef} 
            />
        );
      
      case 'consulter_profil_chef':
        return currentUserState ? 
            <ConsultProfilPage 
                user={currentUserState} 
                onUpdateProfile={handleUpdateChefProfile} 
                onNavigateHome={handleNavigateToHomeChef}
            /> 
            : <div className="p-6 text-center">Utilisateur Chef non trouvé.</div>;
      
      default: 
        return <div className="p-6 text-xl font-bold">Page "{activePage}" non trouvée.</div>;
    }
  };

  if (!currentUserState) { 
    return (
      <div className="flex items-center justify-center h-screen text-xl text-red-600 dark:text-red-400">
        Erreur: Utilisateur Chef d'Équipe non identifié.
        {localStorage.clear()}
      </div>
    ); 
    
  }

  return (
    <div className={`flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <SidebarChefEquipe 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <button 
          onClick={toggleSidebar} 
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-md shadow text-slate-600 dark:text-slate-300" 
          aria-label="Ouvrir le menu"
        >
          <MenuIconLucide size={24} />
        </button>
        <NavbarChefEquipe 
          user={currentUserState} 
          onLogout={handleActualLogout} 
          toggleTheme={toggleTheme} 
          isDarkMode={isDarkMode}
          onNavigateToUserProfile={handleNavigateToUserProfileChef}
        />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto pt-16 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : ''}`}>
          {pageMessage && pageMessage.text && (
            <div className={`fixed top-20 right-6 p-4 rounded-md shadow-lg z-[100] flex items-center space-x-3 animate-slide-in-right ...`}>
                <span className="font-medium flex-grow">{pageMessage.text}</span>
                <button onClick={() => setPageMessage(null)} className="ml-auto p-1 hover:bg-black/10 rounded-full"> <XCircleLucide size={18}/> </button>
            </div>
          )}
          {renderActivePageChef()}
        </main>
      </div>
    </div>
  );
};

export default InterfaceChefEquipe;