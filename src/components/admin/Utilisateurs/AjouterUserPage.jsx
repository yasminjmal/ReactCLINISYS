import React, { useState, useEffect } from 'react'; // Assurez-vous que React, useState, useEffect sont importés
import { 
    UserPlus, Image as ImageIcon, User, Mail, Phone, Briefcase, Key, Eye, EyeOff, 
    Save, XCircle, CheckCircle, ArrowLeft, AlertCircle, ChevronDown
} from 'lucide-react';

const posteOptions = [
  { value: '', label: 'Sélectionner un poste...' },
  { value: 'Développeur Front', label: 'Développeur Front' },
  { value: 'Développeur Back', label: 'Développeur Back' },
  { value: 'Testeur', label: 'Testeur' },
  { value: 'DevOps', label: 'DevOps' },
];

const AjouterUserPage = ({ onAddUser, onCancel, adminName }) => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    num_telephone: '',
    role: 'utilisateur',
    poste: '', 
    nom_utilisateur: '',
    mot_de_passe: '',
    confirmer_mot_de_passe: '',
    profileImageFile: null,
    actif: true,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    lengthOk: false,
  });

  useEffect(() => {
    if (formData.role === 'utilisateur' && posteOptions.length > 0 && !formData.poste) {
      setFormData(prev => ({ ...prev, poste: posteOptions[0].value }));
    } else if (formData.role === 'chef_equipe') {
      setFormData(prev => ({ ...prev, poste: '' }));
    }
  }, [formData.role, formData.poste]);


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
      setFormData(prev => ({ ...prev, profileImageFile: file }));
      setImagePreview(URL.createObjectURL(file));
      if (errors.profileImage) setErrors(prev => ({...prev, profileImage: null}));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis.";
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis.";
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide.";
    }
    if (!formData.nom_utilisateur.trim()) newErrors.nom_utilisateur = "Le nom d'utilisateur est requis.";
    if (!formData.mot_de_passe) {
        newErrors.mot_de_passe = "Le mot de passe est requis.";
    } else if (formData.mot_de_passe.length < 8) {
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
    if (formData.role === 'utilisateur' && !formData.poste) {
        newErrors.poste = "Le poste est requis pour un utilisateur.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const newUser = {
        id: `user_${Date.now()}`,
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        num_telephone: formData.num_telephone,
        poste: formData.role === 'chef_equipe' ? "Chef d'équipe" : formData.poste,
        role: formData.role,
        actif: formData.actif,
        dateCreation: new Date().toISOString(),
        userCreation: adminName,
        nbTicketsAssignes: 0,
        profileImage: imagePreview, 
        equipes: [],
      };
      onAddUser(newUser);
    }
  };

  const today = new Date().toLocaleDateString('fr-CA');

  return (
    <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-950 min-h-full flex justify-center items-start">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-2xl">
        <button 
            onClick={onCancel} 
            className="absolute top-2 left-2 md:top-4 md:left-4 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Retourner à la liste"
        >
            <ArrowLeft size={20} />
        </button>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-start">
            <div className="md:col-span-1 flex flex-col items-center space-y-1.5">
              <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-dashed ${errors.profileImage ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center bg-slate-50 dark:bg-slate-700 overflow-hidden transition-all`}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Prévisualisation" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-10 w-10 md:h-12 md:w-12 text-slate-400 dark:text-slate-500" />
                )}
              </div>
              <label htmlFor="profileImageUpload" className="btn btn-secondary-outline text-xs py-1 px-2">
                Choisir une image
              </label>
              <input type="file" id="profileImageUpload" accept="image/*" onChange={handleImageChange} className="hidden" />
              {errors.profileImage && <p className="form-error-text text-xs">{errors.profileImage}</p>}
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="prenom" className="form-label text-xs">Prénom</label>
                  <div className="form-icon-wrapper">
                    <User size={16} className="form-icon" />
                    <input type="text" name="prenom" id="prenom" value={formData.prenom} onChange={handleInputChange} className={`form-input-icon py-1.5 text-sm ${errors.prenom ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="Ex: John" />
                  </div>
                  {errors.prenom && <p className="form-error-text">{errors.prenom}</p>}
                </div>
                <div>
                  <label htmlFor="nom" className="form-label text-xs">Nom</label>
                  <div className="form-icon-wrapper">
                    <User size={16} className="form-icon" />
                    <input type="text" name="nom" id="nom" value={formData.nom} onChange={handleInputChange} className={`form-input-icon py-1.5 text-sm ${errors.nom ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="Ex: Doe" />
                  </div>
                  {errors.nom && <p className="form-error-text">{errors.nom}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="email" className="form-label text-xs">Email</label>
                <div className="form-icon-wrapper">
                  <Mail size={16} className="form-icon" />
                  <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} className={`form-input-icon py-1.5 text-sm ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="Ex: john.doe@example.com" />
                </div>
                {errors.email && <p className="form-error-text">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="num_telephone" className="form-label text-xs">Numéro de téléphone</label>
                <div className="form-icon-wrapper">
                  <Phone size={16} className="form-icon" />
                  <input type="tel" name="num_telephone" id="num_telephone" value={formData.num_telephone} onChange={handleInputChange} className="form-input-icon py-1.5 text-sm" placeholder="Ex: 0612345678" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
             <label className="form-label text-xs flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    name="actif" 
                    checked={formData.actif} 
                    onChange={handleInputChange}
                    className="form-checkbox mr-2 h-4 w-4"
                />
                Utilisateur Actif
                {formData.actif ? <CheckCircle size={16} className="ml-2 text-green-500"/> : <XCircle size={16} className="ml-2 text-red-500"/>}
             </label>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="role" className="form-label text-xs">Rôle</label>
                <div className="relative">
                     <select name="role" id="role" value={formData.role} onChange={handleInputChange} className="form-select appearance-none py-1.5 text-sm">
                        <option value="utilisateur">Utilisateur</option>
                        <option value="chef_equipe">Chef d'équipe</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/>
                </div>
              </div>

              {formData.role === 'utilisateur' && (
                <div>
                  <label htmlFor="poste" className="form-label text-xs">Poste</label>
                  <div className="relative">
                    <Briefcase size={16} className="form-icon left-3" />
                    <select name="poste" id="poste" value={formData.poste} onChange={handleInputChange} className={`form-select-icon appearance-none py-1.5 text-sm ${errors.poste ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                      {posteOptions.map(option => (
                        <option key={option.value} value={option.value} disabled={option.value === ''}>{option.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/>
                  </div>
                  {errors.poste && <p className="form-error-text">{errors.poste}</p>}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="nom_utilisateur" className="form-label text-xs">Nom d'utilisateur</label>
              <div className="form-icon-wrapper">
                <User size={16} className="form-icon" />
                <input type="text" name="nom_utilisateur" id="nom_utilisateur" value={formData.nom_utilisateur} onChange={handleInputChange} className={`form-input-icon py-1.5 text-sm ${errors.nom_utilisateur ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="Nom d'utilisateur unique" />
              </div>
              {errors.nom_utilisateur && <p className="form-error-text">{errors.nom_utilisateur}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="mot_de_passe" className="form-label text-xs">Mot de passe</label>
                <div className="form-icon-wrapper">
                  <Key size={16} className="form-icon" />
                  <input type={showPassword ? "text" : "password"} name="mot_de_passe" id="mot_de_passe" value={formData.mot_de_passe} onChange={handleInputChange} className={`form-input-icon pr-10 py-1.5 text-sm ${errors.mot_de_passe ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : passwordStrength.lengthOk ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}`} placeholder="Min. 8 caractères" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.mot_de_passe && <p className="form-error-text">{errors.mot_de_passe}</p>}
                {!errors.mot_de_passe && passwordStrength.lengthOk && <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Longueur acceptable.</p>}
              </div>

              <div>
                <label htmlFor="confirmer_mot_de_passe" className="form-label text-xs">Confirmer le mot de passe</label>
                <div className="form-icon-wrapper">
                  <Key size={16} className="form-icon" />
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmer_mot_de_passe" id="confirmer_mot_de_passe" value={formData.confirmer_mot_de_passe} onChange={handleInputChange} className={`form-input-icon pr-10 py-1.5 text-sm ${errors.confirmer_mot_de_passe ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="Retapez le mot de passe" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmer_mot_de_passe && <p className="form-error-text">{errors.confirmer_mot_de_passe}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="userCreation" className="form-label text-xs">Créé par</label>
                <input type="text" name="userCreation" id="userCreation" value={adminName} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-not-allowed py-1.5 text-sm" />
              </div>
              <div>
                <label htmlFor="dateCreation" className="form-label text-xs">Date de création</label>
                <input type="date" name="dateCreation" id="dateCreation" value={today} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-not-allowed py-1.5 text-sm" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3"
            >
              <XCircle size={16} className="mr-1.5 transition-transform duration-300 group-hover:rotate-12" />
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3"
            >
              <Save size={16} className="mr-1.5 transition-transform duration-300 group-hover:scale-110" />
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AjouterUserPage;