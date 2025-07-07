// src/components/chefEquipe/SuiviAffectationsChefPage.jsx
import React, { useState, useMemo } from 'react';
import { Search, Info, Edit, SlidersHorizontal, ArrowDown, ArrowUp } from 'lucide-react';
import TicketRow from './TicketRow'; // Assurez-vous que ce composant est compatible et importé

// --- UTILS ---
const parseDate = (dateInput) => {
    if (!dateInput) return null;
    if (Array.isArray(dateInput)) {
        return new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0, dateInput[5] || 0);
    }
    const date = new Date(dateInput);
    return !isNaN(date.getTime()) ? date : null;
};

// --- Composant réutilisable pour une section de tickets ---
const TicketSection = ({ title, tickets, tousLesMembresDesEquipes, onReassignTicket, showDebutTraitementColumn, ...detailHandlers }) => {
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
        let items = [...(tickets || [])];
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
                if (['dateCreation', 'dateDebutTraitement'].includes(sortConfig.key)) {
                    valA = parseDate(valA) || 0;
                    valB = parseDate(valB) || 0;
                }
                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [tickets, searchTerm, sortConfig, filters]);

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
    
    const uniqueStatuts = useMemo(() => Array.from(new Set((tickets || []).map(t => t.statue).filter(Boolean))), [tickets]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <header className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title} ({sortedAndFilteredTickets.length})</h2>
            </header>

            <div className="p-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="relative flex-grow min-w-[200px] lg:flex-grow-0 lg:w-64">
                    <Search className="h-4 w-4 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none" />
                    <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input-sm w-full pl-9" />
                </div>
                <div className="flex items-center gap-1.5">
                    <SlidersHorizontal size={15} className="text-slate-500" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Filtrer :</span>
                </div>
                <select value={filters.statue} onChange={e => setFilters(f => ({...f, statue: e.target.value}))} className="form-select-sm">
                    <option value="">Statut (tous)</option>
                    {uniqueStatuts.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <select value={filters.employeId} onChange={e => setFilters(f => ({...f, employeId: e.target.value}))} className="form-select-sm">
                    <option value="">Employé (tous)</option>
                    {tousLesMembresDesEquipes.map(emp => <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom}</option>)}
                </select>
            </div>

            <div className="overflow-x-auto">
                {sortedAndFilteredTickets.length === 0 ? (
                    <div className="text-center py-16"><Info size={48} className="mx-auto text-slate-400 mb-4" /><p className="text-slate-500">Aucun ticket à afficher dans cette section.</p></div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-700 dark:bg-slate-900">
                            <tr>
                                <SortableHeader label="Client / Réf." sortKey="idClient.nomComplet" />
                                <SortableHeader label="Titre" sortKey="titre" />
                                <SortableHeader label="Affecté à" sortKey="idUtilisateur.prenom" />
                                <SortableHeader label="Créé le" sortKey="dateCreation" />
                                {showDebutTraitementColumn && <SortableHeader label="Début Traitement" sortKey="dateDebutTraitement" />}
                                <SortableHeader label="Priorité" sortKey="priorite" />
                                <SortableHeader label="Statut" sortKey="statue" />
                                <th className="p-4 text-center text-xs font-semibold text-slate-100 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {sortedAndFilteredTickets.map((ticket) => (
                                <TicketRow
                                    key={ticket.id}
                                    ticket={ticket}
                                    actions={
                                        <button onClick={(e) => { e.stopPropagation(); openReassignModal(ticket); }} className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-100 rounded-md" title="Modifier l'affectation"><Edit size={16} /></button>
                                    }
                                    {...detailHandlers}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
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

// --- Composant principal de la page ---
const SuiviAffectationsChefPage = ({ ticketsTraites, ticketsNonTraites, onReassignTicket, tousLesMembresDesEquipes, ...detailHandlers }) => {
    return (
        <div>
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Suivi des Affectations</h1>
                <p className="text-slate-500 mt-1">Consultez et modifiez les affectations des tickets en cours.</p>
            </header>

            <div className="space-y-8">
                <TicketSection 
                    title="Tickets Pas Encore Traités"
                    tickets={ticketsNonTraites}
                    tousLesMembresDesEquipes={tousLesMembresDesEquipes}
                    onReassignTicket={onReassignTicket}
                    showDebutTraitementColumn={false}
                    {...detailHandlers}
                />

                <TicketSection 
                    title="Tickets Traités"
                    tickets={ticketsTraites}
                    tousLesMembresDesEquipes={tousLesMembresDesEquipes}
                    onReassignTicket={onReassignTicket}
                    showDebutTraitementColumn={true}
                    {...detailHandlers}
                />
            </div>
        </div>
    );
};

export default SuiviAffectationsChefPage;
