// src/components/chefEquipe/SuiviAffectationsChefPage.jsx
import React, { useState, useMemo } from 'react';
import { Search, Info, Edit, SlidersHorizontal, ArrowDown, ArrowUp } from 'lucide-react';
import TicketRow from './TicketRow'; // On importe le nouveau composant partagé

const SuiviAffectationsChefPage = ({ ticketsAssignesParChef, onReassignTicket, tousLesMembresDesEquipes, ...detailHandlers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'dateCreation', direction: 'descending' });
    const [filters, setFilters] = useState({ statue: '', employeId: '' });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [newAssigneeId, setNewAssigneeId] = useState('');

    const openReassignModal = (ticket) => {
        setSelectedTicket(ticket);
        setNewAssigneeId(ticket.idUtilisateur?.id || '');
        setIsModalOpen(true);
    };
    const closeReassignModal = () => setIsModalOpen(false);
    const handleReassignSubmit = () => {
        if (!selectedTicket) return;
        const employe = newAssigneeId ? tousLesMembresDesEquipes.find(emp => emp.id.toString() === newAssigneeId) : null;
        onReassignTicket(selectedTicket.id, employe);
        closeReassignModal();
    };

    const getNestedValue = (obj, path) => {
        if (!path || !obj) return null;
        return path.split('.').reduce((p, c) => (p && p[c] !== undefined) ? p[c] : null, obj);
    };

    const sortedAndFilteredTickets = useMemo(() => {
        let items = [...(ticketsAssignesParChef || [])];
        if (filters.statue) items = items.filter(t => t.statue === filters.statue);
        if (filters.employeId) items = items.filter(t => t.idUtilisateur?.id === parseInt(filters.employeId));
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            items = items.filter(t =>
                (t.titre?.toLowerCase().includes(lowerSearch)) ||
                (t.idClient?.nomComplet?.toLowerCase().includes(lowerSearch))
            );
        }
        if (sortConfig.key) {
            items.sort((a, b) => {
                let valA = getNestedValue(a, sortConfig.key);
                let valB = getNestedValue(b, sortConfig.key);
                if (['dateCreation'].includes(sortConfig.key)) {
                    valA = valA ? new Date(valA[0], valA[1]-1, valA[2]) : new Date(0);
                    valB = valB ? new Date(valB[0], valB[1]-1, valB[2]) : new Date(0);
                }
                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [ticketsAssignesParChef, searchTerm, sortConfig, filters]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const SortableHeader = ({ label, sortKey }) => {
        const isSorted = sortConfig.key === sortKey;
        const icon = isSorted ? (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <div className="w-3.5"></div>;
        return (
            <th className="p-4 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(sortKey)}>
                <div className="flex items-center gap-1">{label} {icon}</div>
            </th>
        );
    };
    
    const uniqueStatuts = useMemo(() => Array.from(new Set((ticketsAssignesParChef || []).map(t => t.statue).filter(Boolean))), [ticketsAssignesParChef]);

    return (
        <div>
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Suivi des Affectations</h1>
                    <p className="text-slate-500 mt-1">Modifiez les tickets en cours.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="h-5 w-5 text-slate-400 absolute inset-y-0 left-3 flex items-center" />
                    <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input w-full pl-10"/>
                </div>
            </header>

            <div className="bg-white rounded-xl shadow-md">
                <div className="p-4 border-b border-slate-200 flex items-center gap-4 flex-wrap">
                    <span className="font-semibold text-slate-600 flex items-center gap-2"><SlidersHorizontal size={16}/> Filtres</span>
                    <select value={filters.statue} onChange={e => setFilters(f => ({...f, statue: e.target.value}))} className="form-select">
                        <option value="">Tous les statuts</option>
                        {uniqueStatuts.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                    <select value={filters.employeId} onChange={e => setFilters(f => ({...f, employeId: e.target.value}))} className="form-select">
                        <option value="">Tous les employés</option>
                        {tousLesMembresDesEquipes.map(emp => <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    {sortedAndFilteredTickets.length === 0 ? (
                        <div className="text-center py-16"><Info size={48} className="mx-auto text-slate-400 mb-4" /><p className="text-slate-500">Aucun ticket à afficher.</p></div>
                    ) : (
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-700">
                                <tr>
                                    <SortableHeader label="Client / Réf." sortKey="idClient.nomComplet" />
                                    <SortableHeader label="Demandeur" sortKey="userCreation" />
                                    <SortableHeader label="Titre" sortKey="titre" />
                                    <SortableHeader label="Module" sortKey="idModule.designation" />
                                    <SortableHeader label="Affecté à" sortKey="idUtilisateur.prenom" />
                                    <SortableHeader label="Créé le" sortKey="dateCreation" />
                                    <SortableHeader label="Priorité" sortKey="priorite" />
                                    <SortableHeader label="Statut" sortKey="statue" />
                                    <th className="p-4 text-center text-xs font-semibold text-slate-100 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {sortedAndFilteredTickets.map((ticket) => (
                                    <TicketRow
                                        key={ticket.id}
                                        ticket={ticket}
                                        actions={
                                            <button onClick={(e) => { e.stopPropagation(); openReassignModal(ticket); }} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-md" title="Modifier l'affectation"><Edit size={16} /></button>
                                        }
                                        {...detailHandlers}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isModalOpen && (
                 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Réassigner Ticket {selectedTicket.ref}</h3>
                        <select value={newAssigneeId} onChange={(e) => setNewAssigneeId(e.target.value)} className="form-select w-full mb-4">
                             <option value="">-- Retirer l'affectation --</option>
                            {tousLesMembresDesEquipes.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
                        </select>
                        <div className="flex justify-end space-x-3"><button onClick={closeReassignModal} className="btn btn-secondary">Annuler</button><button onClick={handleReassignSubmit} className="btn btn-primary">Confirmer</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuiviAffectationsChefPage;