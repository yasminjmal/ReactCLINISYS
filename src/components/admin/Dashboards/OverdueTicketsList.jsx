// src/components/admin/Dashboards/OverdueTicketsList.jsx
// Mise à jour pour un format plus lisible (non-tableau strict)
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, User, Mail, Info } from 'lucide-react'; 
import dashboardService from '../../../services/dashboardService';

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

const OverdueTicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';

    let date;

    if (Array.isArray(dateInput) && dateInput.length >= 3) {
        const [year, month, day, hours = 0, minutes = 0, seconds = 0] = dateInput;
        date = new Date(year, month - 1, day, hours, minutes, seconds);
    } else {
        date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) {
        console.error('Invalid date input:', dateInput);
        return 'Date invalide';
    }

    return date.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short', 
        year: '2-digit', 
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

  const handleSendReminder = (ticketId, ticketTitle) => {
    alert(`Envoi d'un rappel par mail pour le ticket : "${ticketTitle}" (ID: ${ticketId})`);
    // TODO: Implement actual email sending logic via API call
  };


  useEffect(() => {
    const fetchOverdueTickets = async () => {
      try {
        setLoading(true);
        // Using static data for now. Replace with actual API call:
        // const data = await dashboardService.getOverdueTickets();
        const data = [
            { id: 'ot1', titre: 'Serveur en panne', priorite: 'HAUTE', date_echeance: [2025, 7, 1, 10, 0], idClient: { nomComplet: 'Client Alpha' }, idUtilisateur: null },
            { id: 'ot2', titre: 'Problème de licence', priorite: 'MOYENNE', date_echeance: [2025, 7, 3, 14, 0], idClient: { nomComplet: 'Client Beta' }, idUtilisateur: { prenom: 'Sophie', nom: 'Martin' } },
            { id: 'ot3', titre: 'Accès VPN', priorite: 'BASSE', date_echeance: [2025, 6, 28, 9, 0], idClient: { nomComplet: 'Client Gamma' }, idUtilisateur: { prenom: 'Jean', nom: 'Doe' } },
            { id: 'ot4', titre: 'Migration BD', priorite: 'HAUTE', date_echeance: [2025, 7, 2, 16, 0], idClient: { nomComplet: 'Client Delta' }, idUtilisateur: null },
        ];
        setTickets(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des tickets en retard:", err);
        setError("Impossible de charger la liste des tickets en retard.");
      } finally {
        setLoading(false);
      }
    };

    fetchOverdueTickets();
    const interval = setInterval(fetchOverdueTickets, 300000); 
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
            <div key={ticket.id} className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={ticket.titre}>{ticket.titre}</p>
                <div className="flex items-center text-xs text-slate-600 dark:text-slate-300 mt-1">
                  <User size={12} className="mr-1 opacity-70" /> {ticket.idClient?.nomComplet || 'N/A'}
                  <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                  <Clock size={12} className="mr-1 opacity-70 text-red-500" /> <span className="text-red-600 dark:text-red-400 font-medium">{formatDate(ticket.date_echeance)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <PriorityBadge priority={ticket.priorite} />
                <button
                  onClick={() => handleSendReminder(ticket.id, ticket.titre)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xxs px-2 py-0.5 rounded-full flex items-center transition-colors duration-200"
                >
                  <Mail size={10} className="mr-1" /> Rappel
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 dark:text-slate-400 italic text-sm">Aucun ticket en retard pour le moment. Tout est à jour !</p>
      )}
    </div>
  );
};

export default OverdueTicketsList;