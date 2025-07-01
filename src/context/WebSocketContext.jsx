import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import userService from '../services/userService'; // Import the new user service

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
    // Note: `incompleteUser` from `useAuth` is missing the 'id' field.
    const { currentUser: incompleteUser, token } = useAuth(); 
    const [notifications, setNotifications] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const stompClientRef = useRef(null);

    useEffect(() => {
        const connectAndSubscribe = async () => {
            // Only proceed if we have a token and a user object with a login.
            if (incompleteUser && token && incompleteUser.login) {
                
                let fullUserProfile;
                try {
                    // Fetch the full user profile to get the essential user ID.
                    fullUserProfile = await userService.getUserByLogin(incompleteUser.login);
                    if (!fullUserProfile || !fullUserProfile.id) {
                        console.error("WebSocket Error: Could not retrieve a valid user profile with an ID. Aborting connection.");
                        return;
                    }
                } catch (error) {
                    console.error("WebSocket Error: Failed to fetch user profile before connecting.", error);
                    return; // Stop if the profile fetch fails.
                }

                // Now that we have the full profile, we can connect.
                const socketFactory = () => new SockJS('http://localhost:9010/template-core/api/ws');
                const stompClient = new Client({
                    webSocketFactory: socketFactory,
                    connectHeaders: { Authorization: `Bearer ${token}` },
                    reconnectDelay: 5000,
                    onConnect: () => {
                        setIsConnected(true);
                        // Subscribe to the private channel using the correct ID from the full profile.
                        stompClient.subscribe(`/topic/private/${fullUserProfile.id}`, (message) => {
                            const newNotification = JSON.parse(message.body);
                            setNotifications(prev => [newNotification, ...prev]);
                        });
                    },
                    onDisconnect: () => setIsConnected(false),
                    onStompError: (frame) => {
                        console.error('Broker reported error: ' + frame.headers['message']);
                        console.error('Additional details: ' + frame.body);
                    },
                });

                stompClient.activate();
                stompClientRef.current = stompClient;
            }
        };

        connectAndSubscribe();

        // Cleanup function to deactivate the connection when the component unmounts or the user changes.
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                setIsConnected(false);
            }
        };
    }, [incompleteUser, token]); // This effect will re-run if the user logs in or out.

    const value = {
        notifications,
        isConnected,
        clearNotifications: () => setNotifications([])
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};