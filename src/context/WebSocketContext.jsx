// src/context/WebSocketContext.jsx

import React from 'react';
import { StompSessionProvider } from 'react-stomp-hooks';
import { useAuth } from './AuthContext';

export const WebSocketProvider = ({ children }) => {
    const { token } = useAuth();

    // Si l'utilisateur n'est pas connecté (pas de token), nous ne rendons
    // PAS le StompSessionProvider. Cela empêche les erreurs de connexion.
    if (!token) {
        return <>{children}</>;
    }

    // Une fois que le token est disponible, le Provider est rendu et se connecte.
    return (
        <StompSessionProvider
            url={'http://localhost:9010/template-core/ws'}
            connectHeaders={{
                'Authorization': `Bearer ${token}`
            }}
            debug={(str) => {
                // Décommentez pour des logs de débogage très détaillés
                // console.log(`[STOMP DEBUG] ${new Date().toISOString()}: ${str}`);
            }}
        >
            {children}
        </StompSessionProvider>
    );
};