// src/components/employe/pages/HomePageEmploye.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Home, CalendarDays, Clock, AlertTriangle, CheckCircle, FileText, Box, XCircle, BarChart2, Users, Layers, MessageSquare, TrendingUp, ChevronRight, Hash } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import ticketService from '../../../services/ticketService';
import commentService from '../../../services/commentService'; // Assuming this service exists
import moduleService from '../../../services/moduleService'; // Assuming this service exists
import equipeService from '../../../services/equipeService'; // Assuming this service exists
import utilisateurService from '../../../services/utilisateurService'; // Assuming this service exists


// --- InfoCard Component (Generic Card for consistent styling) ---
const InfoCard = ({ title, value, icon: Icon, color, className = '', children }) => (
  <div className={`bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md flex flex-col justify-between transition-transform transform hover:scale-105 ${color || ''} ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-300">{title}</h3>
      {Icon && <Icon size={24} className={`text-slate-400 dark:text-slate-500 ${color ? 'text-opacity-80' : ''}`} />}
    </div>
    <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
      {value}
    </div>
    {children}
  </div>
);

// --- Real-time Clock Component ---
const RealTimeClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-500 to-sky-600 text-white p-5 rounded-lg shadow-lg flex flex-col justify-center items-center text-center">
      <Clock size={36} className="mb-3 opacity-90" />
      <h3 className="text-xl font-bold mb-1">Heure Actuelle</h3>
      <p className="text-3xl font-extrabold">{time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
      <p className="text-sm opacity-80 mt-1">{time.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  );
};


// --- Weekly Timeline Component ---
const WeeklyTimeline = ({ ticketsData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState({});

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Here, we would ideally call an API endpoint like:
        // const data = await ticketService.getWeeklyTicketStatsForUser(currentUser.id);
        // For now, let's process client-side static data
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const stats = {};
        for (let i = 0; i < 5; i++) { // Monday to Friday
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          stats[day.toISOString().split('T')[0]] = { treated: 0, closed: 0 };
        }

        ticketsData.forEach(ticket => {
          if (ticket.date_traitement || ticket.date_cloture) { // Assuming these fields exist
            let dateKey;
            if (ticket.ticketStatus === 'Termine' && ticket.date_cloture) {
                dateKey = new Date(ticket.date_cloture).toISOString().split('T')[0];
                if (stats[dateKey]) stats[dateKey].closed++;
            } else if (ticket.date_traitement) { // Treated tickets, assuming 'En_cours' and others
                dateKey = new Date(ticket.date_traitement).toISOString().split('T')[0];
                if (stats[dateKey]) stats[dateKey].treated++;
            }
          }
        });
        setWeeklyStats(stats);
      } catch (err) {
        console.error("Error fetching weekly stats:", err);
        setError("Impossible de charger le calendrier de la semaine.");
      } finally {
        setLoading(false);
      }
    };

    if (ticketsData.length > 0) { // Only fetch if tickets are available
      fetchWeeklyStats();
    } else {
      setLoading(false);
      setWeeklyStats({});
    }
  }, [ticketsData]);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const todayIndex = new Date().getDay() - 1; // 0 for Monday, 4 for Friday

  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  const currentMonthDay = new Date().getDate();

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md h-full flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
        <CalendarDays size={20} className="mr-2 text-purple-500" /> Activité Hebdomadaire
      </h3>
      <div className="flex-grow space-y-2 overflow-y-auto custom-scrollbar">
        {days.map((dayName, index) => {
          const dayDate = new Date();
          dayDate.setDate(dayDate.getDate() - todayIndex + index);
          const dateKey = dayDate.toISOString().split('T')[0];
          const stats = weeklyStats[dateKey] || { treated: 0, closed: 0 };
          const isToday = index === todayIndex;

          return (
            <div key={dayName} className={`flex items-center p-2 rounded-md ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'} transition-colors`}>
              <div className={`font-semibold ${isToday ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'} w-20`}>
                {dayName}
              </div>
              <div className="flex-1 flex items-center text-sm text-slate-600 dark:text-slate-300">
                <span className="bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full text-xs mr-2">
                  Traité: {stats.treated}
                </span>
                <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-xs">
                  Clôturé: {stats.closed}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// --- Module Progress Widget Component ---
const ModuleProgressWidget = ({ ticketsData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleStats, setModuleStats] = useState([]);

  useEffect(() => {
    const calculateModuleStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ideally, fetch this data from an API:
        // const data = await moduleService.getModuleProgressForUser(currentUser.id, 'this_week');
        // For now, process client-side static data
        const statsMap = {};
        ticketsData.forEach(ticket => {
          const moduleName = ticket.module?.nom || 'Sans module'; // Assuming ticket has module object
          if (!statsMap[moduleName]) {
            statsMap[moduleName] = { total: 0, completed: 0 };
          }
          statsMap[moduleName].total++;
          if (ticket.ticketStatus === 'Termine' || ticket.ticketStatus === 'Resolu') {
            statsMap[moduleName].completed++;
          }
        });

        const formattedStats = Object.keys(statsMap).map(name => ({
          name,
          total: statsMap[name].total,
          completed: statsMap[name].completed,
          progress: statsMap[name].total > 0 ? (statsMap[name].completed / statsMap[name].total) * 100 : 0,
        }));
        setModuleStats(formattedStats);
      } catch (err) {
        console.error("Error calculating module stats:", err);
        setError("Impossible de charger la progression des modules.");
      } finally {
        setLoading(false);
      }
    };
    if (ticketsData.length > 0) {
        calculateModuleStats();
    } else {
        setLoading(false);
        setModuleStats([]);
    }
  }, [ticketsData]);


  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md h-full flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
        <Layers size={20} className="mr-2 text-yellow-500" /> Progression par Module
      </h3>
      <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar">
        {moduleStats.length > 0 ? (
          moduleStats.map((mod, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-sm text-slate-700 dark:text-slate-200">
                <span className="font-medium flex items-center"><Box size={16} className="mr-2 text-indigo-500"/>{mod.name}</span>
                <span className="text-xs font-semibold">{mod.completed}/{mod.total} tickets</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${mod.progress}%` }}
                ></div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-4">Aucune donnée de module pour le moment.</p>
        )}
      </div>
    </div>
  );
};


// --- Personal Impact Chart Component (Placeholder for chart) ---
const PersonalImpactChart = ({ currentUser, ticketsData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [impactData, setImpactData] = useState({ myTickets: 0, teamTickets: 0 });

  useEffect(() => {
    const fetchImpactData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ideally, call APIs for these:
        // const myClosedTickets = await ticketService.getClosedTicketsCountForUser(currentUser.id);
        // const teamClosedTickets = await ticketService.getClosedTicketsCountForTeam(currentUser.teamId);
        
        // Using static data for now
        const myClosedTickets = ticketsData.filter(t => t.idUtilisateur?.id === currentUser.id && (t.ticketStatus === 'Termine' || t.ticketStatus === 'Resolu')).length;
        // Assuming currentUser has a teamId and some tickets in ticketsData belong to the team
        const teamClosedTickets = ticketsData.filter(t => t.teamId === currentUser.teamId && (t.ticketStatus === 'Termine' || t.ticketStatus === 'Resolu')).length; // Placeholder teamId
        
        setImpactData({ myTickets: myClosedTickets, teamTickets: teamClosedTickets });
      } catch (err) {
        console.error("Error fetching personal impact data:", err);
        setError("Impossible de charger les données d'impact personnel.");
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.id) {
        fetchImpactData();
    } else {
        setLoading(false);
        setImpactData({ myTickets: 0, teamTickets: 0 });
    }
  }, [currentUser, ticketsData]);

  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  const total = impactData.myTickets + impactData.teamTickets;
  const myPercentage = total > 0 ? (impactData.myTickets / total) * 100 : 0;
  const teamPercentage = total > 0 ? (impactData.teamTickets / total) * 100 : 0; // This might be misleading if it's not exclusive team tickets

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
        <TrendingUp size={20} className="mr-2 text-emerald-500" /> Mon Impact vs Équipe
      </h3>
      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 text-center">
        <div className="flex-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{impactData.myTickets}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Mes Tickets Clôturés</p>
        </div>
        <div className="flex-1 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{impactData.teamTickets}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Tickets Équipe Clôturés</p>
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
        <p>Contribution personnelle : {myPercentage.toFixed(1)}%</p>
        {/* You can add a simple progress bar or more complex chart here later */}
      </div>
    </div>
  );
};

// --- Recent Comments Widget Component ---
const RecentCommentsWidget = ({ currentUser }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ideally, call an API like:
        // const data = await commentService.getRecentCommentsOnUserTickets(currentUser.id, 5);
        // For now, static data
        const staticComments = [
          { id: 'c1', commenter: 'Admin Support', ticketTitle: 'Problème de connexion (ID: #T123)', date: new Date(Date.now() - 3600 * 1000), ticketId: 't123' },
          { id: 'c2', commenter: 'Client Alpha', ticketTitle: 'Demande de fonctionnalité (ID: #T125)', date: new Date(Date.now() - 2 * 3600 * 1000), ticketId: 't125' },
          { id: 'c3', commenter: 'Mon équipe', ticketTitle: 'Bug critique (ID: #T124)', date: new Date(Date.now() - 24 * 3600 * 1000), ticketId: 't124' },
        ];
        setComments(staticComments);
      } catch (err) {
        console.error("Error fetching recent comments:", err);
        setError("Impossible de charger les commentaires récents.");
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.id) {
        fetchComments();
    } else {
        setLoading(false);
        setComments([]);
    }
  }, [currentUser]);

  const handleViewTicket = (ticketId) => {
    alert(`Rediriger vers le ticket ${ticketId}`);
    // TODO: Implement navigation to ticket detail page
  };

  const handleReplyComment = (commentId) => {
    alert(`Ouvrir la modale de réponse pour le commentaire ${commentId}`);
    // TODO: Implement reply functionality
  };

  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement des commentaires...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md h-full flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
        <MessageSquare size={20} className="mr-2 text-cyan-500" /> Commentaires Récents
      </h3>
      <div className="flex-grow space-y-3 overflow-y-auto custom-scrollbar">
        {comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">{comment.commenter} sur <span className="text-blue-600 dark:text-blue-400">{comment.ticketTitle}</span></p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{comment.date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              <div className="flex gap-2">
                <button onClick={() => handleViewTicket(comment.ticketId)} className="bg-blue-500 hover:bg-blue-600 text-white text-xxs px-2 py-1 rounded-full">Voir ticket</button>
                <button onClick={() => handleReplyComment(comment.id)} className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xxs px-2 py-1 rounded-full dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-700">Répondre</button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-4">Aucun commentaire récent.</p>
        )}
      </div>
    </div>
  );
};


// --- Main HomePageEmploye Component ---
const HomePageEmploye = () => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    if (!currentUser || !currentUser.id) {
      setLoading(false);
      setError("Utilisateur non connecté ou ID utilisateur manquant.");
      return;
    }
    try {
      setLoading(true);
      // Fetch all tickets for the user to then filter client-side for KPI/widgets
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


  // --- KPIs Calculations ---
  const kpis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    let ticketsToTreat = 0;
    let ticketsClosedThisWeek = 0;
    let overdueOrUpcomingDeadlines = 0;

    tickets.forEach(ticket => {
      // Tickets à traiter: en_cours ou en_attente
      if (ticket.ticketStatus === 'En_cours' || ticket.ticketStatus === 'En_attente' || ticket.ticketStatus === 'Accepte') {
        ticketsToTreat++;
      }

      // Tickets clôturés cette semaine
      if (ticket.ticketStatus === 'Termine' || ticket.ticketStatus === 'Resolu') { // Assuming 'Resolu' is also a closed status
        if (ticket.date_cloture) {
          const closedDate = new Date(ticket.date_cloture);
          closedDate.setHours(0, 0, 0, 0);
          if (closedDate >= startOfWeek && closedDate <= today) {
            ticketsClosedThisWeek++;
          }
        }
      }

      // Tickets date d'échéance dépassée ou proches
      if (ticket.date_echeance) {
        const echeanceDate = new Date(ticket.date_echeance);
        echeanceDate.setHours(0, 0, 0, 0);

        // Within 7 days from now or overdue
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);
        sevenDaysFromNow.setHours(0,0,0,0);

        if (echeanceDate < today || (echeanceDate >= today && echeanceDate <= sevenDaysFromNow)) {
          overdueOrUpcomingDeadlines++;
        }
      }
    });

    return { ticketsToTreat, ticketsClosedThisWeek, overdueOrUpcomingDeadlines };
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
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen animate-fadeIn">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
        <Home size={32} className="mr-3 text-blue-600" /> Accueil de l'Employé
      </h1>

      {/* Real-time Clock */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="md:col-span-1">
          <RealTimeClock />
        </div>

        {/* 2/ Cartes KPI dynamiques */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoCard 
            title="Tickets à traiter" 
            value={kpis.ticketsToTreat} 
            icon={FileText} 
            color="bg-indigo-50 dark:bg-indigo-900/20" 
            className="col-span-1"
          >
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Tickets en cours ou en attente.</p>
          </InfoCard>
          <InfoCard 
            title="Tickets clôturés (cette semaine)" 
            value={kpis.ticketsClosedThisWeek} 
            icon={CheckCircle} 
            color="bg-emerald-50 dark:bg-emerald-900/20" 
            className="col-span-1"
          >
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Performance hebdomadaire.</p>
          </InfoCard>
          <InfoCard 
            title="Échéances proches/dépassées" 
            value={kpis.overdueOrUpcomingDeadlines} 
            icon={AlertTriangle} 
            color="bg-red-50 dark:bg-red-900/20" 
            className="col-span-1"
          >
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Tickets à surveiller.</p>
          </InfoCard>
        </div>
      </div>

      {/* 3/ Timeline de la semaine verticale et Bloc visuel (Modules traités, Équipes impliquées, Progression) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <WeeklyTimeline ticketsData={tickets} />
        <ModuleProgressWidget ticketsData={tickets} />
        <PersonalImpactChart currentUser={currentUser} ticketsData={tickets} />
      </div>

      {/* 5/ Commentaires récents / à lire */}
      <div className="mb-6">
        <RecentCommentsWidget currentUser={currentUser} />
      </div>
    </div>
  );
};

export default HomePageEmploye;