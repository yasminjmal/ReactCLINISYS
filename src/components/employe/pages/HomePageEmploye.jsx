// src/components/employe/pages/HomePageEmploye.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Home, CalendarDays, Clock, AlertTriangle, CheckCircle, FileText, XCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import ticketService from '../../../services/ticketService';

const HomePageEmploye = () => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentDate = new Date();

  const fetchTickets = useCallback(async () => {
    if (!currentUser || !currentUser.id) {
      setLoading(false);
      setError("Utilisateur non connecté ou ID utilisateur manquant.");
      return;
    }
    try {
      setLoading(true);
      const userTickets = await ticketService.getTicketsByUserId(currentUser.id);
      setTickets(userTickets || []);
      setError(null);
    } catch (err) {
      console.error("Échec du chargement des tickets pour la page d'accueil:", err);
      setError("Échec du chargement de vos données. Veuillez réessayer plus tard.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Filtrage et tri des échéances
  const { upcomingDeadlines, overdueDeadlines } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Pour comparer juste les dates

    const upcoming = [];
    const overdue = [];

    tickets.forEach(ticket => {
      if (ticket.date_echeance) {
        const echeanceDate = new Date(ticket.date_echeance);
        echeanceDate.setHours(0, 0, 0, 0);

        if (echeanceDate < now) {
          overdue.push(ticket);
        } else {
          upcoming.push(ticket);
        }
      }
    });

    // Tri des échéances: les plus proches ou les plus en retard d'abord
    upcoming.sort((a, b) => new Date(a.date_echeance).getTime() - new Date(b.date_echeance).getTime());
    overdue.sort((a, b) => new Date(b.date_echeance).getTime() - new Date(a.date_echeance).getTime()); // Les plus en retard en premier

    return { upcomingDeadlines: upcoming, overdueDeadlines: overdue };
  }, [tickets]);

  if (loading) {
    return (
      <div className="p-6 md:p-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-inner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Chargement de votre tableau de bord...</h2>
        <p className="text-slate-500 dark:text-slate-400">Veuillez patienter pendant que nous préparons votre page d'accueil.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-10 text-center bg-red-100 dark:bg-red-900/50 rounded-lg shadow-inner text-red-700 dark:text-red-300">
        <XCircle size={48} className="mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-3">Erreur de chargement</h2>
        <p>{error}</p>
        <p className="text-sm mt-2">Veuillez vérifier votre connexion ou réessayer plus tard.</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Carte de la date courante */}
        <div className="md:col-span-1 bg-gradient-to-br from-sky-500 to-blue-600 text-white p-6 rounded-lg shadow-lg flex flex-col justify-between items-center text-center">
          <CalendarDays size={48} className="mb-4" />
          <h3 className="text-xl font-bold mb-2">Date du Jour</h3>
          <p className="text-3xl font-extrabold">{currentDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-lg opacity-80 mt-1">{currentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        {/* Section Échéances Proches */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col">
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
            <Clock size={24} className="mr-2 text-sky-500" /> Échéances Proches
          </h3>
          <div className="flex-grow space-y-3 overflow-y-auto pr-2" style={{ maxHeight: '250px' }}>
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map(ticket => (
                <div key={ticket.id} className="bg-slate-50 dark:bg-slate-700 p-3 rounded-md border border-slate-100 dark:border-slate-600 flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText size={18} className="mr-2 text-blue-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{ticket.titre}</span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {new Date(ticket.date_echeance).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-4">Aucune échéance proche.</p>
            )}
          </div>
        </div>
      </div>

      {/* Section Échéances Dépassées */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col">
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
          <AlertTriangle size={24} className="mr-2 text-red-500" /> Échéances Dépassées
        </h3>
        <div className="flex-grow space-y-3 overflow-y-auto pr-2" style={{ maxHeight: '250px' }}>
          {overdueDeadlines.length > 0 ? (
            overdueDeadlines.map(ticket => (
              <div key={ticket.id} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-700 flex justify-between items-center">
                <div className="flex items-center">
                  <FileText size={18} className="mr-2 text-red-600" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300 truncate">{ticket.titre}</span>
                </div>
                <span className="text-xs text-red-600 dark:text-red-400">
                  {new Date(ticket.date_echeance).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-4">Aucune échéance dépassée.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePageEmploye;