// src/components/admin/Tickets/TicketUpdateView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ticketService from '../../../services/ticketService';
import moduleService from '../../../services/moduleService';
import {
    ArrowLeft, Check, X, GitFork, Loader, Send, PlusCircle, User, Tag, Info, Calendar,
    Package as ModuleIcon, UserCheck, Shield, Edit, Trash2
} from 'lucide-react';

const Spinner = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>;

// --- Formulaire de Diffraction (Modal) ---
const DiffractionForm = ({ parentTicket, onClose, onSuccess, showTemporaryMessage }) => {
    // Le code de ce composant reste inchangé
    return null; 
};


// --- NOUVEAU: COMPOSANT POUR LE TABLEAU DES SOUS-TICKETS ---
const SubTicketsTable = ({ subTickets, onEdit, onDelete }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Sous-tickets</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium">Titre</th>
                            <th className="px-4 py-2 text-left font-medium">Priorité</th>
                            <th className="px-4 py-2 text-left font-medium">Statut</th>
                            <th className="px-4 py-2 text-left font-medium">Affecté à</th>
                            <th className="px-4 py-2 text-center font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-700">
                        {subTickets.map(sub => (
                            <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-2 font-medium">{sub.titre}</td>
                                <td className="px-4 py-2">{sub.priorite}</td>
                                <td className="px-4 py-2">{sub.statue}</td>
                                <td className="px-4 py-2">{sub.idUtilisateur ? `${sub.idUtilisateur.prenom} ${sub.idUtilisateur.nom}` : 'N/A'}</td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => onEdit(sub.id)} className="p-1.5 text-slate-500 hover:text-blue-500" title="Modifier"><Edit size={16}/></button>
                                        <button onClick={() => onDelete(sub.id)} className="p-1.5 text-slate-500 hover:text-red-500" title="Supprimer"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- COMPOSANTS D'ÉDITION ET D'AFFICHAGE ---

const DetailItem = ({ icon, label, value, children }) => (
    <div>
        <dt className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-0.5">{icon}{label}</dt>
        <dd className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words">{children || value || <span className="italic text-slate-400">N/A</span>}</dd>
    </div>
);

const EditableField = ({ initialValue, onSave, fieldName, isTextarea = false, placeholder = "" }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);

    const handleSave = () => {
        onSave(fieldName, value);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 w-full">
                {isTextarea ? (
                    <textarea value={value} onChange={(e) => setValue(e.target.value)} className="form-textarea flex-grow" placeholder={placeholder} rows={5} />
                ) : (
                    <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="form-input flex-grow" placeholder={placeholder} />
                )}
                <button onClick={handleSave} className="btn btn-success-icon"><Check size={18} /></button>
                <button onClick={() => setIsEditing(false)} className="btn btn-danger-icon"><X size={18} /></button>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-2">
            {isTextarea ? (
                 <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md min-h-[150px] w-full">
                    {initialValue || <span className="italic">Aucune description fournie.</span>}
                 </p>
            ) : (
                 <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{initialValue}</h1>
            )}
            <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-sky-500"><Edit size={16} /></button>
        </div>
    );
};

const PriorityEditor = ({ ticket, onUpdate }) => {
    const priorities = ["Basse", "Moyenne", "Haute"];
    return (
        <select
            value={ticket.priorite}
            onChange={(e) => onUpdate('priorite', e.target.value)}
            className="form-select text-sm font-medium text-slate-800 dark:text-slate-100 bg-transparent border-0 focus:ring-0 p-0"
        >
            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
    );
};

const ModuleEditor = ({ ticket, onUpdate, onRemove, allModules }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredModules = allModules.filter(m => m.designation.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSelectModule = (moduleId) => {
        onUpdate('idModule', moduleId);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
             <div className="p-2 border rounded-md bg-white dark:bg-slate-900">
                <input
                    type="text"
                    placeholder="Rechercher un module..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input w-full mb-2"
                />
                <div className="max-h-40 overflow-y-auto">
                    {filteredModules.map(module => (
                        <div key={module.id} onClick={() => handleSelectModule(module.id)} className="p-2 rounded-md hover:bg-sky-100 dark:hover:bg-sky-700/50 cursor-pointer text-sm">
                           {module.designation}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
         <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{ticket.idModule?.designation || <span className="italic">Aucun module affecté</span>}</span>
            <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-sky-500"><Edit size={14} /></button>
            {ticket.idModule && <button onClick={onRemove} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>}
        </div>
    );
};


// --- Vue Principale de Modification ---
const TicketUpdateView = ({ ticketId, onBack, showTemporaryMessage, onNavigateToUpdate }) => {
    const [ticket, setTicket] = useState(null);
    const [allModules, setAllModules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDiffractionModalOpen, setIsDiffractionModalOpen] = useState(false);

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [ticketData, modulesData] = await Promise.all([
                ticketService.getTicketById(ticketId),
                moduleService.getAllModules()
            ]);
            setTicket(ticketData);
            setAllModules(modulesData.data || []);
        } catch (err) {
            setError("Impossible de charger les données.");
        } finally {
            setIsLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleUpdateField = async (fieldName, value) => {
        if (!ticket) return;
        const payload = {
            titre: fieldName === 'titre' ? value : ticket.titre,
            description: fieldName === 'description' ? value : ticket.description,
            priorite: fieldName === 'priorite' ? value : ticket.priorite,
            idModule: fieldName === 'idModule' ? value : ticket.idModule?.id,
            statue: fieldName === 'statue' ? value : ticket.statue,
            idClient: ticket.idClient?.id, idUtilisateur: ticket.idUtilisateur?.id,
            actif: ticket.actif, date_echeance: ticket.date_echeance,
        };
        try {
            await ticketService.updateTicket(ticketId, payload);
            if (showTemporaryMessage) showTemporaryMessage('success', `${fieldName} mis à jour.`);
            const updatedTicket = await ticketService.getTicketById(ticketId);
            setTicket(updatedTicket);
        } catch (err) {
             if (showTemporaryMessage) showTemporaryMessage('error', 'La mise à jour a échoué.');
        }
    };
    
    const handleRemoveModule = () => {
        handleUpdateField('idModule', null);
    };

    const handleDirectStatusUpdate = async (newStatus) => {
        setIsActionLoading(true);
        await handleUpdateField('statue', newStatus);
        setIsActionLoading(false);
    };

    const handleDiffractionSuccess = () => {
        setIsDiffractionModalOpen(false);
        fetchInitialData(); 
        if (showTemporaryMessage) showTemporaryMessage('success', 'Sous-tickets créés avec succès !');
    };
    
    const handleDeleteSubTicket = async (subTicketId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce sous-ticket ? Cette action est irréversible.")) {
            try {
                await ticketService.deleteTicket(subTicketId);
                if (showTemporaryMessage) showTemporaryMessage('success', 'Sous-ticket supprimé.');
                fetchInitialData();
            } catch (error) {
                console.error("Erreur lors de la suppression du sous-ticket:", error);
                if (showTemporaryMessage) showTemporaryMessage('error', 'La suppression a échoué.');
            }
        }
    };

    const renderActions = () => {
        if (!ticket) return null;
        const isModuleAssigned = !!ticket.idModule;
        const hasSubTickets = ticket.childTickets && ticket.childTickets.length > 0;

        switch (ticket.statue) {
            case 'En_attente':
                return (
                    <div className="flex items-center space-x-4">
                        <button onClick={() => handleDirectStatusUpdate('Accepte')} className="btn btn-success" disabled={isActionLoading}><Check className="mr-2" /> Accepter</button>
                        <button onClick={() => handleDirectStatusUpdate('Refuse')} className="btn btn-danger" disabled={isActionLoading}><X className="mr-2" /> Refuser</button>
                    </div>
                );
            case 'Accepte':
                if (hasSubTickets) {
                    return <p className="text-slate-500">Ce ticket possède déjà des sous-tickets.</p>;
                }
                 return (
                    <div className="flex items-center space-x-4">
                        <div title={isModuleAssigned ? "Un module est déjà affecté" : ""}>
                           <button onClick={() => alert("Logique d'affectation à implémenter.")} className="btn btn-secondary" disabled={isModuleAssigned}>Affecter</button>
                        </div>
                        <div title={isModuleAssigned ? "Veuillez supprimer le module affecté pour diffracter" : ""}>
                           <button onClick={() => setIsDiffractionModalOpen(true)} className="btn btn-primary" disabled={isModuleAssigned}><GitFork className="mr-2" /> Diffracter</button>
                        </div>
                    </div>
                );
            case 'Refuse':
                return <button onClick={() => handleDirectStatusUpdate('Accepte')} className="btn btn-primary" disabled={isActionLoading}><Check className="mr-2" /> Ré-accepter</button>;
            default:
                return <p className="text-slate-500">Aucune action disponible pour le statut "{ticket.statue}".</p>;
        }
    };

    if (isLoading) return <Spinner />;
    if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
    if (!ticket) return null;

    const hasSubTickets = ticket.childTickets && ticket.childTickets.length > 0;

    return (
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="btn btn-secondary"><ArrowLeft size={18} className="mr-2"/> Retour</button>
                <div className="flex items-center">{isActionLoading ? <Spinner /> : renderActions()}</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* COLONNE GAUCHE */}
                    <div className="flex-grow md:w-2/3 space-y-6">
                        <EditableField initialValue={ticket.titre} onSave={handleUpdateField} fieldName="titre" placeholder="Titre du ticket" />
                        
                        <div>
                             <h3 className="text-sm font-semibold uppercase text-slate-400 mb-2 flex items-center">Description</h3>
                             <EditableField initialValue={ticket.description} onSave={handleUpdateField} fieldName="description" placeholder="Description détaillée..." isTextarea={true} />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t dark:border-slate-700">
                             <DetailItem icon={<ModuleIcon size={14} className="mr-2"/>} label="Module">
                                 <ModuleEditor ticket={ticket} onUpdate={handleUpdateField} onRemove={handleRemoveModule} allModules={allModules} />
                             </DetailItem>
                             <DetailItem icon={<UserCheck size={14} className="mr-2"/>} label="Affecté à" value={ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom} ${ticket.idUtilisateur.nom}` : ''} />
                             <DetailItem icon={<Calendar size={14} className="mr-2"/>} label="Échéance" value={new Date(ticket.date_echeance).toLocaleDateString('fr-FR')} />
                        </div>
                    </div>

                    {/* COLONNE DROITE */}
                    <div className="flex-shrink-0 md:w-1/3 space-y-5">
                         <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg space-y-4">
                            <DetailItem icon={<Info size={14} className="mr-2"/>} label="Statut" value={ticket.statue} />
                            <DetailItem icon={<Tag size={14} className="mr-2"/>} label="Priorité">
                                <PriorityEditor ticket={ticket} onUpdate={handleUpdateField} />
                            </DetailItem>
                         </div>
                         
                         <div className="space-y-4 pt-5 border-t dark:border-slate-700">
                             <DetailItem icon={<User size={14} className="mr-2"/>} label="Client" value={ticket.idClient?.nomComplet} />
                             <DetailItem icon={<User size={14} className="mr-2"/>} label="Créé par" value={ticket.userCreation} />
                             <DetailItem icon={<Calendar size={14} className="mr-2"/>} label="Créé le" value={new Date(ticket.dateCreation).toLocaleDateString('fr-FR')} />
                             <DetailItem icon={<Shield size={14} className="mr-2"/>} label="Actif" value={ticket.actif ? 'Oui' : 'Non'} />
                         </div>
                    </div>
                </div>
            </div>
            
            {hasSubTickets && (
                <div className="mt-8">
                    <SubTicketsTable 
                        subTickets={ticket.childTickets}
                        onEdit={onNavigateToUpdate}
                        onDelete={handleDeleteSubTicket}
                    />
                </div>
            )}
            
            {isDiffractionModalOpen && (
                 <DiffractionForm parentTicket={ticket} onClose={() => setIsDiffractionModalOpen(false)} onSuccess={handleDiffractionSuccess} showTemporaryMessage={showTemporaryMessage} />
            )}
        </div>
    );
};

export default TicketUpdateView;
