// src/context/NotificationContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useWebSocket } from './WebSocketContext'; // On utilise notre propre contexte WebSocket
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const { stompClient, connectionStatus } = useWebSocket();
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Étape 1: Charger les notifications initiales depuis le serveur
    useEffect(() => {
        if (currentUser) {
            setLoading(true);
            notificationService.getNotifications()
                .then(response => {
                    setNotifications(response.data);
                    console.log("✅ Notifications initiales chargées:", response.data);
                })
                .catch(error => console.error("❌ Erreur lors du chargement des notifications:", error))
                .finally(() => setLoading(false));
        }
    }, [currentUser]); // Se déclenche quand l'utilisateur se connecte

    // Étape 2: S'abonner aux notifications en temps réel quand la connexion WebSocket est prête
    useEffect(() => {
        if (connectionStatus === 'CONNECTED' && stompClient && currentUser) {
            console.log(`🎧 NotificationContext: Abonnement à /user/queue/notifications pour ${currentUser.login}`);
            
            const subscription = stompClient.subscribe(`/user/queue/notifications`, (message) => {
                try {
                    const newNotification = JSON.parse(message.body);
                    console.log('📨 Nouvelle notification reçue via WebSocket:', newNotification);
                    // Ajoute la nouvelle notification en haut de la liste pour un affichage immédiat
                    setNotifications(prev => [newNotification, ...prev]);
                } catch (e) {
                    console.error("Erreur de parsing de la notification JSON", e);
                }
            });

            // Fonction de nettoyage pour se désabonner proprement
            return () => {
                console.log("🔌 NotificationContext: Désabonnement du canal de notifications.");
                subscription.unsubscribe();
            };
        }
    }, [connectionStatus, stompClient, currentUser]); // Se déclenche quand la connexion est établie

    // Fonction pour marquer une notification comme lue
    const markAsRead = async (notificationId) => {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        try {
            await notificationService.markAsRead(notificationId);
        } catch (error) {
            console.error("❌ Échec du marquage de la notification comme lue:", error);
            // On pourrait vouloir remettre la notification dans la liste en cas d'échec
        }
    };

    const value = {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length, // Calcule dynamiquement le nombre de non-lus
        loading,
        markAsRead
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};