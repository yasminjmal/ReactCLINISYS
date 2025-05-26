// src/components/admin/Tickets/TicketAccepteDetailsPage.jsx
import React from 'react';
import { CheckCircle as CheckCircleIcon, ArrowLeft, Paperclip, Tag, CalendarDays, UserCircle, Building, Send, GitFork } from 'lucide-react'; // Renommé CheckCircle pour éviter conflit

const TicketAccepteDetailsPage = ({
  ticket,
  onNavigateToAffectation, // Callback pour naviguer vers la page d'affectation (Ticket simple)
  onNavigateToDiffraction, // Callback pour naviguer vers la page de diffraction (création de sous-tickets)
  onCancelToList // Callback pour retourner à la liste des tickets acceptés (AffecterTicketsPage)
}) => {

  if (!ticket) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400">Aucun ticket accepté sélectionné.</div>;
  }

  const getPriorityClasses = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'haute':
        return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300 border-red-500';
      case 'moyenne':
        return 'bg-sky-100 text-sky-700 dark:bg-sky-700/30 dark:text-sky-300 border-sky-500';
      case 'faible':
        return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300 border-green-500';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300 border-slate-500';
    }
  };
  
  const demandeurNom = ticket.demandeur ? `${ticket.demandeur.prenom || ''} ${ticket.demandeur.nom || ''}`.trim() : 'N/A';
  const dateAcceptationFormatted = ticket.dateAcceptation ? new Date(ticket.dateAcceptation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour:'2-digit', minute: '2-digit' }) : 'N/A';
  const dateCreationFormatted = ticket.dateCreation ? new Date(ticket.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour:'2-digit', minute: '2-digit' }) : 'N/A';


  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-5 md:p-8 rounded-xl shadow-xl">
        {/* En-tête: Bouton Retour et Priorité */}
        <div className="flex justify-between items-start mb-6">
          <button
            onClick={onCancelToList}
            className="flex items-center text-sm text-sky-600 dark:text-sky-400 hover:underline"
            title="Retour à la liste des tickets acceptés"
          >
            <ArrowLeft size={18} className="mr-1.5" />
            Retour
          </button>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityClasses(ticket.priorite)}`}>
            Priorité: {ticket.priorite ? ticket.priorite.charAt(0).toUpperCase() + ticket.priorite.slice(1) : 'N/A'}
          </span>
        </div>

        {/* Titre et Référence */}
        <div className="mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            {ticket.titre || 'Détails du Ticket Accepté'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Réf. {ticket.ref || 'N/A'} - <span className="text-green-600 dark:text-green-400 font-medium">Statut: {ticket.statut}</span>
            {ticket.sousTickets && ticket.sousTickets.length > 0 && (
                <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">({ticket.sousTickets.length} sous-ticket(s))</span>
            )}
          </p>
        </div>

        {/* Description */}
        <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Description</h2>
          <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {ticket.description || 'Aucune description fournie.'}
          </p>
        </div>

        {/* Documents Joints */}
        {ticket.documentsJoints && ticket.documentsJoints.length > 0 && (
          <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Documents Joints</h2>
            <div className="space-y-2">
              {ticket.documentsJoints.map((doc, index) => (
                <a
                  key={index}
                  href={doc.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-sky-600 dark:text-sky-400 hover:underline p-2 rounded-md bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Paperclip size={16} className="mr-2 flex-shrink-0" />
                  <span className="truncate" title={doc.nom}>{doc.nom}</span>
                  {doc.type && <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 uppercase">.{doc.type}</span>}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Informations Client, Demandeur, Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-xs mb-8">
          <div className="flex items-center">
            <Building size={16} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <div>
              <span className="block text-slate-500 dark:text-slate-400">Client :</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{ticket.client || 'N/A'}</span>
            </div>
          </div>
          <div className="flex items-center">
            <UserCircle size={16} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <div>
              <span className="block text-slate-500 dark:text-slate-400">Demandeur :</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{demandeurNom}</span>
            </div>
          </div>
          <div className="flex items-center">
            <CalendarDays size={16} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <div>
              <span className="block text-slate-500 dark:text-slate-400">Date de création :</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {dateCreationFormatted}
              </span>
            </div>
          </div>
           <div className="flex items-center">
            <CheckCircleIcon size={16} className="mr-2 text-green-500 dark:text-green-400 flex-shrink-0" />
            <div>
              <span className="block text-slate-500 dark:text-slate-400">Date d'acceptation :</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {dateAcceptationFormatted}
              </span>
            </div>
          </div>
          {ticket.statut === 'Affecté' && ticket.equipeAffectee && (
            <div className="flex items-center">
                <UserCircle size={16} className="mr-2 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                <div>
                    <span className="block text-slate-500 dark:text-slate-400">Équipe Affectée :</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{typeof ticket.equipeAffectee === 'object' ? ticket.equipeAffectee.nom : ticket.equipeAffectee || 'N/A'}</span>
                </div>
            </div>
          )}
           {ticket.statut === 'Affecté' && ticket.employeAffecte && (
            <div className="flex items-center">
                <UserCircle size={16} className="mr-2 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                <div>
                    <span className="block text-slate-500 dark:text-slate-400">Employé Affecté :</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{ticket.employeAffecte.prenom && ticket.employeAffecte.nom ? `${ticket.employeAffecte.prenom} ${ticket.employeAffecte.nom}` : 'N/A'}</span>
                </div>
            </div>
          )}
        </div>

        {/* Boutons d'action pour ticket "Accepté" (non encore affecté) */}
        {/* Si le ticket est déjà affecté, ces boutons ne devraient pas apparaître, ou être désactivés */}
        {(ticket.statut === 'Accepté' || ticket.statut === 'Affecté') && ( // Permettre d'ajouter des sous-tickets même si déjà affecté
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onNavigateToDiffraction(ticket.id)}
              className="btn btn-secondary-outline group w-full sm:w-auto"
              title="Créer des sous-tâches pour ce ticket"
            >
              <GitFork size={18} className="mr-2 transition-transform duration-150 group-hover:rotate-[20deg]" />
              Diffracter (Sous-tickets)
            </button>
            {/* Le bouton affecter est toujours là, mais sa logique peut changer si déjà affecté */}
            <button
              onClick={() => onNavigateToAffectation(ticket.id)} // Ce onNavigateToAffectation devrait aller à la page PageAffectationTicket
              className="btn btn-primary group w-full sm:w-auto"
              title={ticket.statut === 'Affecté' ? "Modifier l'affectation" : "Affecter ce ticket"}
            >
              <Send size={18} className="mr-2 transition-transform duration-150 group-hover:translate-x-0.5" />
              {ticket.statut === 'Affecté' ? "Modifier l'Affectation" : "Affecter"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketAccepteDetailsPage;
