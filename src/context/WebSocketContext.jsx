import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
    const { currentUser, token } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    // On utilise une `ref` pour conserver l'instance du client STOMP.
    // Cela évite de recréer le client à chaque rendu du composant et stabilise la connexion.
    const stompClientRef = useRef(null);

    useEffect(() => {
        // On ne tente de se connecter que si un utilisateur est authentifié et qu'on a un token.
        if (currentUser && token) {
            // Et seulement s'il n'y a pas déjà un client actif.
            if (!stompClientRef.current) {
                console.log("Création d'une nouvelle instance de client STOMP et tentative de connexion...");

                const client = new Client({
                    // On utilise une factory pour créer la connexion SockJS.
                    // Assurez-vous que REACT_APP_API_BASE_URL est bien défini dans votre fichier .env (ex: http://localhost:8080)
                    webSocketFactory: () => new SockJS(`${process.env.REACT_APP_API_BASE_URL}/api/ws`),
                    connectHeaders: {
                        Authorization: `Bearer ${token}`,
                    },
                    debug: (str) => {
                        console.log('STOMP DEBUG: ' + str);
                    },
                    reconnectDelay: 5000, // Tente de se reconnecter toutes les 5 secondes si la connexion est perdue.
                });

                client.onConnect = (frame) => {
                    console.log('Succès : Connecté au WebSocket:', frame);
                    setIsConnected(true);
                };

                client.onStompError = (frame) => {
                    console.error('Erreur STOMP:', frame.headers['message']);
                    console.error('Détails de l\'erreur:', frame.body);
                    setIsConnected(false);
                };

                client.onWebSocketClose = (event) => {
                    console.log("La connexion WebSocket a été fermée.", event);
                    setIsConnected(false);
                };
                
                client.onWebSocketError = (error) => {
                    console.error('Erreur WebSocket:', error);
                    setIsConnected(false);
                };

                // On stocke l'instance du client dans la ref pour y accéder plus tard.
                stompClientRef.current = client;
                
                // On active le client, ce qui démarre la tentative de connexion.
                client.activate();
            }
        } else {
            // Si l'utilisateur se déconnecte (plus de currentUser ou de token),
            // on désactive et on nettoie le client s'il existe.
            if (stompClientRef.current) {
                console.log("Déconnexion du client STOMP demandée.");
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
                setIsConnected(false);
            }
        }

        // Fonction de nettoyage : s'exécute lorsque le composant est démonté.
        return () => {
            if (stompClientRef.current && stompClientRef.current.active) {
                 console.log("Nettoyage : Déconnexion du client STOMP lors du démontage.");
                 stompClientRef.current.deactivate();
                 stompClientRef.current = null;
            }
        };
    // Cet effet s'exécute à chaque fois que l'utilisateur ou le token change.
    }, [currentUser, token]);

    // On fournit aux composants enfants l'instance actuelle du client et l'état de la connexion.
    const value = { stompClient: stompClientRef.current, isConnected };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};
