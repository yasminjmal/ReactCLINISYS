import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useAuth } from './AuthContext'; // On dépend du contexte d'authentification

// Création du contexte
const WebSocketContext = createContext(null);

// Hook pour consommer le contexte facilement
export const useWebSocket = () => {
    return useContext(WebSocketContext);
};

// Le Provider qui va gérer la connexion
export const WebSocketProvider = ({ children }) => {
    // On récupère les informations de l'authentification
    const { isAuthenticated, token } = useAuth();
    
    // États pour le client STOMP et le statut de la connexion
    const [stompClient, setStompClient] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');

    // useRef pour garder une référence stable au client et éviter les reconnexions inutiles
    const clientRef = useRef(null);

    // L'effet de bord qui gère la connexion et la déconnexion
    useEffect(() => {
        // --- LA LOGIQUE CLÉ EST ICI ---
        // On tente de se connecter SEULEMENT SI l'utilisateur est authentifié, qu'on a un token,
        // ET qu'il n'y a pas déjà une connexion en cours ou établie.
        if (isAuthenticated && token && !clientRef.current) {
            console.log("✅ WebSocketProvider: Conditions remplies. Tentative de connexion...");
            setConnectionStatus('CONNECTING');

            // Création de la socket et du client STOMP
            const socket = new SockJS('http://localhost:9010/template-core/ws');
            const client = Stomp.over(socket);
            
            // On désactive les logs verbeux de STOMP pour garder la console propre
            client.debug = null; 

            // Headers d'authentification pour la connexion STOMP
            const headers = { 'Authorization': `Bearer ${token}` };

            // Tentative de connexion
            client.connect(
                headers,
                () => { // Callback en cas de succès
                    console.log("🚀 WebSocketProvider: STOMP Client connecté avec succès !");
                    setConnectionStatus('CONNECTED');
                    setStompClient(client); // On met le client connecté dans l'état
                    clientRef.current = client; // On stocke la référence
                },
                (error) => { // Callback en cas d'erreur
                    console.error("❌ WebSocketProvider: Échec de la connexion STOMP.", error);
                    setConnectionStatus('ERROR');
                    clientRef.current = null; // On réinitialise la référence pour permettre une nouvelle tentative
                }
            );
        } else if (!isAuthenticated && clientRef.current) {
            // Si l'utilisateur se déconnecte, on nettoie la connexion WebSocket existante
            console.log("🔌 WebSocketProvider: Déconnexion de l'utilisateur. Fermeture du STOMP Client.");
            clientRef.current.disconnect();
            clientRef.current = null;
            setStompClient(null);
            setConnectionStatus('DISCONNECTED');
        }
    }, [isAuthenticated, token]); // L'effet se relance si l'état d'authentification ou le token change

    // On fournit le client et le statut aux composants enfants
    const value = { stompClient, connectionStatus };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};