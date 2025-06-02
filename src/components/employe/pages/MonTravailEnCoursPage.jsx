// src/components/employe/pages/MonTravailEnCoursPage.jsx
import React from 'react';
import { Edit3, Info, User, Layers, Briefcase, CalendarDays as CalendarIcon } from 'lucide-react';

const TravailEnCoursCard = ({ ticket, onVoirDetails }) => {
  const echeance = ticket.dateEcheance ? new Date(ticket.dateEcheance) : null;
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0); // Pour comparer uniquement les dates

  let echeanceStyle = 'text-slate-500 dark:text-slate-400';
  let echeanceText = echeance ? echeance.toLocaleDateString() : 'Non définie';

  if (echeance) {
    if (echeance < aujourdhui) {
      echeanceStyle = 'text-red-500 dark:text-red-400 font-semibold';
      echeanceText += ' (En retard)';
    } else if (echeance.getTime() === aujourdhui.getTime()) {
      echeanceStyle = 'text-orange-500 dark:text-orange-400 font-semibold';
      echeanceText += ' (Aujourd\'hui)';
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-5 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3 truncate" title={ticket.titre}>
          {ticket.titre}
        </h3>
        <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
          <p className="flex items-center">
            <User size={14} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0"/>
            <strong className="mr-1">Demandeur:</strong> 
            <span className="truncate">{ticket.demandeur?.prenom} {ticket.demandeur?.nom}</span>
          </p>
          <p className="flex items-center">
            <Briefcase size={14} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0"/>
            <strong className="mr-1">Client:</strong> 
            <span className="truncate">{ticket.client || 'N/A'}</span>
          </p>
          <p className="flex items-center">
            <Layers size={14} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0"/>
            <strong className="mr-1">Module:</strong> 
            <span className="truncate">{ticket.moduleConcerne || 'N/A'}</span>
          </p>
          <p className={`flex items-center ${echeanceStyle}`}>
            <CalendarIcon size={14} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0"/>
            <strong className="mr-1">Échéance:</strong> 
            <span>{echeanceText}</span>
          </p>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
        <button
          onClick={() => onVoirDetails(ticket.id)}
          className="btn btn-primary-outline btn-sm py-2 px-4 flex items-center text-sky-600 dark:text-sky-400 border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-700/30"
          title="Voir les détails et traiter ce ticket"
        >
          <Info size={16} className="mr-2" />
          Détails & Traitement
        </button>
      </div>
    </div>
  );
};

const MonTravailEnCoursPage = ({ ticketsEnCours, onVoirDetailsTicket }) => {
  if (!Array.isArray(ticketsEnCours) || ticketsEnCours.length === 0) {
    return (
      <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner animate-fadeIn">
        <Edit3 size={48} className="mx-auto mb-4 text-blue-500" />
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Aucun travail en cours</h2>
        <p className="text-slate-500 dark:text-slate-400">Vous n'avez actuellement aucun ticket en cours de traitement. Acceptez-en un depuis la liste des tickets assignés.</p>
      </div>
    );
  }

  // Optionnel: Trier les tickets, par exemple par date d'échéance la plus proche
  // Ou par date de prise en charge la plus ancienne, etc.
  const sortedTickets = [...ticketsEnCours].sort((a, b) => {
    const dateAEcheance = a.dateEcheance ? new Date(a.dateEcheance).getTime() : Infinity;
    const dateBEcheance = b.dateEcheance ? new Date(b.dateEcheance).getTime() : Infinity;
    
    // Priorité au tri par échéance
    if (dateAEcheance !== dateBEcheance) {
        return dateAEcheance - dateBEcheance;
    }
    
    // En cas d'égalité sur l'échéance (ou si les deux n'ont pas d'échéance), trier par date de prise en charge
    const dateAPrise = a.datePriseEnCharge ? new Date(a.datePriseEnCharge).getTime() : 0;
    const dateBPrise = b.datePriseEnCharge ? new Date(b.datePriseEnCharge).getTime() : 0;
    return dateAPrise - dateBPrise; // Les plus anciennement pris en charge en premier
  });


  return (
    <div className="space-y-6 animate-fadeIn">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 px-1 flex items-center">
            <Edit3 size={24} className="mr-3 text-blue-500"/>
            Mes Tickets en Cours ({sortedTickets.length})
        </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sortedTickets.map(ticket => (
          <TravailEnCoursCard
            key={ticket.id}
            ticket={ticket}
            onVoirDetails={onVoirDetailsTicket}
          />
        ))}
      </div>
      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default MonTravailEnCoursPage;
