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
import { Menu as MenuIconLucide, X as CloseIcon } from 'lucide-react'; 
import ConsulterClientPage from './Clients/ConsulterClientPage';
import GoodbyePage from '../shared/GoodbyePage';
import FloatingActionButton from '../../components/FloatingActionButton';
import { ExportProvider } from '../../context/ExportContext';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [notification, setNotification] = useState(null); 
  const [searchResults, setSearchResults] = useState(null);
  const [searchEntityType, setSearchEntityType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [disconnect,setDisconnect]=useState(false);
  
  const [usersData, setUsersData] = useState([]);
  const fetchUsersForAdmin = useCallback(async () => {
    try {
      // setLoading(true); // Gérer le chargement spécifiquement pour les utilisateurs si besoin
      const response = await utilisateurService.getAllUtilisateurs();
      setUsersData(response.data || []);
    } catch (error) { 
      console.error("Erreur:", error); 
    } finally {
      // setLoading(false);
    }
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
      const results = response;
      if (results.entityType=="disconnect") {
        setDisconnect(true)
      }
      if (results && results.doumean) {
        const suggestion = results.doumean;
        showNotification(
          'info',
          `Vouliez-vous dire : "${suggestion}" ?`,
          {
            text: `Rechercher "${suggestion}"`,
            onClick: () => {
              clearNotification();
              handleAiSearch(suggestion);
            }
          },
          null
        );
      }
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
    if (window.innerWidth < 768) { 
        setIsSidebarOpen(false); 
    }
  };
  
  const toggleTheme = () => setIsDarkMode(prev => { const newMode = !prev; localStorage.setItem('theme', newMode ? 'dark' : 'light'); return newMode; });
  const toggleSidebar = useCallback(() => {
      setIsSidebarOpen(prev => !prev);
  }, []); 

  useEffect(() => { if (isDarkMode) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }, [isDarkMode]);
  const handleActualLogout = () => { if (appLogoutHandler) appLogoutHandler(); else { localStorage.clear(); window.location.reload(); } };
  const handleNavigateToUserProfile = useCallback(() => setActivePage('consulter_profil_admin'), []);
  const handleNavigateToHome = useCallback(() => setActivePage('home'), []);
  const handleUpdateUserProfile = useCallback((updatedUserData) => { setUsersData(prev => prev.map(u => u.id === updatedUserData.id ? updatedUserData : u)); showNotification('success', 'Profil modifié avec succès.'); setActivePage('consulter_profil_admin'); }, [showNotification]);


  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar: z-40 pour être au-dessus de la navbar */}
      <SidebarAdmin 
        activePage={activePage} 
        setActivePage={handleSetActivePage} 
        isSidebarOpen={isSidebarOpen} 
        currentUser={currentUser}
      />
      
      {/* Overlay pour mobile quand la sidebar est ouverte */}
      {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>}
      
      {/* Bouton de bascule de la sidebar:
          Placé ici en tant qu'élément `fixed` pour un contrôle précis de sa position.
          Il se déplace indépendamment de la `NavbarAdmin`.
          `md:left-[calc(16rem+1rem)]`: Quand la sidebar est ouverte, il se décale de la largeur de la sidebar + 1rem.
          `left-4`: Quand la sidebar est fermée, il revient à sa position initiale.
          `z-50`: Toujours au-dessus de tout.
      */}
      <button 
        onClick={toggleSidebar} 
        className={`fixed top-4 p-2 rounded-md shadow text-slate-600 dark:text-slate-300
          transition-all duration-300 ease-in-out 
          z-50 
          ${isSidebarOpen ? 'left-[calc(16rem+1rem)]' : 'left-4'} 
          ${isSidebarOpen ? 'bg-white dark:bg-slate-800' : 'bg-transparent'}
        `}
        title={isSidebarOpen ? "Masquer la sidebar" : "Afficher la sidebar"}
      >
        {isSidebarOpen ? <CloseIcon size={24} /> : <MenuIconLucide size={24} />}
      </button>

      {/* Conteneur principal pour la Navbar et le contenu (qui se décale). */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out 
                   ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'} 
                   md:w-full`}>
        
        {/* Navbar: est fixe en haut de CE conteneur, mais ce conteneur lui-même est décalé. */}
        <NavbarAdmin 
          user={currentUser} 
          onLogout={handleActualLogout} 
          onSearch={handleAiSearch} 
          isSidebarOpen={isSidebarOpen} 
        />
        
        {/* Contenu principal: `pt-16` pour laisser de la place à la navbar fixe. */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto pt-16 relative">
          {notification && (
            <MessageAi
              message={notification.text}
              type={notification.type}
              action={notification.action}
              onDismiss={clearNotification}
            />
          )}
          {isLoading ? <LoadingIndicator /> : (
            // ENVELOPPER LE CONTENU DES PAGES DANS LE EXPORTPROVIDER
            <ExportProvider>
              {(() => {
                const pageId = typeof activePage === 'object' ? activePage.id : activePage;
                const filter = typeof activePage === 'object' ? activePage.filter : null;
                switch (pageId) {
                  case 'home': return <div className="p-6 text-3xl font-bold text-slate-800 dark:text-slate-100">Tableau de bord</div>;
                  case 'utilisateurs_consulter_utilisateurs': return <ConsulterUsersPage initialUsers={searchEntityType === 'utilisateur' ? searchResults : null} />;
                  case 'equipes_consulter_equipes': return <ConsulterEquipesPage users={usersData} initialEquipes={searchEntityType === 'equipe' ? searchResults : null} />;
                  case 'modules_consulter_modules': return <ConsulterModulesPage initialModules={searchEntityType === 'module' ? searchResults : null} />;
                  case 'clients_consulter_clients': return <ConsulterClientPage />;      
                  case 'postes_consulter_postes': return <ConsulterPostesPage initialPostes={searchEntityType === 'poste' ? searchResults : null} />;
                  case 'tickets_management': return <TicketsManagementPage showTemporaryMessage={showNotification} initialFilterStatus={filter} initialTickets={searchEntityType === 'ticket' ? searchResults : null} />;
                  case 'consulter_profil_admin': return currentUser ? <ConsultProfilPage user={currentUser} onUpdateProfile={handleUpdateUserProfile} onNavigateHome={handleNavigateToHome} /> : <div className="p-6 text-center">Utilisateur non trouvé.</div>;
                  default: return <div className="p-6 text-xl font-bold">Page "{pageId}" non trouvée</div>;
                }
              })()}
              <FloatingActionButton />
            </ExportProvider>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminInterface;