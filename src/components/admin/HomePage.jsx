// src/components/admin/HomePage.jsx
import React from 'react';
import GlobalTicketStatsWidget from './Dashboards/GlobalTicketStatsWidget';
import EventsCalendar from './Dashboards/EventsCalendar';
import TeamPerformanceChart from './Dashboards/TeamPerformanceChart';
import OverdueTicketsList from './Dashboards/OverdueTicketsList';

const HomePage = () => {
  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Accueil de l'Administrateur</h1>
      
      {/* Statistiques Clés en un Coup d'Œil */}
      <GlobalTicketStatsWidget />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Calendrier des événements */}
        <EventsCalendar />
        {/* Performances de l'équipe */}
        <TeamPerformanceChart />
      </div>

      {/* Liste des tickets en retard */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <OverdueTicketsList />
      </div>

      {/* Vous pouvez ajouter ici d'autres éléments d'accueil si nécessaire, comme des raccourcis rapides */}
    </div>
  );
};

export default HomePage;