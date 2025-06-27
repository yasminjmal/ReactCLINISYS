// src/pages/Admin/Dashboards/GlobalTicketStatsWidget.jsx
import React, { useState, useEffect } from 'react';
import { Ticket, Hourglass, PlayCircle, CheckCircle, XCircle, CalendarDays } from 'lucide-react'; // Icônes de Lucide React
import dashboardService from '../../../services/dashboardService'; // Importez le service

const StatCard = ({ title, value, icon: Icon, bgColor, textColor }) => (
    <div className={`flex items-center p-4 rounded-lg shadow-md ${bgColor} ${textColor}`}>
        <div className="flex-shrink-0 mr-4">
            {Icon && <Icon size={32} />}
        </div>
        <div>
            <h4 className="text-sm font-medium">{title}</h4>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const GlobalTicketStatsWidget = () => {
    const [stats, setStats] = useState({
        totalTickets: 0,
        ticketsEnAttente: 0,
        ticketsEnCours: 0,
        ticketsAcceptes: 0, // Ajouté si vous souhaitez l'afficher
        ticketsTerminesToday: 0,
        ticketsTerminesThisWeek: 0,
        ticketsRefuses: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await dashboardService.getGlobalTicketCounts();
                setStats(data);
            } catch (err) {
                console.error("Erreur lors de la récupération des stats globales des tickets:", err);
                setError("Impossible de charger les statistiques globales des tickets.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        // Optionnel: rafraîchir les stats régulièrement si elles sont très dynamiques
        // const interval = setInterval(fetchStats, 60000); // toutes les minutes
        // return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement des statistiques globales...</div>;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
                title="Tickets Totaux"
                value={stats.totalTickets}
                icon={Ticket}
                bgColor="bg-blue-500"
                textColor="text-white"
            />
            <StatCard
                title="En Attente"
                value={stats.ticketsEnAttente}
                icon={Hourglass}
                bgColor="bg-yellow-500"
                textColor="text-white"
            />
            <StatCard
                title="En Cours"
                value={stats.ticketsEnCours}
                icon={PlayCircle}
                bgColor="bg-orange-500"
                textColor="text-white"
            />
            <StatCard
                title="Acceptés"
                value={stats.ticketsAcceptes} // Assurez-vous que cette clé est bien renvoyée par le backend si vous la voulez
                icon={CheckCircle}
                bgColor="bg-green-500"
                textColor="text-white"
            />
             <StatCard
                title="Terminés Aujourd'hui"
                value={stats.ticketsTerminesToday}
                icon={CalendarDays}
                bgColor="bg-purple-500"
                textColor="text-white"
            />
             <StatCard
                title="Terminés cette semaine"
                value={stats.ticketsTerminesThisWeek}
                icon={CalendarDays}
                bgColor="bg-indigo-500"
                textColor="text-white"
            />
            <StatCard
                title="Refusés"
                value={stats.ticketsRefuses}
                icon={XCircle}
                bgColor="bg-red-500"
                textColor="text-white"
            />
            {/* Ajoutez d'autres cartes si nécessaire */}
        </div>
    );
};

export default GlobalTicketStatsWidget;