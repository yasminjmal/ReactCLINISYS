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
            <button onClick={onCancel} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 font-semibold mb-6">
                <ArrowLeft size={16} />
                Retour à la liste des postes
            </button>
            <div className="bg-white dark:bg-slate-800/80 p-8 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Créer un nouveau poste</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="designation" className="form-label font-semibold">Désignation du poste</label>
                        <input
                            type="text"
                            id="designation"
                            value={designation}
                            onChange={(e) => { setDesignation(e.target.value); setError(''); }}
                            className={`form-input mt-1 ${error ? 'border-red-500' : ''}`}
                            placeholder="Ex: Ingénieur Logiciel Senior"
                        />
                        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>
                    <div className="pt-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={actif}
                                onChange={(e) => setActif(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">Rendre ce poste actif dès sa création</span>
                        </label>
                    </div>
                    <div className="pt-6 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onCancel} className="btn btn-secondary">
                            <XCircle size={16} className="mr-2"/>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
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
