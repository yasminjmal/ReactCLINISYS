// src/components/admin/InterfaceAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import utilisateurService from '../../services/utilisateurService';
import aiSearchService from '../../services/aiSearchService'; // Import the new service

// ... other component imports
import NavbarAdmin from './NavbarAdmin';
import SidebarAdmin from './SidebarAdmin';
import ConsulterUsersPage from './Utilisateurs/ConsulterUsersPage';
import ConsulterEquipesPage from './Equipes/ConsulterEquipesPage';
import ConsulterModulesPage from './Modules/ConsulterModulesPage';
import ConsulterPostesPage from './Postes/ConsulterPostesPage';
import TicketsManagementPage from './Tickets/TicketsManagementPage';
import ConsultProfilPage from './profil/ConsultProfilPage';
import { Menu as MenuIconLucide, X } from 'lucide-react';

const AdminInterface = () => {
  const { currentUser, logout: appLogoutHandler } = useOutletContext();
  const [activePage, setActivePage] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [pageMessage, setPageMessage] = useState(null);

  // New states for AI search results
  const [searchResults, setSearchResults] = useState(null);
  const [searchEntityType, setSearchEntityType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  const fetchUsersForAdmin = useCallback(async () => {
    try {
      const response = await utilisateurService.getAllUtilisateurs();
      setUsersData(response.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs pour l'interface admin:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsersForAdmin();
  }, [fetchUsersForAdmin]);
  
  const toggleTheme = () => setIsDarkMode(prev => {
    const newMode = !prev;
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
    }
    return newMode;
  });

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  const showTemporaryMessage = useCallback((type, text, targetIdForHighlight = null, status = null) => {
    setPageMessage({ type, text });
    setTimeout(() => {
      setPageMessage(null);
    }, 7000);
  }, []);

  const clearPageMessage = useCallback(() => {
    setPageMessage(null);
  }, []);

  const handleActualLogout = () => {
    if (appLogoutHandler) {
      appLogoutHandler();
    } else {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleNavigateToUserProfile = useCallback(() => {
    setActivePage('consulter_profil_admin');
  }, []);

  const handleNavigateToHome = useCallback(() => {
    setActivePage('home');
  }, []);

  const handleUpdateUserProfile = useCallback((updatedUserData) => {
    const newUsersData = usersData.map(u =>
      u.id === updatedUserData.id ? updatedUserData : u
    );
    setUsersData(newUsersData);
    showTemporaryMessage('success', 'Profil modifié avec succès.');
    setActivePage('consulter_profil_admin');
  }, [usersData, showTemporaryMessage]);
  
  // New function to handle AI Search
  const handleAiSearch = async (query) => {
    clearPageMessage();
    showTemporaryMessage('info', `Recherche IA en cours pour : "${query}"`);
    setIsLoading(true);
    setSearchResults(null);
    setSearchEntityType(null);

    try {
        const results = await aiSearchService.search(query);
        console.log("AI Search results:", results);

        if (results && results.entityType && Array.isArray(results.data)) {
            setSearchResults(results.data);
            setSearchEntityType(results.entityType);

            switch (results.entityType) {
                case 'ticket': setActivePage('tickets_management'); break;
                case 'utilisateur': setActivePage('utilisateurs_consulter_utilisateurs'); break;
                case 'equipe': setActivePage('equipes_consulter_equipes'); break;
                case 'module': setActivePage('modules_consulter_modules'); break;
                case 'poste': setActivePage('postes_consulter_postes'); break;
                default:
                    showTemporaryMessage('error', `Type d'entité non reconnu : ${results.entityType}`);
                    setSearchResults(null);
                    setSearchEntityType(null);
            }
            clearPageMessage();
        } else {
             showTemporaryMessage('info', "La recherche n'a retourné aucun résultat exploitable.");
        }
    } catch (error) {
        console.error("Erreur lors de la recherche IA:", error);
        showTemporaryMessage('error', "Erreur lors de la recherche IA.");
    } finally {
        setIsLoading(false);
    }
  };
  
  // Clears search results when navigating via the sidebar
  const handleSetActivePage = (pageId) => {
      setSearchResults(null);
      setSearchEntityType(null);
      setActivePage(pageId);
      clearPageMessage();
  };


  const renderActivePage = () => {
    const pageId = typeof activePage === 'object' ? activePage.id : activePage;
    const filter = typeof activePage === 'object' ? activePage.filter : null;

    switch (pageId) {
      case 'home':
        return <div className="p-6 text-3xl font-bold text-slate-800 dark:text-slate-100">Tableau de bord Administrateur</div>;

      case 'utilisateurs_consulter_utilisateurs':
        return <ConsulterUsersPage initialUsers={searchEntityType === 'utilisateur' ? searchResults : null} />;

      case 'equipes_consulter_equipes':
        return <ConsulterEquipesPage users={usersData} initialEquipes={searchEntityType === 'equipe' ? searchResults : null} />;

      case 'modules_consulter_modules':
        return <ConsulterModulesPage initialModules={searchEntityType === 'module' ? searchResults : null} />;

      case 'postes_consulter_postes':
        return <ConsulterPostesPage initialPostes={searchEntityType === 'poste' ? searchResults : null} />;

      case 'tickets_management':
        return (
          <TicketsManagementPage
            showTemporaryMessage={showTemporaryMessage}
            initialFilterStatus={filter}
            initialTickets={searchEntityType === 'ticket' ? searchResults : null}
          />
        );

      case 'consulter_profil_admin':
        return currentUser ? <ConsultProfilPage user={currentUser} onUpdateProfile={handleUpdateUserProfile} onNavigateHome={handleNavigateToHome} /> : <div className="p-6 text-center">Utilisateur non trouvé.</div>;

      default:
        return <div className="p-6 text-xl font-bold text-slate-800 dark:text-slate-100">Page "{pageId}" non trouvée</div>;
    }
  };

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <SidebarAdmin
        activePage={activePage}
        setActivePage={handleSetActivePage} // Use the new handler
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <button onClick={toggleSidebar} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-md shadow text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Ouvrir le menu">
          <MenuIconLucide size={24} />
        </button>
        
        <NavbarAdmin
          user={currentUser}
          onLogout={handleActualLogout}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
          onNavigateToUserProfile={handleNavigateToUserProfile}
          onSearch={handleAiSearch} // Pass the new search handler
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto  md:ml-64 transition-all duration-300 ease-in-out">
          {pageMessage && pageMessage.text && (
            <div className={`fixed top-20 right-6 p-4 rounded-md shadow-lg z-[100] flex items-center space-x-3 animate-slide-in-right border-l-4
                            ${pageMessage.type === 'success' ? 'bg-green-100 dark:bg-green-800/70 border-green-500 text-green-700 dark:text-green-100'
                              : pageMessage.type === 'error' ? 'bg-red-100 dark:bg-red-800/70 border-red-500 text-red-700 dark:text-red-100'
                              : pageMessage.type === 'info' ? 'bg-blue-100 dark:bg-blue-800/70 border-blue-500 text-blue-700 dark:text-blue-100'
                              : 'bg-yellow-100 dark:bg-yellow-800/70 border-yellow-500 text-yellow-700 dark:text-yellow-100'}`}
                             style={{marginTop: '0.5rem'}} role="alert"
            >
              <span className="font-medium flex-grow">{pageMessage.text}</span>
              <button onClick={clearPageMessage} className="ml-auto p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"> <X size={18}/> </button>
            </div>
          )}
          {isLoading ? <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div></div> : renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default AdminInterface;