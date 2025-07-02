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
    const setActiveChatPartner = (partner) => {
        activeChatPartnerRef.current = partner;
        setActiveChatPartnerState(partner);
    };

    const fetchChatList = useCallback(async () => {
        if (!fullCurrentUser?.id) return;
        setLoading(true);
        try {
            const myChats = await chatService.getMyChatList(fullCurrentUser.id);
            setChats(myChats || []);
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to load chats.' });
        } finally {
            setLoading(false);
        }
    }, [fullCurrentUser, setToast]);

    // 1. Fetch the user's full profile
    useEffect(() => {
        if (authUser?.login) {
            userService.getUserByLogin(authUser.login)
                .then(setFullCurrentUser)
                .catch(() => setToast({ type: 'error', message: 'Failed to load user profile.' }));
        }
    }, [authUser, setToast]);

    // 2. Centralized WebSocket connection and subscription logic
    useEffect(() => {
        if (fullCurrentUser && token) {
            if (stompClientRef.current) return; // Prevent multiple connections

            setConnectionStatus('Connecting...');
            const socket = new SockJS('http://localhost:9010/template-core/ws');
            const client = Stomp.over(socket);
            client.debug = () => {}; // Disable noisy console logs
            stompClientRef.current = client;

            client.connect({ 'Authorization': `Bearer ${token}` }, 
                () => { // onConnected
                    setConnectionStatus('Connected');
                    console.log("STOMP Client Connected!");
                    fetchChatList(); // Fetch initial chat list

                    // --- THE MAIN FIX ---
                    // This subscription is created ONCE and uses refs to access current data.
                    subscriptionRef.current = client.subscribe(`/user/${fullCurrentUser.login}/queue/private`, (message) => {
                        const receivedMessage = JSON.parse(message.body);
                        const partnerId = receivedMessage.sender === fullCurrentUser.id ? receivedMessage.receiver : receivedMessage.sender;

                        // Always refresh the sidebar to show the latest message and order
                        fetchChatList();

                        // Check the REF for the current partner, which is always up-to-date
                        if (activeChatPartnerRef.current?.id === partnerId || receivedMessage.sender === fullCurrentUser.id) {
                            setMessages(prev => [...prev, receivedMessage]);
                        } else {
                            setToast({ type: 'info', message: `New message from ${receivedMessage.senderDetails?.prenom || 'a user'}` });
                        }
                    });
                }, 
                (err) => { // onError
                    console.error('STOMP Connection Error:', err);
                    setConnectionStatus('Connection Failed.');
                }
            );

            return () => { // Cleanup on component unmount
                if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
                if (stompClientRef.current?.connected) stompClientRef.current.disconnect();
                console.log("STOMP Client Disconnected.");
            };
        }
    }, [fullCurrentUser, token, fetchChatList, setToast]);

    const handleSelectChat = useCallback(async (partner) => {
        if (!fullCurrentUser || !partner || partner.id === activeChatPartnerRef.current?.id) return;
        
        setActiveChatPartner(partner);
        setMessages([]);
        try {
            const chatMessages = await chatService.getChatMessages(fullCurrentUser.id, partner.id);
            setMessages(chatMessages);
        } catch (err) {
            setToast({ type: 'error', message: "Failed to load messages." });
        }
    }, [fullCurrentUser, setToast]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        const client = stompClientRef.current;
        if (!newMessage.trim() || !activeChatPartnerRef.current || !client?.connected) {
            if (!client?.connected) setToast({ type: 'error', message: 'Connection lost. Please refresh.' });
            return;
        }
        const chatMessage = {
            sender: fullCurrentUser.id,
            receiver: activeChatPartnerRef.current.id,
            content: newMessage.trim(),
            type: 'CHAT'
        };
        client.send("/app/chat.sendPrivate", {}, JSON.stringify(chatMessage));
        setNewMessage('');
    };
    
    if (!fullCurrentUser) return <div className="flex justify-center items-center h-full"><Loader className="animate-spin text-blue-600" size={32} /></div>;

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-slate-900 font-sans">
            {/* Sidebar */}
            <aside className="w-[340px] border-r border-slate-200 dark:border-slate-800 flex flex-col">
                <header className="p-4 border-b border-slate-200 dark:border-slate-800"><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Chat</h2></header>
                <div className="flex-1 overflow-y-auto">
                    {loading ? <div className="p-4 text-center text-slate-500">Loading...</div> :
                        chats.map(chat => {
                            const partner = chat.sender === fullCurrentUser.id ? chat.receiverDetails : chat.senderDetails;
                            if (!partner) return null;
                            return (
                                <button key={partner.id} onClick={() => handleSelectChat(partner)} className={`w-full text-left p-3 flex items-center gap-4 transition-colors duration-200 ${activeChatPartner?.id === partner.id ? 'bg-blue-50 dark:bg-blue-900/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}>
                                    <Avatar user={partner} />
                                    <div className="flex-1 truncate">
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-semibold text-slate-700 dark:text-slate-200">{partner.prenom || `User ${partner.id}`}</p>
                                            <time className="text-xs text-slate-400">{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{chat.content}</p>
                                    </div>
                                </button>
                            );
                        })
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
                                className="form-input flex-1 bg-slate-100 dark:bg-slate-800 border-transparent focus:ring-blue-500 focus:border-blue-500 rounded-full py-2 px-4"
                            />
                            <button onClick={handleSendMessage} className="btn btn-primary p-3 rounded-full flex-shrink-0" disabled={connectionStatus !== 'Connected'}>
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