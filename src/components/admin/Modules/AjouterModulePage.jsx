import React, { useState } from 'react';
import { PackagePlus, Save, XCircle, ArrowLeft, Users, ChevronDown } from 'lucide-react';

const AjouterModulePage = ({ onAddModule, onCancel, availableEquipes = [] }) => {
  const [designation, setDesignation] = useState('');
  const [idEquipe, setIdEquipe] = useState(''); // Optionnel
  const [actif, setActif] = useState(true); // Nouveau champ, actif par défaut
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    if (!designation.trim()) newErrors.designation = "La désignation est requise.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAddModule({ 
        designation, 
        idEquipe: idEquipe ? parseInt(idEquipe, 10) : null, // Envoie null si aucune équipe n'est sélectionnée
        actif 
      });
    }
  };
  
  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen"> {/* Ajustement du padding et couleur de fond */}
      <div className="max-w-2xl mx-auto">
        {/* Bouton de retour à la liste */}
        <button
            onClick={onCancel}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 font-semibold mb-6 transition-colors duration-200"
        >
            <ArrowLeft size={16} />
            Retour à la liste des modules
        </button>

        {/* Conteneur principal du formulaire */}
        <div className="bg-white dark:bg-slate-800/80 p-8 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700"> {/* Ajustement padding et bordure */}
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Créer un nouveau Module</h1> {/* Ajustement h1 */}

          <form onSubmit={handleSubmit} className="space-y-6"> {/* Ajustement spacing */}
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"> {/* Utilisation de form-label */}
                Nom du module
              </label>
              <input
                type="text"
                name="designation"
                id="designation"
                value={designation}
                onChange={(e) => { setDesignation(e.target.value); setErrors(prev => ({ ...prev, designation: null })); }}
                className={`
                    block w-full px-3 py-2
                    bg-white dark:bg-slate-900/50
                    border rounded-md shadow-sm
                    placeholder-slate-400 dark:placeholder-slate-500
                    focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                    sm:text-sm
                    ${errors.designation ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
                `}
                placeholder="Ex: Gestion des stocks"
              />
              {errors.designation && <p className="text-xs text-red-500 mt-1">{errors.designation}</p>} {/* Utilisation de text-xs mt-1 */}
            </div>

            <div>
              <label htmlFor="idEquipe" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"> {/* Utilisation de form-label */}
                Équipe d'appartenance (Optionnel)
              </label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="idEquipe"
                  id="idEquipe"
                  value={idEquipe}
                  onChange={(e) => setIdEquipe(e.target.value)}
                  className="form-select-icon appearance-none block w-full px-3 py-2 pl-10 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">-- Non assignée --</option>
                  {availableEquipes.map(equipe => (
                    <option key={equipe.id} value={equipe.id}>{equipe.designation}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"/>
              </div>
            </div>
            
            <div className="pt-2"> {/* Ajustement padding */}
              <label className="flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={actif}
                    onChange={(e) => setActif(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-500 dark:bg-slate-700 dark:checked:bg-blue-600 dark:checked:border-transparent" // Styles standardisés
                />
                <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                    Rendre ce module actif dès sa création
                </span>
              </label>
            </div>
            
            <div className="pt-6 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700"> {/* Boutons standardisés */}
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
                    Enregistrer le module
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AjouterModulePage;