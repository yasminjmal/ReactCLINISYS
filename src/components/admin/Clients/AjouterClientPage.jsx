import React, { useState } from 'react';
import { Save, XCircle, ArrowLeft } from 'lucide-react'; // Ajout de ArrowLeft

const AjouterClientPage = ({ onAddClient, onCancel }) => {
    const [formData, setFormData] = useState({
        nomComplet: '',
        adress: '',
        email: '',
        region: '',
        actif: true,
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <div className="max-w-2xl mx-auto">
                {/* Bouton de retour à la liste */}
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 font-semibold mb-6 transition-colors duration-200"
                >
                    <ArrowLeft size={16} />
                    Retour à la liste des clients
                </button>

                {/* Conteneur principal du formulaire */}
                <div className="bg-white dark:bg-slate-800/80 p-8 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Ajouter un nouveau Client</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="nomComplet" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom complet <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="nomComplet"
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
                                    ${errors.nomComplet ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
                                `}
                                placeholder="Ex: Hôpital Central"
                                required
                            />
                            {errors.nomComplet && <p className="text-red-500 text-xs mt-1">{errors.nomComplet}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                            <input
                                type="email"
                                id="email"
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
                                    ${errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
                                `}
                                placeholder="Ex: contact@hopital.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="region" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Région</label>
                            <input
                                type="text"
                                id="region"
                                name="region"
                                value={formData.region}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Ex: Grand Tunis"
                            />
                        </div>
                        <div>
                            <label htmlFor="adress" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adresse</label>
                            <textarea
                                id="adress"
                                name="adress"
                                value={formData.adress}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
                                placeholder="Ex: 123 Rue de la Santé, Tunis"
                                rows="2"
                            ></textarea>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="actif"
                                    name="actif"
                                    checked={formData.actif}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-500 dark:bg-slate-700 dark:checked:bg-blue-600 dark:checked:border-transparent"
                                />
                                <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">Client actif</span>
                            </label>
                        </div>

                        <div className="pt-6 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                            >
                                <XCircle size={16} className="mr-2"/>
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                            >
                                <Save size={16} className="mr-2"/>
                                Créer le client
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AjouterClientPage;