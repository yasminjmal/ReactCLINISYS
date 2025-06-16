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
    <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-950 min-h-full flex justify-center items-start">
      <div className="w-full max-w-xl bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 left-4 text-slate-500 hover:text-sky-600 p-1 rounded-full hover:bg-slate-100" title="Retourner">
            <ArrowLeft size={20} />
        </button>
        <div className="text-center mb-6">
          <PackagePlus className="h-8 w-8 text-indigo-600 mx-auto mb-1.5" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ajouter un Nouveau Module</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="designation" className="form-label text-sm">Nom du module</label>
            <input type="text" name="designation" id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} className={`form-input ${errors.designation ? 'border-red-500' : ''}`} placeholder="Ex: Gestion des stocks" />
            {errors.designation && <p className="form-error-text">{errors.designation}</p>}
          </div>

          <div>
            <label htmlFor="idEquipe" className="form-label text-sm">Équipe d'appartenance (Optionnel)</label>
            <div className="relative">
              <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select name="idEquipe" id="idEquipe" value={idEquipe} onChange={(e) => setIdEquipe(e.target.value)} className="form-select-icon appearance-none">
                <option value="">-- Non assignée --</option>
                {availableEquipes.map(equipe => (
                  <option key={equipe.id} value={equipe.id}>{equipe.designation}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"/>
            </div>
          </div>
          
          <div className="flex items-center pt-2">
            <input type="checkbox" id="actif" name="actif" checked={actif} onChange={(e) => setActif(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
            <label htmlFor="actif" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300">Actif</label>
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <button type="button" onClick={onCancel} className="btn btn-secondary"><XCircle size={16} className="mr-1.5"/> Annuler</button>
            <button type="submit" className="btn btn-primary"><Save size={16} className="mr-1.5"/> Confirmer</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AjouterModulePage;
