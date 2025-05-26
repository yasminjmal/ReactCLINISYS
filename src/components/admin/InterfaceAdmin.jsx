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
import PageAffectationTicket from './Tickets/PageAffectationTicket'; // Page pour affecter un ticket/sous-ticket
import PageDiffractionTicket from './Tickets/PageDiffractionTicket'; // Page pour créer les sous-tickets

import { Menu as MenuIconLucide, X } from 'lucide-react';
import initialDefaultProfilePic from '../../assets/images/default-profile.png';

// --- DONNÉES MOCK INITIALES (Assurez-vous que les structures correspondent) ---
const initialMockUsers = [
    { id: 'user001', prenom: 'Yasmin', nom: 'Jmal', email: 'yasmin.jmal@clinisys.com', poste: 'Développeur Front', role: 'utilisateur', actif: true, dateCreation: '2023-01-15T10:00:00Z', profileImage: initialDefaultProfilePic, userCreation: 'Admin Sys', equipes: [{ id: 'eq1', nom: 'Équipe Alpha' }], mot_de_passe: "password123", num_telephone: "0600000001", nom_utilisateur: "yjmal"},
    { id: 'chef001', prenom: 'Amine', nom: 'Bahri', email: 'amine.bahri@clinisys.com', poste: "Chef d'équipe", role: 'chef_equipe', actif: true, dateCreation: '2022-05-10T11:00:00Z', profileImage: initialDefaultProfilePic, userCreation: 'Admin Sys', equipes: [{ id: 'eq1', nom: 'Équipe Alpha' }], mot_de_passe: "password123", num_telephone: "0600000003", nom_utilisateur: "abahri"},
];
const initialMockEquipes = [
    { id: 'eq1', nom: 'Équipe Alpha', chefEquipe: initialMockUsers.find(u => u.id === 'chef001'), membres: [initialMockUsers.find(u => u.id === 'user001')].filter(Boolean), actif: true, dateCreation: '2023-01-01T10:00:00Z', userCreation: 'Admin Sys'},
];
const initialMockModules = [ { id: 'mod001', nom: 'Gestion des Patients', equipeId: 'eq1', nbTicketsAssignes: 15, dateCreation: '2023-01-20T10:00:00Z', userCreation: 'Admin Sys' } ];
const initialMockPostes = [ { id: 'poste001', designation: 'Développeur Front', nbUtilisateurs: initialMockUsers.filter(u => u.poste === 'Développeur Front').length, dateCreation: '2022-12-01T10:00:00Z', userCreation: 'Admin Sys' } ];
const initialMockTickets = [
  { id: 'T001', ref: 'REF001', client: 'Client Alpha', demandeur: initialMockUsers.find(u=>u.nom_utilisateur === 'yjmal') || { prenom: 'Yasmin', nom: 'Jmal'}, titre: 'Problème de connexion au portail', priorite: 'haute', statut: 'en attente', dateCreation: '2025-05-20T10:00:00Z', description: 'Impossible de se connecter au portail client depuis ce matin...', documentsJoints: [{ nom: 'capture_ecran_erreur.png', url: '#', type: 'image' }], sousTickets: [] },
  { id: 'T004', ref: 'REF004', client: 'Client Alpha', demandeur: initialMockUsers.find(u=>u.nom_utilisateur === 'yjmal') || { prenom: 'Yasmin', nom: 'Jmal'}, titre: 'Facture incorrecte #INV052025', priorite: 'haute', statut: 'Accepté', dateCreation: '2025-05-19T11:00:00Z', description: 'La facture #INV052025 du mois dernier contient une erreur...', documentsJoints: [{nom: 'facture_INV052025.pdf', url:'#', type: 'pdf'}], dateAcceptation: '2025-05-20T10:00:00Z', sousTickets: [] },
  { id: 'T008', ref: 'REF008', client: 'Client Alpha', demandeur: initialMockUsers.find(u=>u.nom_utilisateur === 'yjmal') || { prenom: 'Yasmin', nom: 'Jmal'}, titre: 'Suggestion d\'amélioration UI', priorite: 'faible', statut: 'Accepté', dateCreation: '2025-05-10T17:00:00Z', description: 'Le bouton de déconnexion est difficile à trouver...', documentsJoints: [], dateAcceptation: '2025-05-11T10:00:00Z',
    // Ticket T008 a déjà des sous-tickets pour tester l'affichage existant
    sousTickets: [
      { id: 'ST008-1', parentId: 'T008', titre: 'Sous-tâche: Design maquette', description: 'Préparer la maquette pour le nouveau bouton.', statut: 'Ouvert', dateCreation: '2025-05-11T10:05:00Z', priorite: 'faible', client: 'Client Alpha', demandeur: initialMockUsers.find(u=>u.nom_utilisateur === 'yjmal') || { prenom: 'Yasmin', nom: 'Jmal'} },
    ]
  },
  { id: 'T010', ref: 'REF010', client: 'Société Omega', demandeur: { prenom: 'Frank', nom: 'Castle' }, titre: 'Demande support urgent', priorite: 'haute', statut: 'Accepté', dateCreation: '2025-05-25T09:00:00Z', description: 'Serveur de production inaccessible.', documentsJoints: [], dateAcceptation: '2025-05-25T09:05:00Z', sousTickets: [] }, // Ce ticket n'a pas de sous-tickets, bon pour tester la diffraction
];

const AdminInterface = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('theme') === 'dark' : false);
  const [currentLanguage, setCurrentLanguage] = useState(() => typeof window !== 'undefined' ? (localStorage.getItem('language') || 'fr') : 'fr');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [usersData, setUsersData] = useState([...initialMockUsers]);
  const [equipesData, setEquipesData] = useState([...initialMockEquipes]);
  const [modulesData, setModulesData] = useState([...initialMockModules]);
  const [postesData, setPostesData] = useState(() => initialMockPostes.map(p => ({ ...p, nbUtilisateurs: initialMockUsers.filter(u => u.poste === p.designation).length })));
  const [ticketsData, setTicketsData] = useState([...initialMockTickets]);

  const [pageMessage, setPageMessage] = useState(null);
  const [newlyAddedItemId, setNewlyAddedItemId] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [selectedEquipeForDetails, setSelectedEquipeForDetails] = useState(null);
  const [selectedModuleForDetails, setSelectedModuleForDetails] = useState(null);
  const [selectedPosteForDetails, setSelectedPosteForDetails] = useState(null);
  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState(null);
  const [isProcessingSubTicket, setIsProcessingSubTicket] = useState(false); // AJOUT: Pour PageAffectationTicket

  useEffect(() => {
    setPostesData(prev => prev.map(p => ({ ...p, nbUtilisateurs: usersData.filter(u => u.poste === p.designation).length })));
  }, [usersData]);

  const toggleTheme = () => setIsDarkMode(prev => { const newMode = !prev; if (typeof window !== 'undefined') localStorage.setItem('theme', newMode ? 'dark' : 'light'); return newMode; });
  const toggleLanguage = () => setCurrentLanguage(prev => { const newLang = prev === 'fr' ? 'en' : 'fr'; if (typeof window !== 'undefined') localStorage.setItem('language', newLang); return newLang; });
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  useEffect(() => { if (typeof window !== 'undefined') { if (isDarkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); } }, [isDarkMode]);

  const resetSelectionAndMessages = () => {
    setPageMessage(null); setNewlyAddedItemId(null); setSelectedUserForDetails(null); setSelectedEquipeForDetails(null);
    setSelectedModuleForDetails(null); setSelectedPosteForDetails(null); setSelectedTicketForDetails(null); setIsProcessingSubTicket(false); // AJOUT
  };

  // --- Fonctions CRUD Utilisateurs (inchangées, supposées correctes) ---
  const handleNavigateToAjouterUser = () => { resetSelectionAndMessages(); setActivePage('ajouter_utilisateur'); };
  const handleNavigateToUserDetails = (userId) => { const u = usersData.find(u => u.id === userId); if (u) { resetSelectionAndMessages(); setSelectedUserForDetails(u); setActivePage('details_utilisateur'); }};
  const handleAddUser = (newUser) => { const u = {...newUser, profileImage: newUser.profileImage || initialDefaultProfilePic, id: `user_${Date.now()}`}; setUsersData(prev => [u, ...prev]); setActivePage('utilisateurs_consulter_utilisateurs'); setPageMessage({ type: 'success', text: `Utilisateur '${u.prenom} ${u.nom}' ajouté.` }); setNewlyAddedItemId(u.id); };
  const handleUpdateUser = (updatedUser) => { setUsersData(prev => prev.map(u => u.id === updatedUser.id ? {...u, ...updatedUser} : u)); setActivePage('utilisateurs_consulter_utilisateurs'); setPageMessage({ type: 'success', text: `Utilisateur '${updatedUser.prenom} ${updatedUser.nom}' modifié.`}); setNewlyAddedItemId(updatedUser.id); };
  const handleDeleteUser = (id) => { const u = usersData.find(u => u.id === id); setUsersData(prev => prev.filter(u => u.id !== id)); setActivePage('utilisateurs_consulter_utilisateurs'); setPageMessage({ type: 'success', text: `Utilisateur '${u?.prenom} ${u?.nom}' supprimé.`}); };

  // --- Fonctions CRUD Équipes (inchangées, supposées correctes) ---
  const handleNavigateToAjouterEquipe = () => { resetSelectionAndMessages(); setActivePage('ajouter_equipe'); };
  const handleNavigateToEquipeDetails = (id) => { const e = equipesData.find(e => e.id === id); if (e) { resetSelectionAndMessages(); setSelectedEquipeForDetails(e); setActivePage('details_equipe');}};
  const handleAddEquipe = (newEquipe) => { const e = {...newEquipe, id: `eq_${Date.now()}`}; setEquipesData(prev => [e, ...prev]); setActivePage('equipes_consulter_equipes'); setPageMessage({ type: 'success', text: `Équipe '${e.nom}' ajoutée.` }); setNewlyAddedItemId(e.id); };
  const handleUpdateEquipe = (updatedEquipe) => { setEquipesData(prev => prev.map(e => e.id === updatedEquipe.id ? {...e, ...updatedEquipe} : e)); setActivePage('equipes_consulter_equipes'); setPageMessage({ type: 'success', text: `Équipe '${updatedEquipe.nom}' modifiée.` }); setNewlyAddedItemId(updatedEquipe.id); };
  const handleDeleteEquipe = (id, nom) => { if (modulesData.some(m => m.equipeId === id)) { setPageMessage({ type: 'error', text: `L'équipe '${nom}' ne peut être supprimée (modules assignés).`}); return; } setEquipesData(prev => prev.filter(e => e.id !== id)); setActivePage('equipes_consulter_equipes'); setPageMessage({ type: 'success', text: `Équipe '${nom}' supprimée.`}); setSelectedEquipeForDetails(null); };

  // --- Fonctions CRUD Modules (inchangées, supposées correctes) ---
  const handleNavigateToAjouterModule = () => { resetSelectionAndMessages(); setActivePage('ajouter_module'); };
  const handleNavigateToModuleDetails = (id) => { const m = modulesData.find(m => m.id === id); if (m) { resetSelectionAndMessages(); setSelectedModuleForDetails(m); setActivePage('details_module'); }};
  const handleAddModule = (newModule) => { const m = { ...newModule, id: `mod_${Date.now()}`}; setModulesData(prev => [m, ...prev]); setActivePage('modules_consulter_modules'); setPageMessage({ type: 'success', text: `Module '${m.nom}' ajouté.` }); setNewlyAddedItemId(m.id); };
  const handleUpdateModule = (updatedModule) => { setModulesData(prev => prev.map(m => m.id === updatedModule.id ? {...m, ...updatedModule} : m)); setActivePage('modules_consulter_modules'); setPageMessage({ type: 'success', text: `Module '${updatedModule.nom}' modifié.` }); setNewlyAddedItemId(updatedModule.id); };
  const handleDeleteModule = (id, nom) => { setModulesData(prev => prev.filter(m => m.id !== id)); setActivePage('modules_consulter_modules'); setPageMessage({ type: 'success', text: `Module '${nom}' supprimé.`}); setSelectedModuleForDetails(null); };

  // --- Fonctions CRUD Postes (inchangées, supposées correctes) ---
  const handleNavigateToAjouterPoste = () => { resetSelectionAndMessages(); setActivePage('ajouter_poste'); };
  const handleNavigateToPosteDetails = (id) => { const p = postesData.find(p => p.id === id); if (p) { resetSelectionAndMessages(); setSelectedPosteForDetails(p); setActivePage('details_poste'); }};
  const handleAddPoste = (newPoste) => { const p = { ...newPoste, id: `poste_${Date.now()}`, nbUtilisateurs: 0 }; setPostesData(prev => [p, ...prev]); setActivePage('postes_consulter_postes'); setPageMessage({ type: 'success', text: `Poste '${p.designation}' ajouté.` }); setNewlyAddedItemId(p.id); };
  const handleUpdatePoste = (updatedPoste) => { setPostesData(prev => prev.map(p => p.id === updatedPoste.id ? {...p, designation: updatedPoste.designation } : p)); setActivePage('postes_consulter_postes'); setPageMessage({ type: 'success', text: `Poste '${updatedPoste.designation}' modifié.` }); setNewlyAddedItemId(updatedPoste.id); };
  const handleDeletePoste = (id, designation) => { if (usersData.some(u => u.poste === designation)) { setPageMessage({ type: 'error', text: `Poste '${designation}' ne peut être supprimé (utilisateurs assignés).`}); return; } setPostesData(prev => prev.filter(p => p.id !== id)); setActivePage('postes_consulter_postes'); setPageMessage({ type: 'success', text: `Poste '${designation}' supprimé.`}); setSelectedPosteForDetails(null); };

  // --- Fonctions pour Tickets ---
  const handleNavigateToTicketDetailsGeneral = (ticketId) => { // Pour 'en attente', 'refusé'
    const ticketToView = ticketsData.find(t => t.id === ticketId);
    if (ticketToView) {
      resetSelectionAndMessages(); setSelectedTicketForDetails(ticketToView);
      if (ticketToView.statut === 'Accepté') setActivePage('details_ticket_accepte');
      else setActivePage('details_ticket');
    }
  };

  const handleNavigateToTicketAccepteDetails = (ticketId) => { // Pour 'Accepté' (depuis la liste des tickets à affecter)
    const ticketToView = ticketsData.find(t => t.id === ticketId);
    if (ticketToView && (ticketToView.statut === 'Accepté' || ticketToView.statut === 'Affecté')) { // MODIFIÉ: Permet de voir détails d'un ticket affecté aussi
      resetSelectionAndMessages(); setSelectedTicketForDetails(ticketToView);
      setActivePage('details_ticket_accepte');
    } else {
      setPageMessage({ type: 'error', text: 'Ce ticket n\'est pas un ticket accepté valide pour cette action.' });
      setActivePage('tickets_affecter_acceptes');
    }
  };

  const handleAccepterTicket = (ticketId) => {
    const ticketRef = ticketsData.find(t => t.id === ticketId)?.ref || ticketId;
    setTicketsData(prev => prev.map(t => t.id === ticketId ? { ...t, statut: 'Accepté', dateAcceptation: new Date().toISOString() } : t));
    setSelectedTicketForDetails(null); setActivePage('tickets_affecter_acceptes');
    setPageMessage({ type: 'success', text: `Ticket ${ticketRef} accepté.` }); setNewlyAddedItemId(ticketId);
  };
  const handleRefuserTicket = (ticketId, motifRefus = "Non spécifié") => {
    const ticketRef = ticketsData.find(t => t.id === ticketId)?.ref || ticketId;
    setTicketsData(prev => prev.map(t => t.id === ticketId ? { ...t, statut: 'Refusé', dateRefus: new Date().toISOString(), motifRefus } : t));
    setSelectedTicketForDetails(null); setActivePage('tickets_voir_refuses'); // ou 'tickets_consulter_demandes'
    setPageMessage({ type: 'success', text: `Ticket ${ticketRef} refusé.` }); setNewlyAddedItemId(ticketId);
  };
  
  // AJOUT / MODIFICATION : Logique d'affectation et de diffraction
  const handleNavigateToGenericAffectationPage = (ticketId, isSub) => {
    let ticketToProcess = null;
    if (isSub) {
        for (const parentTicket of ticketsData) {
            if (parentTicket.subTickets && parentTicket.subTickets.length > 0) {
                const foundSub = parentTicket.subTickets.find(st => st.id === ticketId);
                if (foundSub) { ticketToProcess = foundSub; break; }
            }
        }
    } else {
        ticketToProcess = ticketsData.find(t => t.id === ticketId);
    }

    if (ticketToProcess && (ticketToProcess.statut === 'Accepté' || ticketToProcess.statut === 'Affecté')) { // Peut affecter/modifier affectation
        resetSelectionAndMessages();
        setSelectedTicketForDetails(ticketToProcess);
        setIsProcessingSubTicket(isSub);
        setActivePage('page_affectation_ticket'); // Une seule page d'affectation
    } else {
        setPageMessage({type: 'error', text: `Ticket ${ticketId} non trouvé ou statut incorrect pour affectation.`});
    }
  };

  const handleConfirmTicketAffectation = (ticketId, affectationData, isSub) => {
    setTicketsData(prevTickets => 
        prevTickets.map(pt => {
            if (!isSub && pt.id === ticketId) {
                return { ...pt, ...affectationData, statut: 'Affecté', dateAffectation: new Date().toISOString() };
            }
            if (pt.subTickets && pt.subTickets.length > 0) { // Recherche dans les sous-tickets si isSub est vrai
                return {
                    ...pt,
                    subTickets: pt.subTickets.map(st => 
                        st.id === ticketId && isSub 
                        ? { ...st, ...affectationData, statut: 'Affecté', dateAffectation: new Date().toISOString() } 
                        : st
                    )
                };
            }
            return pt;
        })
    );
    setPageMessage({ type: 'success', text: `Ticket ${ticketId} affecté.` });
    setSelectedTicketForDetails(null); setIsProcessingSubTicket(false);
    setActivePage('tickets_affecter_acceptes'); 
    setNewlyAddedItemId(ticketId);
  };

  const handleNavigateToPageDiffraction = (ticketId) => { // Renommé pour clarté
    const ticketToDiffract = ticketsData.find(t => t.id === ticketId);
    if (ticketToDiffract && (ticketToDiffract.statut === 'Accepté' || ticketToDiffract.statut === 'Affecté')) {
      resetSelectionAndMessages();
      setSelectedTicketForDetails(ticketToDiffract);
      setActivePage('page_diffraction_ticket');
    } else {
      setPageMessage({type: 'error', text: 'Ce ticket ne peut pas être diffracté (statut incorrect).'});
    }
  };

  const handleConfirmDiffraction = (parentId, newSubTicketsArray) => {
    setTicketsData(prevTickets => 
        prevTickets.map(ticket => {
            if (ticket.id === parentId) {
                const existingSubTickets = Array.isArray(ticket.subTickets) ? ticket.subTickets : [];
                const formattedNewSubTickets = newSubTicketsArray.map((st, index) => ({
                    ...st,
                    id: `ST-${parentId.slice(-3)}-${Date.now() + index}`,
                    parentId: parentId,
                    statut: 'Ouvert', // Ou 'Accepté' si hérité du parent
                    dateCreation: new Date().toISOString(),
                    client: ticket.client, 
                    demandeur: ticket.demandeur, 
                    // Assurez-vous que la structure est complète pour TicketAccepteRow
                    ref: `S-${ticket.ref}-${existingSubTickets.length + index + 1}`, 
                    dateAcceptation: ticket.dateAcceptation, // Peut être hérité ou non
                }));
                return { ...ticket, sousTickets: [...existingSubTickets, ...formattedNewSubTickets] };
            }
            return ticket;
        })
    );
    setPageMessage({ type: 'success', text: `${newSubTicketsArray.length} sous-ticket(s) créé(s) pour ${parentId}.` });
    // Mettre à jour selectedTicketForDetails pour inclure les nouveaux sous-tickets si on retourne aux détails
    const updatedParentTicket = ticketsData.find(t => t.id === parentId);
    setSelectedTicketForDetails(updatedParentTicket); 
    setActivePage('details_ticket_accepte'); // Retourner aux détails du parent pour voir les sous-tickets (ou à la liste)
    setNewlyAddedItemId(parentId); // Mettre en évidence le parent
  };

  const handleCancelGeneric = (pageToGoBackTo = 'home', messageType = 'info', messageText = "Action annulée.") => {
    setActivePage(pageToGoBackTo); setPageMessage({ type: messageType, text: messageText }); resetSelectionAndMessages();
  };
  const clearPageMessage = () => setPageMessage(null);

  const renderActivePage = () => {
    switch (activePage) {
      case 'home': return <div className="p-6 text-3xl font-bold text-slate-800 dark:text-slate-100">Tableau de bord principal</div>;

      // UTILISATEURS
      case 'utilisateurs_consulter_utilisateurs': return <ConsulterUsersPage users={usersData} onNavigateToAjouterUser={handleNavigateToAjouterUser} onNavigateToDetails={handleNavigateToUserDetails} pageMessage={pageMessage} newlyAddedUserId={newlyAddedItemId} clearPageMessage={clearPageMessage} />;
      case 'ajouter_utilisateur': return <AjouterUserPage onAddUser={handleAddUser} onCancel={() => handleCancelGeneric('utilisateurs_consulter_utilisateurs', 'info', 'Ajout annulé.')} adminName={user.name} />;
      case 'details_utilisateur': return selectedUserForDetails ? <UserDetailsPage user={selectedUserForDetails} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onCancel={() => handleCancelGeneric('utilisateurs_consulter_utilisateurs')} adminName={user.name} /> : <div className="p-6 text-center">Utilisateur non trouvé.</div>;

      // EQUIPES
      case 'equipes_consulter_equipes': return <ConsulterEquipesPage equipes={equipesData} users={usersData} onNavigateToAjouterEquipe={handleNavigateToAjouterEquipe} onNavigateToEquipeDetails={handleNavigateToEquipeDetails} onDeleteEquipeRequest={handleDeleteEquipe} pageMessage={pageMessage} newlyAddedEquipeId={newlyAddedItemId} clearPageMessage={clearPageMessage} />;
      case 'ajouter_equipe': return <AjouterEquipePage onAddEquipe={handleAddEquipe} onCancel={() => handleCancelGeneric('equipes_consulter_equipes', 'info', 'Ajout annulé.')} availableUsers={usersData} adminName={user.name} />;
      case 'details_equipe': return selectedEquipeForDetails ? <EquipeDetailsPage equipe={selectedEquipeForDetails} availableUsers={usersData} onUpdateEquipe={handleUpdateEquipe} onDeleteEquipeRequest={handleDeleteEquipe} onCancelToList={() => handleCancelGeneric('equipes_consulter_equipes')} adminName={user.name} /> : <div className="p-6">Équipe non trouvée.</div>;
      
      // MODULES
      case 'modules_consulter_modules': return <ConsulterModulesPage modules={modulesData} equipes={equipesData} onNavigateToAjouterModule={handleNavigateToAjouterModule} onNavigateToModuleDetails={handleNavigateToModuleDetails} onDeleteModuleRequest={handleDeleteModule} pageMessage={pageMessage} newlyAddedModuleId={newlyAddedItemId} clearPageMessage={clearPageMessage} />;
      case 'ajouter_module': return <AjouterModulePage onAddModule={handleAddModule} onCancel={() => handleCancelGeneric('modules_consulter_modules', 'info', 'Ajout annulé.')} availableEquipes={equipesData} adminName={user.name} />;
      case 'details_module': return selectedModuleForDetails ? <ModuleDetailsPage module={selectedModuleForDetails} availableEquipes={equipesData} onUpdateModule={handleUpdateModule} onDeleteModuleRequest={handleDeleteModule} onCancelToList={() => handleCancelGeneric('modules_consulter_modules')} adminName={user.name} /> : <div className="p-6">Module non trouvé.</div>;

      // POSTES
      case 'postes_consulter_postes': return <ConsulterPostesPage postes={postesData} onNavigateToAjouterPoste={handleNavigateToAjouterPoste} onNavigateToPosteDetails={handleNavigateToPosteDetails} onDeletePosteRequest={handleDeletePoste} pageMessage={pageMessage} newlyAddedPosteId={newlyAddedItemId} clearPageMessage={clearPageMessage} />;
      case 'ajouter_poste': return <AjouterPostePage onAddPoste={handleAddPoste} onCancel={() => handleCancelGeneric('postes_consulter_postes', 'info', 'Ajout annulé.')} adminName={user.name} />;
      case 'details_poste': return selectedPosteForDetails ? <PosteDetailsPage poste={selectedPosteForDetails} onUpdatePoste={handleUpdatePoste} onDeletePosteRequest={handleDeletePoste} onCancelToList={() => handleCancelGeneric('postes_consulter_postes')} adminName={user.name} /> : <div className="p-6">Poste non trouvé.</div>;

      // --- TICKETS ---
      case 'tickets_consulter_demandes': // Tickets 'en attente'
        return <ConsulterDemandesPage tickets={ticketsData.filter(t => t.statut === 'en attente')} onNavigateToTicketDetails={handleNavigateToTicketDetailsGeneral} pageMessage={pageMessage} newlyAddedItemId={newlyAddedItemId} clearPageMessage={clearPageMessage} />;
      
      case 'details_ticket': // Détails pour 'en attente', 'refusé', etc.
        return selectedTicketForDetails ? <TicketDetailsPage ticket={selectedTicketForDetails} onAccepterTicket={handleAccepterTicket} onRefuserTicket={handleRefuserTicket} onCancelToList={() => handleCancelGeneric('tickets_consulter_demandes')} /> : <div className="p-6">Ticket non trouvé.</div>;
      
      case 'tickets_affecter_acceptes': // Liste des tickets 'Accepté' ou 'Affecté'
        return <AffecterTicketsPage tickets={ticketsData.filter(t => t.statut === 'Accepté' || t.statut === 'Affecté')} onNavigateToTicketDetails={handleNavigateToTicketAccepteDetails} pageMessage={pageMessage} newlyAddedItemId={newlyAddedItemId} clearPageMessage={clearPageMessage} />;
      
      case 'details_ticket_accepte': // Détails pour un ticket 'Accepté' ou 'Affecté'
        return selectedTicketForDetails && (selectedTicketForDetails.statut === 'Accepté' || selectedTicketForDetails.statut === 'Affecté') ? <TicketAccepteDetailsPage ticket={selectedTicketForDetails} onNavigateToAffectation={(id) => handleNavigateToGenericAffectationPage(id, false)} onNavigateToDiffraction={handleNavigateToPageDiffraction} onCancelToList={() => handleCancelGeneric('tickets_affecter_acceptes')} /> : <div className="p-6">Ticket accepté non trouvé.</div>;

      // MODIFIÉ/AJOUT: Pages d'affectation et de diffraction
      case 'page_affectation_ticket':
        return selectedTicketForDetails ? <PageAffectationTicket ticketObject={selectedTicketForDetails} isForSubTicket={isProcessingSubTicket} onConfirmAffectation={handleConfirmTicketAffectation} onCancel={() => setActivePage('tickets_affecter_acceptes')} availableEquipes={equipesData} availableTechniciens={usersData} /> : <div className="p-6">Sélectionnez un ticket pour affectation.</div>;

      case 'page_diffraction_ticket':
        return selectedTicketForDetails ? <PageDiffractionTicket parentTicket={selectedTicketForDetails} onConfirmDiffraction={handleConfirmDiffraction} onCancel={() => setActivePage('details_ticket_accepte')} /> : <div className="p-6">Sélectionnez un ticket pour diffraction.</div>;

      // Autres pages tickets (placeholders)
      case 'tickets_consulter_affectes': return (<div className="p-6">Page: Consulter tickets affectés (Total: {ticketsData.filter(t => t.statut === 'Affecté').length})</div>);
      case 'tickets_voir_refuses': return (<div className="p-6">Page: Tickets refusés (Total: {ticketsData.filter(t => t.statut === 'Refusé').length})</div>);
      
      default: return <div className="p-6 text-3xl font-bold text-slate-800 dark:text-slate-100">Page "{activePage}" non trouvée</div>;
    }
  };

  if (!user) { return <div className="flex items-center justify-center h-screen text-xl">Erreur: Admin non identifié.</div>; }

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <SidebarAdmin activePage={activePage} setActivePage={(pageId) => { resetSelectionAndMessages(); setActivePage(pageId);}} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <button onClick={toggleSidebar} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-md shadow text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Ouvrir le menu">
          <MenuIconLucide size={24} />
        </button>
        <NavbarAdmin user={user} onLogout={onLogout} toggleTheme={toggleTheme} isDarkMode={isDarkMode} currentLanguage={currentLanguage} toggleLanguage={toggleLanguage} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto pt-16 md:ml-64 transition-all duration-300 ease-in-out">
          {pageMessage && pageMessage.text && (
            <div className={`fixed top-20 right-6 p-4 rounded-md shadow-lg z-[100] flex items-center space-x-3 animate-slide-in-right
                            ${pageMessage.type === 'success' ? 'bg-green-100 dark:bg-green-700 border-green-500 dark:border-green-600 text-green-700 dark:text-green-100'
                                                            : pageMessage.type === 'error' ? 'bg-red-100 dark:bg-red-700 border-red-500 dark:border-red-600 text-red-700 dark:text-red-100'
                                                            : 'bg-blue-100 dark:bg-blue-700 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-100'}`}
                  style={{marginTop: '0.5rem'}}
            >
                <span className="font-medium">{pageMessage.text}</span>
                <button onClick={clearPageMessage} className="ml-auto p-1 hover:bg-black/10 rounded-full"> <X size={16}/> </button>
            </div>
          )}
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};
export default AdminInterface;
    