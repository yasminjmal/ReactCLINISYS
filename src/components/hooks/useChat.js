import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import chatService from '../../services/chatService';

export const useChat = (currentUser, partnerUser) => {
    const { stompClient, connectionStatus } = useWebSocket();
    const [messages, setMessages] = useState([]);
    const [chatStatus, setChatStatus] = useState('loading');

    // Charger l'historique des messages (inchangé)
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
        // On ne s'abonne que si la connexion WebSocket est pleinement établie.
        if (connectionStatus === 'CONNECTED' && stompClient && currentUser && partnerUser) {
            
            // --- DÉBUT DU BLOC DE TEST ---

            // A. On recrée le même ID de conversation que dans le backend.
            const user1 = currentUser.id;
            const user2 = partnerUser.id;
            const conversationId = user1 < user2 ? `${user1}-${user2}` : `${user2}-${user1}`;
            const publicTopic = `/topic/chat/${conversationId}`;

            // B. On s'abonne au topic public partagé.
            console.log(`✅ [TEST] 🎧 Abonnement au TOPIC PUBLIC : ${publicTopic}`);
            const publicSubscription = stompClient.subscribe(publicTopic, (payload) => {
                const receivedMessage = JSON.parse(payload.body);
                console.log(`✅ [TEST] 📩 Message reçu sur le TOPIC PUBLIC !`, receivedMessage);
                
                // On s'assure de n'ajouter que les messages venant de l'autre personne
                // pour ne pas afficher en double notre propre message (déjà géré par l'update optimiste).
                if (receivedMessage.sender === partnerUser.id) {
                    console.log("[TEST] C'est un message du partenaire, on l'ajoute à l'interface.");
                    setMessages(prevMessages => [...prevMessages, receivedMessage]);
                }
            });

            // --- FIN DU BLOC DE TEST ---


            // On garde l'abonnement à la file privée pour notre test comparatif.
            const privateSubscriptionPath = `/user/${currentUser.login}/queue/private`;
            console.log(`🎧 useChat: Abonnement à la file PRIVÉE : ${privateSubscriptionPath}`);
            const privateSubscription = stompClient.subscribe(privateSubscriptionPath, (payload) => {
                const receivedMessage = JSON.parse(payload.body);
                console.log("📩 useChat: Message reçu sur la file PRIVÉE !", receivedMessage);

                // Cette logique de remplacement du message optimiste ne concerne que l'expéditeur.
                const isConfirmationOfMyMessage = receivedMessage.sender === currentUser.id && receivedMessage.receiver === partnerUser.id;
                if (isConfirmationOfMyMessage) {
                    console.log(`✅ Confirmation reçue pour mon message envoyé via la file PRIVÉE.`);
                    setMessages(prevMessages => 
                        prevMessages.map(msg => 
                            (msg.id > 1000000 && msg.content === receivedMessage.content)
                                ? receivedMessage
                                : msg
                        )
                    );
                }
            });

            // Fonction de nettoyage pour se désabonner proprement
            return () => {
                console.log(`🔌 useChat: Désabonnement de ${privateSubscriptionPath}`);
                privateSubscription.unsubscribe();

                console.log(`✅ [TEST] 🔌 Désabonnement de ${publicTopic}`);
                publicSubscription.unsubscribe();
            };
        }
    }, [connectionStatus, stompClient, currentUser, partnerUser]);

    // Fonction pour envoyer un message (inchangée)
    const sendMessage = useCallback((content) => {
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
                type: 'CHAT',
            };

            const optimisticMessage = { ...chatMessage, id: Date.now() };
            setMessages(prev => [...prev, optimisticMessage]);

            console.log("✈️ useChat: Envoi du message au backend...", chatMessage);
            stompClient.send("/app/chat.sendPrivate", {}, JSON.stringify(chatMessage));
        }
    }, [stompClient, currentUser, partnerUser]);

    return { messages, sendMessage, chatStatus };
};