// src/components/admin/Users/EditUserModal.jsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Key, Eye, EyeOff, Save, XCircle, Image as ImageIcon, Briefcase } from 'lucide-react';
import defaultProfilePic from '../../../assets/images/default-profile.png';

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


const EditUserModal = ({ user, onUpdateUser, onCancel, showTemporaryMessage }) => {
    const [formData, setFormData] = useState({
        prenom: user?.prenom || '',
        nom: user?.nom || '',
        login: user?.login || '',
        email: user?.email || '',
        motDePasse: '',
        numTelephone: user?.numTelephone || '',
        role: user?.role ?? '',
        actif: user?.actif ?? true,
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(defaultProfilePic);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user?.photo) {
            const detectMime = (b64) => {
                if (b64.startsWith("/9j/")) return "image/jpeg";
                if (b64.startsWith("iVBOR")) return "image/png";
                return "image/jpeg";
            };
            const mimeType = detectMime(user.photo);
            setImagePreview(`data:${mimeType};base64,${user.photo}`);
        } else {
            setImagePreview(defaultProfilePic);
        }
    }, [user.photo]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            if (imagePreview && imagePreview.startsWith('blob:')) {
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
        if (formData.motDePasse && formData.motDePasse.length < 4) newErrors.motDePasse = "Mot de passe de 4 caractères min. requis.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            const dataToSubmit = { ...formData };
            if (dataToSubmit.motDePasse === '') {
                delete dataToSubmit.motDePasse;
            }
            await onUpdateUser(user.id, dataToSubmit, photoFile);
        } else {
            console.error('Veuillez corriger les erreurs dans le formulaire.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl bg-white dark:bg-slate-800/80 p-3 md:p-6 rounded-xl shadow-2xl overflow-y-auto max-h-[95vh]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Modifier Utilisateur</h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div className="md:col-span-1 flex flex-col items-center space-y-2">
                            <div className="w-28 h-28 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-700 overflow-hidden">
                                <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = defaultProfilePic; }} />
                            </div>
                            <label htmlFor="photo" className="inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
                                <ImageIcon size={14} className="mr-1.5" /> Changer l'image
                            </label>
                            <input type="file" id="photo" name="photo" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Prénom" name="prenom" value={formData.prenom} onChange={handleInputChange} error={errors.prenom} icon={User} />
                            <InputField label="Nom" name="nom" value={formData.nom} onChange={handleInputChange} error={errors.nom} icon={User} />
                            <InputField label="Login" name="login" value={formData.login} onChange={handleInputChange} error={errors.login} icon={User} />
                            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} icon={Mail} />
                            <InputField label="Mot de passe (Laisser vide pour ne pas changer)" name="motDePasse" type={showPassword ? "text" : "password"} value={formData.motDePasse} onChange={handleInputChange} error={errors.motDePasse} icon={Key} hasToggle={true} onToggle={() => setShowPassword(!showPassword)} show={showPassword} />
                            <InputField label="N° Téléphone" name="numTelephone" value={formData.numTelephone} onChange={handleInputChange} icon={Phone} />
                            <div>
                                <label className="form-label">Rôle</label>
                                <select name="role" value={formData.role || ""} onChange={handleInputChange} className="form-select">
                                    <option value="" disabled>Choisir un rôle</option>
                                    <option value="E">Utilisateur</option>
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
                    <div className="pt-4 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onCancel} className="btn btn-secondary"><XCircle size={16} className="mr-1.5" /> Annuler</button>
                        <button type="submit" className="btn btn-primary"><Save size={16} className="mr-1.5" /> Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;