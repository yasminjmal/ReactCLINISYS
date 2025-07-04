// src/components/chefEquipe/TicketRowChef.jsx
import React, { useState } from 'react';
import { UserPlus, XCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const TicketRowChef = ({ ticket, onAssigner, onRefuser, equipeMembres }) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployeId, setSelectedEmployeId] = useState('');
  const [showRefusModal, setShowRefusModal] = useState(false);
  const [motifRefus, setMotifRefus] = useState('');

  const getPriorityStyling = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'Haute': return { badge: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300', icon: <AlertTriangle size={12} className="text-red-500 mr-1" /> };
      case 'Moyenne': return { badge: 'bg-sky-100 text-sky-700 dark:bg-sky-700/20 dark:text-sky-300', icon: <AlertTriangle size={12} className="text-sky-500 mr-1" /> };
      case 'Basse': return { badge: 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300', icon: <CheckCircle size={12} className="text-green-500 mr-1" /> };
      default: return { badge: 'bg-slate-100 text-slate-700 dark:bg-slate-700/20 dark:text-slate-300', icon: null };
    }
  };

  const priorityStyle = getPriorityStyling(ticket.priorite);
  const dateCreationFormatted = ticket.dateCreation ? new Date(ticket.dateCreation[0], ticket.dateCreation[1] - 1, ticket.dateCreation[2]).toLocaleDateString('fr-CA') : 'N/A';
  const demandeurNom = ticket.userCreation || (ticket.idClient ? ticket.idClient.nomComplet : 'N/A');

  const handleAssignSubmit = () => {
    if (!selectedEmployeId) {
      alert("Veuillez sélectionner un employé.");
      return;
    }
    const employeSelectionne = equipeMembres.find(m => m.id.toString() === selectedEmployeId);
    onAssigner(ticket.id, employeSelectionne);
    setShowAssignModal(false);
    setSelectedEmployeId(''); // Reset state
  };

  const handleRefusSubmit = () => {
    if (!motifRefus.trim()) {
      alert("Veuillez entrer un motif de refus.");
      return;
    }
    onRefuser(ticket.id, motifRefus);
    setShowRefusModal(false);
    setMotifRefus(''); // Reset state
  };
  
  const openAssignModal = () => setShowAssignModal(true);
  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedEmployeId('');
  };

  const openRefusModal = () => setShowRefusModal(true);
  const closeRefusModal = () => {
    setShowRefusModal(false);
    setMotifRefus('');
  }

  const cellClass = "px-4 py-3 text-sm text-slate-700 dark:text-slate-200 align-middle border-b border-slate-200 dark:border-slate-700";

  return (
    <>
      <tr className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">
        <td className={`${cellClass} font-mono`}>{ticket.ref}</td>
        <td className={cellClass}>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{ticket.titre}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Client: {ticket.idClient?.nomComplet || 'N/A'}</p>
        </td>
        <td className={cellClass}>
          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${priorityStyle.badge}`}>
            {priorityStyle.icon}{ticket.priorite}
          </span>
        </td>
        <td className={cellClass}>
          {ticket.idModule?.designation || <span className="text-slate-400 italic">Non spécifié</span>}
        </td>
        <td className={cellClass}>{ticket.statue || 'N/A'}</td>
        <td className={cellClass}>{demandeurNom}</td>
        <td className={cellClass}>{dateCreationFormatted}</td>
        <td className={`${cellClass} text-center`}>
          <div className="flex items-center justify-center space-x-2">
            <button onClick={openAssignModal} className="btn btn-primary-outline btn-xs p-2" title="Assigner à un employé">
              <UserPlus size={16} />
            </button>
            <button onClick={openRefusModal} className="btn btn-danger-outline btn-xs p-2" title="Refuser le ticket">
              <XCircle size={16} />
            </button>
          </div>
        </td>
      </tr>

      {/* --- MODAL D'ASSIGNATION CONTRÔLÉE --- */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assigner Ticket {ticket.ref}</h3>
            <select
              value={selectedEmployeId} // L'état contrôle la valeur
              onChange={(e) => setSelectedEmployeId(e.target.value)} // L'état est mis à jour
              className="form-select w-full mb-4"
            >
              <option value="">Sélectionner un employé...</option>
              {equipeMembres.map(membre => (
                <option key={membre.id} value={membre.id}>{membre.prenom} {membre.nom}</option>
              ))}
            </select>
            <div className="flex justify-end space-x-3">
              <button onClick={closeAssignModal} className="btn btn-secondary">Annuler</button>
              <button onClick={handleAssignSubmit} className="btn btn-primary" disabled={!selectedEmployeId}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE REFUS CONTRÔLÉE --- */}
      {showRefusModal && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
         <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
           <h3 className="text-lg font-semibold mb-4">Refuser Ticket {ticket.ref}</h3>
           <textarea
             value={motifRefus} // L'état contrôle la valeur
             onChange={(e) => setMotifRefus(e.target.value)} // L'état est mis à jour
             className="form-textarea w-full mb-4"
             rows="3"
             placeholder="Motif du refus (obligatoire)..."
           />
           <div className="flex justify-end space-x-3">
             <button onClick={closeRefusModal} className="btn btn-secondary">Annuler</button>
             <button onClick={handleRefusSubmit} className="btn btn-danger" disabled={!motifRefus.trim()}>Refuser</button>
           </div>
         </div>
       </div>
      )}
    </>
  );
};

export default TicketRowChef;