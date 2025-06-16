// src/components/admin/Users/EditUserModal.jsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Key, Eye, EyeOff, Save, XCircle, Image as ImageIcon, Briefcase } from 'lucide-react';
import defaultProfilePic from '../../../assets/images/default-profile.png';
import utilisateurService from '../../../services/utilisateurService';

// Helper for form fields (copied from AjouterUserPage for consistency)
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

const EditUserModal = ({ user, onUpdateUser, onCancel, showTemporaryMessage }) => {
    // Initialize form data with current user's details, using optional chaining and nullish coalescing for safety
    const [formData, setFormData] = useState({
        prenom: user?.prenom || '',
        nom: user?.nom || '',
        login: user?.login || '',
        email: user?.email || '',
        motDePasse: '', // Password is often not pre-filled for security, handle update separately
        numTelephone: user?.numTelephone || '',
        role: user?.role || 'ROLE_USER', // Default to ROLE_USER if not set
        actif: user?.actif ?? true, // Default to true if null/undefined
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoadingPhoto, setIsLoadingPhoto] = useState(true);

    // Effect to load user photo when modal opens or user changes
    useEffect(() => {
        const loadPhoto = async () => {
            setIsLoadingPhoto(true);
            try {
                // We fetch the photo using the service, which gets a Blob URL
                const photoUrl = await utilisateurService.getPhotoUtilisateur(user.id);
                setImagePreview(photoUrl || defaultProfilePic); // Use default if no photo
            } catch (error) {
                console.error("Error loading user photo:", error);
                setImagePreview(defaultProfilePic); // Fallback to default
            } finally {
                setIsLoadingPhoto(false);
            }
        };
        if (user?.id) { // Only load photo if user object and ID are available
            loadPhoto();
        } else {
            setImagePreview(defaultProfilePic); // Show default immediately if no user
            setIsLoadingPhoto(false);
        }
        // Cleanup function for URL.createObjectURL
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [user?.id]); // Rerun when user ID changes

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            if (imagePreview && imagePreview.startsWith('blob:')) { // Revoke previous blob URL
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
        // Password validation only if it's being changed (i.e., not empty)
        if (formData.motDePasse && formData.motDePasse.length < 4) newErrors.motDePasse = "Mot de passe de 4 caractères min. requis.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Prepare data: only include motDePasse if it's not empty, otherwise delete it
            const dataToSubmit = { ...formData };
            if (dataToSubmit.motDePasse === '') {
                delete dataToSubmit.motDePasse; // Don't send empty password if not changed
            }

            await onUpdateUser(user.id, dataToSubmit, photoFile);
        } else {
            showTemporaryMessage('error', 'Veuillez corriger les erreurs dans le formulaire.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl bg-white p-3 md:p-6 rounded-xl shadow-2xl animate-slide-in-up overflow-y-auto max-h-[95vh]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold text-slate-800">Modifier Utilisateur</h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div className="md:col-span-1 flex flex-col items-center space-y-2">
                            <div className="w-28 h-28 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden">
                                {isLoadingPhoto ? (
                                    <div className="animate-pulse bg-slate-200 h-full w-full rounded-full flex items-center justify-center">
                                        <ImageIcon className="h-12 w-12 text-slate-400" />
                                    </div>
                                ) : (
                                    <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <label htmlFor="photo" className="btn btn-secondary-outline text-xs py-1 px-2">Changer l'image</label>
                            <input type="file" id="photo" name="photo" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Form fields */}
                            <InputField label="Prénom" name="prenom" value={formData.prenom} onChange={handleInputChange} error={errors.prenom} icon={User} />
                            <InputField label="Nom" name="nom" value={formData.nom} onChange={handleInputChange} error={errors.nom} icon={User} />
                            <InputField label="Login" name="login" value={formData.login} onChange={handleInputChange} error={errors.login} icon={User} />
                            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} icon={Mail} />
                            <InputField label="Mot de passe (Laisser vide pour ne pas changer)" name="motDePasse" type={showPassword ? "text" : "password"} value={formData.motDePasse} onChange={handleInputChange} error={errors.motDePasse} icon={Key} hasToggle={true} onToggle={() => setShowPassword(!showPassword)} show={showPassword} />
                            <InputField label="N° Téléphone" name="numTelephone" value={formData.numTelephone} onChange={handleInputChange} icon={Phone} />
                            <div>
                                <label className="form-label text-sm">Rôle</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} className="form-select">
                                    <option value="ROLE_USER">Utilisateur</option>
                                    <option value="ROLE_ADMIN">Administrateur</option>
                                    <option value="ROLE_CHEF_EQUIPE">Chef d'équipe</option>
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
                        <button type="submit" className="btn btn-primary"><Save size={16} className="mr-1.5"/> Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;