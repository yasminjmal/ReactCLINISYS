// src/pages/Admin/Dashboards/DashboardPage.jsx
import React from 'react';
import TicketsByStatusDonutChart from './TicketsByStatusDonutChart';
import SubscriptionsHourlyBarChart from './SubscriptionsHourlyBarChart';
import LiveFeedsAreaChart from './LiveFeedsAreaChart';
import EventsCalendar from './EventsCalendar';
import GlobalTicketStatsWidget from './GlobalTicketStatsWidget';
const DashboardPage = () => {
  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Tableau de Bord Global</h1>
      <GlobalTicketStatsWidget />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Exemple d'intégration du graphique en beignet */}
        <TicketsByStatusDonutChart />
        
        {/* Exemple d'intégration du graphique en aires */}
        <LiveFeedsAreaChart />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Exemple d'intégration du graphique à barres */}
        <SubscriptionsHourlyBarChart />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Exemple d'intégration du calendrier */}
        <EventsCalendar />
      </div>

      {/* Tu peux ajouter d'autres métriques comme dans la capture (My Tasks, Transferred, etc.) ici */}
      {/* <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Autres Métriques</h3>
        <p>My Tasks: 130 / 500</p>
        <p>Transferred: 440 TB</p>
        <p>Bugs Squashed: 77%</p>
        <p>User Testing: 7 days</p>
      </div> */}
    </div>
  );
};

export default DashboardPage;