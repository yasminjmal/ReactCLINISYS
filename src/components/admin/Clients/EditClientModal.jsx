// Remarque: Ce fichier devient redondant si EditClientModal est intégré à ConsulterClientPage.jsx
// Maintenez-le seulement si vous avez une raison spécifique de le garder en dehors.
import React, { useState, useEffect } from 'react';
import { Save, XCircle } from 'lucide-react';

const EditClientModal = ({ client, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({
        nomComplet: '',
        email: '',
        adress: '',
        region: '',
        actif: true,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (client) {
            setFormData({
                nomComplet: client.nomComplet || '',
                email: client.email || '',
                adress: client.adress || '',
                region: client.region || '',
                actif: client.actif ?? true,
            });
        }
    }, [client]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setError(''); // Clear error on input change
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nomComplet.trim()) {
            setError('Le nom complet est requis.');
            return;
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Veuillez saisir une adresse email valide.');
            return;
        }
        onUpdate(client.id, formData);
    };

    if (!client) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Modifier le Client</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="edit-nomComplet" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Nom Complet
                        </label>
                        <input
                            type="text"
                            id="edit-nomComplet"
                            name="nomComplet"
                            value={formData.nomComplet}
                            onChange={handleInputChange}
                            className={`
                                block w-full px-3 py-2
                                bg-white dark:bg-slate-900/50
                                border rounded-md shadow-sm
                                placeholder-slate-400 dark:placeholder-slate-500
                                focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                                sm:text-sm
                                ${error && error.includes('nom complet') ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
                            `}
                        />
                        {error && error.includes('nom complet') && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>
                    <div>
                        <label htmlFor="edit-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="edit-email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`
                                block w-full px-3 py-2
                                bg-white dark:bg-slate-900/50
                                border rounded-md shadow-sm
                                placeholder-slate-400 dark:placeholder-slate-500
                                focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                                sm:text-sm
                                ${error && error.includes('email') ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
                            `}
                        />
                        {error && error.includes('email') && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>
                    <div>
                        <label htmlFor="edit-region" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Région
                        </label>
                        <input
                            type="text"
                            id="edit-region"
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-adress" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Adresse
                        </label>
                        <textarea
                            id="edit-adress"
                            name="adress"
                            value={formData.adress}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            rows="2"
                        ></textarea>
                    </div>
                    <div className="flex items-center pt-2">
                        <input
                            type="checkbox"
                            id="edit-actif"
                            name="actif"
                            checked={formData.actif}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-500 dark:bg-slate-700 dark:checked:bg-blue-600 dark:checked:border-transparent"
                        />
                        <label htmlFor="edit-actif" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                            Actif
                        </label>
                    </div>
                    <div className="pt-6 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onCancel} className="btn btn-secondary">
                            <XCircle size={16} className="mr-1.5" /> Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={16} className="mr-1.5" /> Confirmer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClientModal;