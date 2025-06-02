// src/components/employe/InterfaceEmploye.jsx
import React, { useState, useEffect } from 'react';
import { Briefcase, LogOut, Settings, HelpCircle, ShieldCheck, Construction, FileText, XCircle, MessageSquare, CheckCircle, ListFilter, Edit3, Eye, User as UserProfileIcon } from 'lucide-react';

import SidebarEmploye from './SidebarEmploye';
import HeaderEmploye from './HeaderEmploye';
import MesTicketsAssignesPage from './pages/MesTicketsAssignesPage';
import MonTravailEnCoursPage from './pages/MonTravailEnCoursPage';
import PageTraitementTicket from './pages/PageTraitementTicket';
import MesTicketsResolusPage from './pages/MesTicketsResolusPage';
import MesTicketsRefusesPage from './pages/MesTicketsRefusesPage';
import ProfilEmployePage from './pages/ProfilEmployePage';

// Données mockées
const mockTicketsEmploye = [
  {
    id: 'TICKEMP001',
    titre: 'Configuration e-mail Outlook nouveau PC',
    description: 'Le nouvel employé M. Durant (Marketing) a besoin de sa configuration Outlook sur son poste. Bureau A-12.',
    priorite: 'Moyenne',
    statut: 'Assigné à l\'employé',
    dateCreation: '2024-05-29T09:15:00Z',
    dateAssignationEmploye: '2024-05-30T11:00:00Z',
    demandeur: { nom: 'Service RH', prenom: '', email: 'rh@clinisys.com', service: 'Ressources Humaines' },
    client: 'CLINISYS - Département Marketing',
    moduleConcerne: 'Logiciel Bureautique',
    dateEcheance: '2025-06-10',
    datePriseEnCharge: null,
    commentaires: [
        { id: 'comm-1622376000000', texte: "Prise de contact avec M. Durant, RDV fixé pour demain matin.", auteur: "Employé Jean Martin", date: "2024-05-30T14:30:00Z" }
    ],
    notesResolutionEmploye: null,
    dateResolutionEmploye: null,
    motifRefusEmploye: null,
    dateRefusEmploye: null,
  },
  {
    id: 'TICKEMP002',
    titre: 'Accès VPN ne fonctionne plus',
    description: 'Mme. Lemoine (Comptabilité) ne parvient plus à se connecter au VPN depuis son domicile. Urgent pour la clôture mensuelle.',
    priorite: 'Haute',
    statut: 'Assigné à l\'employé',
    dateCreation: '2024-05-30T08:30:00Z',
    dateAssignationEmploye: '2024-05-30T10:00:00Z',
    demandeur: { nom: 'Lemoine', prenom: 'Sophie', email: 'sophie.lemoine@clinisys.com', service: 'Comptabilité' },
    client: 'FINANCE-CORP (Externe)',
    moduleConcerne: 'Réseau et Accès Distant',
    dateEcheance: '2025-06-05',
    datePriseEnCharge: null,
    commentaires: [],
    notesResolutionEmploye: null,
    dateResolutionEmploye: null,
    motifRefusEmploye: null,
    dateRefusEmploye: null,
  },
  {
    id: 'TICKEMP003',
    titre: 'Demande de souris ergonomique',
    description: 'M. Paul Verdier (Design) souhaiterait une souris ergonomique pour soulager des douleurs au poignet.',
    priorite: 'Basse',
    statut: 'Assigné à l\'employé',
    dateCreation: '2024-05-27T16:00:00Z',
    dateAssignationEmploye: '2024-05-29T14:30:00Z',
    demandeur: { nom: 'Verdier', prenom: 'Paul', email: 'paul.verdier@clinisys.com', service: 'Design Graphique' },
    client: 'CLINISYS - Département Design',
    moduleConcerne: 'Matériel Informatique',
    dateEcheance: null,
    datePriseEnCharge: null,
    commentaires: [],
    notesResolutionEmploye: null,
    dateResolutionEmploye: null,
    motifRefusEmploye: null,
    dateRefusEmploye: null,
  },
  { 
    id: 'TICKEMP004',
    titre: 'Imprimante bloquée au 2ème étage',
    description: 'L\'imprimante couleur du 2ème étage (modèle HP ColorJet Pro M452) affiche un bourrage papier persistant.',
    priorite: 'Moyenne',
    statut: 'Terminé',
    dateCreation: '2024-05-28T10:00:00Z',
    dateAssignationEmploye: '2024-05-28T11:30:00Z',
    datePriseEnCharge: '2024-05-28T14:00:00Z',
    demandeur: { nom: 'Secrétariat', prenom: '', email: 'secretariat@clinisys.com', service: 'Support Administratif' },
    client: 'CLINISYS - Services Généraux',
    moduleConcerne: 'Matériel Informatique',
    dateEcheance: '2024-05-29',
    commentaires: [
        { id: 'comm-t4-1', texte: "Intervention sur place, détection d'un petit morceau de papier coincé.", auteur: "Employé Jean Martin", date: "2024-05-28T15:00:00Z" },
        { id: 'comm-t4-2', texte: "Nettoyage des rouleaux et test d'impression OK.", auteur: "Employé Jean Martin", date: "2024-05-28T15:15:00Z" }
    ],
    notesResolutionEmploye: "Bourrage papier résolu, nettoyage des rouleaux effectué. Imprimante fonctionnelle.",
    dateResolutionEmploye: "2024-05-28T15:20:00Z",
    motifRefusEmploye: null,
    dateRefusEmploye: null,
  },
   { 
    id: 'TICKEMP005',
    titre: 'Demande d\'accès à un logiciel non standard',
    description: 'M. Albert K. du service Marketing demande une licence pour "SuperGraphDesigner Pro X", logiciel non approuvé par la DSI.',
    priorite: 'Basse',
    statut: 'Refusé par employé',
    dateCreation: '2024-05-27T10:00:00Z',
    dateAssignationEmploye: '2024-05-27T11:30:00Z',
    demandeur: { nom: 'K.', prenom: 'Albert', email: 'albert.k@clinisys.com', service: 'Marketing' },
    client: 'CLINISYS - Département Marketing',
    moduleConcerne: 'Logiciels Spécifiques',
    dateEcheance: null,
    datePriseEnCharge: null,
    commentaires: [],
    notesResolutionEmploye: null,
    dateResolutionEmploye: null,
    motifRefusEmploye: "Logiciel non standard et non approuvé par la DSI. Demande d'approbation formelle nécessaire.",
    dateRefusEmploye: "2024-05-27T14:20:00Z",
  },
];


const EmployeInterface = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('tickets_assignes_employe');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pageTitle, setPageTitle] = useState('Mes Tickets Assignés');
  const [mesTickets, setMesTickets] = useState(mockTicketsEmploye);
  const [selectedTicketForView, setSelectedTicketForView] = useState(null);
  const [previousPage, setPreviousPage] = useState('tickets_assignes_employe');
  const [currentUserState, setCurrentUserState] = useState(user);

  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    setCurrentUserState(user);
  }, [user]);

  useEffect(() => {
    let title = 'Interface Employé';
    if (activePage === 'detail_ticket_view' && selectedTicketForView) {
        title = `Détail: ${selectedTicketForView.titre.substring(0,25)}...`;
    } else if (activePage === 'profil_employe') {
        title = 'Mon Profil';
    } else {
        switch (activePage) {
            case 'dashboard_employe': title = 'Tableau de Bord'; break;
            case 'tickets_assignes_employe': title = 'Mes Tickets Assignés'; break;
            case 'travail_en_cours_employe': title = 'Mon Travail en Cours'; break; 
            case 'tickets_resolus_employe': title = 'Mes Tickets Résolus'; break;
            case 'tickets_refuses_employe': title = 'Mes Tickets Refusés'; break;
        }
    }
    setPageTitle(title);
  }, [activePage, selectedTicketForView]);

  const clearNotification = () => setTimeout(() => setNotification({ message: '', type: '' }), 3500);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNavigateToProfile = () => {
    setPreviousPage(activePage);
    setActivePage('profil_employe');
  };

  const handleUpdateUserProfile = (updatedProfileData) => {
    const updatedUser = { ...currentUserState, ...updatedProfileData };
    setCurrentUserState(updatedUser);
    // Idéalement, informer App.jsx du changement pour persistance si nécessaire
    setNotification({ message: 'Profil mis à jour avec succès (simulation).', type: 'success' });
    clearNotification();
  };

  const handleAccepterTicket = (ticketId) => {
    const ticketToUpdate = mesTickets.find(t => t.id === ticketId);
    if (ticketToUpdate) {
      const updatedTicket = { ...ticketToUpdate, statut: 'En cours', datePriseEnCharge: new Date().toISOString() };
      setMesTickets(prevTickets =>
        prevTickets.map(t => (t.id === ticketId ? updatedTicket : t))
      );
      setSelectedTicketForView(null); 
      setPreviousPage('tickets_assignes_employe'); 
      setActivePage('travail_en_cours_employe'); 
      setNotification({ message: `Ticket ${ticketId} accepté et mis "En cours".`, type: 'success' });
      clearNotification();
    } else {
      setNotification({ message: `Erreur: Ticket ${ticketId} non trouvé.`, type: 'error' });
      clearNotification();
    }
  };

  const handleVoirDetailsTicketEnCours = (ticketId) => {
    const ticket = mesTickets.find(t => t.id === ticketId && t.statut === 'En cours');
    if (ticket) {
      setSelectedTicketForView(ticket);
      setPreviousPage('travail_en_cours_employe'); 
      setActivePage('detail_ticket_view'); 
    } else {
      setNotification({ message: `Erreur: Ticket en cours ${ticketId} non trouvé.`, type: 'error'});
      clearNotification();
    }
  };

  const handleVoirDetailsArchive = (ticketId, fromPage) => {
    const ticket = mesTickets.find(t => t.id === ticketId);
    if (ticket) {
        setSelectedTicketForView(ticket);
        setPreviousPage(fromPage); 
        setActivePage('detail_ticket_view');
    } else {
        setNotification({ message: `Erreur: Ticket ${ticketId} non trouvé.`, type: 'error'});
        clearNotification();
    }
  };
  
  const handleRetourListe = () => {
    setSelectedTicketForView(null); 
    setActivePage(previousPage); 
  };

  const handleUpdateEcheance = (ticketId, nouvelleDateEcheance) => {
    let updatedTicketForState = null;
    setMesTickets(prevTickets => 
        prevTickets.map(t => {
            if (t.id === ticketId) {
                updatedTicketForState = { ...t, dateEcheance: nouvelleDateEcheance };
                return updatedTicketForState;
            }
            return t;
        })
    );
    if (selectedTicketForView && selectedTicketForView.id === ticketId && updatedTicketForState) {
        setSelectedTicketForView(updatedTicketForState);
    }
    setNotification({ message: `Date d'échéance pour ${ticketId} mise à jour.`, type: 'info' });
    clearNotification();
  };

  const handleRefuserTicket = (ticketId, motif = "Motif non spécifié") => {
    setMesTickets(prevTickets =>
      prevTickets.map(t =>
        t.id === ticketId ? { ...t, statut: 'Refusé par employé', motifRefusEmploye: motif, dateRefusEmploye: new Date().toISOString() } : t
      )
    );
    setNotification({ message: `Ticket ${ticketId} refusé. Motif: ${motif}`, type: 'info' });
    clearNotification();
  };

  const handleAjouterCommentaire = (ticketId, commentaireText) => {
    if (!commentaireText.trim()) {
      setNotification({ message: "Le commentaire ne peut pas être vide.", type: 'error' });
      clearNotification();
      return;
    }
    let updatedTicketForState = null;
    setMesTickets(prevTickets =>
      prevTickets.map(t => {
        if (t.id === ticketId) {
          const nouveauCommentaire = {
            id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            texte: commentaireText,
            auteur: currentUserState.name || 'Employé',
            date: new Date().toISOString(),
          };
          updatedTicketForState = { ...t, commentaires: [...(t.commentaires || []), nouveauCommentaire] };
          return updatedTicketForState;
        }
        return t;
      })
    );
    if (selectedTicketForView && selectedTicketForView.id === ticketId && updatedTicketForState) {
      setSelectedTicketForView(updatedTicketForState);
    }
    setNotification({ message: `Commentaire ajouté à ${ticketId}.`, type: 'success' });
    clearNotification();
  };

  const handleTerminerTicket = (ticketId, notesResolution = "Ticket résolu.") => {
    setMesTickets(prevTickets =>
      prevTickets.map(t =>
        t.id === ticketId ? { ...t, statut: 'Terminé', notesResolutionEmploye: notesResolution, dateResolutionEmploye: new Date().toISOString() } : t
      )
    );
    setSelectedTicketForView(null);
    setActivePage('tickets_resolus_employe');
    setNotification({ message: `Ticket ${ticketId} marqué "Terminé".`, type: 'success' });
    clearNotification();
  };
  
  const renderActivePageEmploye = () => {
    switch (activePage) {
      case 'dashboard_employe':
        return <PlaceholderPage title="Tableau de Bord Employé" icon={Briefcase} message="Bienvenue." />;
      
      case 'tickets_assignes_employe':
        const ticketsPourAssignation = mesTickets.filter(t => t.statut === 'Assigné à l\'employé');
        return <MesTicketsAssignesPage
                    ticketsAttribues={ticketsPourAssignation}
                    onAccepterTicket={handleAccepterTicket}
                    onRefuserTicket={handleRefuserTicket}
                />;
      
      case 'travail_en_cours_employe':
        const ticketsEnCours = mesTickets.filter(t => t.statut === 'En cours');
        return <MonTravailEnCoursPage 
                    ticketsEnCours={ticketsEnCours} 
                    onVoirDetailsTicket={handleVoirDetailsTicketEnCours} 
                />;
      
      case 'detail_ticket_view': 
        if (selectedTicketForView) {
            const isReadOnly = selectedTicketForView.statut === 'Terminé' || selectedTicketForView.statut === 'Refusé par employé';
            return <PageTraitementTicket
                        ticket={selectedTicketForView}
                        user={currentUserState}
                        onAjouterCommentaire={handleAjouterCommentaire}
                        onTerminerTicket={handleTerminerTicket}
                        onRetourListe={handleRetourListe}
                        onUpdateEcheance={handleUpdateEcheance}
                        isReadOnly={isReadOnly}
                    />;
        }
        return <PlaceholderPage title="Erreur" icon={Briefcase} message="Aucun ticket sélectionné pour l'affichage." />;


      case 'tickets_resolus_employe':
        const ticketsTermines = mesTickets.filter(t => t.statut === 'Terminé');
        return <MesTicketsResolusPage 
                    ticketsTermines={ticketsTermines} 
                    onVoirDetailsTicketCallback={(ticketId) => handleVoirDetailsArchive(ticketId, 'tickets_resolus_employe')}
                />;

      case 'tickets_refuses_employe':
        const ticketsRefusesParEmploye = mesTickets.filter(t => t.statut === 'Refusé par employé');
         return <MesTicketsRefusesPage 
                    ticketsRefuses={ticketsRefusesParEmploye}
                    onVoirDetailsTicketCallback={(ticketId) => handleVoirDetailsArchive(ticketId, 'tickets_refuses_employe')}
                />;
      
      case 'profil_employe':
        return <ProfilEmployePage 
                    user={currentUserState} 
                    onUpdateProfile={handleUpdateUserProfile} 
                />;

      default:
        return <PlaceholderPage title="Page non trouvée" message="Contenu non disponible." />;
    }
  };

  const PlaceholderPage = ({ title, icon: IconComponent, message }) => (
    <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner m-4 animate-fadeIn">
      {IconComponent && <IconComponent size={48} className="mx-auto mb-6 text-sky-500" />}
      <h2 className="text-2xl lg:text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-4">{title}</h2>
      <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed max-w-2xl mx-auto">{message}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-8">
        Cette section est en cours de développement.
      </p>
      <style jsx="true">{`
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden">
      <SidebarEmploye
        activePage={activePage}
        setActivePage={setActivePage}
        user={currentUserState}
        onLogout={onLogout}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        } `}
      >
        {notification.message && (
            <div className={`fixed top-5 right-5 z-50 p-3 rounded-md shadow-lg text-sm font-medium
                ${notification.type === 'success' ? 'bg-green-500 text-white' : ''}
                ${notification.type === 'error' ? 'bg-red-500 text-white' : ''}
                ${notification.type === 'info' ? 'bg-sky-500 text-white' : ''}
                transition-all duration-300 ease-out ${notification.message ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full' }
            `} style={{ transform: notification.message ? 'translateX(0)' : 'translateX(100%)' }}>
                {notification.message}
            </div>
        )}
        <HeaderEmploye
          pageTitle={pageTitle}
          user={currentUserState}
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          onLogout={()=>{
            localStorage.clear();
            window.location.reload();

          }} 
          onNavigateToProfile={handleNavigateToProfile}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-slate-100 dark:bg-slate-900">
          {renderActivePageEmploye()}
        </main>
      </div>
    </div>
  );
};

export default EmployeInterface;
