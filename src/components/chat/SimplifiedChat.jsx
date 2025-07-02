import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

// This is a minimal, robust chat component for debugging.
const SimplifiedChat = () => {
    // --- Manually set for testing ---
    const CURRENT_USER_ID = 1014; // Your ID
    const PARTNER_USER_ID = 1016; // The ID of the person you are chatting with
    const CURRENT_USER_LOGIN = "samsamina"; // Your login username
    const TOKEN = localStorage.getItem('authToken');

    // --- State and Refs ---
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('Initializing...');
    const stompClientRef = useRef(null);

    useEffect(() => {
        // This effect runs only once to connect and subscribe.
        if (!TOKEN) {
            setConnectionStatus("Authentication token not found!");
            return;
        }

        console.log("Attempting to connect to WebSocket...");
        setConnectionStatus("Connecting...");

        const socket = new SockJS('http://localhost:9010/template-core/ws');
        const client = Stomp.over(socket);
        client.debug = () => {}; // Disable noisy logs

        const onConnected = () => {
            console.log("CONNECTION SUCCESSFUL!");
            setConnectionStatus("Connected");
            stompClientRef.current = client;

            // Fetch initial message history
            fetch(`http://localhost:9010/template-core/api/chat/history?user1=${CURRENT_USER_ID}&user2=${PARTNER_USER_ID}`)
                .then(res => res.json())
                .then(setMessages)
                .catch(err => console.error("History fetch failed:", err));

            // Subscribe to the private queue for real-time messages
            client.subscribe(`/user/${CURRENT_USER_LOGIN}/private`, (payload) => {
                console.log("--- MESSAGE RECEIVED ---");
                const receivedMessage = JSON.parse(payload.body);
                console.log(receivedMessage);
                // Add any new message to the screen instantly.
                setMessages(prev => [...prev, receivedMessage]);
            });
        };

        const onError = (error) => {
            console.error('WebSocket Connection Error:', error);
            setConnectionStatus("Connection Failed");
        };

        // Connect with authentication headers
        client.connect({ 'Authorization': `Bearer ${TOKEN}` }, onConnected, onError);

        // Cleanup function to disconnect when the component is unmounted
        return () => {
            if (client.connected) {
                client.disconnect();
            }
        };
    }, [TOKEN]); // Run only when the token is available

    const handleSendMessage = () => {
        const client = stompClientRef.current;
        if (newMessage.trim() && client?.connected) {
            const chatMessage = {
                sender: CURRENT_USER_ID,
                receiver: PARTNER_USER_ID,
                content: newMessage,
                type: 'CHAT',
            };
            client.send("/app/chat.sendPrivate", {}, JSON.stringify(chatMessage));
            setNewMessage('');
        }
    };

    return (
        <div style={{ border: '2px solid blue', padding: '1rem', margin: '1rem', fontFamily: 'sans-serif' }}>
            <h2>Simplified Chat with User {PARTNER_USER_ID}</h2>
            <p>Status: <b style={{ color: connectionStatus === 'Connected' ? 'green' : 'red' }}>{connectionStatus}</b></p>
            <hr />
            <div id="message-area" style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                {messages.map((msg, index) => (
                    <div key={msg.id || index} style={{ textAlign: msg.sender === CURRENT_USER_ID ? 'right' : 'left', margin: '5px' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            backgroundColor: msg.sender === CURRENT_USER_ID ? '#dcf8c6' : '#f1f0f0'
                        }}>
                            <strong>User {msg.sender}:</strong> {msg.content}
                        </div>
                    </div>
                ))}
            </div>
            <div id="input-area" style={{ display: 'flex' }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    style={{ flex: 1, padding: '8px' }}
                    placeholder="Type a message..."
                />
                <button onClick={handleSendMessage} style={{ padding: '8px 12px' }}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default SimplifiedChat;