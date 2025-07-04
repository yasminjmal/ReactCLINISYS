// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext.jsx';

import LoginPage from './components/LoginPage';
import AdminInterface from './components/admin/InterfaceAdmin';
import ChefEquipeInterface from './components/chefEquipe/InterfaceChefEquipe';
import EmployeInterface from './components/employe/InterfaceEmploye';
import './index.css';

// --- CORRECTION 1: Importer QueryClient et QueryClientProvider ---
import { QueryClient, QueryClientProvider } from 'react-query';

// --- CORRECTION 2: Créer une instance du client ---
// Cette instance gérera le cache de toutes vos requêtes.
const queryClient = new QueryClient();


// --- Vos composants de routage (Aucun changement ici) ---
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
    if (isLoading) return <div className="flex justify-center items-center h-screen text-slate-500">Chargement...</div>;
    if (!isAuthenticated || !currentUser) return <Navigate to="/login" replace />;
    
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
    
    // --- CORRECTION : Passer les props de l'utilisateur à l'interface ---
    // Au lieu de `context={{ currentUser }}`, on passe directement les props
    // à l'Outlet, qui les transmettra au composant de la route.
    return <Outlet />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, currentUser, isLoading } = useAuth();
    if (isLoading) return <div className="flex justify-center items-center h-screen text-slate-500">Chargement...</div>;
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

// --- CORRECTION : Les wrappers reçoivent l'utilisateur via useAuth ---
// C'est plus propre et évite de passer le context via Outlet.
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
    if (isLoading) return <div className="flex justify-center items-center h-screen">Chargement...</div>;
    if (!isAuthenticated || !currentUser) return <Navigate to="/login" replace />;
    
    const userRoleNormalized = normalizeRoleApp(currentUser.role);
    let homePath = '/login';
    switch (userRoleNormalized) {
        case 'a': homePath = '/admin'; break;
        case 'c': homePath = '/chef'; break; // Correction de la variable fallbackPath en homePath
        case 'e': homePath = '/employe'; break;
        default: homePath = '/login';
    }
    return <Navigate to={homePath} replace />;
};

function AppContent() {
    return (
        <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route element={<ProtectedRoute allowedRoles={['a']} />}><Route path="/admin/*" element={<AdminInterfaceWrapper />} /></Route>
            <Route element={<ProtectedRoute allowedRoles={['c']} />}><Route path="/chef/*" element={<ChefEquipeInterfaceWrapper />} /></Route>
            <Route element={<ProtectedRoute allowedRoles={['e']} />}><Route path="/employe/*" element={<EmployeInterfaceWrapper />} /></Route>
            <Route path="*" element={<NavigateToCorrectRouteOnLoad />} />
        </Routes>
    );
}

function App() {
    return (
        // --- CORRECTION 3: Le QueryClientProvider doit envelopper le BrowserRouter ---
        // ou au moins tout ce qui utilise `useNavigate` et les routes.
        // Le placer ici est le plus sûr.
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AppWrapperWithProviders />
            </BrowserRouter>
        </QueryClientProvider>
    );
}

function AppWrapperWithProviders() {
    const navigate = useNavigate();
    return (
        <AuthProvider navigate={navigate}>
            <ThemeProvider>
                <WebSocketProvider>
                    {/* Le QueryClientProvider a été déplacé plus haut */}
                    <AppContent />
                </WebSocketProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
