// src/services/chatManager.js

import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const chatManager = {
    stompClient: null,
    subscriptions: new Map(),

    /**
     * Connects to the WebSocket and sets up the client.
     * @param {string} token - The user's JWT for authentication.
     * @returns {Promise<void>} - A promise that resolves on successful connection.
     */
    connect(token) {
        return new Promise((resolve, reject) => {
            if (this.stompClient && this.stompClient.connected) {
                console.log('[ChatManager] Already connected.');
                resolve();
                return;
            }

            console.log('[ChatManager] Connecting...');
            const socket = new SockJS('http://localhost:9010/template-core/ws');
            this.stompClient = Stomp.over(socket);
            this.stompClient.debug = () => {}; // Disable console noise

            this.stompClient.connect(
                { 'Authorization': `Bearer ${token}` },
                () => {
                    console.log('🚀 [ChatManager] WebSocket Connected Successfully!');
                    resolve();
                },
                (error) => {
                    console.error('❌ [ChatManager] Connection failed:', error);
                    reject(error);
                }
            );
        });
    },

    /**
     * Disconnects the WebSocket client.
     */
    disconnect() {
        if (this.stompClient && this.stompClient.connected) {
            console.log('[ChatManager] Disconnecting...');
            this.subscriptions.forEach(sub => sub.unsubscribe());
            this.subscriptions.clear();
            this.stompClient.disconnect(() => {
                console.log('[ChatManager] Disconnected.');
            });
            this.stompClient = null;
        }
    },

    /**
     * Subscribes to a topic and registers a callback for new messages.
     * @param {string} destination - The subscription destination (e.g., '/user/queue/private').
     * @param {function} onMessage - The callback function to execute with the new message.
     */
    subscribe(destination, onMessage) {
        if (!this.stompClient || !this.stompClient.connected) {
            console.error('[ChatManager] Cannot subscribe, client not connected.');
            return;
        }

        if (this.subscriptions.has(destination)) {
            console.log(`[ChatManager] Already subscribed to ${destination}.`);
            return;
        }

        const subscription = this.stompClient.subscribe(destination, (payload) => {
            const message = JSON.parse(payload.body);
            console.log(`[ChatManager] Message received on ${destination}:`, message);
            onMessage(message);
        });

        this.subscriptions.set(destination, subscription);
        console.log(`[ChatManager] Subscribed to ${destination}`);
    },

    /**
     * Sends a message to a destination.
     * @param {string} destination - The message destination (e.g., '/app/chat.sendPrivate').
     * @param {object} messageBody - The message payload to send.
     */
    sendMessage(destination, messageBody) {
        if (!this.stompClient || !this.stompClient.connected) {
            console.error('[ChatManager] Cannot send message, client not connected.');
            return;
        }
        console.log(`[ChatManager] Sending message to ${destination}:`, messageBody);
        this.stompClient.send(destination, {}, JSON.stringify(messageBody));
    }
};

export default chatManager;