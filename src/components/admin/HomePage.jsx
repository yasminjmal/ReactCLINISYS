// src/components/admin/HomePage.jsx
import React from 'react';
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
  BarChart2,
  PieChart,
  Target,
  List,
  Zap,
  Mail // Ensure Mail icon is imported for OverdueTicketsList
} from 'lucide-react';
import EventsCalendar from './Dashboards/EventsCalendar';
import OverdueTicketsList from './Dashboards/OverdueTicketsList'; 

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
  const [pendingTickets, setPendingTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
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

  if (loading) return <div className="text-center py-3 text-slate-600 dark:text-slate-400 text-sm">Chargement...</div>;
  if (error) return <div className="text-center py-3 text-red-500 text-sm">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
        <ClipboardList size={20} className="text-blue-500 mr-2" /> Affectations en Attente ({pendingTickets.length})
      </h3>
      {pendingTickets.length > 0 ? (
        <div className="overflow-y-auto max-h-60 custom-scrollbar space-y-2"> {/* Adjusted max-height and added custom-scrollbar */}
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


// --- Mini Dashboard Widgets (Updated for smaller format) ---
const TicketsByModuleChart = () => {
  const data = [
    { name: 'Réseaux', value: 30 }, { name: 'Matériel', value: 20 },
    { name: 'Logiciel', value: 25 }, { name: 'Sécurité', value: 15 },
    { name: 'BDD', value: 10 },
  ];
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
        <BarChart2 size={20} className="text-green-500 mr-2" /> Répartition par Module
      </h3>
      <div className="h-40 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm"> {/* Adjusted height and text size */}
        <p>Graphique ici (ex: barres)</p>
        <ul className="text-xs ml-4 space-y-1">
          {data.map((item, index) => (
            <li key={index}>{item.name}: {item.value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const TicketsByStatusChart = () => {
  const data = [
    { name: 'Attente', value: 40, color: '#f97316' }, // orange-500
    { name: 'Résolu', value: 120, color: '#22c55e' }, // green-500
    { name: 'En cours', value: 60, color: '#3b82f6' }, // blue-500
  ];
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
        <PieChart size={20} className="text-purple-500 mr-2" /> Répartition par Statut
      </h3>
      <div className="h-40 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm"> {/* Adjusted height and text size */}
        <p>Graphique ici (ex: camembert)</p>
        <ul className="text-xs ml-4 space-y-1">
          {data.map((item, index) => (
            <li key={index} style={{ color: item.color }}>{item.name}: {item.value}</li>
          ))}
        </ul>
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
            <span className="text-[0.6rem] text-slate-500 dark:text-slate-400 flex-shrink-0">{ticket.date}</span> {/* Adjusted text size */}
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
            <span className="text-[0.6rem] text-slate-500 dark:text-slate-400">par {comment.user}, {comment.date}</span> {/* Adjusted text size */}
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
            <span className="font-semibold text-[0.6rem]">{module.tickets} tickets</span> {/* Adjusted text size */}
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
  const [kpiData, setKpiData] = React.useState({
    openTickets: '...',
    overdueTickets: '...',
    ticketsToday: { created: '...', closed: '...' },
    activeTeams: '...',
    activeClients: '...',
    topModules: '...',
  });
  const [loadingKpis, setLoadingKpis] = React.useState(true);

  React.useEffect(() => {
    const fetchKpis = async () => {
      setLoadingKpis(true);
      try {
        const openTicketsCount = 75; 
        const overdueTicketsCount = 12; 
        const createdToday = 15; 
        const closedToday = 8; 
        const activeTeamsCount = 5; 
        const clientsData = [
          { nom: 'Clinique Alpha', ticketsEnCours: 7 },
          { nom: 'Hôpital Beta', ticketsEnCours: 4 },
        ];
        const activeClientsSummary = clientsData.map(c => `${c.nom} (${c.ticketsEnCours})`).join(', ');
        const topModulesData = [
          { nom: 'Logiciel', tickets: 30 }, { nom: 'Réseaux', tickets: 25 }, { nom: 'Matériel', tickets: 20 },
        ];
        const topModulesSummary = topModulesData.map(m => `${m.nom} (${m.tickets})`).join(', ');

        setKpiData({
          openTickets: openTicketsCount,
          overdueTickets: overdueTicketsCount,
          ticketsToday: { created: createdToday, closed: closedToday },
          activeTeams: activeTeamsCount,
          activeClients: activeClientsSummary || 'N/A',
          topModules: topModulesSummary || 'N/A',
        });
      } catch (err) {
        console.error("Erreur lors de la récupération des KPIs:", err);
        setKpiData({
          openTickets: 'N/A', overdueTickets: 'N/A', ticketsToday: { created: 'N/A', closed: 'N/A' },
          activeTeams: 'N/A', activeClients: 'N/A', topModules: 'N/A',
        });
      } finally {
        setLoadingKpis(false);
      }
    };
    fetchKpis();
  }, []);

  return (
    <div className="p-4 md:p-5 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Tableau de Bord Administrateur</h1> {/* Adjusted title size and margin */}

      {/* 1. Résumé global / KPIs - Compact format */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4"> {/* Adjusted cols and gap */}
        <KpiCard title="Tickets ouverts" value={loadingKpis ? '...' : kpiData.openTickets} icon={ClipboardList} link="/admin/tickets?status=en_cours" color="bg-blue-50 dark:bg-blue-900/20" />
        <KpiCard title="Tickets en retard" value={loadingKpis ? '...' : kpiData.overdueTickets} icon={AlertTriangle} color="bg-red-50 dark:bg-red-900/20" badgeText="Urgent" badgeColor="bg-red-100 text-red-800" />
        <KpiCard title="Tickets aujourd'hui" value={loadingKpis ? '...' : `${kpiData.ticketsToday.created}/${kpiData.ticketsToday.closed}`} icon={CalendarDays} color="bg-emerald-50 dark:bg-emerald-900/20" badgeText="Cr./Cl." badgeColor="bg-emerald-100 text-emerald-800" />
        <KpiCard title="Équipes actives" value={loadingKpis ? '...' : kpiData.activeTeams} icon={Users} color="bg-indigo-50 dark:bg-indigo-900/20" />
        <KpiCard title="Clients actifs" value={loadingKpis ? '...' : kpiData.activeClients} icon={Building} color="bg-purple-50 dark:bg-purple-900/20" />
        <KpiCard title="Top Modules" value={loadingKpis ? '...' : kpiData.topModules} icon={Box} color="bg-teal-50 dark:bg-teal-900/20" />
      </div>

      {/* 2. Mon Calendrier, 3. Tickets en retard, 4. Affectations en attente - Compact format */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4"> {/* Adjusted gap */}
        <TicketsByModuleChart />
        <OverdueTicketsList />
 
      </div>

      {/* 5. Mini Dashboard interactif (vue rapide) - Compact format */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"> {/* Adjusted gap */}
        <TicketsByModuleChart />
        <PendingAssignmentsList />
 
      </div>
      <div className="flex justify-center mb-4"> {/* Adjusted margin */}
        <Link to="/admin/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 text-sm rounded-lg shadow-md transition-colors duration-200"> {/* Smaller button */}
          Accéder au Dashboard complet
        </Link>
      </div>

      {/* 6. Widgets contextuels - Compact format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4"> {/* Adjusted gap */}
        <LatestTicketsWidget />
        <LatestCommentsWidget />
        <MostImpactedModulesWidget />
        <ShortcutsWidget />
      </div>
    </div>
  );
};

export default HomePage;  