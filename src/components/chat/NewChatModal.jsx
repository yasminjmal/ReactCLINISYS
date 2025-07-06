import React, { useState, useEffect } from 'react';
import utilisateurService from '../../services/utilisateurService'; // On importe VOTRE service
import { useAuth } from '../../context/AuthContext';

// Styles pour le modal (inchangés)
const styles = {
    backdrop: {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center',
        alignItems: 'center', zIndex: 1000,
    },
    modal: {
        background: '#282b30', color: 'white', padding: '2rem', borderRadius: '8px',
        width: '500px', maxWidth: '90%', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #424549', paddingBottom: '1rem', marginBottom: '1rem',
    },
    closeButton: {
        background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer',
    },
    searchInput: {
        width: '100%', padding: '10px', marginBottom: '1rem', boxSizing: 'border-box',
        background: '#40444b', border: '1px solid #424549', borderRadius: '5px', color: 'white',
    },
    userList: {
        listStyle: 'none', padding: 0, margin: 0, maxHeight: '300px', overflowY: 'auto',
    },
    userListItem: {
        padding: '12px', cursor: 'pointer', borderBottom: '1px solid #424549',
    }
};

/**
 * Le composant modal pour démarrer une nouvelle conversation.
 * Cette version est corrigée pour fonctionner avec votre service utilisateur existant.
 */
const NewChatModal = ({ existingPartnersIds, onUserSelect, onClose }) => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // --- DÉBUT DE LA CORRECTION ---

        // 1. On appelle la bonne fonction de votre service : getAllUtilisateurs()
        utilisateurService.getAllUtilisateurs()
            .then(response => {
                // 2. On extrait les données de la propriété `data` de la réponse Axios.
                const allUsers = response.data; 

                // 3. Le reste de la logique pour filtrer les utilisateurs est inchangé.
                if (Array.isArray(allUsers)) {
                    const availableUsers = allUsers.filter(user => 
                        user.id !== currentUser.id && !existingPartnersIds.includes(user.id)
                    );
                    setUsers(availableUsers);
                }
            })
            .catch(err => console.error("NewChatModal: Erreur lors de la récupération des utilisateurs", err))
            .finally(() => setIsLoading(false));
            
        // --- FIN DE LA CORRECTION ---
    }, [currentUser.id, existingPartnersIds]);

    const filteredUsers = users.filter(user =>
        `${user.prenom || ''} ${user.nom || ''} ${user.login || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (user) => {
        onUserSelect(user); // Appelle la fonction du parent pour sélectionner l'utilisateur
        onClose(); // Ferme le modal
    };

    return (
        <div style={styles.backdrop} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={{margin: 0}}>Nouvelle Discussion</h2>
                    <button onClick={onClose} style={styles.closeButton}>&times;</button>
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    {isLoading ? (
                        <p>Chargement des utilisateurs...</p>
                    ) : (
                        <ul style={styles.userList}>
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <li 
                                    key={user.id} 
                                    onClick={() => handleSelect(user)}
                                    style={styles.userListItem}
                                    onMouseOver={e => e.currentTarget.style.background = '#40444b'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {user.prenom} {user.nom} ({user.login})
                                </li>
                            )) : <p>Aucun nouvel utilisateur à contacter.</p>}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewChatModal;