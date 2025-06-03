import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Key, Eye, EyeOff, Save, XCircle, Edit3, Trash2, CheckCircle, AlertTriangle, ArrowLeft, ToggleLeft, ToggleRight, ChevronDown, PlusCircle, Trash, Users } from 'lucide-react';
import defaultUserProfileImage_Details from '../../../assets/images/default-profile.png';
import equipePosteUtilisateurService from '../../../services/equipePosteUtilisateurService';

const UserDetailsPage = ({
  user: initialUser,
  onUpdateUser,
  onDeleteUser,
  onCancel,
  availablePostes = [],
  availableEquipes = [],
  adminName,
  isLoading: isParentLoading,
  refreshUser,
  setIsParentLoading,
  setParentPageMessage,
  setParentErrorMessage
}) => {

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ lengthOk: false });

  const [newAssignment, setNewAssignment] = useState({ posteId: '', equipeId: '' });
  const [assignmentError, setAssignmentError] = useState('');
  // currentAssignments will now be directly from initialUser.equipePosteSet
  const currentAssignments = initialUser?.equipePosteSet || [];


  const posteDropdownOptions = [
    { value: '', label: 'Sélectionner un poste...' },
    ...(Array.isArray(availablePostes) ? availablePostes.map(p => ({ value: p.id, label: p.designation })) : [])
  ];
  const equipeDropdownOptions = [
    { value: '', label: 'Sélectionner une équipe...' },
    ...(Array.isArray(availableEquipes) ? availableEquipes.map(e => ({ value: e.id, label: e.designation })) : [])
  ];

  useEffect(() => {
    if (initialUser) {
      setFormData({ // Initialize formData with all fields from initialUser for core user edit
        id: initialUser.id,
        nom: initialUser.nom || '',
        prenom: initialUser.prenom || '',
        email: initialUser.email || '',
        numTelephone: initialUser.numTelephone || '',
        login: initialUser.login || '',
        role: initialUser.role || 'Employe',
        activite: initialUser.activite === undefined ? true : initialUser.activite,
        motDePasse: '',
        confirmer_mot_de_passe: '',
        userCreation: initialUser.userCreation,
        dateCreation: initialUser.dateCreation,
        // 'poste' field is removed from main formData as it's handled by EquipePosteUtilisateur
      });
      setImagePreview(initialUser.profileImage || defaultUserProfileImage_Details);
      setImageFile(null);
      setPasswordStrength({ lengthOk: false });
      setErrors({});
      setNewAssignment({ posteId: '', equipeId: '' });
      setAssignmentError('');
    }
  }, [initialUser]);

  if (!initialUser || !formData.id) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400">Chargement...</div>;
  }

  const handleInputChange = (e) => { /* Your original handleInputChange */
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (name === "motDePasse") setPasswordStrength({ lengthOk: val.length >= 8 });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };
  const handleImageChange = (e) => { /* Your original handleImageChange */
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const validateEditForm = () => { /* Your original validateEditForm, make sure it validates 'login' */
    const newErrors = {};
    if (!formData.prenom?.trim()) newErrors.prenom = "Prénom requis.";
    if (!formData.nom?.trim()) newErrors.nom = "Nom requis.";
    if (!formData.email?.trim()) newErrors.email = "Email requis.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email invalide.";
    if (!formData.login?.trim()) newErrors.login = "Login requis.";
    if (formData.motDePasse && formData.motDePasse.length < 8) newErrors.motDePasse = "Min. 8 caractères.";
    if (formData.motDePasse && formData.motDePasse !== formData.confirmer_mot_de_passe) newErrors.confirmer_mot_de_passe = "Mots de passe non identiques.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmEdit = () => { // For core user data update
    if (validateEditForm()) {
      const { id, userCreation, dateCreation, confirmer_mot_de_passe, profileImage, equipes, nbTicketsAssignes, ticketSet, equipeSet, equipePosteSet, poste, ...baseUserData } = formData;
      const dataToUpdate = {
        ...baseUserData, // nom, prenom, email, login, role, activite, num_telephone
        numTelephone: formData.num_telephone || null,
      };
      if (formData.motDePasse && formData.motDePasse.length > 0) {
        dataToUpdate.motDePasse = formData.motDePasse;
      }
      // The `poste` field from the form is NOT part of this DTO.
      onUpdateUser(initialUser.id, dataToUpdate, imageFile);
    }
  };

  const handleCancelEdit = () => { /* Your original handleCancelEdit */
    setIsEditing(false);
    setFormData({ ...initialUser, login: initialUser.login || '', motDePasse: '', confirmer_mot_de_passe: '' });
    setImagePreview(initialUser.profileImage || defaultUserProfileImage_Details);
    setImageFile(null);
    setErrors({});
    setNewAssignment({ posteId: '', equipeId: '' }); // Also reset assignment form
    setAssignmentError('');
  };
  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const confirmActualDelete = () => { setShowDeleteConfirm(false); onDeleteUser(initialUser.id, `${initialUser.prenom} ${initialUser.nom}`); };

  const userRoleDisplay = formData.role ? formData.role.replace('_', ' ') : 'N/A';

  const handleAddNewAssignmentSubmit = async () => {
    if (!newAssignment.posteId || !newAssignment.equipeId) {
      setAssignmentError("Veuillez sélectionner un poste et une équipe pour l'assignation.");
      return;
    }
    setAssignmentError('');
    setIsParentLoading(true);
    try {
      await equipePosteUtilisateurService.createAssignment({
        idUtilisateur: initialUser.id,
        idPoste: parseInt(newAssignment.posteId, 10),
        idEquipe: parseInt(newAssignment.equipeId, 10)
      });
      setParentPageMessage({ type: 'success', text: 'Assignation poste/équipe ajoutée.' });
      setNewAssignment({ posteId: '', equipeId: '' });
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error("Error adding assignment:", err.response || err);
      setParentErrorMessage(err.response?.data?.message || "Erreur lors de l'ajout de l'assignation.");
    } finally {
      setIsParentLoading(false);
    }
  };

  const handleRemoveAssignmentClick = async (assignment) => { // Pass the whole assignment object
    if (window.confirm(`Supprimer l'assignation: ${assignment.poste.designation} @ ${assignment.equipe.designation} ?`)) {
      setIsParentLoading(true);
      try {
        // The EquipePosteUtilisateurResource delete endpoint expects individual IDs
        await equipePosteUtilisateurService.deleteAssignment(assignment.poste.id, initialUser.id, assignment.equipe.id);
        setParentPageMessage({ type: 'info', text: 'Assignation poste/équipe supprimée.' });
        if (refreshUser) refreshUser();
      } catch (err) {
        console.error("Error removing assignment:", err.response || err);
        setParentErrorMessage(err.response?.data?.message || "Erreur lors de la suppression.");
      } finally {
        setIsParentLoading(false);
      }
    }
  };

  return (
    // --- YOUR ORIGINAL JSX STRUCTURE from UserDetailsPage.jsx ---
    // Including the new "Assignations" section.
    // The main form fields (email, phone, login, password, status) are from your original file.
    // The 'Poste' dropdown directly under 'Rôle' is removed as it's confusing.
    // Poste assignment is handled in the dedicated "Assignations" section.
    <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-950 min-h-full flex justify-center items-start">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-2xl relative">
        {/* Back, Edit, Delete Buttons (from your original file) */}
        <button onClick={() => onCancel('info', 'Retour à la liste.')} className="absolute top-3 left-3 md:top-4 md:left-4 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Retourner à la liste" disabled={isParentLoading}><ArrowLeft size={20} /></button>
        <div className="absolute top-3 right-3 md:top-4 md:right-4 flex space-x-2">{!isEditing && !showDeleteConfirm && (<><button onClick={() => setIsEditing(true)} className="p-2 rounded-full text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-700/50" title="Modifier" disabled={isParentLoading}><Edit3 size={20} /></button><button onClick={handleDeleteClick} className="p-2 rounded-full text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700/50" title="Supprimer" disabled={isParentLoading}><Trash2 size={20} /></button></>)}</div>

        {/* Profile Header (from your original file) */}
        <div className="text-center mb-4 md:mb-6 pt-8">
          <img src={imagePreview} alt={`${formData.prenom || ''} ${formData.nom || ''}`} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mx-auto mb-3 border-4 border-slate-200 dark:border-slate-700 shadow-md" onError={(e) => e.currentTarget.src = defaultUserProfileImage_Details} />
          {isEditing && (<><label htmlFor="profileImageEditDetailsPage" className="btn btn-secondary-outline text-xs py-1 px-2 mt-1 cursor-pointer">Changer l'image</label>
          <input type="file" id="profileImageEditDetailsPage" accept="image/*" onChange={handleImageChange} className="hidden" /></>)}
<h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">
  {isEditing ? (
    <div className="flex justify-center gap-2">
      <input 
        type="text" 
        name="prenom" 
        value={formData.prenom || ''} 
        onChange={handleInputChange} 
        className={`form-input py-1 text-center text-xl md:text-2xl font-bold w-1/3 ${errors.prenom ? 'border-red-500' : ''}`} 
      />
      <input 
        type="text" 
        name="nom" 
        value={formData.nom || ''} 
        onChange={handleInputChange} 
        className={`form-input py-1 text-center text-xl md:text-2xl font-bold w-1/3 ${errors.nom ? 'border-red-500' : ''}`} 
      />
    </div>
  ) : `${formData.prenom || ''} ${formData.nom || ''}`}
        </h1>
        {/* Error display for prenom/nom if editing */}
        {isEditing && (errors.prenom || errors.nom) && <p className="form-error-text text-center">{errors.prenom || errors.nom}</p>}

        {/* Corrected Role Display/Edit Section: Outer <p> changed to <div> */}
        <div className={`text-sm font-medium ${formData.role === 'Chef_Equipe' ? 'text-red-500 dark:text-red-400' : 'text-sky-600 dark:text-sky-400'}`}>
          {isEditing ? (
            <div className="relative mt-1 inline-block">
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleInputChange} 
                className="form-select py-1 text-sm text-center appearance-none pr-8 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 rounded-md focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="Admin">Admin</option>
                <option value="Chef_Equipe">Chef d'équipe</option>
                <option value="Employe">Employé</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/>
            </div>
          ) : userRoleDisplay }
        </div>
        </div>
        {showDeleteConfirm && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-sm transform transition-all animate-slide-in-up"><AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Confirmer la suppression</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Voulez-vous vraiment supprimer l'utilisateur {initialUser.prenom} {initialUser.nom} ?</p><div className="flex justify-center space-x-3">
          <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary px-4 py-2" disabled={isParentLoading}>Annuler</button><button onClick={confirmActualDelete} className="btn btn-danger px-4 py-2" disabled={isParentLoading}>Supprimer</button></div></div></div>)}

        {/* Main User Data Form Fields (Email, Phone, Login, Status, Password, Creation Info) */}
        {/* These are from your original UserDetailsPage.jsx, ensure they use formData and handleInputChange */}
        <div className="space-y-3 md:space-y-4">
          {/* Email, Phone, Login fields as per your original design */}
          <div><label htmlFor="emailUserDetails" className="form-label text-xs">Email</label><div className="form-icon-wrapper"><Mail size={16} className="form-icon" /><input type="email" name="email" id="emailUserDetails" value={formData.email || ''} onChange={handleInputChange} readOnly={!isEditing} className={`form-input-icon py-1.5 text-sm ${!isEditing ? 'bg-slate-100 dark:bg-slate-700 cursor-default' : ''} ${errors.email ? 'border-red-500' : ''}`} /></div>{isEditing && errors.email && <p className="form-error-text">{errors.email}</p>}</div>
          <div><label htmlFor="num_telephoneUserDetails" className="form-label text-xs">Numéro de téléphone</label><div className="form-icon-wrapper"><Phone size={16} className="form-icon" /><input type="tel" name="num_telephone" id="num_telephoneUserDetails" value={formData.numTelephone || ''} onChange={handleInputChange} readOnly={!isEditing} className={`form-input-icon py-1.5 text-sm ${!isEditing ? 'bg-slate-100 dark:bg-slate-700 cursor-default' : ''}`} /></div></div>
          <div><label htmlFor="loginUserDetails" className="form-label text-xs">Login (Nom d'utilisateur)</label><div className="form-icon-wrapper"><User size={16} className="form-icon" /><input type="text" name="login" id="loginUserDetails" value={formData.login || ''} onChange={handleInputChange} readOnly={!isEditing} className={`form-input-icon py-1.5 text-sm ${!isEditing ? 'bg-slate-100 dark:bg-slate-700 cursor-default' : ''} ${errors.login ? 'border-red-500' : ''}`} /></div>{isEditing && errors.login && <p className="form-error-text">{errors.login}</p>}</div>

          {/* Statut Actif toggle */}
          <div><label className="form-label text-xs flex items-center mt-2">Statut Actif :{isEditing ? (<button type="button" onClick={() => setFormData(prev => ({ ...prev, activite: !prev.activite }))} className={`ml-2 p-1 rounded-full transition-colors ${formData.activite ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>{formData.activite ? <ToggleRight size={20} className="text-white" /> : <ToggleLeft size={20} className="text-white" />}</button>) : (formData.activite ? <CheckCircle size={18} className="ml-2 text-green-500" /> : <XCircle size={18} className="ml-2 text-red-500" />)}</label></div>
          {/* Password change section (from your original file) */}
          {isEditing && (<div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700"> <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Changer le mot de passe (laisser vide pour ne pas modifier)</p> <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"> <div><label htmlFor="motDePasseEdit" className="form-label text-xs">Nouveau mot de passe</label><div className="form-icon-wrapper"><Key size={16} className="form-icon" /><input type={showPassword ? "text" : "password"} name="motDePasse" id="motDePasseEdit" value={formData.motDePasse || ''} onChange={handleInputChange} className={`form-input-icon pr-10 py-1.5 text-sm ${errors.motDePasse ? 'border-red-500' : passwordStrength.lengthOk && formData.motDePasse ? 'border-green-500' : ''}`} placeholder="Nouveau mot de passe" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"><EyeOff size={16} /></button></div>{errors.motDePasse && <p className="form-error-text">{errors.motDePasse}</p>}{!errors.motDePasse && passwordStrength.lengthOk && formData.motDePasse && <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Longueur acceptable.</p>}</div><div><label htmlFor="confirmer_mot_de_passe_edit" className="form-label text-xs">Confirmer nouveau mot de passe</label><div className="form-icon-wrapper"><Key size={16} className="form-icon" /><input type={showConfirmPassword ? "text" : "password"} name="confirmer_mot_de_passe" id="confirmer_mot_de_passe_edit" value={formData.confirmer_mot_de_passe || ''} onChange={handleInputChange} className={`form-input-icon pr-10 py-1.5 text-sm ${errors.confirmer_mot_de_passe ? 'border-red-500' : ''}`} placeholder="Retapez si changé" /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"><EyeOff size={16} /></button></div>{errors.confirmer_mot_de_passe && <p className="form-error-text">{errors.confirmer_mot_de_passe}</p>}</div></div></div>)}
          {/* Creation Info (from your original file) */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700"><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div><label className="form-label text-xs">Créé par</label><input type="text" value={formData.userCreation || adminName || 'N/A'} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-default py-1.5 text-sm" /></div><div><label className="form-label text-xs">Date de création</label><input type="text" value={formData.dateCreation ? new Date(formData.dateCreation).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-default py-1.5 text-sm" /></div></div></div>
        </div>

        {/* Section for Equipe/Poste Assignments */}
        <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-3">Assignations Actuelles (Poste @ Équipe)</h3>
          {currentAssignments.length === 0 && (<p className="text-sm text-slate-500 dark:text-slate-400 italic">Aucune assignation de poste/équipe pour cet utilisateur.</p>)}
          <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {currentAssignments.map((assignment) => ( // Changed assign to assignment for clarity
              <li key={`${assignment.equipe.id}-${assignment.poste.id}`}
                className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/30 rounded-md text-sm">
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{assignment.poste?.designation || 'Poste inconnu'}</span>
                  <span className="text-slate-500 dark:text-slate-400 mx-1">@</span>
                  <span className="text-slate-600 dark:text-slate-300">{assignment.equipe?.designation || 'Équipe inconnue'}</span>
                </div>
                {isEditing && (
                  <button onClick={() => handleRemoveAssignmentClick(assignment)} className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400" title="Supprimer l'assignation" disabled={isParentLoading}>
                    <Trash size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {isEditing && (
            <div className="p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg space-y-3 mt-4">
              <h4 className="text-md font-semibold text-slate-600 dark:text-slate-300">Nouvelle Assignation Poste/Équipe</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="newAssignmentPosteId" className="form-label text-xs">Poste</label>
                  <div className="relative"><Briefcase size={16} className="form-icon left-3" /><select name="posteId" id="newAssignmentPosteId" value={newAssignment.posteId} onChange={(e) => setNewAssignment(p => ({ ...p, posteId: e.target.value }))} className={`form-select-icon appearance-none py-1.5 text-sm ${assignmentError && !newAssignment.posteId ? 'border-red-500' : ''}`}>{posteDropdownOptions.map(opt => <option key={opt.value} value={opt.value} disabled={opt.value === ''}>{opt.label}</option>)}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500" /></div>
                </div>
                <div>
                  <label htmlFor="newAssignmentEquipeId" className="form-label text-xs">Équipe</label>
                  <div className="relative"><Users size={16} className="form-icon left-3" /><select name="equipeId" id="newAssignmentEquipeId" value={newAssignment.equipeId} onChange={(e) => setNewAssignment(p => ({ ...p, equipeId: e.target.value }))} className={`form-select-icon appearance-none py-1.5 text-sm ${assignmentError && !newAssignment.equipeId ? 'border-red-500' : ''}`}>{equipeDropdownOptions.map(opt => <option key={opt.value} value={opt.value} disabled={opt.value === ''}>{opt.label}</option>)}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500" /></div>
                </div>
              </div>
              {assignmentError && <p className="form-error-text text-xs">{assignmentError}</p>}
              <button type="button" onClick={handleAddNewAssignmentSubmit} className="btn btn-secondary-outline btn-sm group" disabled={isParentLoading}><PlusCircle size={16} className="mr-1.5" />Ajouter Assignation</button>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="pt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <button type="button" onClick={handleCancelEdit} className="btn btn-secondary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3" disabled={isParentLoading}><XCircle size={16} className="mr-1.5 transition-transform duration-300 group-hover:rotate-12" /> Annuler</button>
            <button type="button" onClick={handleConfirmEdit} className="btn btn-primary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3" disabled={isParentLoading}><Save size={16} className="mr-1.5 transition-transform duration-300 group-hover:scale-110" /> Confirmer Modifications</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default UserDetailsPage;