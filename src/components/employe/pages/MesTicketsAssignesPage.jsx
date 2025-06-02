// src/components/employe/pages/MesTicketsAssignesPage.jsx
import React, { useState, useMemo } from 'react';
import { FileText, Search, ArrowUpDown, ChevronDown, Tag, CalendarDays, User, Layers, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../../shared/Modal'; // Importer le composant Modal

// Composant TicketCard
const TicketCard = ({ ticket, onAccepter, onRefuserClick }) => { // onRefuser renommé en onRefuserClick pour ouvrir le modal
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'haute': return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-400 border-red-300 dark:border-red-600';
      case 'moyenne': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-600';
      case 'basse': return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-400 border-green-300 dark:border-green-600';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-400 border-slate-300 dark:border-slate-600';
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
          <div className="flex items-center" title="Date d'assignation">
            <CalendarDays size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" /> 
            Assigné le: {new Date(ticket.dateAssignationEmploye).toLocaleDateString()}
          </div>
          {ticket.demandeur && (
            <div className="flex items-center col-span-2 truncate" title={`Demandeur: ${ticket.demandeur.prenom} ${ticket.demandeur.nom}`}>
              <User size={14} className="mr-1.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="truncate">Demandeur: {ticket.demandeur.prenom} {ticket.demandeur.nom} ({ticket.demandeur.service})</span>
            </div>
          )}
           {ticket.moduleConcerne && (
            <div className="flex items-center col-span-2 truncate" title={`Module: ${ticket.moduleConcerne}`}>
              <Layers size={14} className="mr-1.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="truncate">Module: {ticket.moduleConcerne}</span>
            </div>
          )}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onAccepter(ticket.id)}
          className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-3 rounded-md transition-colors duration-200 text-sm flex items-center justify-center space-x-2"
          title="Accepter ce ticket et commencer le traitement"
        >
          <CheckCircle size={16} />
          <span>Accepter</span>
        </button>
        <button
          onClick={() => onRefuserClick(ticket.id)} // Appelle la fonction pour ouvrir le modal
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md transition-colors duration-200 text-sm flex items-center justify-center space-x-2"
          title="Refuser ce ticket"
        >
          <XCircle size={16} />
          <span>Refuser</span>
        </button>
      </div>
    </div>
  );
};


const MesTicketsAssignesPage = ({ ticketsAttribues, onAccepterTicket, onRefuserTicket }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'dateAssignationEmploye', direction: 'descending' });
  
  // États pour le modal de refus
  const [isRefusModalOpen, setIsRefusModalOpen] = useState(false);
  const [ticketARefuserId, setTicketARefuserId] = useState(null);
  const [motifRefus, setMotifRefus] = useState('');
  const [isLoadingModal, setIsLoadingModal] = useState(false);


  const handleRefuserClickModal = (ticketId) => {
    setTicketARefuserId(ticketId);
    setMotifRefus(''); // Réinitialiser le motif
    setIsRefusModalOpen(true);
  };

  const closeRefusModal = () => {
    setIsRefusModalOpen(false);
    setTicketARefuserId(null);
  };

  const handleConfirmRefus = () => {
    if (!motifRefus.trim()) {
      alert("Veuillez spécifier un motif pour le refus."); // Remplacer par une notification plus tard si souhaité
      return;
    }
    setIsLoadingModal(true);
    // Simuler un délai pour l'appel API
    setTimeout(() => {
      onRefuserTicket(ticketARefuserId, motifRefus);
      setIsLoadingModal(false);
      closeRefusModal();
    }, 500);
  };


  const sortedAndFilteredTickets = useMemo(() => {
    if (!Array.isArray(ticketsAttribues)) return [];
    let sortableTickets = [...ticketsAttribues];

    if (searchTerm) {
      sortableTickets = sortableTickets.filter(ticket =>
        ticket.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.description && ticket.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ticket.demandeur && `${ticket.demandeur.prenom} ${ticket.demandeur.nom}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (sortConfig.key) {
      sortableTickets.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (sortConfig.key === 'dateAssignationEmploye' || sortConfig.key === 'dateCreation') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        }
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableTickets;
  }, [ticketsAttribues, searchTerm, sortConfig]);

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

  if (!Array.isArray(ticketsAttribues) || ticketsAttribues.length === 0 && !searchTerm) {
    return (
      <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner">
        <FileText size={48} className="mx-auto mb-4 text-sky-500" />
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Aucun ticket assigné</h2>
        <p className="text-slate-500 dark:text-slate-400">Vous n'avez actuellement aucun nouveau ticket assigné.</p>
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
                placeholder="Rechercher par titre, réf, demandeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input-icon w-full py-2.5 text-sm"
              />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2">
              <span>Trier par:</span>
              <button onClick={() => requestSort('dateAssignationEmploye')} className="font-medium hover:text-sky-500">Date Assignation {getSortIndicator('dateAssignationEmploye')}</button>
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
                onAccepter={onAccepterTicket}
                onRefuserClick={handleRefuserClickModal} // Passe la fonction pour ouvrir le modal
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

      {/* Modal pour le motif de refus */}
      <Modal
        isOpen={isRefusModalOpen}
        onClose={closeRefusModal}
        title="Refuser le ticket"
        footerActions={
          <>
            <button onClick={closeRefusModal} className="btn btn-secondary py-2 text-sm" disabled={isLoadingModal}>
              Annuler
            </button>
            <button 
              onClick={handleConfirmRefus} 
              className="btn btn-primary bg-red-600 hover:bg-red-700 py-2 text-sm" 
              disabled={isLoadingModal}
            >
              {isLoadingModal ? 'Confirmation...' : 'Confirmer le Refus'}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
          Vous êtes sur le point de refuser le ticket : <strong className="text-slate-700 dark:text-slate-100">{ticketsAttribues.find(t => t.id === ticketARefuserId)?.titre}</strong> (ID: {ticketARefuserId}).
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Veuillez spécifier un motif pour ce refus. Ce motif sera enregistré.
        </p>
        <textarea
          value={motifRefus}
          onChange={(e) => setMotifRefus(e.target.value)}
          placeholder="Motif du refus (obligatoire)..."
          rows="4"
          className="form-input w-full text-sm p-3 border-slate-300 dark:border-slate-600 focus:ring-sky-500 focus:border-sky-500"
          autoFocus
          required
        />
      </Modal>
    </>
  );
};

export default MesTicketsAssignesPage;
