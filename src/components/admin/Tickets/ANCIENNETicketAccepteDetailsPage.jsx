// src/components/admin/Tickets/TicketAccepteDetailsPage.jsx
import React from 'react';
import { ArrowLeft, Paperclip, Tag, CalendarDays, UserCircle, Building, Send, GitFork, CheckCircle as CheckCircleIcon, Clock, Package as PackageIcon, Briefcase } from 'lucide-react';

const TicketAccepteDetailsPage = ({
  ticket,
  isSubTicket,
  onNavigateToAffectation,
  onNavigateToDiffraction,
  onCancelToList,
}) => {

  if (!ticket) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400">Aucun ticket sélectionné.</div>;
  }

  const getPriorityClasses = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'haute': return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300 border-red-500';
      case 'moyenne': return 'bg-sky-100 text-sky-700 dark:bg-sky-700/30 dark:text-sky-300 border-sky-500';
      case 'faible': return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300 border-green-500';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300 border-slate-500';
    }
  };

  // Logique de statut d'affichage
  const isTicketEnCours = ticket.idUtilisateur && ticket.statue !== 'RESOLU' && ticket.statue !== 'FERME'; // Changé employeAssigne à idUtilisateur, et majuscules
  let displayStatus = ticket.statue;
  let statusIcon = <Tag size={14} className="mr-1.5 text-slate-500 dark:text-slate-400" />;
  let statusTextClass = "text-slate-600 dark:text-slate-300";

  if (isTicketEnCours) {
      displayStatus = 'En cours';
      statusIcon = <Clock size={14} className="mr-1.5 text-yellow-500 dark:text-yellow-400" />;
      statusTextClass = "text-yellow-600 dark:text-yellow-300";
  } else if (ticket.statue === 'ACCEPTE') { // Changé 'Accepté' à majuscules
      statusIcon = <CheckCircleIcon size={14} className="mr-1.5 text-green-500 dark:text-green-400" />;
      statusTextClass = "text-green-600 dark:text-green-300";
  } else if (ticket.statue === 'RESOLU') { // Nouveau statut
      statusIcon = <CheckCircleIcon size={14} className="mr-1.5 text-teal-500 dark:text-teal-400" />;
      statusTextClass = "text-teal-600 dark:text-teal-300";
  } else if (ticket.statue === 'FERME') { // Nouveau statut
      statusIcon = <XCircle size={14} className="mr-1.5 text-gray-500 dark:text-gray-400" />;
      statusTextClass = "text-gray-600 dark:text-gray-300";
  }

  const demandeurNom = ticket.demandeur ? `${ticket.demandeur.prenom || ''} ${ticket.demandeur.nom || ''}`.trim() : 'N/A';
  const clientNom = ticket.idClient?.nom || ticket.client || 'N/A'; // Adapte le chemin du client
  const moduleNom = ticket.idModule?.nom || ticket.moduleAssigne?.nom || 'N/A'; // Adapte le chemin du module
  const employeAssigneNom = ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom || ''} ${ticket.idUtilisateur.nom || ''}`.trim() : 'N/A'; // Adapte le chemin de l'employé

  const dateCreationFormatted = ticket.dateCreation ? new Date(ticket.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour:'2-digit', minute: '2-digit' }) : 'N/A';
  const dateAcceptationFormatted = ticket.dateAcceptation ? new Date(ticket.dateAcceptation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour:'2-digit', minute: '2-digit' }) : 'N/A';
  const dateAffectationModuleFormatted = ticket.dateAffectationModule ? new Date(ticket.dateAffectationModule).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour:'2-digit', minute: '2-digit' }) : 'N/A';
  const dateAffectationEmployeFormatted = ticket.dateAffectationEmploye ? new Date(ticket.dateAffectationEmploye).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour:'2-digit', minute: '2-digit' }) : 'N/A';
  
  const parentRefDisplay = isSubTicket && ticket._parentInfo ? ticket._parentInfo.ref : null;

  // Condition pour afficher les boutons d'action principaux (s'affichent si le ticket n'est PAS "En cours" ou "Résolu" ou "Fermé")
  const showActionButtons = ticket.statue !== 'EN_COURS' && ticket.statue !== 'RESOLU' && ticket.statue !== 'FERME';

  // Un ticket parent peut être diffracté s'il n'est pas lui-même un sous-ticket ET si les boutons d'action sont visibles.
  const canDiffract = showActionButtons && !isSubTicket && onNavigateToDiffraction;
  // Un ticket peut être affecté à un module si:
  // 1. C'est un sous-ticket OU
  // 2. C'est un ticket parent SANS childTickets.
  // ET si les boutons d'action sont visibles.
  const canAffectModule = showActionButtons && onNavigateToAffectation && (isSubTicket || (!ticket.childTickets || ticket.childTickets.length === 0)); // Changé sousTickets à childTickets
  
  const affectButtonText = moduleNom !== 'N/A' ? "Modifier Module" : "Affecter à Module";


  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-5 md:p-8 rounded-xl shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <button
            onClick={onCancelToList}
            className="flex items-center text-sm text-sky-600 dark:text-sky-400 hover:underline"
            title="Retour à la liste des tickets"
          >
            <ArrowLeft size={18} className="mr-1.5" />
            Retour
          </button>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityClasses(ticket.priorite)}`}>
            Priorité: {ticket.priorite ? ticket.priorite.charAt(0).toUpperCase() + ticket.priorite.slice(1) : 'N/A'}
          </span>
        </div>

        <div className="mb-3">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
            {isSubTicket && <span className="text-sky-500 dark:text-sky-400 font-normal text-xl mr-2">[Sous-ticket]</span>}
            {ticket.titre || 'Détails du Ticket'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Référence: {ticket.ref || 'N/A'}
            {isSubTicket && parentRefDisplay && (
                <span className="ml-2 text-xs">(Parent: #{parentRefDisplay})</span>
            )}
          </p>
        </div>

        <div className="mb-5 pb-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">Description</h2>
          <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {ticket.description || 'Aucune description fournie.'}
          </p>
        </div>

        {ticket.documentJointesList && ticket.documentJointesList.length > 0 && ( // Changé documentsJoints à documentJointesList
          <div className="mb-5 pb-5 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Documents Joints</h3>
            <div className="space-y-2">
              {ticket.documentJointesList.map((doc, index) => ( // Changé documentsJoints à documentJointesList
                <a key={index} href={doc.url || '#'} target="_blank" rel="noopener noreferrer"
                  className="flex items-center text-sm text-sky-600 dark:text-sky-400 hover:underline p-2 rounded-md bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Paperclip size={16} className="mr-2 flex-shrink-0" />
                  <span className="truncate" title={doc.nom}>{doc.nom}</span>
                  {doc.type && <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 uppercase">.{doc.type}</span>}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-xs mb-6">
          <div>
            <span className="block text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Statut</span>
            <span className={`font-medium flex items-center mt-0.5 ${statusTextClass}`}>
                {statusIcon} {displayStatus}
            </span>
          </div>
          <div>
            <span className="block text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Client</span>
            <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center mt-0.5">
                <Building size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" />{clientNom} {/* Utilise clientNom */}
            </span>
          </div>
          <div>
            <span className="block text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Demandeur</span>
            <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center mt-0.5">
                <UserCircle size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" />{demandeurNom}
            </span>
          </div>
          <div>
            <span className="block text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Date de création</span>
            <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center mt-0.5">
                <CalendarDays size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" />{dateCreationFormatted}
            </span>
          </div>
          {ticket.dateAcceptation && (
            <div>
                <span className="block text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Date d'acceptation</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center mt-0.5">
                    <CheckCircleIcon size={14} className="mr-1.5 text-green-500 dark:text-green-400" />{dateAcceptationFormatted}
                </span>
            </div>
          )}
           {moduleNom !== 'N/A' && ( // Utilise moduleNom
            <div className="sm:col-span-1">
                <span className="block text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Module Assigné</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center mt-0.5">
                    <PackageIcon size={14} className="mr-1.5 text-indigo-500 dark:text-indigo-400" />
                    {moduleNom}
                </span>
            </div>
          )}
          {ticket.dateAffectationModule && (
            <div>
                <span className="block text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Date Affect. Module</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center mt-0.5">
                    <Clock size={14} className="mr-1.5 text-slate-500 dark:text-slate-400" />{dateAffectationModuleFormatted}
                </span>
            </div>
          )}
          {employeAssigneNom !== 'N/A' && ( // Utilise employeAssigneNom
            <div className="sm:col-span-1">
                <span className="block text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Assigné à l'employé</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center mt-0.5">
                    <Briefcase size={14} className="mr-1.5 text-teal-500 dark:text-teal-400" />
                    {employeAssigneNom}
                </span>
            </div>
          )}
           {ticket.dateAffectationEmploye && (
            <div>
                <span className="block text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Date Affect. Employé</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center mt-0.5">
                    <Clock size={14} className="mr-1.5 text-slate-500 dark:text-slate-400" />{dateAffectationEmployeFormatted}
                </span>
            </div>
          )}
        </div>

        {/* Section des boutons d'action, conditionnellement rendue */}
        {(canDiffract || canAffectModule) && (
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            {canDiffract && (
                <button
                onClick={() => onNavigateToDiffraction(ticket.id)}
                className="btn btn-secondary-outline group w-full sm:w-auto"
                title="Créer des sous-tâches pour ce ticket"
                >
                <GitFork size={18} className="mr-2 transition-transform duration-150 group-hover:rotate-[20deg]" />
                Diffracter
                </button>
            )}

            {canAffectModule && (
                <button
                onClick={() => onNavigateToAffectation(ticket.id, isSubTicket)}
                className="btn btn-primary group w-full sm:w-auto"
                title={affectButtonText}
                >
                <Send size={18} className="mr-2 transition-transform duration-150 group-hover:translate-x-0.5" />
                {affectButtonText}
                </button>
            )}
            </div>
        )}
      </div>
    </div>
  );
};

export default TicketAccepteDetailsPage;