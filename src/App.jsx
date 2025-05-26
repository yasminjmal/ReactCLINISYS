import React, { useState, useEffect } from 'react';
// Importations nécessaires depuis react-router-dom
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './components/LoginPage'; // Assurez-vous que le chemin est correct
import AdminInterface from './components/admin/InterfaceAdmin'; // Assurez-vous que le chemin est correct
// import ChefEquipeInterface from './components/chefEquipe/ChefEquipeInterface'; // Pour plus tard
// import EmployeInterface from './components/employe/EmployeInterface'; // Pour plus tard
import './index.css'; // Vos styles globaux

// --- Données Statiques des Utilisateurs (exemple) ---
const mockUsers = [
  {
    username: 'admin',
    password: 'admin',
    role: 'admin',
    name: 'Administrateur C.',
    profileImage: '/assets/images/default-profile.png',
    email: 'admin@clinisys.com'
  },
  {
    username: 'chef',
    password: 'chef',
    role: 'chef_equipe',
    name: 'Chef Michel',
    profileImage: '/assets/images/default-profile.png',
    email: 'chef@clinisys.com'
  },
  {
    username: 'employe',
    password: 'employe',
    role: 'employe',
    name: 'Employé Jean',
    profileImage: '/assets/images/default-profile.png',
    email: 'employe@clinisys.com'
  },
]; //

function App() {
  const [currentUser, setCurrentUser] = useState(null); //
  const [loading, setLoading] = useState(true); // Ajout d'un état de chargement

  useEffect(() => {
    // J'ai décommenté cette section pour restaurer la persistance de session.
    // Adaptez selon vos besoins de test.
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Erreur lors de la lecture de l'utilisateur depuis localStorage", e);
          localStorage.removeItem('currentUser');
        }
      }
    }
    setLoading(false); // Fin du chargement initial
  }, []); //

  const handleLoginSuccess = (loggedInUserCredentials) => {
    const fullUser = mockUsers.find(u => u.username === loggedInUserCredentials.username && u.password === loggedInUserCredentials.password); //

    if (fullUser) {
      setCurrentUser(fullUser); //
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(fullUser)); //
      }
      // La redirection sera gérée par la logique des Routes ci-dessous après la mise à jour de currentUser
    } else {
      console.error("Identifiants incorrects ou utilisateur non trouvé."); //
      // LoginPage devrait idéalement gérer l'affichage des erreurs
    }
  };

  const handleLogout = () => {
    setCurrentUser(null); //
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser'); //
    }
    // La redirection vers /login sera gérée par la logique des Routes ci-dessous
  };

  if (loading) {
    return <div>Chargement...</div>; // Afficher un message pendant la vérification du localStorage
  }

  // Le BrowserRouter englobe toute la logique de routage
  return (
    <BrowserRouter>
      <Routes>
        {!currentUser ? (
          // --- Utilisateur NON authentifié ---
          <>
            <Route 
              path="/login" 
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />} 
            />
            {/* Rediriger toutes les autres routes vers /login si non authentifié */}
            {/* On utilise "/*" pour capturer toutes les routes non définies précédemment dans ce bloc */}
            <Route path="/*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          // --- Utilisateur AUTHENTIFIÉ ---
          <>
            {/* Route spécifique pour l'administrateur */}
            {currentUser.role === 'admin' && (
              <Route 
                path="/admin/*" // Le '/*' permet à AdminInterface de gérer ses propres sous-routes
                element={<AdminInterface user={currentUser} onLogout={handleLogout} />} 
              />
            )}
            {/* Vous pouvez ajouter d'autres rôles ici de la même manière */}
            {/* Exemple pour chef_equipe (à décommenter et adapter) :
            {currentUser.role === 'chef_equipe' && (
              <Route 
                path="/chef/*" 
                element={<ChefEquipeInterface user={currentUser} onLogout={handleLogout} />} 
              />
            )}
            */}

            {/* Redirection par défaut pour l'utilisateur connecté */}
            {/* Si l'URL est / ou /login, rediriger vers la page principale de son rôle */}
            <Route 
              path="/" 
              element={
                <Navigate 
                  to={currentUser.role === 'admin' ? '/admin' : 
                     (currentUser.role === 'chef_equipe' ? '/chef' : /* Ajoutez d'autres rôles ici */
                     (currentUser.role === 'employe' ? '/employe' : '/login'))} /* Fallback vers /login si rôle inconnu */
                  replace 
                />
              } 
            />
            {/* Si un utilisateur connecté essaie d'aller explicitement sur /login */}
            <Route 
              path="/login"
              element={
                <Navigate 
                  to={currentUser.role === 'admin' ? '/admin' :
                     (currentUser.role === 'chef_equipe' ? '/chef' :
                     (currentUser.role === 'employe' ? '/employe' : '/login'))}
                  replace 
                />
              } 
            />
            
            {/* Fallback pour les routes non trouvées pour un utilisateur connecté.
                Redirige vers la page principale de son rôle ou /login si le rôle n'est pas géré ci-dessus.
                S'assurer que cette route est la dernière dans ce bloc authentifié pour ne pas court-circuiter
                les routes spécifiques comme /admin/* */}
            <Route 
              path="/*" 
              element={
                <Navigate 
                  to={currentUser.role === 'admin' ? '/admin' :
                     (currentUser.role === 'chef_equipe' ? '/chef' :
                     (currentUser.role === 'employe' ? '/employe' : '/login'))}
                  replace 
                />
              } 
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;