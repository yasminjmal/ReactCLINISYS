import React, { useState, useEffect } from 'react';
import { UserPlus, Image as ImageIcon, User, Mail, Phone, Briefcase, Key, Eye, EyeOff, Save, XCircle, ArrowLeft, ChevronDown,Users } from 'lucide-react';

const AjouterUserPage = ({ onAddUser, onCancel, availablePostes = [], availableEquipes = [], adminName, isLoading }) => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    num_telephone: '',
    role: 'Employe',
    poste: '', // This is the DESIGNATION of the poste selected in UI
    equipeIdForAssignment: '', // UI state for selected equipe ID for a new EPU link
    login: '',
    motDePasse: '',
    confirmer_mot_de_passe: '',
    actif: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ lengthOk: false });

  const posteDropdownOptions = [
    { value: '', label: 'Sélectionner un poste...' },
    // The `value` for poste here is the designation string, as per your original.
    // The parent handleAddUser will need to find the poste.id if sending to EPU service.
    ...(Array.isArray(availablePostes) ? availablePostes.map(p => ({ value: p.designation, label: p.designation })) : [])
  ];

  const equipeDropdownOptions = [
    { value: '', label: 'Sélectionner une équipe...' },
    ...(Array.isArray(availableEquipes) ? availableEquipes.map(e => ({ value: e.id, label: e.designation })) : [])
  ];
  
  useEffect(() => {
    if (formData.role === 'Admin' || formData.role === 'Chef_Equipe') {
      setFormData(prev => ({ ...prev, poste: '', equipeIdForAssignment: '' })); 
    }
  }, [formData.role]);

  const handleInputChange = (e) => { /* ... (same as previous) ... */ 
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (name === "motDePasse") setPasswordStrength({ lengthOk: val.length >= 8 });
    if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
  };
  const handleImageChange = (e) => { /* ... (same as previous) ... */ 
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.imageFile) setErrors(prev => ({...prev, imageFile: null}));
    }
  };
  const validateForm = () => { /* ... (same as previous) ... */ 
    const newErrors = {};
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis.";
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis.";
    if (!formData.email.trim()) newErrors.email = "L'email est requis.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email n'est pas valide.";
    if (!formData.login.trim()) newErrors.login = "Le login est requis.";
    if (!formData.motDePasse) newErrors.motDePasse = "Le mot de passe est requis.";
    else if (formData.motDePasse.length < 8) newErrors.motDePasse = "Le mot de passe doit contenir au moins 8 caractères.";
    else { const uniqueChars = new Set(formData.motDePasse.split('')); if (uniqueChars.size < 2 && formData.motDePasse.length >=2 ) newErrors.motDePasse = "Doit contenir au moins 2 caractères différents.";}
    if (formData.motDePasse !== formData.confirmer_mot_de_passe) newErrors.confirmer_mot_de_passe = "Les mots de passe ne correspondent pas.";
    if (formData.role === 'Employe' && formData.poste && !formData.equipeIdForAssignment) { newErrors.equipeIdForAssignment = "Veuillez sélectionner une équipe pour ce poste.";}
    if (formData.role === 'Employe' && !formData.poste && formData.equipeIdForAssignment) { newErrors.poste = "Veuillez sélectionner un poste pour cette équipe.";}
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Pass the full formData which includes 'poste' (designation) and 'equipeIdForAssignment'.
      // The parent (ConsulterUsersPage) handleAddUser will extract core user fields for user creation,
      // and can then use 'poste' and 'equipeIdForAssignment' for a secondary EPU creation call.
      onAddUser(formData, imageFile);
    }
  };
  
  const today = new Date().toLocaleDateString('fr-CA');

  return (
    // --- YOUR ORIGINAL JSX from uploaded AjouterUserPage.jsx ---
    // Ensure all fields, icons, and classes match your original.
    // The Poste and Equipe dropdowns are included for Employe role.
    <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-950 min-h-full flex justify-center items-start">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-2xl">
        <button onClick={() => onCancel('info', 'Ajout annulé.')} className="absolute top-2 left-2 md:top-4 md:left-4 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title="Retourner à la liste" disabled={isLoading}><ArrowLeft size={20} /></button>
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="text-center mb-4 md:mb-6"><UserPlus className="h-8 w-8 text-sky-600 dark:text-sky-500 mx-auto mb-1.5" /><h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">Ajouter un Nouvel Utilisateur</h1></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-start">
                <div className="md:col-span-1 flex flex-col items-center space-y-1.5"><div className={`w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-dashed ${errors.profileImageFile ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center bg-slate-50 dark:bg-slate-700 overflow-hidden transition-all`}>{imagePreview ? (<img src={imagePreview} alt="Prévisualisation" className="w-full h-full object-cover" />) : (<ImageIcon className="h-10 w-10 md:h-12 md:w-12 text-slate-400 dark:text-slate-500" />)}</div><label htmlFor="profileImageUpload" className="btn btn-secondary-outline text-xs py-1 px-2">Choisir une image</label><input type="file" id="profileImageUpload" accept="image/*" onChange={handleImageChange} className="hidden" /></div>
                <div className="md:col-span-2 space-y-3"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label htmlFor="prenom" className="form-label text-xs">Prénom</label><div className="form-icon-wrapper"><User size={16} className="form-icon" /><input type="text" name="prenom" id="prenom" value={formData.prenom} onChange={handleInputChange} className={`form-input-icon py-1.5 text-sm ${errors.prenom ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="Ex: John" /></div>{errors.prenom && <p className="form-error-text">{errors.prenom}</p>}</div><div><label htmlFor="nom" className="form-label text-xs">Nom</label><div className="form-icon-wrapper"><User size={16} className="form-icon" /><input type="text" name="nom" id="nom" value={formData.nom} onChange={handleInputChange} className={`form-input-icon py-1.5 text-sm ${errors.nom ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="Ex: Doe" /></div>{errors.nom && <p className="form-error-text">{errors.nom}</p>}</div></div><div><label htmlFor="email" className="form-label text-xs">Email</label><div className="form-icon-wrapper"><Mail size={16} className="form-icon" /><input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} className={`form-input-icon py-1.5 text-sm ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="Ex: john.doe@example.com" /></div>{errors.email && <p className="form-error-text">{errors.email}</p>}</div><div><label htmlFor="num_telephone" className="form-label text-xs">Numéro de téléphone</label><div className="form-icon-wrapper"><Phone size={16} className="form-icon" /><input type="tel" name="num_telephone" id="num_telephone" value={formData.num_telephone} onChange={handleInputChange} className="form-input-icon py-1.5 text-sm" placeholder="Ex: 0612345678" /></div></div></div>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700"><label className="form-label text-xs flex items-center cursor-pointer"><input type="checkbox" name="actif" checked={formData.actif} onChange={handleInputChange} className="form-checkbox mr-2 h-4 w-4 text-sky-600 rounded border-slate-400 dark:border-slate-500 focus:ring-sky-500 bg-white dark:bg-slate-700"/>Utilisateur Actif</label></div>
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label htmlFor="role" className="form-label text-xs">Rôle</label><div className="relative"><User size={16} className="form-icon left-3" /><select name="role" id="role" value={formData.role} onChange={handleInputChange} className="form-select-icon appearance-none py-1.5 text-sm"><option value="Admin">Admin</option><option value="Chef_Equipe">Chef d'équipe</option><option value="Employe">Employé</option></select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/></div></div>
                    {(formData.role === 'Employe') && (<><div><label htmlFor="poste" className="form-label text-xs">Poste à assigner</label><div className="relative"><Briefcase size={16} className="form-icon left-3" /><select name="poste" id="poste" value={formData.poste} onChange={handleInputChange} className={`form-select-icon appearance-none py-1.5 text-sm ${errors.poste ? 'border-red-500' : ''}`}>{posteDropdownOptions.map(option => (<option key={option.id || option.value} value={option.value} disabled={option.value === ''}>{option.label}</option>))}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/></div>{errors.poste && <p className="form-error-text">{errors.poste}</p>}</div><div><label htmlFor="equipeIdForAssignment" className="form-label text-xs">Dans l'équipe</label><div className="relative"><Users size={16} className="form-icon left-3" /><select name="equipeIdForAssignment" id="equipeIdForAssignment" value={formData.equipeIdForAssignment} onChange={handleInputChange} className={`form-select-icon appearance-none py-1.5 text-sm ${errors.equipeIdForAssignment ? 'border-red-500' : ''}`}>{equipeDropdownOptions.map(option => (<option key={option.value} value={option.value} disabled={option.value === ''}>{option.label}</option>))}</select><ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/></div>{errors.equipeIdForAssignment && <p className="form-error-text">{errors.equipeIdForAssignment}</p>}</div></>)}
                </div>
                <div><label htmlFor="login" className="form-label text-xs">Login</label><div className="form-icon-wrapper"><User size={16} className="form-icon" /><input type="text" name="login" id="login" value={formData.login} onChange={handleInputChange} className={`form-input-icon py-1.5 text-sm ${errors.login ? 'border-red-500' : ''}`} placeholder="Login unique" /></div>{errors.login && <p className="form-error-text">{errors.login}</p>}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label htmlFor="motDePasse" className="form-label text-xs">Mot de passe</label><div className="form-icon-wrapper"><Key size={16} className="form-icon" /><input type={showPassword ? "text" : "password"} name="motDePasse" id="motDePasse" value={formData.motDePasse} onChange={handleInputChange} className={`form-input-icon pr-10 py-1.5 text-sm ${errors.motDePasse ? 'border-red-500' : passwordStrength.lengthOk ? 'border-green-500' : ''}`} placeholder="Min. 8 caractères" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>{errors.motDePasse && <p className="form-error-text">{errors.motDePasse}</p>}{!errors.motDePasse && passwordStrength.lengthOk && formData.motDePasse && <p className="text-xs text-green-600 mt-0.5">Longueur acceptable.</p>}</div><div><label htmlFor="confirmer_mot_de_passe" className="form-label text-xs">Confirmer</label><div className="form-icon-wrapper"><Key size={16} className="form-icon" /><input type={showConfirmPassword ? "text" : "password"} name="confirmer_mot_de_passe" id="confirmer_mot_de_passe" value={formData.confirmer_mot_de_passe} onChange={handleInputChange} className={`form-input-icon pr-10 py-1.5 text-sm ${errors.confirmer_mot_de_passe ? 'border-red-500' : ''}`} placeholder="Retapez" /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>{errors.confirmer_mot_de_passe && <p className="form-error-text">{errors.confirmer_mot_de_passe}</p>}</div></div>
            </div>
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700"><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div><label htmlFor="userCreationUserAdd" className="form-label text-xs">Créé par</label><input type="text" id="userCreationUserAdd" value={adminName} readOnly className="form-input bg-slate-100 dark:bg-slate-700 py-1.5 text-sm" /></div><div><label htmlFor="dateCreationUserAdd" className="form-label text-xs">Date création</label><input type="date" id="dateCreationUserAdd" value={today} readOnly className="form-input bg-slate-100 dark:bg-slate-700 py-1.5 text-sm" /></div></div></div>
            <div className="pt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2"><button type="button" onClick={() => onCancel('info', 'Ajout annulé.')} className="btn btn-secondary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3" disabled={isLoading}><XCircle size={16} className="mr-1.5"/>Annuler</button><button type="submit" className="btn btn-primary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3" disabled={isLoading}><Save size={16} className="mr-1.5"/>Confirmer</button></div>
        </form>
      </div>
    </div>
  );
};
export default AjouterUserPage;