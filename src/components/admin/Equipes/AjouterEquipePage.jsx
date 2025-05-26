import React, { useState } from 'react';
import { 
    Users as UsersIconForm, UserCheck, UserPlus as UserPlusIconForm, 
    Save, XCircle, ArrowLeft, ChevronDown // ChevronDown est maintenant importé
} from 'lucide-react';

// Assurez-vous que ce chemin est correct si vous utilisez une image par défaut pour les membres
import defaultProfilePicImport_AjouterEquipe from '../../../assets/images/default-profile.png';


const AjouterEquipePage = ({ onAddEquipe, onCancel, availableUsers = [], adminName }) => {
  const [nomEquipe, setNomEquipe] = useState('');
  const [chefEquipeId, setChefEquipeId] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [errors, setErrors] = useState({});

  const safeAvailableUsers = Array.isArray(availableUsers) ? availableUsers : [];
  const potentialChefs = safeAvailableUsers.filter(u => u.role === 'chef_equipe' || u.role === 'admin');
  // Exclure le chef sélectionné de la liste des membres potentiels
  const availableMembers = safeAvailableUsers.filter(u => u.id !== chefEquipeId);
  
  const handleMemberSelect = (userId) => {
    setSelectedMemberIds(prev => 
        prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!nomEquipe.trim()) newErrors.nomEquipe = "Le nom de l'équipe est requis.";
    if (!chefEquipeId) newErrors.chefEquipeId = "Un chef d'équipe doit être sélectionné.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const newEquipe = {
        id: `eq_${Date.now()}`,
        nom: nomEquipe,
        chefEquipe: safeAvailableUsers.find(u => u.id === chefEquipeId),
        membres: selectedMemberIds.map(id => safeAvailableUsers.find(u => u.id === id)).filter(Boolean),
        actif: true, // Par défaut, une nouvelle équipe est active
        userCreation: adminName,
        dateCreation: new Date().toISOString(),
      };
      onAddEquipe(newEquipe);
    }
  };
  
  const today = new Date().toLocaleDateString('fr-CA'); // Format YYYY-MM-DD

  return (
    <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-950 min-h-full flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-2xl">
        <button 
            onClick={onCancel} // Ce onCancel vient de InterfaceAdmin et devrait gérer la navigation et le message
            className="absolute top-2 left-2 md:top-4 md:left-4 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Retourner à la liste des équipes"
        >
            <ArrowLeft size={20} />
        </button>
        <div className="text-center mb-4 md:mb-6">
          <UsersIconForm className="h-8 w-8 text-sky-600 dark:text-sky-400 mx-auto mb-1.5" />
          <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">
            Ajouter une Nouvelle Équipe
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {/* Nom de l'équipe */}
          <div>
            <label htmlFor="nomEquipe" className="form-label text-xs">Nom de l'équipe</label>
            <div className="form-icon-wrapper">
              <UsersIconForm size={16} className="form-icon" />
              <input type="text" name="nomEquipe" id="nomEquipe" value={nomEquipe} onChange={(e) => setNomEquipe(e.target.value)} className={`form-input-icon py-1.5 text-sm ${errors.nomEquipe ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="Ex: Équipe Alpha" />
            </div>
            {errors.nomEquipe && <p className="form-error-text">{errors.nomEquipe}</p>}
          </div>

          {/* Chef d'équipe */}
          <div>
            <label htmlFor="chefEquipeId" className="form-label text-xs">Chef d'équipe</label>
            <div className="relative">
              <UserCheck size={16} className="form-icon left-3" />
              <select name="chefEquipeId" id="chefEquipeId" value={chefEquipeId} onChange={(e) => setChefEquipeId(e.target.value)} className={`form-select-icon appearance-none py-1.5 text-sm ${errors.chefEquipeId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                <option value="">Sélectionner un chef d'équipe...</option>
                {potentialChefs.map(user => (
                  <option key={user.id} value={user.id}>{user.prenom} {user.nom}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/>
            </div>
            {errors.chefEquipeId && <p className="form-error-text">{errors.chefEquipeId}</p>}
          </div>
          
          {/* Membres de l'équipe */}
          <div>
            <label className="form-label text-xs mb-1">Membres de l'équipe</label>
            <div className="max-h-40 overflow-y-auto p-2 border rounded-md dark:border-slate-600 space-y-1.5 bg-slate-50 dark:bg-slate-700/50">
                {availableMembers.length > 0 ? availableMembers.map(user => (
                    <label key={user.id} className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-600">
                        <input 
                            type="checkbox"
                            checked={selectedMemberIds.includes(user.id)}
                            onChange={() => handleMemberSelect(user.id)}
                            className="form-checkbox h-3.5 w-3.5"
                        />
                        <img src={user.profileImage || defaultProfilePicImport_AjouterEquipe} alt={user.nom} className="h-5 w-5 rounded-full object-cover"/>
                        <span className="text-xs text-slate-700 dark:text-slate-200">{user.prenom} {user.nom} ({user.poste})</span>
                    </label>
                )) : <p className="text-xs text-slate-500 dark:text-slate-400 italic p-1.5">Aucun membre disponible (ou chef non sélectionné).</p>}
            </div>
            {/* Le bouton + pour ajouter des membres n'est pas implémenté ici pour la simplicité,
                la sélection se fait via les cases à cocher. */}
            {errors.membres && <p className="form-error-text">{errors.membres}</p>}
          </div>

          {/* Infos de création */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="userCreationEquipe" className="form-label text-xs">Créé par</label>
                <input type="text" name="userCreationEquipe" id="userCreationEquipe" value={adminName} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-not-allowed py-1.5 text-sm" />
              </div>
              <div>
                <label htmlFor="dateCreationEquipe" className="form-label text-xs">Date de création</label>
                <input type="date" name="dateCreationEquipe" id="dateCreationEquipe" value={today} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-not-allowed py-1.5 text-sm" />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
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
export default AjouterEquipePage;