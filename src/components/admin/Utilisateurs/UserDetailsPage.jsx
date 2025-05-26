import React, { useState, useEffect } from 'react'; // Assurez-vous que React, useState, useEffect sont importés
import { User, Mail, Phone, Briefcase, Key, Eye, EyeOff, Save, XCircle, Edit3, Trash2, CheckCircle, AlertTriangle, ArrowLeft, ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react'; // Ajout de ChevronDown
import defaultUserProfileImage_Details from '../../../assets/images/default-profile.png'; 

// Réutiliser posteOptions ici ou l'importer si défini globalement
const userDetailsPosteOptions = [
  { value: '', label: 'Sélectionner un poste...' },
  { value: 'Développeur Front', label: 'Développeur Front' },
  { value: 'Développeur Back', label: 'Développeur Back' },
  { value: 'Testeur', label: 'Testeur' },
  { value: 'DevOps', label: 'DevOps' },
];


const UserDetailsPage = ({ user: initialUser, onUpdateUser, onDeleteUser, onCancel, adminName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialUser);
  const [imagePreview, setImagePreview] = useState(initialUser?.profileImage || null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({lengthOk: initialUser?.mot_de_passe?.length >= 8 || false});


  useEffect(() => {
    setFormData(initialUser);
    setImagePreview(initialUser?.profileImage || null);
    setPasswordStrength({lengthOk: initialUser?.mot_de_passe?.length >= 8 || false});
  }, [initialUser]);

  if (!initialUser) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400">Utilisateur non trouvé.</div>;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
     if (name === "mot_de_passe") {
      setPasswordStrength({ lengthOk: val.length >= 8 });
    }
    if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, profileImageFile: file, profileImage: URL.createObjectURL(file) })); // Mettre à jour profileImage pour la prévisualisation
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateEditForm = () => {
    const newErrors = {};
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis.";
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis.";
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide.";
    }
    // Validation du mot de passe seulement si un nouveau mot de passe est entré
    if (formData.mot_de_passe) { // Si le champ mot de passe n'est pas vide
        if (formData.mot_de_passe.length < 8) {
            newErrors.mot_de_passe = "Le mot de passe doit contenir au moins 8 caractères.";
        } else {
            const uniqueChars = new Set(formData.mot_de_passe.split(''));
            if (uniqueChars.size < 2 && formData.mot_de_passe.length >=2 ) {
                newErrors.mot_de_passe = "Doit contenir au moins 2 caractères différents.";
            }
        }
        if (formData.mot_de_passe !== formData.confirmer_mot_de_passe) {
          newErrors.confirmer_mot_de_passe = "Les mots de passe ne correspondent pas.";
        }
    } else if (formData.confirmer_mot_de_passe) { // Si seulement confirmer_mot_de_passe est rempli
        newErrors.mot_de_passe = "Veuillez entrer un nouveau mot de passe.";
    }


    if (formData.role === 'utilisateur' && !formData.poste) {
        newErrors.poste = "Le poste est requis pour un utilisateur.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmEdit = () => {
    if (validateEditForm()) {
      const { confirmer_mot_de_passe, profileImageFile, ...dataToUpdate } = formData;
      
      // Si un nouveau fichier image a été sélectionné, il est dans profileImageFile
      // profileImage contient l'URL de prévisualisation (ou l'ancienne URL)
      // Pour la démo, on continue d'utiliser l'URL de prévisualisation.
      // En production, vous uploaderiez profileImageFile ici.
      if (profileImageFile) {
        // dataToUpdate.profileImage = "URL_RETOURNEE_PAR_UPLOAD"; // Exemple
      } else {
        dataToUpdate.profileImage = initialUser.profileImage; // Conserver l'ancienne image si pas de nouvelle
      }


      if (!dataToUpdate.mot_de_passe) { // Si le champ mot de passe est laissé vide
        delete dataToUpdate.mot_de_passe; // Ne pas envoyer de mot de passe vide
      }

      onUpdateUser(dataToUpdate);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(initialUser); 
    setImagePreview(initialUser?.profileImage || null);
    setErrors({});
    setIsEditing(false);
    onCancel('info', 'Modification annulée.'); // Appel onCancel pour retourner et afficher un message
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmActualDelete = () => {
    onDeleteUser(initialUser.id);
  };

  const userProfileDisplay = imagePreview || formData.profileImage || defaultUserProfileImage_Details; // Priorité à imagePreview

  return (
    <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-950 min-h-full flex justify-center items-start">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-2xl relative">
        <button 
            onClick={() => onCancel('info', 'Retour à la liste.')} // Utilisation de onCancel pour retourner
            className="absolute top-3 left-3 md:top-4 md:left-4 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Retourner à la liste"
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
          <img 
            src={userProfileDisplay} 
            alt={`${formData.prenom} ${formData.nom}`} 
            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mx-auto mb-3 border-4 border-slate-200 dark:border-slate-700 shadow-md"
            onError={(e) => e.currentTarget.src = defaultUserProfileImage_Details}
          />
          {isEditing && (
            <>
            <label htmlFor="profileImageEdit" className="btn btn-secondary-outline text-xs py-1 px-2 mt-1 cursor-pointer">
                Changer l'image
            </label>
            <input type="file" id="profileImageEdit" accept="image/*" onChange={handleImageChange} className="hidden" />
            </>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">
            {isEditing ? 
              <div className="flex justify-center gap-2">
                <input type="text" name="prenom" value={formData.prenom} onChange={handleInputChange} className={`form-input py-1 text-center text-xl md:text-2xl font-bold w-1/3 ${errors.prenom ? 'border-red-500' : ''}`} />
                <input type="text" name="nom" value={formData.nom} onChange={handleInputChange} className={`form-input py-1 text-center text-xl md:text-2xl font-bold w-1/3 ${errors.nom ? 'border-red-500' : ''}`} />
              </div>
             : `${formData.prenom} ${formData.nom}`}
          </h1>
          <p className={`text-sm font-medium ${formData.role === 'chef_equipe' ? 'text-red-500 dark:text-red-400' : 'text-sky-600 dark:text-sky-400'}`}>
            {isEditing ? 
                <select name="role" value={formData.role} onChange={handleInputChange} className="form-select py-1 text-sm text-center mt-1 appearance-none">
                    <option value="utilisateur">Utilisateur</option>
                    <option value="chef_equipe">Chef d'équipe</option>
                </select>
             : formData.poste}
          </p>
        </div>

        {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-sm transform transition-all animate-slide-in-up">
                    <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Confirmer la suppression</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                        Voulez-vous vraiment supprimer l'utilisateur {initialUser.prenom} {initialUser.nom} ? Cette action est irréversible.
                    </p>
                    <div className="flex justify-center space-x-3">
                        <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary px-4 py-2 transform hover:scale-105 active:scale-95">Annuler</button>
                        <button onClick={confirmActualDelete} className="btn btn-danger px-4 py-2 transform hover:scale-105 active:scale-95">Supprimer</button>
                    </div>
                </div>
            </div>
        )}

        <div className="space-y-3 md:space-y-4">
            {Object.entries({
                email: { label: "Email", icon: Mail, type: "email" },
                num_telephone: { label: "Numéro de téléphone", icon: Phone, type: "tel" },
                nom_utilisateur: { label: "Nom d'utilisateur", icon: User, type: "text"},
            }).map(([key, {label, icon: Icon, type}]) => (
                <div key={key}>
                    <label htmlFor={key} className="form-label text-xs">{label}</label>
                    <div className="form-icon-wrapper">
                        <Icon size={16} className="form-icon" />
                        <input 
                            type={type} 
                            name={key} 
                            id={key} 
                            value={formData[key] || ''} 
                            onChange={handleInputChange} 
                            readOnly={!isEditing}
                            className={`form-input-icon py-1.5 text-sm ${!isEditing ? 'bg-slate-100 dark:bg-slate-700 cursor-default' : ''} ${errors[key] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
                        />
                    </div>
                    {isEditing && errors[key] && <p className="form-error-text">{errors[key]}</p>}
                </div>
            ))}

            {isEditing && formData.role === 'utilisateur' && (
                 <div>
                    <label htmlFor="poste" className="form-label text-xs">Poste</label>
                    <div className="relative">
                        <Briefcase size={16} className="form-icon left-3" />
                        <select name="poste" id="poste" value={formData.poste} onChange={handleInputChange} className={`form-select-icon appearance-none py-1.5 text-sm ${errors.poste ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                        {userDetailsPosteOptions.map(option => ( // Utilisation de userDetailsPosteOptions
                            <option key={option.value} value={option.value} disabled={option.value === ''}>{option.label}</option>
                        ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/>
                    </div>
                    {errors.poste && <p className="form-error-text">{errors.poste}</p>}
                </div>
            )}
            {!isEditing && formData.role === 'utilisateur' && (
                 <div>
                    <label className="form-label text-xs">Poste</label>
                    <div className="form-icon-wrapper">
                        <Briefcase size={16} className="form-icon" />
                        <input type="text" value={formData.poste} readOnly className="form-input-icon py-1.5 text-sm bg-slate-100 dark:bg-slate-700 cursor-default" />
                    </div>
                </div>
            )}

            <div>
                <label className="form-label text-xs flex items-center mt-2">
                    Statut Actif :
                    {isEditing ? (
                        <button type="button" onClick={() => setFormData(prev => ({...prev, actif: !prev.actif}))} className={`ml-2 p-1 rounded-full transition-colors ${formData.actif ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                           {formData.actif ? <ToggleRight size={20} className="text-white"/> : <ToggleLeft size={20} className="text-white"/>}
                        </button>
                    ) : (
                        formData.actif ? <CheckCircle size={18} className="ml-2 text-green-500"/> : <XCircle size={18} className="ml-2 text-red-500"/>
                    )}
                </label>
            </div>

            {isEditing && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Changer le mot de passe (laisser vide pour ne pas modifier)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="mot_de_passe_edit" className="form-label text-xs">Nouveau mot de passe</label>
                            <div className="form-icon-wrapper">
                            <Key size={16} className="form-icon" />
                            <input type={showPassword ? "text" : "password"} name="mot_de_passe" id="mot_de_passe_edit" value={formData.mot_de_passe || ''} onChange={handleInputChange} className={`form-input-icon pr-10 py-1.5 text-sm ${errors.mot_de_passe ? 'border-red-500' : passwordStrength.lengthOk && formData.mot_de_passe ? 'border-green-500' : ''}`} placeholder="Nouveau mot de passe" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"><EyeOff size={16} /></button>
                            </div>
                            {errors.mot_de_passe && <p className="form-error-text">{errors.mot_de_passe}</p>}
                            {!errors.mot_de_passe && passwordStrength.lengthOk && formData.mot_de_passe && <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Longueur acceptable.</p>}
                        </div>
                        <div>
                            <label htmlFor="confirmer_mot_de_passe_edit" className="form-label text-xs">Confirmer nouveau mot de passe</label>
                            <div className="form-icon-wrapper">
                            <Key size={16} className="form-icon" />
                            <input type={showConfirmPassword ? "text" : "password"} name="confirmer_mot_de_passe" id="confirmer_mot_de_passe_edit" value={formData.confirmer_mot_de_passe || ''} onChange={handleInputChange} className={`form-input-icon pr-10 py-1.5 text-sm ${errors.confirmer_mot_de_passe ? 'border-red-500' : ''}`} placeholder="Retapez si changé" />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"><EyeOff size={16} /></button>
                            </div>
                            {errors.confirmer_mot_de_passe && <p className="form-error-text">{errors.confirmer_mot_de_passe}</p>}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="form-label text-xs">Créé par</label>
                        <input type="text" value={formData.userCreation || adminName || 'N/A'} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-default py-1.5 text-sm" />
                    </div>
                    <div>
                        <label className="form-label text-xs">Date de création</label>
                        <input type="text" value={new Date(formData.dateCreation).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-default py-1.5 text-sm" />
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
export default UserDetailsPage;
