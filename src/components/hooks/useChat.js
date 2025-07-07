// src/hooks/useChat.js

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import chatService from '../../services/chatService';

export const useChat = (currentUser, partnerUser) => {
    const { stompClient, connectionStatus } = useWebSocket();
    const [messages, setMessages] = useState([]);
    const [chatStatus, setChatStatus] = useState('loading');

    // Votre logique de chargement de l'historique est parfaite et reste inchangée.
    const loadHistory = useCallback(async () => {
        if (!currentUser || !partnerUser) return;
        setChatStatus('loading');
        try {
            const history = await chatService.getChatMessages(currentUser.id, partnerUser.id);
            setMessages(history);
            setChatStatus('loaded');
        } catch (error) {
            console.error("useChat: Échec du chargement de l'historique", error);
            setChatStatus('error');
        }
    }, [currentUser, partnerUser]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // Gérer la réception des messages en temps réel
    useEffect(() => {
        if (connectionStatus === 'CONNECTED' && stompClient && currentUser && partnerUser) {
            
            // L'abonnement au topic public pour les messages du partenaire est correct.
            const user1 = currentUser.id;
            const user2 = partnerUser.id;
            const conversationId = user1 < user2 ? `${user1}-${user2}` : `${user2}-${user1}`;
            const publicTopic = `/topic/chat/${conversationId}`;
            
            const publicSubscription = stompClient.subscribe(publicTopic, (payload) => {
                const receivedMessage = JSON.parse(payload.body);
                if (receivedMessage.sender === partnerUser.id) {
                    setMessages(prevMessages => [...prevMessages, receivedMessage]);
                }
            });

            // ✅ CORRECTION APPLIQUÉE ICI DANS L'ABONNEMENT PRIVÉ
            const privateSubscriptionPath = `/user/${currentUser.login}/queue/private`;
            const privateSubscription = stompClient.subscribe(privateSubscriptionPath, (payload) => {
                const receivedMessage = JSON.parse(payload.body);
                const isConfirmationOfMyMessage = receivedMessage.sender === currentUser.id && receivedMessage.receiver === partnerUser.id;

                if (isConfirmationOfMyMessage) {
                    setMessages(prevMessages => {
                        // Votre logique existante pour remplacer un message texte optimiste (parfaite).
                        const optimisticIndex = prevMessages.findIndex(msg =>
                            msg.id > 1000000 && msg.content === receivedMessage.content && msg.type === receivedMessage.type
                        );

                        if (optimisticIndex !== -1) {
                            const newMessages = [...prevMessages];
                            newMessages[optimisticIndex] = receivedMessage;
                            return newMessages;
                        } else {
                            // **C'EST L'AJOUT CLÉ**
                            // Si ce n'est pas un texte optimiste, c'est la confirmation d'un fichier/image.
                            // On l'ajoute simplement à la liste.
                            if (!prevMessages.some(msg => msg.id === receivedMessage.id)) {
                                return [...prevMessages, receivedMessage];
                            }
                        }
                        // Si le message existe déjà, on ne change rien.
                        return prevMessages;
                    });
                }
            });

            return () => {
                privateSubscription.unsubscribe();
                publicSubscription.unsubscribe();
            };
        }
    }, [connectionStatus, stompClient, currentUser, partnerUser]);

    // Votre fonction d'envoi de message texte est parfaite et reste inchangée.
    const sendMessage = useCallback((content, type = 'CHAT') => {
        if (!stompClient || !stompClient.connected) {
            console.error("❌ Erreur: Client STOMP non connecté.");
            return;
        }

        if (content.trim() && currentUser && partnerUser) {
            const chatMessage = {
                sender: currentUser.id, receiver: partnerUser.id, content: content.trim(), type: type,
            };
            const optimisticMessage = { ...chatMessage, id: Date.now(), timestamp: new Date().toISOString() };
            setMessages(prev => [...prev, optimisticMessage]);
            stompClient.send("/app/chat.sendPrivate", {}, JSON.stringify(chatMessage));
        }
    }, [stompClient, currentUser, partnerUser]);

    // Votre fonction sendImage est également parfaite.
    const sendImage = useCallback(async (file) => {
        const base64 = await fileToBase64(file);
        sendMessage(base64, 'IMAGE');
    }, [sendMessage]);

    return { messages, sendMessage, sendImage, chatStatus };
};

// Fonction utilitaire (inchangée)
const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });