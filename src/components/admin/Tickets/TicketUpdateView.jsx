// src/components/admin/Tickets/TicketUpdateView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ticketService from '../../../services/ticketService';
import { ArrowLeft, Check, X, GitFork, Loader, Send, PlusCircle, User, Tag, Info, Calendar, Package as ModuleIcon, UserCheck, Shield } from 'lucide-react';

const Spinner = () => <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto my-10"></div>;

// --- Formulaire de Diffraction (Modal) ---
const DiffractionForm = ({ parentTicket, onClose, onSuccess, showTemporaryMessage }) => {
    const [subTickets, setSubTickets] = useState([{ titre: '', description: '' }]);

    const handleAddSubTicket = () => {
        if (subTickets.length < 10) setSubTickets([...subTickets, { titre: '', description: '' }]);
    };
    const handleSubTicketChange = (index, field, value) => {
        const newSubTickets = [...subTickets];
        newSubTickets[index][field] = value;
        setSubTickets(newSubTickets);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const ticketsToCreate = subTickets.filter(t => t.titre.trim() !== '');
        if (ticketsToCreate.length === 0) {
            if (showTemporaryMessage) showTemporaryMessage('error', 'Veuillez renseigner au moins un sous-ticket.');
            return;
        }
        try {
            await ticketService.diffracterTicket(parentTicket.id, ticketsToCreate);
            onSuccess();
        } catch (error) {
            console.error("Erreur lors de la diffraction:", error);
            if (showTemporaryMessage) showTemporaryMessage('error', error.response?.data?.message || "Erreur lors de la création.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">Diffracter le Ticket : {parentTicket.ref}</h3><button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><X size={20}/></button></div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {subTickets.map((st, index) => (
                        <div key={index} className="p-4 border dark:border-slate-700 rounded-md space-y-3 bg-slate-50 dark:bg-slate-800/50">
                            <h4 className="font-semibold">Sous-ticket #{index + 1}</h4>
                            <div><label className="form-label text-xs">Titre *</label><input type="text" value={st.titre} onChange={(e) => handleSubTicketChange(index, 'titre', e.target.value)} className="form-input" required /></div>
                            <div><label className="form-label text-xs">Description</label><textarea value={st.description} onChange={(e) => handleSubTicketChange(index, 'description', e.target.value)} className="form-textarea" rows="2"></textarea></div>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddSubTicket} className="btn btn-secondary w-full mt-2"><PlusCircle size={18} className="mr-2"/> Ajouter</button>
                </form>
                <div className="flex-shrink-0 flex justify-end space-x-3 mt-6 pt-4 border-t dark:border-slate-700">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
                    <button type="submit" onClick={handleSubmit} className="btn btn-primary"><Send size={16} className="mr-2"/> Confirmer</button>
                </div>
            </div>
        </div>
    );
};


const DetailItem = ({ icon, label, value, children }) => (
    <div>
        <dt className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-0.5">{icon}{label}</dt>
        <dd className="text-sm font-medium text-slate-800 dark:text-slate-100 break-words">{children || value || <span className="italic text-slate-400">N/A</span>}</dd>
    </div>
);


// --- Vue Principale de Modification ---
const TicketUpdateView = ({ ticketId, onBack, showTemporaryMessage }) => {
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDiffractionModalOpen, setIsDiffractionModalOpen] = useState(false);

    const fetchTicket = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await ticketService.getTicketById(ticketId);
            setTicket(data);
        } catch (err) {
            setError("Impossible de charger le ticket.");
        } finally {
            setIsLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

    const handleDirectStatusUpdate = async (newStatus) => {
        if (!ticket) return;
        setIsActionLoading(true);
        const ticketDataPayload = {
            titre: ticket.titre, description: ticket.description, idParentTicket: ticket.parentTicket?.id || null,
            priorite: ticket.priorite, statue: newStatus, idClient: ticket.idClient?.id,
            idModule: ticket.idModule?.id, idUtilisateur: ticket.idUtilisateur?.id,
            actif: ticket.actif, date_echeance: ticket.date_echeance,
        };
        try {
            await ticketService.updateTicket(ticketId, ticketDataPayload);
            if (showTemporaryMessage) showTemporaryMessage('success', `Statut mis à jour à "${newStatus}" !`);
            fetchTicket();
        } catch (err) {
            console.error("Erreur détaillée lors de la mise à jour :", err);
            const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue.';
            if (showTemporaryMessage) showTemporaryMessage('error', `Échec : ${errorMessage}`);
        } finally {
            setIsActionLoading(false);
        }
    };
    
    const handleDiffractionSuccess = () => {
        setIsDiffractionModalOpen(false);
        fetchTicket();
        if (showTemporaryMessage) showTemporaryMessage('success', 'Sous-tickets créés avec succès !');
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try { return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        } catch(e) { return "Date invalide"; }
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
                    return <p className="text-slate-500">Ce ticket possède déjà des sous-tickets. La gestion se fait au niveau de chaque sous-ticket.</p>;
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

    return (
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
             <button onClick={onBack} className="btn btn-secondary mb-6"><ArrowLeft size={18} className="mr-2"/> Retour à la liste</button>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* COLONNE GAUCHE */}
                    <div className="flex-grow md:w-2/3 space-y-6">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{ticket.titre}</h1>
                        <div>
                             <h3 className="text-sm font-semibold uppercase text-slate-400 mb-2">Description</h3>
                             <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md min-h-[150px]">
                                {ticket.description || "Aucune description fournie."}
                             </p>
                        </div>
                        {/* Section sous la description */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t dark:border-slate-700">
                            <DetailItem icon={<ModuleIcon size={14} className="mr-2"/>} label="Module" value={ticket.idModule?.designation} />
                            <DetailItem icon={<UserCheck size={14} className="mr-2"/>} label="Affecté à" value={ticket.idUtilisateur ? `${ticket.idUtilisateur.prenom} ${ticket.idUtilisateur.nom}` : ''} />
                            <DetailItem icon={<Calendar size={14} className="mr-2"/>} label="Échéance" value={formatDate(ticket.date_echeance)} />
                        </div>
                    </div>

                    {/* COLONNE DROITE */}
                    <div className="flex-shrink-0 md:w-1/3 space-y-5">
                         <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg space-y-4">
                            <DetailItem icon={<Info size={14} className="mr-2"/>} label="Statut" value={ticket.statue} />
                            <DetailItem icon={<Tag size={14} className="mr-2"/>} label="Priorité" value={ticket.priorite} />
                         </div>

                         <div className="space-y-4 pt-5 border-t dark:border-slate-700">
                             <DetailItem icon={<User size={14} className="mr-2"/>} label="Client" value={ticket.idClient?.nomComplet} />
                             <DetailItem icon={<User size={14} className="mr-2"/>} label="Créé par" value={ticket.userCreation} />
                             <DetailItem icon={<Calendar size={14} className="mr-2"/>} label="Créé le" value={formatDate(ticket.dateCreation)} />
                             <DetailItem icon={<Shield size={14} className="mr-2"/>} label="Actif" value={ticket.actif ? 'Oui' : 'Non'} />
                         </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Actions sur le Ticket</h2>
                <div>
                    {isActionLoading ? <Spinner /> : renderActions()}
                </div>
            </div>

            {isDiffractionModalOpen && (
                 <DiffractionForm parentTicket={ticket} onClose={() => setIsDiffractionModalOpen(false)} onSuccess={handleDiffractionSuccess} showTemporaryMessage={showTemporaryMessage} />
            )}
        </div>
    );
};

export default TicketUpdateView;
