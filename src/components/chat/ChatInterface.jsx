import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Send, Loader, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import userService from '../../services/userService';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

// --- Reusable Avatar Component (No Changes Needed) ---
const Avatar = ({ user }) => {
    if (!user) return <div className="w-11 h-11 rounded-full bg-slate-300 animate-pulse"></div>;
    const colors = ['#2196F3', '#32c787', '#00BCD4', '#ff5652', '#ffc107', '#ff85af', '#FF9800', '#39bbb0'];
    const hash = String(user.id).split('').reduce((acc, char) => 31 * acc + char.charCodeAt(0), 0);
    const color = colors[Math.abs(hash % colors.length)];
    const initial = user.prenom?.[0]?.toUpperCase() || 'U';

    return (
        <div className="relative flex-shrink-0">
            {user.photo ? (
                 <img src={`data:image/png;base64,${user.photo}`} alt={user.prenom} className="w-11 h-11 rounded-full object-cover" />
            ) : (
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: color }}>
                    {initial}
                </div>
            )}
        </div>
    );
};

// --- The Definitive Chat Interface Component ---
const ChatInterface = ({ setToast }) => {
    const { currentUser: authUser } = useAuth();
    const token = localStorage.getItem('authToken');
    
    // --- REFS ARE USED TO HOLD STABLE INSTANCES ACROSS RE-RENDERS ---
    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);
    const activeChatPartnerRef = useRef(null); // This is crucial for fixing the stale state bug
    const messagesEndRef = useRef(null);

    // --- STATE MANAGEMENT ---
    const [fullCurrentUser, setFullCurrentUser] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Initializing...');
    const [loading, setLoading] = useState(true);
    const [chats, setChats] = useState([]);
    const [activeChatPartner, setActiveChatPartnerState] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // This wrapper function ensures the ref is always in sync with the state
    const setActiveChatPartner = useCallback((partner) => {
        activeChatPartnerRef.current = partner;
        setActiveChatPartnerState(partner);
    }, []);

    const fetchChatList = useCallback(async () => {
        if (!fullCurrentUser?.id) return;
        setLoading(true);
        try {
            const myChats = await chatService.getMyChatList(fullCurrentUser.id);
            setChats(myChats || []);
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to load chats.' });
            console.error("Failed to load chat list:", err);
        } finally {
            setLoading(false);
        }
    }, [fullCurrentUser, setToast]);

    // 1. Fetch the user's full profile
    useEffect(() => {
        if (authUser?.login) {
            userService.getUserByLogin(authUser.login)
                .then(user => {
                    setFullCurrentUser(user);
                })
                .catch((err) => {
                    setToast({ type: 'error', message: 'Failed to load user profile.' });
                    console.error("Failed to fetch current user profile:", err);
                });
        }
    }, [authUser, setToast]);

    // 2. Centralized WebSocket connection and subscription logic
    useEffect(() => {
        if (fullCurrentUser && token) {
            if (stompClientRef.current && stompClientRef.current.connected) {
                console.log('[ChatInterface] STOMP client already connected, skipping new connection attempt.');
                return;
            }

            setConnectionStatus('Connecting...');
            const socket = new SockJS('http://localhost:9010/template-core/ws');
            const client = Stomp.over(socket);
            client.debug = () => {}; // Disable noisy console logs
            stompClientRef.current = client;

            client.connect({ 'Authorization': `Bearer ${token}` }, 
                () => { // onConnected
                    setConnectionStatus('Connected');
                    console.log("🚀 [ChatInterface] STOMP Client Connected Successfully!");
                    fetchChatList(); // Fetch initial chat list

                    // --- THE MAIN FIX FOR REAL-TIME MESSAGE RECEIVING ---
                    // This subscription is created ONCE per connection and uses refs for stable access.
                    subscriptionRef.current = client.subscribe(`/user/${fullCurrentUser.login}/queue/private`, (payload) => {
                        let receivedMessage;
                        try {
                            receivedMessage = JSON.parse(payload.body);
                        } catch (e) {
                            console.error("[ChatInterface] Failed to parse message body (malformed JSON):", e, "Payload:", payload.body);
                            setToast({ type: 'error', message: "Received malformed message." });
                            return; // Exit if message is malformed
                        }
                        
                        console.log(`[ChatInterface] DEBUG 1: Message received on /user/${fullCurrentUser.login}/queue/private:`, receivedMessage);

                        // Always refresh the sidebar to show the latest message and order.
                        fetchChatList();

                        const currentActiveChatPartner = activeChatPartnerRef.current; // Get the latest active chat partner from ref
                        
                        // Determine if the received message belongs to the currently active chat
                        // A message belongs if:
                        // 1. It's from you to the current active chat partner (echoed back from server)
                        // 2. It's from the current active chat partner to you
                        const isMessageForActiveChat = currentActiveChatPartner && (
                            (String(receivedMessage.sender) === String(fullCurrentUser.id) && String(receivedMessage.receiver) === String(currentActiveChatPartner.id)) ||
                            (String(receivedMessage.sender) === String(currentActiveChatPartner.id) && String(receivedMessage.receiver) === String(fullCurrentUser.id))
                        );

                        console.log(`[ChatInterface] DEBUG 2: isMessageForActiveChat=${isMessageForActiveChat}. Active Partner ID: ${currentActiveChatPartner?.id}, Msg Sender ID: ${receivedMessage.sender}, Msg Receiver ID: ${receivedMessage.receiver}, Current User ID: ${fullCurrentUser.id}`);


                        if (isMessageForActiveChat) {
                            setMessages(prevMessages => {
                                // Important: Prevent duplicates if backend echoes messages AND provides a stable unique ID
                                // If your backend does NOT send an 'id' field, remove the `receivedMessage.id &&` part
                                // and potentially use a composite key for deduplication (e.g., sender+content+timestamp).
                                if (receivedMessage.id && prevMessages.some(m => m.id === receivedMessage.id)) {
                                    console.log("[ChatInterface] DEBUG: Duplicate message ID received, ignoring:", receivedMessage.id);
                                    return prevMessages;
                                }
                                console.log("[ChatInterface] DEBUG 3: Adding new message to active chat view:", receivedMessage);
                                return [...prevMessages, receivedMessage];
                            });
                        } else {
                            // If the message is not for the active chat, just update sidebar and show toast
                            setToast({ type: 'info', message: `New message from ${receivedMessage.senderDetails?.prenom || 'a user'}` });
                            console.log("[ChatInterface] DEBUG: Message not for active chat, sidebar updated.");
                        }
                    });

                }, 
                (err) => { // onError
                    console.error('❌ [ChatInterface] STOMP Connection Error:', err);
                    setConnectionStatus('Connection Failed.');
                    stompClientRef.current = null; // Clear client on error to allow re-connection attempts
                    setToast({ type: 'error', message: 'Chat connection failed. Please refresh.' });
                }
            );

            return () => { // Cleanup function for useEffect: Disconnect STOMP client on component unmount
                if (subscriptionRef.current) {
                    subscriptionRef.current.unsubscribe();
                    console.log("[ChatInterface] Unsubscribed from private queue.");
                }
                if (stompClientRef.current?.connected) {
                    stompClientRef.current.disconnect(() => {
                        console.log("[ChatInterface] STOMP Client Disconnected.");
                    });
                }
                stompClientRef.current = null; // Clear ref
                setConnectionStatus('Disconnected'); // Update status on unmount/disconnect
            };
        } else if (!token) {
            setConnectionStatus('Authentication required.');
            console.warn("[ChatInterface] No authentication token found, WebSocket connection not attempted.");
        }
    }, [fullCurrentUser, token, fetchChatList, setToast]); // Dependencies for this effect

    const handleSelectChat = useCallback(async (partner) => {
        if (!fullCurrentUser || !partner) {
            console.warn("[ChatInterface] Cannot select chat, fullCurrentUser or partner is null.");
            setToast({ message: "User data not loaded yet or invalid partner.", type: "warning" });
            return;
        }
        // Avoid re-fetching if the same chat is already active
        if (activeChatPartnerRef.current?.id === partner.id) {
            console.log("[ChatInterface] Chat already active, skipping re-selection.");
            return;
        }
        
        setActiveChatPartner(partner); // Update the state and ref for the active chat partner
        setMessages([]); // Clear messages when selecting a new chat

        try {
            console.log(`[ChatInterface] Fetching messages for chat with ${partner.prenom} (ID: ${partner.id})...`);
            const chatMessages = await chatService.getChatMessages(fullCurrentUser.id, partner.id);
            setMessages(chatMessages);
            console.log(`[ChatInterface] Fetched ${chatMessages.length} messages.`);
        } catch (err) {
            setToast({ type: 'error', message: "Failed to load messages." });
            console.error("Error fetching chat messages for selected chat:", err);
        }
    }, [fullCurrentUser, setToast, setActiveChatPartner]);

    // Auto-scroll to the latest message.
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        const client = stompClientRef.current;
        if (!newMessage.trim() || !activeChatPartnerRef.current || !client?.connected || !fullCurrentUser) {
            if (!client?.connected) setToast({ type: 'error', message: 'Not connected to chat server. Please wait or refresh.' });
            else if (!activeChatPartnerRef.current) setToast({ type: 'warning', message: 'Please select a chat to send a message.' });
            else if (!fullCurrentUser) setToast({ type: 'warning', message: 'User data not loaded yet.' });
            return;
        }
        const trimmedMessage = newMessage.trim();
        const chatMessage = {
            sender: fullCurrentUser.id,
            receiver: activeChatPartnerRef.current.id,
            content: trimmedMessage,
            type: 'CHAT',
            // Add a temporary ID for immediate display (optimistic update)
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
            timestamp: new Date().toISOString() // Add timestamp for sorting
        };
        
        // OPTIMISTIC UPDATE: Add the message to local state immediately for instant feedback
        setMessages(prevMessages => [...prevMessages, chatMessage]);
        setNewMessage(''); // Clear input field

        console.log(`[ChatInterface] Sending message to /app/chat.sendPrivate, content: "${trimmedMessage}"`);
        client.send("/app/chat.sendPrivate", {}, JSON.stringify(chatMessage)); // Send message via STOMP
        
        // Trigger a refresh of the sidebar chat list to update the last message and its order
        fetchChatList(); //

    };
    
    if (!fullCurrentUser) return <div className="flex justify-center items-center h-full"><Loader className="animate-spin text-blue-600" size={32} /></div>;

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-slate-900 font-sans">
            {/* Sidebar */}
            <aside className="w-[340px] border-r border-slate-200 dark:border-slate-800 flex flex-col">
                <header className="p-4 border-b border-slate-200 dark:border-slate-800"><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Chat</h2></header>
                <div className="flex-1 overflow-y-auto">
                    {loading ? <div className="p-4 text-center text-slate-500">Loading chats...</div> :
                        chats.length === 0 ? (
                            <p className="p-4 text-center text-slate-500 text-sm">No active chats. Start a new conversation!</p>
                        ) : (
                            chats.map(chat => {
                                const partner = chat.sender === fullCurrentUser.id ? chat.receiverDetails : chat.senderDetails;
                                if (!partner) return null; // Defensive check
                                return (
                                    <button key={partner.id} onClick={() => handleSelectChat(partner)} className={`w-full text-left p-3 flex items-center gap-4 transition-colors duration-200 ${activeChatPartner?.id === partner.id ? 'bg-blue-50 dark:bg-blue-900/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}>
                                        <Avatar user={partner} />
                                        <div className="flex-1 truncate">
                                            <div className="flex justify-between items-baseline">
                                                <p className="font-semibold text-slate-700 dark:text-slate-200">{partner.prenom || `User ${partner.id}`}</p>
                                                {chat.timestamp && <time className="text-xs text-slate-400">{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>}
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{chat.content}</p>
                                        </div>
                                    </button>
                                );
                            })
                        )
                    }
                </div>
            </aside>

            {/* Main Chat Window */}
            <main className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
                {activeChatPartner ? (
                    <>
                        <header className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                            <Avatar user={activeChatPartner} />
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{activeChatPartner.prenom} {activeChatPartner.nom}</h3>
                                <p className={`text-xs ${connectionStatus === 'Connected' ? 'text-green-500' : 'text-orange-500'}`}>{connectionStatus}</p>
                            </div>
                        </header>
                        <div className="flex-1 p-6 overflow-y-auto space-y-6">
                            {messages.length === 0 && !loading && (
                                <p className="text-center text-slate-400">No messages yet. Start the conversation!</p>
                            )}
                            {messages.map((msg, index) => (
                                <div key={msg.id || `msg-${index}`} className={`flex items-end gap-3 ${msg.sender === fullCurrentUser.id ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <Avatar user={msg.sender === fullCurrentUser.id ? fullCurrentUser : activeChatPartner} />
                                    <div className={`px-4 py-2.5 rounded-2xl max-w-lg md:max-w-xl text-white shadow ${msg.sender === fullCurrentUser.id ? 'bg-blue-600 rounded-br-none' : 'bg-slate-700 rounded-bl-none'}`}>
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <footer className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900">
                            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                placeholder="Type a message..."
                                className="form-input flex-1 bg-slate-100 dark:bg-slate-800 border-transparent focus:ring-blue-500 focus:border-blue-500 rounded-full py-2 px-4 text-slate-800 dark:text-slate-200"
                                disabled={connectionStatus !== 'Connected' || !activeChatPartner}
                            />
                            <button onClick={handleSendMessage} className="btn btn-primary p-3 rounded-full flex-shrink-0" disabled={connectionStatus !== 'Connected' || !activeChatPartner || newMessage.trim() === ''}>
                                <Send size={20} />
                            </button>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                        <MessageCircle size={64} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium">Select a chat to start messaging</p>
                        <p className="text-sm">Connection Status: {connectionStatus}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChatInterface;