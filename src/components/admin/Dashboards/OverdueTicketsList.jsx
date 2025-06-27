// src/pages/Admin/Dashboards/OverdueTicketsList.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Tag, User } from 'lucide-react'; // Icônes
import dashboardService from '../../../services/dashboardService';

// Helper pour formater la date
const formatDisplayDate = (dateArray) => {
  if (!dateArray) return 'N/A';
  try {
    const [year, month, day, hour = 0, minute = 0] = dateArray;
    const date = new Date(year, month - 1, day, hour, minute);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return 'Date invalide';
  }
};

const PriorityBadge = ({ priority }) => {
    let bgColor = 'bg-slate-200';
    let textColor = 'text-slate-800';
    if (priority === 'HAUTE') { bgColor = 'bg-red-100 dark:bg-red-900/50'; textColor = 'text-red-700 dark:text-red-300'; }
    else if (priority === 'MOYENNE') { bgColor = 'bg-yellow-100 dark:bg-yellow-900/50'; textColor = 'text-yellow-700 dark:text-yellow-300'; }
    else if (priority === 'BASSE') { bgColor = 'bg-green-100 dark:bg-green-900/50'; textColor = 'text-green-700 dark:text-green-300'; }
    return <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>{priority}</span>;
};

const OverdueTicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverdueTickets = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getOverdueTickets();
        setTickets(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des tickets en retard:", err);
        setError("Impossible de charger la liste des tickets en retard.");
      } finally {
        setLoading(false);
      }
    };

    fetchOverdueTickets();
    // Rafraîchir toutes les 5 minutes pour un widget important
    const interval = setInterval(fetchOverdueTickets, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement des tickets en retard...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
        <AlertTriangle size={24} className="text-red-500 mr-2" /> Tickets en Retard ({tickets.length})
      </h3>
      {tickets.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Titre</th>
                <th className="px-4 py-2 text-left font-medium">Client</th>
                <th className="px-4 py-2 text-left font-medium">Affecté à</th>
                <th className="px-4 py-2 text-left font-medium">Priorité</th>
                <th className="px-4 py-2 text-left font-medium">Échéance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-red-50/50 dark:hover:bg-red-900/20">
                  <td className="px-4 py-2 text-slate-800 dark:text-slate-100">{ticket.titre}</td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center"><User size={14} className="mr-1"/>{ticket.idClient?.nomComplet || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center">
                        <User size={14} className="mr-1"/>
                        {ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom} ${ticket.idUtilisateur.nom}` : 'Non assigné'}
                    </div>
                  </td>
                  <td className="px-4 py-2"><PriorityBadge priority={ticket.priorite} /></td>
                  <td className="px-4 py-2 text-red-600 dark:text-red-400 font-semibold">
                    <div className="flex items-center"><Clock size={14} className="mr-1"/>{formatDisplayDate(ticket.date_echeance)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-slate-500 dark:text-slate-400 italic">Aucun ticket en retard pour le moment. Tout est à jour !</p>
      )}
    </div>
  );
};

export default OverdueTicketsList;