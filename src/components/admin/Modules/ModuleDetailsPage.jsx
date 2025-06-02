import React, { useState, useEffect } from 'react';
import { Package as PackageIconDetails, Users, Save, XCircle, Edit3, Trash2, AlertTriangle, ArrowLeft, ChevronDown } from 'lucide-react';

const ModuleDetailsPage = ({ module: initialModule, availableEquipes = [], onUpdateModule, onDeleteModuleRequest, onCancelToList, adminName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (initialModule) {
      setFormData({
        id: initialModule.id,
        designation: initialModule.designation,
        equipeId: initialModule.idEquipe?.id || '',
        nbTicketsAssignes: initialModule.nbTicketsAssignes || 0,
        userCreation: initialModule.userCreation,
        dateCreation: initialModule.dateCreation,
      });
    }
  }, [initialModule]);

  const handleConfirmEdit = () => {
    onUpdateModule({
      id: formData.id,
      designation: formData.designation,
      idEquipe: formData.equipeId ? { id: parseInt(formData.equipeId, 10) } : null,
    });
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    // Reset form to initial state
    setFormData({
        id: initialModule.id,
        designation: initialModule.designation,
        equipeId: initialModule.idEquipe?.id || '',
        nbTicketsAssignes: initialModule.nbTicketsAssignes || 0,
        userCreation: initialModule.userCreation,
        dateCreation: initialModule.dateCreation,
      });
    setIsEditing(false);
  };

  const confirmActualDelete = () => {
    onDeleteModuleRequest(initialModule.id, initialModule.designation);
  };
  
  const equipeActuelleNom = availableEquipes.find(eq => eq.id === formData.equipeId)?.designation;

  if (!formData.id) return <div>Chargement...</div>;

  return (
    <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-950 min-h-full flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl relative">
        <button onClick={onCancelToList} className="absolute top-4 left-4 text-slate-500" title="Retourner"><ArrowLeft size={20} /></button>
        <div className="absolute top-4 right-4 flex space-x-2">
          {!isEditing && <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-sky-100" title="Modifier"><Edit3 size={20}/></button>}
          {!isEditing && <button onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-full hover:bg-red-100" title="Supprimer"><Trash2 size={20} className="text-red-500"/></button>}
        </div>

        <div className="text-center mb-6 pt-8">
          <PackageIconDetails className="h-12 w-12 text-indigo-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-slate-800">
            {isEditing ? <input type="text" name="designation" value={formData.designation || ''} onChange={(e) => setFormData({...formData, designation: e.target.value})} className="form-input text-center text-2xl font-bold w-2/3 mx-auto" /> : formData.designation}
          </h1>
          <p className="text-xs text-slate-500">ID: {formData.id}</p>
        </div>

        {showDeleteConfirm && ( <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-lg text-center"><AlertTriangle size={40} className="text-red-500 mx-auto mb-4" /><h3>Confirmer la suppression</h3><p>Supprimer le module {initialModule.designation} ?</p><div className="flex justify-center space-x-3 mt-6"><button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">Annuler</button><button onClick={confirmActualDelete} className="btn btn-danger">Supprimer</button></div></div></div>)}

        <div className="space-y-4">
            <div>
                <label htmlFor="equipeId" className="form-label text-xs">Équipe d'appartenance</label>
                {isEditing ? (
                    <div className="relative">
                        <Users size={16} className="form-icon left-3" />
                        <select name="equipeId" id="equipeId" value={formData.equipeId} onChange={(e) => setFormData({...formData, equipeId: e.target.value})} className="form-select-icon appearance-none">
                            <option value="">Non assignée</option>
                            {availableEquipes.map(eq => <option key={eq.id} value={eq.id}>{eq.designation}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
                    </div>
                ) : (
                    <div className="form-icon-wrapper">
                        <Users size={16} className="form-icon" />
                        <input type="text" value={equipeActuelleNom || 'Non assignée'} readOnly className="form-input-icon bg-slate-100 cursor-default" />
                    </div>
                )}
            </div>
            
            <div>
                <label className="form-label text-xs">Nombre de tickets assignés</label>
                <input type="number" value={formData.nbTicketsAssignes} readOnly className="form-input bg-slate-100 cursor-default" />
            </div>

            <div className="pt-3 border-t">
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="form-label text-xs">Créé par</label>
                        <input type="text" value={formData.userCreation || adminName || 'N/A'} readOnly className="form-input bg-slate-100" />
                    </div>
                    <div>
                        <label className="form-label text-xs">Date de création</label>
                        <input type="text" value={formData.dateCreation ? new Date(formData.dateCreation).toLocaleDateString('fr-FR') : 'N/A'} readOnly className="form-input bg-slate-100" />
                    </div>
                </div>
            </div>
        </div>

        {isEditing && (
            <div className="pt-6 flex justify-end space-x-2">
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary group"><XCircle size={16} className="mr-1.5"/> Annuler</button>
                <button type="button" onClick={handleConfirmEdit} className="btn btn-primary group"><Save size={16} className="mr-1.5"/> Confirmer</button>
            </div>
        )}
      </div>
    </div>
  );
};
export default ModuleDetailsPage;