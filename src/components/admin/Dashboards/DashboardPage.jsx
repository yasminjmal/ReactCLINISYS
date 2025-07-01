// src/components/admin/Dashboards/DashboardPage.jsx
import React from 'react';
import TicketsByStatusDonutChart from './TicketsByStatusDonutChart';
import SubscriptionsHourlyBarChart from './SubscriptionsHourlyBarChart';
import LiveFeedsAreaChart from './LiveFeedsAreaChart';
import ActiveTicketsByCategoryBarChart from './ActiveTicketsByCategoryBarChart';
import ClientMapWidget from './ClientMapWidget';

const DashboardPage = () => {
  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Tableaux de Bord Analytiques</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Graphique en beignet: Tickets par Statut */}
        <TicketsByStatusDonutChart />
        
        {/* Graphique en aires: Flux en direct */}
        <LiveFeedsAreaChart />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Graphique à barres: Abonnements horaires (ou autre métrique horaire) */}
        <SubscriptionsHourlyBarChart />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Tickets actifs par catégorie */}
        <ActiveTicketsByCategoryBarChart />
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Widget carte client */}
        <ClientMapWidget />
      </div>

      {/* Tu peux ajouter d'autres métriques ou graphiques ici */}
    </div>
  );
};

export default DashboardPage;