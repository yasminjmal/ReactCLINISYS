// src/components/admin/Tickets/SubTicketsTable.jsx
import React, { useState, useRef } from 'react';
import { Edit, Trash2, MessageSquare, Check, X } from 'lucide-react';
import ticketService from '../../../services/ticketService';
import { formatDateFromArray } from '../../../utils/dateFormatterTicket';

// Ligne de sous-ticket en mode édition
const EditRow = ({ sub, onSave, onCancel, allModules }) => {
    const [data, setData] = useState(sub);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };
    const handleModuleChange = (e) => {
        const moduleId = e.target.value;
        const module = allModules.find(m => m.id.toString() === moduleId) || null;
        setData(prev => ({ ...prev, idModule: module }));
    };
    return (
        <tr className="bg-blue-50 dark:bg-blue-900/50 align-top">
            <td className="p-2"><input type="text" name="titre" value={data.titre} onChange={handleChange} className="form-input text-xs"/></td>
            <td className="p-2"><input type="text" name="description" value={data.description} onChange={handleChange} className="form-input text-xs"/></td>
            <td className="p-2">
                <select value={data.idModule?.id || ''} onChange={handleModuleChange} className="form-select text-xs"><option value="">Aucun</option>{allModules.map(m => <option key={m.id} value={m.id}>{m.designation}</option>)}</select>
            </td>
            <td className="p-2 text-xs">{data.idUtilisateur ? `${data.idUtilisateur.prenom} ${data.idUtilisateur.nom}` : 'N/A'}</td>
            <td className="p-2"><input type="date" name="date_echeance" value={data.date_echeance ? new Date(data.date_echeance).toISOString().split('T')[0] : ''} onChange={handleChange} className="form-input text-xs"/></td>
            <td className="p-2"><select name="priorite" value={data.priorite} onChange={handleChange} className="form-select text-xs"><option value="BASSE">Basse</option><option value="MOYENNE">Moyenne</option><option value="HAUTE">Haute</option></select></td>
            <td className="p-2"><select name="statue" value={data.statue} onChange={handleChange} className="form-select text-xs"><option value="EN_ATTENTE">En attente</option><option value="EN_COURS">En cours</option><option value="TERMINE">Terminé</option></select></td>
            <td className="p-2">
                <div className="flex items-center justify-center space-x-1">
                    <button onClick={() => onSave(data)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-full" title="Sauvegarder"><Check size={16}/></button>
                    <button onClick={onCancel} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full" title="Annuler"><X size={16}/></button>
                </div>
            </td>
        </tr>
    );
};

// Ligne de sous-ticket en mode affichage
const DisplayRow = ({ sub, onEdit, onDelete, onToggleComments }) => {
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 align-top">
            <td className="px-3 py-2 font-medium">{sub.titre}</td>
            <td className="px-3 py-2 text-xs text-slate-500 max-w-xs truncate" title={sub.description}>{sub.description || 'N/A'}</td>
            <td className="px-3 py-2">{sub.idModule?.designation || 'N/A'}</td>
            <td className="px-3 py-2">{sub.idUtilisateur ? `${sub.idUtilisateur.prenom} ${sub.idUtilisateur.nom}` : 'N/A'}</td>
            <td className="px-3 py-2 text-xs">{formatDateFromArray(sub.date_echeance)}</td>
            <td className="px-3 py-2 text-xs">{sub.priorite}</td>
            <td className="px-3 py-2 text-xs">{sub.statue.replace('_',' ')}</td>
            <td className="px-3 py-2">
                <div className="flex items-center justify-center space-x-1">
                    <button onClick={() => onEdit(sub)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-full" title="Modifier"><Edit size={14}/></button>
                    <button onClick={() => onDelete(sub.id)} className="p-1.5 text-slate-500 hover:text-red-600 rounded-full" title="Supprimer"><Trash2 size={14}/></button>
                    <button onClick={() => onToggleComments(sub.id)} className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-full" title="Commentaires"><MessageSquare size={14}/></button>
                </div>
            </td>
        </tr>
    );
};


const SubTicketsTable = ({ subTickets, allModules, setToast, onRefreshParent }) => {
    const [editingId, setEditingId] = useState(null);

    const handleSave = async (updatedSubTicket) => {
        const payload = {...updatedSubTicket, idClient: updatedSubTicket.idClient?.id, idModule: updatedSubTicket.idModule?.id, idUtilisateur: updatedSubTicket.idUtilisateur?.id, idParentTicket: updatedSubTicket.parentTicket?.id};
        delete payload.childTickets; delete payload.commentaireList; delete payload.documentJointesList; delete payload.parentTicket;
        try {
            await ticketService.updateTicket(updatedSubTicket.id, payload);
            setToast({ type: 'success', message: `Sous-ticket #${updatedSubTicket.id} mis à jour.` });
            setEditingId(null);
            onRefreshParent();
        } catch (error) { setToast({ type: 'error', message: 'Échec de la mise à jour.' }); }
    };
    
    const handleDelete = async (subTicketId) => {
        if(window.confirm("Êtes-vous sûr de vouloir supprimer ce sous-ticket ?")) {
            try {
                await ticketService.deleteTicket(subTicketId);
                setToast({ type: 'success', message: 'Sous-ticket supprimé.' });
                onRefreshParent();
            } catch (error) { setToast({ type: 'error', message: 'Échec de la suppression.' }); }
        }
    };

    return (
        <div className="card-white p-6">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Sous-tickets</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="px-3 py-2 text-left">Titre</th>
                            <th className="px-3 py-2 text-left">Description</th>
                            <th className="px-3 py-2 text-left">Module</th>
                            <th className="px-3 py-2 text-left">Affecté à</th>
                            <th className="px-3 py-2 text-left">Échéance</th>
                            <th className="px-3 py-2 text-left">Priorité</th>
                            <th className="px-3 py-2 text-left">Statut</th>
                            <th className="px-3 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {subTickets.map(sub => (
                            editingId === sub.id ? 
                            <EditRow key={sub.id} sub={sub} onSave={handleSave} onCancel={() => setEditingId(null)} allModules={allModules} /> :
                            <DisplayRow key={sub.id} sub={sub} onEdit={setEditingId} onDelete={handleDelete} onToggleComments={() => {}} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubTicketsTable;