import React, { useState } from 'react';
import { UserPlus, Image as ImageIcon, User, Mail, Phone, Key, Eye, EyeOff, Save, XCircle, ArrowLeft } from 'lucide-react';

// InputField est maintenant défini globalement ou importé, assurez-vous qu'il est cohérent
const InputField = ({ label, name, type = "text", value, onChange, error, icon: Icon, hasToggle, onToggle, show }) => (
    <div>
        <label htmlFor={name} className="form-label">{label}</label>
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


const AjouterUserPage = ({ onAddUser, onCancel }) => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    login: '',
    email: '',
    motDePasse: '',
    numTelephone: '',
    role: 'E',
    actif: true,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: null })); // Clear error on input change
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      if (imagePreview && imagePreview.startsWith('blob:')) { // Clean up previous blob URL
          URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis.";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis.";
    if (!formData.login.trim()) newErrors.login = "Le login est requis.";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email n'est pas valide.";
    if (!formData.motDePasse || formData.motDePasse.length < 4) newErrors.motDePasse = "Mot de passe de 4 caractères min. requis.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAddUser(formData, photoFile);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen"> {/* Ajustement padding et bg */}
      <div className="max-w-4xl mx-auto">
        <button onClick={onCancel} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 font-semibold mb-6 transition-colors duration-200">
            <ArrowLeft size={16} />
            Retour à la liste des utilisateurs
        </button>
        <div className="bg-white dark:bg-slate-800/80 p-8 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700"> {/* Ajustement padding et border */}
          <div className="text-center mb-6">
            <UserPlus className="h-8 w-8 text-blue-600 mx-auto mb-2" /> {/* Icône bleue */}
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ajouter un Nouvel Utilisateur</h1> {/* H1 style */}
          </div>
          <form onSubmit={handleSubmit} className="space-y-6"> {/* Spacing ajusté */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-1 flex flex-col items-center space-y-2">
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-700 overflow-hidden">
                  {imagePreview ? <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" /> : <ImageIcon className="h-12 w-12 text-slate-400" />}
                </div>
                <label htmlFor="photo" className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
                    <ImageIcon size={14} className="mr-1.5"/> Choisir une image
                </label>
                <input type="file" id="photo" name="photo" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Prénom" name="prenom" value={formData.prenom} onChange={handleInputChange} error={errors.prenom} icon={User} />
                <InputField label="Nom" name="nom" value={formData.nom} onChange={handleInputChange} error={errors.nom} icon={User} />
                <InputField label="Login" name="login" value={formData.login} onChange={handleInputChange} error={errors.login} icon={User} />
                <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} icon={Mail} />
                <InputField label="Mot de passe" name="motDePasse" type={showPassword ? "text" : "password"} value={formData.motDePasse} onChange={handleInputChange} error={errors.motDePasse} icon={Key} hasToggle={true} onToggle={() => setShowPassword(!showPassword)} show={showPassword} />
                <InputField label="N° Téléphone" name="numTelephone" value={formData.numTelephone} onChange={handleInputChange} icon={Phone} />
                <div>
                  <label className="form-label">Rôle</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} className="form-select">
                    <option value="E">Utilisateur</option> {/* Texte ajusté */}
                    <option value="A">Administrateur</option>
                    <option value="C">Chef d'équipe</option>
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <input type="checkbox" id="actif" name="actif" checked={formData.actif} onChange={handleInputChange} className="form-checkbox" />
                  <label htmlFor="actif" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">Actif</label>
                </div>
              </div>
            </div>
            <div className="pt-6 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700"> {/* Boutons standardisés */}
              <button type="button" onClick={onCancel} className="btn btn-secondary"><XCircle size={16} className="mr-1.5"/> Annuler</button>
              <button type="submit" className="btn btn-primary"><Save size={16} className="mr-1.5"/> Confirmer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AjouterUserPage;