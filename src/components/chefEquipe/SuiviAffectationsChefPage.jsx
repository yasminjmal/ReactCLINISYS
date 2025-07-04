// src/components/chefEquipe/SuiviAffectationsChefPage.jsx

import React, { useState, useMemo } from 'react';
import { Search, Info, Edit, Trash2, SlidersHorizontal, ArrowDown, ArrowUp } from 'lucide-react';

// --- Sous-composants pour le style visuel ---

const getProfileImageUrl = (user) => user?.photo ? `data:image/jpeg;base64,${user.photo}` : `https://i.pravatar.cc/150?u=${user?.id || 'default'}`;

const PriorityIndicator = ({ priority }) => {
    const styles = {
        'Haute': 'text-red-600',
        'Moyenne': 'text-orange-600',
        'Basse': 'text-sky-600',
    };
    return <span className={`font-medium ${styles[priority] || 'text-slate-500'}`}>{priority || 'N/A'}</span>;
};

const StatusBadge = ({ status }) => {
    const styles = {
        'Accepte': 'bg-green-100 text-green-700',
        'En_cours': 'bg-yellow-100 text-yellow-700',
        'Termine': 'bg-emerald-100 text-emerald-700',
        'Refuse': 'bg-red-100 text-red-700',
        'En_attente': 'bg-blue-100 text-blue-700',
    };
    const formattedStatus = status ? status.replace('_', ' ') : 'N/A';
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
            {formattedStatus}
        </span>
    );
};

// --- Ligne du tableau pour un ticket ---
const TicketRow = ({ ticket, onReassign }) => {
    const formatDate = (dateArray) => {
        if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) return 'N/A';
        try {
            return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString('fr-FR');
        } catch {
            return 'Date invalide';
        }
    };

    return (
        <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
            <td className="p-4 text-sm font-medium text-slate-800">
                <div className="flex items-center gap-3">
                    <img src={getProfileImageUrl(ticket.idClient)} alt={ticket.idClient?.nomComplet} className="w-9 h-9 rounded-md object-cover" />
                    <div>
                        <p>{ticket.idClient?.nomComplet || 'N/A'}</p>
                        <p className="text-xs text-slate-500">Réf: {ticket.ref}</p>
                    </div>
                </div>
            </td>
            <td className="p-4 text-sm text-slate-600">{ticket.userCreation || 'N/A'}</td>
            <td className="p-4 text-sm text-slate-800 font-semibold">{ticket.titre}</td>
            <td className="p-4 text-sm text-slate-600">{ticket.idModule?.designation || 'N/A'}</td>
            <td className="p-4 text-sm text-slate-600">{ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom} ${ticket.idUtilisateur.nom}` : <span className="italic text-slate-400">Non assigné</span>}</td>
            <td className="p-4 text-sm text-slate-600">{formatDate(ticket.dateCreation)}</td>
            <td className="p-4 text-sm"><PriorityIndicator priority={ticket.priorite} /></td>
            <td className="p-4 text-sm"><StatusBadge status={ticket.statue} /></td>
            <td className="p-4">
                <div className="flex justify-center items-center gap-1">
                    <button onClick={() => onReassign(ticket)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-md" title="Modifier l'affectation"><Edit size={16} /></button>
                </div>
            </td>
        </tr>
    );
};


// --- COMPOSANT PRINCIPAL ---
const SuiviAffectationsChefPage = ({ ticketsAssignesParChef, onReassignTicket, tousLesMembresDesEquipes }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'dateCreation', direction: 'descending' });
    const [filters, setFilters] = useState({ statue: '', employeId: '' });
    
    // Logique pour la modale de réassignation
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [newAssigneeId, setNewAssigneeId] = useState('');

    const openReassignModal = (ticket) => {
        setSelectedTicket(ticket);
        setNewAssigneeId(ticket.idUtilisateur?.id || '');
        setIsModalOpen(true);
    };

    const closeReassignModal = () => {
        setIsModalOpen(false);
        setSelectedTicket(null);
        setNewAssigneeId('');
    };

    const handleReassignSubmit = () => {
        if (!selectedTicket) return;
        const employeIdNum = newAssigneeId ? parseInt(newAssigneeId, 10) : null;
        const nouvelEmploye = employeIdNum ? tousLesMembresDesEquipes.find(emp => emp.id === employeIdNum) : null;
        onReassignTicket(selectedTicket.id, nouvelEmploye);
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
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader = ({ label, sortKey, className = '' }) => {
        const isSorted = sortConfig.key === sortKey;
        const icon = isSorted ? (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <div className="w-3.5"></div>;
        return (
            <th className={`p-4 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => requestSort(sortKey)}>
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
                    <Search className="h-5 w-5 text-slate-400 absolute inset-y-0 left-3 flex items-center pointer-events-none" />
                    <input type="text" placeholder="Rechercher un ticket..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input w-full pl-10"/>
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
                        <div className="text-center py-16">
                           <Info size={48} className="mx-auto text-slate-400 mb-4" />
                            <p className="text-slate-500">Aucun ticket ne correspond à vos critères.</p>
                        </div>
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
                                    <th className="p-4 text-center text-xs font-semibold text-slate-100 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {sortedAndFilteredTickets.map((ticket) => (
                                    <TicketRow key={ticket.id} ticket={ticket} onReassign={openReassignModal} />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modale de réassignation */}
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Réassigner Ticket {selectedTicket.ref}</h3>
                        <select value={newAssigneeId} onChange={(e) => setNewAssigneeId(e.target.value)} className="form-select w-full mb-4">
                             <option value="">-- Retirer l'affectation --</option>
                            {tousLesMembresDesEquipes.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
                        </select>
                        <div className="flex justify-end space-x-3">
                            <button onClick={closeReassignModal} className="btn btn-secondary">Annuler</button>
                            <button onClick={handleReassignSubmit} className="btn btn-primary">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuiviAffectationsChefPage;