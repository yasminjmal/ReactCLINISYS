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

    // Gérer la réception des messages en temps réel (c'est ici que la magie opère)
    useEffect(() => {
        if (connectionStatus === 'CONNECTED' && stompClient && currentUser && partnerUser) {
            const subscriptionPath = `/user/${currentUser.login}/queue/private`;
            console.log(`🎧 useChat: Abonnement à ${subscriptionPath}`);
            
            const subscription = stompClient.subscribe(subscriptionPath, (payload) => {
                const receivedMessage = JSON.parse(payload.body);
                console.log("📩 useChat: Message temps-réel reçu !", receivedMessage);

                // --- DÉBUT DE LA LOGIQUE CORRIGÉE ---

                // Cas 1 : C'est un nouveau message de la personne avec qui je discute.
                const isNewMessageFromPartner = receivedMessage.sender === partnerUser.id && receivedMessage.receiver === currentUser.id;

                // Cas 2 : C'est la confirmation d'un message que j'ai envoyé.
                const isConfirmationOfMyMessage = receivedMessage.sender === currentUser.id && receivedMessage.receiver === partnerUser.id;

                if (isNewMessageFromPartner) {
                    // C'est la situation du RECEVEUR.
                    // On ajoute simplement le nouveau message à la fin de la liste.
                    console.log(`✅ Nouveau message reçu de ${partnerUser.login}. Ajout à l'interface.`);
                    setMessages(prevMessages => [...prevMessages, receivedMessage]);

                } else if (isConfirmationOfMyMessage) {
                    // C'est la situation de l'EXPÉDITEUR.
                    // On remplace le message "optimiste" (avec un ID temporaire) par le vrai message du serveur.
                    console.log(`✅ Confirmation reçue pour mon message envoyé.`);
                    setMessages(prevMessages => 
                        prevMessages.map(msg => 
                            (msg.id > 1000000 && msg.content === receivedMessage.content) // Condition pour trouver le message optimiste
                                ? receivedMessage // Remplacer par le message final
                                : msg
                        )
                    );
                }
                // --- FIN DE LA LOGIQUE CORRIGÉE ---
            });

            // Fonction de nettoyage (inchangée)
            return () => {
                console.log(`🔌 useChat: Désabonnement de ${subscriptionPath}`);
                subscription.unsubscribe();
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

            const optimisticMessage = {
                ...chatMessage,
                id: Date.now(), // ID temporaire unique
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, optimisticMessage]);

            console.log("✈️ useChat: Envoi du message au backend...", chatMessage);
            stompClient.send("/app/chat.sendPrivate", {}, JSON.stringify(chatMessage));
        }
    }, [stompClient, currentUser, partnerUser]);

    return { messages, sendMessage, chatStatus };
};