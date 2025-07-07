// src/components/admin/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ClipboardList,
  CalendarDays,
  Users,
  Building,
  Box,
  Clock,
  MessageSquare,
  BarChart2, // Keep BarChart2 for both charts
  Target,
  List,
  Zap,
  Mail,
  Activity,
  CheckCircle, // For Accepted Tickets KPI
  XCircle // For Refused Tickets KPI
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import EventsCalendar from './Dashboards/EventsCalendar';
import OverdueTicketsList from './Dashboards/OverdueTicketsList';
import dashboardService from '../../services/dashboardService'; // Ensure this service is correctly imported

// --- Reusable Loading Indicator ---
const LoadingIndicator = () => <div className="flex justify-center items-center h-full min-h-[100px]"><p className="text-slate-500 dark:text-slate-400">Chargement...</p></div>;

// --- KpiCard Component (Updated for smaller text) ---
// --- KpiCard Component (Updated for smaller text) ---
const KpiCard = ({ title, value, icon: Icon, color, link, badgeText, badgeColor }) => (
  <div className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex items-center justify-between transition-transform transform hover:scale-105 ${color || ''} relative overflow-hidden`}>
    <div className="flex-1">
      <h3 className="text-xs font-medium text-slate-500 dark:text-slate-300">{title}</h3> {/* Adjusted text size */}
      <p className="text-sm font-bold text-slate-900 dark:text-slate-50 mt-1 flex items-center"> {/* Adjusted text size */}
        {value} 
        {badgeText && (
          <span className={`ml-1 px-1 py-0.5 text-[0.6rem] font-semibold rounded-full ${badgeColor || 'bg-red-100 text-red-800'} dark:bg-red-900/50 dark:text-red-300`}> {/* Adjusted text size and margin */}
            {badgeText}
          </span>
        )}
      </p>
    </div>
    {Icon && <Icon size={30} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />} {/* Slightly smaller icon */}
    {link && (
      <Link to={link} className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black bg-opacity-10 dark:bg-opacity-20 rounded-lg transition-opacity duration-200">
        <span className="text-white text-xs font-semibold">Voir plus</span>
      </Link>
    )}
  </div>
);


// --- Pending Assignments List Component (Updated for smaller format) ---
const PendingAssignmentsList = () => {
  const [pendingTickets, setPendingTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingAssignments = async () => {
      try {
        setLoading(true);
        // For now, using static data. Replace with actual API call:
        // const data = await ticketService.getTicketsByStatus('en_attente');
        const data = [
          { id: 'pa1', titre: 'Connexion WiFi 3ème étage', priorite: 'HAUTE', dateCreation: [2025, 7, 5, 10, 30] },
          { id: 'pa2', titre: 'Installation logiciel Adobe', priorite: 'MOYENNE', dateCreation: [2025, 7, 4, 14, 0] },
          { id: 'pa3', titre: 'Maintenance serveur A', priorite: 'BASSE', dateCreation: [2025, 7, 3, 9, 0] },
          { id: 'pa4', titre: 'Problème email client Z', priorite: 'HAUTE', dateCreation: [2025, 7, 6, 11, 0] },
          { id: 'pa5', titre: 'Demande accès VPN', priorite: 'MOYENNE', dateCreation: [2025, 7, 5, 16, 0] },
        ];
        setPendingTickets(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des affectations en attente:", err);
        setError("Impossible de charger les affectations en attente.");
      } finally {
        setLoading(false);
      }
    };
    fetchPendingAssignments();
  }, []);

  const handleAssignTicket = (ticketId) => {
    alert(`Affecter le ticket ${ticketId} à un module (simulation)`);
  };

  const formatDate = (dateArray) => {
    if (!dateArray) return 'N/A';
    try {
      const [year, month, day, hour = 0, minute = 0] = dateArray;
      const date = new Date(year, month - 1, day, hour, minute);
      return date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const PriorityIcon = ({ priority }) => {
    if (priority === 'HAUTE') return <AlertTriangle size={14} className="text-red-500 mr-1" />;
    if (priority === 'MOYENNE') return <AlertTriangle size={14} className="text-yellow-500 mr-1" />;
    return null;
  };

  if (loading) return <LoadingIndicator />;
  if (error) return <div className="text-center py-3 text-red-500 text-sm">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
        <ClipboardList size={20} className="text-blue-500 mr-2" /> Affectations en Attente ({pendingTickets.length})
      </h3>
      {pendingTickets.length > 0 ? (
        <div className="overflow-y-auto max-h-60 custom-scrollbar space-y-2">
          {pendingTickets
            .sort((a, b) => {
              const priorityOrder = { 'HAUTE': 3, 'MOYENNE': 2, 'BASSE': 1 };
              if (priorityOrder[b.priorite] !== priorityOrder[a.priorite]) {
                return priorityOrder[b.priorite] - priorityOrder[a.priorite];
              }
              const dateA = new Date(a.dateCreation[0], a.dateCreation[1] - 1, a.dateCreation[2], a.dateCreation[3], a.dateCreation[4]);
              const dateB = new Date(b.dateCreation[0], b.dateCreation[1] - 1, b.dateCreation[2], b.dateCreation[3], b.dateCreation[4]);
              return dateB.getTime() - dateA.getTime();
            })
            .map(ticket => (
              <div key={ticket.id} className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={ticket.titre}>{ticket.titre}</p>
                  <div className="flex items-center text-xs text-slate-600 dark:text-slate-300 mt-1">
                    <PriorityIcon priority={ticket.priorite} /> {ticket.priorite}
                    <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                    <Clock size={12} className="mr-1 opacity-70" /> {formatDate(ticket.dateCreation)}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAssignTicket(ticket.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xxs px-2 py-0.5 rounded-full transition-colors duration-200"
                  >
                    Affecter
                  </button>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 dark:text-slate-400 italic text-sm">Aucune affectation en attente pour le moment.</p>
      )}
    </div>
  );
};


// --- MODIFIED: Tickets By Status Bar Chart Component ---
const TicketsByStatusBarChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const ticketStatusConfig = {
        accepte: { name: 'Accepté', color: '#84cc16' },
        en_attente: { name: 'En Attente', color: '#f97316' },
        en_cours: { name: 'En Cours', color: '#eab308' },
        termine: { name: 'Terminé', color: '#22c55e' },
        refuse: { name: 'Refusé', color: '#ef4444' },
    };

    const mapApiStatusToKey = (apiStatus) => {
        const lowerCaseStatus = String(apiStatus).toLowerCase().replace('_', '-');
        for (const key in ticketStatusConfig) { if (lowerCaseStatus === key.replace('_', '-')) return key; }
        return null;
    };

    useEffect(() => {
        const fetchTicketStats = async () => {
            try {
                setLoading(true);
                const rawData = await dashboardService.getTicketCountsByStatus(); // Assume this returns [{status: 'en_attente', count: 10}, ...]

                // Process data for bar chart
                const processedData = Object.keys(ticketStatusConfig).map(key => {
                    const found = rawData.find(item => mapApiStatusToKey(item.status) === key);
                    return {
                        name: ticketStatusConfig[key].name,
                        count: found ? found.count : 0,
                        color: ticketStatusConfig[key].color
                    };
                });
                setData(processedData);

            } catch (err) {
                console.error("Erreur lors de la récupération des stats de tickets par statut:", err);
                setError("Impossible de charger les statistiques de tickets par statut.");
            } finally {
                setLoading(false);
            }
        };

        fetchTicketStats();
    }, []);

    if (loading) return <LoadingIndicator />;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
    if (data.length === 0 || data.every(d => d.count === 0)) return <div className="text-center py-4 text-slate-500 dark:text-slate-400">Aucune donnée de tickets par statut disponible.</div>;

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
                <BarChart2 size={20} className="text-purple-500 mr-2" /> Répartition par Statut
            </h3>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 5, right: 10, left: -15, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                        <XAxis dataKey="name" stroke="rgb(100 116 139)" fontSize={11} />
                        <YAxis stroke="rgb(100 116 139)" fontSize={11} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Nombre de Tickets" fill="#8884d8" barSize={25} >
                            {
                                data.map((entry, index) => (
                                    <Bar key={`bar-${index}`} fill={entry.color} />
                                ))
                            }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


// --- Active Tickets By Category Bar Chart Component (already a Bar Chart) ---
const ActiveTicketsByCategoryBarChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupBy, setGroupBy] = useState('employee'); // 'employee' ou 'module'

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Appel à la nouvelle fonction du service avec le paramètre groupBy
        const rawData = await dashboardService.getActiveTicketsByCategory(groupBy);
        setData(rawData);
      } catch (err) {
        console.error("Erreur lors de la récupération des tickets actifs par catégorie:", err);
        setError("Impossible de charger les statistiques des tickets actifs.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [groupBy]); // Re-exécuter l'effet quand groupBy change

  if (loading) return <LoadingIndicator />;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (data.length === 0) return <div className="text-center py-4 text-slate-500 dark:text-slate-400">Aucune donnée de tickets actifs disponible pour cette catégorie.</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center">
          <BarChart2 size={20} className="text-green-500 mr-2" />
          Tickets Actifs par {groupBy === 'employee' ? 'Employé' : 'Module'}
        </h3>
        {/* Sélecteur pour changer le regroupement */}
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="form-select text-xs p-1.5 rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
        >
          <option value="employee">Employé</option>
          <option value="module">Module</option>
        </select>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5, right: 10, left: -15, bottom: 5,
            }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis type="number" stroke="rgb(100 116 139)" fontSize={11} />
            <YAxis type="category" dataKey="category" stroke="rgb(100 116 139)" fontSize={11} width={80} />
            <Tooltip />
            <Bar dataKey="activeTickets" fill="#8884d8" name="Tickets Actifs" barSize={15} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


// --- Contextual Widgets (Updated for smaller format) ---
const LatestTicketsWidget = () => {
  const tickets = [
    { id: 'lt1', title: 'Install imprimante bureau 3', date: '5 min' },
    { id: 'lt2', title: 'Réinit. mdp client Y', date: '30 min' },
    { id: 'lt3', title: 'Pb messagerie client X', date: '2h' },
  ];
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
        <List size={20} className="text-orange-500 mr-2" /> Derniers Tickets Créés
      </h3>
      <ul className="space-y-1 text-slate-700 dark:text-slate-300">
        {tickets.map(ticket => (
          <li key={ticket.id} className="flex justify-between items-center text-xs">
            <span className="truncate mr-2">{ticket.title}</span>
            <span className="text-[0.6rem] text-slate-500 dark:text-slate-400 flex-shrink-0">{ticket.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const LatestCommentsWidget = () => {
  const comments = [
    { id: 'lc1', text: 'Commentaire sur Ticket #123', user: 'J. Dupont', date: '10 min' },
    { id: 'lc2', text: 'Mise à jour Ticket #456', user: 'S. Martin', date: '1h' },
  ];
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
        <MessageSquare size={20} className="text-cyan-500 mr-2" /> Derniers Commentaires
      </h3>
      <ul className="space-y-1 text-slate-700 dark:text-slate-300">
        {comments.map(comment => (
          <li key={comment.id} className="text-xs">
            <p className="font-medium truncate">{comment.text}</p>
            <span className="text-[0.6rem] text-slate-500 dark:text-slate-400">par {comment.user}, {comment.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const MostImpactedModulesWidget = () => {
  const modules = [
    { name: 'Réseaux', tickets: 50 },
    { name: 'Matériel', tickets: 45 },
    { name: 'Logiciel', tickets: 30 },
  ];
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
        <Target size={20} className="text-purple-500 mr-2" /> Modules Impactés
      </h3>
      <ul className="space-y-1 text-slate-700 dark:text-slate-300">
        {modules.map((module, index) => (
          <li key={index} className="flex justify-between items-center text-xs">
            <span>{module.name}</span>
            <span className="font-semibold text-[0.6rem]">{module.tickets} tickets</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ShortcutsWidget = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
        <Zap size={20} className="text-rose-500 mr-2" /> Raccourcis
      </h3>
      <div className="grid grid-cols-1 gap-2 text-xs">
        <Link to="/admin/utilisateurs" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
          <Users size={14} className="mr-1" /> Gérer les users
        </Link>
        <Link to="/admin/modules" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
          <Box size={14} className="mr-1" /> Gérer les modules
        </Link>
        <Link to="/admin/clients" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
          <Building size={14} className="mr-1" /> Gérer les clients
        </Link>
        <Link to="/admin/tickets" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
          <ClipboardList size={14} className="mr-1" /> Gérer les tickets
        </Link>
      </div>
    </div>
  );
};

// --- Main HomePage Component (Updated overall layout and padding) ---
const HomePage = () => {
  const [kpiData, setKpiData] = useState({
    totalTickets: '...',
    ticketsEnAttente: '...',
    ticketsEnCours: '...',
    ticketsAcceptes: '...',
    ticketsTerminesToday: '...',
    ticketsTerminesThisWeek: '...',
    ticketsRefuses: '...',
  });
  const [loadingKpis, setLoadingKpis] = useState(true);

  // Fetch global ticket stats for KPI cards
  useEffect(() => {
    const fetchGlobalTicketStats = async () => {
      setLoadingKpis(true);
      try {
        const data = await dashboardService.getGlobalTicketCounts(); //
        setKpiData(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des KPIs:", err);
        setKpiData({
          totalTickets: 'N/A',
          ticketsEnAttente: 'N/A',
          ticketsEnCours: 'N/A',
          ticketsAcceptes: 'N/A',
          ticketsTerminesToday: 'N/A',
          ticketsTerminesThisWeek: 'N/A',
          ticketsRefuses: 'N/A',
        });
      } finally {
        setLoadingKpis(false);
      }
    };
    fetchGlobalTicketStats();
  }, []);


  return (
    <div className="p-4 md:p-5 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Tableau de Bord Administrateur</h1>

      {/* 1. Résumé global / KPIs - Compact format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-4">
        <KpiCard title="Tickets Totaux" value={loadingKpis ? '...' : kpiData.totalTickets} icon={ClipboardList} color="bg-blue-50 dark:bg-blue-900/20" />
        <KpiCard title="En Attente" value={loadingKpis ? '...' : kpiData.ticketsEnAttente} icon={AlertTriangle} color="bg-yellow-50 dark:bg-yellow-900/20" />
        <KpiCard title="En Cours" value={loadingKpis ? '...' : kpiData.ticketsEnCours} icon={Clock} color="bg-orange-50 dark:bg-orange-900/20" />
        <KpiCard title="Acceptés" value={loadingKpis ? '...' : kpiData.ticketsAcceptes} icon={CheckCircle} color="bg-green-50 dark:bg-green-900/20" />
        <KpiCard title="Terminés Aujourd'hui" value={loadingKpis ? '...' : kpiData.ticketsTerminesToday} icon={CalendarDays} color="bg-purple-50 dark:bg-purple-900/20" />
        <KpiCard title="Terminés cette semaine" value={loadingKpis ? '...' : kpiData.ticketsTerminesThisWeek} icon={CalendarDays} color="bg-indigo-50 dark:bg-indigo-900/20" />
        <KpiCard title="Refusés" value={loadingKpis ? '...' : kpiData.ticketsRefuses} icon={XCircle} color="bg-red-50 dark:bg-red-900/20" />
      </div>

      {/* 2. Graphiques de répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <TicketsByStatusBarChart /> {/* Now a Bar Chart */}
        <PendingAssignmentsList/>

        
      </div>

      {/* 3. Autres widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ActiveTicketsByCategoryBarChart /> {/* Remains a Bar Chart */}
        <OverdueTicketsList />
      </div>

      {/* 4. Bouton pour accéder au Dashboard complet */}
      <div className="flex justify-center mb-4">
        <Link to="/admin/dashboards" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 text-sm rounded-lg shadow-md transition-colors duration-200">
          Accéder au Dashboard complet
        </Link>
      </div>

      {/* 5. Widgets contextuels - Compact format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <LatestTicketsWidget />
        <LatestCommentsWidget />
        <MostImpactedModulesWidget />
        <ShortcutsWidget />
      </div>
    </div>
  );
};

export default HomePage;