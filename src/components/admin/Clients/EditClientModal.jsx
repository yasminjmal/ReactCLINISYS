import React, { useState, useEffect } from 'react';
import { Save, XCircle } from 'lucide-react';

const EditClientModal = ({ client, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({
        nomComplet: '',
        email: '',
        telephone: '',
        adresse: '',
        actif: true,
    });

    useEffect(() => {
        if (client) {
            setFormData({
                nomComplet: client.nomComplet || '',
                email: client.email || '',
                telephone: client.telephone || '',
                adresse: client.adresse || '',
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
        onUpdate(client.id, formData);
    };

    if (!client) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl w-full animate-slide-in-up">
                <h3 className="text-lg font-semibold mb-4">Modifier le client "{client.nomComplet}"</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label text-xs">Nom Complet</label>
                        <input type="text" name="nomComplet" value={formData.nomComplet} onChange={handleInputChange} className="form-input" required />
                    </div>
                     <div>
                        <label className="form-label text-xs">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" />
                    </div>
                     <div>
                        <label className="form-label text-xs">Téléphone</label>
                        <input type="tel" name="telephone" value={formData.telephone} onChange={handleInputChange} className="form-input" />
                    </div>
                     <div>
                        <label className="form-label text-xs">Adresse</label>
                        <textarea name="adresse" value={formData.adresse} onChange={handleInputChange} className="form-textarea" rows="2"></textarea>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" name="actif" checked={formData.actif} onChange={handleInputChange} className="form-checkbox" />
                        <label className="ml-2 text-sm font-medium">Actif</label>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onCancel} className="btn btn-secondary"><XCircle size={16} className="mr-1.5"/> Annuler</button>
                        <button type="submit" className="btn btn-primary"><Save size={16} className="mr-1.5"/> Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClientModal;