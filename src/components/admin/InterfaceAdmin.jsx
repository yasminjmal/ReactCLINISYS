// src/components/admin/InterfaceAdmin.jsx
import React, { useState, useEffect } from 'react';

// Imports des composants de layout
import NavbarAdmin from './NavbarAdmin'; 
import SidebarAdmin from './SidebarAdmin';

// Imports des sections
import ConsulterUsersPage from './Utilisateurs/ConsulterUsersPage';
import AjouterUserPage from './Utilisateurs/AjouterUserPage';
import UserDetailsPage from './Utilisateurs/UserDetailsPage';
import ConsulterEquipesPage from './Equipes/ConsulterEquipesPage';
import AjouterEquipePage from './Equipes/AjouterEquipePage';
import EquipeDetailsPage from './Equipes/EquipeDetailsPage';
import ConsulterModulesPage from './Modules/ConsulterModulesPage';
import AjouterModulePage from './Modules/AjouterModulePage';
import ModuleDetailsPage from './Modules/ModuleDetailsPage';
import ConsulterPostesPage from './Postes/ConsulterPostesPage';
import AjouterPostePage from './Postes/AjouterPostePage';
import PosteDetailsPage from './Postes/PosteDetailsPage';

// Imports pour TICKETS
import ConsulterDemandesPage from './Tickets/ConsulterDemandesPage';
import TicketDetailsPage from './Tickets/TicketDetailsPage'; 
import AffecterTicketsPage from './Tickets/AffecterTicketsPage'; 
import TicketAccepteDetailsPage from './Tickets/TicketAccepteDetailsPage'; 
import PageAffectationTicket from './Tickets/PageAffectationTicket'; 
import PageDiffractionTicket from './Tickets/PageDiffractionTicket'; 

import ConsultProfilPage from './profil/ConsultProfilPage'; 

import { Menu as MenuIconLucide, X } from 'lucide-react';
import initialDefaultProfilePic from '../../assets/images/default-profile.png'; 

// --- DONNÉES MOCK INITIALES ---
const initialMockUsers = [
    { id: 'user001', prenom: 'Yasmin', nom: 'Jmal', email: 'yasmin.jmal@clinisys.com', poste: 'Développeur Front', role: 'utilisateur', actif: true, dateCreation: '2023-01-15T10:00:00Z', profileImage: initialDefaultProfilePic, userCreation: 'Admin Sys', equipes: [{ id: 'eq1', nom: 'Équipe Alpha' }], mot_de_passe: "password123", num_telephone: "0600000001", nom_utilisateur: "yjmal"},
    { id: 'user002', prenom: 'Karim', nom: 'Bello', email: 'karim.bello@clinisys.com', poste: 'Développeur Back', role: 'utilisateur', actif: true, dateCreation: '2023-03-10T14:00:00Z', profileImage: initialDefaultProfilePic, userCreation: 'Admin Sys', equipes: [{ id: 'eq1', nom: 'Équipe Alpha' }], mot_de_passe: "password456", num_telephone: "0600000002", nom_utilisateur: "kbello"},
    { id: 'chef001', prenom: 'Amine', nom: 'Bahri', email: 'amine.bahri@clinisys.com', poste: "Chef d'équipe", role: 'chef_equipe', actif: true, dateCreation: '2022-05-10T11:00:00Z', profileImage: initialDefaultProfilePic, userCreation: 'Admin Sys', equipes: [{ id: 'eq1', nom: 'Équipe Alpha' }], mot_de_passe: "password123", num_telephone: "0600000003", nom_utilisateur: "abahri"},
    { id: 'admin001', prenom: 'Admin', nom: 'Principal', email: 'admin@clinisys.com', poste: "Administrateur Système", role: 'admin', actif: true, dateCreation: '2022-01-01T09:00:00Z', profileImage: null, userCreation: 'Système', equipes: [], mot_de_passe: "adminpass", num_telephone: "0500000000", nom_utilisateur: "admin_sys"},
];
const initialMockEquipes = [
    { id: 'eq1', nom: 'Équipe Alpha', chefEquipe: initialMockUsers.find(u => u.id === 'chef001'), membres: [initialMockUsers.find(u => u.id === 'user001'), initialMockUsers.find(u => u.id === 'user002')].filter(Boolean), actif: true, dateCreation: '2023-01-01T10:00:00Z', userCreation: 'Admin Sys'},
    { id: 'eq2', nom: 'Équipe Bravo', chefEquipe: null, membres: [], actif: true, dateCreation: '2023-02-01T10:00:00Z', userCreation: 'Admin Sys'},
];
const initialMockModules = [
    { id: 'mod001', nom: 'Gestion des Patients', equipeId: 'eq1', description: "Module pour la gestion complète des dossiers patients.", icone: "Users" },
    { id: 'mod002', nom: 'Facturation et Suivi Paiements', equipeId: 'eq2', description: "Module de facturation et suivi des paiements.", icone: "CreditCard" },
    { id: 'mod003', nom: 'Gestion des RDV', equipeId: 'eq1', description: "Planification et gestion des rendez-vous.", icone: "Calendar" },
    { id: 'mod004', nom: 'Inventaire Pharmacie', equipeId: null, description: "Suivi des stocks de la pharmacie.", icone: "Archive" },
];
const initialMockPostes = [ { id: 'poste001', designation: 'Développeur Front', nbUtilisateurs: initialMockUsers.filter(u => u.poste === 'Développeur Front').length, dateCreation: '2022-12-01T10:00:00Z', userCreation: 'Admin Sys' } ];

const initialMockTickets = [
  { id: 'T001', ref: 'REF001', client: 'Client Alpha', demandeur: initialMockUsers.find(u=>u.nom_utilisateur === 'yjmal') || { prenom: 'Yasmin', nom: 'Jmal'}, titre: 'Problème de connexion au portail client.', priorite: 'haute', statut: 'en attente', dateCreation: '2025-05-20T10:00:00Z', description: 'Impossible de se connecter...', documentsJoints: [], sousTickets: [], moduleAssigne: null, employeAssigne: null },
  { id: 'T004', ref: 'REF004', client: 'Client Alpha', demandeur: initialMockUsers.find(u=>u.nom_utilisateur === 'yjmal') || { prenom: 'Yasmin', nom: 'Jmal'}, titre: 'Facture incorrecte #INV052025', priorite: 'haute', statut: 'Accepté', dateCreation: '2025-05-19T11:00:00Z', description: 'Erreur de calcul.', documentsJoints: [], dateAcceptation: '2025-05-20T10:00:00Z', sousTickets: [], moduleAssigne: null, employeAssigne: null },
  { id: 'T011', ref: 'REF011', client: 'Client Beta', demandeur: { prenom: 'Jane', nom: 'Doe' }, titre: 'Problème affichage mobile', priorite: 'moyenne', statut: 'Accepté', dateCreation: '2025-05-26T14:00:00Z', description: 'Layout cassé.', documentsJoints: [], dateAcceptation: '2025-05-26T14:05:00Z', sousTickets: [], moduleAssigne: initialMockModules.find(m => m.id === 'mod001'), dateAffectationModule: '2025-05-26T15:00:00Z', employeAssigne: null },
  { id: 'T013', ref: 'REF013', client: 'Hôpital Central', demandeur: { prenom: 'Dr. Eva', nom: 'Rendes' }, titre: 'Lenteur application Gestion des RDV', priorite: 'moyenne', statut: 'Accepté', dateCreation: '2025-05-27T08:30:00Z', description: 'Application lente.', documentsJoints: [], dateAcceptation: '2025-05-27T08:35:00Z',
    sousTickets: [
        { id: 'ST-013-001', parentId: 'T013', ref: 'S-REF013-1', titre: 'Analyser logs serveur RDV', priorite: 'moyenne', statut: 'Accepté', client: 'Hôpital Central', demandeur: { prenom: 'Dr. Eva', nom: 'Rendes' }, dateCreation: '2025-05-27T08:40:00Z', dateAcceptation: '2025-05-27T08:40:00Z', moduleAssigne: null, employeAssigne: null, description: 'Vérifier logs.'},
        { id: 'ST-013-002', parentId: 'T013', ref: 'S-REF013-2', titre: 'Vérifier charge BDD', priorite: 'moyenne', statut: 'Accepté', client: 'Hôpital Central', demandeur: { prenom: 'Dr. Eva', nom: 'Rendes' }, dateCreation: '2025-05-27T08:41:00Z', dateAcceptation: '2025-05-27T08:41:00Z', moduleAssigne: null, employeAssigne: null, description: 'Monitorer BDD.'},
    ],
    moduleAssigne: null, 
    employeAssigne: null
  },
   { id: 'T014', ref: 'REF014', client: 'Cabinet Médical XYZ', demandeur: { prenom: 'Secrétaire', nom: 'Patel' }, titre: 'Besoin de formation module Facturation', priorite: 'faible', statut: 'Accepté', dateCreation: '2025-05-28T10:00:00Z', description: 'Formation nécessaire.', documentsJoints: [], dateAcceptation: '2025-05-28T10:05:00Z', sousTickets: [], moduleAssigne: initialMockModules.find(m => m.id === 'mod002'), dateAffectationModule: '2025-05-28T10:15:00Z', employeAssigne: initialMockUsers.find(u => u.id === 'user002'), dateAffectationEmploye: '2025-05-28T11:00:00Z' },
];


const AdminInterface = ({ user, onLogout: appLogoutHandler }) => {
  const [activePage, setActivePage] = useState('home'); 
  const [isDarkMode, setIsDarkMode] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('theme') === 'dark' : false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [usersData, setUsersData] = useState([...initialMockUsers]);
  const [equipesData, setEquipesData] = useState([...initialMockEquipes]);
  const [modulesData, setModulesData] = useState([...initialMockModules]);
  const [postesData, setPostesData] = useState(() => initialMockPostes.map(p => ({ ...p, nbUtilisateurs: initialMockUsers.filter(u => u.poste === p.designation).length })));
  const [ticketsData, setTicketsData] = useState([...initialMockTickets]);
  
  const [currentUserState, setCurrentUserState] = useState(user || initialMockUsers.find(u => u.role === 'admin'));


  const [pageMessage, setPageMessage] = useState(null);
  const [highlightedItemId, setHighlightedItemId] = useState(null); 
  const [actionStatus, setActionStatus] = useState(null); 
  const [newlyCreatedTicketIds, setNewlyCreatedTicketIds] = useState([]);

  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [selectedEquipeForDetails, setSelectedEquipeForDetails] = useState(null);
  const [selectedModuleForDetails, setSelectedModuleForDetails] = useState(null);
  const [selectedPosteForDetails, setSelectedPosteForDetails] = useState(null);
  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState(null);
  const [isProcessingSubTicket, setIsProcessingSubTicket] = useState(false); 
  const [autoExpandTicketId, setAutoExpandTicketId] = useState(null); 

  useEffect(() => {
    if (user && user.id !== currentUserState?.id) {
        setCurrentUserState(user);
    }
  }, [user, currentUserState?.id]);


  const toggleTheme = () => setIsDarkMode(prev => { const newMode = !prev; if (typeof window !== 'undefined') localStorage.setItem('theme', newMode ? 'dark' : 'light'); return newMode; });
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  useEffect(() => { if (typeof window !== 'undefined') { if (isDarkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); } }, [isDarkMode]);

  const resetSelectionAndMessages = (preserveMessage = false, preserveHighlight = false) => {
    if (!preserveMessage) setPageMessage(null);
    if (!preserveHighlight) {
        setHighlightedItemId(null);
        setActionStatus(null);
        setAutoExpandTicketId(null); 
        setNewlyCreatedTicketIds([]);
    }
    setSelectedUserForDetails(null);
    setSelectedEquipeForDetails(null);
    setSelectedModuleForDetails(null);
    setSelectedPosteForDetails(null);
    setSelectedTicketForDetails(null);
    setIsProcessingSubTicket(false);
  };

  const showTemporaryMessageAndHighlight = (type, text, targetIdForHighlight, nextPage, parentIdToExpand = null, newSubTicketIds = []) => {
    resetSelectionAndMessages(true, true); 
    setPageMessage({ type, text });
    setHighlightedItemId(targetIdForHighlight); 
    setActionStatus(type); 
    if (parentIdToExpand) {
        setAutoExpandTicketId(parentIdToExpand);
    }
    if (newSubTicketIds && newSubTicketIds.length > 0) {
        setNewlyCreatedTicketIds(newSubTicketIds);
    }
    if(nextPage) setActivePage(nextPage);

    const highlightTimer = setTimeout(() => {
        setHighlightedItemId(null);
        setActionStatus(null);
        setNewlyCreatedTicketIds([]);
    }, 7000); 

    const messageTimer = setTimeout(() => {
        setPageMessage(null);
    }, 7000); 

    return () => { clearTimeout(highlightTimer); clearTimeout(messageTimer); };
  };
  
  const handleActualLogout = () => {
    if (appLogoutHandler) {
      appLogoutHandler(); 
    } else {
      localStorage.clear();
      console.log("Déconnexion simulée, redirection vers la page de login.");
      setActivePage('login_page_placeholder'); 
      window.location.reload();

    }
  };

  const handleNavigateToUserProfile = () => {
    resetSelectionAndMessages();
    setActivePage('consulter_profil_admin');
  };

  const handleNavigateToHome = () => {
    resetSelectionAndMessages(); 
    setActivePage('home');
  };

  const handleUpdateUserProfile = (updatedUserData) => {
    const newUsersData = usersData.map(u => 
        u.id === updatedUserData.id ? updatedUserData : u
    );
    setUsersData(newUsersData);

    if (currentUserState && currentUserState.id === updatedUserData.id) {
        setCurrentUserState(updatedUserData);
    }
    
    showTemporaryMessageAndHighlight('success', 'Profil modifié avec succès.', null, 'consulter_profil_admin');
  };


  // --- Fonctions CRUD ---
  const handleAddUser = (newUser) => { const id = `user_${Date.now()}`; setUsersData(prev => [{...newUser, id}, ...prev]); showTemporaryMessageAndHighlight('success', `Utilisateur ajouté.`, id, 'utilisateurs_consulter_utilisateurs'); };
  const handleNavigateToUserDetails = (userId) => { const u = usersData.find(u => u.id === userId); if (u) { resetSelectionAndMessages(); setSelectedUserForDetails(u); setActivePage('details_utilisateur'); }};
  const handleUpdateUser = (updatedUser) => { 
    const newUsers = usersData.map(u => u.id === updatedUser.id ? {...u, ...updatedUser} : u);
    setUsersData(newUsers);
    if (currentUserState && currentUserState.id === updatedUser.id) {
        setCurrentUserState(updatedUser);
    }
    setActivePage('utilisateurs_consulter_utilisateurs'); 
    showTemporaryMessageAndHighlight('success', `Utilisateur '${updatedUser.prenom} ${updatedUser.nom}' modifié.`, updatedUser.id, 'utilisateurs_consulter_utilisateurs');
  };
  const handleDeleteUser = (id) => { const u = usersData.find(u => u.id === id); setUsersData(prev => prev.filter(u => u.id !== id)); setActivePage('utilisateurs_consulter_utilisateurs'); showTemporaryMessageAndHighlight('success', `Utilisateur '${u?.prenom} ${u?.nom}' supprimé.`, id, 'utilisateurs_consulter_utilisateurs');};
  const handleNavigateToAjouterEquipe = () => { resetSelectionAndMessages(); setActivePage('ajouter_equipe'); };
  const handleNavigateToEquipeDetails = (id) => { const e = equipesData.find(e => e.id === id); if (e) { resetSelectionAndMessages(); setSelectedEquipeForDetails(e); setActivePage('details_equipe');}};
  const handleAddEquipe = (newEquipe) => { const e = {...newEquipe, id: `eq_${Date.now()}`}; setEquipesData(prev => [e, ...prev]); showTemporaryMessageAndHighlight('success', `Équipe '${e.nom}' ajoutée.`, e.id, 'equipes_consulter_equipes'); };
  const handleUpdateEquipe = (updatedEquipe) => { setEquipesData(prev => prev.map(e => e.id === updatedEquipe.id ? {...e, ...updatedEquipe} : e)); showTemporaryMessageAndHighlight('success', `Équipe '${updatedEquipe.nom}' modifiée.`, updatedEquipe.id, 'equipes_consulter_equipes');};
  const handleDeleteEquipe = (id, nom) => { if (modulesData.some(m => m.equipeId === id)) { showTemporaryMessageAndHighlight('error', `L'équipe '${nom}' ne peut être supprimée (modules assignés).`, id, activePage); return; } setEquipesData(prev => prev.filter(e => e.id !== id)); showTemporaryMessageAndHighlight('success', `Équipe '${nom}' supprimée.`, id, 'equipes_consulter_equipes'); setSelectedEquipeForDetails(null); };
  const handleNavigateToAjouterModule = () => { resetSelectionAndMessages(); setActivePage('ajouter_module'); };
  const handleNavigateToModuleDetails = (id) => { const m = modulesData.find(m => m.id === id); if (m) { resetSelectionAndMessages(); setSelectedModuleForDetails(m); setActivePage('details_module'); }};
  const handleAddModule = (newModule) => { const m = { ...newModule, id: `mod_${Date.now()}`}; setModulesData(prev => [m, ...prev]); showTemporaryMessageAndHighlight('success', `Module '${m.nom}' ajouté.`, m.id, 'modules_consulter_modules');};
  const handleUpdateModule = (updatedModule) => { setModulesData(prev => prev.map(m => m.id === updatedModule.id ? {...m, ...updatedModule} : m)); showTemporaryMessageAndHighlight('success', `Module '${updatedModule.nom}' modifié.`, updatedModule.id, 'modules_consulter_modules');};
  const handleDeleteModule = (id, nom) => { setModulesData(prev => prev.filter(m => m.id !== id)); showTemporaryMessageAndHighlight('success', `Module '${nom}' supprimé.`, id, 'modules_consulter_modules'); setSelectedModuleForDetails(null); };
  const handleNavigateToAjouterPoste = () => { resetSelectionAndMessages(); setActivePage('ajouter_poste'); };
  const handleNavigateToPosteDetails = (id) => { const p = postesData.find(p => p.id === id); if (p) { resetSelectionAndMessages(); setSelectedPosteForDetails(p); setActivePage('details_poste'); }};
  const handleAddPoste = (newPoste) => { const p = { ...newPoste, id: `poste_${Date.now()}`, nbUtilisateurs: 0 }; setPostesData(prev => [p, ...prev]); showTemporaryMessageAndHighlight('success', `Poste '${p.designation}' ajouté.`, p.id, 'postes_consulter_postes');};
  const handleUpdatePoste = (updatedPoste) => { setPostesData(prev => prev.map(p => p.id === updatedPoste.id ? {...p, designation: updatedPoste.designation } : p)); showTemporaryMessageAndHighlight('success', `Poste '${updatedPoste.designation}' modifié.`, updatedPoste.id, 'postes_consulter_postes');};
  const handleDeletePoste = (id, designation) => { if (usersData.some(u => u.poste === designation)) { showTemporaryMessageAndHighlight('error', `Poste '${designation}' ne peut être supprimé.`, id, activePage); return; } setPostesData(prev => prev.filter(p => p.id !== id)); showTemporaryMessageAndHighlight('success', `Poste '${designation}' supprimé.`, id, 'postes_consulter_postes'); setSelectedPosteForDetails(null); };

  // --- Fonctions pour Tickets ---
  const handleShowNoSubTicketsMessage = () => {
    setPageMessage({ type: 'info', text: 'Ce ticket n\'a pas de sous-tickets.' });
    setTimeout(() => setPageMessage(null), 3000); 
  };

  const handleNavigateToTicketDetailsGeneral = (ticketId) => { 
    const ticketToView = ticketsData.find(t => t.id === ticketId);
    if (ticketToView) {
      resetSelectionAndMessages(); setSelectedTicketForDetails(ticketToView);
      setActivePage('details_ticket_demande'); 
    }
  };

  const handleNavigateToTicketAccepteDetails = (ticketId, isSub = false) => { 
    let ticketToView = null;
    let parentOfSubTicket = null;

    if (isSub) {
        for (const parent of ticketsData) {
            if (parent.sousTickets && parent.sousTickets.length > 0) {
                ticketToView = parent.sousTickets.find(st => st.id === ticketId);
                if (ticketToView) {
                    parentOfSubTicket = parent; 
                    break;
                }
            }
        }
    } else {
        ticketToView = ticketsData.find(t => t.id === ticketId);
    }

    if (ticketToView) {
      resetSelectionAndMessages();
      setSelectedTicketForDetails(isSub && parentOfSubTicket ? { ...ticketToView, _parentInfo: {id: parentOfSubTicket.id, ref: parentOfSubTicket.ref} } : ticketToView);
      setIsProcessingSubTicket(isSub);
      setActivePage('details_ticket_accepte');
    } else {
      showTemporaryMessageAndHighlight('error', `Ticket ${ticketId} non trouvé.`, null, 'tickets_gerer');
    }
  };

  const handleAccepterTicket = (ticketId) => {
    const ticket = ticketsData.find(t => t.id === ticketId);
    setTicketsData(prev => prev.map(t => t.id === ticketId ? { ...t, statut: 'Accepté', dateAcceptation: new Date().toISOString() } : t));
    showTemporaryMessageAndHighlight('success', `Ticket #${ticket?.ref || ticketId} accepté. Il est maintenant visible dans "Gestion des Tickets Actifs".`, ticketId, 'tickets_gerer');
  };

  const handleRefuserTicket = (ticketId, motifRefus = "Non spécifié") => {
    const ticket = ticketsData.find(t => t.id === ticketId);
    setTicketsData(prev => prev.map(t => t.id === ticketId ? { ...t, statut: 'Refusé', dateRefus: new Date().toISOString(), motifRefus } : t));
    showTemporaryMessageAndHighlight('info', `Ticket #${ticket?.ref || ticketId} refusé.`, ticketId, 'tickets_voir_refuses');
  };

  const handleNavigateToAffectationPage = (ticketId, isSub = false) => {
    let ticketToProcess = null;
    if (isSub) {
        for (const parentTicket of ticketsData) {
            if (parentTicket.sousTickets && parentTicket.sousTickets.length > 0) {
                const foundSub = parentTicket.sousTickets.find(st => st.id === ticketId);
                if (foundSub) { ticketToProcess = foundSub; break; }
            }
        }
    } else {
        ticketToProcess = ticketsData.find(t => t.id === ticketId);
    }
    
    if (!isSub && ticketToProcess && ticketToProcess.sousTickets && ticketToProcess.sousTickets.length > 0) {
        showTemporaryMessageAndHighlight(
            'info', 
            `Le ticket #${ticketToProcess.ref} a des sous-tickets. Veuillez affecter les sous-tickets individuellement.`, 
            ticketToProcess.id, 
            'details_ticket_accepte', 
            true 
        );
        return;
    }

    if (ticketToProcess && (ticketToProcess.statut === 'Accepté' || ticketToProcess.statut === 'En cours')) { 
        resetSelectionAndMessages();
        setSelectedTicketForDetails(ticketToProcess);
        setIsProcessingSubTicket(isSub);
        setActivePage('page_affectation_ticket');
    } else {
        showTemporaryMessageAndHighlight('error', `Ticket ${ticketId} non trouvé ou statut incorrect pour affectation.`, null, activePage, true);
    }
  };

  const handleConfirmTicketAffectation = (ticketIdToAffect, affectationData, isTicketSub, nouveauxDocuments = []) => {
    let affectedTicketRefForMessage = ticketIdToAffect;
    let targetIdForHighlight = ticketIdToAffect; 
    let parentIdToExpand = null;

    setTicketsData(prevTickets => {
        return prevTickets.map(currentParentTicket => {
            const updateLogicForOneTicket = (ticketToUpdate) => {
                affectedTicketRefForMessage = ticketToUpdate.ref || ticketToUpdate.id;
                return {
                    ...ticketToUpdate,
                    moduleAssigne: affectationData.module, 
                    dateAffectationModule: new Date().toISOString(), 
                    documentsJoints: [...(ticketToUpdate.documentsJoints || []), ...nouveauxDocuments]
                };
            };

            if (isTicketSub) {
                const parentOfAffectedSubTicket = ticketsData.find(t => t.sousTickets?.some(st => st.id === ticketIdToAffect));
                if (currentParentTicket.id === parentOfAffectedSubTicket?.id) {
                    const updatedSubTicketsForThisParent = currentParentTicket.sousTickets.map(subT => {
                        if (subT.id === ticketIdToAffect) {
                            return updateLogicForOneTicket(subT);
                        }
                        return subT;
                    });
                    parentIdToExpand = currentParentTicket.id; 
                    return { ...currentParentTicket, sousTickets: updatedSubTicketsForThisParent };
                }
            } else { 
                if (currentParentTicket.id === ticketIdToAffect) {
                    return updateLogicForOneTicket(currentParentTicket);
                }
            }
            return currentParentTicket;
        });
    });
    
    showTemporaryMessageAndHighlight(
        'success', 
        `Ticket #${affectedTicketRefForMessage} affecté au module "${affectationData.module.nom}" avec succès.`,
        targetIdForHighlight, 
        'tickets_gerer', 
        parentIdToExpand 
    );
  };

  const handleNavigateToPageDiffraction = (ticketId) => {
    const ticketToDiffract = ticketsData.find(t => t.id === ticketId);
    if (ticketToDiffract && !ticketToDiffract.parentId && (ticketToDiffract.statut === 'Accepté' || ticketToDiffract.statut === 'En cours' || ticketToDiffract.statut === 'Affecté')) {
      resetSelectionAndMessages();
      setSelectedTicketForDetails(ticketToDiffract);
      setActivePage('page_diffraction_ticket');
    } else {
      showTemporaryMessageAndHighlight('error', 'Ce ticket ne peut pas être diffracté (doit être un ticket parent Accepté/En cours).', null, activePage, true);
    }
  };

  const handleConfirmDiffraction = (parentId, newSubTicketsArray) => {
    const parentTicketOriginal = ticketsData.find(t => t.id === parentId);
    if (!parentTicketOriginal) {
        showTemporaryMessageAndHighlight('error', `Erreur: Ticket parent ${parentId} non trouvé.`, null, activePage, true);
        return;
    }

    let newlyCreatedSubTicketIdsForHighlight = [];

    setTicketsData(prevTickets => {
        return prevTickets.map(ticket => {
            if (ticket.id === parentId) {
                const existingSubTickets = Array.isArray(ticket.sousTickets) ? ticket.sousTickets : [];
                const formattedNewSubTickets = newSubTicketsArray.map((st, index) => {
                    const newSubTicketId = `ST-${parentId.slice(-3)}-${Date.now() + index}`;
                    newlyCreatedSubTicketIdsForHighlight.push(newSubTicketId);
                    return {
                        titre: st.titre,
                        description: st.description,
                        id: newSubTicketId, 
                        parentId: parentId,
                        ref: `S-${parentTicketOriginal.ref}-${existingSubTickets.length + index + 1}`,
                        priorite: parentTicketOriginal.priorite,
                        statut: 'Accepté', 
                        client: parentTicketOriginal.client,
                        demandeur: parentTicketOriginal.demandeur,
                        dateCreation: new Date().toISOString(),
                        dateAcceptation: new Date().toISOString(), 
                        documentsJoints: [],
                        moduleAssigne: null, 
                        employeAssigne: null, 
                        sousTickets: [] 
                    };
                });
                return { 
                    ...ticket, 
                    sousTickets: [...existingSubTickets, ...formattedNewSubTickets],
                    moduleAssigne: null, 
                };
            }
            return ticket;
        });
    });

    showTemporaryMessageAndHighlight(
        'success', 
        `Ticket #${parentTicketOriginal.ref} diffracté. ${newSubTicketsArray.length} sous-ticket(s) créé(s).`,
        null, 
        'tickets_gerer', 
        parentId, 
        newlyCreatedSubTicketIdsForHighlight 
    );
  };

  const clearPageMessage = () => setPageMessage(null);
  const clearAutoExpand = () => setAutoExpandTicketId(null);


  const renderActivePage = () => {
    switch (activePage) {
      case 'home': return <div className="p-6 text-3xl font-bold text-slate-800 dark:text-slate-100">Tableau de bord Administrateur</div>;
      // Utilisateurs
      case 'utilisateurs_consulter_utilisateurs': return <ConsulterUsersPage users={usersData} onNavigateToAjouterUser={() => setActivePage('ajouter_utilisateur')} onNavigateToDetails={handleNavigateToUserDetails} pageMessage={pageMessage} newlyAddedUserId={highlightedItemId} clearPageMessage={clearPageMessage} />;
      case 'ajouter_utilisateur': return <AjouterUserPage onAddUser={handleAddUser} onCancel={() => setActivePage('utilisateurs_consulter_utilisateurs')} adminName={currentUserState.nom_utilisateur} />;
      case 'details_utilisateur': return selectedUserForDetails ? <UserDetailsPage user={selectedUserForDetails} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onCancel={(type, message) => showTemporaryMessageAndHighlight(type, message, null, 'utilisateurs_consulter_utilisateurs')} adminName={currentUserState.nom_utilisateur} /> : <div className="p-6 text-center">Sélectionnez un utilisateur.</div>;
      // Equipes
      case 'equipes_consulter_equipes': return <ConsulterEquipesPage equipes={equipesData} users={usersData} onNavigateToAjouterEquipe={handleNavigateToAjouterEquipe} onNavigateToEquipeDetails={handleNavigateToEquipeDetails} onDeleteEquipeRequest={handleDeleteEquipe} pageMessage={pageMessage} newlyAddedEquipeId={highlightedItemId} clearPageMessage={clearPageMessage} />;
      case 'ajouter_equipe': return <AjouterEquipePage onAddEquipe={handleAddEquipe} onCancel={() => setActivePage('equipes_consulter_equipes')} availableUsers={usersData} adminName={currentUserState.nom_utilisateur} />;
      case 'details_equipe': return selectedEquipeForDetails ? <EquipeDetailsPage equipe={selectedEquipeForDetails} availableUsers={usersData} onUpdateEquipe={handleUpdateEquipe} onDeleteEquipeRequest={handleDeleteEquipe} onCancelToList={() => setActivePage('equipes_consulter_equipes')} adminName={currentUserState.nom_utilisateur} /> : <div className="p-6">Sélectionnez une équipe.</div>;
      // Modules
      case 'modules_consulter_modules': return <ConsulterModulesPage modules={modulesData} equipes={equipesData} onNavigateToAjouterModule={handleNavigateToAjouterModule} onNavigateToModuleDetails={handleNavigateToModuleDetails} onDeleteModuleRequest={handleDeleteModule} pageMessage={pageMessage} newlyAddedModuleId={highlightedItemId} clearPageMessage={clearPageMessage} />;
      case 'ajouter_module': return <AjouterModulePage onAddModule={handleAddModule} onCancel={() => setActivePage('modules_consulter_modules')} availableEquipes={equipesData} adminName={currentUserState.nom_utilisateur} />;
      case 'details_module': return selectedModuleForDetails ? <ModuleDetailsPage module={selectedModuleForDetails} availableEquipes={equipesData} onUpdateModule={handleUpdateModule} onDeleteModuleRequest={handleDeleteModule} onCancelToList={() => setActivePage('modules_consulter_modules')} adminName={currentUserState.nom_utilisateur} /> : <div className="p-6">Sélectionnez un module.</div>;
      // Postes
      case 'postes_consulter_postes': return <ConsulterPostesPage postes={postesData} onNavigateToAjouterPoste={handleNavigateToAjouterPoste} onNavigateToPosteDetails={handleNavigateToPosteDetails} onDeletePosteRequest={handleDeletePoste} pageMessage={pageMessage} newlyAddedPosteId={highlightedItemId} clearPageMessage={clearPageMessage} />;
      case 'ajouter_poste': return <AjouterPostePage onAddPoste={handleAddPoste} onCancel={() => setActivePage('postes_consulter_postes')} adminName={currentUserState.nom_utilisateur} />;
      case 'details_poste': return selectedPosteForDetails ? <PosteDetailsPage poste={selectedPosteForDetails} onUpdatePoste={handleUpdatePoste} onDeletePosteRequest={handleDeletePoste} onCancelToList={() => setActivePage('postes_consulter_postes')} adminName={currentUserState.nom_utilisateur} /> : <div className="p-6">Sélectionnez un poste.</div>;

      // --- TICKETS ---
      case 'tickets_consulter_demandes':
        return <ConsulterDemandesPage 
                  tickets={ticketsData.filter(t => t.statut === 'en attente')} 
                  onNavigateToTicketDetails={handleNavigateToTicketDetailsGeneral} 
                  pageMessage={pageMessage} 
                  newlyAddedItemId={highlightedItemId} 
                  clearPageMessage={clearPageMessage}
                  pageMainTitle="Consulter les Demandes en Attente"
                  pageStatusDescriptor="en attente"
                />;
      case 'details_ticket_demande': 
        return selectedTicketForDetails ? <TicketDetailsPage ticket={selectedTicketForDetails} onAccepterTicket={handleAccepterTicket} onRefuserTicket={handleRefuserTicket} onCancelToList={() => setActivePage(selectedTicketForDetails.statut === 'Refusé' ? 'tickets_voir_refuses' : 'tickets_consulter_demandes')} /> : <div className="p-6">Ticket non trouvé.</div>;
      
      case 'tickets_gerer': 
        return <AffecterTicketsPage
                  tickets={ticketsData} 
                  onNavigateToTicketDetails={handleNavigateToTicketAccepteDetails} 
                  pageMessage={pageMessage}
                  highlightedItemId={highlightedItemId}
                  actionStatus={actionStatus} 
                  autoExpandTicketId={autoExpandTicketId}
                  newlyCreatedTicketIds={newlyCreatedTicketIds}
                  clearPageMessage={clearPageMessage}
                  clearAutoExpand={clearAutoExpand} 
                  onShowNoSubTicketsMessage={handleShowNoSubTicketsMessage}
                  pageTitle="Gestion des Tickets Actifs" 
                  availableUsers={usersData} 
                />;

      case 'details_ticket_accepte': 
        return selectedTicketForDetails
            ? <TicketAccepteDetailsPage
                ticket={selectedTicketForDetails}
                isSubTicket={isProcessingSubTicket}
                onNavigateToAffectation={handleNavigateToAffectationPage}
                onNavigateToDiffraction={handleNavigateToPageDiffraction}
                onCancelToList={() => {
                    resetSelectionAndMessages(false, false); 
                    setActivePage('tickets_gerer');
                }}
              />
            : <div className="p-6">Ticket non trouvé ou statut incorrect.</div>;

      case 'page_affectation_ticket': 
        return selectedTicketForDetails
            ? <PageAffectationTicket
                ticketObject={selectedTicketForDetails}
                isForSubTicket={isProcessingSubTicket}
                onConfirmAffectation={handleConfirmTicketAffectation}
                onCancel={() => {
                    const message = `Affectation du ticket #${selectedTicketForDetails.ref} annulée.`;
                    let itemIdToHighlight = isProcessingSubTicket && selectedTicketForDetails.parentId ? selectedTicketForDetails.parentId : selectedTicketForDetails.id;
                    showTemporaryMessageAndHighlight('info', message, itemIdToHighlight, 'tickets_gerer', isProcessingSubTicket ? itemIdToHighlight : null);
                }}
                availableModules={modulesData}
              />
            : <div className="p-6">Sélectionnez un ticket pour affectation.</div>;

      case 'page_diffraction_ticket': 
        return selectedTicketForDetails
            ? <PageDiffractionTicket
                parentTicket={selectedTicketForDetails}
                onConfirmDiffraction={handleConfirmDiffraction}
                onCancel={() => {
                    showTemporaryMessageAndHighlight(
                        'info', 
                        `Diffraction du ticket #${selectedTicketForDetails.ref} annulée.`, 
                        selectedTicketForDetails.id, 
                        'tickets_gerer', 
                        true 
                    );
                }}
              />
            : <div className="p-6">Sélectionnez un ticket pour diffraction.</div>;
      
      case 'tickets_voir_refuses': 
        return (<ConsulterDemandesPage 
                  tickets={ticketsData.filter(t => t.statut === 'Refusé')} 
                  onNavigateToTicketDetails={handleNavigateToTicketDetailsGeneral} 
                  pageMessage={pageMessage} 
                  newlyAddedItemId={highlightedItemId} 
                  clearPageMessage={clearPageMessage} 
                  pageMainTitle="Tickets Refusés"
                  pageStatusDescriptor="refusés"
                />);
      
      // NOUVELLES PAGES
      case 'consulter_profil_admin':
        return currentUserState ? <ConsultProfilPage user={currentUserState} onUpdateProfile={handleUpdateUserProfile} onNavigateHome={handleNavigateToHome} /> : <div className="p-6 text-center">Utilisateur non trouvé.</div>;
      
      case 'login_page_placeholder': 
        return (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Vous avez été déconnecté.</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-8">Vous allez être redirigé vers la page de connexion.</p>
          </div>
        );

      default: return <div className="p-6 text-xl font-bold">Page "{activePage}" non trouvée</div>;
    }
  };

  if (!currentUserState) { return <div className="flex items-center justify-center h-screen text-xl">Erreur: Admin non identifié. Impossible de charger l'interface.</div>; }

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <SidebarAdmin activePage={activePage} setActivePage={(pageId) => { resetSelectionAndMessages(); setActivePage(pageId);}} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <button onClick={toggleSidebar} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-md shadow text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Ouvrir le menu">
          <MenuIconLucide size={24} />
        </button>
        <NavbarAdmin 
            user={currentUserState} 
            onLogout={handleActualLogout} 
            toggleTheme={toggleTheme} 
            isDarkMode={isDarkMode}
            onNavigateToUserProfile={handleNavigateToUserProfile} 
            // Vous pourriez avoir besoin de passer currentLanguage et toggleLanguage ici si NavbarAdmin les utilise
            // currentLanguage={currentLanguageState} 
            // toggleLanguage={toggleLanguageHandler}
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
                <button onClick={clearPageMessage} className="ml-auto p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"> <X size={18}/> </button>
            </div>
          )}
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};
export default AdminInterface;
