// src/components/admin/Tickets/DiffractionForm.jsx
import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import ticketService from '../../../services/ticketService';

const DiffractionForm = ({ parentTicketId, parentTicketClientId, onClose, onSuccess, showTemporaryMessage }) => {
    const [subTickets, setSubTickets] = useState([{ titre: '', description: '', priorite: 'MOYENNE' }]);

    const handleAddSubTicket = () => {
        setSubTickets([...subTickets, { titre: '', description: '', priorite: 'MOYENNE' }]);
    };
    
    const handleSubTicketChange = (index, field, value) => {
        const newSubTickets = [...subTickets];
        newSubTickets[index][field] = value;
        setSubTickets(newSubTickets);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ticketsToCreate = subTickets.filter(t => t.titre.trim() !== '');
        if (ticketsToCreate.length === 0) {
            if (showTemporaryMessage) showTemporaryMessage('error', 'Veuillez renseigner au moins un sous-ticket.');
            return;
        }

        const creationPromises = ticketsToCreate.map(subTicket => {
            const payload = {
                ...subTicket,
                statue: 'ACCEPTE',
                idParentTicket: parentTicketId,
                idClient: parentTicketClientId,
            };
            return ticketService.createTicket(payload);
        });

        try {
            await Promise.all(creationPromises);
            onSuccess();
        } catch (error) {
            console.error("Erreur lors de la création des sous-tickets:", error);
            if (showTemporaryMessage) showTemporaryMessage('error', "Une erreur est survenue lors de la création d'un ou plusieurs sous-tickets.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Créer des Sous-tickets</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {subTickets.map((st, index) => (
                        <div key={index} className="p-4 border dark:border-slate-700 rounded-md space-y-3">
                            <h4 className="font-semibold">Sous-ticket #{index + 1}</h4>
                            <div>
                                <label className="form-label text-xs">Titre *</label>
                                <input type="text" value={st.titre} onChange={(e) => handleSubTicketChange(index, 'titre', e.target.value)} className="form-input" placeholder="Titre du sous-ticket" required />
                            </div>
                             <div>
                                <label className="form-label text-xs">Description</label>
                                <textarea value={st.description} onChange={(e) => handleSubTicketChange(index, 'description', e.target.value)} className="form-textarea" rows="2" placeholder="Description (optionnel)"></textarea>
                            </div>
                            <div>
                                <label className="form-label text-xs">Priorité</label>
                                <select value={st.priorite} onChange={(e) => handleSubTicketChange(index, 'priorite', e.target.value)} className="form-select">
                                    <option value="HAUTE">Haute</option>
                                    <option value="MOYENNE">Moyenne</option>
                                    <option value="BASSE">Basse</option>
                                </select>
                            </div>
                        </div>
                    ))}
                     <button type="button" onClick={handleAddSubTicket} className="btn btn-secondary w-full">
                        <PlusCircle size={18} className="mr-2"/> Ajouter un autre sous-ticket
                    </button>
                </form>
                 <div className="flex-shrink-0 flex justify-end space-x-3 mt-6 pt-4 border-t dark:border-slate-700">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
                    <button type="submit" onClick={handleSubmit} className="btn btn-primary">Confirmer la Création</button>
                </div>
            </div>
        </div>
    );
};

export default DiffractionForm;