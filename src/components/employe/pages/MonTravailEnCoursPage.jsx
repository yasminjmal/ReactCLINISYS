// src/components/employe/pages/MonTravailEnCoursPage.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FileText, Search, Tag, CalendarDays, User, Layers,
  CheckCircle, XCircle, Edit3, MessageSquare, Paperclip,
  MoreVertical, AlertTriangle // Ajout AlertTriangle pour le titre de section
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import ticketService from '../../../services/ticketService';
import Modal from '../../shared/Modal';
import CommentManager from '../../admin/Tickets/CommentManager';
import DocumentManager from '../../admin/Tickets/DocumentManager';

// Composant TicketItem compact pour la liste "Mon Travail en Cours"
const TicketItem = ({ ticket, onCloturerClick, onViewDetails, onUpdateEcheanceClick }) => {

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
    const emptyDotClass = 'bg-slate-300 dark:bg-slate-600';

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
      case 'moyenne': return 'text-blue-600 dark:text-blue-400';
      case 'basse': return 'text-green-600 dark:text-green-400';
      default: return 'text-slate-800 dark:text-slate-100';
    }
  };

  const echeance = ticket.date_echeance ? new Date(ticket.date_echeance) : null;
  let echeanceText = "Non définie";
  let echeanceStyle = "text-slate-500 dark:text-slate-400";
  let showEcheanceEditButton = true; // Par défaut, on montre le bouton modifier

  if (echeance) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = echeance.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      echeanceText = `Dépassée (${echeance.toLocaleDateString()})`;
      echeanceStyle = "text-red-500 dark:text-red-400 font-semibold";
    } else if (diffDays === 0) {
      echeanceText = `Aujourd'hui (${echeance.toLocaleDateString()})`;
      echeanceStyle = "text-orange-500 dark:text-orange-400 font-semibold";
    } else if (diffDays <= 4) { // Jusqu'à 4 jours inclus (aujourd'hui, demain, après-demain, +3, +4)
      echeanceText = `Dans ${diffDays} jours (${echeance.toLocaleDateString()})`;
      echeanceStyle = "text-yellow-600 dark:text-yellow-400 font-semibold";
    } else {
      echeanceText = `${echeance.toLocaleDateString()}`;
      echeanceStyle = "text-green-600 dark:text-green-400";
    }
  }

  // Simuler le nombre de commentaires et de documents si non fournis par l'API initialement
  const nbCommentaires = ticket.commentaires ? ticket.commentaires.length : 0;
  const nbDocuments = ticket.documents ? ticket.documents.length : 0;

  return (
    // Réduction du padding général de 'p-4' à 'p-3'
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-200 dark:border-slate-700 p-3 flex flex-col">
      {/* Section supérieure : Titre et Priorité */}
      {/* Réduction de mb-2 à mb-1 */}
      <div className="flex justify-between items-start mb-1">
        <h4 className={`text-base font-semibold truncate ${getTitleColorByPriority(ticket.priorite)}`} title={ticket.titre}>
          {ticket.titre}
        </h4>
        <div className="flex items-center space-x-1 flex-shrink-0" title={`Priorité: ${ticket.priorite}`}>
          {getPriorityDots(ticket.priorite)}
        </div>
      </div>

      {/* Informations clés (client, date traitement, échéance) */}
      {/* Réduction de mb-3 à mb-2 et space-y-1 pour un espace plus compact */}
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 space-y-0.5"> {/* Ajusté space-y- */}
        {ticket.idClient && (
          <div className="flex items-center">
            <User size={12} className="mr-1 opacity-70" /> Client: {ticket.idClient.nomComplet}
          </div>
        )}
        {ticket.debutTraitement && (
          <div className="flex items-center">
            <CalendarDays size={12} className="mr-1 opacity-70" /> Commencé le: {new Date(ticket.debutTraitement).toLocaleDateString()}
          </div>
        )}
        <div className="flex items-center">
          <CalendarDays size={12} className="mr-1 opacity-70" />
          <span className={`${echeanceStyle}`}>Échéance: {echeanceText}</span>
          {showEcheanceEditButton && (
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateEcheanceClick(ticket); }}
              className="ml-2 p-0.5 rounded-full text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700" // Réduit le padding du bouton
              title={ticket.date_echeance ? "Modifier la date d'échéance" : "Ajouter une date d'échéance"}
            >
              <Edit3 size={12} /> {/* Réduit la taille de l'icône */}
            </button>
          )}
        </div>
      </div>

      {/* Compteurs de commentaires et documents + Actions */}
      {/* Réduction du padding top de pt-3 à pt-2 */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300"> {/* Réduit space-x */}
          <button onClick={() => onViewDetails(ticket)} className="flex items-center group">
            <MessageSquare size={12} className="mr-1 text-slate-400 group-hover:text-blue-500 transition-colors" /> {/* Réduit la taille de l'icône */}
            <span>{nbCommentaires}</span><span className="ml-0.5 hidden sm:inline">Commentaires</span> {/* Ajuste ml- */}
          </button>
          <button onClick={() => onViewDetails(ticket)} className="flex items-center group">
            <Paperclip size={12} className="mr-1 text-slate-400 group-hover:text-blue-500 transition-colors" /> {/* Réduit la taille de l'icône */}
            <span>{nbDocuments}</span><span className="ml-0.5 hidden sm:inline">Documents</span> {/* Ajuste ml- */}
          </button>
        </div>

        <div className="flex items-center space-x-1"> {/* Réduit space-x */}
          <button
            onClick={() => onViewDetails(ticket)}
            className="p-1.5 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400 transition-colors" // Réduit le padding
            title="Voir les détails du ticket"
          >
            <FileText size={16} /> {/* Réduit la taille de l'icône */}
          </button>
          <button
            onClick={() => onCloturerClick(ticket.id)}
            className="p-1.5 rounded-full text-white bg-green-600 hover:bg-green-700 transition-colors" // Réduit le padding
            title="Clôturer le ticket"
          >
            <CheckCircle size={16} /> {/* Réduit la taille de l'icône */}
          </button>
        </div>
      </div>
    </div>
  );
};


const MonTravailEnCoursPage = () => {
  const { currentUser } = useAuth();
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfigProcheOuDepassee, setSortConfigProcheOuDepassee] = useState({ key: 'date_echeance', direction: 'ascending' });
  const [sortConfigStandard, setSortConfigStandard] = useState({ key: 'dateCreation', direction: 'descending' });

  const [isClotureModalOpen, setIsClotureModal] = useState(false);
  const [ticketACloturerId, setTicketACloturerId] = useState(null);
  const [isLoadingClotureModal, setIsLoadingClotureModal] = useState(false);

  const [isEcheanceModalOpen, setIsEcheanceModalOpen] = useState(false);
  const [ticketToUpdateEcheance, setTicketToUpdateEcheance] = useState(null);
  const [newEcheanceDate, setNewEcheanceDate] = useState('');
  const [isLoadingEcheanceModal, setIsLoadingEcheanceModal] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);


  const fetchTicketsEnCours = useCallback(async () => {
    if (!currentUser || !currentUser.id) {
      setLoading(false);
      setError("Utilisateur non connecté ou ID utilisateur manquant.");
      return;
    }
    try {
      setLoading(true);
      const allUserTickets = await ticketService.getTicketsByUserId(currentUser.id);
      
      const enCoursTicketsFiltered = allUserTickets.filter(ticket =>
        ticket.idUtilisateur?.id === currentUser.id &&
        ticket.statue === 'En_cours' &&
        !!ticket.debutTraitement
      );
      setAllTickets(enCoursTicketsFiltered || []);
      setError(null);
    } catch (err) {
      console.error("Échec du chargement des tickets en cours:", err);
      setError("Échec du chargement de vos tickets en cours. Veuillez réessayer plus tard.");
      setAllTickets([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTicketsEnCours();
  }, [fetchTicketsEnCours]);


  const { ticketsProchesOuDepassees, ticketsStandard } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const prochesOuDepassees = [];
    const standard = [];

    allTickets.forEach(ticket => {
      if (ticket.date_echeance) {
        const echeanceDate = new Date(ticket.date_echeance);
        echeanceDate.setHours(0, 0, 0, 0);
        const diffTime = echeanceDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 4) {
          prochesOuDepassees.push(ticket);
        } else {
          standard.push(ticket);
        }
      } else {
        standard.push(ticket);
      }
    });

    return { ticketsProchesOuDepassees: prochesOuDepassees, ticketsStandard: standard };
  }, [allTickets]);


  const handleCloturerClick = (ticketId) => {
    setTicketACloturerId(ticketId);
    setIsClotureModal(true);
  };

  const closeClotureModal = () => {
    setIsClotureModal(false);
    setTicketACloturerId(null);
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
      fetchTicketsEnCours();
      closeClotureModal();
    } catch (err) {
      console.error("DEBUG MonTravailEnCoursPage: Erreur lors de la clôture du ticket:", err);
      setError("Échec de la clôture du ticket. Veuillez réessayer.");
    } finally {
      setIsLoadingClotureModal(false);
    }
  };

  const handleUpdateEcheanceClick = (ticket) => {
    setTicketToUpdateEcheance(ticket);
    setNewEcheanceDate(ticket.date_echeance ? new Date(ticket.date_echeance).toISOString().split('T')[0] : '');
    setIsEcheanceModalOpen(true);
  };

  const closeEcheanceModal = () => {
    setIsEcheanceModalOpen(false);
    setTicketToUpdateEcheance(null);
    setNewEcheanceDate('');
  };

  const handleConfirmUpdateEcheance = async () => {
    if (!ticketToUpdateEcheance || !newEcheanceDate) return;

    setIsLoadingEcheanceModal(true);
    try {
      const payload = {
        date_echeance: new Date(newEcheanceDate).toISOString(),
      };

      await ticketService.updateTicket(ticketToUpdateEcheance.id, payload);
      fetchTicketsEnCours();
      closeEcheanceModal();
    } catch (err) {
      console.error("DEBUG MonTravailEnCoursPage: Erreur lors de la mise à jour de l'échéance:", err);
      setError("Échec de la mise à jour de l'échéance. Veuillez réessayer.");
    } finally {
      setIsLoadingEcheanceModal(false);
    }
  };

  const handleViewDetails = async (ticket) => {
    setSelectedTicketForDetail(null);
    setIsDetailModalOpen(true);
    try {
      const fullTicketDetails = await ticketService.getTicketById(ticket.id);
      setSelectedTicketForDetail(fullTicketDetails);
    } catch (err) {
      console.error("Erreur lors du chargement des détails du ticket:", err);
      setError("Impossible de charger les détails du ticket.");
      setSelectedTicketForDetail(ticket);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTicketForDetail(null);
  };


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
        
        if (['dateCreation', 'debutTraitement', 'date_echeance', 'dateCloture'].includes(sortConfig.key)) {
            valA = valA ? new Date(valA).getTime() : 0;
            valB = valB ? new Date(valB).getTime() : 0;
        } else if (sortConfig.key === 'priorite') {
            const priorityOrder = { 'haute': 3, 'moyenne': 2, 'basse': 1 };
            valA = priorityOrder[valA?.toLowerCase()] || 0;
            valB = priorityOrder[valB?.toLowerCase()] || 0;
        } else if (sortConfig.key === 'idClient') {
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

  const sortedAndFilteredProchesOuDepassees = useMemo(() => {
    const filtered = ticketsProchesOuDepassees.filter(ticket =>
      ticket.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.idClient && ticket.idClient.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return applySorting(filtered, sortConfigProcheOuDepassee);
  }, [ticketsProchesOuDepassees, searchTerm, sortConfigProcheOuDepassee]);

  const sortedAndFilteredStandard = useMemo(() => {
    const filtered = ticketsStandard.filter(ticket =>
      ticket.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.idClient && ticket.idClient.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return applySorting(filtered, sortConfigStandard);
  }, [ticketsStandard, searchTerm, sortConfigStandard]);


  if (loading) {
    return (
      <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Chargement des tickets en cours...</h2>
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

  if (allTickets.length === 0 && !searchTerm) {
    return (
      <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner">
        <FileText size={48} className="mx-auto mb-4 text-orange-500" />
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Aucun travail en cours</h2>
        <p className="text-slate-500 dark:text-slate-400">Vous n'avez actuellement aucun ticket en cours de traitement.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Barre de recherche globale */}
        {/* <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par titre, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input-icon w-full py-2.5 text-sm bg-slate-50 dark:bg-slate-900/50"
            />
          </div>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section Tickets à Surveiller (Échéances proches ou dépassées) */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
              <AlertTriangle size={24} className="mr-3 text-red-500" />
              À Surveiller ({sortedAndFilteredProchesOuDepassees.length})
            </h2>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 mb-4">
              <span>Trier par:</span>
              <button onClick={() => requestSort('date_echeance', sortConfigProcheOuDepassee, setSortConfigProcheOuDepassee)} className="font-medium hover:text-blue-500">
                Échéance {getSortIndicator('date_echeance', sortConfigProcheOuDepassee)}
              </button>
              <span>|</span>
              <button onClick={() => requestSort('priorite', sortConfigProcheOuDepassee, setSortConfigProcheOuDepassee)} className="font-medium hover:text-blue-500">
                Priorité {getSortIndicator('priorite', sortConfigProcheOuDepassee)}
              </button>
            </div>
            {/* Ajout d'une marge-bottom aux tickets pour plus de compacité dans la liste */}
            <div className="flex-grow space-y-2 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 300px)' }}> {/* Ajusté space-y */}
              {sortedAndFilteredProchesOuDepassees.length > 0 ? (
                sortedAndFilteredProchesOuDepassees.map(ticket => (
                  <TicketItem
                    key={ticket.id}
                    ticket={ticket}
                    onCloturerClick={handleCloturerClick}
                    onViewDetails={handleViewDetails}
                    onUpdateEcheanceClick={handleUpdateEcheanceClick}
                  />
                ))
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8 italic">
                  Aucun ticket urgent.
                </div>
              )}
            </div>
          </div>

          {/* Section Travail Standard en Cours */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
              <Edit3 size={24} className="mr-3 text-sky-500" />
              Travail en Cours Standard ({sortedAndFilteredStandard.length})
            </h2>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 mb-4">
              <span>Trier par:</span>
              <button onClick={() => requestSort('debutTraitement', sortConfigStandard, setSortConfigStandard)} className="font-medium hover:text-blue-500">
                Date Traitement {getSortIndicator('debutTraitement', sortConfigStandard)}
              </button>
              <span>|</span>
              <button onClick={() => requestSort('priorite', sortConfigStandard, setSortConfigStandard)} className="font-medium hover:text-blue-500">
                Priorité {getSortIndicator('priorite', sortConfigStandard)}
              </button>
              <span>|</span>
              <button onClick={() => requestSort('date_echeance', sortConfigStandard, setSortConfigStandard)} className="font-medium hover:text-blue-500">
                Échéance {getSortIndicator('date_echeance', sortConfigStandard)}
              </button>
            </div>
            {/* Ajout d'une marge-bottom aux tickets pour plus de compacité dans la liste */}
            <div className="flex-grow space-y-2 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 300px)' }}> {/* Ajusté space-y */}
              {sortedAndFilteredStandard.length > 0 ? (
                sortedAndFilteredStandard.map(ticket => (
                  <TicketItem
                    key={ticket.id}
                    ticket={ticket}
                    onCloturerClick={handleCloturerClick}
                    onViewDetails={handleViewDetails}
                    onUpdateEcheanceClick={handleUpdateEcheanceClick}
                  />
                ))
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8 italic">
                  Aucun travail standard en cours.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals : Clôture, Échéance, Détails (inchangés) */}
      <Modal
        isOpen={isClotureModalOpen}
        onClose={closeClotureModal}
        title="Confirmer la clôture"
        footerActions={
          <>
            <button onClick={closeClotureModal} className="btn btn-secondary py-2 text-sm" disabled={isLoadingClotureModal}>Annuler</button>
            <button onClick={handleConfirmCloture} className="btn btn-primary bg-green-600 hover:bg-green-700 py-2 text-sm" disabled={isLoadingClotureModal}>
              {isLoadingClotureModal ? 'Clôture...' : 'Clôturer le Ticket'}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Êtes-vous sûr de vouloir clôturer le ticket "<strong className="text-slate-700 dark:text-slate-100">{allTickets.find(t => t.id === ticketACloturerId)?.titre}</strong>" (ID: {ticketACloturerId}) ?
          <br />Son statut passera à "Terminé".
        </p>
      </Modal>

      <Modal
        isOpen={isEcheanceModalOpen}
        onClose={closeEcheanceModal}
        title={ticketToUpdateEcheance?.date_echeance ? "Modifier la date d'échéance" : "Ajouter une date d'échéance"}
        footerActions={
          <>
            <button onClick={closeEcheanceModal} className="btn btn-secondary py-2 text-sm" disabled={isLoadingEcheanceModal}>Annuler</button>
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
        onClose={closeDetailModal}
        title={`Détails du Ticket : ${selectedTicketForDetail?.titre || ''}`}
        size="lg"
        footerActions={
          <button onClick={closeDetailModal} className="btn btn-secondary py-2 text-sm">Fermer</button>
        }
      >
        {selectedTicketForDetail ? (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Informations Générales</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{selectedTicketForDetail.description || "Aucune description fournie."}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
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

            <CommentManager ticketId={selectedTicketForDetail.id} />
            <DocumentManager ticketId={selectedTicketForDetail.id} />
          </div>
        ) : (
          <div className="text-center text-slate-500 dark:text-slate-400 py-4">
            Chargement des détails du ticket...
          </div>
        )}
      </Modal>
    </>
  );
};

export default MonTravailEnCoursPage;