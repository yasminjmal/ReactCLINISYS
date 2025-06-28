import React, { useState } from 'react';
import { Save, XCircle, PlusCircle, Calendar, User, Building, Package as ModuleIcon, Tag } from 'lucide-react';
import { formatDateFromArray } from '../../../utils/dateFormatterTicket'; // Assurez-vous que cette fonction existe et est correcte

const AddTicketModal = ({ onAddTicket, onCancel, availableClients, availableUsers, availableModules, setToast }) => {
    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        priorite: 'MOYENNE', // Valeur par défaut
        statue: 'EN_ATTENTE', // Valeur par défaut
        date_echeance: '', // Format string 'YYYY-MM-DD'
        idClient: '',
        idModule: '',
        idUtilisateur: '', // Employé affecté
        actif: true, // Par défaut actif
        idParentTicket: null, // Par défaut null pour un ticket parent
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Effacer l'erreur si l'utilisateur commence à corriger
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.titre.trim()) {
            newErrors.titre = "Le titre est requis.";
        }
        if (!formData.idClient) {
            newErrors.idClient = "Le client est requis.";
        }
        // La priorité et le statut ont des valeurs par défaut, donc pas de validation 'requis' ici
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const dataToSubmit = { ...formData };
            
            // Convertir la date d'échéance si elle existe
            if (dataToSubmit.date_echeance) {
                const [year, month, day] = dataToSubmit.date_echeance.split('-').map(Number);
                dataToSubmit.date_echeance = [year, month, day, 0, 0, 0]; // Format LocalDateTime du backend
            } else {
                dataToSubmit.date_echeance = null;
            }

            // Convertir les IDs en nombres ou null si vides
            dataToSubmit.idClient = dataToSubmit.idClient ? parseInt(dataToSubmit.idClient, 10) : null;
            dataToSubmit.idModule = dataToSubmit.idModule ? parseInt(dataToSubmit.idModule, 10) : null;
            dataToSubmit.idUtilisateur = dataToSubmit.idUtilisateur ? parseInt(dataToSubmit.idUtilisateur, 10) : null;
            
            onAddTicket(dataToSubmit);
        } else {
            setToast({ type: 'error', message: "Veuillez corriger les erreurs dans le formulaire." });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Ajouter un nouveau Ticket</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Titre */}
                    <div>
                        <label htmlFor="titre" className="form-label">Titre <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="titre"
                            name="titre"
                            value={formData.titre}
                            onChange={handleInputChange}
                            className={`form-input ${errors.titre ? 'border-red-500' : ''}`}
                            placeholder="Ex: Demande d'accès au serveur"
                        />
                        {errors.titre && <p className="form-error-text">{errors.titre}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="form-textarea"
                            rows="3"
                            placeholder="Détaillez la nature du ticket..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Client */}
                        <div>
                            <label htmlFor="idClient" className="form-label">Client <span className="text-red-500">*</span></label>
                            <select
                                id="idClient"
                                name="idClient"
                                value={formData.idClient}
                                onChange={handleInputChange}
                                className={`form-select ${errors.idClient ? 'border-red-500' : ''}`}
                            >
                                <option value="">Sélectionner un client</option>
                                {availableClients.map(client => (
                                    <option key={client.id} value={client.id}>{client.nomComplet}</option>
                                ))}
                            </select>
                            {errors.idClient && <p className="form-error-text">{errors.idClient}</p>}
                        </div>

                        {/* Module */}
                        <div>
                            <label htmlFor="idModule" className="form-label">Module</label>
                            <select
                                id="idModule"
                                name="idModule"
                                value={formData.idModule}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="">Sélectionner un module</option>
                                {availableModules.map(module => (
                                    <option key={module.id} value={module.id}>{module.designation}</option>
                                ))}
                            </select>
                        </div>

                        {/* Employé affecté */}
                        <div>
                            <label htmlFor="idUtilisateur" className="form-label">Employé Affecté</label>
                            <select
                                id="idUtilisateur"
                                name="idUtilisateur"
                                value={formData.idUtilisateur}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="">Non assigné</option>
                                {availableUsers.map(user => (
                                    <option key={user.id} value={user.id}>{user.prenom} {user.nom}</option>
                                ))}
                            </select>
                        </div>

                        {/* Priorité */}
                        <div>
                            <label htmlFor="priorite" className="form-label">Priorité</label>
                            <select
                                id="priorite"
                                name="priorite"
                                value={formData.priorite}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="BASSE">Basse</option>
                                <option value="MOYENNE">Moyenne</option>
                                <option value="HAUTE">Haute</option>
                            </select>
                        </div>
                    </div>

                    {/* Date d'échéance */}
                    <div>
                        <label htmlFor="date_echeance" className="form-label">Date d'échéance (optionnel)</label>
                        <input
                            type="date"
                            id="date_echeance"
                            name="date_echeance"
                            value={formData.date_echeance}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    {/* Actif Checkbox */}
                    <div className="flex items-center pt-2">
                        <input
                            type="checkbox"
                            id="actif"
                            name="actif"
                            checked={formData.actif}
                            onChange={handleInputChange}
                            className="form-checkbox"
                        />
                        <label htmlFor="actif" className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                            Ticket actif
                        </label>
                    </div>

                    {/* Boutons d'action */}
                    <div className="pt-6 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onCancel} className="btn btn-secondary">
                            <XCircle size={16} className="mr-2"/> Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={16} className="mr-2"/> Créer le ticket
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTicketModal;