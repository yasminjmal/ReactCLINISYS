import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// --- Core Hooks and Services ---
import { useChat } from '../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

// --- Child Components ---
import NewChatModal from './NewChatModal';

/**
 * ChatInterface Component
 * This is the main container for your chat application. It manages the layout,
 * fetches the list of ongoing conversations, and handles the selection of an active chat.
 * It also controls the "New Chat" modal.
 */
const ChatInterface = () => {
    // --- State Management ---
    const { currentUser: fullCurrentUser } = useAuth();
    const [chatList, setChatList] = useState([]);
    const [activeChatPartner, setActiveChatPartner] = useState(null);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

    /**
     * Fetches the user's conversation list from the server.
     * useCallback ensures the function isn't recreated on every render, which is a good practice
     * especially when passing it down as a prop.
     */
    const fetchChatList = useCallback(() => {
        if (fullCurrentUser && fullCurrentUser.id) {
            setIsLoadingList(true);
            chatService.getMyChatList(fullCurrentUser.id)
                .then(setChatList)
                .catch(err => console.error("ChatInterface: Failed to load chat list.", err))
                .finally(() => setIsLoadingList(false));
        }
    }, [fullCurrentUser]);

    // Effect for the initial load of the conversation list.
    useEffect(() => {
        fetchChatList();
    }, [fetchChatList]);

    /**
     * Handles the selection of a user to chat with, whether from the
     * existing list or the "New Chat" modal.
     */
    const handleUserSelect = (partner) => {
        setActiveChatPartner(partner);
        setIsNewChatModalOpen(false); // Always close the modal on selection.
    };

    // useMemo optimizes performance by only recalculating the list of existing partner IDs
    // when the chatList state actually changes.
    const existingPartnersIds = useMemo(() => chatList.map(chat => chat.partner.id), [chatList]);

    // Render a loading state if the user data isn't available yet.
    if (!fullCurrentUser) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading user session...</div>;
    }

    return (
        <>
            {/* The "New Chat" modal is rendered conditionally based on its state */}
            {isNewChatModalOpen && (
                <NewChatModal
                    existingPartnersIds={existingPartnersIds}
                    onUserSelect={handleUserSelect}
                    onClose={() => setIsNewChatModalOpen(false)}
                />
            )}

            <div style={{ display: 'flex', height: 'calc(100vh - 50px)', background: '#1e2124', color: 'white', fontFamily: 'Arial, sans-serif' }}>
                {/* --- Sidebar: List of Conversations --- */}
                <aside style={{ width: '350px', borderRight: '1px solid #424549', background: '#282b30', display: 'flex', flexDirection: 'column' }}>
                    <header style={{ padding: '1rem', borderBottom: '1px solid #424549', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0 }}>Discussions</h2>
                        <button
                            onClick={() => setIsNewChatModalOpen(true)}
                            title="Nouvelle discussion"
                            style={{ background: '#40444b', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            +
                        </button>
                    </header>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflowY: 'auto', flexGrow: 1 }}>
                        {isLoadingList ? (
                            <p style={{ textAlign: 'center', padding: '1rem', opacity: 0.7 }}>Chargement...</p>
                        ) : (
                            Array.isArray(chatList) && chatList
                                .filter(chat => chat && chat.partner) // Safety filter for malformed data
                                .map(chat => (
                                    <li
                                        key={chat.partner.id}
                                        onClick={() => handleUserSelect(chat.partner)}
                                        style={{
                                            display: 'flex', alignItems: 'center', padding: '1rem', cursor: 'pointer',
                                            background: activeChatPartner?.id === chat.partner.id ? '#40444b' : 'transparent',
                                            borderBottom: '1px solid #424549'
                                        }}
                                    >
                                        <div>
                                            <h4 style={{ margin: 0 }}>{chat.partner.nom} {chat.partner.prenom}</h4>
                                            <p style={{ fontSize: '0.9em', margin: '5px 0 0', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>
                                                {chat.lastMessage.content}
                                            </p>
                                        </div>
                                    </li>
                                ))
                        )}
                    </ul>
                </aside>

                {/* --- Main Area: Active Chat Window or Welcome Message --- */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {activeChatPartner ? (
                        <ChatWindow
                            // The key is crucial! It forces React to create a new instance of ChatWindow
                            // when the user switches conversations, ensuring a clean state.
                            key={activeChatPartner.id}
                            currentUser={fullCurrentUser}
                            partnerUser={activeChatPartner}
                            onNewMessageSent={fetchChatList} // Pass the function to refresh the list
                        />
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', opacity: 0.5 }}>
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>
                            <h3 style={{ marginTop: '1rem' }}>Sélectionnez une conversation pour commencer</h3>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};


/**
 * ChatWindow Component
 * This component displays the messages for a single, active conversation.
 * It is a "dumb" component that gets all its logic from the `useChat` hook.
 */
const ChatWindow = ({ currentUser, partnerUser, onNewMessageSent }) => {
    const { messages, sendMessage, chatStatus } = useChat(currentUser, partnerUser);
    const [inputValue, setInputValue] = useState('');
    const messageAreaRef = useRef(null);

    // Effect to auto-scroll to the latest message
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
            // If this was the first message, we tell the parent to refresh the conversation list
            // so the new chat appears in the sidebar immediately.
            if (isFirstMessage) {
                onNewMessageSent();
            }
        }
    };

    if (chatStatus === 'loading') return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Chargement de la conversation...</div>;
    if (chatStatus === 'error') return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Erreur de chargement.</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <header style={{ padding: '1rem', background: '#282b30', borderBottom: '1px solid #424549' }}>
                <h3 style={{ margin: 0 }}>{partnerUser.nom} {partnerUser.prenom}</h3>
            </header>

            <div ref={messageAreaRef} style={{ flexGrow: 1, padding: '1rem', overflowY: 'auto' }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === currentUser.id ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                        <div style={{
                            maxWidth: '60%',
                            background: msg.sender === currentUser.id ? '#0084ff' : '#3a3b3c',
                            color: 'white',
                            padding: '10px 15px',
                            borderRadius: '20px',
                            wordBreak: 'break-word',
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            <footer style={{ padding: '1rem', borderTop: '1px solid #424549', background: '#282b30' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#40444b', borderRadius: '25px', padding: '5px 15px' }}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendClick()}
                        style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', color: 'white', fontSize: '1em', outline: 'none' }}
                        placeholder="Tapez un message..."
                    />
                    <button onClick={handleSendClick} style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#0084ff', cursor: 'pointer', padding: '10px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ChatInterface;