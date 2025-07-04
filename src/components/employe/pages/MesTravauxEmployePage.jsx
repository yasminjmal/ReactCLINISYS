// src/components/employe/pages/MesTravauxEmployePage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FileText, Search, Tag, CalendarDays, User, Layers, PlayCircle, CheckCircle, Edit3, XCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import ticketService from '../../../services/ticketService';
import Modal from '../../shared/Modal';
import CommentManager from '../../admin/Tickets/CommentManager';
import DocumentManager from '../../admin/Tickets/DocumentManager';

// Composant TicketCard réutilisable pour les deux listes
// Les boutons d'action seront rendus conditionnellement en fonction du type de liste
const TicketCard = ({ ticket, type, onStartTreatmentClick, onCloturerClick, onViewDetails, onUpdateEcheanceClick }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'haute': return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-400 border-red-300 dark:border-red-600';
      case 'moyenne': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-600';
      case 'basse': return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-400 border-green-300 dark:border-green-600';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-400 border-slate-300 dark:border-slate-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'en_attente': return 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-400';
      case 'en_cours': return 'bg-orange-100 text-orange-700 dark:bg-orange-700/30 dark:text-orange-400';
      case 'termine': return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-400';
      case 'refuse': return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-400';
    }
  };

  const echeance = ticket.date_echeance ? new Date(ticket.date_echeance) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Pour comparer uniquement les dates
  let echeanceStatusText = "Non définie";
  let echeanceStyle = "text-slate-500 dark:text-slate-400";

  if (echeance) {
    const diffTime = echeance.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      echeanceStatusText = `En retard (${echeance.toLocaleDateString()})`;
      echeanceStyle = "text-red-500 dark:text-red-400 font-semibold";
    } else if (diffDays === 0) {
      echeanceStatusText = `Aujourd'hui (${echeance.toLocaleDateString()})`;
      echeanceStyle = "text-orange-500 dark:text-orange-400 font-semibold";
    } else if (diffDays <= 3) {
      echeanceStatusText = `Dans ${diffDays} jours (${echeance.toLocaleDateString()})`;
      echeanceStyle = "text-yellow-600 dark:text-yellow-400 font-semibold";
    } else {
      echeanceStatusText = echeance.toLocaleDateString();
      echeanceStyle = "text-green-600 dark:text-green-400";
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-5 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
      <div onClick={() => onViewDetails(ticket)} className="cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-sky-600 dark:text-sky-400 hover:underline truncate" title={ticket.titre}>
            {ticket.titre}
          </h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${getPriorityColor(ticket.priorite)}`}>
            {ticket.priorite}
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 h-12 overflow-hidden text-ellipsis" title={ticket.description}>
          {ticket.description || "Aucune description fournie."}
        </p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center" title="Référence du ticket">
            <Tag size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" /> Réf: {ticket.id}
          </div>
          <div className="flex items-center" title="Date de Création">
            <CalendarDays size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" />
            Créé le: {new Date(ticket.dateCreation).toLocaleDateString()}
          </div>
          {ticket.idClient && (
            <div className="flex items-center col-span-2 truncate" title={`Client: ${ticket.idClient.nomComplet}`}>
              <User size={14} className="mr-1.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="truncate">Client: {ticket.idClient.nomComplet}</span>
            </div>
          )}
          {ticket.idModule && (
            <div className="flex items-center col-span-2 truncate" title={`Module: ${ticket.idModule.designation}`}>
              <Layers size={14} className="mr-1.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="truncate">Module: {ticket.idModule.designation}</span>
            </div>
          )}
          <div className="flex items-center col-span-2 truncate" title={`Statut: ${ticket.statue}`}>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(ticket.statue)}`}>
              Statut: {ticket.statue?.replace(/_/g, ' ')}
            </span>
          </div>
          {type === 'en_cours' && ticket.dateTraitement && (
            <div className="flex items-center col-span-2 truncate" title={`Date de Traitement: ${new Date(ticket.dateTraitement).toLocaleDateString()}`}>
              <CalendarDays size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" />
              Traitement commencé le: {new Date(ticket.dateTraitement).toLocaleDateString()}
            </div>
          )}
          {type === 'en_cours' && (
            <div className="flex items-center col-span-2 truncate">
              <CalendarDays size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" />
              <span className={`${echeanceStyle}`}>Échéance: {echeanceStatusText}</span>
              <button
                  onClick={(e) => { e.stopPropagation(); onUpdateEcheanceClick(ticket); }}
                  className="ml-2 p-1 rounded-full text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title={ticket.date_echeance ? "Modifier la date d'échéance" : "Ajouter une date d'échéance"}
              >
                  <Edit3 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
        {type === 'en_attente' && ticket.statue === 'En_cours' && !ticket.dateTraitement && (
          <button
            onClick={() => onStartTreatmentClick(ticket)}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-3 rounded-md transition-colors duration-200 text-sm flex items-center justify-center space-x-2"
            title="Commencer le traitement de ce ticket"
          >
            <PlayCircle size={16} />
            <span>Commencer le traitement</span>
          </button>
        )}
        {type === 'en_cours' && (
          <button
            onClick={() => onCloturerClick(ticket.id)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-md transition-colors duration-200 text-sm flex items-center justify-center space-x-2"
            title="Clôturer ce ticket"
          >
            <CheckCircle size={16} />
            <span>Clôturer le ticket</span>
          </button>
        )}
      </div>
    </div>
  );
};


const MesTravauxEmployePage = () => {
  const { currentUser } = useAuth();
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfigEnAttente, setSortConfigEnAttente] = useState({ key: 'dateCreation', direction: 'descending' });
  const [sortConfigEnCours, setSortConfigEnCours] = useState({ key: 'dateTraitement', direction: 'descending' });

  // États pour les modales
  const [isStartTreatmentModalOpen, setIsStartTreatmentModalOpen] = useState(false);
  const [ticketToStartTreatment, setTicketToStartTreatment] = useState(null);
  const [isLoadingStartTreatmentModal, setIsLoadingStartTreatmentModal] = useState(false);

  const [isClotureModalOpen, setIsClotureModal] = useState(false);
  const [ticketACloturerId, setTicketACloturerId] = useState(null);
  const [isLoadingClotureModal, setIsLoadingClotureModal] = useState(false);

  const [isEcheanceModalOpen, setIsEcheanceModalOpen] = useState(false);
  const [ticketToUpdateEcheance, setTicketToUpdateEcheance] = useState(null);
  const [newEcheanceDate, setNewEcheanceDate] = useState('');
  const [isLoadingEcheanceModal, setIsLoadingEcheanceModal] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);


  const fetchAllUserTickets = useCallback(async () => {
    if (!currentUser || !currentUser.id) {
      setLoading(false);
      setError("Utilisateur non connecté ou ID utilisateur manquant.");
      return;
    }
    try {
      setLoading(true);
      const data = await ticketService.getTicketsByUserId(currentUser.id);
      setAllTickets(data || []);
      setError(null);
    } catch (err) {
      console.error("Échec du chargement des tickets de l'utilisateur:", err);
      setError("Échec du chargement de vos tickets. Veuillez réessayer plus tard.");
      setAllTickets([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAllUserTickets();
  }, [fetchAllUserTickets]);


  // Logique de filtrage des tickets
  const ticketsEnAttente = useMemo(() => {
    return allTickets.filter(ticket =>
      ticket.statue === 'En_cours' && !ticket.dateTraitement && ticket.idUtilisateur?.id === currentUser?.id
    );
  }, [allTickets, currentUser]);

  const ticketsEnCours = useMemo(() => {
    return allTickets.filter(ticket =>
      ticket.statue === 'En_cours' && !!ticket.dateTraitement && ticket.idUtilisateur?.id === currentUser?.id
    );
  }, [allTickets, currentUser]);


  // --- Handlers pour les actions des tickets ---

  const handleStartTreatmentClick = (ticket) => {
    setTicketToStartTreatment(ticket);
    setIsStartTreatmentModalOpen(true);
  };

  const handleConfirmStartTreatment = async () => {
    if (!ticketToStartTreatment) return;
    setIsLoadingStartTreatmentModal(true);
    try {
      const payload = { dateTraitement: new Date().toISOString() };
      await ticketService.updateTicket(ticketToStartTreatment.id, payload);
      await fetchAllUserTickets(); // Recharger toutes les données pour mettre à jour les deux listes
      setIsStartTreatmentModalOpen(false);
      setTicketToStartTreatment(null);
    } catch (err) {
      console.error("Erreur lors du démarrage du traitement:", err);
      setError("Échec du démarrage du traitement.");
    } finally {
      setIsLoadingStartTreatmentModal(false);
    }
  };

  const handleCloturerClick = (ticketId) => {
    setTicketACloturerId(ticketId);
    setIsClotureModal(true);
  };

  const handleConfirmCloture = async () => {
    if (!ticketACloturerId) return;
    setIsLoadingClotureModal(true);
    try {
      const payload = {
        statue: 'Termine',
        dateCloture: new Date().toISOString(),
      };
      await ticketService.updateTicket(ticketACloturerId, payload);
      await fetchAllUserTickets(); // Recharger toutes les données pour mettre à jour les listes
      setIsClotureModal(false);
      setTicketACloturerId(null);
    } catch (err) {
      console.error("Erreur lors de la clôture du ticket:", err);
      setError("Échec de la clôture du ticket.");
    } finally {
      setIsLoadingClotureModal(false);
    }
  };

  const handleUpdateEcheanceClick = (ticket) => {
    setTicketToUpdateEcheance(ticket);
    setNewEcheanceDate(ticket.date_echeance ? new Date(ticket.date_echeance).toISOString().split('T')[0] : '');
    setIsEcheanceModalOpen(true);
  };

  const handleConfirmUpdateEcheance = async () => {
    if (!ticketToUpdateEcheance || !newEcheanceDate) return;
    setIsLoadingEcheanceModal(true);
    try {
      const payload = { date_echeance: new Date(newEcheanceDate).toISOString() };
      await ticketService.updateTicket(ticketToUpdateEcheance.id, payload);
      await fetchAllUserTickets(); // Recharger toutes les données pour mettre à jour les listes
      setIsEcheanceModalOpen(false);
      setTicketToUpdateEcheance(null);
      setNewEcheanceDate('');
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'échéance:", err);
      setError("Échec de la mise à jour de l'échéance.");
    } finally {
      setIsLoadingEcheanceModal(false);
    }
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicketForDetail(ticket);
    setIsDetailModalOpen(true);
  };

  const closeAllModals = () => {
    setIsStartTreatmentModalOpen(false);
    setIsClotureModal(false);
    setIsEcheanceModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedTicketForDetail(null);
    setTicketToStartTreatment(null);
    setTicketACloturerId(null);
    setTicketToUpdateEcheance(null);
    setNewEcheanceDate('');
    // Recharger toutes les données après la fermeture de n'importe quel modal pour s'assurer de la fraîcheur
    // (Utile si des commentaires/documents ont été ajoutés/modifiés dans le détail modal)
    fetchAllUserTickets(); 
  };


  // --- Fonctions de tri et de recherche ---
  const requestSort = (key, currentSortConfig, setSortConfig) => {
    let direction = 'ascending';
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
        if (['dateCreation', 'dateTraitement', 'date_echeance', 'dateCloture'].includes(sortConfig.key)) {
            valA = valA ? new Date(valA).getTime() : 0;
            valB = valB ? new Date(valB).getTime() : 0;
        }
        if (sortConfig.key === 'priorite') {
            const priorityOrder = { 'haute': 3, 'moyenne': 2, 'basse': 1 };
            valA = priorityOrder[valA?.toLowerCase()] || 0;
            valB = priorityOrder[valB?.toLowerCase()] || 0;
        }

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableList;
  };

  const sortedAndFilteredEnAttenteTickets = useMemo(() => {
    const filtered = ticketsEnAttente.filter(ticket =>
      ticket.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.description && ticket.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.idClient && ticket.idClient.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return applySorting(filtered, sortConfigEnAttente);
  }, [ticketsEnAttente, searchTerm, sortConfigEnAttente]);

  const sortedAndFilteredEnCoursTickets = useMemo(() => {
    const filtered = ticketsEnCours.filter(ticket =>
      ticket.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.description && ticket.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.idClient && ticket.idClient.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return applySorting(filtered, sortConfigEnCours);
  }, [ticketsEnCours, searchTerm, sortConfigEnCours]);


  if (loading) {
    return (
      <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Chargement de vos travaux...</h2>
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

  return (
    <>
      <div className="space-y-6">
        {/* Barre de recherche et tri globale */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par titre, réf, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input-icon w-full py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section Tickets en Attente */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
                <FileText size={24} className="mr-3 text-sky-500"/>
                Tickets en Attente ({sortedAndFilteredEnAttenteTickets.length})
            </h2>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2 mb-4">
                <span>Trier par:</span>
                <button onClick={() => requestSort('dateCreation', sortConfigEnAttente, setSortConfigEnAttente)} className="font-medium hover:text-sky-500">Date de Création {getSortIndicator('dateCreation', sortConfigEnAttente)}</button>
                <span>|</span>
                <button onClick={() => requestSort('priorite', sortConfigEnAttente, setSortConfigEnAttente)} className="font-medium hover:text-sky-500">Priorité {getSortIndicator('priorite', sortConfigEnAttente)}</button>
                <span>|</span>
                <button onClick={() => requestSort('id', sortConfigEnAttente, setSortConfigEnAttente)} className="font-medium hover:text-sky-500">Référence {getSortIndicator('id', sortConfigEnAttente)}</button>
            </div>
            <div className="flex-grow space-y-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 300px)' }}> {/* Ajustez la hauteur max */}
              {sortedAndFilteredEnAttenteTickets.length > 0 ? (
                sortedAndFilteredEnAttenteTickets.map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    type="en_attente"
                    onStartTreatmentClick={handleStartTreatmentClick}
                    onViewDetails={handleViewDetails} // Même si pas d'action, on peut voir les détails
                  />
                ))
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                  Aucun ticket en attente.
                </div>
              )}
            </div>
          </div>

          {/* Section Mon Travail en Cours */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
                <Edit3 size={24} className="mr-3 text-orange-500"/>
                Mon Travail en Cours ({sortedAndFilteredEnCoursTickets.length})
            </h2>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2 mb-4">
                <span>Trier par:</span>
                <button onClick={() => requestSort('dateTraitement', sortConfigEnCours, setSortConfigEnCours)} className="font-medium hover:text-sky-500">Date de Traitement {getSortIndicator('dateTraitement', sortConfigEnCours)}</button>
                <span>|</span>
                <button onClick={() => requestSort('priorite', sortConfigEnCours, setSortConfigEnCours)} className="font-medium hover:text-sky-500">Priorité {getSortIndicator('priorite', sortConfigEnCours)}</button>
                <span>|</span>
                <button onClick={() => requestSort('date_echeance', sortConfigEnCours, setSortConfigEnCours)} className="font-medium hover:text-sky-500">Échéance {getSortIndicator('date_echeance', sortConfigEnCours)}</button>
                <span>|</span>
                <button onClick={() => requestSort('id', sortConfigEnCours, setSortConfigEnCours)} className="font-medium hover:text-sky-500">Référence {getSortIndicator('id', sortConfigEnCours)}</button>
            </div>
            <div className="flex-grow space-y-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 300px)' }}> {/* Ajustez la hauteur max */}
              {sortedAndFilteredEnCoursTickets.length > 0 ? (
                sortedAndFilteredEnCoursTickets.map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    type="en_cours"
                    onCloturerClick={handleCloturerClick}
                    onViewDetails={handleViewDetails}
                    onUpdateEcheanceClick={handleUpdateEcheanceClick}
                  />
                ))
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                  Aucun travail en cours.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals partagés */}
      <Modal
        isOpen={isStartTreatmentModalOpen}
        onClose={closeAllModals}
        title="Confirmer le démarrage du traitement"
        footerActions={
          <>
            <button onClick={closeAllModals} className="btn btn-secondary py-2 text-sm" disabled={isLoadingStartTreatmentModal}>Annuler</button>
            <button onClick={handleConfirmStartTreatment} className="btn btn-primary bg-sky-600 hover:bg-sky-700 py-2 text-sm" disabled={isLoadingStartTreatmentModal}>
              {isLoadingStartTreatmentModal ? 'Démarrage...' : 'Confirmer le Démarrage'}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Êtes-vous sûr de vouloir commencer le traitement du ticket : <strong className="text-slate-700 dark:text-slate-100">{ticketToStartTreatment?.titre}</strong> (ID: {ticketToStartTreatment?.id}) ?
          <br/>Son statut restera "En cours" et sa date de traitement sera enregistrée.
        </p>
      </Modal>

      <Modal
        isOpen={isClotureModalOpen}
        onClose={closeAllModals}
        title="Confirmer la clôture"
        footerActions={
          <>
            <button onClick={closeAllModals} className="btn btn-secondary py-2 text-sm" disabled={isLoadingClotureModal}>Annuler</button>
            <button onClick={handleConfirmCloture} className="btn btn-primary bg-green-600 hover:bg-green-700 py-2 text-sm" disabled={isLoadingClotureModal}>
              {isLoadingClotureModal ? 'Clôture...' : 'Clôturer le Ticket'}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Êtes-vous sûr de vouloir clôturer le ticket "<strong className="text-slate-700 dark:text-slate-100">{allTickets.find(t => t.id === ticketACloturerId)?.titre}</strong>" (ID: {ticketACloturerId}) ?
          <br/>Son statut passera à "Terminé".
        </p>
      </Modal>

      <Modal
        isOpen={isEcheanceModalOpen}
        onClose={closeAllModals}
        title={ticketToUpdateEcheance?.date_echeance ? "Modifier la date d'échéance" : "Ajouter une date d'échéance"}
        footerActions={
          <>
            <button onClick={closeAllModals} className="btn btn-secondary py-2 text-sm" disabled={isLoadingEcheanceModal}>Annuler</button>
            <button onClick={handleConfirmUpdateEcheance} className="btn btn-primary bg-sky-600 hover:bg-sky-700 py-2 text-sm" disabled={isLoadingEcheanceModal}>
              {isLoadingEcheanceModal ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Ticket: <strong>{ticketToUpdateEcheance?.titre}</strong> (ID: {ticketToUpdateEcheance?.id})
        </p>
        <label htmlFor="echeance-date" className="form-label">Nouvelle date d'échéance</label>
        <input
          type="date"
          id="echeance-date"
          value={newEcheanceDate}
          onChange={(e) => setNewEcheanceDate(e.target.value)}
          className="form-input w-full text-sm p-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
        />
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeAllModals}
        title={`Détails du Ticket : ${selectedTicketForDetail?.titre || ''}`}
        size="lg"
        footerActions={
          <button onClick={closeAllModals} className="btn btn-secondary py-2 text-sm">Fermer</button>
        }
      >
        {selectedTicketForDetail && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Description</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{selectedTicketForDetail.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                <p><strong>Référence:</strong> {selectedTicketForDetail.id}</p>
                <p><strong>Priorité:</strong> {selectedTicketForDetail.priorite}</p>
                <p><strong>Statut:</strong> {selectedTicketForDetail.statue?.replace(/_/g, ' ')}</p>
                <p><strong>Créé le:</strong> {new Date(selectedTicketForDetail.dateCreation).toLocaleDateString()}</p>
                {selectedTicketForDetail.dateTraitement && <p><strong>Traitement commencé le:</strong> {new Date(selectedTicketForDetail.dateTraitement).toLocaleDateString()}</p>}
                {selectedTicketForDetail.date_echeance && <p><strong>Échéance:</strong> {new Date(selectedTicketForDetail.date_echeance).toLocaleDateString()}</p>}
                {selectedTicketForDetail.idClient && <p><strong>Client:</strong> {selectedTicketForDetail.idClient.nomComplet}</p>}
                {selectedTicketForDetail.idModule && <p><strong>Module:</strong> {selectedTicketForDetail.idModule.designation}</p>}
              </div>
            </div>
            <CommentManager ticketId={selectedTicketForDetail.id} />
            <DocumentManager ticketId={selectedTicketForDetail.id} />
          </div>
        )}
      </Modal>
    </>
  );
};

export default MesTravauxEmployePage;