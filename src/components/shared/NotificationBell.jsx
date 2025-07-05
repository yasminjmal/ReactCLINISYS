import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react'; // Pas besoin de X si vous ne l'utilisez pas
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotifications } from '../../context/NotificationContext'; // <-- Importez votre hook de contexte

const NotificationBell = () => {
    // Consomme le contexte de notification
    const { notifications, unreadCount, loading, markNotificationAsRead, markAllNotificationsAsReadLocally, clearAllNotifications } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleBellClick = () => {
        setIsOpen(prev => !prev);
        // Si le menu s'ouvre, marquez toutes les notifications comme lues (localement)
        if (!isOpen) {
            markAllNotificationsAsReadLocally();
        }
    };

    // Ferme le menu déroulant si l'utilisateur clique à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleBellClick} className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                <Bell size={22} />
                {/* Affiche le badge de notifications non lues */}
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-20 overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="p-3 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100">Notifications</h4>
                        <button onClick={clearAllNotifications} className="text-xs text-sky-500 hover:underline">Tout effacer</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <p className="text-center text-sm text-slate-500 p-8">Chargement des notifications...</p>
                        ) : notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div key={notif.id} className="p-3 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <p className="text-sm text-slate-700 dark:text-slate-200">{notif.message}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        {/* Utilise notif.timestamp car c'est ce que le DTO du backend contient */}
                                        <time className="text-xs text-slate-400">{formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true, locale: fr })}</time>
                                        {/* Bouton "Mark as read" si vous voulez marquer individuellement (en plus de marquer tout en ouvrant) */}
                                        {/* <button onClick={() => markNotificationAsRead(notif.id)} className="text-xs text-blue-500 hover:underline">Marquer comme lu</button> */}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-slate-500 p-8">Aucune notification pour le moment.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;