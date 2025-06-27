import React, { useState } from 'react';
import { ArrowLeft, Save, XCircle } from 'lucide-react';

const AjouterPostePage = ({ onAddPoste, onCancel }) => {
  const [designation, setDesignation] = useState('');
  const [actif, setActif] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!designation.trim()) {
      setError('La désignation est requise.');
      return;
    }
    onAddPoste({ designation, actif });
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
                Retour à la liste des postes
            </button>

            {/* Conteneur principal du formulaire */}
            <div className="bg-white dark:bg-slate-800/80 p-8 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Créer un nouveau poste</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Champ Désignation du poste */}
                    <div>
                        <label htmlFor="designation" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Désignation du poste
                        </label>
                        <input
                            type="text"
                            id="designation"
                            value={designation}
                            onChange={(e) => { setDesignation(e.target.value); setError(''); }}
                            className={`
                                block w-full px-3 py-2
                                bg-white dark:bg-slate-900/50
                                border rounded-md shadow-sm
                                placeholder-slate-400 dark:placeholder-slate-500
                                focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                                sm:text-sm
                                ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
                            `}
                            placeholder="Ex: Ingénieur Logiciel Senior"
                        />
                        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>

                    {/* Champ Actif (Checkbox) */}
                    <div className="pt-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={actif}
                                onChange={(e) => setActif(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-500 dark:bg-slate-700 dark:checked:bg-blue-600 dark:checked:border-transparent"
                            />
                            <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                                Rendre ce poste actif dès sa création
                            </span>
                        </label>
                    </div>

                    {/* Boutons d'action */}
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
                            Enregistrer le poste
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default AjouterPostePage;
