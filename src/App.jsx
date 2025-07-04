// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { QueryClient, QueryClientProvider } from 'react-query';

// Importer les composants d'interface
import LoginPage from './components/LoginPage';
import AdminInterface from './components/admin/InterfaceAdmin';
import ChefEquipeInterface from './components/chefEquipe/InterfaceChefEquipe';
import EmployeInterface from './components/employe/InterfaceEmploye';

import './index.css';

// Créer une instance du client React Query
const queryClient = new QueryClient();

// --- Composants de routage et de logique ---

const normalizeRoleApp = (roleFromServer) => {
    if (!roleFromServer) return '';
    let normalized = String(roleFromServer).toLowerCase();
    if (normalized.startsWith('role_')) {
        normalized = normalized.substring(5);
    }
    return normalized;
};

const ProtectedRoute = ({ allowedRoles }) => {
    const { currentUser, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen text-slate-500">Chargement...</div>;
    }

    if (!isAuthenticated || !currentUser) {
        return <Navigate to="/login" replace />;
    }
    
    const userRoleNormalized = normalizeRoleApp(currentUser.role);
    
    if (allowedRoles && !allowedRoles.includes(userRoleNormalized)) {
        let fallbackPath = '/login';
        switch (userRoleNormalized) {
            case 'a': fallbackPath = '/admin'; break;
            case 'c': fallbackPath = '/chef'; break;
            case 'e': fallbackPath = '/employe'; break;
            default: fallbackPath = '/login';
        }
        return <Navigate to={fallbackPath} replace />;
    }
    
    // L'Outlet rendra le composant enfant (le wrapper) sans passer de contexte
    return <Outlet />;
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

// --- Wrappers pour passer les props ---
// Ces wrappers récupèrent les données du contexte et les passent comme props.
// C'est la méthode correcte pour cette architecture.
const AdminInterfaceWrapper = () => {
    const { currentUser, logout } = useAuth();
    return <AdminInterface user={currentUser} onLogout={logout} />;
};
const ChefEquipeInterfaceWrapper = () => {
    const { currentUser, logout } = useAuth();
    return <ChefEquipeInterface user={currentUser} onLogout={logout} />;
};
const EmployeInterfaceWrapper = () => {
    const { currentUser, logout } = useAuth();
    return <EmployeInterface user={currentUser} onLogout={logout} />;
};

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
        case 'a': homePath = '/admin'; break;
        case 'c': homePath = '/chef'; break;
        case 'e': homePath = '/employe'; break;
        default: homePath = '/login';
    }
    return <Navigate to={homePath} replace />;
};

// --- Structure de l'application ---

function AppContent() {
    return (
        <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            
            {/* Routes protégées utilisant les wrappers */}
            <Route element={<ProtectedRoute allowedRoles={['a']} />}>
                <Route path="/admin/*" element={<AdminInterfaceWrapper />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['c']} />}>
                <Route path="/chef/*" element={<ChefEquipeInterfaceWrapper />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['e']} />}>
                <Route path="/employe/*" element={<EmployeInterfaceWrapper />} />
            </Route>
            
            <Route path="*" element={<NavigateToCorrectRouteOnLoad />} />
        </Routes>
    );
}

function AppWrapperWithProviders() {
    const navigate = useNavigate();
    return (
        <AuthProvider navigate={navigate}>
            <ThemeProvider>
                <WebSocketProvider>
                    <AppContent />
                </WebSocketProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AppWrapperWithProviders />
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;