// src/components/chefEquipe/SuiviAffectationsChefPage.jsx
import React, { useState, useMemo } from 'react';
import { Search, Filter, Info, User, Package, CalendarDays, Clock, CheckCircle, AlertTriangle, Tag as TagIcon, Eye } from 'lucide-react';

// Statut possible pour un ticket après assignation par le chef
// 'Assigné au technicien' -> l'employé n'a pas encore accepté
// 'En cours' -> l'employé a accepté et travaille dessus
// 'En attente validation Chef' -> l'employé a marqué comme résolu, en attente de validation par le chef
// 'Résolu' -> Validé par le chef (ou auto-validé)
// 'Réouvert' -> Si le chef n'est pas satisfait de la résolution

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
    if (status === 'en cours') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-300';
    if (status === 'assigné au technicien') return 'bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-300';
    if (status === 'en attente validation chef') return 'bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-300';
    if (status === 'résolu') return 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300';
    if (status === 'réouvert') return 'bg-orange-100 text-orange-700 dark:bg-orange-700/20 dark:text-orange-300';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-700/20 dark:text-slate-300';
  };

  const priorityStyle = getPriorityStyling(ticket.priorite);
  const statusStyle = getStatusStyling(ticket.statut);
  const dateAssignationEmployeFormatted = ticket.dateAssignationEmploye ? new Date(ticket.dateAssignationEmploye).toLocaleDateString('fr-CA') : 'N/A';
  const demandeurNom = ticket.demandeur ? `${ticket.demandeur.prenom || ''} ${ticket.demandeur.nom || ''}`.trim() : 'N/A';
  const employeNom = ticket.employeAssigne ? `${ticket.employeAssigne.prenom || ''} ${ticket.employeAssigne.nom || ''}`.trim() : 'N/A';

  const cellClass = "px-3 py-3.5 text-sm text-slate-700 dark:text-slate-200 align-middle border-b border-r border-slate-200 dark:border-slate-700";
  const fixedWidthClass = "whitespace-nowrap";
  const wrappingCellClass = "break-words";

  return (
    <tr className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors duration-150">
      <td className={`${cellClass} ${fixedWidthClass} w-[8%]`}>{ticket.ref}</td>
      <td className={`${cellClass} ${wrappingCellClass} w-[20%]`}>
        <p className="font-semibold text-slate-800 dark:text-slate-100">{ticket.titre}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Client: {ticket.client}</p>
      </td>
      <td className={`${cellClass} ${fixedWidthClass} w-[15%]`}>
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle}`}>
          {ticket.statut || 'N/A'}
        </span>
      </td>
      <td className={`${cellClass} ${wrappingCellClass} w-[15%]`}>
        {ticket.employeAssigne ? (
            <div className="flex items-center">
                <User size={16} className="mr-2 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                <span className="text-xs">{employeNom}</span>
            </div>
        ) : (
            <span className="text-xs italic text-slate-400 dark:text-slate-500">Non assigné</span>
        )}
      </td>
      <td className={`${cellClass} ${wrappingCellClass} w-[18%]`}>
        {ticket.moduleAssigne ? (
            <div className="flex items-center">
                <Package size={16} className="mr-2 text-indigo-500 dark:text-indigo-400 flex-shrink-0"/>
                <span className="text-xs">{ticket.moduleAssigne.nom}</span>
            </div>
        ) : (
            <span className="text-xs italic text-slate-400 dark:text-slate-500">Non spécifié</span>
        )}
      </td>
      <td className={`${cellClass} ${fixedWidthClass} w-[12%]`}>{dateAssignationEmployeFormatted}</td>
      <td className={`${cellClass} ${fixedWidthClass} w-[12%] text-center`}>
        <button
          onClick={() => onVoirDetailsTicket(ticket.id)} // La fonction de détails devra être adaptée
          className="btn btn-secondary-icon btn-xs group"
          title="Voir détails du ticket"
        >
          <Eye size={16} />
        </button>
        {/* D'autres actions pourraient être ajoutées ici, comme "Valider Résolution" ou "Réouvrir Ticket" */}
      </td>
    </tr>
  );
};


const SuiviAffectationsChefPage = ({ ticketsAssignesParChef, onNavigateToTicketDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    statut: '',
    priorite: '',
    employeId: '',
    // Ajoutez d'autres filtres si nécessaire
  });

  const ticketsFiltres = useMemo(() => {
    let resultat = [...(ticketsAssignesParChef || [])];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      resultat = resultat.filter(t =>
        t.ref.toLowerCase().includes(lowerSearch) ||
        t.titre.toLowerCase().includes(lowerSearch) ||
        t.client.toLowerCase().includes(lowerSearch) ||
        (t.employeAssigne && `${t.employeAssigne.prenom} ${t.employeAssigne.nom}`.toLowerCase().includes(lowerSearch)) ||
        (t.moduleAssigne && t.moduleAssigne.nom.toLowerCase().includes(lowerSearch))
      );
    }

    if (filters.statut) {
        resultat = resultat.filter(t => t.statut?.toLowerCase() === filters.statut.toLowerCase());
    }
    if (filters.priorite) {
        resultat = resultat.filter(t => t.priorite?.toLowerCase() === filters.priorite.toLowerCase());
    }
    if (filters.employeId) {
        resultat = resultat.filter(t => t.employeAssigne?.id === filters.employeId);
    }
    
    // Tri par défaut (peut être rendu configurable)
    resultat.sort((a,b) => new Date(b.dateAssignationEmploye || b.dateCreation) - new Date(a.dateAssignationEmploye || a.dateCreation));


    return resultat;
  }, [ticketsAssignesParChef, searchTerm, filters]);

  // Extraire les options uniques pour les filtres
  const uniqueStatuts = useMemo(() => {
    const statuts = new Set(ticketsAssignesParChef?.map(t => t.statut).filter(Boolean) || []);
    return Array.from(statuts);
  }, [ticketsAssignesParChef]);

  const uniquePriorites = useMemo(() => {
    const priorites = new Set(ticketsAssignesParChef?.map(t => t.priorite).filter(Boolean) || []);
    return Array.from(priorites);
  }, [ticketsAssignesParChef]);

  const uniqueEmployes = useMemo(() => {
    const employesMap = new Map();
    ticketsAssignesParChef?.forEach(t => {
        if (t.employeAssigne && !employesMap.has(t.employeAssigne.id)) {
            employesMap.set(t.employeAssigne.id, t.employeAssigne);
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
        {/* Section des filtres */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div>
                <label htmlFor="filter-statut" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Statut</label>
                <select id="filter-statut" name="statut" value={filters.statut} onChange={handleFilterChange} className="form-select w-full text-sm">
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
                {searchTerm || filters.statut || filters.priorite || filters.employeId ? "Aucun ticket ne correspond à vos critères de recherche/filtre." : "Aucun ticket assigné à suivre pour le moment."}
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
                <th scope="col" className={`${tableHeaderClass} w-[12%]`}> <CalendarDays size={14} className="inline-block mr-1.5 align-text-bottom"/>Assigné le</th>
                <th scope="col" className={`${tableHeaderClass} w-[12%] text-center`}>Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {ticketsFiltres.map(ticket => (
                <TicketSuiviRow
                  key={ticket.id}
                  ticket={ticket}
                  onVoirDetailsTicket={onNavigateToTicketDetails} // Vous devrez implémenter la navigation vers une page de détails de ticket
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
