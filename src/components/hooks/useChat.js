import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import chatService from '../../services/chatService';

export const useChat = (currentUser, partnerUser) => {
    const { stompClient, connectionStatus } = useWebSocket();
    const [messages, setMessages] = useState([]);
    const [chatStatus, setChatStatus] = useState('loading');

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

    useEffect(() => {
        if (connectionStatus === 'CONNECTED' && stompClient && currentUser && partnerUser) {
            const user1 = currentUser.id;
            const user2 = partnerUser.id;
            const conversationId = user1 < user2 ? `${user1}-${user2}` : `${user2}-${user1}`;
            const publicTopic = `/topic/chat/${conversationId}`;

            console.log(`✅ [TEST] 🎧 Abonnement au TOPIC PUBLIC : ${publicTopic}`);
            const publicSubscription = stompClient.subscribe(publicTopic, (payload) => {
                const receivedMessage = JSON.parse(payload.body);
                console.log(`✅ [TEST] 📩 Message reçu sur le TOPIC PUBLIC !`, receivedMessage);

                if (receivedMessage.sender === partnerUser.id) {
                    setMessages(prevMessages => [...prevMessages, receivedMessage]);
                }
            });

            const privateSubscriptionPath = `/user/${currentUser.login}/queue/private`;
            console.log(`🎧 useChat: Abonnement à la file PRIVÉE : ${privateSubscriptionPath}`);
            const privateSubscription = stompClient.subscribe(privateSubscriptionPath, (payload) => {
                const receivedMessage = JSON.parse(payload.body);
                console.log("📩 useChat: Message reçu sur la file PRIVÉE !", receivedMessage);

                const isConfirmationOfMyMessage =
                    receivedMessage.sender === currentUser.id &&
                    receivedMessage.receiver === partnerUser.id;

                if (isConfirmationOfMyMessage) {
                    setMessages(prevMessages =>
                        prevMessages.map(msg =>
                            (msg.id > 1000000 && msg.content === receivedMessage.content && msg.type === receivedMessage.type)
                                ? receivedMessage
                                : msg
                        )
                    );
                }
            });

            return () => {
                privateSubscription.unsubscribe();
                publicSubscription.unsubscribe();
                console.log(`🔌 useChat: Désabonné de tous les topics`);
            };
        }
    }, [connectionStatus, stompClient, currentUser, partnerUser]);

    // ✅ Updated: sendMessage supports both CHAT and IMAGE types
    const sendMessage = useCallback((content, type = 'CHAT') => {
        if (!stompClient || !stompClient.connected) {
            console.error("❌ useChat Error: Impossible d'envoyer le message. Le client STOMP n'est pas connecté.");
            alert("Erreur de connexion, impossible d'envoyer le message. Veuillez rafraîchir la page.");
            return;
        }

        if (content.trim() && currentUser && partnerUser) {
            const chatMessage = {
                sender: currentUser.id,
                receiver: partnerUser.id,
                content: content.trim(),
                type: type, // 'CHAT' or 'IMAGE'
            };

            const optimisticMessage = { ...chatMessage, id: Date.now() };
            setMessages(prev => [...prev, optimisticMessage]);

            stompClient.send("/app/chat.sendPrivate", {}, JSON.stringify(chatMessage));
        }
    }, [stompClient, currentUser, partnerUser]);

    // ✅ New: helper to send image
    const sendImage = useCallback(async (file) => {
        const base64 = await fileToBase64(file);
        sendMessage(base64, 'IMAGE');
    }, [sendMessage]);

    return { messages, sendMessage, sendImage, chatStatus };
};

// ✅ Convert File to Base64 (for sending images inline)
const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
