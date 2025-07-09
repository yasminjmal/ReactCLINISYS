import React, { useState, useEffect, useCallback } from 'react';
import utilisateurService from '../../services/utilisateurService';
import aiSearchService from '../../services/aiSearchService';

// Component Imports
import ChatInterface from './../chat/ChatInterface';
import NavbarAdmin from './NavbarAdmin';
import SidebarAdmin from './SidebarAdmin';
import MessageAi from '../shared/messageAI';
import ConsulterUsersPage from './Utilisateurs/ConsulterUsersPage';
import ConsulterEquipesPage from './Equipes/ConsulterEquipesPage';
import ConsulterModulesPage from './Modules/ConsulterModulesPage';
import ConsulterPostesPage from './Postes/ConsulterPostesPage';
import TicketsManagementPage from './Tickets/TicketsManagementPage';
import ConsultProfilPage from './profil/ConsultProfilPage';
import ConsulterClientPage from './Clients/ConsulterClientPage';
import GoodbyePage from '../shared/GoodbyePage';
import DashboardPage from './Dashboards/DashboardPage';
import HomePage from './HomePage';
import TracabilitePage from './Tracability/TracabilitePage';
import SearchAiBar from '../shared/SearchAiBar';
import SearchResultsModal from '../shared/SearchAiModal';

// Context Providers
import { WebSocketProvider } from '../../context/WebSocketContext';
import { ExportProvider } from '../../context/ExportContext';


const LoadingIndicator = () => (
    <div className="flex items-center justify-center h-full w-full">
        <div className="relative flex flex-col items-center">
            <svg className="w-24 h-24" viewBox="0 0 100 100">
                <defs>
                    <linearGradient id="comet-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
                        <stop offset="100%" stopColor="rgba(59, 130, 246, 1)" />
                    </linearGradient>
                </defs>
                <circle className="stroke-current text-slate-200 dark:text-slate-700" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                <circle className="stroke-current text-blue-500 transform -rotate-90 origin-center" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset="188.4" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="stroke-dashoffset" values="251.2;62.8;251.2" dur="1.5s" repeatCount="indefinite" />
                </circle>
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-slate-600 dark:text-slate-300">Chargement...</h2>
        </div>
    </div>
);

const AdminInterface = ({ user, onLogout }) => {
    const [activePage, setActivePage] = useState('home');
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [notification, setNotification] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    const [searchEntityType, setSearchEntityType] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [disconnect, setDisconnect] = useState(false);
    const [usersData, setUsersData] = useState([]);

    const fetchUsersForAdmin = useCallback(async () => {
        try {
            const response = await utilisateurService.getAllUtilisateurs();
            setUsersData(response.data || []);
        } catch (error) {
            console.error("Erreur:", error);
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

    const handleSetActivePage = (pageId) => {
        setSearchResults(null); // Close modal on navigation
        setSearchEntityType(null);
        setActivePage(pageId);
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const handleAiSearch = async (query) => {
        clearNotification();
        setIsLoading(true);
        setSearchResults(null);
        setSearchEntityType(null);
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        try {
            const results = await aiSearchService.search(query);

            if (results.entityType === "disconnect") {
                setDisconnect(true);
                return;
            }
            if (results && results.doumean) {
                const suggestion = results.doumean;
                showNotification('info', `Vouliez-vous dire : "${suggestion}" ?`, { text: `Rechercher "${suggestion}"`, onClick: () => { clearNotification(); handleAiSearch(suggestion); } }, null);
            } else if (results?.entityType && Array.isArray(results.data)) {
                
                // ✅ NOUVELLE LOGIQUE ICI
                if (results.data.length > 0) {
                    // Si on a des résultats, on affiche le modal
                    setSearchResults(results.data);
                    setSearchEntityType(results.entityType);
                } else {
                    // Si les données sont vides, on navigue vers la page de l'entité
                    const pageMap = {
                        'ticket': 'tickets_management',
                        'utilisateur': 'utilisateurs_consulter_utilisateurs',
                        'equipe': 'equipes_consulter_equipes',
                        'module': 'modules_consulter_modules',
                        'poste': 'postes_consulter_postes',
                        'client': 'clients_consulter_clients',
                    };
                    const pageId = pageMap[results.entityType];
                    if (pageId) {
                        showNotification(`navigation vers ${results.entityType}s.`);
                        handleSetActivePage(pageId);
                    } else {
                        showNotification('error', `Type d'entité non reconnu : ${results.entityType}`);
                    }
                }
            } else {
                showNotification('info', "La recherche n'a retourné aucun résultat pertinent.");
            }
        } catch (error) {
            console.error("Erreur lors de la recherche IA:", error);
            showNotification('error', "Le serveur AI est en maintenance");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setSearchResults(null);
        setSearchEntityType(null);
    };
    
    const toggleTheme = () => setIsDarkMode(prev => { const newMode = !prev; localStorage.setItem('theme', newMode ? 'dark' : 'light'); return newMode; });
    
    useEffect(() => { 
        if (isDarkMode) document.documentElement.classList.add('dark'); 
        else document.documentElement.classList.remove('dark'); 
    }, [isDarkMode]);

    const handleUpdateUserProfile = useCallback(async (userId, updatedUserData, photoFile) => {
        try {
            await utilisateurService.updateUtilisateur(userId, updatedUserData, photoFile);
            setUsersData(prev => prev.map(u => u.id === userId ? { ...u, ...updatedUserData } : u));
            showNotification('success', 'Profil mis à jour avec succès.');
            fetchUsersForAdmin();
        } catch (error) {
            console.error("Error updating user profile:", error);
            showNotification('error', error.response?.data?.message || 'Failed to update profile.');
        }
    }, [showNotification, fetchUsersForAdmin]);


    if (disconnect) {
        return <GoodbyePage />;
    }

    const renderPage = () => {
        const pageId = typeof activePage === 'object' ? activePage.id : activePage;
        const filter = typeof activePage === 'object' ? activePage.filter : null;
        switch (pageId) {
            case 'home': return <HomePage />;
            case 'dashboards': return <DashboardPage />;
            case 'utilisateurs_consulter_utilisateurs': return <ConsulterUsersPage />;
            case 'equipes_consulter_equipes': return <ConsulterEquipesPage users={usersData} />;
            case 'modules_consulter_modules': return <ConsulterModulesPage />;
            case 'clients_consulter_clients': return <ConsulterClientPage />;
            case 'postes_consulter_postes': return <ConsulterPostesPage />;
            case 'tickets_management': return <TicketsManagementPage showTemporaryMessage={showNotification} initialFilterStatus={filter} />;
            case 'consulter_profil_admin': return user ? <ConsultProfilPage user={user} onUpdateProfile={handleUpdateUserProfile} onNavigateHome={() => setActivePage('home')} /> : <div className="p-6 text-center">Utilisateur non trouvé.</div>;
            case 'discussions': return <ChatInterface currentUser={user} />;
            case 'tracabilite': return <TracabilitePage />;
            default: return <div className="p-6 text-xl font-bold">Page "{pageId}" non trouvée</div>;
        }
    };

    return (
        <WebSocketProvider>
            <SearchResultsModal
                isOpen={!!searchResults}
                onClose={handleCloseModal}
                data={searchResults}
                entityType={searchEntityType}
            />
            
            <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 ${isDarkMode ? 'dark' : ''}`}>
                <SidebarAdmin
                    activePage={activePage}
                    setActivePage={handleSetActivePage}
                    isSidebarOpen={isSidebarOpen}
                    currentUser={user}
                />
                
                {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>}

                <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
                    <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 shadow">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="ml-4 md:ml-10 w-full md:w-1/3 my-2 md:my-0">
                                <SearchAiBar onSearch={handleAiSearch} />
                            </div>
                            <NavbarAdmin
                                user={user}
                                onLogout={onLogout}
                                onSearch={handleAiSearch}
                                isSidebarOpen={isSidebarOpen}
                                onNavigateToProfile={() => setActivePage('consulter_profil_admin')}
                            />
                        </div>
                    </div>

                    <main className="flex-1 overflow-x-hidden overflow-y-auto pt-0 relative">
                        {notification && (
                            <MessageAi message={notification.text} type={notification.type} action={notification.action} onDismiss={clearNotification} />
                        )}
                        {isLoading ? <LoadingIndicator /> : (
                            <ExportProvider>
                                {renderPage()}
                            </ExportProvider>
                        )}
                    </main>
                </div>
            </div>
        </WebSocketProvider>
    );
};

export default AdminInterface;