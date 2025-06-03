import React, { useState } from 'react';
import { Users as UsersIconForm, UserCheck, Save, XCircle, ArrowLeft, ChevronDown } from 'lucide-react';

const AjouterEquipePage = ({ onAddEquipe, onCancel, availableUsers = [], adminName, isLoading }) => {
  const [formData, setFormData] = useState({
    nomEquipe: '', 
    chefEquipeId: '',
  });
  const [errors, setErrors] = useState({});

  const safeAvailableUsers = Array.isArray(availableUsers) ? availableUsers : [];
  const potentialChefs = safeAvailableUsers.filter(u => u.role === 'Chef_Equipe' || u.role === 'Admin');
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nomEquipe.trim()) newErrors.nomEquipe = "Le nom de l'équipe est requis.";
    if (!formData.chefEquipeId) newErrors.chefEquipeId = "Un chef d'équipe doit être sélectionné.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAddEquipe(formData); 
    }
  };
  
  const today = new Date().toLocaleDateString('fr-CA');

  return (
    <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-950 min-h-full flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-2xl">
        <button onClick={() => onCancel("info", "Ajout d'équipe annulé.")} className="absolute top-2 left-2 md:top-4 md:left-4 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Retourner à la liste des équipes" disabled={isLoading}><ArrowLeft size={20} /></button>
        <div className="text-center mb-4 md:mb-6">
          <UsersIconForm className="h-8 w-8 text-sky-600 dark:text-sky-400 mx-auto mb-1.5" />
          <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">Ajouter une Nouvelle Équipe</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div><label htmlFor="nomEquipe" className="form-label text-xs">Nom de l'équipe</label><div className="form-icon-wrapper"><UsersIconForm size={16} className="form-icon" /><input type="text" name="nomEquipe" id="nomEquipe" value={formData.nomEquipe} onChange={handleInputChange} className={`form-input-icon py-1.5 text-sm ${errors.nomEquipe ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="Ex: Équipe Alpha" /></div>{errors.nomEquipe && <p className="form-error-text">{errors.nomEquipe}</p>}</div>
          <div><label htmlFor="chefEquipeId" className="form-label text-xs">Chef d'équipe</label><div className="relative"><UserCheck size={16} className="form-icon left-3" /><select name="chefEquipeId" id="chefEquipeId" value={formData.chefEquipeId} onChange={handleInputChange} className={`form-select-icon appearance-none py-1.5 text-sm ${errors.chefEquipeId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}><option value="">Sélectionner un chef d'équipe...</option>{potentialChefs.map(user => (<option key={user.id} value={user.id}>{user.prenom} {user.nom}</option>))}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/></div>{errors.chefEquipeId && <p className="form-error-text">{errors.chefEquipeId}</p>}</div>
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700"><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div><label htmlFor="userCreationEquipe" className="form-label text-xs">Créé par</label><input type="text" name="userCreationEquipe" id="userCreationEquipe" value={adminName} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-not-allowed py-1.5 text-sm" /></div><div><label htmlFor="dateCreationEquipe" className="form-label text-xs">Date de création</label><input type="date" name="dateCreationEquipe" id="dateCreationEquipe" value={today} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-not-allowed py-1.5 text-sm" /></div></div></div>
          <div className="pt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2"><button type="button" onClick={() => onCancel("info", "Ajout d'équipe annulé.")} className="btn btn-secondary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3" disabled={isLoading}><XCircle size={16} className="mr-1.5 transition-transform duration-300 group-hover:rotate-12" /> Annuler</button><button type="submit" className="btn btn-primary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3" disabled={isLoading}><Save size={16} className="mr-1.5 transition-transform duration-300 group-hover:scale-110" /> Confirmer</button></div>
        </form>
      </div>
    </div>
  );
};
export default AjouterEquipePage;