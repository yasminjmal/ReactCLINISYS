import React, { useState, useEffect } from 'react';
import { Package as PackageIconDetails, Users, Save, XCircle, Edit3, Trash2, AlertTriangle, ArrowLeft, ChevronDown as ChevronDownDetails } from 'lucide-react';

const ModuleDetailsPage = ({ module: initialModule, availableEquipes = [], onUpdateModule, onDeleteModuleRequest, onCancelToList, adminName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialModule);
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (initialModule) {
        setFormData({...initialModule}); 
    }
  }, [initialModule]);

  if (!initialModule || !formData) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400">Module non trouvé ou en cours de chargement...</div>;
  }
  
  const safeAvailableEquipes = Array.isArray(availableEquipes) ? availableEquipes : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
  };
  
  const validateEditForm = () => {
    const newErrors = {};
    if (!formData.nom?.trim()) newErrors.nom = "Le nom du module est requis.";
    // equipeId est optionnel ici
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmEdit = () => {
    if (validateEditForm()) {
      // S'assurer que equipeId est null si la chaîne est vide (pour "Non assignée")
      const dataToUpdate = {
        ...formData,
        equipeId: formData.equipeId || null,
      };
      onUpdateModule(dataToUpdate);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(initialModule);
    setErrors({});
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmActualDelete = () => {
    onDeleteModuleRequest(initialModule.id, initialModule.nom);
    setShowDeleteConfirm(false); 
  };
  
  const equipeActuelleNom = safeAvailableEquipes.find(eq => eq.id === formData.equipeId)?.nom;

  return (
    <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-950 min-h-full flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-2xl relative">
        <button 
            onClick={onCancelToList}
            className="absolute top-3 left-3 md:top-4 md:left-4 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Retourner à la liste des modules"
        >
            <ArrowLeft size={20} />
        </button>

        <div className="absolute top-3 right-3 md:top-4 md:right-4 flex space-x-2">
          {!isEditing && !showDeleteConfirm && (
            <>
              <button onClick={() => setIsEditing(true)} className="p-2 rounded-full text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-700/50 transition-all duration-200 hover:scale-110" title="Modifier">
                <Edit3 size={20}/>
              </button>
              <button onClick={handleDeleteClick} className="p-2 rounded-full text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700/50 transition-all duration-200 hover:scale-110" title="Supprimer">
                <Trash2 size={20}/>
              </button>
            </>
          )}
        </div>

        <div className="text-center mb-4 md:mb-6 pt-8">
          <PackageIconDetails className="h-10 w-10 md:h-12 md:w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {isEditing ? 
              <input type="text" name="nom" value={formData.nom || ''} onChange={handleInputChange} className={`form-input py-1 text-center text-xl md:text-2xl font-bold w-2/3 mx-auto ${errors.nom ? 'border-red-500' : ''}`} />
             : formData.nom}
          </h1>
           {isEditing && errors.nom && <p className="form-error-text text-center">{errors.nom}</p>}
           <p className="text-xs text-slate-500 dark:text-slate-400">ID: {formData.id}</p>
        </div>

        {showDeleteConfirm && ( <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-sm transform transition-all animate-slide-in-up"><AlertTriangle size={40} className="text-red-500 mx-auto mb-4" /><h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Confirmer la suppression</h3><p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Voulez-vous vraiment supprimer le module {initialModule.nom} ?</p><div className="flex justify-center space-x-3"><button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary px-4 py-2 transform hover:scale-105 active:scale-95">Annuler</button><button onClick={confirmActualDelete} className="btn btn-danger px-4 py-2 transform hover:scale-105 active:scale-95">Supprimer</button></div></div></div>)}

        <div className="space-y-3 md:space-y-4">
            <div>
                <label htmlFor="equipeIdModuleDetails" className="form-label text-xs">Équipe d'appartenance</label>
                {isEditing ? (
                    <div className="relative">
                        <Users size={16} className="form-icon left-3" />
                        <select name="equipeId" id="equipeIdModuleDetails" value={formData.equipeId || ''} onChange={handleInputChange} className={`form-select-icon appearance-none py-1.5 text-sm ${errors.equipeId ? 'border-red-500' : ''}`}>
                            <option value="">Non assignée</option>
                            {safeAvailableEquipes.map(eq => (
                            <option key={eq.id} value={eq.id}>{eq.nom}</option>
                            ))}
                        </select>
                        <ChevronDownDetails size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/>
                    </div>
                ) : (
                    <div className="form-icon-wrapper">
                        <Users size={16} className="form-icon" />
                        <input type="text" value={equipeActuelleNom || 'Non assignée'} readOnly className="form-input-icon py-1.5 text-sm bg-slate-100 dark:bg-slate-700 cursor-default" />
                    </div>
                )}
                {isEditing && errors.equipeId && <p className="form-error-text">{errors.equipeId}</p>}
            </div>
            
            <div>
                <label htmlFor="nbTicketsAssignesDetails" className="form-label text-xs">Nombre de tickets assignés</label>
                <div className="form-icon-wrapper">
                    <input 
                        type="number" 
                        name="nbTicketsAssignes" 
                        id="nbTicketsAssignesDetails" 
                        value={formData.nbTicketsAssignes || 0} 
                        onChange={handleInputChange} 
                        readOnly // Non modifiable
                        className="form-input py-1.5 text-sm bg-slate-100 dark:bg-slate-700 cursor-default"
                    />
                </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="form-label text-xs">Créé par</label>
                        <input type="text" value={formData.userCreation || adminName || 'N/A'} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-default py-1.5 text-sm" />
                    </div>
                    <div>
                        <label className="form-label text-xs">Date de création</label>
                        <input type="text" value={formData.dateCreation ? new Date(formData.dateCreation).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-default py-1.5 text-sm" />
                    </div>
                </div>
            </div>
        </div>

        {isEditing && (
            <div className="pt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3">
                    <XCircle size={16} className="mr-1.5 transition-transform duration-300 group-hover:rotate-12" /> Annuler
                </button>
                <button type="button" onClick={handleConfirmEdit} className="btn btn-primary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3">
                    <Save size={16} className="mr-1.5 transition-transform duration-300 group-hover:scale-110" /> Confirmer Modifications
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
export default ModuleDetailsPage; 