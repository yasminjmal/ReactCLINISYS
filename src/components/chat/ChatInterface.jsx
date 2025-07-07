import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, Send, Paperclip, MoreHorizontal, Video, Phone, Plus, Smile, MessageSquarePlus } from 'lucide-react';

// --- Hooks, Services, and Child Components ---
import { useChat } from '../hooks/useChat';
import chatService from '../../services/chatService';
import NewChatModal from './NewChatModal'; 

// =================================================================================
//  STYLIZED SUB-COMPONENTS (Self-contained and unchanged)
// =================================================================================

const Avatar = ({ user, showStatus = false }) => {
    if (!user) return <div className="w-12 h-12 rounded-full bg-slate-700 animate-pulse"></div>;
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500'];
    const color = colors[user.id % colors.length];
    const initial = user.prenom?.[0]?.toUpperCase() || 'U';

    return (
        <div className="relative flex-shrink-0">
            {user.photo ? (
                <img src={`data:image/jpeg;base64,${user.photo}`} alt={user.prenom} className="w-12 h-12 rounded-full object-cover" />
            ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${color}`}>
                    {initial}
                </div>
            )}
            {showStatus && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-slate-800" />}
        </div>
    );
};

const ChatListItem = ({ chat, onClick, isActive }) => (
    <li>
        <button
            onClick={onClick}
            className={`w-full text-left p-3 flex items-center space-x-3 transition-colors duration-200 rounded-lg ${isActive ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}
        >
            <Avatar user={chat.partner} showStatus={true} />
            <div className="flex-1 truncate">
                <p className="font-semibold text-slate-200 text-sm">{chat.partner.prenom} {chat.partner.nom}</p>
                <p className="text-sm text-slate-400 truncate mt-1">{chat.lastMessage.content}</p>
            </div>
        </button>
    </li>
);

const MessageBubble = ({ message, isCurrentUser, senderDetails }) => (
     <div className={`flex items-end gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isCurrentUser && <Avatar user={senderDetails} />}
        <div className={`px-4 py-3 rounded-2xl max-w-lg shadow ${isCurrentUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
            <p className="text-sm break-words">{message.content}</p>
            <p className={`text-xs mt-2 opacity-50 text-right ${isCurrentUser ? 'text-blue-200' : 'text-slate-400'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    </div>
);

const ChatWindow = ({ currentUser, partnerUser, onNewMessageSent }) => {
    const { messages, sendMessage, chatStatus } = useChat(currentUser, partnerUser);
    const [inputValue, setInputValue] = useState('');
    const messageAreaRef = useRef(null);

    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendClick = () => {
        if (inputValue.trim()) {
            const isFirstMessage = messages.length === 0;
            sendMessage(inputValue);
            setInputValue('');
            if (isFirstMessage) {
                setTimeout(onNewMessageSent, 500);
            }
        }
    };
    
    if (chatStatus === 'loading') return <div className="flex-1 flex items-center justify-center text-slate-400">Chargement de la conversation...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-800">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700">
                 <div className="flex items-center space-x-4">
                    <Avatar user={partnerUser} />
                    <div>
                        <h3 className="font-bold text-slate-100">{partnerUser.prenom} {partnerUser.nom}</h3>
                        <p className="text-xs text-green-500">En ligne</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                     <button className="p-2 rounded-full text-slate-400 hover:bg-slate-700"><Phone size={20} /></button>
                     <button className="p-2 rounded-full text-slate-400 hover:bg-slate-700"><Video size={20} /></button>
                     <button className="p-2 rounded-full text-slate-400 hover:bg-slate-700"><MoreHorizontal size={20} /></button>
                </div>
            </header>

            <div
                ref={messageAreaRef}
                className="flex-1 min-h-0 p-6 space-y-6 overflow-y-auto"
            >
                {messages.map(msg => ( <MessageBubble key={msg.id} message={msg} isCurrentUser={msg.sender === currentUser.id} senderDetails={msg.senderDetails} /> ))}
            </div>
            
             <footer className="flex-shrink-0 p-4 border-t border-slate-700">
                <div className="relative">
                    <div className="absolute top-0 left-0 h-full flex items-center pl-3 space-x-2">
                         <button className="p-2 rounded-full text-slate-400 hover:bg-slate-700"><Plus size={22} /></button>
                         <button className="p-2 rounded-full text-slate-400 hover:bg-slate-700"><Smile size={20} /></button>
                    </div>
                    <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendClick()} placeholder="Tapez un message..." className="w-full bg-slate-900/70 rounded-lg py-3 px-[7rem] pr-14 border border-slate-700 focus:border-blue-500 focus:ring-blue-500 transition" />
                    <div className="absolute top-0 right-0 h-full flex items-center pr-3">
                        <button onClick={handleSendClick} className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};


// =================================================================================
//  MAIN COMPONENT: ChatInterface
// =================================================================================
const ChatInterface = ({ currentUser }) => {
    const fullCurrentUser = currentUser;
    
    const [chatList, setChatList] = useState([]);
    const [activeChatPartner, setActiveChatPartner] = useState(null);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [mainSearchTerm, setMainSearchTerm] = useState('');

    const fetchChatList = useCallback(() => {
        if (fullCurrentUser?.id) {
            setIsLoadingList(true);
            chatService.getMyChatList(fullCurrentUser.id)
                .then(setChatList)
                .catch(err => console.error("Échec du chargement de la liste.", err))
                .finally(() => setIsLoadingList(false));
        }
    }, [fullCurrentUser]);

    useEffect(() => { fetchChatList(); }, [fetchChatList]);

    const handleUserSelect = (partner) => {
        setActiveChatPartner(partner);
        setIsNewChatModalOpen(false);
    };

    const existingPartnersIds = useMemo(() => chatList.map(chat => chat.partner.id), [chatList]);

    const filteredChatList = useMemo(() => {
        if (!mainSearchTerm) return chatList;
        return chatList.filter(chat =>
            chat.partner && `${chat.partner.prenom || ''} ${chat.partner.nom || ''}`.toLowerCase().includes(mainSearchTerm.toLowerCase())
        );
    }, [chatList, mainSearchTerm]);

    if (!fullCurrentUser) return <div className="h-full flex items-center justify-center bg-slate-900">Chargement de la session...</div>;

    return (
        <>
            {isNewChatModalOpen && (
                <NewChatModal existingPartnersIds={existingPartnersIds} onUserSelect={handleUserSelect} onClose={() => setIsNewChatModalOpen(false)} />
            )}
            
            <div className="grid grid-cols-12 h-full font-sans bg-slate-800 text-slate-300">
                <aside className="col-span-3 bg-slate-900/70 p-4 flex flex-col h-full">
                    <header className="flex-shrink-0 mb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-xl font-bold text-slate-100">Discussions</h1>
                            <button onClick={() => setIsNewChatModalOpen(true)} title="Nouvelle discussion" className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors">
                                <MessageSquarePlus size={20} />
                            </button>
                        </div>
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une conversation..."
                                value={mainSearchTerm}
                                onChange={e => setMainSearchTerm(e.target.value)}
                                className="w-full bg-slate-800 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-blue-500 border-slate-700"
                            />
                        </div>
                    </header>

                    <div className="flex-1 min-h-0 overflow-y-auto -mr-4 pr-4">
                        <ul className="space-y-1">
                            {isLoadingList ? <p className="text-center p-4 text-sm text-slate-500">Chargement...</p> :
                                (Array.isArray(filteredChatList) && filteredChatList.length > 0 ? (
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
                                    <p className="text-center text-slate-500 p-4">Aucune conversation trouvée.</p>
                                ))
                            }
                        </ul>
                    </div>
                </aside>

                <main className="col-span-6 bg-slate-800/70 p-4 flex flex-col overflow-auto ::-webkit-scrollbar-thumb:hover"> 
                    {activeChatPartner ? (
                        <ChatWindow key={activeChatPartner.id} currentUser={fullCurrentUser} partnerUser={activeChatPartner} onNewMessageSent={fetchChatList} />
                    ) : (
                         <div className="h-full flex flex-col items-center justify-center text-slate-500">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-4H6V6h12v2z"></path></svg>
                            <h3 className="mt-4 text-xl font-medium">Votre Messagerie</h3>
                            <p className="text-sm">Sélectionnez une conversation ou démarrez-en une nouvelle.</p>
                        </div>
                    )}
                </main>

                <aside className="col-span-3 bg-slate-900/70 p-4 flex flex-col">
                     <h3 className="text-xl font-bold text-slate-100 mb-4">Fichiers Partagés</h3>
                     <div className="flex-1 overflow-y-auto">
                        <div>
                             <h4 className="text-sm font-semibold text-slate-400 mb-2">Images</h4>
                             <div className="grid grid-cols-2 gap-2">
                                <div className="aspect-square bg-slate-700 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"></div>
                                <div className="aspect-square bg-slate-700 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"></div>
                                <div className="aspect-square bg-slate-700 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"></div>
                                <div className="aspect-square bg-slate-700 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"></div>
                             </div>
                        </div>
                        <div className="mt-6">
                             <h4 className="text-sm font-semibold text-slate-400 mb-2">Fichiers</h4>
                             <ul className="space-y-2 text-sm">
                                 <li className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50 cursor-pointer">
                                     <div className="p-2 bg-blue-500/20 text-blue-400 rounded-md"><Paperclip size={16}/></div>
                                     <span className="truncate">design_system.pdf</span>
                                 </li>
                                 <li className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50 cursor-pointer">
                                     <div className="p-2 bg-rose-500/20 text-rose-400 rounded-md"><Paperclip size={16}/></div>
                                     <span className="truncate">project_briefing_final_v2.docx</span>
                                 </li>
                                 <li className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50 cursor-pointer">
                                     <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-md"><Paperclip size={16}/></div>
                                     <span className="truncate">onboarding_flow.fig</span>
                                 </li>
                             </ul>
                        </div>
                     </div>
                </aside>
            </div>
        </>
    );
};

export default ChatInterface;