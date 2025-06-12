import React, { useState } from 'react';
import { PackagePlus, Package as PackageIconForm, Users, Save, XCircle, ArrowLeft, ChevronDown } from 'lucide-react';

const AjouterModulePage = ({ onAddModule, onCancel, availableEquipes = [], adminName }) => {
  const [nomModule, setNomModule] = useState('');
  const [equipeId, setEquipeId] = useState(''); // Peut être vide si non obligatoire
  const [errors, setErrors] = useState({});
  
  const safeAvailableEquipes = Array.isArray(availableEquipes) ? availableEquipes : [];

  const validateForm = () => {
    const newErrors = {};
    if (!nomModule.trim()) newErrors.nomModule = "Le nom du module est requis.";
    // equipeId n'est plus requis ici car optionnel
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const newModule = {
        // id: `mod_${Date.now()}`, // L'ID sera généré dans InterfaceAdmin
        nom: nomModule,
        equipeId: equipeId || null, 
        nbTicketsAssignes: 0,
        userCreation: adminName,
        dateCreation: new Date().toISOString(),
      };
      onAddModule(newModule);
    }
  };
  
  const today = new Date().toLocaleDateString('fr-CA');

  return (
    <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-950 min-h-full flex justify-center items-start">
      <div className="w-full max-w-xl bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-2xl">
        <button 
            onClick={onCancel} 
            className="absolute top-2 left-2 md:top-4 md:left-4 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Retourner à la liste"
        >
            <ArrowLeft size={20} />
        </button>
        <div className="text-center mb-4 md:mb-6">
          <PackagePlus className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-1.5" />
          <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">
            Ajouter un Nouveau Module
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div>
            <label htmlFor="nomModule" className="form-label text-xs">Nom du module</label>
            <div className="form-icon-wrapper">
              <PackageIconForm size={16} className="form-icon" />
              <input type="text" name="nomModule" id="nomModule" value={nomModule} onChange={(e) => setNomModule(e.target.value)} className={`form-input-icon py-1.5 text-sm ${errors.nomModule ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="Ex: Gestion des stocks" />
            </div>
            {errors.nomModule && <p className="form-error-text">{errors.nomModule}</p>}
          </div>

          <div>
            <label htmlFor="equipeId" className="form-label text-xs">Équipe d'appartenance (Optionnel)</label>
            <div className="relative">
              <Users size={16} className="form-icon left-3" />
              <select name="equipeId" id="equipeId" value={equipeId} onChange={(e) => setEquipeId(e.target.value)} className={`form-select-icon appearance-none py-1.5 text-sm ${errors.equipeId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                <option value="">Non assignée</option>
                {safeAvailableEquipes.map(equipe => (
                  <option key={equipe.id} value={equipe.id}>{equipe.nom}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/>
            </div>
            {errors.equipeId && <p className="form-error-text">{errors.equipeId}</p>}
          </div>
          
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="userCreationModule" className="form-label text-xs">Créé par</label>
                <input type="text" name="userCreationModule" id="userCreationModule" value={adminName} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-not-allowed py-1.5 text-sm" />
              </div>
              <div>
                <label htmlFor="dateCreationModule" className="form-label text-xs">Date de création</label>
                <input type="date" name="dateCreationModule" id="dateCreationModule" value={today} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-not-allowed py-1.5 text-sm" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <button type="button" onClick={onCancel} className="btn btn-secondary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3">
              <XCircle size={16} className="mr-1.5 transition-transform duration-300 group-hover:rotate-12" /> Annuler
            </button>
            <button type="submit" className="btn btn-primary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3">
              <Save size={16} className="mr-1.5 transition-transform duration-300 group-hover:scale-110" /> Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AjouterModulePage;
