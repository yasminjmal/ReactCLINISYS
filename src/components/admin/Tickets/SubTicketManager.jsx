// src/components/admin/Tickets/SubTicketManager.jsx
import React from 'react';
import { Trash2, Edit, PlusCircle } from 'lucide-react';
import ticketService from '../../../services/ticketService';

const SubTicketManager = ({ parentTicket, onUpdate, showTemporaryMessage }) => {
    
    const handleDeleteSubTicket = async (subTicketId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce sous-ticket ?")) {
            try {
                await ticketService.deleteTicket(subTicketId);
                if (showTemporaryMessage) showTemporaryMessage('success', 'Sous-ticket supprimé.');
                onUpdate();
            } catch (error) {
                if (showTemporaryMessage) showTemporaryMessage('error', 'Erreur lors de la suppression.');
            }
        }
    };

    const handleEditSubTicket = (subTicket) => {
        alert(`Logique de modification pour le sous-ticket: ${subTicket.titre}\n(Affectation de module)`);
    };

    const handleAddSubTicket = () => {
        alert("Logique d'ajout d'un nouveau sous-ticket.");
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Gestion des Sous-tickets</h3>
                <button onClick={handleAddSubTicket} className="btn btn-primary">
                    <PlusCircle size={18} className="mr-2"/> Ajouter un sous-ticket
                </button>
            </div>
            <div className="overflow-x-auto border dark:border-slate-700 rounded-lg">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium">Titre</th>
                            <th className="px-4 py-2 text-left font-medium">Priorité</th>
                            <th className="px-4 py-2 text-left font-medium">Statut</th>
                            <th className="px-4 py-2 text-left font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-600">
                        {parentTicket.childTickets.map(sub => (
                            <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-2">{sub.titre}</td>
                                <td className="px-4 py-2">{sub.priorite}</td>
                                <td className="px-4 py-2">{sub.statue}</td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEditSubTicket(sub)} title="Modifier" className="p-1.5 text-slate-500 hover:text-blue-500"><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteSubTicket(sub.id)} title="Supprimer" className="p-1.5 text-slate-500 hover:text-red-500"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubTicketManager;