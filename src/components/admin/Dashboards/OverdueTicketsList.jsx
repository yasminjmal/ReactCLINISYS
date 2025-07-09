import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, User, Mail } from 'lucide-react';
import ticketService from '../../../services/ticketService';
import mailingService from '../../../services/mailingService'; // Import du nouveau service
import { formatDateFromArray } from '../../../utils/dateFormatter';

const PriorityBadge = ({ priority }) => {
    let bgColor = 'bg-slate-200';
    let textColor = 'text-slate-800';
    let icon = null;

    if (priority === 'HAUTE') {
        bgColor = 'bg-red-100 dark:bg-red-900/50';
        textColor = 'text-red-700 dark:text-red-300';
        icon = <AlertTriangle size={12} className="inline mr-1 text-red-500" />;
    } else if (priority === 'MOYENNE') {
        bgColor = 'bg-yellow-100 dark:bg-yellow-900/50';
        textColor = 'text-yellow-700 dark:text-yellow-300';
        icon = <AlertTriangle size={12} className="inline mr-1 text-yellow-500" />;
    } else if (priority === 'BASSE') {
        bgColor = 'bg-green-100 dark:bg-green-900/50';
        textColor = 'text-green-700 dark:text-green-300';
    }

    return (
        <span className={`inline-flex items-center px-1.5 py-0.5 text-xxs font-semibold rounded-full ${bgColor} ${textColor}`}>
            {icon} {priority}
        </span>
    );
};

const getUrgencyColor = (isoDateStr) => {
    if (!isoDateStr) return 'text-slate-500 dark:text-slate-300';
    const today = new Date();
    const dueDate = new Date(isoDateStr);
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const diffInTime = dueOnly.getTime() - todayOnly.getTime();
    const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

    if (diffInDays < 0) return 'text-red-600 dark:text-red-400'; // Overdue
    if (diffInDays === 0) return 'text-orange-700 dark:text-orange-400 font-semibold'; // Due today
    if (diffInDays <= 3) return 'text-yellow-600 dark:text-yellow-400'; // Near due
    return 'text-slate-500 dark:text-slate-300'; // Future
};

const OverdueTicketsList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notifyingTicketId, setNotifyingTicketId] = useState(null); // État pour suivre l'envoi

    const formatDate = (dateInput) => formatDateFromArray(dateInput);

    // La fonction appelle maintenant le service de mailing
    const handleSendReminder = async (ticketId) => {
        setNotifyingTicketId(ticketId); // Désactive le bouton pour ce ticket
        try {
            const response = await mailingService.sendLateTicketNotification(ticketId);
            alert(response); // Affiche le message de succès de l'API
        } catch (err) {
            const errorMessage = err.response?.data || "Une erreur est survenue lors de l'envoi de la notification.";
            alert(`Erreur : ${errorMessage}`);
        } finally {
            setNotifyingTicketId(null); // Réactive le bouton
        }
    };

    useEffect(() => {
        const fetchOverdueTickets = async () => {
            try {
                setLoading(true);
                const data = await ticketService.getTickets();
                
                // Filtrer pour ne garder que les tickets en retard et non terminés/refusés
                const overdueAndOpenTickets = data.filter(ticket => {
                    if (!ticket.date_echeance) return false;
                    
                    const dueDate = new Date(ticket.date_echeance);
                    const today = new Date();
                    
                    const isOverdue = dueDate < today;
                    const isOpen = ticket.statue !== 'termine' && ticket.statue !== 'refuse';
                    
                    return isOverdue && isOpen;
                });
                
                setTickets(overdueAndOpenTickets);
            } catch (err) {
                console.error("Erreur lors de la récupération des tickets en retard:", err);
                setError("Impossible de charger la liste des tickets en retard.");
            } finally {
                setLoading(false);
            }
        };

        fetchOverdueTickets();
        const interval = setInterval(fetchOverdueTickets, 300000); // Rafraîchit toutes les 5 minutes
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="text-center py-3 text-slate-600 dark:text-slate-400 text-sm">Chargement des tickets en retard...</div>;
    if (error) return <div className="text-center py-3 text-red-500 text-sm">{error}</div>;

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
                <AlertTriangle size={20} className="text-red-500 mr-2" /> Tickets en Retard ({tickets.length})
            </h3>
            {tickets.length > 0 ? (
                <div className="overflow-y-auto max-h-60 custom-scrollbar space-y-2">
                    {tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={ticket.titre}>
                                    {ticket.titre}
                                </p>
                                <div className="flex items-center text-xs mt-1">
                                    <User size={12} className="mr-1 opacity-70 text-slate-500 dark:text-slate-300" />
                                    <span className="text-slate-600 dark:text-slate-300">
                                        {ticket.idClient?.nomComplet || 'N/A'}
                                    </span>
                                    <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                                    <Clock size={12} className={`mr-1 opacity-70 ${getUrgencyColor(ticket.date_echeance)}`} />
                                    <span className={`${getUrgencyColor(ticket.date_echeance)} font-medium`}>
                                        {formatDate(ticket.date_echeance)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <PriorityBadge priority={ticket.priorite} />
                                <button
                                    onClick={() => handleSendReminder(ticket.id)}
                                    disabled={notifyingTicketId === ticket.id}
                                    className="bg-red-500 hover:bg-red-600 text-white text-xxs px-2 py-0.5 rounded-full flex items-center transition-colors duration-200 disabled:bg-red-300 disabled:cursor-not-allowed"
                                >
                                    <Mail size={10} className="mr-1" />
                                    {notifyingTicketId === ticket.id ? 'Envoi...' : 'Rappel'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 italic text-sm">
                    Aucun ticket en retard pour le moment. Tout est à jour !
                </p>
            )}
        </div>
    );
};

export default OverdueTicketsList;
