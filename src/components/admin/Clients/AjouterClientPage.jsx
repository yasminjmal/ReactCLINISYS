import React, { useState } from 'react';
import { Save, XCircle } from 'lucide-react';

const AjouterClientPage = ({ onAddClient, onCancel }) => {
    // L'état initial est synchronisé avec ClientRequestDTO
    const [formData, setFormData] = useState({
        nomComplet: '',
        adress: '', // Corrigé: 'adress' au lieu de 'adresse'
        email: '',
        region: '', // Ajouté: 'region'
        actif: true,
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        // Effacer l'erreur quand l'utilisateur commence à corriger
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nomComplet.trim()) {
            newErrors.nomComplet = "Le nom complet est requis.";
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Veuillez saisir une adresse email valide.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onAddClient(formData);
        }
    };

    return (
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-full">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-6 border-b pb-4 dark:border-slate-700">
                    Ajouter un nouveau Client
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="nomComplet" className="form-label">Nom complet <span className="text-red-500">*</span></label>
                        <input type="text" id="nomComplet" name="nomComplet" value={formData.nomComplet} onChange={handleInputChange} className={`form-input ${errors.nomComplet ? 'border-red-500' : ''}`} placeholder="Ex: Hôpital Central" required />
                        {errors.nomComplet && <p className="text-red-500 text-xs mt-1">{errors.nomComplet}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={`form-input ${errors.email ? 'border-red-500' : ''}`} placeholder="Ex: contact@hopital.com" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="region" className="form-label">Région</label>
                        <input type="text" id="region" name="region" value={formData.region} onChange={handleInputChange} className="form-input" placeholder="Ex: Grand Tunis" />
                    </div>
                    <div>
                        <label htmlFor="adress" className="form-label">Adresse</label>
                        <textarea id="adress" name="adress" value={formData.adress} onChange={handleInputChange} className="form-textarea" placeholder="Ex: 123 Rue de la Santé, Tunis" rows="2"></textarea>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                        <input type="checkbox" id="actif" name="actif" checked={formData.actif} onChange={handleInputChange} className="form-checkbox h-4 w-4 text-sky-600 rounded focus:ring-sky-500" />
                        <label htmlFor="actif" className="text-sm font-medium text-slate-700 dark:text-slate-300">Client actif</label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onCancel} className="btn btn-secondary"><XCircle size={18} className="mr-2"/> Annuler</button>
                        <button type="submit" className="btn btn-primary"><Save size={18} className="mr-2"/> Créer le client</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AjouterClientPage;
