import React, { useState, useEffect } from 'react';
import { Save, XCircle } from 'lucide-react';

const EditClientModal = ({ client, onUpdate, onCancel }) => {
    // L'état initial est synchronisé avec ClientRequestDTO
    const [formData, setFormData] = useState({
        nomComplet: '',
        email: '',
        adress: '', // Corrigé: 'adress'
        region: '', // Ajouté: 'region'
        actif: true,
    });

    useEffect(() => {
        if (client) {
            setFormData({
                nomComplet: client.nomComplet || '',
                email: client.email || '',
                adress: client.adress || '', // Corrigé
                region: client.region || '', // Ajouté
                actif: client.actif ?? true,
            });
        }
    }, [client]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Pas besoin de validation complexe ici, car les données existent déjà
        onUpdate(client.id, formData);
    };

    if (!client) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl w-full animate-slide-in-up">
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b pb-3 dark:border-slate-700">
                    Modifier le client
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                        <label className="form-label">Nom Complet <span className="text-red-500">*</span></label>
                        <input type="text" name="nomComplet" value={formData.nomComplet} onChange={handleInputChange} className="form-input" required />
                    </div>
                     <div>
                        <label className="form-label">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" />
                    </div>
                     <div>
                        <label className="form-label">Région</label>
                        <input type="text" name="region" value={formData.region} onChange={handleInputChange} className="form-input" />
                    </div>
                     <div>
                        <label className="form-label">Adresse</label>
                        <textarea name="adress" value={formData.adress} onChange={handleInputChange} className="form-textarea" rows="2"></textarea>
                    </div>
                    <div className="flex items-center pt-2">
                        <input type="checkbox" id="edit-actif" name="actif" checked={formData.actif} onChange={handleInputChange} className="form-checkbox" />
                        <label htmlFor="edit-actif" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">Actif</label>
                    </div>
                    <div className="flex justify-end space-x-3 pt-6">
                        <button type="button" onClick={onCancel} className="btn btn-secondary"><XCircle size={16} className="mr-1.5"/> Annuler</button>
                        <button type="submit" className="btn btn-primary"><Save size={16} className="mr-1.5"/> Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClientModal;
