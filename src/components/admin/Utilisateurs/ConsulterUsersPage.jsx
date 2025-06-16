import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, List, LayoutGrid, Rows3, UserPlus, Filter, AlertTriangle, Save, XCircle, Edit, Trash2, ChevronDown, ChevronUp, X as XIcon } from 'lucide-react';

import utilisateurService from '../../../services/utilisateurService';
import AjouterUserPage from './AjouterUserPage';
import UsersCard from './UsersCard';
import UsersRow from './UsersRow';
import UsersTableRow from './UsersTableRow';
import EditUserModal from './EditUserModal'; // NEW: Import EditUserModal

// --- INTERNAL COMPONENTS ---

const Spinner = () => <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto my-10"></div>;

const PageMessage = ({ message, onDismiss }) => {
    if (!message) return null;
    const colors = {
        success: 'bg-green-100 dark:bg-green-800/70 border-green-500 text-green-700 dark:text-green-100',
        error: 'bg-red-100 dark:bg-red-800/70 border-red-500 text-red-700 dark:text-red-100',
        info: 'bg-blue-100 dark:bg-blue-800/70 border-blue-500 text-blue-700 dark:text-blue-100',
        warning: 'bg-yellow-100 dark:bg-yellow-800/70 border-yellow-500 text-yellow-700 dark:text-yellow-100',
    };
    return (
        <div className={`fixed top-24 right-6 p-4 rounded-md shadow-lg z-[100] flex items-center space-x-3 animate-slide-in-right border-l-4 ${colors[message.type]}`} role="alert">
            <span className="font-medium flex-grow">{message.text}</span>
            <button onClick={onDismiss} className="ml-auto p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"><XIcon size={18} /></button>
        </div>
    );
};

const DeleteConfirmationModal = ({ user, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-md w-full">
            <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Confirmer la suppression</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 my-2">Voulez-vous vraiment supprimer l'utilisateur <strong className="font-semibold">{user?.prenom} {user?.nom}</strong> ?</p>
            <div className="flex justify-center space-x-3 mt-6">
                <button onClick={onCancel} className="btn btn-secondary">Annuler</button>
                <button onClick={onConfirm} className="btn btn-danger">Supprimer</button>
            </div>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

const ConsulterUsersPage = () => {
    const [view, setView] = useState('list');
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageMessage, setPageMessage] = useState(null);
    const [userToEdit, setUserToEdit] = useState(null); // For the edit modal
    const [userToDelete, setUserToDelete] = useState(null);

    const [viewMode, setViewMode] = useState('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ role: '', actifs: '' });

    const showTemporaryMessage = useCallback((type, text) => {
        setPageMessage({ type, text });
        setTimeout(() => setPageMessage(null), 5000);
    }, []);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await utilisateurService.getAllUtilisateurs(filters);
            setUsers(response.data || []);
        } catch (error) {
            showTemporaryMessage('error', 'Erreur lors de la récupération des utilisateurs.');
        } finally {
            setIsLoading(false);
        }
    }, [filters, showTemporaryMessage]);

    useEffect(() => {
        if (view === 'list') {
            fetchUsers();
        }
    }, [view, fetchUsers]);

     const handleAddUser = async (userData, photoFile) => {
        try {
            await utilisateurService.createUtilisateur(userData, photoFile);
            showTemporaryMessage('success', 'Utilisateur ajouté avec succès.');
            setView('list'); // Switch back to list view which triggers fetchUsers via useEffect
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Erreur lors de l'ajout.";
            showTemporaryMessage('error', errorMsg);
        }
    };
    
    // NEW: handleUpdateUser logic (will be passed to EditUserModal)
    const handleUpdateUser = async (id, userData, photoFile) => {
        try {
            await utilisateurService.updateUtilisateur(id, userData, photoFile);
            showTemporaryMessage('success', 'Utilisateur mis à jour avec succès.');
            setUserToEdit(null); // Close the modal
            await fetchUsers(); // Refresh the list
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Erreur lors de la mise à jour.";
            showTemporaryMessage('error', errorMsg);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await utilisateurService.deleteUtilisateur(userToDelete.id);
            showTemporaryMessage('info', 'Utilisateur supprimé.');
            setUserToDelete(null);
            await fetchUsers(); // Refresh the list manually
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Impossible de supprimer l'utilisateur.";
            showTemporaryMessage('error', errorMsg);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!Array.isArray(users)) return [];
        return users.filter(user => 
            `${user.prenom} ${user.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    if (view === 'add') {
        return <AjouterUserPage onAddUser={handleAddUser} onCancel={() => setView('list')} />;
    }

    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
            {/* Modals rendered at the top level for overlaying content */}
            <PageMessage message={pageMessage} onDismiss={() => setPageMessage(null)} />
            {userToDelete && <DeleteConfirmationModal user={userToDelete} onConfirm={handleDeleteUser} onCancel={() => setUserToDelete(null)} />}
            {userToEdit && <EditUserModal user={userToEdit} onUpdateUser={handleUpdateUser} onCancel={() => setUserToEdit(null)} showTemporaryMessage={showTemporaryMessage} />} {/* NEW: EditUserModal integration */}

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Gestion des Utilisateurs ({filteredUsers.length})</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setView('add')} className="btn btn-primary"><UserPlus size={18} className="mr-2"/> Ajouter</button>
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-sky-500 text-white' : 'bg-slate-200'}`} title="Tableau"><List size={20} /></button>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-sky-500 text-white' : 'bg-slate-200'}`} title="Grille"><LayoutGrid size={20} /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-sky-500 text-white' : 'bg-slate-200'}`} title="Lignes"><Rows3 size={20} /></button>
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Rechercher par nom, prénom, email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="form-input md:col-span-1"/>
                    <select value={filters.role} onChange={e => setFilters(f => ({...f, role: e.target.value}))} className="form-select">
                        <option value="">Filtrer par rôle (Tous)</option>
                        <option value="ROLE_ADMIN">Administrateur</option> {/* Case corrected for consistency with backend enum */}
                        <option value="ROLE_CHEF_EQUIPE">Chef d'équipe</option>
                        <option value="ROLE_USER">Utilisateur</option>
                    </select>
                     <select value={filters.actifs} onChange={e => setFilters(f => ({...f, actifs: e.target.value}))} className="form-select">
                        <option value="">Filtrer par statut (Tous)</option>
                        <option value="true">Actif</option>
                        <option value="false">Inactif</option>
                    </select>
                </div>
            </div>
            {isLoading ? <Spinner /> : (
                <div className="mt-6">
                    {filteredUsers.length === 0 ? (<p className="text-center text-slate-500 py-10">Aucun utilisateur trouvé.</p>) : (
                         <>
                            {viewMode === 'table' && 
                                <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-100 dark:bg-slate-700 text-left text-xs text-slate-700 dark:text-slate-300 uppercase">
                                                <th className="px-6 py-3">Utilisateur</th>
                                                <th className="px-6 py-3">Rôle</th>
                                                <th className="px-6 py-3">Équipes / Postes</th>
                                                <th className="px-6 py-3">Date Création</th>
                                                <th className="px-6 py-3">Statut</th>
                                                <th className="px-6 py-3 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map(user => <UsersTableRow key={user.id} user={user} onEdit={() => setUserToEdit(user)} onDelete={() => setUserToDelete(user)} />)}
                                        </tbody>
                                    </table>
                                </div>
                            }
                            {viewMode === 'grid' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{filteredUsers.map(user => <UsersCard key={user.id} user={user} onEdit={() => setUserToEdit(user)} onDelete={() => setUserToDelete(user)} />)}</div>}
                            {viewMode === 'list' && <div className="space-y-3">{filteredUsers.map(user => <UsersRow key={user.id} user={user} onEdit={() => setUserToEdit(user)} onDelete={() => setUserToDelete(user)} />)}</div>}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ConsulterUsersPage;