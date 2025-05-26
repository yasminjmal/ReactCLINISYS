// src/components/admin/Tickets/TicketAccepteRow.jsx (affiche un bloc de ticket)
import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaInfoCircle, FaStream } from 'react-icons/fa'; // ChevronUp ajoutée
import { Briefcase, CalendarDays, UserCircle, CheckCircle, FileText } from 'lucide-react';

const TicketAccepteRow = ({ 
  ticket, 
  isSubTicket = false, 
  depth = 0, 
  onNavigateToDetailsCallback,
  isHighlighted
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const ticketId = ticket?.id ?? 'N/A';
  const ticketRef = ticket?.ref ?? 'N/A';
  const ticketTitre = ticket?.titre ?? 'Titre non disponible';
  const ticketPriorite = ticket?.priorite ?? 'N/A';
  const ticketClient = ticket?.client ?? 'N/A';

  const nomDemandeurFormatted = ticket?.demandeur 
    ? `${ticket.demandeur.prenom || ''} ${ticket.demandeur.nom || ''}`.trim() 
    : 'N/A';
  const finalNomDemandeur = (ticket?.demandeur && nomDemandeurFormatted === '') ? 'Demandeur Incomplet' : nomDemandeurFormatted;

  const datePertinente = ticket?.dateAcceptation ?? ticket?.dateCreation;
  const ticketDateDisplay = datePertinente ? new Date(datePertinente).toLocaleDateString('fr-CA') : 'N/A';
  const ticketTimeDisplay = datePertinente ? new Date(datePertinente).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit'}) : '';

  const subTickets = ticket?.subTickets ?? [];
  const hasSubTickets = subTickets.length > 0;

  // Log pour débogage des sous-tickets
  useEffect(() => {
    if (!isSubTicket) { // Log uniquement pour les tickets parents
      console.log(`Ticket Parent ID: ${ticketId}, Réf: ${ticketRef}, Possède des sous-tickets: ${hasSubTickets}, Nombre: ${subTickets.length}`, ticket?.subTickets);
    }
  }, [ticketId, ticketRef, isSubTicket, hasSubTickets, subTickets, ticket?.subTickets]);


  const handleToggleExpand = (e) => {
    e.stopPropagation();
    if (hasSubTickets) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleNavigateToDetailClick = (e) => {
    e.stopPropagation();
    if (onNavigateToDetailsCallback) {
      onNavigateToDetailsCallback(ticketId, isSubTicket); 
    } else {
      console.warn("onNavigateToDetailsCallback n'est pas fourni pour le ticket ID:", ticketId);
    }
  };

  const getPriorityStyling = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'haute': return {
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
        border: 'border-red-500 dark:border-red-600'
      };
      case 'moyenne': return {
        badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
        border: 'border-sky-500 dark:border-sky-600'
      };
      case 'faible': return {
        badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
        border: 'border-green-500 dark:border-green-600'
      };
      default: return {
        badge: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
        border: 'border-slate-400 dark:border-slate-600'
      };
    }
  };
  const priorityStyles = getPriorityStyling(ticketPriorite);

  const blockContainerStyle = {
    marginLeft: isSubTicket ? `${depth * 20}px` : '0px', // Indentation pour les sous-tickets
    transition: 'box-shadow 0.3s ease-out, background-color 0.3s ease-out',
    boxShadow: isHighlighted && !isSubTicket ? '0 0 12px 2px rgba(74, 222, 128, 0.5)' : '0 1px 2px 0 rgba(0,0,0,0.05)',
  };
  
  let mainBlockBgClass = 'bg-white dark:bg-slate-800';
  if (isSubTicket) {
    // Couleur gris clair pour les sous-tickets
    mainBlockBgClass = 'bg-slate-100 dark:bg-slate-700/60'; 
  } else if (isHighlighted) {
    // Couleur de mise en évidence pour les tickets parents
    mainBlockBgClass = document.documentElement.classList.contains('dark') ? 'bg-green-800/30' : 'bg-green-100/50';
  }

  return (
    <div 
        className={`ticket-block-container mb-2.5 rounded-lg ${mainBlockBgClass} shadow hover:shadow-md transition-shadow duration-200 overflow-hidden border-l-4 ${isSubTicket ? 'border-slate-300 dark:border-slate-500' : priorityStyles.border}`} 
        style={blockContainerStyle}
        ref={isHighlighted && !isSubTicket ? (el) => el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) : null}
    >
      <div className="p-3 flex items-center space-x-3 md:space-x-4">
        {/* Réf. - Ajustement du padding/margin pour aligner à gauche */}
        <div className="flex-none w-[70px] text-left self-start pt-0.5"> {/* Alignement au début */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Réf.</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate" title={ticketRef}>{ticketRef}</p>
        </div>

        {/* Client & Demandeur */}
        <div className="flex-1 min-w-0 md:w-48 lg:w-56 self-start pt-0.5">
          <div className="flex items-center">
            <Briefcase size={14} className="mr-1.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate" title={ticketClient}>
              {ticketClient}
            </p>
          </div>
          <div className="flex items-center mt-0.5">
            <UserCircle size={14} className="mr-1.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={finalNomDemandeur}>
              {finalNomDemandeur}
            </p>
          </div>
        </div>
        
        {/* Titre (visible sur grands écrans dans cette ligne) */}
        <div className="flex-1 min-w-0 w-1/3 md:w-2/5 lg:w-1/2 hidden sm:flex items-start self-start pt-0.5">
            <FileText size={14} className="mr-1.5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 dark:text-slate-200 truncate" title={ticketTitre}>
                {ticketTitre}
            </p>
        </div>
        
        <div className="flex-none flex flex-col items-center space-y-1 md:space-y-0 md:flex-row md:items-center md:space-x-3 ml-auto self-start">
            {/* Priorité (badge) */}
            <div className="text-center">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${priorityStyles.badge}`}>
                {ticketPriorite ? ticketPriorite.charAt(0).toUpperCase() + ticketPriorite.slice(1) : 'N/A'}
              </span>
            </div>

            {/* Statut "Accepté" */}
            <div className="text-center hidden lg:flex items-center justify-center">
              <CheckCircle size={14} className="text-green-500 dark:text-green-400 mr-1" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  Accepté
              </span>
            </div>
            
            {/* Date */}
            <div className="text-center hidden md:block">
              <div className="flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                  <CalendarDays size={14} className="mr-1.5"/>
                  {ticketDateDisplay}
              </div>
               <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {ticketTimeDisplay}
              </p>
            </div>

            {/* Actions: Compteur Sous-tickets, Expander, Détails */}
            <div className="flex items-center space-x-2">
                {!isSubTicket && hasSubTickets && (
                    <button 
                      onClick={handleToggleExpand} 
                      className="flex items-center p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
                      aria-expanded={isExpanded}
                      title={isExpanded ? "Masquer sous-tickets" : "Afficher sous-tickets"}
                    >
                      <FaStream size={12} className="mr-1"/>
                      <span className="text-xs">({subTickets.length})</span>
                      {isExpanded ? <FaChevronUp size={10} className="ml-1"/> : <FaChevronDown size={10} className="ml-1"/>}
                    </button>
                )}
                <button 
                  onClick={handleNavigateToDetailClick} 
                  className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 transition-colors" 
                  title="Détails et Affectation"
                  aria-label="Détails et affectation du ticket"
                >
                  <FaInfoCircle size={16} />
                </button>
            </div>
        </div>
      </div>

      {/* Titre (visible sur mobile, car caché plus haut sur sm) */}
      <div className="sm:hidden px-3 pt-2 pb-2 border-t border-slate-100 dark:border-slate-700/50">
          <div className="flex items-start">
              <FileText size={14} className="mr-1.5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 dark:text-slate-200" title={ticketTitre}>
                  {ticketTitre}
              </p>
          </div>
      </div>

      {/* Section des sous-tickets (blocs imbriqués) */}
      {isExpanded && !isSubTicket && hasSubTickets && (
        <div className="border-t border-slate-200 dark:border-slate-700"> 
          <div className="pt-2 pb-0.5"> {/* Le marginLeft du conteneur parent gère l'indentation globale */}
            {subTickets.map(subTicket => (
              <TicketAccepteRow
                key={subTicket.id}
                ticket={subTicket}
                isSubTicket={true}
                depth={depth + 1} 
                onNavigateToDetailsCallback={onNavigateToDetailsCallback}
                // isHighlighted={false} // Pas de highlight pour les sous-tickets par défaut
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketAccepteRow;
    