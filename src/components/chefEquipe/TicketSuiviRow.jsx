// src/components/chefEquipe/TicketRowChef.jsx
import React, { useState } from 'react';
import { UserPlus, XCircle, Edit, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// --- Sous-composants pour le style visuel ---
const getProfileImageUrl = (user) => user?.photo ? `data:image/jpeg;base64,${user.photo}` : `https://i.pravatar.cc/150?u=${user?.id || 'default'}`;

const PriorityIndicator = ({ priority }) => {
    const styles = { Haute: 'text-red-500', Moyenne: 'text-orange-500', Basse: 'text-sky-500' };
    const text = priority || 'N/A';
    const dotCount = text === 'Haute' ? 3 : text === 'Moyenne' ? 2 : 1;
    return (
        <div className="flex items-center gap-2">
            <span className={`flex gap-0.5 ${styles[text] || 'text-slate-400'}`}>
                {[...Array(3)].map((_, i) => <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < dotCount ? 'bg-current' : 'bg-slate-300'}`}></span>)}
            </span>
            {text}
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        'Nouveau': 'bg-blue-100 text-blue-800',
        'En_cours': 'bg-yellow-100 text-yellow-800',
        'Termine': 'bg-green-100 text-green-800',
        'Refuse': 'bg-red-100 text-red-800',
    };
    const formattedStatus = status ? status.replace('_', ' ') : 'N/A';
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-slate-100 text-slate-800'}`}>{formattedStatus}</span>;
};


const TicketRowChef = ({ 
    ticket,
    equipeMembres = [],
    actions, // 'assign' | 'reassign' | 'none'
    onAssigner,
    onRefuser,
    onReassign,
}) => {
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedEmployeId, setSelectedEmployeId] = useState('');
    const [showRefusModal, setShowRefusModal] = useState(false);
    const [motifRefus, setMotifRefus] = useState('');
    const [showReassignModal, setShowReassignModal] = useState(false);

    const formatDate = (dateArray) => {
        if (!dateArray || !Array.isArray(dateArray)) return 'N/A';
        try {
            return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString('fr-FR');
        } catch { return 'Date invalide'; }
    };

    const handleActionSubmit = (action, ...args) => {
        action(...args);
        // Fermer toutes les modales
        setShowAssignModal(false);
        setShowRefusModal(false);
        setShowReassignModal(false);
    };

    const renderActions = () => {
        switch (actions) {
            case 'assign':
                return (
                    <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => setShowAssignModal(true)} className="btn btn-primary-outline btn-xs p-2" title="Assigner"><UserPlus size={16} /></button>
                        <button onClick={() => setShowRefusModal(true)} className="btn btn-danger-outline btn-xs p-2" title="Refuser"><XCircle size={16} /></button>
                    </div>
                );
            case 'reassign':
                return (
                    <div className="flex items-center justify-center">
                        <button onClick={() => setShowReassignModal(true)} className="btn btn-secondary-outline btn-xs p-2" title="Modifier l'affectation"><Edit size={16} /></button>
                    </div>
                );
            case 'none':
            default:
                return <span className="text-slate-400 italic">Aucune</span>;
        }
    };

    return (
        <>
            <tr className="bg-white hover:bg-slate-50 transition-colors">
                <td className="p-3 text-sm text-slate-700 align-middle border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <img src={getProfileImageUrl(ticket.idClient)} alt="" className="w-9 h-9 rounded-full object-cover" />
                        <div>
                            <p className="font-semibold">{ticket.idClient?.nomComplet || 'N/A'}</p>
                            <p className="text-xs text-slate-500">Réf: {ticket.ref}</p>
                        </div>
                    </div>
                </td>
                <td className="p-3 text-sm text-slate-600 align-middle border-b border-slate-200">{ticket.userCreation || 'N/A'}</td>
                <td className="p-3 text-sm text-slate-800 font-semibold align-middle border-b border-slate-200">{ticket.titre}</td>
                <td className="p-3 text-sm text-slate-600 align-middle border-b border-slate-200">{ticket.idModule?.designation || 'N/A'}</td>
                <td className="p-3 text-sm text-slate-600 align-middle border-b border-slate-200">{ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom} ${ticket.idUtilisateur.nom}` : <span className="italic text-slate-400">Non assigné</span>}</td>
                <td className="p-3 text-sm text-slate-600 align-middle border-b border-slate-200">{formatDate(ticket.dateCreation)}</td>
                <td className="p-3 text-sm text-slate-600 align-middle border-b border-slate-200"><PriorityIndicator priority={ticket.priorite} /></td>
                <td className="p-3 text-sm text-slate-600 align-middle border-b border-slate-200"><StatusBadge status={ticket.statue} /></td>
                <td className="p-3 text-sm text-slate-600 align-middle border-b border-slate-200 text-center">{renderActions()}</td>
            </tr>

            {/* Modales */}
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
                            <button onClick={() => handleActionSubmit(onAssigner, ticket.id, equipeMembres.find(m => m.id.toString() === selectedEmployeId))} className="btn btn-primary" disabled={!selectedEmployeId}>Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
            {showRefusModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Refuser Ticket {ticket.ref}</h3>
                        <textarea value={motifRefus} onChange={(e) => setMotifRefus(e.target.value)} className="form-textarea w-full mb-4" rows="3" placeholder="Motif du refus..."/>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setShowRefusModal(false)} className="btn btn-secondary">Annuler</button>
                            <button onClick={() => handleActionSubmit(onRefuser, ticket.id, motifRefus)} className="btn btn-danger" disabled={!motifRefus.trim()}>Refuser</button>
                        </div>
                    </div>
                </div>
            )}
             {showReassignModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Réassigner Ticket {ticket.ref}</h3>
                        <select value={selectedEmployeId} onChange={(e) => setSelectedEmployeId(e.target.value)} className="form-select w-full mb-4">
                             <option value="">-- Retirer l'affectation --</option>
                            {equipeMembres.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
                        </select>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setShowReassignModal(false)} className="btn btn-secondary">Annuler</button>
                            <button onClick={() => handleActionSubmit(onReassign, ticket.id, equipeMembres.find(m => m.id.toString() === selectedEmployeId))} className="btn btn-primary">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TicketRowChef;