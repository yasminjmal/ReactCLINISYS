import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, User, Settings, LogOut, Search, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../shared/LanguageSwitcher';
import ThemeToggleButton from '../shared/ThemeToggleButton';
import chatService from '../../services/chatService';

const NavbarAdmin = ({ toggleSidebar }) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [messagesOpen, setMessagesOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState([]);
    const { stompClient, isConnected } = useWebSocket();

    const dropdownRef = useRef(null);
    const notificationsRef = useRef(null);
    const messagesRef = useRef(null);

    useEffect(() => {
        const fetchUnreadMessages = async () => {
            if (currentUser?.id) {
                try {
                    // La fonction de service peut retourner `undefined` en cas d'erreur.
                    const messages = await chatService.getUnreadMessages(currentUser.id);
                    // On s'assure de toujours définir un tableau pour éviter les erreurs.
                    setUnreadMessages(messages || []);
                } catch (error) {
                    console.error("Erreur lors de la récupération des messages non lus:", error);
                    setUnreadMessages([]); // En cas d'erreur, on initialise avec un tableau vide.
                }
            }
        };

        fetchUnreadMessages();
    }, [currentUser]);

    useEffect(() => {
        if (isConnected && stompClient && currentUser?.login) {
            // S'abonner aux messages privés
            const subscription = stompClient.subscribe(`/user/${currentUser.login}/queue/messages`, (message) => {
                const newMessage = JSON.parse(message.body);
                // Mettre à jour la liste des messages non lus
                setUnreadMessages(prev => [...prev, newMessage]);
            });

            return () => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            };
        }
    }, [isConnected, stompClient, currentUser]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
        }
        if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
            setNotificationsOpen(false);
        }
        if (messagesRef.current && !messagesRef.current.contains(event.target)) {
            setMessagesOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const handleMessagesClick = () => {
        setMessagesOpen(!messagesOpen);
    };
    
    const onMessageDropdownItemClick = () => {
        setMessagesOpen(false);
        // Marquer les messages comme lus après avoir cliqué sur un message
        setUnreadMessages([]);
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-40">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="text-gray-600 dark:text-gray-300 focus:outline-none lg:hidden">
                    <Menu />
                </button>
                <div className="relative ml-4 hidden sm:block">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <Search className="h-5 w-5 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder={t('search')}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <ThemeToggleButton />
                
                <div className="relative" ref={messagesRef}>
                    <button onClick={handleMessagesClick} className="relative text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                        <MessageSquare />
                        {unreadMessages && unreadMessages.length > 0 && (
                            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                                {unreadMessages.length}
                            </span>
                        )}
                    </button>
                    {messagesOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                            <div className="p-3 font-semibold text-sm text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-600">
                                {unreadMessages.length} {t('unreadMessages')}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {unreadMessages && unreadMessages.length > 0 ? (
                                    unreadMessages.map(msg => (
                                        <Link to={`/admin/chat`} onClick={onMessageDropdownItemClick} key={msg.id} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-600">
                                            <div className="flex-shrink-0">
                                                <User className="h-8 w-8 rounded-full bg-gray-200 p-1"/>
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-white">{msg.sender?.prenom || 'Utilisateur inconnu'}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{msg.content}</p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="p-4 text-sm text-gray-500 dark:text-gray-400">{t('noUnreadMessages')}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
                        <User className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 p-1" />
                        <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">{currentUser?.prenom} {currentUser?.nom}</span>
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-xl z-50">
                            <Link to="/admin/profil" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"><User size={16} />{t('profile')}</Link>
                            <Link to="/admin/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"><Settings size={16} />{t('settings')}</Link>
                            <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"><LogOut size={16} />{t('logout')}</button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavbarAdmin;
