// src/components/admin/Tickets/UpdateTicketPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import ticketService from '../../../services/ticketService';
import { ArrowLeft, Check, X, GitFork, AlertTriangle } from 'lucide-react';
import SubTicketManager from './SubTicketManager';
import DiffractionForm from './DiffractionForm';

const Spinner = () => <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto my-10"></div>;

const UpdateTicketPage = ({ showTemporaryMessage }) => {
    const { id } = useParams();
    const history = useHistory();

    const [ticket, setTicket] = useState(null);
    const [editableTicket, setEditableTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDiffractionModalOpen, setIsDiffractionModalOpen] = useState(false);

    const fetchTicket = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await ticketService.getTicketById(id);
            setTicket(data);
            setEditableTicket(data);
        } catch (err) {
            setError("Impossible de charger le ticket.");
            if (showTemporaryMessage) showTemporaryMessage('error', "Impossible de charger le ticket.");
        } finally {
            setIsLoading(false);
        }
    }, [id, showTemporaryMessage]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

    const handleStatusChange = (newStatus) => {
        setEditableTicket(prev => ({ ...prev, statue: newStatus }));
    };

    const handleCancelChanges = () => {
        setEditableTicket(ticket);
    };

    const handleConfirmChanges = async () => {
        if (!editableTicket) return;
        try {
            await ticketService.updateTicket(id, { statue: editableTicket.statue });
            if (showTemporaryMessage) showTemporaryMessage('success', 'Statut du ticket mis à jour !');
            fetchTicket();
        } catch (err) {
            if (showTemporaryMessage) showTemporaryMessage('error', 'Erreur lors de la mise à jour.');
            handleCancelChanges();
        }
    };

    const renderEnAttenteActions = () => (
        <>
            <button onClick={() => handleStatusChange('ACCEPTE')} className="btn btn-success"><Check className="mr-2" /> Accepter</button>
            <button onClick={() => handleStatusChange('REFUSE')} className="btn btn-danger"><X className="mr-2" /> Refuser</button>
        </>
    );

    const renderRefuseActions = () => (
        <button onClick={() => handleStatusChange('ACCEPTE')} className="btn btn-primary"><Check className="mr-2" /> Ré-accepter</button>
    );

    const renderAccepteActions = () => {
        if (!ticket?.childTickets || ticket.childTickets.length === 0) {
            return (
                <div className="flex items-center space-x-4">
                    <button onClick={() => alert("Logique d'affectation à un module à implémenter")} className="btn btn-secondary">Affecter à un module</button>
                    <button onClick={() => setIsDiffractionModalOpen(true)} className="btn btn-primary"><GitFork className="mr-2" /> Diffracter</button>
                </div>
            );
        }
        return <SubTicketManager parentTicket={ticket} onUpdate={fetchTicket} showTemporaryMessage={showTemporaryMessage} />;
    };

    const renderActions = () => {
        if (!editableTicket) return null;

        if (ticket?.statue !== editableTicket.statue) {
            return (
                <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 p-4 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                         <AlertTriangle className="text-yellow-600 mr-3" />
                         <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                             Vous êtes sur le point de changer le statut à "{editableTicket.statue}".
                         </p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={handleConfirmChanges} className="btn btn-success">Confirmer</button>
                        <button onClick={handleCancelChanges} className="btn btn-secondary">Annuler</button>
                    </div>
                </div>
            );
        }

        switch (ticket?.statue) {
            case 'EN_ATTENTE': return renderEnAttenteActions();
            case 'REFUSE': return renderRefuseActions();
            case 'ACCEPTE': return renderAccepteActions();
            default: return <p className="text-slate-500">Aucune action disponible pour le statut "{ticket?.statue}".</p>;
        }
    };
    
    if (isLoading) return <Spinner />;
    if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

    return (
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
             <button onClick={() => history.goBack()} className="btn btn-secondary mb-6">
                <ArrowLeft size={18} className="mr-2"/> Retour
             </button>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{ticket?.titre}</h1>
                <p className="text-sm text-slate-500 mb-4">Référence: {ticket?.ref}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="font-semibold">Client:</span> {ticket?.idClient?.nomComplet}</div>
                    <div><span className="font-semibold">Priorité:</span> {ticket?.priorite}</div>
                    <div><span className="font-semibold">Créé le:</span> {new Date(ticket?.dateCreation).toLocaleDateString()}</div>
                    <div><span className="font-semibold">Statut:</span> <span className="font-bold">{editableTicket?.statue}</span></div>
                </div>
                 <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 whitespace-pre-wrap">{ticket?.description}</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Actions sur le Ticket</h2>
                <div className="space-x-4">
                    {renderActions()}
                </div>
            </div>

            {isDiffractionModalOpen && (
                 <DiffractionForm
                    parentTicketId={ticket.id}
                    parentTicketClientId={ticket.idClient?.id}
                    onClose={() => setIsDiffractionModalOpen(false)}
                    onSuccess={() => {
                        setIsDiffractionModalOpen(false);
                        fetchTicket();
                        if (showTemporaryMessage) showTemporaryMessage('success', 'Sous-tickets créés avec succès !');
                    }}
                    showTemporaryMessage={showTemporaryMessage}
                 />
            )}
        </div>
    );
};

export default UpdateTicketPage;