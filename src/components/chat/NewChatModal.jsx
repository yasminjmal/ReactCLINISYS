import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import utilisateurService from '../../services/utilisateurService';
import { useAuth } from '../../context/AuthContext';

/**
 * Avatar stylisé, réutilisé pour une apparence cohérente.
 */
const Avatar = ({ user }) => {
    if (!user) return <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse"></div>;
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500'];
    const color = colors[user.id % colors.length];
    const initial = user.prenom?.[0]?.toUpperCase() || 'U';

    return user.photo ? (
        <img src={`data:image/jpeg;base64,${user.photo}`} alt={user.prenom} className="w-10 h-10 rounded-full object-cover" />
    ) : (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg ${color}`}>
            {initial}
        </div>
    );
};


/**
 * Le composant modal pour démarrer une nouvelle conversation.
 * Cette version a un design amélioré pour gérer de longues listes.
 */
const NewChatModal = ({ existingPartnersIds, onUserSelect, onClose }) => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        utilisateurService.getAllUtilisateurs()
            .then(response => {
                const allUsers = response.data;
                if (Array.isArray(allUsers)) {
                    const availableUsers = allUsers.filter(user => 
                        user.id !== currentUser.id && !existingPartnersIds.includes(user.id)
                    );
                    setUsers(availableUsers);
                }
            })
            .catch(err => console.error("NewChatModal: Erreur lors de la récupération des utilisateurs", err))
            .finally(() => setIsLoading(false));
    }, [currentUser.id, existingPartnersIds]);

    const filteredUsers = users.filter(user =>
        `${user.prenom || ''} ${user.nom || ''} ${user.login || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (user) => {
        onUserSelect(user);
        onClose();
    };

    return (
        // Le fond noir semi-transparent
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
            
            {/* Le conteneur du modal, avec une hauteur fixe et une organisation en flex-col */}
            <div 
                className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[80vh]" 
                onClick={e => e.stopPropagation()}
            >
                {/* En-tête du modal */}
                <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-100">Démarrer une Discussion</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors">
                        <X size={20} />
                    </button>
                </header>

                {/* Barre de recherche */}
                <div className="flex-shrink-0 p-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou login..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900/70 rounded-md py-2 pl-10 pr-4 text-sm focus:ring-blue-500 border border-slate-700"
                        />
                    </div>
                </div>

                {/* --- LA PARTIE IMPORTANTE : La liste avec défilement --- */}
                {/* `flex-1` permet à cette div de prendre tout l'espace vertical restant. */}
                {/* `overflow-y-auto` ajoute une barre de défilement seulement si nécessaire. */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {isLoading ? (
                        <p className="text-center text-slate-400 p-8">Chargement des utilisateurs...</p>
                    ) : (
                        <ul className="space-y-1">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <li key={user.id}>
                                        <button 
                                            onClick={() => handleSelect(user)} 
                                            className="w-full flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50 transition-colors"
                                        >
                                            <Avatar user={user} />
                                            <span className="font-medium text-slate-200">{user.prenom} {user.nom}</span>
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 py-8">Aucun nouvel utilisateur trouvé.</p>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewChatModal;