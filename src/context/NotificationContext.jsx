import React, { createContext, useState, useEffect, useContext } from 'react';
import { useStompClient, useSubscription } from 'react-stomp-hooks';
import { useAuth } from './AuthContext'; // Assurez-vous que le chemin est correct
import notificationService from '../services/notificationService'; // Assurez-vous que ce service gère les appels REST pour les notifications

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth(); // Récupère l'utilisateur connecté
    const stompClient = useStompClient(); // Hook de react-stomp-hooks pour obtenir le client STOMP

    // 1. Charger les notifications non lues existantes au montage du composant
    useEffect(() => {
        const fetchInitialNotifications = async () => {
            try {
                const response = await notificationService.getUnreadNotifications();
                console.log("Notifications reçues (brutes) :", response.data);

                const data = response.data;

                if (Array.isArray(data)) {
                    const formatted = data.map((notif) => ({ ...notif }));
                    setNotifications(formatted);
                } else {
                    console.error("Les données reçues ne sont pas un tableau :", data);
                }

            } catch (error) {
                console.error("Échec du chargement des notifications initiales:", error);
            }
        };


        fetchInitialNotifications();
    }, [currentUser?.id]); // Déclenche le rechargement si l'ID de l'utilisateur change

    // 2. Écouter les nouvelles notifications via WebSocket
    // On s'abonne au topic spécifique de l'utilisateur
    useSubscription(currentUser ? `/user/${currentUser.login}/queue/notifications` : null, (message) => {
        try {
            const newNotification = JSON.parse(message.body);
            console.log('Notification reçue via WebSocket:', newNotification);

            // Vérifiez si la notification existe déjà (peut arriver si rechargement et WebSocket rapide)
            setNotifications(prev => {
                if (prev.some(n => n.id === newNotification.id)) {
                    return prev; // Notification déjà présente, ignorez
                }
                // Ajoute la nouvelle notification en haut de la liste
                return [{
                    ...newNotification,
                    id: newNotification.id || new Date().toISOString() + Math.random(), // Assurez un ID
                    timestamp: new Date(newNotification.timestamp).toISOString() // Assurez un format de date ISO
                }, ...prev];
            });
            setUnreadCount(prev => prev + 1); // Incrémente le compteur de non-lus
        } catch (error) {
            console.error("Erreur lors de l'analyse de la notification WebSocket:", error, message.body);
            // Fallback pour les messages malformés ou sans ID
            setNotifications(prev => [{
                id: Date.now() + Math.random(), // Génère un ID local pour cette notification d'erreur
                message: message.body,
                timestamp: new Date().toISOString(),
                type: 'ERROR'
            }, ...prev]);
            setUnreadCount(prev => prev + 1);
        }
    });

    // Fonction pour marquer une notification comme lue (via API REST)
    const markNotificationAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId)); // Retire de la liste
            setUnreadCount(prev => Math.max(0, prev - 1)); // Décrémente le compteur, pas moins de 0
        } catch (error) {
            console.error("Échec du marquage de la notification comme lue:", error);
            // Gérer l'erreur ou afficher un message à l'utilisateur
        }
    };

    // Fonction pour marquer TOUTES les notifications comme lues (localement)
    const markAllNotificationsAsReadLocally = () => {
        setUnreadCount(0); // Réinitialise le compteur local
        // Optionnel : Envoyez un appel à l'API pour informer le backend que toutes ont été lues
        // notificationService.markAllAsRead(currentUser.id);
    };

    // Fonction pour effacer toutes les notifications affichées
    const clearAllNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
        // Optionnel : Appel API pour effacer toutes les notifications côté backend
        // notificationService.deleteAllNotifications(currentUser.id);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            markNotificationAsRead,
            markAllNotificationsAsReadLocally,
            clearAllNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};