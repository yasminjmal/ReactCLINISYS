import React, { useState } from 'react';
import { PackagePlus, Package as PackageIconForm, Users, Save, XCircle, ArrowLeft, ChevronDown } from 'lucide-react';

const AjouterModulePage = ({ onAddModule, onCancel, availableEquipes = [], adminName }) => {
  const [designation, setDesignation] = useState('');
  const [equipeId, setEquipeId] = useState('');
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    if (!designation.trim()) newErrors.designation = "La désignation du module est requise.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAddModule({
        designation,
        idEquipe: equipeId ? { id: parseInt(equipeId, 10) } : null,
      });
    }
  };
  
  const today = new Date().toLocaleDateString('fr-CA');

  return (
    <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-950 min-h-full flex justify-center items-start">
      <div className="w-full max-w-xl bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-2xl">
        <button onClick={onCancel} className="absolute top-2 left-2 text-slate-500" title="Retourner"><ArrowLeft size={20} /></button>
        <div className="text-center mb-6">
          <PackagePlus className="h-8 w-8 text-indigo-600 mx-auto mb-1.5" />
          <h1 className="text-xl font-bold text-slate-800">Ajouter un Nouveau Module</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="designation" className="form-label text-xs">Désignation du module</label>
            <div className="form-icon-wrapper">
              <PackageIconForm size={16} className="form-icon" />
              <input type="text" name="designation" id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} className={`form-input-icon py-1.5 text-sm ${errors.designation ? 'border-red-500' : ''}`} placeholder="Ex: Gestion des stocks" />
            </div>
            {errors.designation && <p className="form-error-text">{errors.designation}</p>}
          </div>

          <div>
            <label htmlFor="equipeId" className="form-label text-xs">Équipe d'appartenance (Optionnel)</label>
            <div className="relative">
              <Users size={16} className="form-icon left-3" />
              <select name="equipeId" id="equipeId" value={equipeId} onChange={(e) => setEquipeId(e.target.value)} className={`form-select-icon appearance-none py-1.5 text-sm`}>
                <option value="">Non assignée</option>
                {availableEquipes.map(equipe => (
                  <option key={equipe.id} value={equipe.id}>{equipe.designation}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="grid grid-cols-2 gap-3">
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

          <div className="pt-4 flex justify-end space-x-2">
            <button type="button" onClick={onCancel} className="btn btn-secondary group"><XCircle size={16} className="mr-1.5"/> Annuler</button>
            <button type="submit" className="btn btn-primary group"><Save size={16} className="mr-1.5"/> Confirmer</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AjouterModulePage;