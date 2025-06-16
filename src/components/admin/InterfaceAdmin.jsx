import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom'; // Import nécessaire pour récupérer le contexte de l'Outlet
import utilisateurService from '../../services/utilisateurService';

// Imports des composants de layout
import NavbarAdmin from './NavbarAdmin';
import SidebarAdmin from './SidebarAdmin';

// Imports des sections (pages de gestion spécifiques)
import ConsulterUsersPage from './Utilisateurs/ConsulterUsersPage';
import ConsulterEquipesPage from './Equipes/ConsulterEquipesPage';
import ConsulterModulesPage from './Modules/ConsulterModulesPage';
import ConsulterPostesPage from './Postes/ConsulterPostesPage';

// Import de la nouvelle page unique de gestion des tickets
import TicketsManagementPage from './Tickets/TicketsManagementPage';

// Import de la page de profil
import ConsultProfilPage from './profil/ConsultProfilPage';

// Import des icônes de Lucide React
import { Menu as MenuIconLucide, X } from 'lucide-react';
// Import de l'image de profil par défaut (si nécessaire, sinon peut être supprimé)
import initialDefaultProfilePic from '../../assets/images/default-profile.png';

// Le composant principal de l'interface d'administration
// Il ne reçoit plus 'user' et 'onLogout' directement en props,
// mais les récupère via useOutletContext de React Router.
const AdminInterface = () => {
  // Récupération de l'utilisateur authentifié et de la fonction de déconnexion du contexte de l'Outlet
  // `currentUser` est l'objet utilisateur, `logout` est la fonction de déconnexion.
  const { currentUser, logout: appLogoutHandler } = useOutletContext();

  // États locaux pour la gestion de l'UI et des données
  const [activePage, setActivePage] = useState('home'); // Page actuellement affichée dans le contenu principal
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialise le mode sombre à partir du localStorage si disponible
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // État d'ouverture/fermeture de la barre latérale sur mobile
  const [usersData, setUsersData] = useState([]); // Données de tous les utilisateurs (pour les listes déroulantes, etc.)

  // États pour la gestion des messages temporaires (notifications) et du surlignement d'éléments
  const [pageMessage, setPageMessage] = useState(null); // Contient le message à afficher
  const [highlightedItemId, setHighlightedItemId] = useState(null); // ID de l'élément à surligner
  const [actionStatus, setActionStatus] = useState(null); // Statut de l'action (ex: 'success', 'error', 'info') pour le surlignement

  // Fonction useCallback pour récupérer les données de tous les utilisateurs
  // Utilisée lors du montage du composant et potentiellement pour d'autres besoins
  const fetchUsersForAdmin = useCallback(async () => {
    try {
      const response = await utilisateurService.getAllUtilisateurs();
      setUsersData(response.data || []); // Met à jour l'état avec les données des utilisateurs
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs pour l'interface admin:", error);
      // Optionnel : afficher un message temporaire d'erreur ici si le chargement initial échoue
      // showTemporaryMessage('error', "Erreur de chargement des utilisateurs", null, null);
    }
  }, []); // Dépendances vides, la fonction est stable et ne se recrée pas inutilement

  // Effet pour déclencher le chargement des utilisateurs au montage du composant
  useEffect(() => {
    fetchUsersForAdmin();
  }, [fetchUsersForAdmin]); // La fonction est une dépendance pour useCallback

  // Fonction pour basculer entre le mode clair et le mode sombre
  const toggleTheme = () => setIsDarkMode(prev => {
    const newMode = !prev;
    // Persiste le choix du thème dans le localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
    }
    return newMode;
  });

  // Fonction pour ouvrir/fermer la barre latérale (utilisée sur mobile)
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  // Effet pour appliquer la classe 'dark' à l'élément HTML selon le mode sombre
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fonction générique pour afficher un message temporaire (notification)
  // Peut aussi déclencher un surlignement d'élément
  const showTemporaryMessage = useCallback((type, text, targetIdForHighlight = null, status = null) => {
    setPageMessage({ type, text }); // Définit le contenu du message
    setHighlightedItemId(targetIdForHighlight); // Définit l'ID de l'élément à surligner
    setActionStatus(status); // Définit le statut pour le style de surlignement
    // Configure un timer pour faire disparaître le message et le surlignement
    setTimeout(() => {
      setPageMessage(null);
      setHighlightedItemId(null);
      setActionStatus(null);
    }, 7000); // Le message reste visible pendant 7 secondes
  }, []); // Dépendances vides, la fonction est stable

  // Fonction pour effacer manuellement le message de page (ex: si l'utilisateur clique sur 'X')
  const clearPageMessage = useCallback(() => {
    setPageMessage(null);
    setHighlightedItemId(null);
    setActionStatus(null);
  }, []); // Dépendances vides, la fonction est stable

  // Gère la déconnexion de l'utilisateur
  const handleActualLogout = () => {
    if (appLogoutHandler) {
      appLogoutHandler(); // Appelle la fonction de déconnexion fournie par AuthContext
    } else {
      // Fallback si onLogout n'est pas fourni (par exemple, en mode de développement isolé)
      localStorage.clear(); // Efface toutes les données du localStorage
      console.log("Déconnexion simulée, redirection vers la page de login.");
      window.location.reload(); // Force un rechargement complet de la page
    }
  };

  // Fonctions de navigation vers des pages spécifiques
  const handleNavigateToUserProfile = useCallback(() => {
    setActivePage('consulter_profil_admin');
  }, []);

  const handleNavigateToHome = useCallback(() => {
    setActivePage('home');
  }, []);

  // Gère la mise à jour du profil utilisateur (si l'action vient d'un sous-composant)
  const handleUpdateUserProfile = useCallback((updatedUserData) => {
    // Met à jour la liste des utilisateurs si le profil de l'utilisateur actuel est modifié
    const newUsersData = usersData.map(u =>
      u.id === updatedUserData.id ? updatedUserData : u
    );
    setUsersData(newUsersData);

    // Si l'utilisateur mis à jour est l'utilisateur actuellement connecté, met à jour son état local
    // Note: currentUser est déjà mis à jour via AuthContext, c'est pour la cohérence interne des états
    // if (currentUser && currentUser.id === updatedUserData.id) {
    //   setCurrentUserState(updatedUserData); // Déjà mis à jour par AuthContext normalement
    // }
    showTemporaryMessage('success', 'Profil modifié avec succès.', null, null);
    setActivePage('consulter_profil_admin'); // Reste sur la page du profil après la mise à jour
  }, [usersData, currentUser, showTemporaryMessage]); // Dépendances de useCallback

  // Logique de rendu de la page active en fonction de l'état 'activePage'
  const renderActivePage = () => {
    const pageId = typeof activePage === 'object' ? activePage.id : activePage;
    const filter = typeof activePage === 'object' ? activePage.filter : null;

    switch (activePage) {
      case 'home':
        return <div className="p-6 text-3xl font-bold text-slate-800 dark:text-slate-100">Tableau de bord Administrateur</div>;

      case 'utilisateurs_consulter_utilisateurs':
        return <ConsulterUsersPage />; // Affiche la page de gestion des utilisateurs

      case 'equipes_consulter_equipes':
        return <ConsulterEquipesPage users={usersData} />; // Affiche la page de gestion des équipes

      case 'modules_consulter_modules':
        return <ConsulterModulesPage />; // Affiche la page de gestion des modules

      case 'postes_consulter_postes':
        return <ConsulterPostesPage />; // Affiche la page de gestion des postes

      case 'tickets_management':
      // Pass the extracted 'filter' to the TicketsManagementPage component
      return (
        <TicketsManagementPage
          showTemporaryMessage={showTemporaryMessage}
          initialFilterStatus={filter} // Pass the filter as a prop
        />
      );

      case 'consulter_profil_admin':
        // Affiche la page de profil de l'administrateur
        // user vient de currentUser du contexte, onUpdateProfile et onNavigateHome sont des callbacks
        return currentUser ? <ConsultProfilPage user={currentUser} onUpdateProfile={handleUpdateUserProfile} onNavigateHome={handleNavigateToHome} /> : <div className="p-6 text-center">Utilisateur non trouvé.</div>;

      case 'login_page_placeholder':
        // Page affichée temporairement après une déconnexion avant le rechargement
        return (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Vous avez été déconnecté.</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-8">Vous allez être redirigé vers la page de connexion.</p>
          </div>
        );

      default:
        // Page par défaut si activePage ne correspond à rien
        return <div className="p-6 text-xl font-bold text-slate-800 dark:text-slate-100">Page "{activePage}" non trouvée</div>;
    }
  };

  // Clause de garde : Si l'utilisateur n'est pas authentifié ou ses infos sont incomplètes,
  // affiche un message d'erreur. C'est la première chose qui est vérifiée.
  // currentUser provient du AuthContext via useOutletContext.
  // if (!currentUser || !currentUser.id) {
  //   return (
  //     <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 text-xl text-red-600 dark:text-red-400">
  //       Erreur: Utilisateur non identifié. Impossible de charger l'interface d'administration.
  //     </div>
      
  //   );
  //   // Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
  // }

  // Rendu de l'interface d'administration
  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar (barre latérale de navigation) */}
      <SidebarAdmin
        activePage={activePage} // Page active pour le surlignement dans la sidebar
        setActivePage={(pageId) => { setActivePage(pageId); clearPageMessage(); }} // Gère la navigation et efface les messages
        isSidebarOpen={isSidebarOpen} // État d'ouverture/fermeture
        toggleSidebar={toggleSidebar} // Fonction pour basculer
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Bouton pour ouvrir/fermer la sidebar sur mobile */}
        <button onClick={toggleSidebar} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-md shadow text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Ouvrir le menu">
          <MenuIconLucide size={24} />
        </button>
        
        {/* Navbar (barre de navigation supérieure) */}
        <NavbarAdmin
          user={currentUser} // Passe l'objet utilisateur récupéré du contexte
          onLogout={handleActualLogout} // Passe la fonction de déconnexion
          toggleTheme={toggleTheme} // Passe la fonction de bascule de thème
          isDarkMode={isDarkMode} // Passe l'état du mode sombre
          onNavigateToUserProfile={handleNavigateToUserProfile} // Passe la fonction de navigation vers le profil
        />
        
        {/* Zone de contenu principal */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto pt-16 md:ml-64 transition-all duration-300 ease-in-out">
          {/* Affichage du message temporaire (notification) */}
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
          
          {/* Rendu dynamique de la page active */}
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default AdminInterface;