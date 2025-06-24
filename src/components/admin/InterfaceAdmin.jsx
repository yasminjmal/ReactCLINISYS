import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import utilisateurService from '../../services/utilisateurService';
import aiSearchService from '../../services/aiSearchService';

// Component Imports
import NavbarAdmin from './NavbarAdmin';
import SidebarAdmin from './SidebarAdmin';
import MessageAi from '../shared/messageAI';
import ConsulterUsersPage from './Utilisateurs/ConsulterUsersPage';
import ConsulterEquipesPage from './Equipes/ConsulterEquipesPage';
import ConsulterModulesPage from './Modules/ConsulterModulesPage';
import ConsulterPostesPage from './Postes/ConsulterPostesPage';
import TicketsManagementPage from './Tickets/TicketsManagementPage';
import ConsultProfilPage from './profil/ConsultProfilPage';
import { Menu as MenuIconLucide } from 'lucide-react';
import ConsulterClientPage from './Clients/ConsulterClientPage';
import GoodbyePage from '../shared/GoodbyePage';

const LoadingIndicator = () => (
  <div className="loading-indicator-container">
    <svg className="loading-ring-svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="comet-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0, 255, 255, 0)" /><stop offset="100%" stopColor="rgba(0, 255, 255, 1)" />
        </linearGradient>
      </defs>
      <circle className="ring-background-track" cx="50" cy="50" r="40" /><circle className="ring-comet" cx="50" cy="50" r="40" />
    </svg>
    <h2 className="loading-text">clinicAi</h2>
  </div>
);


const AdminInterface = () => {
  const { currentUser, logout: appLogoutHandler } = useOutletContext();
  const [activePage, setActivePage] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [notification, setNotification] = useState(null); // Replaces pageMessage
  const [searchResults, setSearchResults] = useState(null);
  const [searchEntityType, setSearchEntityType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [disconnect,setDisconnect]=useState(false);
  
  // Note: usersData state and fetch logic is kept for other components that might need it.
  const [usersData, setUsersData] = useState([]);
  const fetchUsersForAdmin = useCallback(async () => {
    try {
      const response = await utilisateurService.getAllUtilisateurs();
      setUsersData(response.data || []);
    } catch (error) { console.error("Erreur:", error); }
  }, []);
  useEffect(() => { fetchUsersForAdmin(); }, [fetchUsersForAdmin]);

  const showNotification = useCallback((type, text, action = null, duration = 7000) => {
    setNotification({ type, text, action });
    if (duration) {
      setTimeout(() => setNotification(null), duration);
    }
  }, []);

  const clearNotification = useCallback(() => setNotification(null), []);

  const handleAiSearch = async (query) => {
    clearNotification();
    setIsLoading(true);
    setSearchResults(null);
    setSearchEntityType(null);
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const response = await aiSearchService.search(query);
      const results = response; // Assuming data is nested under a 'data' property
      if (results.entityType=="disconnect") {
        setDisconnect(true)
      }
      // ** NEW: Handle "doumean" suggestion response **
      if (results && results.doumean) {
        const suggestion = results.doumean;
        showNotification(
          'info',
          `Vouliez-vous dire : "${suggestion}" ?`,
          {
            text: `Rechercher "${suggestion}"`,
            onClick: () => {
              clearNotification();
              handleAiSearch(suggestion); // Recursively call search with the suggestion
            }
          },
          null // Do not auto-dismiss suggestion messages
        );
      }
      // Handle standard entity response
      else if (results?.entityType && Array.isArray(results.data)) {
        setSearchResults(results.data);
        setSearchEntityType(results.entityType);
        if (results.entityType==="disconnect") {
          return <GoodbyePage/>
        }
        const pageMap = {
          'ticket': 'tickets_management', 'utilisateur': 'utilisateurs_consulter_utilisateurs',
          'equipe': 'equipes_consulter_equipes', 'module': 'modules_consulter_modules', 'poste': 'postes_consulter_postes',
          'client':'clients_consulter_clients',
         
        };
        if(pageMap[results.entityType]) setActivePage(pageMap[results.entityType]);
        else { showNotification('error', `Type d'entité non reconnu : ${results.entityType}`); }
      } 
      // Handle no results
      else {
        showNotification('info', "La recherche n'a retourné aucun résultat pertinent.");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche IA:", error);
      showNotification('error', "le serveur ai est en maintenance");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetActivePage = (pageId) => {
    setSearchResults(null);
    setSearchEntityType(null);
    setActivePage(pageId);
    clearNotification();
    if (window.innerWidth < 768) { setIsSidebarOpen(false); }
  };
  
  // ... (toggleTheme, logout, profile navigation functions remain the same)
  const toggleTheme = () => setIsDarkMode(prev => { const newMode = !prev; localStorage.setItem('theme', newMode ? 'dark' : 'light'); return newMode; });
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  useEffect(() => { if (isDarkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }, [isDarkMode]);
  const handleActualLogout = () => { if (appLogoutHandler) appLogoutHandler(); else { localStorage.clear(); window.location.reload(); } };
  const handleNavigateToUserProfile = useCallback(() => setActivePage('consulter_profil_admin'), []);
  const handleNavigateToHome = useCallback(() => setActivePage('home'), []);
  const handleUpdateUserProfile = useCallback((updatedUserData) => { setUsersData(prev => prev.map(u => u.id === updatedUserData.id ? updatedUserData : u)); showNotification('success', 'Profil modifié avec succès.'); setActivePage('consulter_profil_admin'); }, [showNotification]);


  const renderActivePage = () => {
    // ... render logic remains the same
    const pageId = typeof activePage === 'object' ? activePage.id : activePage;
    const filter = typeof activePage === 'object' ? activePage.filter : null;
    switch (pageId) {
      case 'home': return <div className="p-6 text-3xl font-bold text-slate-800 dark:text-slate-100">Tableau de bord</div>;
      case 'utilisateurs_consulter_utilisateurs': return <ConsulterUsersPage initialUsers={searchEntityType === 'utilisateur' ? searchResults : null} />;
      case 'equipes_consulter_equipes': return <ConsulterEquipesPage users={usersData} initialEquipes={searchEntityType === 'equipe' ? searchResults : null} />;
      case 'modules_consulter_modules': return <ConsulterModulesPage initialModules={searchEntityType === 'module' ? searchResults : null} />;
      case 'clients_consulter_clients': return <ConsulterClientPage />;      case 'postes_consulter_postes': return <ConsulterPostesPage initialPostes={searchEntityType === 'poste' ? searchResults : null} />;
      case 'tickets_management': return <TicketsManagementPage showTemporaryMessage={showNotification} initialFilterStatus={filter} initialTickets={searchEntityType === 'ticket' ? searchResults : null} />;
      case 'consulter_profil_admin': return currentUser ? <ConsultProfilPage user={currentUser} onUpdateProfile={handleUpdateUserProfile} onNavigateHome={handleNavigateToHome} /> : <div className="p-6 text-center">Utilisateur non trouvé.</div>;
      default: return <div className="p-6 text-xl font-bold">Page "{pageId}" non trouvée</div>;
    }
  };
  if (disconnect) {
    return <GoodbyePage/>
  }

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <SidebarAdmin activePage={activePage} setActivePage={handleSetActivePage} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} className={`fixed md:relative z-40 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>}
        <button onClick={toggleSidebar} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-md shadow text-slate-600 dark:text-slate-300">
          <MenuIconLucide size={24} />
        </button>
        <NavbarAdmin user={currentUser} onLogout={handleActualLogout} onSearch={handleAiSearch} />
        
        <main className={`flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
          {/* Render the new MessageAi component */}
          {notification && (
            <MessageAi
              message={notification.text}
              type={notification.type}
              action={notification.action}
              onDismiss={clearNotification}
            />
          )}
          {isLoading ? <LoadingIndicator /> : renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default AdminInterface;