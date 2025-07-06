import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

/**
 * Ce composant gère une session de chat complète et robuste.
 * Il se connecte, s'abonne, envoie des messages et met à jour l'interface en temps réel.
 */
const SimplifiedChat = ({ currentUser, partnerUser }) => {
    // State pour stocker les messages et le nouveau message à envoyer
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('Initializing...');

    // useRef pour conserver une référence stable au client STOMP sans causer de re-renders.
    const stompClientRef = useRef(null);
    const messageAreaRef = useRef(null); // Pour le défilement automatique

    // Le token d'authentification récupéré depuis le stockage local.
    const TOKEN = localStorage.getItem('authToken');

    // Effet principal pour gérer la connexion et la déconnexion WebSocket.
    useEffect(() => {
        if (!TOKEN) {
            setConnectionStatus("Erreur: Token d'authentification manquant.");
            return;
        }

        console.log("CHAT: Tentative de connexion WebSocket...");
        setConnectionStatus("Connexion...");

        // 1. Établir la connexion WebSocket via SockJS
        const socket = new SockJS('http://localhost:9010/template-core/ws');
        const client = Stomp.over(socket);
        
        // Optionnel : désactiver les logs de STOMP en production
        client.debug = (str) => { console.log("STOMP:", str) };

        const onConnected = () => {
            console.log("CHAT: Connexion WebSocket réussie !");
            setConnectionStatus("Connecté");
            stompClientRef.current = client;

            // 2. Récupérer l'historique de la conversation
            fetch(`http://localhost:9010/template-core/api/chat/history?user1=${currentUser.id}&user2=${partnerUser.id}`, {
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            })
            .then(res => res.json())
            .then(data => {
                console.log("CHAT: Historique des messages chargé.", data);
                setMessages(data);
            })
            .catch(err => console.error("CHAT: Erreur lors du chargement de l'historique:", err));

            // 3. S'abonner à la file d'attente privée de l'utilisateur actuel
            // C'est la partie cruciale pour la réception des messages en temps réel.
            const subscriptionPath = `/user/${currentUser.login}/queue/private`;
            console.log(`CHAT: Abonnement à la destination : ${subscriptionPath}`);
            
            client.subscribe(subscriptionPath, (payload) => {
                console.log("--- CHAT: MESSAGE REÇU EN TEMPS RÉEL ---");
                const receivedMessage = JSON.parse(payload.body);
                console.log(receivedMessage);

                // Mettre à jour l'état en ajoutant le nouveau message à la liste existante.
                // C'est la manière la plus sûre de mettre à jour un état basé sur sa valeur précédente.
                setMessages(prevMessages => [...prevMessages, receivedMessage]);
            });
        };

        const onError = (error) => {
            console.error('CHAT: Erreur de connexion WebSocket:', error);
            setConnectionStatus("Échec de la connexion");
        };

        // On lance la connexion en passant le token dans les headers
        client.connect({ 'Authorization': `Bearer ${TOKEN}` }, onConnected, onError);

        // Fonction de nettoyage : sera appelée lorsque le composant est démonté
        return () => {
            if (stompClientRef.current && stompClientRef.current.connected) {
                console.log("CHAT: Déconnexion du client STOMP.");
                stompClientRef.current.disconnect();
            }
        };
    }, [TOKEN, currentUser.id, currentUser.login, partnerUser.id]); // L'effet se relance si un de ces props change

    // Effet pour faire défiler la zone de message vers le bas quand un nouveau message arrive
    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        const client = stompClientRef.current;
        if (newMessage.trim() && client?.connected) {
            const chatMessage = {
                sender: currentUser.id, 
                receiver: partnerUser.id,
                content: newMessage,
                type: 'CHAT', // Type de message, peut être utile
            };
            
            // Envoyer le message à la destination du backend
            client.send("/app/chat.sendPrivate", {}, JSON.stringify(chatMessage));
            
            // On vide le champ de saisie
            setNewMessage('');
        }
    };

    return (
        <div style={{ border: '2px solid #3498db', borderRadius: '8px', padding: '1rem', margin: '1rem', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', height: '80vh' }}>
            <h2 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginTop: '0' }}>
                Chat avec {partnerUser.login}
            </h2>
            <p>Status: <b style={{ color: connectionStatus === 'Connecté' ? 'green' : 'red' }}>{connectionStatus}</b></p>
            <div ref={messageAreaRef} style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{ textAlign: msg.sender === currentUser.id ? 'right' : 'left', margin: '5px' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '8px 12px',
                            borderRadius: '15px',
                            backgroundColor: msg.sender === currentUser.id ? '#dcf8c6' : '#fff'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex' }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc' }}
                    placeholder="Tapez un message..."
                />
                <button onClick={handleSendMessage} style={{ padding: '10px 15px', marginLeft: '10px', borderRadius: '20px', border: 'none', background: '#3498db', color: 'white', cursor: 'pointer' }}>
                    Envoyer
                </button>
            </div>
        </div>
    );
};

export default SimplifiedChat;