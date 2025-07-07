// src/components/admin/Tickets/DiffractionForm.jsx
import React, { useState } from 'react';
import { PlusCircle, X, Send, Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import ticketService from '../../../services/ticketService';

// Composant Spinner
const Spinner = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>;

// Composant Toast (identique, juste pour la complétude)
const ToastMessage = ({ message, type, onClose }) => {
    let bgColor, icon, titleColor, borderColor;
    switch (type) {
        case 'success':
            bgColor = 'bg-green-500'; titleColor = 'text-white'; borderColor = 'border-green-600';
            icon = <CheckCircle size={20} className="text-white" />;
            break;
        case 'error':
            bgColor = 'bg-red-500'; titleColor = 'text-white'; borderColor = 'border-red-600';
            icon = <AlertTriangle size={20} className="text-white" />;
            break;
        case 'info':
            bgColor = 'bg-blue-500'; titleColor = 'text-white'; borderColor = 'border-blue-600';
            icon = <Info size={20} className="text-white" />;
            break;
        default:
            bgColor = 'bg-gray-500'; titleColor = 'text-white'; borderColor = 'border-gray-600';
            icon = null;
    }

    return (
        <div className={`fixed bottom-4 right-4 ${bgColor} ${titleColor} px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transform transition-transform duration-300 ease-out translate-y-0 opacity-100 border-2 ${borderColor} font-semibold`}>
            {icon}
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                <X size={16} />
            </button>
        </div>
    );
};

const DiffractionForm = ({ parentTicket, onClose, onSuccess, setToast }) => {
    const [subTickets, setSubTickets] = useState([{ titre: '', description: '', priorite: 'Moyenne' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const priorities = ["Basse", "Moyenne", "Haute"];
    console.log(parentTicket)


    const handleAddSubTicket = () => {
        setSubTickets([...subTickets, { titre: '', description: '', priorite: 'Moyenne' }]);
    };
    
    const handleRemoveSubTicket = (indexToRemove) => {
        if (subTickets.length <= 1) return; // Empêche de supprimer le dernier champ
        setSubTickets(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    /**
     * MODIFICATION : Mise à jour de l'état de manière immuable pour plus de stabilité.
     * On crée une copie de l'objet à modifier au lieu de le muter directement.
     */
    const handleSubTicketChange = (index, field, value) => {
        const newSubTickets = subTickets.map((ticket, i) => {
            if (i === index) {
                return { ...ticket, [field]: value };
            }
            return ticket;
        });
        setSubTickets(newSubTickets);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Toujours appeler preventDefault dans un handler de formulaire
        
        const ticketsToCreate = subTickets.filter(t => t.titre.trim() !== '');
        if (ticketsToCreate.length === 0) {
            setToast({ type: 'error', message: 'Veuillez renseigner au moins un sous-ticket.' });
            return;
        }

        setIsSubmitting(true);
        const creationPromises = ticketsToCreate.map(subTicket => {
            const payload = {
                ...subTicket,
                // Assurez-vous que les valeurs correspondent à ce que le backend attend (ex: 'EN_ATTENTE')
                priorite: subTicket.priorite,
                statue: 'Accepte',
                idParentTicket: parentTicket.id,
                idClient: parentTicket.idClient.id,
                actif: true,
            };
            console.log(payload)
            return ticketService.createTicket(payload);
        });

        try {
            await Promise.all(creationPromises);
            onSuccess(); // Appelle la fonction de succès du parent
            // Le toast de succès est maintenant géré par le composant parent `TicketUpdateView`
        } catch (error) {
            console.error("Erreur lors de la création des sous-tickets:", error);
            setToast({ type: 'error', message: error.response?.data?.message || "Erreur lors de la création des sous-tickets." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Créer des Sous-tickets</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400"><X size={20}/></button>
                </div>
                
                {/* L'ID ici permet de lier le bouton de soumission externe au formulaire */}
                <form id="diffraction-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {subTickets.map((st, index) => (
                        <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-md space-y-3 bg-slate-50 dark:bg-slate-800/50 relative">
                            {subTickets.length > 1 && (
                                <button type="button" onClick={() => handleRemoveSubTicket(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30" title="Supprimer ce sous-ticket">
                                    <Trash2 size={16} />
                                </button>
                            )}
                            <h4 className="font-semibold text-slate-700 dark:text-slate-200">Sous-ticket #{index + 1}</h4>
                            <div>
                                <label className="form-label">Titre *</label>
                                <input type="text" value={st.titre} onChange={(e) => handleSubTicketChange(index, 'titre', e.target.value)} className="form-input" placeholder="Titre du sous-ticket" required />
                            </div>
                            <div>
                                <label className="form-label">Description</label>
                                <textarea value={st.description} onChange={(e) => handleSubTicketChange(index, 'description', e.target.value)} className="form-textarea" rows="2" placeholder="Description (optionnel)"></textarea>
                            </div>
                            <div>
                                <label className="form-label">Priorité</label>
                                <select value={st.priorite} onChange={(e) => handleSubTicketChange(index, 'priorite', e.target.value)} className="form-select">
                                    {priorities.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddSubTicket} className="btn btn-secondary w-full">
                        <PlusCircle size={18} className="mr-2"/> Ajouter un autre sous-ticket
                    </button>
                </form>

                <div className="flex-shrink-0 flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>Annuler</button>
                    {/*
                      * MODIFICATION : Le onClick a été retiré. Le type="submit" et l'attribut `form` suffisent.
                      * Cela résout le problème du double appel de la fonction handleSubmit.
                    */}
                    <button type="submit" form="diffraction-form" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? <Spinner /> : <Send size={16} className="mr-2"/>}
                        {isSubmitting ? "Création..." : "Confirmer la Création"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiffractionForm;