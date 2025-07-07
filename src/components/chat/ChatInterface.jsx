// src/components/chat/ChatInterface.jsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, Send, Paperclip, MoreHorizontal, Video, Phone, Plus, Smile, MessageSquarePlus, Trash2 } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import chatService from '../../services/chatService';
import NewChatModal from './NewChatModal'; 
import { API_BASE_URL } from '../../services/api';

// =================================================================================
//  SOUS-COMPOSANTS
// =================================================================================

const Avatar = ({ user, showStatus = false }) => {
    if (!user) return <div className="w-12 h-12 rounded-full bg-slate-700 animate-pulse"></div>;
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500'];
    const color = user.id ? colors[user.id % colors.length] : colors[0];
    const initial = user.prenom?.[0]?.toUpperCase() || 'U';

    return (
        <div className="relative flex-shrink-0">
            {user.photo ? <img src={`data:image/jpeg;base64,${user.photo}`} alt={user.prenom} className="w-12 h-12 rounded-full object-cover" /> : <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${color}`}>{initial}</div>}
            {showStatus && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-slate-800" />}
        </div>
    );
};

const ChatListItem = ({ chat, onClick, isActive }) => (
    <li>
        <button onClick={onClick} className={`w-full text-left p-3 flex items-center space-x-3 transition-colors duration-200 rounded-lg ${isActive ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}>
            <Avatar user={chat.partner} showStatus={true} />
            <div className="flex-1 truncate">
                <p className="font-semibold text-slate-200 text-sm">{chat.partner.prenom} {chat.partner.nom}</p>
                <p className="text-sm text-slate-400 truncate mt-1">
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
            case 'IMAGE': return <a href={fileUrl} target="_blank" rel="noopener noreferrer"><img src={fileUrl} alt={message.fileName} className="rounded-lg max-w-xs cursor-pointer object-cover" /></a>;
            case 'FILE': return <a href={fileUrl} download={message.fileName} className="flex items-center gap-3 bg-slate-600/50 p-3 rounded-lg hover:bg-slate-600 transition-colors"><Paperclip className="text-slate-300 flex-shrink-0" size={24} /><span className="text-sm text-white font-medium truncate">{message.fileName}</span></a>;
            default: return <p className="text-sm break-words">{message.content}</p>;
        }
    };

    return (
        <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className={`flex items-end gap-2 group ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {isCurrentUser && (
                <button onClick={() => onDelete(message.id)} className={`p-1 text-slate-500 hover:text-red-500 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} title="Supprimer le message">
                    <Trash2 size={16} />
                </button>
            )}
            {!isCurrentUser && <Avatar user={senderDetails} />}
            <div className={`px-4 py-3 rounded-2xl max-w-lg shadow ${isCurrentUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                {renderContent()}
                <p className={`text-xs mt-2 opacity-50 text-right ${isCurrentUser ? 'text-blue-200' : 'text-slate-400'}`}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>
    );
};

// ✅ MODIFIÉ : la prop onNewMessageSent est renommée en refreshChatList pour plus de clarté
const ChatWindow = ({ currentUser, partnerUser, refreshChatList }) => {
    const { messages, sendMessage, chatStatus } = useChat(currentUser, partnerUser);
    const [inputValue, setInputValue] = useState('');
    const messageAreaRef = useRef(null);
    const fileInputRef = useRef(null); 

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
                // ✅ ACTION : On appelle la fonction pour rafraîchir la liste des conversations.
                refreshChatList();
            } catch (error) { 
                console.error("Erreur de suppression:", error); 
                alert("La suppression a échoué."); 
            }
        }
    };
    
    if (chatStatus === 'loading') return <div className="flex-1 flex items-center justify-center text-slate-400">Chargement...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-800">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center space-x-4"><Avatar user={partnerUser} /><div><h3 className="font-bold text-slate-100">{partnerUser.prenom} {partnerUser.nom}</h3><p className="text-xs text-green-500">En ligne</p></div></div>
                <div className="flex items-center space-x-2"><button className="p-2 rounded-full text-slate-400 hover:bg-slate-700"><Phone size={20} /></button><button className="p-2 rounded-full text-slate-400 hover:bg-slate-700"><Video size={20} /></button><button className="p-2 rounded-full text-slate-400 hover:bg-slate-700"><MoreHorizontal size={20} /></button></div>
            </header>
            <div ref={messageAreaRef} className="flex-1 min-h-0 p-6 space-y-6 overflow-y-auto">{messages.map(msg => (<MessageBubble key={msg.id} message={msg} isCurrentUser={msg.sender === currentUser.id} senderDetails={msg.senderDetails} onDelete={handleDeleteMessage} />))}</div>
            <footer className="flex-shrink-0 p-4 border-t border-slate-700">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <div className="relative">
                    <div className="absolute top-0 left-0 h-full flex items-center pl-3 space-x-2"><button onClick={() => fileInputRef.current.click()} className="p-2 rounded-full text-slate-400 hover:bg-slate-700" title="Joindre un fichier"><Plus size={22} /></button><button className="p-2 rounded-full text-slate-400 hover:bg-slate-700" title="Insérer un emoji"><Smile size={20} /></button></div>
                    <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendClick()} placeholder="Tapez un message..." className="w-full bg-slate-900/70 rounded-lg py-3 px-[7rem] pr-14 border border-slate-700 focus:border-blue-500 focus:ring-blue-500 transition" />
                    <div className="absolute top-0 right-0 h-full flex items-center pr-3"><button onClick={handleSendClick} className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md"><Send size={20} /></button></div>
                </div>
            </footer>
        </div>
    );
};

// =================================================================================
//  COMPOSANT PRINCIPAL
// =================================================================================
const ChatInterface = ({ currentUser }) => {
    const [chatList, setChatList] = useState([]);
    const [activeChatPartner, setActiveChatPartner] = useState(null);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [mainSearchTerm, setMainSearchTerm] = useState('');
    const { messages } = useChat(currentUser, activeChatPartner);

    const sharedFiles = useMemo(() => messages.filter(msg => msg.type === 'IMAGE' || msg.type === 'FILE'), [messages]);

    const fetchChatList = useCallback(() => { if (currentUser?.id) { setIsLoadingList(true); chatService.getMyChatList(currentUser.id).then(setChatList).catch(err => console.error("Échec du chargement de la liste.", err)).finally(() => setIsLoadingList(false)); } }, [currentUser]);
    useEffect(() => { fetchChatList(); }, [fetchChatList]);

    const handleUserSelect = (partner) => { setActiveChatPartner(partner); setIsNewChatModalOpen(false); };
    const existingPartnersIds = useMemo(() => chatList.map(chat => chat.partner.id), [chatList]);
    const filteredChatList = useMemo(() => { if (!mainSearchTerm) return chatList; return chatList.filter(chat => chat.partner && `${chat.partner.prenom || ''} ${chat.partner.nom || ''}`.toLowerCase().includes(mainSearchTerm.toLowerCase())); }, [chatList, mainSearchTerm]);

    if (!currentUser) return <div className="h-full flex items-center justify-center bg-slate-900">Chargement...</div>;

    return (
        <>
            {isNewChatModalOpen && <NewChatModal existingPartnersIds={existingPartnersIds} onUserSelect={handleUserSelect} onClose={() => setIsNewChatModalOpen(false)} />}
            <div className="grid grid-cols-12 h-full font-sans bg-slate-800 text-slate-300">
                <aside className="col-span-3 bg-slate-900/70 p-4 flex flex-col h-full">
                    <header className="flex-shrink-0 mb-4">
                        <div className="flex justify-between items-center mb-4"><h1 className="text-xl font-bold text-slate-100">Discussions</h1><button onClick={() => setIsNewChatModalOpen(true)} title="Nouvelle discussion" className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-100"><MessageSquarePlus size={20} /></button></div>
                        <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Rechercher..." value={mainSearchTerm} onChange={e => setMainSearchTerm(e.target.value)} className="w-full bg-slate-800 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-blue-500 border-slate-700" /></div>
                    </header>
                    <div className="flex-1 min-h-0 overflow-y-auto -mr-4 pr-4">
                        <ul className="space-y-1">{isLoadingList ? <p className="text-center p-4 text-sm text-slate-500">Chargement...</p> : (Array.isArray(filteredChatList) && filteredChatList.length > 0 ? filteredChatList.filter(chat => chat && chat.partner).map(chat => (<ChatListItem key={chat.partner.id} chat={chat} isActive={activeChatPartner?.id === chat.partner.id} onClick={() => setActiveChatPartner(chat.partner)} />)) : <p className="text-center text-slate-500 p-4">Aucune conversation.</p>)}</ul>
                    </div>
                </aside>
                {/* ✅ MODIFIÉ : On passe maintenant la fonction fetchChatList sous le nouveau nom */}
                <main className="col-span-6 bg-slate-800/70 p-4 flex flex-col overflow-auto">{activeChatPartner ? <ChatWindow key={activeChatPartner.id} currentUser={currentUser} partnerUser={activeChatPartner} refreshChatList={fetchChatList} /> : <div className="h-full flex flex-col items-center justify-center text-slate-500"><svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-4H6V6h12v2z"></path></svg><h3 className="mt-4 text-xl font-medium">Votre Messagerie</h3><p className="text-sm">Sélectionnez une conversation.</p></div>}</main>
                <aside className="col-span-3 bg-slate-900/70 p-4 flex flex-col">
                     <h3 className="text-xl font-bold text-slate-100 mb-4">Fichiers Partagés</h3>
                     <div className="flex-1 overflow-y-auto">
                        {activeChatPartner ? (sharedFiles.length > 0 ? <ul className="space-y-2 text-sm">{sharedFiles.map(fileMsg => (<li key={fileMsg.id}><a href={`${API_BASE_URL}/chat/messages/${fileMsg.id}/file`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50"><div className={`p-2 rounded-md ${fileMsg.type === 'IMAGE' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}><Paperclip size={16}/></div><span className="truncate" title={fileMsg.fileName}>{fileMsg.fileName}</span></a></li>))}</ul> : <p className="text-slate-500 text-sm text-center mt-4">Aucun fichier ici.</p>) : <p className="text-slate-500 text-sm text-center mt-4">Sélectionnez un chat.</p>}
                     </div>
                </aside>
            </div>
        </>
    );
};

export default ChatInterface;