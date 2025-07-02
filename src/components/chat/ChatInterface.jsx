// src/components/chat/ChatInterface.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader, MessageCircle } from 'lucide-react';
import { useSubscription, useStompClient } from 'react-stomp-hooks';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import userService from '../../services/userService';

const Avatar = ({ user }) => {
    if (!user) return <div className="w-11 h-11 rounded-full bg-slate-300 animate-pulse"></div>;
    const colors = ['#2196F3', '#32c787', '#00BCD4', '#ff5652', '#ffc107', '#ff85af', '#FF9800', '#39bbb0'];
    const hash = String(user.id).split('').reduce((acc, char) => 31 * acc + char.charCodeAt(0), 0);
    const color = colors[Math.abs(hash % colors.length)];
    const initial = user.prenom?.[0]?.toUpperCase() || 'U';
    return <div className="relative flex-shrink-0">{user.photo ? <img src={`data:image/png;base64,${user.photo}`} alt={user.prenom} className="w-11 h-11 rounded-full object-cover" /> : <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: color }}>{initial}</div>}</div>;
};

// Ce composant interne gère la logique du chat de manière fiable
const StompChatComponent = ({ setToast, fullCurrentUser }) => {
    const stompClient = useStompClient();
    const [chats, setChats] = useState([]);
    const [activeChatPartner, setActiveChatPartner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // --- LA CORRECTION FINALE EST ICI ---
    // Nous utilisons une ref pour stocker la dernière valeur du partenaire de chat actif.
    const activeChatPartnerRef = useRef(activeChatPartner);
    activeChatPartnerRef.current = activeChatPartner;

    useSubscription(`/user/${fullCurrentUser?.login}/queue/private`, (message) => {
        const incomingMessage = JSON.parse(message.body);
        console.log('✅ Message reçu via le hook :', incomingMessage);

        setChats(prevChats => {
            const partnerId = incomingMessage.sender === fullCurrentUser.id ? incomingMessage.receiver : incomingMessage.sender;
            const otherChats = prevChats.filter(c => (c.sender !== partnerId && c.receiver !== partnerId));
            return [incomingMessage, ...otherChats].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        });
        
        // On utilise la ref pour obtenir la valeur LA PLUS RÉCENTE du partenaire de chat actif
        const currentActivePartner = activeChatPartnerRef.current;
        if (currentActivePartner && (incomingMessage.sender === currentActivePartner.id || incomingMessage.receiver === currentActivePartner.id)) {
            setMessages(prevMessages => [...prevMessages, incomingMessage]);
        } else {
            setToast({ type: 'info', message: `Nouveau message de ${incomingMessage.senderDetails?.prenom || 'un utilisateur'}` });
        }
    });

    useEffect(() => {
        if (fullCurrentUser?.id) {
            chatService.getMyChatList(fullCurrentUser.id).then(setChats);
        }
    }, [fullCurrentUser]);

    const handleSelectChat = useCallback(async (partner) => {
        if (!fullCurrentUser || !partner || partner.id === activeChatPartner?.id) return;
        setActiveChatPartner(partner);
        setMessages([]);
        const history = await chatService.getChatMessages(fullCurrentUser.id, partner.id);
        setMessages(history);
    }, [fullCurrentUser, activeChatPartner]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !activeChatPartner || !fullCurrentUser || !stompClient) return;
        const chatMessage = { sender: fullCurrentUser.id, receiver: activeChatPartner.id, content: newMessage.trim(), type: 'CHAT' };
        stompClient.publish({ destination: '/app/chat.sendPrivate', body: JSON.stringify(chatMessage) });
        setNewMessage('');
    };
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-slate-900 font-sans">
            <aside className="w-[340px] border-r border-slate-200 dark:border-slate-800 flex flex-col">
                <header className="p-4 border-b border-slate-200 dark:border-slate-800"><h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Chat</h2></header>
                <div className="flex-1 overflow-y-auto">{chats.map(chat => { const partner = chat.sender === fullCurrentUser.id ? chat.receiverDetails : chat.senderDetails; if (!partner) return null; return (<button key={`${partner.id}-${chat.timestamp}`} onClick={() => handleSelectChat(partner)} className={`w-full text-left p-3 flex items-center gap-4 transition-colors duration-200 ${activeChatPartner?.id === partner.id ? 'bg-blue-50 dark:bg-blue-900/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}><Avatar user={partner} /><div className="flex-1 truncate"><p className="font-semibold text-slate-700 dark:text-slate-200">{partner.prenom || `User ${partner.id}`}</p><p className="text-sm text-slate-500 dark:text-slate-400 truncate">{chat.content}</p></div></button>);})}</div>
            </aside>
            <main className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
                {activeChatPartner ? (
                    <>
                        <header className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm"><Avatar user={activeChatPartner} /><div><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{activeChatPartner.prenom} {activeChatPartner.nom}</h3><p className={`text-xs ${stompClient ? 'text-green-500' : 'text-orange-500'}`}>{stompClient ? 'Connecté' : 'Connexion...'}</p></div></header>
                        <div className="flex-1 p-6 overflow-y-auto space-y-6">{messages.map((msg, index) => (<div key={msg.id || `msg-${index}`} className={`flex items-end gap-3 ${msg.sender === fullCurrentUser.id ? 'flex-row-reverse' : 'flex-row'}`}><Avatar user={msg.sender === fullCurrentUser.id ? fullCurrentUser : activeChatPartner} /><div className={`px-4 py-2.5 rounded-2xl max-w-lg md:max-w-xl text-white shadow ${msg.sender === fullCurrentUser.id ? 'bg-blue-600 rounded-br-none' : 'bg-slate-700 rounded-bl-none'}`}><p className="text-sm">{msg.content}</p></div></div>))}<div ref={messagesEndRef} /></div>
                        <footer className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900"><input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder="Écrire un message..." className="form-input flex-1 bg-slate-100 dark:bg-slate-800 border-transparent focus:ring-blue-500 focus:border-blue-500 rounded-full py-2 px-4" /><button onClick={handleSendMessage} className="btn btn-primary p-3 rounded-full flex-shrink-0" disabled={!stompClient}><Send size={20} /></button></footer>
                    </>
                ) : (<div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600"><MessageCircle size={64} className="mb-4 opacity-50" /><p className="text-lg font-medium">Sélectionnez une conversation pour commencer</p><p className="text-sm">État de la connexion : {stompClient ? 'Connecté' : 'Connexion...'}</p></div>)}
            </main>
        </div>
    );
};

// Le composant principal exporté s'assure que l'utilisateur est chargé avant de rendre le chat.
const ChatInterface = ({ setToast }) => {
    const { currentUser: authUser, token } = useAuth();
    const [fullCurrentUser, setFullCurrentUser] = useState(null);

    useEffect(() => {
        if (authUser?.login) {
            userService.getUserByLogin(authUser.login).then(setFullCurrentUser);
        }
    }, [authUser]);

    // On ne rend le chat que si le token existe ET que l'utilisateur est chargé.
    if (!token || !fullCurrentUser) {
        return <div className="flex justify-center items-center h-full"><Loader className="animate-spin text-blue-600" size={32} /></div>;
    }

    // Le composant Stomp est maintenant rendu avec les props nécessaires et à l'intérieur d'un Provider valide.
    return <StompChatComponent setToast={setToast} fullCurrentUser={fullCurrentUser} />;
};

export default ChatInterface;