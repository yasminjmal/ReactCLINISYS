// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 

import LoginPage from './components/LoginPage';
import AdminInterface from './components/admin/InterfaceAdmin';
import ChefEquipeInterface from './components/chefEquipe/InterfaceChefEquipe';
import EmployeInterface from './components/employe/InterfaceEmploye';
import './index.css';

// Fonction de normalisation des rôles (peut être placée ici ou dans un fichier utils)
const normalizeRoleApp = (roleFromServer) => {
  if (!roleFromServer) return '';
  let normalized = String(roleFromServer).toLowerCase();
  if (normalized.startsWith('role_')) {
    normalized = normalized.substring(5); // Enlève "role_"
  }
  return normalized; // ex: "admin", "chef_equipe", "employe"
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Chargement de l'application...</div>;
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const userRoleNormalized = normalizeRoleApp(currentUser.role);
  console.log(`ProtectedRoute: Role original: "${currentUser.role}", Normalisé: "${userRoleNormalized}", Rôles autorisés:`, allowedRoles);

  // allowedRoles dans vos routes est déjà en minuscules (ex: ['admin'])
  if (allowedRoles && !allowedRoles.includes(userRoleNormalized)) {
    console.warn(`ProtectedRoute: Accès refusé pour le rôle "${userRoleNormalized}". Redirection.`);
    let fallbackPath = '/login'; 
    // Rediriger vers la page d'accueil spécifique au rôle si le rôle est connu mais non autorisé pour cette route
    switch (userRoleNormalized) {
      case 'admin': fallbackPath = '/admin'; break;
      case 'chef_equipe': fallbackPath = '/chef'; break;
      case 'employe': fallbackPath = '/employe'; break;
      default: fallbackPath = '/login'; 
    }
    return <Navigate to={fallbackPath} replace />;
  }
  
  // Passer currentUser et la fonction de déconnexion aux composants enfants
  // Assurez-vous que vos composants AdminInterface, etc. utilisent useOutletContext
  return <Outlet />; 
  // Si vous passez des props directement, vous auriez besoin de {children} ici
  // et de passer les props aux children. Avec Outlet, le contexte est plus simple.
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (isAuthenticated && currentUser) {
    const userRoleNormalized = normalizeRoleApp(currentUser.role);
    let homePath = '/login'; 
    switch (userRoleNormalized) {
      case 'admin': homePath = '/admin'; break;
      case 'chef_equipe': homePath = '/chef'; break;
      case 'employe': homePath = '/employe'; break;
      default: homePath = '/login'; 
    }
    return <Navigate to={homePath} replace />;
  }
  return children;
};

function AppContent() {
  // Si AdminInterface, etc., utilisent useOutletContext, elles n'ont pas besoin de props ici.
  // Sinon, vous récupéreriez currentUser et logout de useAuth() ici pour les passer.
  // const { currentUser, logout } = useAuth(); 

  return (
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />

        {/* Routes protégées */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          {/* AdminInterface recevra user et onLogout via useOutletContext() */}
          <Route path="/admin/*" element={<AdminInterface />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['chef_equipe']} />}>
          <Route path="/chef/*" element={<ChefEquipeInterface />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['employe']} />}>
          <Route path="/employe/*" element={<EmployeInterface />} />
        </Route>
        
        <Route 
          path="*" 
          element={<NavigateToCorrectRouteOnLoad />}
        />
      </Routes>
  );
}

// Helper component pour la redirection par défaut si l'utilisateur est déjà loggué
const NavigateToCorrectRouteOnLoad = () => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const userRoleNormalized = normalizeRoleApp(currentUser.role);
  let homePath = '/login';
  switch (userRoleNormalized) {
    case 'admin': homePath = '/admin'; break;
    case 'chef_equipe': homePath = '/chef'; break;
    case 'employe': homePath = '/employe'; break;
    default: homePath = '/login';
  }
  return <Navigate to={homePath} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
