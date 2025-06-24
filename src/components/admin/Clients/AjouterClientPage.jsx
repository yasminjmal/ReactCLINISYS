import React, { useState } from 'react';
import { Save, XCircle, User, Mail, Phone, MapPin } from 'lucide-react';

const AjouterClientPage = ({ onAddClient, onCancel }) => {
    const [formData, setFormData] = useState({
        nomComplet: '',
        email: '',
        telephone: '',
        adresse: '',
        actif: true,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add validation if needed
        onAddClient(formData);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-6">Ajouter un nouveau Client</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="nomComplet" className="form-label">Nom complet <span className="text-red-500">*</span></label>
                        <input type="text" id="nomComplet" name="nomComplet" value={formData.nomComplet} onChange={handleInputChange} className="form-input" placeholder="Ex: Hôpital Central" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" placeholder="Ex: contact@hopital.com" />
                    </div>
                    <div>
                        <label htmlFor="telephone" className="form-label">Téléphone</label>
                        <input type="tel" id="telephone" name="telephone" value={formData.telephone} onChange={handleInputChange} className="form-input" placeholder="Ex: 0123456789" />
                    </div>
                    <div>
                        <label htmlFor="adresse" className="form-label">Adresse</label>
                        <textarea id="adresse" name="adresse" value={formData.adresse} onChange={handleInputChange} className="form-textarea" placeholder="Ex: 123 Rue de la Santé, Paris" rows="2"></textarea>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="actif" name="actif" checked={formData.actif} onChange={handleInputChange} className="form-checkbox h-4 w-4 text-sky-600 rounded focus:ring-sky-500" />
                        <label htmlFor="actif" className="text-sm font-medium text-slate-700 dark:text-slate-300">Client actif</label>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onCancel} className="btn btn-secondary"><XCircle size={18} className="mr-2"/> Annuler</button>
                        <button type="submit" className="btn btn-primary"><Save size={18} className="mr-2"/> Créer le client</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AjouterClientPage;