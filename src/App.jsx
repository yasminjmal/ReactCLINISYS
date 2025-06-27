// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useOutletContext, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './components/LoginPage';
import AdminInterface from './components/admin/InterfaceAdmin';
import ChefEquipeInterface from './components/chefEquipe/InterfaceChefEquipe';
import EmployeInterface from './components/employe/InterfaceEmploye';
import './index.css';
import { WebSocketProvider } from './context/WebSocketContext';




const normalizeRoleApp = (roleFromServer) => {
  if (!roleFromServer) return '';
  let normalized = String(roleFromServer).toLowerCase();
  if (normalized.startsWith('role_')) {
    normalized = normalized.substring(5);
  }
  return normalized;
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-slate-500">Chargement de l'application...</div>;
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const userRoleNormalized = normalizeRoleApp(currentUser.role);
  console.log(`ProtectedRoute: Role original: "${currentUser.role}", Normalisé: "${userRoleNormalized}", Rôles autorisés:`, allowedRoles);

  if (allowedRoles && !allowedRoles.includes(userRoleNormalized)) {
    console.warn(`ProtectedRoute: Accès refusé pour le rôle "${userRoleNormalized}". Redirection.`);
    let fallbackPath = '/login';
    switch (userRoleNormalized) {
      case 'a': fallbackPath = '/admin'; break;
      case 'c': fallbackPath = '/chef'; break;
      case 'e': fallbackPath = '/employe'; break;
      default: fallbackPath = '/login';
    }
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <Outlet context={{ currentUser, logout }} />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-slate-500">Chargement...</div>;
  }

  if (isAuthenticated && currentUser) {
    const userRoleNormalized = normalizeRoleApp(currentUser.role);
    let homePath = '/login';
    switch (userRoleNormalized) {
      case 'a': homePath = '/admin'; break;
      case 'c': homePath = '/chef'; break;
      case 'e': homePath = '/employe'; break;
      default: homePath = '/login';
    }
    return <Navigate to={homePath} replace />;
  }
  return children;
};

const AdminInterfaceWrapper = () => {
  const { currentUser, logout } = useOutletContext();
  return <AdminInterface user={currentUser} onLogout={logout} />;
};
const ChefEquipeInterfaceWrapper = () => {
  const { currentUser, logout } = useOutletContext();
  return <ChefEquipeInterface user={currentUser} onLogout={logout} />;
};
const EmployeInterfaceWrapper = () => {
  const { currentUser, logout } = useOutletContext();
  return <EmployeInterface user={currentUser} onLogout={logout} />;
};

const NavigateToCorrectRouteOnLoad = () => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-slate-500">Chargement...</div>;
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const userRoleNormalized = normalizeRoleApp(currentUser.role);
  let homePath = '/login';
  switch (userRoleNormalized) {
    case 'a': homePath = '/admin'; break;
    case 'c': homePath = '/chef'; break;
    case 'e': homePath = '/employe'; break;
    default: homePath = '/login';
  }
  return <Navigate to={homePath} replace />;
};

// MODIFIÉ : AppContent reçoit la fonction navigate en prop
function AppContent({ navigate }) {
  return (
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              {/* LoginPage n'a pas besoin de props navigate directement ici, car elle utilise useAuth() */}
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Routes protégées */}
        <Route element={<ProtectedRoute allowedRoles={['a']} />}>
          <Route path="/admin/*" element={<AdminInterfaceWrapper />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['c']} />}>
          <Route path="/chef/*" element={<ChefEquipeInterfaceWrapper />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['e']} />}>
          <Route path="/employe/*" element={<EmployeInterfaceWrapper />} />
        </Route>
        
        <Route
          path="*"
          element={<NavigateToCorrectRouteOnLoad />}
        />
      </Routes>
  );
}

// MODIFIÉ : Le composant AuthProvider est rendu ici, AVEC la fonction navigate.
function App() {
  return (
    <BrowserRouter>
      {/* C'est le composant qui va fournir la fonction navigate à AuthProvider */}
      <WebSocketProvider>
      <AppWrapperWithAuthContext />
      </WebSocketProvider>
    </BrowserRouter>
  );
}

// NOUVEAU COMPOSANT : AppWrapperWithAuthContext
// Ce composant va utiliser useNavigate et rendre AuthProvider
function AppWrapperWithAuthContext() {
  const navigate = useNavigate(); // useNavigate est valide ici car il est dans un contexte de BrowserRouter

  return (
    <AuthProvider navigate={navigate}> {/* Passez la fonction navigate à AuthProvider */}
      <AppContent navigate={navigate} /> 
    </AuthProvider>
  );
}

export default App;