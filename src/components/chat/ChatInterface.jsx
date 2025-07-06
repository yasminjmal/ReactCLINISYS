import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat'; // Le hook qui gère la logique d'une conversation
import { useAuth } from '../../context/AuthContext'; // Pour obtenir l'utilisateur actuel
import chatService from '../../services/chatService'; // Pour les appels à l'API de chat

/**
 * ChatInterface est le composant principal qui affiche la liste des conversations et la fenêtre de chat active.
 * Il est responsable de la disposition générale de la page de chat.
 */
const ChatInterface = () => {
    // 1. Récupération de l'utilisateur authentifié depuis le AuthContext.
    // La syntaxe { currentUser: fullCurrentUser } demande la propriété 'currentUser' et la renomme en 'fullCurrentUser'.
    const { currentUser: fullCurrentUser } = useAuth();
    
    // 2. États locaux du composant
    const [chatList, setChatList] = useState([]); // Pour stocker la liste des conversations
    const [activeChatPartner, setActiveChatPartner] = useState(null); // Pour suivre la conversation sélectionnée
    const [isLoadingList, setIsLoadingList] = useState(true); // Pour l'indicateur de chargement

    // 3. Effet pour charger la liste des conversations une seule fois
    useEffect(() => {
        // On s'assure que l'utilisateur est bien chargé avant de lancer l'appel API.
        if (fullCurrentUser && fullCurrentUser.id) {
            console.log("ChatInterface: Chargement de la liste des conversations...");
            chatService.getMyChatList(fullCurrentUser.id)
                .then(data => {
                    setChatList(data);
                    console.log("ChatInterface: Liste des conversations chargée.", data);
                })
                .catch(err => {
                    console.error("ChatInterface: Échec du chargement de la liste des conversations.", err);
                })
                .finally(() => {
                    setIsLoadingList(false);
                });
        }
    }, [fullCurrentUser]); // Cet effet se déclenche uniquement lorsque fullCurrentUser change.

    // 4. Fonction pour gérer la sélection d'une conversation
    const handleUserSelect = (partner) => {
        console.log("ChatInterface: Conversation sélectionnée avec le partenaire :", partner);
        setActiveChatPartner(partner);
    };

    // Si l'utilisateur n'est pas encore disponible, on affiche un message.
    if (!fullCurrentUser) {
        return <div>Chargement de la session utilisateur...</div>;
    }

    // 5. Le rendu du composant
    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 50px)', /* Hauteur moins la navbar */ background: '#1e2124', color: 'white', fontFamily: 'Arial, sans-serif' }}>
            {/* Colonne de gauche : La liste des conversations */}
            <aside style={{ width: '350px', borderRight: '1px solid #424549', background: '#282b30', display: 'flex', flexDirection: 'column' }}>
                <header style={{ padding: '1rem', borderBottom: '1px solid #424549' }}>
                    <h2 style={{ margin: 0 }}>Discussions</h2>
                </header>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflowY: 'auto', flexGrow: 1 }}>
                    {isLoadingList ? (
                        <p style={{textAlign: 'center', padding: '1rem'}}>Chargement...</p>
                    ) : (
                        // C'est ici que l'erreur se produisait. La correction est double :
                        // a) Le backend renvoie maintenant un objet `{ partner, lastMessage }`
                        // b) `.filter(chat => chat && chat.partner)` ajoute une sécurité pour ne jamais planter.
                        Array.isArray(chatList) && chatList
                            .filter(chat => chat && chat.partner) 
                            .map(chat => (
                                <li 
                                    key={chat.partner.id} 
                                    onClick={() => handleUserSelect(chat.partner)} 
                                    style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        cursor: 'pointer', 
                                        background: activeChatPartner?.id === chat.partner.id ? '#40444b' : 'transparent',
                                        borderBottom: '1px solid #424549'
                                    }}
                                >
                                    {/* Vous pouvez ajouter un avatar ici */}
                                    <div>
                                        <h4 style={{margin: 0}}>{chat.partner.nom} {chat.partner.prenom}</h4>
                                        <p style={{fontSize: '0.9em', margin: '5px 0 0', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                            {chat.lastMessage.content}
                                        </p>
                                    </div>
                                </li>
                            ))
                    )}
                </ul>
            </aside>

            {/* Partie principale : La fenêtre de chat ou un message d'accueil */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {activeChatPartner ? (
                    <ChatWindow 
                        currentUser={fullCurrentUser} 
                        partnerUser={activeChatPartner} 
                    />
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', opacity: 0.5 }}>
                        <svg /* Icône de message */ width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>
                        <h3 style={{marginTop: '1rem'}}>Sélectionnez une conversation pour commencer à discuter</h3>
                    </div>
                )}
            </main>
        </div>
    );
};


/**
 * ChatWindow est le composant qui affiche une conversation active.
 * Il utilise notre hook `useChat` pour toute sa logique.
 */
const ChatWindow = ({ currentUser, partnerUser }) => {
    // 1. Utilisation du hook useChat pour obtenir les messages, la fonction d'envoi et le statut.
    const { messages, sendMessage, chatStatus } = useChat(currentUser, partnerUser);
    const [inputValue, setInputValue] = useState('');
    const messageAreaRef = useRef(null);

    // 2. Effet pour faire défiler automatiquement la conversation vers le bas.
    useEffect(() => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]); // Se déclenche à chaque fois que la liste de messages change.

    // 3. Fonction pour gérer l'envoi d'un message.
    const handleSendClick = () => {
        if (inputValue.trim()) {
            sendMessage(inputValue);
            setInputValue(''); // On vide le champ de saisie
        }
    };
    
    // 4. Affichage conditionnel basé sur le statut du chargement du chat.
    if (chatStatus === 'loading') return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>Chargement de l'historique...</div>;
    if (chatStatus === 'error') return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>Erreur lors du chargement de cette conversation.</div>;

    // 5. Le rendu de la fenêtre de chat.
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header de la fenêtre de chat */}
            <header style={{ padding: '1rem', background: '#282b30', borderBottom: '1px solid #424549', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3 style={{margin: 0}}>{partnerUser.nom} {partnerUser.prenom}</h3>
            </header>
            
            {/* Zone d'affichage des messages */}
            <div ref={messageAreaRef} style={{ flexGrow: 1, padding: '1rem', overflowY: 'auto' }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === currentUser.id ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                        <div style={{
                            maxWidth: '60%',
                            background: msg.sender === currentUser.id ? '#0084ff' : '#3a3b3c',
                            color: 'white',
                            padding: '10px 15px',
                            borderRadius: '20px',
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer avec le champ de saisie */}
            <footer style={{ padding: '1rem', borderTop: '1px solid #424549', background: '#282b30' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#40444b', borderRadius: '25px', padding: '5px 15px' }}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendClick()}
                        style={{ flex: 1, padding: '10px', background: 'transparent', border: 'none', color: 'white', fontSize: '1em', outline: 'none' }}
                        placeholder="Tapez votre message..."
                    />
                    <button onClick={handleSendClick} style={{marginLeft: '10px', background: 'none', border: 'none', color: '#0084ff', cursor: 'pointer', padding: '10px'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ChatInterface;