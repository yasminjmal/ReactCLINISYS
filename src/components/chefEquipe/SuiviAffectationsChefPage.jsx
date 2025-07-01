// src/components/chefEquipe/SuiviAffectationsChefPage.jsx
import React, { useState, useMemo } from 'react';
import { Search, Info } from 'lucide-react';
import TicketSuiviRow from './TicketSuiviRow'; // Importer le nouveau composant

const SuiviAffectationsChefPage = ({ ticketsAssignesParChef }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ statue: '', employeId: '' });

  const ticketsFiltres = useMemo(() => {
    let resultat = [...(ticketsAssignesParChef || [])];

    if (filters.statue) {
        resultat = resultat.filter(t => t.statue === filters.statue);
    }

    if (filters.employeId) {
        resultat = resultat.filter(t => t.idUtilisateur?.id === parseInt(filters.employeId));
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      resultat = resultat.filter(t =>
        (t.ref && t.ref.toLowerCase().includes(lowerSearch)) ||
        (t.titre && t.titre.toLowerCase().includes(lowerSearch))
      );
    }
    
    resultat.sort((a,b) => new Date(b.date_modification || b.dateCreation) - new Date(a.date_modification || a.dateCreation));
    return resultat;
  }, [ticketsAssignesParChef, searchTerm, filters]);

  const uniqueStatuts = useMemo(() => Array.from(new Set((ticketsAssignesParChef || []).map(t => t.statue).filter(Boolean))), [ticketsAssignesParChef]);
  const uniqueEmployes = useMemo(() => {
    const employesMap = new Map();
    (ticketsAssignesParChef || []).forEach(t => {
        if (t.idUtilisateur) {
            employesMap.set(t.idUtilisateur.id, t.idUtilisateur);
        }
    });
    return Array.from(employesMap.values());
  }, [ticketsAssignesParChef]);

  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const tableHeaderClass = "px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider";

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Suivi des Affectations</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Rechercher par réf. ou titre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input md:col-span-1" />
            <select name="statue" value={filters.statue} onChange={handleFilterChange} className="form-select">
                <option value="">Tous les statuts</option>
                {uniqueStatuts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select name="employeId" value={filters.employeId} onChange={handleFilterChange} className="form-select">
                <option value="">Tous les employés</option>
                {uniqueEmployes.map(emp => <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom}</option>)}
            </select>
        </div>
      </div>

      <div className="overflow-x-auto shadow-xl rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full">
            <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                    <th scope="col" className={tableHeaderClass}>Réf.</th>
                    <th scope="col" className={tableHeaderClass}>Titre</th>
                    <th scope="col" className={tableHeaderClass}>Statut</th>
                    <th scope="col" className={tableHeaderClass}>Assigné à</th>
                    <th scope="col" className={tableHeaderClass}>Dernière MàJ</th>
                    <th scope="col" className={`${tableHeaderClass} text-center`}>Détails</th>
                </tr>
            </thead>
            {ticketsFiltres.length === 0 ? (
                <tbody>
                    <tr>
                        <td colSpan="6" className="text-center py-12 bg-white dark:bg-slate-800">
                            <Info size={40} className="mx-auto text-slate-400 mb-3" />
                            <p className="text-slate-500 dark:text-slate-400">Aucun ticket ne correspond aux critères de filtre.</p>
                        </td>
                    </tr>
                </tbody>
            ) : (
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {ticketsFiltres.map(ticket => (
                        <TicketSuiviRow key={ticket.id} ticket={ticket} />
                    ))}
                </tbody>
            )}
        </table>
      </div>
    </div>
  );
};

export default SuiviAffectationsChefPage;