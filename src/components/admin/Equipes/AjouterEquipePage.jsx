import React, { useState } from 'react';
import { Save, XCircle } from 'lucide-react';

const AjouterEquipePage = ({ onAddEquipe, onCancel }) => {
    const [designation, setDesignation] = useState('');
    const [actif, setActif] = useState(true); // NEW: State for 'actif' attribute, true by default

    const handleSubmit = (e) => {
        e.preventDefault();
        // Include 'actif' in the object sent to onAddEquipe
        onAddEquipe({ designation, actif }); // MODIFIED
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-full">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-6">Ajouter une nouvelle Équipe</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="designation" className="form-label">Désignation de l'équipe <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="designation"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="form-input"
                            placeholder="Ex: Équipe Alpha"
                            required
                        />
                    </div>

                    {/* NEW: Field for 'actif' attribute */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="actif"
                            checked={actif}
                            onChange={(e) => setActif(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-sky-600 rounded focus:ring-sky-500"
                        />
                        <label htmlFor="actif" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Équipe active
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onCancel} className="btn btn-secondary">
                            <XCircle size={18} className="mr-2"/> Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <Save size={18} className="mr-2"/> Créer l'équipe
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AjouterEquipePage;