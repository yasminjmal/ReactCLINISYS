// src/components/chat/ChatInterface.jsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, Send, Paperclip, MoreHorizontal, Video, Phone, Plus, Smile, MessageSquarePlus, Trash2 } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import chatService from '../../services/chatService';
import NewChatModal from './NewChatModal';
import { API_BASE_URL } from '../../services/api';

// =================================================================================
//  SOUS-COMPOSANTS
// =================================================================================

const Avatar = ({ user, showStatus = false }) => {
    // No logical changes, only styling for placeholder
    if (!user) return <div className="w-12 h-12 rounded-full bg-gray-300 animate-pulse"></div>;
    
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500'];
    const color = user.id ? colors[user.id % colors.length] : colors[0];
    const initial = user.prenom?.[0]?.toUpperCase() || 'U';

    return (
        <div className="relative flex-shrink-0">
            {user.photo ? (
                <img src={`data:image/jpeg;base64,${user.photo}`} alt={user.prenom} className="w-12 h-12 rounded-full object-cover" />
            ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${color}`}>{initial}</div>
            )}
            {/* ✅ STYLE: Ring color updated for light theme */}
            {showStatus && <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white" />}
        </div>
    );
};

const ChatListItem = ({ chat, onClick, isActive }) => (
    <li>
        {/* ✅ STYLE: Button colors and active state updated for light theme */}
        <button
            onClick={onClick}
            className={`w-full text-left p-3 flex items-center space-x-3 transition-colors duration-200 rounded-lg ${
                isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-800'
            }`}
        >
            <Avatar user={chat.partner} showStatus={true} />
            <div className="flex-1 truncate">
                {/* ✅ STYLE: Text color changes based on active state */}
                <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-700'}`}>{chat.partner.prenom} {chat.partner.nom}</p>
                <p className={`text-sm truncate mt-1 ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                    {chat.lastMessage.type === 'IMAGE' && '🖼️ Image'}
                    {chat.lastMessage.type === 'FILE' && `📎 ${chat.lastMessage.fileName}`}
                    {chat.lastMessage.type === 'CHAT' && chat.lastMessage.content}
                </p>
            </div>
        </button>
    </li>
);

const MessageBubble = ({ message, isCurrentUser, senderDetails, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);
    const fileUrl = message.id ? `${API_BASE_URL}/chat/messages/${message.id}/file` : '';

    const renderContent = () => {
        switch (message.type) {
            case 'IMAGE':
                return <a href={fileUrl} target="_blank" rel="noopener noreferrer"><img src={fileUrl} alt={message.fileName} className="rounded-lg max-w-xs cursor-pointer object-cover" /></a>;
            case 'FILE':
                 // ✅ STYLE: File link updated for light theme
                return <a href={fileUrl} download={message.fileName} className="flex items-center gap-3 bg-gray-200/50 p-3 rounded-lg hover:bg-gray-200 transition-colors"><Paperclip className="text-gray-600 flex-shrink-0" size={24} /><span className="text-sm text-gray-800 font-medium truncate">{message.fileName}</span></a>;
            default:
                return <p className="text-sm break-words">{message.content}</p>;
        }
    };

    return (
        <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className={`flex items-end gap-2 group ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {isCurrentUser && (
                 // ✅ STYLE: Delete button updated for light theme
                <button onClick={() => onDelete(message.id)} className={`p-1 text-gray-400 hover:text-red-500 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} title="Supprimer le message">
                    <Trash2 size={16} />
                </button>
            )}
            {!isCurrentUser && <Avatar user={senderDetails} />}
            {/* ✅ STYLE: Message bubble colors updated for light theme */}
            <div className={`px-4 py-3 rounded-2xl max-w-lg shadow-sm ${isCurrentUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'}`}>
                {renderContent()}
                {/* ✅ STYLE: Timestamp color updated for light theme */}
                <p className={`text-xs mt-2 opacity-70 text-right ${isCurrentUser ? 'text-blue-100' : 'text-gray-400'}`}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>
    );
};

const ChatWindow = ({ currentUser, partnerUser, refreshChatList }) => {
    const { messages, sendMessage, chatStatus } = useChat(currentUser, partnerUser);
    const [inputValue, setInputValue] = useState('');
    const messageAreaRef = useRef(null);
    const fileInputRef = useRef(null);

    // Logic remains unchanged
    useEffect(() => { if (messageAreaRef.current) { messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight; } }, [messages]);

    const handleSendClick = () => { if (inputValue.trim()) { sendMessage(inputValue); setInputValue(''); if (messages.length === 0) { setTimeout(refreshChatList, 500); } } };
    
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        try { await chatService.sendFile(file, currentUser.id, partnerUser.id); if (messages.length === 0) { setTimeout(refreshChatList, 500); } } catch (error) { console.error("Erreur d'upload:", error); alert("L'envoi a échoué."); }
        event.target.value = null;
    };
    
    const handleDeleteMessage = async (messageId) => {
        if (window.confirm("Supprimer ce message ?")) {
            try {
                await chatService.deleteMessage(messageId);
                refreshChatList();
            } catch (error) {
                console.error("Erreur de suppression:", error);
                alert("La suppression a échoué.");
            }
        }
    };
    
    if (chatStatus === 'loading') return <div className="flex-1 flex items-center justify-center text-gray-500">Chargement...</div>;

    return (
        // ✅ STYLE: Main container for chat window updated for light theme
        <div className="flex flex-col h-full bg-gray-50">
             {/* ✅ STYLE: Header updated for light theme */}
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                    <Avatar user={partnerUser} />
                    <div>
                        <h3 className="font-bold text-gray-800">{partnerUser.prenom} {partnerUser.nom}</h3>
                        <p className="text-xs text-green-600">En ligne</p>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><Phone size={20} /></button>
                    <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><Video size={20} /></button>
                    <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200"><MoreHorizontal size={20} /></button>
                </div>
            </header>
            
            <div ref={messageAreaRef} className="flex-1 min-h-0 p-6 space-y-6 overflow-y-auto">
                {messages.map(msg => (<MessageBubble key={msg.id} message={msg} isCurrentUser={msg.sender === currentUser.id} senderDetails={msg.senderDetails} onDelete={handleDeleteMessage} />))}
            </div>

            {/* ✅ STYLE: Footer and input area updated for light theme */}
            <footer className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <div className="relative">
                    <div className="absolute top-0 left-0 h-full flex items-center pl-3 space-x-1">
                        <button onClick={() => fileInputRef.current.click()} className="p-2 rounded-full text-gray-500 hover:bg-gray-200" title="Joindre un fichier"><Plus size={22} /></button>
                        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200" title="Insérer un emoji"><Smile size={20} /></button>
                    </div>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendClick()}
                        placeholder="Tapez un message..."
                        className="w-full bg-gray-100 rounded-lg py-3 px-[6.5rem] pr-16 border border-transparent focus:border-blue-500 focus:ring-blue-500 transition text-gray-800 placeholder-gray-500"
                    />
                    <div className="absolute top-0 right-0 h-full flex items-center pr-3">
                        <button onClick={handleSendClick} className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 shadow-md transition-colors">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// =================================================================================
//  COMPOSANT PRINCIPAL
// =================================================================================
const ChatInterface = ({ currentUser }) => {
    const [chatList, setChatList] = useState([]);
    const [activeChatPartner, setActiveChatPartner] = useState(null);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [mainSearchTerm, setMainSearchTerm] = useState('');
    const { messages } = useChat(currentUser, activeChatPartner);

    // Logic remains unchanged
    const sharedFiles = useMemo(() => messages.filter(msg => msg.type === 'IMAGE' || msg.type === 'FILE'), [messages]);

    const fetchChatList = useCallback(() => {
        if (currentUser?.id) {
            setIsLoadingList(true);
            chatService.getMyChatList(currentUser.id)
                .then(setChatList)
                .catch(err => console.error("Échec du chargement de la liste.", err))
                .finally(() => setIsLoadingList(false));
        }
    }, [currentUser]);

    useEffect(() => { fetchChatList(); }, [fetchChatList]);

    const handleUserSelect = (partner) => { setActiveChatPartner(partner); setIsNewChatModalOpen(false); };
    const existingPartnersIds = useMemo(() => chatList.map(chat => chat.partner.id), [chatList]);
    const filteredChatList = useMemo(() => {
        if (!mainSearchTerm) return chatList;
        return chatList.filter(chat =>
            chat.partner && `${chat.partner.prenom || ''} ${chat.partner.nom || ''}`.toLowerCase().includes(mainSearchTerm.toLowerCase())
        );
    }, [chatList, mainSearchTerm]);

    if (!currentUser) return <div className="h-screen flex items-center justify-center bg-gray-100">Chargement...</div>;

    return (
        <>
            {isNewChatModalOpen && <NewChatModal existingPartnersIds={existingPartnersIds} onUserSelect={handleUserSelect} onClose={() => setIsNewChatModalOpen(false)} />}
            {/* ✅ STYLE: Main grid and container updated for light theme */}
            <div className="grid grid-cols-12 h-[626px] w-full bg-gray-100 font-sans text-gray-900">
                
                {/* Left Sidebar: Chat List */}
                <aside className="col-span-3 bg-white p-4 flex flex-col h-full border-r border-gray-200">
                    <header className="flex-shrink-0 mb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-xl font-bold text-gray-800">Discussions</h1>
                            <button onClick={() => setIsNewChatModalOpen(true)} title="Nouvelle discussion" className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800">
                                <MessageSquarePlus size={20} />
                            </button>
                        </div>
                        <div className="relative">
                            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={mainSearchTerm}
                                onChange={e => setMainSearchTerm(e.target.value)}
                                className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-blue-500 border border-transparent placeholder-gray-500"
                            />
                        </div>
                    </header>
                    <div className="flex-1 min-h-0 overflow-y-1 -mr-4 pr-3">
                        <ul className="space-y-1">
                            {isLoadingList ? (
                                <p className="text-center p-4 text-sm text-gray-500">Chargement...</p>
                            ) : (Array.isArray(filteredChatList) && filteredChatList.length > 0 ? (
                                filteredChatList
                                    .filter(chat => chat && chat.partner)
                                    .map(chat => (
                                        <ChatListItem
                                            key={chat.partner.id}
                                            chat={chat}
                                            isActive={activeChatPartner?.id === chat.partner.id}
                                            onClick={() => setActiveChatPartner(chat.partner)}
                                        />
                                    ))
                            ) : (
                                <p className="text-center text-gray-500 p-4">Aucune conversation.</p>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Main Content: Chat Window */}
                <main className="col-span-6 bg-gray-50 flex flex-col overflow-auto">
                    {activeChatPartner ? (
                        <ChatWindow
                            key={activeChatPartner.id}
                            currentUser={currentUser}
                            partnerUser={activeChatPartner}
                            refreshChatList={fetchChatList}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" className="text-gray-300">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-4H6V6h12v2z"></path>
                            </svg>
                            <h3 className="mt-4 text-xl font-medium text-gray-600">Votre Messagerie</h3>
                            <p className="text-sm">Sélectionnez une conversation pour commencer.</p>
                        </div>
                    )}
                </main>

                {/* Right Sidebar: Shared Files */}
                <aside className="col-span-3 bg-white p-4 flex flex-col border-l border-gray-200">
                     <h3 className="text-lg font-bold text-gray-800 mb-4 flex-shrink-0">Fichiers Partagés</h3>
                     <div className="flex-1 overflow-y-auto -mr-4 pr-3">
                        {activeChatPartner ? (
                            sharedFiles.length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                    {sharedFiles.map(fileMsg => (
                                        <li key={fileMsg.id}>
                                            <a href={`${API_BASE_URL}/chat/messages/${fileMsg.id}/file`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 group">
                                                <div className={`p-2 rounded-md ${fileMsg.type === 'IMAGE' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                    <Paperclip size={16}/>
                                                </div>
                                                <span className="truncate text-gray-700 group-hover:text-blue-600" title={fileMsg.fileName}>{fileMsg.fileName}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm text-center mt-4">Aucun fichier partagé dans ce chat.</p>
                            )
                        ) : (
                            <p className="text-gray-500 text-sm text-center mt-4">Sélectionnez un chat pour voir les fichiers.</p>
                        )}
                    </div>
                </aside>
            </div>
        </>
    );
};

export default ChatInterface;