// src/components/employe/InterfaceEmploye.jsx
import React, { useState, useEffect, useCallback } from 'react';
import HeaderEmploye from './HeaderEmploye';
import SidebarEmploye from './SidebarEmploye';
import ProfilEmployePage from './pages/ProfilEmployePage';
import MesTicketsEnAttentePage from './pages/MesTicketsEnAttentePage';
import MonTravailEnCoursPage from './pages/MonTravailEnCoursPage';
import MesTicketsResolusPage from './pages/MesTicketsResolusPage';
import MesTravauxEmployePage from './pages/MesTravauxEmployePage';
import HomePageEmploye from './pages/HomePageEmploye';
import { useAuth } from '../../context/AuthContext';

const InterfaceEmploye = () => {
  const { currentUser, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard_employe');
  // `allUserTickets` et `fetchAllUserTickets` sont supprimés d'ici
  // Chaque page enfant gérera son propre chargement de données.



  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Cette fonction est appelée par MesTicketsEnAttentePage une fois le traitement démarré
  const handleStartTreatmentSuccess = useCallback(() => {
      // Pas de rechargement global ici, chaque page se mettra à jour elle-même
      setActivePage('travail_en_cours_employe'); // Navigue vers "Mon Travail en Cours"
  }, []);

  const renderPage = useCallback(() => {
    switch (activePage) {
      case 'home_employe':
        return <HomePageEmploye />;
      case 'dashboard_employe':
        return <HomePageEmploye/>;
      case 'tickets_en_attente_employe':
        return <MesTicketsEnAttentePage onStartTreatmentCallback={handleStartTreatmentSuccess} />;
      case 'travail_en_cours_employe':
        return <MonTravailEnCoursPage />; // Ne reçoit plus de props tickets ou fetchTickets
      case 'tickets_resolus_employe':
        return <MesTicketsResolusPage />; // Ne reçoit plus de props tickets ou fetchTickets
      case 'profil_employe':
        return <ProfilEmployePage user={currentUser} />; // `currentUser` est toujours disponible via AuthContext
      case 'mes_travaux_employe':
        return <MesTravauxEmployePage />; // Ne reçoit plus de props tickets ou fetchTickets
      default:
        return <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-4">Page introuvable</h2>;
    }
  }, [activePage, currentUser, handleStartTreatmentSuccess]); // `allUserTickets` supprimé des dépendances

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      <SidebarEmploye
        activePage={activePage}
        setActivePage={setActivePage}
        isSidebarOpen={isSidebarOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0 lg:ml-20'}`}>
        <HeaderEmploye
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          USER={currentUser}
        />
        <main className="flex-1 p-6 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default InterfaceEmploye;