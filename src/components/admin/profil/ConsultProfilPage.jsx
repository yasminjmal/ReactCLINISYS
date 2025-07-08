// src/pages/UserProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    Camera,
    Mail,
    Phone,
    User,
    Key,
    Save,
    X,
    Edit,
    BarChart2,
    CheckCircle,
    Clipboard,
    Eye,
    EyeOff,
    Users
} from 'lucide-react';

import userService from '../../../services/userService';
import utilisateurService from '../../../services/utilisateurService';
import defaultUserProfileImage from '../../../assets/images/default-profile.png';
import dashboardService from '../../../services/dashboardService';
import { toast } from 'react-toastify';

// Composant réutilisable pour une carte de profil
const ProfileCard = ({ children, title, actionButton }) => (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
            {actionButton}
        </div>
        <div className="p-6 space-y-4">
            {children}
        </div>
    </div>
);

// Composant réutilisable pour une tuile de statistique
const StatTile = ({ icon, value, label, colorClass }) => (
    <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    </div>
);


const UserProfilePage = ({ onNavigateBack }) => {
    const [formData, setFormData] = useState({});
    const { currentUser } = useAuth();
    const [originalData, setOriginalData] = useState({});
    const [photoFile, setPhotoFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(defaultUserProfileImage);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({});
    const [user, setUser] = useState(null); // L'état initial est null, ce qui affiche le chargement
    const [isLoading, setIsLoading] = useState(true); // État de chargement explicite

    // --- ✨ LOGIQUE DE CHARGEMENT COMBINÉE DANS UN SEUL useEffect ---
    useEffect(() => {
        const loadAllUserData = async () => {
            if (currentUser && currentUser.id) {
                try {
                    // 1. Récupérer les données primaires de l'utilisateur
                    const response = await userService.getUserById(currentUser.id);
                    const userData = response;

                    if (!userData) {
                        toast.error("Impossible de trouver les données de l'utilisateur.");
                        setIsLoading(false);
                        return;
                    }

                    // 2. Mettre à jour TOUS les états associés en une seule fois
                    setUser(userData);

                    const initialFormData = {
                        prenom: userData.prenom || '',
                        nom: userData.nom || '',
                        login: userData.login || '',
                        email: userData.email || '',
                        numTelephone: userData.numTelephone || '',
                        role: userData.role || 'E',
                        actif: userData.actif !== undefined ? userData.actif : true,
                        motDePasse: '',
                        confirmPassword: ''
                    };
                    setFormData(initialFormData);
                    setOriginalData(initialFormData);

                    if (userData.photo) {
                        setPreviewImage(`data:image/jpeg;base64,${userData.photo}`);
                    } else {
                        setPreviewImage(defaultUserProfileImage);
                    }

                    // 3. Récupérer les données secondaires (statistiques)
                    try {
                        const stats = await dashboardService.getUserPerformanceStats('thismonth');
                        const currentUserStats = stats.find(s => s.userName === `${userData.prenom} ${userData.nom}`);
                        if (currentUserStats) {
                            setUserStats({
                                ticketsCompleted: currentUserStats.ticketsCompleted,
                                onTimeRate: `${currentUserStats.onTimeRate}%`
                            });
                        }
                    } catch (statsError) {
                        console.error("Impossible de charger les statistiques de performance :", statsError);
                    }

                } catch (error) {
                    console.error("Erreur de chargement des données de l'utilisateur:", error);
                    toast.error("Échec du chargement des données de l'utilisateur.");
                } finally {
                    // 4. Arrêter le chargement, que ce soit un succès ou un échec
                    setIsLoading(false);
                }
            } else {
                // S'il n'y a pas de currentUser, arrêter le chargement
                setIsLoading(false);
            }
        };

        loadAllUserData();
    }, [currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleCancelEdit = () => {
        setFormData(originalData);
        setErrors({});
        setPhotoFile(null);
        if (user.photo) {
            setPreviewImage(`data:image/jpeg;base64,${user.photo}`);
        } else {
            setPreviewImage(defaultUserProfileImage);
        }
        setIsEditing(false);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.prenom?.trim()) newErrors.prenom = "Le prénom est requis.";
        if (!formData.nom?.trim()) newErrors.nom = "Le nom est requis.";
        if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'e-mail n'est pas valide.";
        if (formData.motDePasse && formData.motDePasse.length < 6) {
            newErrors.motDePasse = "Le mot de passe doit contenir au moins 6 caractères.";
        }
        if (formData.motDePasse !== formData.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const dataToSubmit = {
            nom: formData.nom,
            prenom: formData.prenom,
            login: formData.login,
            email: formData.email,
            numTelephone: formData.numTelephone,
            role: formData.role,
            actif: formData.actif,
        };

        if (formData.motDePasse) {
            dataToSubmit.motDePasse = formData.motDePasse;
        }

        try {
            await utilisateurService.updateUtilisateur(user.id, dataToSubmit, photoFile);
            toast.success('Profil mis à jour avec succès !');
            const updatedUser = { ...user, ...formData, photo: photoFile ? URL.createObjectURL(photoFile) : user.photo };
            setUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error("Échec de la mise à jour du profil:", error);
            toast.error("Échec de la mise à jour du profil. Veuillez réessayer.");
            setErrors({ submit: "Échec de la mise à jour du profil. Veuillez réessayer." });
        }
    };

    const roleMap = { 'A': 'Administrateur', 'C': 'Chef d\'équipe', 'E': 'Employé' };
    const fileInputRef = useRef(null);
    const [userStats, setUserStats] = useState({ ticketsCompleted: 'N/A', onTimeRate: 'N/A' });
    const [showPassword, setShowPassword] = useState(false);

    // Affichage pendant le chargement
    if (isLoading) {
        return <div className="p-6 text-center text-slate-700 dark:text-slate-300">Chargement du profil...</div>;
    }

    // Affichage si l'utilisateur n'a pas pu être chargé
    if (!user) {
        return <div className="p-6 text-center text-red-500">Impossible de charger le profil utilisateur. Veuillez réessayer plus tard.</div>;
    }

    return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <button onClick={onNavigateBack} className="text-slate-600 dark:text-slate-300 hover:text-sky-500 flex items-center mb-4">
                        <X size={18} className="mr-2"/> Retour
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Profil Utilisateur</h1>
                </div>

                <form onSubmit={handleSaveChanges}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Colonne de gauche */}
                        <div className="lg:col-span-1 space-y-8">
                            <ProfileCard title="Aperçu du Profil">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative">
                                        <img src={previewImage} alt="Profile" className="h-32 w-32 rounded-full object-cover ring-4 ring-slate-200 dark:ring-slate-700" onError={(e) => { e.currentTarget.src = defaultUserProfileImage; }}/>
                                        {isEditing && ( <button type="button" onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full"> <Camera size={16} /> </button> )}
                                        <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*"/>
                                    </div>
                                    <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-100">{formData.prenom} {formData.nom}</h2>
                                    <p className="text-slate-500 dark:text-slate-400">{roleMap[formData.role] || 'Utilisateur'}</p>
                                    <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${formData.actif ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}> {formData.actif ? 'Actif' : 'Inactif'} </span>
                                </div>
                            </ProfileCard>
                            <ProfileCard title="Performance (Ce Mois-ci)">
                                <StatTile icon={<BarChart2 size={20} className="text-white" />} value={userStats.ticketsCompleted} label="Tickets Terminés" colorClass="bg-sky-500"/>
                                <StatTile icon={<CheckCircle size={20} className="text-white" />} value={userStats.onTimeRate} label="Taux de Ponctualité" colorClass="bg-emerald-500"/>
                            </ProfileCard>
                        </div>

                        {/* Colonne de droite */}
                        <div className="lg:col-span-2 space-y-8">
                            <ProfileCard title="Informations Personnelles" actionButton={!isEditing && <button type="button" onClick={() => setIsEditing(true)} className="btn-secondary btn-sm"><Edit size={14} className="mr-2"/> Modifier</button>}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Prénom" name="prenom" value={formData.prenom} onChange={handleInputChange} error={errors.prenom} icon={<User />} disabled={!isEditing} />
                                    <InputField label="Nom" name="nom" value={formData.nom} onChange={handleInputChange} error={errors.nom} icon={<User />} disabled={!isEditing} />
                                    <InputField label="Login" name="login" value={formData.login} icon={<User />} disabled={true} />
                                    <InputField label="Adresse E-mail" name="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} icon={<Mail />} disabled={!isEditing} hasCopy={true}/>
                                    <InputField label="Numéro de Téléphone" name="numTelephone" value={formData.numTelephone} onChange={handleInputChange} icon={<Phone />} disabled={!isEditing} hasCopy={true}/>
                                </div>
                            </ProfileCard>
                            {isEditing && (
                                <ProfileCard title="Sécurité & Paramètres">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Changer le Mot de Passe</h4>
                                            <InputField label="Nouveau Mot de Passe" name="motDePasse" type={showPassword ? "text" : "password"} value={formData.motDePasse} onChange={handleInputChange} icon={<Key />} error={errors.motDePasse} placeholder="Laisser vide pour conserver l'actuel" hasToggle={true} onToggle={() => setShowPassword(!showPassword)} show={showPassword}/>
                                            <InputField label="Confirmer le Nouveau Mot de Passe" name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleInputChange} icon={<Key />} error={errors.confirmPassword} hasToggle={true} onToggle={() => setShowPassword(!showPassword)} show={showPassword}/>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Rôle & Statut</h4>
                                            <div>
                                                <label htmlFor="role" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Rôle</label>
                                                <div className="relative">
                                                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"> <Users className="h-5 w-5 text-slate-400" /> </div>
                                                    <select id="role" name="role" value={formData.role} onChange={handleInputChange} className="form-input pl-10 w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:ring-sky-500">
                                                        <option value="A">Administrateur</option>
                                                        <option value="C">Chef d'équipe</option>
                                                        <option value="E">Employé</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2 pt-2">
                                                <label className="flex items-center space-x-3 cursor-pointer">
                                                    <input type="checkbox" checked={formData.actif} onChange={(e) => setFormData(prev => ({ ...prev, actif: e.target.checked }))} className="sr-only peer" />
                                                    <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-sky-600"></div>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-300">Le compte est {formData.actif ? 'Actif' : 'Inactif'}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </ProfileCard>
                            )}
                            {isEditing && ( <div className="flex justify-end gap-4 mt-8"> <button type="button" onClick={handleCancelEdit} className="btn btn-secondary"><X size={16} className="mr-2"/> Annuler</button> <button type="submit" className="btn btn-primary"><Save size={16} className="mr-2"/> Enregistrer</button> </div> )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Le composant InputField
const InputField = ({ label, name, value, onChange, icon, type = 'text', placeholder = '', disabled = false, error, hasCopy = false, hasToggle = false, onToggle, show }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
               {React.cloneElement(icon, { className: "h-5 w-5 text-slate-400"})}
            </div>
            <input type={type} id={name} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} disabled={disabled} className={`form-input pl-10 w-full ${disabled ? 'bg-slate-100 dark:bg-slate-700/50 cursor-not-allowed' : 'bg-white dark:bg-slate-800'} border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:ring-sky-500 ${error ? 'border-red-500' : ''}`} />
            {hasCopy && !disabled && (
                <button type="button" onClick={() => { navigator.clipboard.writeText(value); toast.info('Copié dans le presse-papiers !'); }} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-sky-500">
                    <Clipboard size={16} />
                </button>
            )}
            {hasToggle && (
                 <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-sky-500">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

export default UserProfilePage;