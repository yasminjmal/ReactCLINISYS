// src/components/chefEquipe/TicketsATraiterChefPage.jsx
import React, { useState, useMemo } from 'react';
import { Search, Info, ArrowDown, ArrowUp, UserPlus, XCircle } from 'lucide-react';

// --- SOUS-COMPOSANTS VISUELS (INTERNES AU FICHIER) ---

const getProfileImageUrl = (user) => user?.photo ? `data:image/jpeg;base64,${user.photo}` : `https://i.pravatar.cc/150?u=${user?.id || 'default'}`;

const PriorityIndicator = ({ priority }) => {
    const styles = { 'Haute': 'text-red-600', 'Moyenne': 'text-orange-600', 'Basse': 'text-sky-600' };
    return <span className={`font-medium ${styles[priority] || 'text-slate-500'}`}>{priority || 'N/A'}</span>;
};

const StatusBadge = ({ status }) => {
    const styles = {
        'En_attente': 'bg-blue-100 text-blue-700',
        'En_cours': 'bg-yellow-100 text-yellow-700',
        'Accepte': 'bg-cyan-100 text-cyan-700',
        'Termine': 'bg-emerald-100 text-emerald-700',
        'Refuse': 'bg-red-100 text-red-700',
    };
    const formattedStatus = status ? status.replace('_', ' ') : 'N/A';
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
            {formattedStatus}
        </span>
    );
};

// --- COMPOSANT DE LIGNE DE TABLEAU (INTERNE AU FICHIER) ---
// Ce composant n'est pas exporté et gère sa propre logique de modales.
const TicketRow = ({ ticket, equipeMembres, onAssigner, onRefuser }) => {
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedEmployeId, setSelectedEmployeId] = useState('');
    const [showRefusModal, setShowRefusModal] = useState(false);
    const [motifRefus, setMotifRefus] = useState('');

    const formatDate = (dateArray) => {
        if (!dateArray || !Array.isArray(dateArray)) return 'N/A';
        try { return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString('fr-FR'); }
        catch { return 'Date invalide'; }
    };

    const handleAssignSubmit = () => {
        if (!selectedEmployeId || !onAssigner) return;
        const employe = equipeMembres.find(m => m.id.toString() === selectedEmployeId);
        if (employe) {
            onAssigner(ticket.id, employe);
        }
        setShowAssignModal(false);
    };

    const handleRefusSubmit = () => {
        if (!motifRefus.trim() || !onRefuser) return;
        onRefuser(ticket.id, motifRefus);
        setShowRefusModal(false);
    };

    return (
        <>
            <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="p-4 text-sm font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                        <img src={getProfileImageUrl(ticket.idClient)} alt="" className="w-9 h-9 rounded-md object-cover" />
                        <div>
                            <p>{ticket.idClient?.nomComplet || 'N/A'}</p>
                            <p className="text-xs text-slate-500">Réf: {ticket.ref}</p>
                        </div>
                    </div>
                </td>
                <td className="p-4 text-sm text-slate-600">{ticket.userCreation || 'N/A'}</td>
                <td className="p-4 text-sm text-slate-800 font-semibold">{ticket.titre}</td>
                <td className="p-4 text-sm text-slate-600">{ticket.idModule?.designation || 'N/A'}</td>
                <td className="p-4 text-sm text-slate-600">{formatDate(ticket.dateCreation)}</td>
                <td className="p-4 text-sm"><PriorityIndicator priority={ticket.priorite} /></td>
                <td className="p-4 text-sm"><StatusBadge status={ticket.statue} /></td>
                <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-1">
                        <button onClick={() => setShowAssignModal(true)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-md" title="Assigner"><UserPlus size={16} /></button>
                        <button onClick={() => setShowRefusModal(true)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md" title="Refuser"><XCircle size={16} /></button>
                    </div>
                </td>
            </tr>

            {/* Modale d'assignation */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Assigner Ticket {ticket.ref}</h3>
                        <select value={selectedEmployeId} onChange={(e) => setSelectedEmployeId(e.target.value)} className="form-select w-full mb-4">
                            <option value="">Sélectionner un employé...</option>
                            {equipeMembres.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
                        </select>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setShowAssignModal(false)} className="btn btn-secondary">Annuler</button>
                            <button onClick={handleAssignSubmit} className="btn btn-primary" disabled={!selectedEmployeId}>Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modale de refus */}
            {showRefusModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Refuser Ticket {ticket.ref}</h3>
                        <textarea value={motifRefus} onChange={(e) => setMotifRefus(e.target.value)} className="form-textarea w-full mb-4" rows="3" placeholder="Motif du refus..."/>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setShowRefusModal(false)} className="btn btn-secondary">Annuler</button>
                            <button onClick={handleRefusSubmit} className="btn btn-danger" disabled={!motifRefus.trim()}>Refuser</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};


// --- COMPOSANT PRINCIPAL DE LA PAGE ---
const TicketsATraiterChefPage = ({ ticketsNonAssignes, equipesDuChef, onAssignerTicketAEmploye, onRefuserTicketParChef }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'dateCreation', direction: 'descending' });

  const getNestedValue = (obj, path) => {
    if (!path || !obj) return null;
    return path.split('.').reduce((p, c) => (p && p[c] !== undefined) ? p[c] : null, obj);
  }

  const sortedAndFilteredTickets = useMemo(() => {
    let items = [...(ticketsNonAssignes || [])];

    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        items = items.filter(t =>
            (t.ref?.toLowerCase().includes(lowerSearch)) ||
            (t.titre?.toLowerCase().includes(lowerSearch)) ||
            (t.idClient?.nomComplet.toLowerCase().includes(lowerSearch))
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
  }, [ticketsNonAssignes, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
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

  return (
    <div>
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Tickets à Traiter</h1>
                <p className="text-slate-500 mt-1">Assignez ou refusez les nouveaux tickets en attente.</p>
            </div>
            <div className="relative w-full sm:w-64">
                <Search className="h-5 w-5 text-slate-400 absolute inset-y-0 left-3 flex items-center pointer-events-none" />
                <input type="text" placeholder="Rechercher un ticket..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input w-full pl-10" />
            </div>
        </header>

        <div className="bg-white rounded-xl shadow-md">
            <div className="overflow-x-auto">
                {sortedAndFilteredTickets.length === 0 ? (
                    <div className="text-center py-16">
                        <Info size={48} className="mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-500">{searchTerm ? "Aucun ticket ne correspond à votre recherche." : "Aucun nouveau ticket à traiter."}</p>
                    </div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-700">
                            <tr>
                                <SortableHeader label="Client / Réf." sortKey="idClient.nomComplet" />
                                <SortableHeader label="Demandeur" sortKey="userCreation" />
                                <SortableHeader label="Titre" sortKey="titre" />
                                <SortableHeader label="Module" sortKey="idModule.designation" />
                                <SortableHeader label="Créé le" sortKey="dateCreation" />
                                <SortableHeader label="Priorité" sortKey="priorite" />
                                <SortableHeader label="Statut" sortKey="statue" />
                                <th className="p-4 text-center text-xs font-semibold text-slate-100 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                        {sortedAndFilteredTickets.map(ticket => {
                            const equipeDuModule = equipesDuChef.find(eq => eq.id === ticket.idModule?.equipe?.id);
                            const membresEquipe = equipeDuModule ? (equipeDuModule.utilisateurs || []).filter(m => m.actif === true) : [];
                            return (
                                <TicketRow
                                    key={ticket.id}
                                    ticket={ticket}
                                    equipeMembres={membresEquipe}
                                    onAssigner={onAssignerTicketAEmploye}
                                    onRefuser={onRefuserTicketParChef}
                                />
                            );
                        })}
                        </tbody>
                    </table>
                )}
             </div>
        </div>
    </div>
  );
};

export default TicketsATraiterChefPage;