// src/components/employe/pages/MesTicketsEnAttentePage.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FileText, Search, Tag, CalendarDays, User, Layers,
  PlayCircle, XCircle, MoreVertical, // Ajout de MoreVertical pour le bouton de détails
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import ticketService from '../../../services/ticketService';
import Modal from '../../shared/Modal';
import CommentManager from '../../admin/Tickets/CommentManager'; // Pour le modal de détails
import DocumentManager from '../../admin/Tickets/DocumentManager'; // Pour le modal de détails

// Composant TicketItem compact pour la liste
const TicketItem = ({ ticket, onStartTreatmentClick, onViewDetails }) => {

  const getPriorityDots = (priority) => {
    let colorClass = '';
    let dotCount = 0;
    switch (priority?.toLowerCase()) {
      case 'haute':
        colorClass = 'bg-red-500';
        dotCount = 3;
        break;
      case 'moyenne':
        colorClass = 'bg-blue-500'; // Bleu pour moyenne
        dotCount = 2;
        break;
      case 'basse':
        colorClass = 'bg-green-500';
        dotCount = 1;
        break;
      default:
        colorClass = 'bg-slate-400';
        dotCount = 0;
    }
    const emptyDotClass = 'bg-slate-300 dark:bg-slate-600'; // Couleur pour les points vides

    return (
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < dotCount ? colorClass : emptyDotClass}`}></span>
        ))}
      </div>
    );
  };

  const getTitleColorByPriority = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'haute': return 'text-red-600 dark:text-red-400';
      case 'moyenne': return 'text-blue-600 dark:text-blue-400'; // Titre bleu pour moyenne
      case 'basse': return 'text-green-600 dark:text-green-400';
      default: return 'text-slate-800 dark:text-slate-100';
    }
  };

  const echeance = ticket.date_echeance ? new Date(ticket.date_echeance) : null;
  let echeanceText = "Non définie";
  let echeanceStyle = "text-slate-500 dark:text-slate-400";

  if (echeance) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = echeance.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      echeanceText = `Échéance dépassée (${echeance.toLocaleDateString()})`;
      echeanceStyle = "text-red-500 dark:text-red-400 font-semibold";
    } else if (diffDays === 0) {
      echeanceText = `Échéance aujourd'hui (${echeance.toLocaleDateString()})`;
      echeanceStyle = "text-orange-500 dark:text-orange-400 font-semibold";
    } else if (diffDays <= 3) {
      echeanceText = `Échéance dans ${diffDays} jours (${echeance.toLocaleDateString()})`;
      echeanceStyle = "text-yellow-600 dark:text-yellow-400 font-semibold";
    } else {
      echeanceText = `Échéance: ${echeance.toLocaleDateString()}`;
      echeanceStyle = "text-green-600 dark:text-green-400";
    }
  }


  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between space-x-4">
      <div className="flex-1 min-w-0">
        <h4 className={`text-base font-semibold truncate ${getTitleColorByPriority(ticket.priorite)}`} title={ticket.titre}>
          {ticket.titre}
        </h4>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {ticket.idClient && (
            <span className="flex items-center">
              <User size={12} className="mr-1 opacity-70" /> {ticket.idClient.nomComplet}
            </span>
          )}
          {echeance && ( // Afficher l'échéance seulement si elle existe
            <span className={`flex items-center ${echeanceStyle}`}>
              <CalendarDays size={12} className="mr-1 opacity-70" /> {echeanceText}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 flex-shrink-0">
        <div className="flex items-center space-x-1" title={`Priorité: ${ticket.priorite}`}>
          {getPriorityDots(ticket.priorite)}
        </div>
        <button
          onClick={() => onViewDetails(ticket)}
          className="p-2 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400 transition-colors"
          title="Voir les détails du ticket"
        >
          <FileText size={18} /> {/* Icône pour les détails */}
        </button>
        <button
          onClick={() => onStartTreatmentClick(ticket)}
          className="p-2 rounded-full text-white bg-sky-500 hover:bg-sky-600 transition-colors"
          title="Commencer le traitement"
        >
          <PlayCircle size={18} />
        </button>
      </div>
    </div>
  );
};


const MesTicketsEnAttentePage = ({ onStartTreatmentCallback }) => {
  const { currentUser } = useAuth();
  const [allTickets, setAllTickets] = useState([]); // Garde tous les tickets assignés pour un filtrage local
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfigNoEcheance, setSortConfigNoEcheance] = useState({ key: 'dateCreation', direction: 'descending' });
  const [sortConfigWithEcheance, setSortConfigWithEcheance] = useState({ key: 'date_echeance', direction: 'ascending' }); // Tri par échéance par défaut

  // Modals
  const [isStartTreatmentModalOpen, setIsStartTreatmentModalOpen] = useState(false);
  const [ticketToStartTreatment, setTicketToStartTreatment] = useState(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);


  const fetchTicketsAssignedToUser = useCallback(async () => {
    if (!currentUser || !currentUser.id) {
      setLoading(false);
      setError("Utilisateur non connecté ou ID utilisateur manquant.");
      return;
    }
    try {
      setLoading(true);
      // Récupérer tous les tickets de l'utilisateur
      const allUserTickets = await ticketService.getTicketsByUserId(currentUser.id);

      // FILTRE CLÉ MODIFIÉ ICI
      // Un ticket est "en attente" s'il est assigné à l'employé et n'a pas encore de date de traitement (debutTraitement)
      // Son statut peut être 'En_attente' ou 'En_cours' (si l'assignation vient de se faire mais le traitement n'est pas débuté)
      const enAttenteTickets = allUserTickets.filter(
        ticket => 
          ticket.idUtilisateur?.id === currentUser.id && // S'assurer qu'il est assigné à l'employé courant
           ticket.statue === 'En_cours' && // Peut être en attente ou en cours (mais non débuté)
          !ticket.debutTraitement // S'assurer que le traitement n'a pas encore commencé
      );
      setAllTickets(enAttenteTickets || []);
      setError(null);
    } catch (err) {
      console.error("Échec du chargement des tickets en attente:", err);
      setError("Échec du chargement de vos tickets en attente. Veuillez réessayer plus tard.");
      setAllTickets([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTicketsAssignedToUser();
  }, [fetchTicketsAssignedToUser]);


  // Séparation des tickets en deux listes basées sur la date d'échéance
  const ticketsNoEcheance = useMemo(() => {
    return allTickets.filter(ticket => !ticket.date_echeance);
  }, [allTickets]);

  const ticketsWithEcheance = useMemo(() => {
    return allTickets.filter(ticket => !!ticket.date_echeance);
  }, [allTickets]);


  // --- Handlers pour les actions des tickets ---

  const handleStartTreatmentClick = (ticket) => {
    setTicketToStartTreatment(ticket);
    setIsStartTreatmentModalOpen(true);
  };

  const closeStartTreatmentModal = () => {
    setIsStartTreatmentModalOpen(false);
    setTicketToStartTreatment(null);
  };

  const handleConfirmStartTreatment = async () => {
    if (!ticketToStartTreatment) return;

    setIsLoadingModal(true);
    try {
      const payload = {
        debutTraitement: new Date().toISOString(),
        statue: 'En_cours' // S'assurer que le statut est 'En_cours' si ce n'était pas déjà le cas
      };

      await ticketService.updateTicket(ticketToStartTreatment.id, payload);
      fetchTicketsAssignedToUser(); // Recharger les tickets après modification
      closeStartTreatmentModal();
      if (onStartTreatmentCallback) onStartTreatmentCallback(ticketToStartTreatment.id);

    } catch (err) {
      console.error("Erreur lors du démarrage du traitement:", err);
      setError("Échec du démarrage du traitement. Veuillez réessayer.");
    } finally {
      setIsLoadingModal(false);
    }
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicketForDetail(ticket);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTicketForDetail(null);
    // Optionnel: recharger les tickets si des modifications (commentaires/documents) ont été faites
    // fetchTicketsAssignedToUser(); 
  };


  // --- Fonctions de tri et de recherche ---
  const requestSort = (key, currentSortConfig, setSortConfig) => {
    let direction = 'ascending';
    // Si la clé est la même, inverse la direction, sinon, réinitialise à 'ascending'
    if (currentSortConfig.key === key && currentSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key, currentSortConfig) => {
    if (currentSortConfig.key === key) {
      return currentSortConfig.direction === 'ascending' ? '▲' : '▼';
    }
    return '';
  };

  const applySorting = (list, sortConfig) => {
    const sortableList = [...list];
    if (sortConfig.key) {
      sortableList.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'dateCreation' || sortConfig.key === 'date_echeance') {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
        } else if (sortConfig.key === 'priorite') {
          const priorityOrder = { 'haute': 3, 'moyenne': 2, 'basse': 1 };
          valA = priorityOrder[valA?.toLowerCase()] || 0;
          valB = priorityOrder[valB?.toLowerCase()] || 0;
        } else if (sortConfig.key === 'idClient') { // Tri par nom complet du client
          valA = a.idClient?.nomComplet?.toLowerCase() || '';
          valB = b.idClient?.nomComplet?.toLowerCase() || '';
        }

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableList;
  };


  const sortedAndFilteredNoEcheanceTickets = useMemo(() => {
    const filtered = ticketsNoEcheance.filter(ticket =>
      ticket.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.idClient && ticket.idClient.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return applySorting(filtered, sortConfigNoEcheance);
  }, [ticketsNoEcheance, searchTerm, sortConfigNoEcheance]);

  const sortedAndFilteredWithEcheanceTickets = useMemo(() => {
    const filtered = ticketsWithEcheance.filter(ticket =>
      ticket.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.idClient && ticket.idClient.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return applySorting(filtered, sortConfigWithEcheance);
  }, [ticketsWithEcheance, searchTerm, sortConfigWithEcheance]);


  if (loading) {
    return (
      <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Chargement des tickets en attente...</h2>
        <p className="text-slate-500 dark:text-slate-400">Veuillez patienter pendant que nous récupérons vos tickets.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-10 text-center bg-red-100 dark:bg-red-900/50 rounded-lg shadow-inner text-red-700 dark:text-red-300">
        <XCircle size={48} className="mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-3">Erreur de chargement</h2>
        <p>{error}</p>
        <p className="text-sm mt-2">Veuillez vérifier votre connexion ou réessayer plus tard.</p>
      </div>
    );
  }

  // Si aucune liste n'a de tickets et qu'il n'y a pas de recherche active
  if (allTickets.length === 0 && !searchTerm) {
    return (
      <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner">
        <FileText size={48} className="mx-auto mb-4 text-sky-500" />
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Aucun ticket en attente</h2>
        <p className="text-slate-500 dark:text-slate-400">Vous n'avez actuellement aucun nouveau ticket en attente.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Barre de recherche globale */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par titre, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input-icon w-full py-2.5 text-sm bg-slate-50 dark:bg-slate-900/50" // Stylisation claire
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section Tickets sans échéance */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
              <FileText size={24} className="mr-3 text-blue-500" />
              Tickets Sans Échéance ({sortedAndFilteredNoEcheanceTickets.length})
            </h2>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 mb-4">
              <span>Trier par:</span>
              <button onClick={() => requestSort('priorite', sortConfigNoEcheance, setSortConfigNoEcheance)} className="font-medium hover:text-blue-500">
                Priorité {getSortIndicator('priorite', sortConfigNoEcheance)}
              </button>
              <span>|</span>
              <button onClick={() => requestSort('idClient', sortConfigNoEcheance, setSortConfigNoEcheance)} className="font-medium hover:text-blue-500">
                Client {getSortIndicator('idClient', sortConfigNoEcheance)}
              </button>
            </div>
            <div className="flex-grow space-y-3 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              {sortedAndFilteredNoEcheanceTickets.length > 0 ? (
                sortedAndFilteredNoEcheanceTickets.map(ticket => (
                  <TicketItem
                    key={ticket.id}
                    ticket={ticket}
                    onStartTreatmentClick={handleStartTreatmentClick}
                    onViewDetails={handleViewDetails}
                  />
                ))
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8 italic">
                  Aucun ticket sans échéance.
                </div>
              )}
            </div>
          </div>

          {/* Section Tickets avec échéance */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
              <CalendarDays size={24} className="mr-3 text-orange-500" />
              Tickets Avec Échéance ({sortedAndFilteredWithEcheanceTickets.length})
            </h2>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 mb-4">
              <span>Trier par:</span>
              <button onClick={() => requestSort('date_echeance', sortConfigWithEcheance, setSortConfigWithEcheance)} className="font-medium hover:text-blue-500">
                Échéance {getSortIndicator('date_echeance', sortConfigWithEcheance)}
              </button>
              <span>|</span>
              <button onClick={() => requestSort('priorite', sortConfigWithEcheance, setSortConfigWithEcheance)} className="font-medium hover:text-blue-500">
                Priorité {getSortIndicator('priorite', sortConfigWithEcheance)}
              </button>
              <span>|</span>
              <button onClick={() => requestSort('idClient', sortConfigWithEcheance, setSortConfigWithEcheance)} className="font-medium hover:text-blue-500">
                Client {getSortIndicator('idClient', sortConfigWithEcheance)}
              </button>
            </div>
            <div className="flex-grow space-y-3 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              {sortedAndFilteredWithEcheanceTickets.length > 0 ? (
                sortedAndFilteredWithEcheanceTickets.map(ticket => (
                  <TicketItem
                    key={ticket.id}
                    ticket={ticket}
                    onStartTreatmentClick={handleStartTreatmentClick}
                    onViewDetails={handleViewDetails}
                  />
                ))
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8 italic">
                  Aucun ticket avec échéance.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour le démarrage du traitement (inchangé) */}
      <Modal
        isOpen={isStartTreatmentModalOpen}
        onClose={closeStartTreatmentModal}
        title="Confirmer le démarrage du traitement"
        footerActions={
          <>
            <button onClick={closeStartTreatmentModal} className="btn btn-secondary py-2 text-sm" disabled={isLoadingModal}>
              Annuler
            </button>
            <button
              onClick={handleConfirmStartTreatment}
              className="btn btn-primary bg-sky-600 hover:bg-sky-700 py-2 text-sm"
              disabled={isLoadingModal}
            >
              {isLoadingModal ? 'Démarrage...' : 'Confirmer le Démarrage'}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Êtes-vous sûr de vouloir commencer le traitement du ticket : <strong className="text-slate-700 dark:text-slate-100">{ticketToStartTreatment?.titre}</strong> (ID: {ticketToStartTreatment?.id}) ?
          <br />Son statut passera à "En cours".
        </p>
      </Modal>

      {/* Nouveau Modal pour les détails du ticket */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        title={`Détails du Ticket : ${selectedTicketForDetail?.titre || ''}`}
        size="lg" // Utilisez une taille plus grande pour les détails
        footerActions={
          <button onClick={closeDetailModal} className="btn btn-secondary py-2 text-sm">
            Fermer
          </button>
        }
      >
        {selectedTicketForDetail && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Informations Générales</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{selectedTicketForDetail.description || "Aucune description fournie."}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                {/* On peut afficher l'ID ici si c'est utile dans le contexte du détail */}
                <p><strong>Référence:</strong> {selectedTicketForDetail.id}</p>
                <p><strong>Priorité:</strong> {selectedTicketForDetail.priorite}</p>
                <p><strong>Statut:</strong> {selectedTicketForDetail.statue?.replace(/_/g, ' ')}</p>
                <p><strong>Créé le:</strong> {new Date(selectedTicketForDetail.dateCreation).toLocaleDateString()}</p>
                {selectedTicketForDetail.debutTraitement && <p><strong>Traitement commencé le:</strong> {new Date(selectedTicketForDetail.debutTraitement).toLocaleDateString()}</p>}
                {selectedTicketForDetail.date_echeance && <p><strong>Échéance:</strong> {new Date(selectedTicketForDetail.date_echeance).toLocaleDateString()}</p>}
                {selectedTicketForDetail.dateCloture && <p><strong>Clôturé le:</strong> {new Date(selectedTicketForDetail.dateCloture).toLocaleDateString()}</p>}
                {selectedTicketForDetail.idClient && <p><strong>Client:</strong> {selectedTicketForDetail.idClient.nomComplet}</p>}
                {selectedTicketForDetail.idModule && <p><strong>Module:</strong> {selectedTicketForDetail.idModule.designation}</p>}
                {selectedTicketForDetail.idUtilisateur && <p><strong>Assigné à:</strong> {selectedTicketForDetail.idUtilisateur.prenom} {selectedTicketForDetail.idUtilisateur.nom}</p>}
              </div>
            </div>

            {/* Inclure CommentManager et DocumentManager */}
            <CommentManager ticketId={selectedTicketForDetail.id} />
            <DocumentManager ticketId={selectedTicketForDetail.id} />
          </div>
        )}
      </Modal>
    </>
  );
};

export default MesTicketsEnAttentePage;