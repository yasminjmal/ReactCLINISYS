import React, { useState } from 'react';
import { Save, XCircle, ArrowLeft, Users as UsersIcon } from 'lucide-react'; // Ajout UsersIcon pour le select

const AjouterEquipePage = ({ onAddEquipe, onCancel }) => {
    const [designation, setDesignation] = useState('');
    const [actif, setActif] = useState(true);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!designation.trim()) {
            newErrors.designation = "La désignation est requise.";
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        onAddEquipe({ designation, actif });
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
                    Retour à la liste des équipes
                </button>

                {/* Conteneur principal du formulaire */}
                <div className="bg-white dark:bg-slate-800/80 p-8 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Créer une nouvelle Équipe</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="designation" className="form-label">Désignation de l'équipe <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="designation"
                                value={designation}
                                onChange={(e) => { setDesignation(e.target.value); setErrors(prev => ({...prev, designation: null})); }}
                                className={`form-input ${errors.designation ? 'border-red-500' : ''}`}
                                placeholder="Ex: Équipe Alpha"
                                required
                            />
                            {errors.designation && <p className="form-error-text">{errors.designation}</p>}
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="actif"
                                    checked={actif}
                                    onChange={(e) => setActif(e.target.checked)}
                                    className="form-checkbox"
                                />
                                <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Équipe active
                                </span>
                            </label>
                        </div>

                        <div className="pt-6 flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-700">
                            <button type="button" onClick={onCancel} className="btn btn-secondary">
                                <XCircle size={16} className="mr-2"/> Annuler
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <Save size={16} className="mr-2"/> Créer l'équipe
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AjouterEquipePage;