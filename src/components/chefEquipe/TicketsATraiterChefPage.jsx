// src/components/chefEquipe/TicketsATraiterChefPage.jsx
import React, { useState, useMemo } from 'react';
import { Search, Info, ArrowDown, ArrowUp, UserPlus, XCircle } from 'lucide-react';
import TicketRow from './TicketRow'; // On importe le nouveau composant partagé

const TicketsATraiterChefPage = ({ ticketsNonAssignes, equipesDuChef, onAssignerTicketAEmploye, onRefuserTicketParChef, ...detailHandlers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'dateCreation', direction: 'descending' });
  const [modalState, setModalState] = useState({ type: null, ticket: null });
  const [assigneeId, setAssigneeId] = useState('');
  const [refusMotif, setRefusMotif] = useState('');

  const openModal = (type, ticket) => {
      setModalState({ type, ticket });
      if (type === 'refus') setRefusMotif('');
      if (type === 'assign') setAssigneeId('');
  };
  const closeModal = () => setModalState({ type: null, ticket: null });

  const handleAssignSubmit = () => {
      if (!assigneeId) return;
      const allMembers = equipesDuChef.flatMap(e => e.utilisateurs || []);
      const employe = allMembers.find(u => u.id.toString() === assigneeId);
      if (employe) onAssignerTicketAEmploye(modalState.ticket.id, employe);
      closeModal();
  };
  const handleRefusSubmit = () => {
      if (!refusMotif.trim()) return;
      onRefuserTicketParChef(modalState.ticket.id, refusMotif);
      closeModal();
  };

  const getNestedValue = (obj, path) => {
    if (!path || !obj) return null;
    return path.split('.').reduce((p, c) => (p && p[c] !== undefined) ? p[c] : null, obj);
  };

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

  return (
    <div>
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Tickets à Traiter</h1>
                <p className="text-slate-500 mt-1">Assignez ou refusez les tickets en attente.</p>
            </div>
            <div className="relative w-full sm:w-64">
                <Search className="h-5 w-5 text-slate-400 absolute inset-y-0 left-3 flex items-center pointer-events-none" />
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input w-full pl-10" />
            </div>
        </header>

        <div className="bg-white rounded-xl shadow-md">
            <div className="overflow-x-auto">
                {sortedAndFilteredTickets.length === 0 ? (
                    <div className="text-center py-16"><Info size={48} className="mx-auto text-slate-400 mb-4" /><p className="text-slate-500">Aucun ticket à traiter.</p></div>
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
                                <th className="p-4 text-center text-xs font-semibold text-slate-100 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {sortedAndFilteredTickets.map(ticket => (
                                <TicketRow
                                    key={ticket.id}
                                    ticket={ticket}
                                    actions={
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); openModal('assign', ticket); }} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-md" title="Assigner"><UserPlus size={16} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); openModal('refus', ticket); }} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md" title="Refuser"><XCircle size={16} /></button>
                                        </>
                                    }
                                    {...detailHandlers}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
        
        {modalState.type === 'assign' && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-4">Assigner Ticket {modalState.ticket.ref}</h3>
                    <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="form-select w-full mb-4">
                        <option value="">Sélectionner un employé...</option>
                        {equipesDuChef.flatMap(e => e.utilisateurs || []).filter(u => u.actif).map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
                    </select>
                    <div className="flex justify-end space-x-3"><button onClick={closeModal} className="btn btn-secondary">Annuler</button><button onClick={handleAssignSubmit} className="btn btn-primary" disabled={!assigneeId}>Confirmer</button></div>
                </div>
            </div>
        )}
        {modalState.type === 'refus' && (
             <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                 <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                     <h3 className="text-lg font-semibold mb-4">Refuser Ticket {modalState.ticket.ref}</h3>
                     <textarea value={refusMotif} onChange={(e) => setRefusMotif(e.target.value)} className="form-textarea w-full mb-4" rows="3" placeholder="Motif du refus..."/>
                     <div className="flex justify-end space-x-3"><button onClick={closeModal} className="btn btn-secondary">Annuler</button><button onClick={handleRefusSubmit} className="btn btn-danger" disabled={!refusMotif.trim()}>Refuser</button></div>
                 </div>
             </div>
        )}
    </div>
  );
};

export default TicketsATraiterChefPage;