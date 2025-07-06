// src/components/employe/pages/MesTicketsResolusPage.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FileText, Search, Tag, CalendarDays, User, CheckCircle, XCircle, MessageSquare, Paperclip, ChevronLeft, ChevronRight, PlayCircle,
  Printer, Download, Filter // Maintenu l'icône Filter pour le bouton des 3 barres
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import ticketService from '../../../services/ticketService';
import Modal from '../../shared/Modal';
import CommentManager from '../../admin/Tickets/CommentManager';
import DocumentManager from '../../admin/Tickets/DocumentManager';

// --- Composant Helper pour les points de priorité (Réutilisé) ---
const PriorityDots = ({ priority }) => {
  let colorClass = '';
  let dotCount = 0;
  switch (priority?.toLowerCase()) {
    case 'haute':
      colorClass = 'bg-red-500';
      dotCount = 3;
      break;
    case 'moyenne':
      colorClass = 'bg-blue-500';
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
    <div className="flex space-x-0.5" title={`Priorité: ${priority}`}>
      {[...Array(3)].map((_, i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < dotCount ? colorClass : emptyDotClass}`}></span>
      ))}
    </div>
  );
};

// --- Composant TicketItem compact et très dense pour la liste paginée ---
const TicketItem = ({ ticket, onViewDetails }) => {

  const getTitleColorByPriority = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'haute': return 'text-red-600 dark:text-red-400';
      case 'moyenne': return 'text-blue-600 dark:text-blue-400';
      case 'basse': return 'text-green-600 dark:text-green-400';
      default: return 'text-slate-800 dark:text-slate-100';
    }
  };

  const nbCommentaires = ticket.commentaires ? ticket.commentaires.length : 0;
  const nbDocuments = ticket.documents ? ticket.documents.length : 0;

  // Texte d'échéance simplifié pour la densité
  const echeanceText = ticket.date_echeance ? new Date(ticket.date_echeance).toLocaleDateString() : 'N/A';

  return (
    // Structure de ligne très compacte, sans ombres ni bordures de carte évidentes
    <div className="flex items-center justify-between py-2 px-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      
      {/* Colonne 1: Client */}
      <div className="flex-shrink-0 w-32 mr-4">
        {ticket.idClient && (
          <span className="flex items-center text-xs text-slate-500 dark:text-slate-400 truncate" title={ticket.idClient.nomComplet}>
            <User size={10} className="mr-1 opacity-70" /> {ticket.idClient.nomComplet}
          </span>
        )}
      </div>

      {/* Colonne 2: Titre du Ticket */}
      <div className="flex-1 min-w-[150px] max-w-[250px] flex-shrink-0 mr-4">
        <h4 className={`text-sm font-medium truncate ${getTitleColorByPriority(ticket.priorite)}`} title={ticket.titre}>
          {ticket.titre}
        </h4>
      </div>

      {/* Colonnes 3: Priorité */}
      <div className="flex-shrink-0 w-12 text-center mr-4">
        <PriorityDots priority={ticket.priorite} />
      </div>

      {/* Colonnes 4: Dates (Création, Début Traitement, Échéance, Clôture) */}
      <div className="flex-shrink-0 flex items-center text-xs text-slate-500 dark:text-slate-400 gap-x-2 w-[340px]">
        {/* Date de Création */}
        <span title="Date de Création" className="flex items-center whitespace-nowrap">
          <CalendarDays size={10} className="mr-0.5 opacity-70" /> C: {ticket.dateCreation ? new Date(ticket.dateCreation).toLocaleDateString() : 'N/A'}
        </span>
        {/* Date de Début Traitement */}
        <span title="Début Traitement" className="flex items-center whitespace-nowrap">
          <PlayCircle size={10} className="mr-0.5 opacity-70" /> D: {ticket.debutTraitement ? new Date(ticket.debutTraitement).toLocaleDateString() : 'N/A'}
        </span>
        {/* Date d'Échéance */}
        <span title="Date d'Échéance" className="flex items-center whitespace-nowrap">
          <CalendarDays size={10} className="mr-0.5 opacity-70" /> Éch: {echeanceText}
        </span>
        {/* Date de Clôture */}
        <span title="Date de Clôture" className="flex items-center whitespace-nowrap">
          <CheckCircle size={10} className="mr-0.5 opacity-70 text-green-500" /> Cl: {ticket.dateCloture ? new Date(ticket.dateCloture).toLocaleDateString() : 'N/A'}
        </span>
      </div>

      {/* Colonnes 5 et 6: Compteurs et Action */}
      <div className="flex-shrink-0 flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300 ml-4 mr-4">
        <div className="flex items-center">
          <MessageSquare size={10} className="mr-0.5 text-slate-400" /> {nbCommentaires}
        </div>
        <div className="flex items-center">
          <Paperclip size={10} className="mr-0.5 text-slate-400" /> {nbDocuments}
        </div>
      </div>

      {/* Colonnes 7: Action */}
      <div className="flex-shrink-0">
        <button
          onClick={() => onViewDetails(ticket)}
          className="p-1 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400 transition-colors"
          title="Voir les détails du ticket"
        >
          <FileText size={14} />
        </button>
      </div>
    </div>
  );
};


const MesTicketsResolusPage = () => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Terme de recherche unique pour tout
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'dateCloture', direction: 'descending' });
  const [filterPriority, setFilterPriority] = useState('all'); // 'all', 'haute', 'moyenne', 'basse'
  // filterClient est supprimé

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10); // 10 tickets par page

  const fetchTicketsResolus = useCallback(async () => {
    if (!currentUser || !currentUser.id) {
      setLoading(false);
      setError("Utilisateur non connecté ou ID utilisateur manquant.");
      return;
    }
    try {
      setLoading(true);
      const allUserTickets = await ticketService.getTicketsByUserId(currentUser.id);
      const resolusTickets = allUserTickets.filter(ticket =>
        ticket.idUtilisateur?.id === currentUser.id &&
        ticket.statue === 'Termine'
      );
      setTickets(resolusTickets || []);
      setError(null);
    } catch (err) {
      console.error("Échec du chargement des tickets résolus:", err);
      setError("Échec du chargement de vos tickets résolus. Veuillez réessayer plus tard.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTicketsResolus();
  }, [fetchTicketsResolus]);

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

  const sortedAndFilteredTickets = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    let processedTickets = [...tickets];

    // La recherche principale inclut titre, description, client
    if (searchTerm) {
      processedTickets = processedTickets.filter(ticket =>
        ticket.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.description && ticket.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ticket.idClient && ticket.idClient.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterPriority !== 'all') {
      processedTickets = processedTickets.filter(ticket =>
        ticket.priorite?.toLowerCase() === filterPriority
      );
    }

    // Appliquer le tri
    if (sortConfig.key) {
      processedTickets.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (['dateCloture', 'dateCreation', 'debutTraitement', 'date_echeance'].includes(sortConfig.key)) {
            valA = valA ? new Date(valA).getTime() : 0;
            valB = valB ? new Date(valB).getTime() : 0;
        }
        if (sortConfig.key === 'priorite') {
            const priorityOrder = { 'haute': 3, 'moyenne': 2, 'basse': 1 };
            valA = priorityOrder[valA?.toLowerCase()] || 0;
            valB = priorityOrder[valB?.toLowerCase()] || 0;
        }
        if (sortConfig.key === 'idClient') {
          valA = a.idClient?.nomComplet?.toLowerCase() || '';
          valB = b.idClient?.nomComplet?.toLowerCase() || '';
        }
        if (sortConfig.key === 'titre') {
          valA = valA?.toLowerCase() || '';
          valB = valB?.toLowerCase() || '';
        }

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return processedTickets;
  }, [tickets, searchTerm, filterPriority, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? '▲' : '▼';
    }
    return '';
  };

  // Logique de pagination
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = sortedAndFilteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(sortedAndFilteredTickets.length / ticketsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handlers pour les filtres
  const handlePriorityFilterChange = (priority) => {
    setFilterPriority(priority);
    setCurrentPage(1); // Réinitialiser la page à 1 lors du changement de filtre
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Chargement des tickets résolus...</h2>
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

  if (tickets.length === 0 && !searchTerm && filterPriority === 'all') {
    return (
      <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner">
        <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Aucun ticket résolu</h2>
        <p className="text-slate-500 dark:text-slate-400">Vous n'avez actuellement aucun ticket résolu.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Nouvelle Barre de contrôles simplifiée et alignée */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
          <div className="flex flex-wrap items-center gap-3">
            {/* Zone de recherche globale */}
            <div className="relative flex-grow min-w-[250px] max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" /> {/* Icône réglée */}
              </div>
              <input
                type="text"
                placeholder="Rechercher tout..."
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            {/* Bouton de filtre général (les 3 barres) - CONSERVÉ */}
            <button
                onClick={() => { /* Logique pour ouvrir un menu de filtres avancés si nécessaire */ alert("Filtre avancé à implémenter"); }}
                className="p-2.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Autres filtres"
            >
                <Filter size={20} />
            </button>

            {/* Filtre par Priorité (Menu déroulant stylisé) - CONSERVÉ */}
            <div className="relative">
                <select
                    value={filterPriority}
                    onChange={(e) => handlePriorityFilterChange(e.target.value)}
                    className="appearance-none block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-8 cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em' }}
                >
                    <option value="all">Priorité: Tout</option>
                    <option value="haute">Haute</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="basse">Basse</option>
                </select>
            </div>
            
            {/* Supprimé : Filtre par Client */}
            {/*
            <div className="relative flex-grow min-w-[150px] max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Filtrer par client..."
                value={filterClient}
                onChange={handleClientFilterChange}
                className="form-input-icon w-full py-2.5 text-sm bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
            */}
            
            {/* Tri par Date de Clôture - CONSERVÉ */}
            <button onClick={() => requestSort('dateCloture')} className="px-4 py-2.5 rounded-md text-sm font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center">
              Clôturé le {getSortIndicator('dateCloture')}
            </button>

            {/* Boutons d'action (Imprimer, Exporter) - CONSERVÉS */}
            <button
                onClick={() => alert("Fonctionnalité d'impression à implémenter")}
                className="p-2.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Imprimer la liste"
            >
                <Printer size={20} />
            </button>
            <button
                onClick={() => alert("Fonctionnalité d'export à implémenter (Excel/PDF)")}
                className="p-2.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Exporter la liste (Excel/PDF)"
            >
                <Download size={20} />
            </button>
          </div>
        </div>

        {/* Suppression des en-têtes de colonnes visuels - C'EST FAIT ICI */}
        {/* Ancien bloc d'en-têtes commenté/supprimé :
        <div className="hidden md:flex items-center py-2 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
          <div className="flex-shrink-0 w-32 mr-4">
            <button onClick={() => requestSort('idClient')} className="font-medium hover:text-blue-500">
              Client {getSortIndicator('idClient')}
            </button>
          </div>
          <div className="flex-1 min-w-[150px] max-w-[250px] flex-shrink-0 mr-4">
            <button onClick={() => requestSort('titre')} className="font-medium hover:text-blue-500">
              Titre {getSortIndicator('titre')}
            </button>
          </div>
          <div className="flex-shrink-0 w-12 text-center mr-4">
            <button onClick={() => requestSort('priorite')} className="font-medium hover:text-blue-500">
              Priorité {getSortIndicator('priorite')}
            </button>
          </div>
          <div className="flex-shrink-0 w-[340px] text-left">
            Dates
          </div>
          <div className="flex-shrink-0 flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300 ml-4 mr-4">
              Compteurs
          </div>
          <div className="flex-shrink-0 text-center">
              Actions
          </div>
        </div>
        */}
        
        {/* Conteneur de la liste des tickets résolus (format "ligne" paginé) */}
        {currentTickets.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
            {currentTickets.map(ticket => (
              <TicketItem
                key={ticket.id}
                ticket={ticket}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner">
            {searchTerm || filterPriority !== 'all' ? (
                <>
                    <Search size={48} className="mx-auto mb-4 text-yellow-500" />
                    <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Aucun ticket trouvé</h2>
                    <p className="text-slate-500 dark:text-slate-400">Aucun ticket ne correspond à vos critères de recherche ou filtres.</p>
                </>
            ) : (
                <>
                    <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                    <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Aucun ticket résolu</h2>
                    <p className="text-slate-500 dark:text-slate-400">Vous n'avez actuellement aucun ticket résolu.</p>
                </>
            )}
          </div>
        )}

        {/* Contrôles de pagination */}
        {totalPages > 1 && (
          <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
          />
        )}
      </div>

      {/* Modal de détails du ticket (inchangé) */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        title={`Détails du Ticket : ${selectedTicketForDetail?.titre || ''}`}
        size="lg"
        footerActions={
          <button onClick={closeDetailModal} className="btn btn-secondary py-2 text-sm">
            Fermer
          </button>
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
                {selectedTicketForDetail.debutTraitement && <p><strong>Traitement commencé le:</strong> {new Date(selectedTicketForHandler).toLocaleDateString()}</p>}
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

// Composant de contrôle de pagination réutilisable
const PaginationControls = ({ currentPage, totalPages, paginate }) => {
    return (
        <nav className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 sm:px-6 rounded-lg shadow mt-4">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
              >
                <ChevronLeft size={16} className="mr-2" /> Précédent
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
              >
                Suivant <ChevronRight size={16} className="ml-2" />
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
                  >
                    <span className="sr-only">Précédent</span>
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      aria-current={currentPage === i + 1 ? 'page' : undefined}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1 ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
                  >
                    <span className="sr-only">Suivant</span>
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </nav>
    );
};
export default MesTicketsResolusPage;