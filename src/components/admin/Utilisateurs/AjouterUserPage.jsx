import React, { useState } from 'react';
import { UserPlus, Image as ImageIcon, User, Mail, Phone, Key, Eye, EyeOff, Save, XCircle, ArrowLeft, Briefcase } from 'lucide-react';

const AjouterUserPage = ({ onAddUser, onCancel }) => {
  // Initialisation de formData : assurez-vous que tous les champs du DTO backend sont ici
  // et avec des valeurs par défaut ou des chaînes vides pour éviter les 'undefined'
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    login: '',
    email: '',
    motDePasse: '', // Doit être présent et non vide si backend le requiert (min 4 chars)
    numTelephone: '', // Assurez-vous que le backend accepte une chaîne vide si non renseigné
    role: 'E', // Doit correspondre exactement à l'enum du backend (casse incluse)
    actif: true, // Doit être un boolean (true/false)
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Met à jour l'état du formulaire en fonction des inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Gère la sélection d'une image pour la photo de profil
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Validation des champs du formulaire côté frontend
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis.";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis.";
    if (!formData.login.trim()) newErrors.login = "Le login est requis.";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email n'est pas valide.";
    // Pour un nouvel utilisateur, le mot de passe est obligatoire et doit respecter la taille minimale
    if (!formData.motDePasse || formData.motDePasse.length < 4) newErrors.motDePasse = "Mot de passe de 4 caractères min. requis.";
    // Si 'numTelephone' est requis par le backend et que vous voulez le valider:
    // if (!formData.numTelephone.trim()) newErrors.numTelephone = "Le numéro de téléphone est requis.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Retourne true si aucune erreur
  };

  // Gère la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    if (validateForm()) {
      // Les données de formData sont envoyées telles quelles au service
      // Le service se chargera de les préparer pour le backend (JSON + photo)
      onAddUser(formData, photoFile);
    }
  };

  return (
    <div className="p-2 md:p-3 bg-slate-100 min-h-full flex justify-center items-start">
      <div className="w-full max-w-4xl bg-white p-3 md:p-6 rounded-xl shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 left-4 text-slate-500 hover:text-sky-600 p-1 rounded-full" title="Retourner"><ArrowLeft size={20} /></button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <UserPlus className="h-8 w-8 text-sky-600 mx-auto mb-2" />
            <h1 className="text-xl font-bold text-slate-800">Ajouter un Nouvel Utilisateur</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-1 flex flex-col items-center space-y-2">
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden">
                {imagePreview ? <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" /> : <ImageIcon className="h-12 w-12 text-slate-400" />}
              </div>
              <label htmlFor="photo" className="btn btn-secondary-outline text-xs py-1 px-2">Choisir une image</label>
              <input type="file" id="photo" name="photo" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Champs de formulaire */}
              <InputField label="Prénom" name="prenom" value={formData.prenom} onChange={handleInputChange} error={errors.prenom} icon={User} />
              <InputField label="Nom" name="nom" value={formData.nom} onChange={handleInputChange} error={errors.nom} icon={User} />
              <InputField label="Login" name="login" value={formData.login} onChange={handleInputChange} error={errors.login} icon={User} />
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} icon={Mail} />
              <InputField label="Mot de passe" name="motDePasse" type={showPassword ? "text" : "password"} value={formData.motDePasse} onChange={handleInputChange} error={errors.motDePasse} icon={Key} hasToggle={true} onToggle={() => setShowPassword(!showPassword)} show={showPassword} />
              <InputField label="N° Téléphone" name="numTelephone" value={formData.numTelephone} onChange={handleInputChange} icon={Phone} />
              <div>
                <label className="form-label text-sm">Rôle</label>
                <select name="role" value={formData.role} onChange={handleInputChange} className="form-select">
                  <option value="E">Emloyee</option>
                  <option value="A">Administrateur</option> {/* Assurez-vous que la casse correspond au backend */}
                  <option value="C">Chef d'équipe</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <input type="checkbox" id="actif" name="actif" checked={formData.actif} onChange={handleInputChange} className="form-checkbox" />
                <label htmlFor="actif" className="ml-2">Actif</label>
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <button type="button" onClick={onCancel} className="btn btn-secondary"><XCircle size={16} className="mr-1.5"/> Annuler</button>
            <button type="submit" className="btn btn-primary"><Save size={16} className="mr-1.5"/> Confirmer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Petit composant helper pour les champs de formulaire (inchangé)
const InputField = ({ label, name, type = "text", value, onChange, error, icon: Icon, hasToggle, onToggle, show }) => (
    <div>
        <label htmlFor={name} className="form-label text-sm">{label}</label>
        <div className="form-icon-wrapper">
            <Icon size={16} className="form-icon" />
            <input type={type} name={name} id={name} value={value} onChange={onChange} className={`form-input-icon ${error ? 'border-red-500' : ''}`} />
            {hasToggle && (
                <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            )}
        </div>
        {error && <p className="form-error-text">{error}</p>}
    </div>
);

export default AjouterUserPage;