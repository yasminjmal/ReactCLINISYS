// src/components/employe/pages/MesTicketsEnAttentePage.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FileText, Search, Tag, CalendarDays, User, Layers, PlayCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import ticketService from '../../../services/ticketService';
import Modal from '../../shared/Modal';

// Composant TicketCard adapté (avec bouton "Commencer le traitement")
const TicketCard = ({ ticket, onStartTreatmentClick }) => {
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

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-5 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer truncate" title={ticket.titre}>
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
        </div>
      </div>
      {/* Bouton "Commencer le traitement" */}
      {/* Affiché si le ticket est en_cours MAIS n'a PAS encore de dateTraitement (donc pas encore "commencé") */}
      {ticket.statue === 'En_cours' && !ticket.dateTraitement && (
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
          <button
            onClick={() => onStartTreatmentClick(ticket)} // Passer l'objet ticket entier
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-3 rounded-md transition-colors duration-200 text-sm flex items-center justify-center space-x-2"
            title="Commencer le traitement de ce ticket"
          >
            <PlayCircle size={16} />
            <span>Commencer le traitement</span>
          </button>
        </div>
      )}
    </div>
  );
};


const MesTicketsEnAttentePage = ({ onStartTreatmentCallback }) => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]); // Tous les tickets assignés à l'utilisateur
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'dateCreation', direction: 'descending' });
  
  // États pour le modal de confirmation de traitement
  const [isStartTreatmentModalOpen, setIsStartTreatmentModalOpen] = useState(false);
  const [ticketToStartTreatment, setTicketToStartTreatment] = useState(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);


  const fetchTicketsAssignedToUser = useCallback(async () => {
    if (!currentUser || !currentUser.id) {
      setLoading(false);
      setError("Utilisateur non connecté ou ID utilisateur manquant.");
      return;
    }
    try {
      setLoading(true);
      const allUserTickets = await ticketService.getTicketsByUserId(currentUser.id);
      // Les tickets "en attente" sont ceux qui sont 'En_cours' mais n'ont pas encore de 'dateTraitement'
      const enAttenteTicketsFiltered = allUserTickets.filter(
        ticket => ticket.statue === 'En_cours' && !ticket.dateTraitement
      );
      setTickets(enAttenteTicketsFiltered || []);
      setError(null);
    } catch (err) {
      console.error("Échec du chargement des tickets en attente:", err);
      setError("Échec du chargement de vos tickets en attente. Veuillez réessayer plus tard.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // S'auto-charge au montage et si l'utilisateur change
  useEffect(() => {
    fetchTicketsAssignedToUser();
  }, [fetchTicketsAssignedToUser]);

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
      // Le payload n'inclut que dateTraitement selon la nouvelle spécification
      const payload = {
        debutTraitement: new Date().toISOString(), 
      };

      await ticketService.updateTicket(ticketToStartTreatment.id, payload);
      fetchTicketsAssignedToUser(); // Recharger les tickets pour mettre à jour la liste sur cette page
      closeStartTreatmentModal();
      // Appeler le callback pour notifier InterfaceEmploye de naviguer
      if(onStartTreatmentCallback) onStartTreatmentCallback(ticketToStartTreatment.id);
      
    } catch (err) {
      console.error("Erreur lors du démarrage du traitement:", err);
      setError("Échec du démarrage du traitement. Veuillez réessayer.");
    } finally {
      setIsLoadingModal(false);
    }
  };


  const sortedAndFilteredTickets = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    let sortableTickets = [...tickets];

    if (searchTerm) {
      sortableTickets = sortableTickets.filter(ticket =>
        ticket.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.description && ticket.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ticket.idClient && ticket.idClient.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (sortConfig.key) {
      sortableTickets.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (sortConfig.key === 'dateCreation') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
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
    return sortableTickets;
  }, [tickets, searchTerm, sortConfig]);

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

  if (tickets.length === 0 && !searchTerm) {
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
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2">
              <span>Trier par:</span>
              <button onClick={() => requestSort('dateCreation')} className="font-medium hover:text-sky-500">Date de Création {getSortIndicator('dateCreation')}</button>
              <span>|</span>
              <button onClick={() => requestSort('priorite')} className="font-medium hover:text-sky-500">Priorité {getSortIndicator('priorite')}</button>
              <span>|</span>
              <button onClick={() => requestSort('id')} className="font-medium hover:text-sky-500">Référence {getSortIndicator('id')}</button>
          </div>
        </div>

        {sortedAndFilteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedAndFilteredTickets.map(ticket => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                onStartTreatmentClick={handleStartTreatmentClick}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner">
              <Search size={48} className="mx-auto mb-4 text-yellow-500" />
              <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Aucun ticket trouvé</h2>
              <p className="text-slate-500 dark:text-slate-400">Aucun ticket ne correspond à vos critères de recherche.</p>
          </div>
        )}
      </div>

      {/* Modal pour le démarrage du traitement */}
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
          <br/>Son statut passera à "En cours".
        </p>
      </Modal>
    </>
  );
};

export default MesTicketsEnAttentePage;