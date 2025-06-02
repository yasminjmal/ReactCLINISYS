// src/components/employe/pages/MesTicketsRefusesPage.jsx
import React, { useState, useMemo } from 'react';
import { XCircle, Search, ArrowUpDown, Info, Tag, CalendarDays, User, Layers } from 'lucide-react';

const TicketRefuseCard = ({ ticket, onVoirDetails }) => {
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
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 truncate" title={ticket.titre}>
            {ticket.titre}
          </h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${getPriorityColor(ticket.priorite)}`}>
            {ticket.priorite}
          </span>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 h-12 overflow-hidden text-ellipsis" title={ticket.description}>
          {ticket.description || "Aucune description fournie."}
        </p>
        {ticket.motifRefusEmploye && (
            <p className="text-xs italic text-slate-500 dark:text-slate-400 mb-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                <strong>Motif du refus:</strong> {ticket.motifRefusEmploye}
            </p>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center" title="Référence du ticket">
            <Tag size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" /> Réf: {ticket.id}
          </div>
          <div className="flex items-center" title="Date du refus">
            <CalendarDays size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" /> 
            Refusé le: {ticket.dateRefusEmploye ? new Date(ticket.dateRefusEmploye).toLocaleDateString() : 'N/A'}
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

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
        <button
          onClick={() => onVoirDetails(ticket.id)}
          className="btn btn-secondary-outline btn-xs py-1.5 px-3 flex items-center text-sky-600 dark:text-sky-400 border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-700/30"
          title="Voir les détails de ce ticket refusé"
        >
          <Info size={14} className="mr-1" /> Voir Détails
        </button>
      </div>
    </div>
  );
};

const MesTicketsRefusesPage = ({ ticketsRefuses, onVoirDetailsTicketCallback }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'dateRefusEmploye', direction: 'descending' });

  const sortedAndFilteredTickets = useMemo(() => {
    if (!Array.isArray(ticketsRefuses)) return [];
    let sortableTickets = [...ticketsRefuses];

    if (searchTerm) {
      sortableTickets = sortableTickets.filter(ticket =>
        ticket.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.description && ticket.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ticket.motifRefusEmploye && ticket.motifRefusEmploye.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ticket.demandeur && `${ticket.demandeur.prenom} ${ticket.demandeur.nom}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (sortConfig.key) {
      sortableTickets.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (['dateRefusEmploye', 'dateCreation', 'dateAssignationEmploye'].includes(sortConfig.key)) {
            valA = a[sortConfig.key] ? new Date(a[sortConfig.key]).getTime() : 0;
            valB = b[sortConfig.key] ? new Date(b[sortConfig.key]).getTime() : 0;
        }
        
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableTickets;
  }, [ticketsRefuses, searchTerm, sortConfig]);

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

  if (!Array.isArray(ticketsRefuses) || ticketsRefuses.length === 0 && !searchTerm) {
    return (
      <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner">
        <XCircle size={48} className="mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Aucun ticket refusé</h2>
        <p className="text-slate-500 dark:text-slate-400">Vous n'avez actuellement aucun ticket marqué comme refusé par vous.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par titre, réf, motif, demandeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input-icon w-full py-2.5 text-sm"
            />
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2">
            <span>Trier par:</span>
            <button onClick={() => requestSort('dateRefusEmploye')} className="font-medium hover:text-sky-500">Date Refus {getSortIndicator('dateRefusEmploye')}</button>
            <span>|</span>
            <button onClick={() => requestSort('priorite')} className="font-medium hover:text-sky-500">Priorité {getSortIndicator('priorite')}</button>
            <span>|</span>
            <button onClick={() => requestSort('id')} className="font-medium hover:text-sky-500">Référence {getSortIndicator('id')}</button>
        </div>
      </div>

      {sortedAndFilteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedAndFilteredTickets.map(ticket => (
            <TicketRefuseCard 
              key={ticket.id} 
              ticket={ticket}
              onVoirDetails={onVoirDetailsTicketCallback}
            />
          ))}
        </div>
      ) : (
         <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner">
            <Search size={48} className="mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Aucun ticket trouvé</h2>
            <p className="text-slate-500 dark:text-slate-400">Aucun ticket refusé ne correspond à vos critères de recherche.</p>
        </div>
      )}
      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default MesTicketsRefusesPage;
