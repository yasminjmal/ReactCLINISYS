// src/components/chefEquipe/SuiviAffectationsChefPage.jsx
import React, { useState, useMemo } from 'react';
import { Search, Info, User, Package, CalendarDays, Clock, CheckCircle, AlertTriangle, Tag as TagIcon, Eye } from 'lucide-react';

const TicketSuiviRow = ({ ticket, onVoirDetailsTicket }) => {
  const getPriorityStyling = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'haute': return { badge: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300', icon: <AlertTriangle size={12} className="text-red-500 mr-1" /> };
      case 'moyenne': return { badge: 'bg-sky-100 text-sky-700 dark:bg-sky-700/20 dark:text-sky-300', icon: <AlertTriangle size={12} className="text-sky-500 mr-1" /> };
      case 'faible': return { badge: 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300', icon: <CheckCircle size={12} className="text-green-500 mr-1" /> };
      default: return { badge: 'bg-slate-100 text-slate-700 dark:bg-slate-700/20 dark:text-slate-300', icon: null };
    }
  };

  const getStatusStyling = (status) => {
    status = status?.toLowerCase();
    if (status === 'en_cours') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-300';
    if (status === 'resolu') return 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300';
    if (status === 'ferme') return 'bg-slate-100 text-slate-700 dark:bg-slate-700/20 dark:text-slate-300';
    if (status === 'reouvert') return 'bg-orange-100 text-orange-700 dark:bg-orange-700/20 dark:text-orange-300';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-300';
  };

  const priorityStyle = getPriorityStyling(ticket.priorite);
  const statusStyle = getStatusStyling(ticket.statue); // Note: property is 'statue'
  // Use dateCreation as date_modification is not in the provided API response
  const dateDisplay = ticket.dateCreation ? new Date(ticket.dateCreation[0], ticket.dateCreation[1] - 1, ticket.dateCreation[2]).toLocaleDateString('fr-CA') : 'N/A'; // Used dateCreation and fixed formatting
  const employeNom = ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom || ''} ${ticket.idUtilisateur.nom || ''}`.trim() : 'Non assigné'; // Changed from 'N/A' for clarity

  const cellClass = "px-3 py-3.5 text-sm text-slate-700 dark:text-slate-200 align-middle border-b border-r border-slate-200 dark:border-slate-700";
  const fixedWidthClass = "whitespace-nowrap";
  const wrappingCellClass = "break-words";

  return (
    <tr className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors duration-150">
      <td className={`${cellClass} ${fixedWidthClass} w-[8%]`}>{ticket.ref}</td>
      <td className={`${cellClass} ${wrappingCellClass} w-[20%]`}>
        <p className="font-semibold text-slate-800 dark:text-slate-100">{ticket.titre}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Client: {ticket.idClient?.nomComplet || 'N/A'}</p> {/* Changed ticket.idClient?.nom to ticket.idClient?.nomComplet*/}
      </td>
      <td className={`${cellClass} ${fixedWidthClass} w-[15%]`}>
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle}`}>
          {ticket.statue || 'N/A'}
        </span>
      </td>
      <td className={`${cellClass} ${wrappingCellClass} w-[15%]`}>
        {ticket.idUtilisateur ? (
            <div className="flex items-center">
                <User size={16} className="mr-2 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                <span className="text-xs">{employeNom}</span>
            </div>
        ) : (
            <span className="text-xs italic text-slate-400 dark:text-slate-500">Non assigné</span>
        )}
      </td>
      <td className={`${cellClass} ${wrappingCellClass} w-[18%]`}>
        {ticket.idModule ? (
            <div className="flex items-center">
                <Package size={16} className="mr-2 text-indigo-500 dark:text-indigo-400 flex-shrink-0"/>
                <span className="text-xs">{ticket.idModule.designation}</span> {/* Changed ticket.idModule.nom to ticket.idModule.designation*/}
            </div>
        ) : (
            <span className="text-xs italic text-slate-400 dark:text-slate-500">Non spécifié</span>
        )}
      </td>
      <td className={`${cellClass} ${fixedWidthClass} w-[12%]`}>{dateDisplay}</td> {/* Changed dateModificationFormatted to dateDisplay*/}
      <td className={`${cellClass} ${fixedWidthClass} w-[12%] text-center`}>
        <button
          onClick={() => onVoirDetailsTicket(ticket.id)}
          className="btn btn-secondary-icon btn-xs group"
          title="Voir détails du ticket"
        >
          <Eye size={16} />
        </button>
      </td>
    </tr>
  );
};


const SuiviAffectationsChefPage = ({ ticketsAssignesParChef, onNavigateToTicketDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    statue: '',
    priorite: '',
    employeId: '',
  });

  const ticketsFiltres = useMemo(() => {
    let resultat = [...(ticketsAssignesParChef || [])];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      resultat = resultat.filter(t =>
        t.ref.toLowerCase().includes(lowerSearch) ||
        t.titre.toLowerCase().includes(lowerSearch) ||
        (t.idClient && t.idClient.nomComplet.toLowerCase().includes(lowerSearch)) || // Changed t.idClient.nom to t.idClient.nomComplet
        (t.idUtilisateur && `${t.idUtilisateur.prenom} ${t.idUtilisateur.nom}`.toLowerCase().includes(lowerSearch)) ||
        (t.idModule && t.idModule.designation.toLowerCase().includes(lowerSearch)) // Changed t.idModule.nom to t.idModule.designation
      );
    }

    if (filters.statue) {
        resultat = resultat.filter(t => t.statue?.toLowerCase() === filters.statue.toLowerCase());
    }
    if (filters.priorite) {
        resultat = resultat.filter(t => t.priorite?.toLowerCase() === filters.priorite.toLowerCase());
    }
    if (filters.employeId) {
        resultat = resultat.filter(t => t.idUtilisateur?.id === filters.employeId);
    }
    
    // Fallback to dateCreation if date_modification is not present
    resultat.sort((a,b) => {
        const dateA = a.date_modification ? new Date(a.date_modification[0], a.date_modification[1] - 1, a.date_modification[2]) : (a.dateCreation ? new Date(a.dateCreation[0], a.dateCreation[1] - 1, a.dateCreation[2]) : new Date(0));
        const dateB = b.date_modification ? new Date(b.date_modification[0], b.date_modification[1] - 1, b.date_modification[2]) : (b.dateCreation ? new Date(b.dateCreation[0], b.dateCreation[1] - 1, b.dateCreation[2]) : new Date(0));
        return dateB.getTime() - dateA.getTime();
    });

    return resultat;
  }, [ticketsAssignesParChef, searchTerm, filters]);

  const uniqueStatuts = useMemo(() => {
    const statuts = new Set(ticketsAssignesParChef?.map(t => t.statue).filter(Boolean) || []);
    return Array.from(statuts);
  }, [ticketsAssignesParChef]);

  const uniquePriorites = useMemo(() => {
    const priorites = new Set(ticketsAssignesParChef?.map(t => t.priorite).filter(Boolean) || []);
    return Array.from(priorites);
  }, [ticketsAssignesParChef]);

  const uniqueEmployes = useMemo(() => {
    const employesMap = new Map();
    ticketsAssignesParChef?.forEach(t => {
        if (t.idUtilisateur && !employesMap.has(t.idUtilisateur.id)) {
            employesMap.set(t.idUtilisateur.id, t.idUtilisateur);
        }
    });
    return Array.from(employesMap.values());
  }, [ticketsAssignesParChef]);


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const tableHeaderClass = "px-3 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b-2 border-slate-300 dark:border-slate-600";

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-100 dark:bg-slate-950 min-h-full">
      <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-5">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Suivi des Affectations</h1>
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Rechercher (réf, titre, client, employé...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input-icon w-full py-2.5 text-sm pl-10"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div>
                <label htmlFor="filter-statut" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Statut</label>
                <select id="filter-statut" name="statue" value={filters.statue} onChange={handleFilterChange} className="form-select w-full text-sm">
                    <option value="">Tous les statuts</option>
                    {uniqueStatuts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="filter-priorite" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Priorité</label>
                <select id="filter-priorite" name="priorite" value={filters.priorite} onChange={handleFilterChange} className="form-select w-full text-sm">
                    <option value="">Toutes les priorités</option>
                    {uniquePriorites.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="filter-employe" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Employé</label>
                <select id="filter-employe" name="employeId" value={filters.employeId} onChange={handleFilterChange} className="form-select w-full text-sm">
                    <option value="">Tous les employés</option>
                    {uniqueEmployes.map(emp => <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom}</option>)}
                </select>
            </div>
        </div>
      </div>

      {ticketsFiltres.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <Info size={56} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {searchTerm || filters.statue || filters.priorite || filters.employeId ? "Aucun ticket ne correspond à vos critères." : "Aucun ticket assigné à suivre pour le moment."}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Vérifiez vos filtres ou revenez plus tard.
            </p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-xl rounded-xl border border-slate-300 dark:border-slate-700">
          <table className="min-w-full">
            <thead className="bg-slate-200 dark:bg-slate-700">
              <tr>
                <th scope="col" className={`${tableHeaderClass} w-[8%]`}> <TagIcon size={14} className="inline-block mr-1.5 align-text-bottom"/>Réf.</th>
                <th scope="col" className={`${tableHeaderClass} w-[20%]`}> <Info size={14} className="inline-block mr-1.5 align-text-bottom"/>Titre / Client</th>
                <th scope="col" className={`${tableHeaderClass} w-[15%]`}> <Clock size={14} className="inline-block mr-1.5 align-text-bottom"/>Statut Ticket</th>
                <th scope="col" className={`${tableHeaderClass} w-[15%]`}> <User size={14} className="inline-block mr-1.5 align-text-bottom"/>Assigné À</th>
                <th scope="col" className={`${tableHeaderClass} w-[18%]`}> <Package size={14} className="inline-block mr-1.5 align-text-bottom"/>Module</th>
                <th scope="col" className={`${tableHeaderClass} w-[12%]`}> <CalendarDays size={14} className="inline-block mr-1.5 align-text-bottom"/>Modifié le</th>
                <th scope="col" className={`${tableHeaderClass} w-[12%] text-center`}>Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {ticketsFiltres.map(ticket => (
                <TicketSuiviRow
                  key={ticket.id}
                  ticket={ticket}
                  onVoirDetailsTicket={onNavigateToTicketDetails}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SuiviAffectationsChefPage;