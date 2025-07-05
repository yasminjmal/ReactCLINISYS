// src/components/admin/Dashboards/DashboardPage.jsx
import React, { useState } from 'react';

// 1. On importe tous nos composants de page
import DashboardNav from './DashboardNav';
import TicketsPage from './nav/TicketsPage'; // Votre ancien tableau de bord
import ClientsPage from './nav/ClientsPage'; // La nouvelle page des clients
import UtilisateursPage from './nav/UtilisateursPage'; // La nouvelle page des utilisateurs
import EquipesPage from './nav/EquipesPage'; // La nouvelle page des équipes
import PerformancesPage from './nav/PerformancesPage';
import ModulesPage from './nav/ModulesPage';
// Importez les autres (UtilisateursDashboard, etc.) ici

const DashboardPage = () => {
  // 2. On crée l'état qui va "mémoriser" la page active. Par défaut, 'tickets'.
  const [activePage, setActivePage] = useState('tickets');

  // 3. Cette fonction choisit quel composant afficher en fonction de l'état
  const renderContent = () => {
    switch (activePage) {
      case 'tickets':
        return <TicketsPage />;
      case 'performances':
        return <PerformancesPage />;
      case 'clients':
        return <ClientsPage />;
      case 'utilisateurs':
        return <UtilisateursPage />;
      case 'equipes':
        return <EquipesPage />;
      case 'modules':
        return <ModulesPage />;
      // case 'utilisateurs':
      //   return <UtilisateursDashboard />;
      // Ajoutez les autres cas ici...
      default:
        // Par sécurité, si l'état est inconnu, on affiche la page des tickets
        return <TicketsPage />;
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-900/50">

      {/* L'en-tête de la page ne change pas */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Tableaux de Bords Analytiques</h1>
      </div>

      {/* 4. On passe l'état et la fonction pour le changer à la barre de navigation */}
      <DashboardNav activePage={activePage} onNavClick={setActivePage} />

      {/* 5. On appelle notre fonction pour afficher le bon contenu */}
      <div>
        {renderContent()}
      </div>

    </div>
  );
};

export default DashboardPage;