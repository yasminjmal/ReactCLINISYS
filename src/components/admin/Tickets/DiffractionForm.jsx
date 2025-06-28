// src/components/admin/Tickets/DiffractionForm.jsx
import React, { useState } from 'react';
import { PlusCircle, X, Send, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'; // Importez AlertTriangle et CheckCircle pour ToastMessage
import ticketService from '../../../services/ticketService';

// Composant Spinner (réutilisé de TicketUpdateView ou de la page de gestion principale)
const Spinner = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>;

// Composant de message de notification (Toast) - Réutilisé pour être cohérent
const ToastMessage = ({ message, type, onClose }) => {
    let bgColor, icon, titleColor, borderColor;
    switch (type) {
        case 'success':
            bgColor = 'bg-green-500';
            titleColor = 'text-white';
            borderColor = 'border-green-600';
            icon = <CheckCircle size={20} className="text-white" />;
            break;
        case 'error':
            bgColor = 'bg-red-500';
            titleColor = 'text-white';
            borderColor = 'border-red-600';
            icon = <AlertTriangle size={20} className="text-white" />;
            break;
        case 'info':
            bgColor = 'bg-blue-500';
            titleColor = 'text-white';
            borderColor = 'border-blue-600';
            icon = <Info size={20} className="text-white" />; // Si Info n'est pas importé, ajoutez-le ici
            break;
        default:
            bgColor = 'bg-gray-500';
            titleColor = 'text-white';
            borderColor = 'border-gray-600';
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


const DiffractionForm = ({ parentTicket, onClose, onSuccess, setToast }) => { // showTemporaryMessage remplacé par setToast
    const [subTickets, setSubTickets] = useState([{ titre: '', description: '', priorite: 'MOYENNE' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const priorities = ["BASSE", "MOYENNE", "HAUTE"]; // Utiliser les majuscules pour correspondre à l'enum si c'est le cas

    const handleAddSubTicket = () => {
        setSubTickets([...subTickets, { titre: '', description: '', priorite: 'MOYENNE' }]);
    };
    
    const handleRemoveSubTicket = (indexToRemove) => { // Nouvelle fonction pour supprimer un sous-ticket
        setSubTickets(prev => prev.filter((_, index) => index !== indexToRemove));
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
            setToast({ type: 'error', message: 'Veuillez renseigner au moins un sous-ticket.' }); // Utilisation de setToast
            return;
        }

        setIsSubmitting(true);
        const creationPromises = ticketsToCreate.map(subTicket => {
            const payload = {
                ...subTicket,
                statue: 'EN_ATTENTE', // Statut par défaut pour un nouveau sous-ticket
                idParentTicket: parentTicket.id,
                idClient: parentTicket.idClient?.id, // Assurez-vous que l'ID du client parent est bien passé
                actif: true, // Par défaut actif
            };
            return ticketService.createTicket(payload);
        });

        try {
            await Promise.all(creationPromises);
            onSuccess(); // Appelle la fonction de succès du parent (rafraîchit et ferme le modal)
            setToast({ type: 'success', message: 'Sous-tickets créés avec succès !' }); // Utilisation de setToast
        } catch (error) {
            console.error("Erreur lors de la création des sous-tickets:", error);
            setToast({ type: 'error', message: error.response?.data?.message || "Une erreur est survenue lors de la création d'un ou plusieurs sous-tickets." }); // Utilisation de setToast
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
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {subTickets.map((st, index) => (
                        <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-md space-y-3 bg-slate-50 dark:bg-slate-800/50 relative">
                            {subTickets.length > 1 && ( // Afficher le bouton de suppression seulement si plus d'un sous-ticket
                                <button type="button" onClick={() => handleRemoveSubTicket(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30" title="Supprimer ce sous-ticket">
                                    <Trash2 size={16} />
                                </button>
                            )}
                            <h4 className="font-semibold text-slate-700 dark:text-slate-200">Sous-ticket #{index + 1}</h4>
                            <div>
                                <label className="form-label">Titre *</label> {/* Utilisation de form-label */}
                                <input type="text" value={st.titre} onChange={(e) => handleSubTicketChange(index, 'titre', e.target.value)} className="form-input" placeholder="Titre du sous-ticket" required /> {/* Utilisation de form-input */}
                            </div>
                             <div>
                                <label className="form-label">Description</label> {/* Utilisation de form-label */}
                                <textarea value={st.description} onChange={(e) => handleSubTicketChange(index, 'description', e.target.value)} className="form-textarea" rows="2" placeholder="Description (optionnel)"></textarea> {/* Utilisation de form-textarea */}
                            </div>
                            <div>
                                <label className="form-label">Priorité</label> {/* Utilisation de form-label */}
                                <select value={st.priorite} onChange={(e) => handleSubTicketChange(index, 'priorite', e.target.value)} className="form-select"> {/* Utilisation de form-select */}
                                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                     <button type="button" onClick={handleAddSubTicket} className="btn btn-secondary w-full"> {/* Styles standardisés */}
                        <PlusCircle size={18} className="mr-2"/> Ajouter un autre sous-ticket
                    </button>
                </form>
                 <div className="flex-shrink-0 flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700"> {/* Styles standardisés */}
                    <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>Annuler</button>
                    <button type="submit" onClick={handleSubmit} className="btn btn-primary" disabled={isSubmitting}> {/* Styles standardisés */}
                        {isSubmitting ? <Spinner /> : <Send size={16} className="mr-2"/>}
                        {isSubmitting ? "Création..." : "Confirmer la Création"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiffractionForm;