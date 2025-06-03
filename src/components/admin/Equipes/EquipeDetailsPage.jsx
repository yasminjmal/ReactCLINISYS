import React, { useState, useEffect } from 'react';
import { Users as UsersIconDetailsPage, User, UserCheck, Save, XCircle, Edit3, Trash2, AlertTriangle, ArrowLeft, CheckCircle as CheckCircleIcon, ChevronDown, PlusCircle, Trash, Briefcase } from 'lucide-react';
import defaultProfilePicImport_EquipeDetails from '../../../assets/images/default-profile.png'; 
import equipePosteUtilisateurService from '../../../services/equipePosteUtilisateurService';

const EquipeDetailsPage = ({ 
    equipe: initialEquipe, 
    availableUsers = [], 
    availablePostes = [],
    onUpdateEquipe, 
    onDeleteEquipeRequest, 
    onCancelToList, 
    adminName, 
    isLoading, // USE THIS PROP DIRECTLY
    refreshEquipe,
    setIsLoading, // Prop to control parent's loading state
    setPageMessage,
    setErrorMessage
}) => {
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ utilisateurId: '', posteId: '' });
  const [assignmentError, setAssignmentError] = useState('');

  const currentEPUAssignments = initialEquipe?.equipePosteutilisateurSet || [];

  const potentialChefs = Array.isArray(availableUsers) ? availableUsers.filter(u => u.role && (u.role === 'Chef_Equipe' || u.role === 'Admin')) : [];
  const assignedUserIdsInEPU = currentEPUAssignments.map(epu => epu.utilisateur?.id);
  const potentialNewMembers = Array.isArray(availableUsers) 
    ? availableUsers.filter(u => u.id !== formData.chefEquipe?.id && !assignedUserIdsInEPU.includes(u.id)) 
    : [];
  const posteDropdownOptions = [ { value: '', label: 'Sélectionner un poste...' }, ...(Array.isArray(availablePostes) ? availablePostes.map(p => ({ value: p.id, label: p.designation })) : [])];

  useEffect(() => {
    if (initialEquipe) {
      setFormData({
        id: initialEquipe.id,
        designation: initialEquipe.designation || '',
        chefEquipe: initialEquipe.chefEquipe || null,
        userCreation: initialEquipe.userCreation,
        dateCreation: initialEquipe.dateCreation,
        actif: initialEquipe.actif === undefined ? true : initialEquipe.actif,
      });
      setErrors({});
      setNewAssignment({ utilisateurId: '', posteId: '' });
      setAssignmentError('');
    }
  }, [initialEquipe]);

  if (!initialEquipe || !formData.id) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400">Chargement des détails ou équipe non trouvée...</div>;
  }

  const handleInputChange = (e) => { 
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
  };
  const handleChefEquipeChange = (e) => {
    const selectedChefId = e.target.value;
    const selectedChefObject = availableUsers.find(u => u.id === parseInt(selectedChefId,10)) || null;
    setFormData(prev => ({ ...prev, chefEquipe: selectedChefObject }));
    if (errors.chefEquipe) setErrors(prev => ({...prev, chefEquipe: null}));
  };

  const validateEditForm = () => { 
    const newErrors = {};
    if (!formData.designation?.trim()) newErrors.designation = "Le nom de l'équipe est requis.";
    if (!formData.chefEquipe?.id) newErrors.chefEquipe = "Un chef d'équipe doit être sélectionné.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmEditCoreEquipe = () => {
    if (validateEditForm()) {
      const equipePayloadToUpdate = {
          id: formData.id,
          designation: formData.designation,
          chefEquipe: formData.chefEquipe ? { id: formData.chefEquipe.id } : null,
          actif: formData.actif
      };
      onUpdateEquipe(initialEquipe.id, equipePayloadToUpdate); 
    }
  };
  const handleCancelEdit = () => { 
    setIsEditing(false); 
    if (initialEquipe) {
      setFormData({
        id: initialEquipe.id,
        designation: initialEquipe.designation || '',
        chefEquipe: initialEquipe.chefEquipe || null,
        userCreation: initialEquipe.userCreation,
        dateCreation: initialEquipe.dateCreation,
        actif: initialEquipe.actif === undefined ? true : initialEquipe.actif,
      });
    }
    setErrors({});
    setNewAssignment({ utilisateurId: '', posteId: '' });
    setAssignmentError('');
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const confirmActualDelete = () => { setShowDeleteConfirm(false); onDeleteEquipeRequest(initialEquipe.id, initialEquipe.designation);};

  const handleAddNewMemberAssignment = async () => {
    if (!newAssignment.utilisateurId || !newAssignment.posteId) {
        setAssignmentError("Veuillez sélectionner un utilisateur et un poste.");
        return;
    }
    setAssignmentError('');
    setIsLoading(true);
    try {
        await equipePosteUtilisateurService.createAssignment({
            idEquipe: initialEquipe.id,
            idUtilisateur: parseInt(newAssignment.utilisateurId, 10),
            idPoste: parseInt(newAssignment.posteId, 10)
        });
        setPageMessage({ type: 'success', text: 'Membre assigné au poste avec succès.' });
        setNewAssignment({ utilisateurId: '', posteId: ''}); 
        if(refreshEquipe) refreshEquipe(); 
    } catch (err) {
        console.error("Error adding member assignment:", err.response || err);
        setErrorMessage(err.response?.data?.message || "Erreur: L'utilisateur est peut-être déjà assigné à ce poste dans cette équipe.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleRemoveMemberAssignment = async (epuAssignment) => {
    const { utilisateur, poste } = epuAssignment;
    if (!utilisateur || !poste || !utilisateur.id || !poste.id) {
        setErrorMessage("Données d'assignation invalides pour la suppression.");
        return;
    }
    if (window.confirm(`Supprimer ${utilisateur.prenom} ${utilisateur.nom} du poste "${poste.designation}" dans cette équipe ?`)) {
        setIsLoading(true);
        try {
            await equipePosteUtilisateurService.deleteAssignment(poste.id, utilisateur.id, initialEquipe.id);
            setPageMessage({ type: 'info', text: 'Assignation membre/poste supprimée.' });
            if(refreshEquipe) refreshEquipe();
        } catch (err) {
            console.error("Error removing member assignment:", err.response || err);
            setErrorMessage(err.response?.data?.message || "Erreur lors de la suppression.");
        } finally {
            setIsLoading(false);
        }
    }
  };

return (
    <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-950 min-h-full flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-2xl relative">
        <button 
            onClick={onCancelToList} 
            className="absolute top-3 left-3 md:top-4 md:left-4 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Retourner à la liste des équipes" 
            disabled={isLoading}
        >
            <ArrowLeft size={20} />
        </button>

        <div className="absolute top-3 right-3 md:top-4 md:right-4 flex space-x-2">
          {!isEditing && !showDeleteConfirm && (
            <>
              <button onClick={() => setIsEditing(true)} className="p-2 rounded-full text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-700/50 transition-all duration-200 hover:scale-110" title="Modifier" disabled={isLoading}><Edit3 size={20}/></button>
              <button onClick={handleDeleteClick} className="p-2 rounded-full text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700/50 transition-all duration-200 hover:scale-110" title="Supprimer" disabled={isLoading}><Trash2 size={20}/></button>
            </>
          )}
        </div>

        <div className="text-center mb-4 md:mb-6 pt-8">
          <UsersIconDetailsPage className="h-10 w-10 md:h-12 md:w-12 text-sky-600 dark:text-sky-400 mx-auto mb-2" />
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {isEditing ? 
              <input type="text" name="designation" value={formData.designation || ''} onChange={handleInputChange} className={`form-input py-1 text-center text-xl md:text-2xl font-bold w-2/3 mx-auto ${errors.designation ? 'border-red-500' : ''}`} /> 
             : formData.designation}
          </h1>
          {isEditing && errors.designation && <p className="form-error-text text-center">{errors.designation}</p>}
        </div>

        {showDeleteConfirm && ( 
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-sm transform transition-all animate-slide-in-up">
                    <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Confirmer la suppression</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Voulez-vous vraiment supprimer l'équipe {initialEquipe.designation} ?</p>
                    <div className="flex justify-center space-x-3">
                        <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary px-4 py-2" disabled={isLoading}>Annuler</button>
                        <button onClick={confirmActualDelete} className="btn btn-danger px-4 py-2" disabled={isLoading}>Supprimer</button>
                    </div>
                </div>
            </div>
        )}

        <div className="space-y-3 md:space-y-4">
            <div>
                <label htmlFor="chefEquipeDetailsPage" className="form-label text-xs">Chef d'équipe</label>
                {isEditing ? (
                    <div className="relative">
                        <UserCheck size={16} className="form-icon left-3" />
                        <select name="chefEquipeId" id="chefEquipeDetailsPage" value={formData.chefEquipe?.id || ''} onChange={handleChefEquipeChange} className={`form-select-icon appearance-none py-1.5 text-sm ${errors.chefEquipe ? 'border-red-500' : ''}`}>
                            <option value="">Sélectionner un chef...</option>
                            {potentialChefs.map(user => (<option key={user.id} value={user.id}>{user.prenom} {user.nom}</option>))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/>
                    </div>
                ) : (
                    <div className="form-icon-wrapper">
                        <UserCheck size={16} className="form-icon" />
                        <input type="text" value={formData.chefEquipe ? `${formData.chefEquipe.prenom} ${formData.chefEquipe.nom}` : 'N/A'} readOnly className="form-input-icon py-1.5 text-sm bg-slate-100 dark:bg-slate-700 cursor-default" />
                    </div>
                )}
                {isEditing && errors.chefEquipe && <p className="form-error-text">{errors.chefEquipe}</p>}
            </div>
            
            <div>
                <label className="form-label text-xs flex items-center mt-2">
                    Équipe Active :
                    {isEditing ? ( 
                        <input 
                            type="checkbox" 
                            name="actif" 
                            checked={!!formData.actif} 
                            onChange={handleInputChange}
                            className="form-checkbox ml-2 h-4 w-4 text-sky-600 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-500 bg-white dark:bg-slate-700"
                        /> 
                    ) : ( 
                        formData.actif ? <CheckCircleIcon size={18} className="ml-2 text-green-500"/> : <XCircle size={18} className="ml-2 text-red-500"/> 
                    )}
                </label>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="form-label text-xs">Créé par</label><input type="text" value={formData.userCreation || adminName || 'N/A'} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-default py-1.5 text-sm" /></div>
                    <div><label className="form-label text-xs">Date de création</label><input type="text" value={formData.dateCreation ? new Date(formData.dateCreation).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-default py-1.5 text-sm" /></div>
                </div>
            </div>
        </div>
        <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-3">Membres et Leurs Postes ({currentEPUAssignments.length})</h3>
            {currentEPUAssignments.length === 0 && !isEditing && (<p className="text-sm text-slate-500 dark:text-slate-400 italic">Aucun membre assigné à un poste dans cette équipe.</p>)}
            {currentEPUAssignments.length > 0 && (
                <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
                    {currentEPUAssignments.map((epu) => (
                        <li key={`${epu.utilisateur?.id}-${epu.poste?.id}`}
                            className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/30 rounded-md text-sm">
                            <div className="flex items-center space-x-2">
                                <img 
                                    src={epu.utilisateur?.profileImage || (epu.utilisateur?.photo ? `data:image/jpeg;base64,${epu.utilisateur.photo}`: defaultProfilePicImport_EquipeDetails)} 
                                    alt={epu.utilisateur?.nom || 'membre'} 
                                    className="h-6 w-6 rounded-full object-cover"
                                    onError={(e) => { e.currentTarget.src = defaultProfilePicImport_EquipeDetails; }}
                                />
                                <span className="font-medium text-slate-700 dark:text-slate-200">
                                    {epu.utilisateur?.prenom || ''} {epu.utilisateur?.nom || ''}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400">comme</span>
                                <span className="text-slate-600 dark:text-slate-300">
                                    {epu.poste?.designation || 'Poste Inconnu'}
                                </span>
                            </div>
                            {isEditing && (
                                <button 
                                    onClick={() => handleRemoveMemberAssignment(epu)} 
                                    className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400" 
                                    title="Retirer de l'équipe/poste" 
                                    disabled={isLoading}
                                >
                                    <Trash size={16} />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {isEditing && (
                <div className="p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg space-y-3 mt-4">
                    <h4 className="text-md font-semibold text-slate-600 dark:text-slate-300">Ajouter Membre/Poste</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <div className="sm:col-span-1">
                            <label htmlFor="newAssignmentUserId" className="form-label text-xs">Utilisateur</label>
                            <div className="relative">
                                <User size={16} className="form-icon left-3" />
                                <select 
                                    name="utilisateurId" 
                                    id="newAssignmentUserId" 
                                    value={newAssignment.utilisateurId} 
                                    onChange={(e) => setNewAssignment(p => ({...p, utilisateurId: e.target.value}))} 
                                    className={`form-select-icon appearance-none py-1.5 text-sm ${assignmentError && !newAssignment.utilisateurId ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Sélectionner utilisateur...</option>
                                    {potentialNewMembers.map(user => (
                                        <option key={user.id} value={user.id}>{user.prenom} {user.nom}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/>
                            </div>
                        </div>
                        <div className="sm:col-span-1">
                            <label htmlFor="newAssignmentPosteIdEquipe" className="form-label text-xs">Poste</label>
                            <div className="relative">
                                <Briefcase size={16} className="form-icon left-3" />
                                <select 
                                    name="posteId" 
                                    id="newAssignmentPosteIdEquipe" 
                                    value={newAssignment.posteId} 
                                    onChange={(e) => setNewAssignment(p => ({...p, posteId: e.target.value}))} 
                                    className={`form-select-icon appearance-none py-1.5 text-sm ${assignmentError && !newAssignment.posteId ? 'border-red-500' : ''}`}
                                >
                                    {posteDropdownOptions.map(opt => <option key={opt.value} value={opt.value} disabled={opt.value === ''}>{opt.label}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/>
                            </div>
                        </div>
                        <div className="sm:col-span-1">
                            <button 
                                type="button" 
                                onClick={handleAddNewMemberAssignment} 
                                className="btn btn-secondary-outline btn-sm w-full group" 
                                disabled={isLoading}
                            >
                                <PlusCircle size={16} className="mr-1.5"/>Assigner
                            </button>
                        </div>
                    </div>
                    {assignmentError && <p className="form-error-text text-xs">{assignmentError}</p>}
                </div>
            )}
        </div>

        {isEditing && ( 
            <div className="pt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3" disabled={isLoading}><XCircle size={16} className="mr-1.5 transition-transform duration-300 group-hover:rotate-12" /> Annuler</button>
                <button type="button" onClick={handleConfirmEditCoreEquipe} className="btn btn-primary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3" disabled={isLoading}><Save size={16} className="mr-1.5 transition-transform duration-300 group-hover:scale-110" /> Enregistrer</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default EquipeDetailsPage;