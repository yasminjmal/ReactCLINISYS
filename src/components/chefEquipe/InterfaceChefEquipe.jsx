// src/components/chefEquipe/InterfaceChefEquipe.jsx
import React, { useState, useEffect, useMemo } from 'react';

// Importer les composants de layout spécifiques au Chef d'Équipe
import NavbarChefEquipe from './NavbarChefEquipe';
import SidebarChefEquipe from './SidebarChefEquipe';

// Importer les pages spécifiques au Chef d'Équipe
import MesEquipesChefPage from './MesEquipesChefPage';
import TicketsATraiterChefPage from './TicketsATraiterChefPage'; 
import SuiviAffectationsChefPage from './SuiviAffectationsChefPage'; // Importation de la nouvelle page
// Réutilisation de ConsultProfilPage de l'admin, ou vous pouvez créer un ConsultProfilPageChef spécifique
import ConsultProfilPage from '../admin/profil/ConsultProfilPage'; 

import { Menu as MenuIconLucide, XCircle as XCircleLucide, Package, Briefcase, Settings } from 'lucide-react'; 
// import initialDefaultProfilePic from '../../assets/images/default-profile.png'; 

// --- DONNÉES MOCK GLOBALES ---
const mockAllUsers = [
    { id: 'user001', prenom: 'Yasmin', nom: 'Jmal', poste: 'Développeur Front', equipeId: 'eq1', email: 'yasmin.jmal@example.com', profileImage: 'https://placehold.co/100x100/E0E7FF/4F46E5?text=YJ', statut: 'Actif' },
    { id: 'user002', prenom: 'Karim', nom: 'Bello', poste: 'Développeur Back', equipeId: 'eq1', email: 'karim.bello@example.com', profileImage: 'https://placehold.co/100x100/DBEAFE/1D4ED8?text=KB', statut: 'Actif' },
    { id: 'user005', prenom: 'Sophie', nom: 'Durand', poste: 'Testeur QA', equipeId: 'eq1', email: 'sophie.durand@example.com', profileImage: 'https://placehold.co/100x100/FEF3C7/D97706?text=SD', statut: 'En congé' },
    { id: 'user003', prenom: 'Ali', nom: 'Ben Salah', poste: 'Spécialiste Support Applicatif', equipeId: 'eq3', email: 'ali.bensalah@example.com', profileImage: 'https://placehold.co/100x100/D1FAE5/059669?text=AB', statut: 'Actif' },
    { id: 'user006', prenom: 'Linda', nom: 'Martin', poste: 'Développeur Fullstack', equipeId: 'eq3', email: 'linda.martin@example.com', profileImage: 'https://placehold.co/100x100/FCE7F3/DB2777?text=LM', statut: 'Actif' },
    { id: 'user007', prenom: 'Marc', nom: 'Dupont', poste: 'Technicien Support N1', equipeId: 'eq4', email: 'marc.dupont@example.com', profileImage: 'https://placehold.co/100x100/E0E7FF/4F46E5?text=MD', statut: 'Actif' },
    { 
      id: 'chef001', 
      prenom: 'Amine', 
      nom: 'Bahri', 
      email: 'amine.bahri@clinisys.com', 
      poste: "Chef d'équipe", 
      role: 'chef_equipe', 
      id_equipes_dirigees: ['eq1', 'eq3'], 
      userCreation: 'Système', 
      dateCreation: '2022-05-10T11:00:00Z', 
      num_telephone: '0600000003', 
      nom_utilisateur: 'chef_amine_b',
    },
];

const mockAllModules = [
    { id: 'mod001', nom: 'Gestion des Patients (Cardio)', description: 'Dossiers patients spécifiques à la cardiologie.', equipeId: 'eq1', icone: Package },
    { id: 'mod005', nom: 'Plannification Interventions Chirurgicales', description: 'Module pour la planification des opérations.', equipeId: 'eq1', icone: Briefcase },
    { id: 'mod008', nom: 'Imagerie Médicale (PACS)', description: 'Système d\'archivage et de communication des images.', equipeId: 'eq3', icone: Settings },
    { id: 'mod002', nom: 'Facturation Clinique', description: 'Module de facturation des actes.', equipeId: 'eq2' },
];

const mockAllEquipes = [
    {
      id: 'eq1',
      nom: 'Équipe Alpha (Cardiologie)',
      description: 'Équipe spécialisée dans le module de cardiologie et interventions.',
      membres: mockAllUsers.filter(u => u.equipeId === 'eq1'),
      modulesAssocies: mockAllModules.filter(m => m.equipeId === 'eq1')
    },
    {
      id: 'eq3',
      nom: 'Équipe Gamma (Radiologie)',
      description: 'Gestion et maintenance du module de radiologie.',
      membres: mockAllUsers.filter(u => u.equipeId === 'eq3'),
      modulesAssocies: mockAllModules.filter(m => m.equipeId === 'eq3')
    },
    { 
      id: 'eq2',
      nom: 'Équipe Bravo (Facturation)',
      description: 'Module de facturation des actes.',
      membres: [],
      modulesAssocies: mockAllModules.filter(m => m.equipeId === 'eq2')
    }
];

const initialMockTickets = [
  { id: 'T001', ref: 'REF001', client: 'Hôpital Central', demandeur: { prenom: 'Dr. Eva', nom: 'Rendes'}, titre: 'Problème de connexion au portail patient.', priorite: 'haute', statut: 'Accepté', dateCreation: '2025-05-20T10:00:00Z', dateAcceptation: '2025-05-20T11:00:00Z', description: 'Impossible de se connecter...', moduleAssigne: mockAllModules.find(m=>m.id==='mod001'), employeAssigne: null },
  { id: 'T002', ref: 'REF002', client: 'Clinique Pasteur', demandeur: { prenom: 'Inf.', nom: 'Dupont'}, titre: 'Erreur export données radiologie', priorite: 'moyenne', statut: 'Accepté', dateCreation: '2025-05-21T14:00:00Z', dateAcceptation: '2025-05-21T15:00:00Z', description: 'L\'export PDF échoue.', moduleAssigne: mockAllModules.find(m=>m.id==='mod008'), employeAssigne: null },
  { id: 'T003', ref: 'REF003', client: 'Cabinet Dr. Lefevre', demandeur: { prenom: 'Sec.', nom: 'Martin'}, titre: 'Demande formation module Facturation', priorite: 'faible', statut: 'Accepté', dateCreation: '2025-05-22T09:30:00Z', dateAcceptation: '2025-05-22T10:00:00Z', description: 'Besoin d\'une session de formation.', moduleAssigne: mockAllModules.find(m=>m.id==='mod002'), employeAssigne: null },
  { id: 'T004', ref: 'REF004', client: 'Hôpital Central', demandeur: { prenom: 'Dr. Eva', nom: 'Rendes'}, titre: 'Lenteur affichage planning chirurgical', priorite: 'haute', statut: 'Accepté', dateCreation: '2025-05-23T16:00:00Z', dateAcceptation: '2025-05-23T17:00:00Z', description: 'Le planning prend >30s à charger.', moduleAssigne: mockAllModules.find(m=>m.id==='mod005'), employeAssigne: null },
  { id: 'T005', ref: 'REF005', client: 'Clinique Pasteur', demandeur: { prenom: 'Rad.', nom: 'Dubois'}, titre: 'Qualité image scanner IRM', priorite: 'moyenne', statut: 'En cours', dateCreation: '2025-05-24T11:00:00Z', dateAcceptation: '2025-05-24T11:30:00Z', dateAssignationEmploye: '2025-05-24T12:00:00Z', moduleAssigne: mockAllModules.find(m=>m.id==='mod008'), employeAssigne: mockAllUsers.find(u=>u.id==='user006') },
  { id: 'T006', ref: 'REF006', client: 'Hôpital Central', demandeur: { prenom: 'Dr. Eva', nom: 'Rendes'}, titre: 'Accès dossier patient X bloqué', priorite: 'haute', statut: 'Assigné au technicien', dateCreation: '2025-05-25T09:00:00Z', dateAcceptation: '2025-05-25T09:30:00Z', dateAssignationEmploye: '2025-05-25T10:00:00Z', description: 'Le dossier est inaccessible.', moduleAssigne: mockAllModules.find(m=>m.id==='mod001'), employeAssigne: mockAllUsers.find(u=>u.id==='user001') },
];
// --- FIN DONNÉES MOCK ---


const InterfaceChefEquipe = ({ user, onLogout: appLogoutHandler }) => {
  const [activePage, setActivePage] = useState('home_chef'); 
  const [isDarkMode, setIsDarkMode] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('theme') === 'dark' : false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [allTicketsState, setAllTicketsState] = useState(initialMockTickets); 
  
  const [currentUserState, setCurrentUserState] = useState(() => {
    const chefMock = mockAllUsers.find(u => u.role === 'chef_equipe' && u.id === 'chef001');
    if (user) { 
      if (user.id === 'chef001' && user.role === 'chef_equipe') {
        return { ...chefMock, ...user }; 
      }
      return user; 
    }
    return chefMock; 
  });
  const [pageMessage, setPageMessage] = useState(null); 

  useEffect(() => {
    const chefMock = mockAllUsers.find(u => u.role === 'chef_equipe' && u.id === 'chef001');
    if (user) {
      if (user.id === 'chef001' && user.role === 'chef_equipe') {
        if (currentUserState?.id !== user.id || !currentUserState?.id_equipes_dirigees) {
             setCurrentUserState(prev => ({ ...chefMock, ...user }));
        } else if (currentUserState?.id !== user.id) {
             setCurrentUserState(user);
        }
      } else if (currentUserState?.id !== user.id) {
        setCurrentUserState(user);
      }
    } else if (!currentUserState && chefMock) { 
        setCurrentUserState(chefMock);
    }
  }, [user, currentUserState]);

  const toggleTheme = () => setIsDarkMode(prev => { 
    const newMode = !prev; 
    if (typeof window !== 'undefined') localStorage.setItem('theme', newMode ? 'dark' : 'light'); 
    return newMode; 
  });

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  useEffect(() => { 
    if (typeof window !== 'undefined') { 
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } 
  }, [isDarkMode]);

  const resetSelectionAndMessages = (preserveMessage = false) => {
    if (!preserveMessage) setPageMessage(null);
  };
  
  const showTemporaryMessage = (type, text, nextPage) => {
    resetSelectionAndMessages(true); 
    setPageMessage({ type, text });
    if(nextPage && nextPage !== activePage) setActivePage(nextPage);

    const messageTimer = setTimeout(() => {
        setPageMessage(null);
    }, 5000); 

    return () => { clearTimeout(messageTimer); };
  };

  const handleNavigateToUserProfileChef = () => {
    resetSelectionAndMessages();
    setActivePage('consulter_profil_chef'); 
  };
  
  const handleNavigateToHomeChef = () => {
    resetSelectionAndMessages();
    setActivePage('home_chef');
  };

  const handleUpdateChefProfile = (updatedUserData) => {
    console.log("Mise à jour du profil chef:", updatedUserData);
    setCurrentUserState(prev => ({...prev, ...updatedUserData}));
    showTemporaryMessage('success', 'Profil modifié avec succès.', 'consulter_profil_chef');
  };
  
  const handleActualLogout = () => {
    if (appLogoutHandler) {
      appLogoutHandler(); 
    } else {
      console.log("Déconnexion simulée pour Chef d'Équipe.");
    }
  };

  const equipesDuChefConnecte = useMemo(() => {
    if (!currentUserState || !currentUserState.id_equipes_dirigees || !Array.isArray(currentUserState.id_equipes_dirigees)) {
        return [];
    }
    return mockAllEquipes.filter(eq => currentUserState.id_equipes_dirigees.includes(eq.id));
  }, [currentUserState]);

  const ticketsPourChefATraiter = useMemo(() => { // Renommé
    if (!currentUserState || !equipesDuChefConnecte || equipesDuChefConnecte.length === 0) {
        return [];
    }
    const modulesGeresIdsParLeChef = equipesDuChefConnecte.flatMap(eq => eq.modulesAssocies.map(m => m.id));
    return allTicketsState.filter(ticket => 
      ticket.statut === 'Accepté' && 
      ticket.moduleAssigne && 
      modulesGeresIdsParLeChef.includes(ticket.moduleAssigne.id) &&
      !ticket.employeAssigne 
    );
  }, [currentUserState, equipesDuChefConnecte, allTicketsState]);

  // Nouveau useMemo pour les tickets assignés à suivre
  const ticketsAssignesParChefPourSuivi = useMemo(() => {
    if (!currentUserState || !equipesDuChefConnecte || equipesDuChefConnecte.length === 0) {
        return [];
    }
    const idsMembresDesEquipesDuChef = equipesDuChefConnecte.flatMap(eq => eq.membres.map(m => m.id));

    return allTicketsState.filter(ticket => 
        ticket.employeAssigne && 
        idsMembresDesEquipesDuChef.includes(ticket.employeAssigne.id) &&
        (ticket.statut === 'Assigné au technicien' || ticket.statut === 'En cours' || ticket.statut === 'En attente validation Chef' || ticket.statut === 'Réouvert' || ticket.statut === 'Résolu') // Ajout de Résolu pour le suivi
    );
  }, [currentUserState, equipesDuChefConnecte, allTicketsState]);


  const handleBulkAssignerTicketsAEmploye = (ticketIds, employe) => {
    const updatedTickets = allTicketsState.map(ticket => {
        if (ticketIds.includes(ticket.id)) {
            const ticketRef = ticket.ref || ticket.id;
            console.log(`Assignation du ticket ${ticketRef} à ${employe.prenom} ${employe.nom}`);
            return { 
                ...ticket, 
                employeAssigne: employe, 
                statut: 'Assigné au technicien', 
                dateAssignationEmploye: new Date().toISOString() 
            };
        }
        return ticket;
    });
    setAllTicketsState(updatedTickets);
    showTemporaryMessage('success', `${ticketIds.length} ticket(s) assigné(s) à ${employe.prenom} ${employe.nom}.`, null);
  };

  const handleRefuserTicketParChef = (ticketId, motif) => {
    const ticketRef = allTicketsState.find(t=>t.id===ticketId)?.ref || ticketId;
    setAllTicketsState(prevTickets => 
      prevTickets.map(t => 
        t.id === ticketId ? { ...t, statut: 'Refusé par Chef', motifRefusChef: motif, dateRefusChef: new Date().toISOString(), employeAssigne: null } : t
      )
    );
    showTemporaryMessage('info', `Ticket #${ticketRef} refusé. Motif: ${motif}`, null);
  };
  
  // Fonction placeholder pour la navigation vers les détails d'un ticket depuis la page de suivi
  const handleNavigateToTicketDetailsChef = (ticketId) => {
    console.log("Chef navigue vers les détails du ticket (Suivi):", ticketId);
    const ticket = allTicketsState.find(t => t.id === ticketId);
    if (ticket) {
        // Ici, vous pourriez définir un état pour le ticket sélectionné et changer de page
        // ou ouvrir une modale avec les détails du ticket et les actions possibles pour le chef
        // (ex: Valider résolution, Réouvrir, Ajouter une note)
        showTemporaryMessage('info', `Affichage des détails pour le ticket #${ticket.ref}. (Page/Modale de détails à créer pour le suivi)`, null);
    }
  };


  const renderActivePageChef = () => {
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
                onBulkAssignerTicketsAEmploye={handleBulkAssignerTicketsAEmploye}
                onRefuserTicketParChef={handleRefuserTicketParChef}
            />
        );

      case 'suivi_affectations_chef': // Case pour la nouvelle page
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
        return <div className="p-6 text-xl font-bold">Page "{activePage}" non trouvée pour Chef d'Équipe.</div>;
    }
  };

  if (!currentUserState) { 
    return (
      <div className="flex items-center justify-center h-screen text-xl text-red-600 dark:text-red-400">
        Erreur: Utilisateur Chef d'Équipe non identifié. Impossible de charger l'interface.
      </div>
    ); 
  }

  return (
    <div className={`flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <SidebarChefEquipe 
        activePage={activePage} 
        setActivePage={(pageId) => { resetSelectionAndMessages(); setActivePage(pageId);}} 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <button 
          onClick={toggleSidebar} 
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-md shadow text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" 
          aria-label="Ouvrir le menu"
        >
          <MenuIconLucide size={24} />
        </button>
        <NavbarChefEquipe 
          user={currentUserState} 
          onLogout={()=>{
            localStorage.clear();
            window.location.reload();

          }} 
          toggleTheme={toggleTheme} 
          isDarkMode={isDarkMode}
          onNavigateToUserProfile={handleNavigateToUserProfileChef}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto pt-16 md:ml-64 transition-all duration-300 ease-in-out">
          {pageMessage && pageMessage.text && (
            <div className={`fixed top-20 right-6 p-4 rounded-md shadow-lg z-[100] flex items-center space-x-3 animate-slide-in-right
                            ${pageMessage.type === 'success' ? 'bg-green-100 dark:bg-green-800/70 border-l-4 border-green-500 dark:border-green-600 text-green-700 dark:text-green-100'
                                                            : pageMessage.type === 'error' ? 'bg-red-100 dark:bg-red-800/70 border-l-4 border-red-500 dark:border-red-600 text-red-700 dark:text-red-100'
                                                            : 'bg-blue-100 dark:bg-blue-800/70 border-l-4 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-100'}`}
                  style={{marginTop: '0.5rem'}} role="alert"
            >
                <span className="font-medium flex-grow">{pageMessage.text}</span>
                <button onClick={() => setPageMessage(null)} className="ml-auto p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"> <XCircleLucide size={18}/> </button>
            </div>
          )}
          {renderActivePageChef()}
        </main>
      </div>
    </div>
  );
};

export default InterfaceChefEquipe;
