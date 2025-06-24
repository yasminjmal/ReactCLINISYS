import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, List, LayoutGrid, Users as UsersIconPage, UserPlus, Frown, Table as TableIcon } from 'lucide-react';

// --- Services ---
import clientService from '../../../services/clientService';

// --- Sub-components ---
import ClientTableRow from './ClientTableRow';
import ClientCard from './ClientCard';
import ClientRow from './ClientRow'; // You will need to create this component
import AjouterClientPage from './AjouterClientPage';
import EditClientModal from './EditClientModal'; // You will need to create this component

const ConsulterClientPage = () => {
    const [view, setView] = useState('list');
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table');
    const [searchTerm, setSearchTerm] = useState('');
    const [pageMessage, setPageMessage] = useState(null);
    const [clientToEdit, setClientToEdit] = useState(null);
    const [clientToDelete, setClientToDelete] = useState(null); // Placeholder for delete modal logic

    const fetchClients = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await clientService.getAllClients();
            setClients(response.data || []);
        } catch (err) {
            setPageMessage({ type: 'error', text: "Erreur lors de la récupération des clients." });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view === 'list') {
            fetchClients();
        }
    }, [view, fetchClients]);

    const showTemporaryMessage = useCallback((type, text) => {
        setPageMessage({ type, text });
        setTimeout(() => setPageMessage(null), 4000);
    }, []);

    const handleAddClient = async (clientFormData) => {
        try {
            await clientService.createClient(clientFormData);
            showTemporaryMessage('success', `Le client '${clientFormData.nomComplet}' a été créé.`);
            fetchClients();
            setView('list');
        } catch (err) {
            showTemporaryMessage('error', err.response?.data?.message || "Erreur lors de la création du client.");
        }
    };
    
    const handleUpdateClient = async (clientId, updatedData) => {
        try {
            await clientService.updateClient(clientId, updatedData);
            showTemporaryMessage('success', 'Client mis à jour.');
            setClientToEdit(null);
            fetchClients();
        } catch (err) {
            showTemporaryMessage('error', err.response?.data?.message || 'Erreur lors de la mise à jour.');
        }
    };

    const handleDeleteClient = async () => {
        if (!clientToDelete) return;
        try {
            await clientService.deleteClient(clientToDelete.id);
            showTemporaryMessage('info', 'Client supprimé avec succès.');
        } catch (err) {
            showTemporaryMessage('error', err.response?.data?.message || 'Impossible de supprimer ce client.');
        } finally {
            setClientToDelete(null);
            fetchClients();
        }
    };
    
    // Simple search for now
    const processedClients = clients.filter(c => 
        (c.nomComplet || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-6 text-center">Chargement des clients...</div>;
    if (view === 'add') return <AjouterClientPage onAddClient={handleAddClient} onCancel={() => setView('list')} />;

    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
            {clientToEdit && (
                <EditClientModal
                    client={clientToEdit}
                    onUpdate={handleUpdateClient}
                    onCancel={() => setClientToEdit(null)}
                />
            )}
            
            {/* Placeholder for Delete Modal */}
            {clientToDelete && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
                        <h3 className="text-lg font-bold">Confirmer la suppression</h3>
                        <p className="my-4">Voulez-vous vraiment supprimer le client {clientToDelete.nomComplet}?</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setClientToDelete(null)} className="btn btn-secondary">Annuler</button>
                            <button onClick={handleDeleteClient} className="btn btn-danger">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Gestion des Clients ({processedClients.length})</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setView('add')} className="btn btn-primary"><UserPlus size={18} className="mr-2"/>Ajouter Client</button>
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}><TableIcon size={20} /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}><List size={20} /></button>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}><LayoutGrid size={20} /></button>
                    </div>
                </div>
                <input type="text" placeholder="Rechercher par nom ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input w-full"/>
            </div>

            {pageMessage && (
                <div className={`p-3 rounded-md text-sm ${ pageMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>
                    {pageMessage.text}
                </div>
            )}

            {processedClients.length === 0 && !isLoading && <p className="text-center text-slate-500 py-10"><Frown/> Aucun client trouvé.</p>}

            {viewMode === 'table' && (
                <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-700 text-left text-xs text-slate-700 dark:text-slate-300 uppercase">
                                <th className="px-6 py-3">Nom Complet</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Téléphone</th>
                                <th className="px-6 py-3">Adresse</th>
                                <th className="px-6 py-3">Statut</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {processedClients.map(client => <ClientTableRow key={client.id} client={client} onEditRequest={setClientToEdit} onDeleteRequest={setClientToDelete}/>)}
                        </tbody>
                    </table>
                </div>
            )}
            {viewMode === 'list' && ( <div className="space-y-3">{processedClients.map(client => <ClientRow key={client.id} client={client} onEditRequest={setClientToEdit} onDeleteRequest={setClientToDelete}/>)}</div> )}
            {viewMode === 'grid' && ( <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{processedClients.map(client => <ClientCard key={client.id} client={client} onEditRequest={setClientToEdit} onDeleteRequest={setClientToDelete}/>)}</div> )}
        </div>
    );
};

export default ConsulterClientPage;