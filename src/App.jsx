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

// --- Vos composants de routage (Aucun changement ici, ils sont corrects) ---
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
    return <Outlet context={{ currentUser }} />;
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
const AdminInterfaceWrapper = () => <AdminInterface />;
const ChefEquipeInterfaceWrapper = () => <ChefEquipeInterface />;
const EmployeInterfaceWrapper = () => <EmployeInterface />;
const NavigateToCorrectRouteOnLoad = () => {
    const { isAuthenticated, currentUser, isLoading } = useAuth();
    if (isLoading) return <div className="flex justify-center items-center h-screen">Chargement...</div>;
    if (!isAuthenticated || !currentUser) return <Navigate to="/login" replace />;
    const userRoleNormalized = normalizeRoleApp(currentUser.role);
    let homePath = '/login';
    switch (userRoleNormalized) {
        case 'a': homePath = '/admin'; break;
        case 'c': fallbackPath = '/chef'; break;
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

// Le composant App principal configure le routeur
function App() {
    return (
        <BrowserRouter>
            <AppWrapperWithProviders />
        </BrowserRouter>
    );
}

// Ce composant wrapper configure TOUS les fournisseurs dans le bon ordre.
function AppWrapperWithProviders() {
    const navigate = useNavigate();
    return (
        <AuthProvider navigate={navigate}>
            <ThemeProvider>
                {/* WebSocketProvider est à l'intérieur de AuthProvider pour accéder au token */}
                <WebSocketProvider>
                    <AppContent />
                </WebSocketProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;