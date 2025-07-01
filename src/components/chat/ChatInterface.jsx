// src/components/chat/ChatInterface.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Users, User, Plus, Send, X, Loader, CircleUserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import chatService from '../../services/chatService';
import utilisateurService from '../../services/utilisateurService';
import Modal from '../shared/Modal';

const ChatInterface = ({ setToast }) => {
    const { currentUser } = useAuth();
    const { isConnected, stompClient } = useWebSocket();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [newChatType, setNewChatType] = useState('private');
    const [newChatName, setNewChatName] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [creatingChat, setCreatingChat] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!currentUser?.id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [userChats, usersResponse] = await Promise.all([
                    chatService.getUserChats(currentUser.id),
                    utilisateurService.getAllUtilisateurs(),
                ]);
                setChats(userChats || []);
                const otherUsers = (usersResponse.data || []).filter(u => u.id !== currentUser.id);
                setAllUsers(otherUsers);
            } catch (err) {
                console.error("Erreur de chargement des données initiales:", err);
                setError("Échec du chargement des discussions.");
                setToast({ type: 'error', message: "Échec du chargement des discussions." });
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [currentUser, setToast]);

    const fetchMessagesForActiveChat = useCallback(async () => {
        if (activeChat?.id) {
            try {
                const chatMessages = await chatService.getChatMessages(activeChat.id);
                setMessages(chatMessages);
            } catch (err) {
                setToast({ type: 'error', message: "Échec du chargement des messages." });
            }
        }
    }, [activeChat, setToast]);

    useEffect(() => {
        fetchMessagesForActiveChat();
    }, [fetchMessagesForActiveChat]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isConnected && stompClient && currentUser?.login) {
            const isAdmin = currentUser.role === 'A';
            const topic = isAdmin ? '/topic/public' : `/topic/messages/${currentUser.login}`;

            const topicSubscription = stompClient.subscribe(topic, (message) => {
                const receivedMessage = JSON.parse(message.body);
                if (receivedMessage.chatRoom.id === activeChat?.id) {
                    setMessages((prevMessages) => [...prevMessages, receivedMessage]);
                    scrollToBottom();
                } else {
                    const chatName = receivedMessage.chatRoom.name || `un nouveau message`;
                    setToast({ type: 'info', message: `Vous avez reçu ${chatName}` });
                }
            });

            return () => {
                topicSubscription.unsubscribe();
            };
        }
    }, [isConnected, stompClient, currentUser, activeChat, setToast]);


    const handleSendMessage = () => {
        if (!newMessage.trim() || !activeChat || !isConnected || !stompClient || !currentUser?.id) return;
        const chatMessage = {
            chatRoomId: activeChat.id,
            senderId: currentUser.id,
            content: newMessage.trim(),
        };
        stompClient.publish({
            destination: `/app/chat.sendMessage`,
            body: JSON.stringify(chatMessage),
        });
        setNewMessage('');
    };

    const openNewChatModal = () => {
        if (!currentUser) return;
        setIsNewChatModalOpen(true);
        setSelectedParticipants([currentUser.id]);
        setNewChatName('');
        setUserSearchTerm('');
        setFilteredUsers([]);
    };

    const handleSelectParticipant = (participant) => {
        if (!selectedParticipants.includes(participant.id)) {
            setSelectedParticipants([...selectedParticipants, participant.id]);
        }
        setUserSearchTerm('');
        setFilteredUsers([]);
    };

    const handleCreateNewChat = async () => {
        if (newChatType === 'group' && !newChatName.trim()) {
            return setToast({ type: 'error', message: "Le nom du groupe est requis." });
        }
        if (newChatType === 'private' && selectedParticipants.length !== 2) {
            return setToast({ type: 'error', message: "Une discussion privée doit avoir 2 participants." });
        }
        setCreatingChat(true);
        try {
            let newChat;
            if (newChatType === 'private') {
                const otherUserId = selectedParticipants.find(id => id !== currentUser.id);
                newChat = await chatService.createPrivateChat(currentUser.id, otherUserId);
            } else {
                newChat = await chatService.createGroupChat(newChatName.trim(), selectedParticipants);
            }
            setToast({ type: 'success', message: "Discussion créée !" });
            setChats(prev => [newChat, ...prev]);
            setActiveChat(newChat);
            setIsNewChatModalOpen(false);
        } catch (err) {
            setToast({ type: 'error', message: err.response?.data?.message || "Échec de la création." });
        } finally {
            setCreatingChat(false);
        }
    };

    useEffect(() => {
        if (userSearchTerm.trim()) {
            setFilteredUsers(allUsers.filter(u =>
                (u.prenom?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                 u.nom?.toLowerCase().includes(userSearchTerm.toLowerCase())) &&
                !selectedParticipants.includes(u.id)
            ));
        } else {
            setFilteredUsers([]);
        }
    }, [userSearchTerm, allUsers, selectedParticipants]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader className="animate-spin" size={32} /></div>;
    }
    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }
    if (!currentUser) {
        return <div className="text-center py-20 text-slate-500">Utilisateur non authentifié.</div>;
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900">
            {/* Colonne latérale */}
            <div className="w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Discussions</h2>
                    <button onClick={openNewChatModal} className="btn btn-primary btn-sm flex items-center gap-1"><Plus size={16} />Nouveau</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map(chat => {
                        const otherParticipant = chat.participants?.find(p => p.id !== currentUser.id);
                        const displayName = chat.type === 'GROUP' ? chat.name : (otherParticipant?.prenom || 'Inconnu');
                        return (
                            <button key={chat.id} onClick={() => setActiveChat(chat)} className={`w-full text-left p-3 flex items-center gap-3 ${activeChat?.id === chat.id ? 'bg-blue-100 dark:bg-blue-900/40' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                {chat.type === 'GROUP' ? <Users size={20} /> : <User size={20} />}
                                <div>
                                    <p className="font-semibold">{displayName}</p>
                                    <p className="text-sm text-slate-500 truncate">{chat.lastMessageContent || 'Aucun message'}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Fenêtre de chat */}
            <div className="flex-1 flex flex-col">
                {activeChat ? (
                    <>
                        <div className="p-4 border-b">
                            <h3 className="text-xl font-semibold">{activeChat.name || activeChat.participants?.find(p => p.id !== currentUser.id)?.prenom}</h3>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender.id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`px-4 py-2 rounded-lg max-w-lg ${msg.sender.id === currentUser.id ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                        <p className="text-xs font-bold">{msg.sender.prenom}</p>
                                        <p>{msg.content}</p>
                                        <p className="text-xs text-right opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t flex items-center gap-3">
                            <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} rows="1" placeholder="Écrivez un message..." className="form-input flex-1" />
                            <button onClick={handleSendMessage} className="btn btn-primary p-2.5 rounded-full"><Send size={20} /></button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">Sélectionnez une discussion pour commencer.</div>
                )}
            </div>

            {/* Modal de création de chat */}
            <Modal isOpen={isNewChatModalOpen} onClose={() => setIsNewChatModalOpen(false)} title="Nouvelle discussion">
                <div className="space-y-4">
                    <select value={newChatType} onChange={e => setNewChatType(e.target.value)} className="form-select w-full">
                        <option value="private">Privée (1 à 1)</option>
                        <option value="group">Groupe</option>
                    </select>
                    {newChatType === 'group' && <input type="text" value={newChatName} onChange={e => setNewChatName(e.target.value)} placeholder="Nom du groupe" className="form-input w-full" />}
                    <div>
                        <input type="text" value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} placeholder="Rechercher des utilisateurs..." className="form-input w-full"/>
                        {filteredUsers.length > 0 && (
                            <div className="border rounded-md max-h-40 overflow-y-auto mt-1">
                                {filteredUsers.map(u => <div key={u.id} onClick={() => handleSelectParticipant(u)} className="p-2 hover:bg-slate-100 cursor-pointer">{u.prenom} {u.nom}</div>)}
                            </div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                            {selectedParticipants.map(pId => {
                                const participant = allUsers.find(u => u.id === pId) || (currentUser.id === pId ? currentUser : null);
                                return participant && <span key={pId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{participant.prenom}</span>;
                            })}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setIsNewChatModalOpen(false)} className="btn btn-secondary">Annuler</button>
                    <button onClick={handleCreateNewChat} className="btn btn-primary" disabled={creatingChat}>{creatingChat ? <Loader size={16} className="animate-spin" /> : 'Créer'}</button>
                </div>
            </Modal>
        </div>
    );
};

export default ChatInterface;