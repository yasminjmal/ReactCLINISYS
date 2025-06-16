import React, { useState } from 'react';
import { Briefcase as BriefcaseIconForm, Save, XCircle, ArrowLeft } from 'lucide-react';

const AjouterPostePage = ({ onAddPoste, onCancel, adminName }) => {
  const [designation, setDesignation] = useState('');
  
  // 1. AJOUTER L'ÉTAT POUR LE STATUT ACTIF (par défaut à true pour un nouveau poste)
  const [actif, setActif] = useState(true);

  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    if (!designation.trim()) newErrors.designation = "La désignation du poste est requise.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // 3. ENVOYER L'OBJET COMPLET AVEC DESIGNATION ET ACTIF
      onAddPoste({ designation, actif });
    }
  };
  
  const today = new Date().toLocaleDateString('fr-CA');

  return (
    <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-950 min-h-full flex justify-center items-start">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-2xl">
        <button 
            onClick={onCancel} 
            className="absolute top-2 left-2 md:top-4 md:left-4 text-slate-500 hover:text-sky-600 p-1 rounded-full hover:bg-slate-100"
            title="Retourner à la liste"
        >
            <ArrowLeft size={20} />
        </button>
        <div className="text-center mb-4 md:mb-6">
          <BriefcaseIconForm className="h-8 w-8 text-amber-600 mx-auto mb-1.5" />
          <h1 className="text-lg md:text-xl font-bold text-slate-800">
            Ajouter un Nouveau Poste
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {/* Champ Désignation */}
          <div>
            <label htmlFor="designation" className="form-label text-xs">Désignation du poste</label>
            <input 
              type="text" 
              name="designation" 
              id="designation" 
              value={designation} 
              onChange={(e) => setDesignation(e.target.value)} 
              className={`form-input-icon py-1.5 text-sm ${errors.designation ? 'border-red-500' : ''}`} 
              placeholder="Ex: Développeur Principal" 
            />
            {errors.designation && <p className="form-error-text">{errors.designation}</p>}
          </div>

          {/* 2. AJOUTER LA CASE À COCHER POUR LE STATUT ACTIF */}
          <div className="flex items-center pt-2">
            <input
                type="checkbox"
                id="actif"
                name="actif"
                checked={actif}
                onChange={(e) => setActif(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="actif" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Activer ce poste dès sa création
            </label>
          </div>
          
          {/* Champs d'information (lecture seule) */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="form-label text-xs">Créé par</label>
                <input type="text" value={adminName} readOnly className="form-input bg-slate-100 cursor-not-allowed" />
              </div>
              <div>
                <label className="form-label text-xs">Date de création</label>
                <input type="date" value={today} readOnly className="form-input bg-slate-100 cursor-not-allowed" />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="pt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <button type="button" onClick={onCancel} className="btn btn-secondary group">
              <XCircle size={16} className="mr-1.5" /> Annuler
            </button>
            <button type="submit" className="btn btn-primary group">
              <Save size={16} className="mr-1.5" /> Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterPostePage;