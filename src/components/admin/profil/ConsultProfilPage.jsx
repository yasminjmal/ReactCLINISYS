// src/components/admin/profil/ConsultProfilPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    ArrowLeft, 
    Camera, 
    Trash2, 
    Calendar, 
    User, 
    Mail, 
    Phone, 
    Briefcase,
    ChevronDown,
    Copy,
    Key, 
    Eye, 
    EyeOff 
} from 'lucide-react';
import defaultUserProfileImage from '../../../assets/images/default-profile.png';
import userService from '../../../services/userService'; // Changed from utilisateurService to userService

const ToggleSwitch = ({ enabled, setEnabled, label }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <button
            type="button"
            className={`${
            enabled ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-600'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:ring-offset-slate-800`}
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
        >
            <span
            aria-hidden="true"
            className={`${
                enabled ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    </div>
);

const ProgressBar = ({ value, label }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{value}%</span>
    </div>
    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
        <div
        className="bg-sky-500 h-2 rounded-full"
        style={{ width: `${value}%` }}
        ></div>
    </div>
  </div>
);


const DetailInput = ({ label, name, value, onChange, icon, type = 'text', placeholder = '', hasToggle, onToggle, show, error, readOnly = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
               {React.cloneElement(icon, { className: "h-5 w-5 text-slate-400"})}
            </div>
            <input
                type={type}
                id={name}
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                readOnly={readOnly} // Add readOnly prop
                className={`form-input pl-10 w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:ring-sky-500 ${error ? 'border-red-500' : ''} ${readOnly ? 'bg-slate-100 dark:bg-slate-700 cursor-not-allowed' : ''}`}
            />
             {(name === "email" || name === "numTelephone") && ( 
                <button type="button" onClick={() => navigator.clipboard.writeText(value)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-sky-500">
                        <Copy size={16} />
                </button>
             )}
             {hasToggle && (
                <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            )}
        </div>
        {error && <p className="form-error-text">{error}</p>}
    </div>
);


const ConsultProfilPage = ({ user, onUpdateProfile, onNavigateHome }) => {
  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const fileInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoadingDetails, setIsLoadingDetails] = useState(true); // New loading state for details
  const [fetchedUser, setFetchedUser] = useState(null); // New state for fetched user data


  useEffect(() => {
    const fetchUserDetails = async () => {
        if (!user || !user.login) { 
            setIsLoadingDetails(false);
            return;
        }
        setIsLoadingDetails(true);
        try {
            const response = await userService.getUserByLogin(user.login); 
            const detailedUserData = response.data;
            
            // Vérifier si detailedUserData est valide avant d'y accéder
            if (!detailedUserData) {
                console.warn("userService.getUserByLogin returned no data for user:", user.login);
                // Fallback to basic user data from AuthContext if no detailed data
                setFetchedUser(user); 
                setFormData({
                    prenom: user.prenom || '',
                    nom: user.nom || '',
                    login: user.login || '', 
                    email: user.email || '',
                    numTelephone: user.numTelephone || '', 
                    role: user.role || 'E',
                    actif: user.actif || true, 
                    poste: '', // Pas de poste connu sans detailedUserData
                    motDePasse: '', 
                    confirmPassword: '' 
                });
                if (user.photo) {
                    setPreviewImage(`data:image/jpeg;base64,${user.photo}`);
                } else {
                    setPreviewImage(defaultUserProfileImage);
                }
                return; // Sort early
            }

            setFetchedUser(detailedUserData); // Store fetched user data

            // Extraire la désignation du poste de manière sécurisée
            const posteDesignation = detailedUserData.equipePosteSet && detailedUserData.equipePosteSet.length > 0
                ? detailedUserData.equipePosteSet[0].poste?.designation || ''
                : '';

            setFormData({
                prenom: detailedUserData.prenom || '',
                nom: detailedUserData.nom || '',
                login: detailedUserData.login || '', 
                email: detailedUserData.email || '',
                numTelephone: detailedUserData.numTelephone || '', 
                role: detailedUserData.role || 'E',
                actif: detailedUserData.actif || true, 
                poste: posteDesignation, 
                motDePasse: '', 
                confirmPassword: '' 
            });
            if (detailedUserData.photo) {
                setPreviewImage(`data:image/jpeg;base64,${detailedUserData.photo}`);
            } else {
                setPreviewImage(defaultUserProfileImage);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des détails de l'utilisateur:", error);
            // En cas d'erreur de l'API, revenir aux données de base du contexte
            setFetchedUser(user); 
            
            // Fallback pour le poste si erreur API
            const fallbackPoste = user.equipePosteSet && user.equipePosteSet.length > 0
                ? user.equipePosteSet[0].poste?.designation || ''
                : user.poste || ''; 

            setFormData({
                prenom: user.prenom || '',
                nom: user.nom || '',
                login: user.login || '', 
                email: user.email || '',
                numTelephone: user.numTelephone || '', 
                role: user.role || 'E',
                actif: user.actif || true, 
                poste: fallbackPoste, 
                motDePasse: '', 
                confirmPassword: '' 
            });
            if (user.photo) { 
                setPreviewImage(`data:image/jpeg;base64,${user.photo}`);
            } else {
                setPreviewImage(defaultUserProfileImage);
            }
        } finally {
            setIsLoadingDetails(false);
        }
    };

    fetchUserDetails();
  }, [user]); 


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null })); 
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis.";
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis.";
    if (!formData.login.trim()) newErrors.login = "Le login est requis.";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email n'est pas valide."; 

    if (formData.motDePasse) {
        if (formData.motDePasse.length < 4) newErrors.motDePasse = "Mot de passe de 4 caractères min. requis.";
        if (formData.motDePasse !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    } else if (formData.confirmPassword) { 
        newErrors.motDePasse = "Veuillez entrer un nouveau mot de passe.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (validateForm()) {
        const dataToSubmit = { ...formData };
        if (dataToSubmit.motDePasse === '') {
            delete dataToSubmit.motDePasse; 
        }
        delete dataToSubmit.confirmPassword; 

        const roleMapping = { 'Administrateur': 'A', 'Chef d\'équipe': 'C', 'Utilisateur': 'E', 'A': 'A', 'C': 'C', 'E': 'E' };
        dataToSubmit.role = roleMapping[dataToSubmit.role] || dataToSubmit.role; 

        // Le champ 'poste' n'est pas directement modifiable via cette API si il est géré par equipePosteSet
        // On le supprime de dataToSubmit avant d'envoyer au backend.
        delete dataToSubmit.poste; 

        await onUpdateProfile(user.id, dataToSubmit, photoFile); 
    } else {
        console.error('Please correct the errors in the form.');
    }
  };
  
  if (isLoadingDetails) {
    return <div className="p-6 text-center text-slate-700 dark:text-slate-300">Chargement des détails du profil...</div>;
  }

  // Utiliser fetchedUser pour l'affichage, ou revenir à 'user' du AuthContext si la récupération a échoué
  const userToDisplay = fetchedUser || user;

  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-full">
        <form onSubmit={handleSaveChanges}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onNavigateHome} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <ArrowLeft className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                    </button>
                    <div className="flex items-center gap-3">
                        <img src={previewImage} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {userToDisplay.prenom} {userToDisplay.nom}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {userToDisplay.dateCreation && ( 
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            Added on {new Date(userToDisplay.dateCreation).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Profile Image */}
                    <div className="card-white">
                        <h3 className="card-header">Profile Image</h3>
                        <div className="p-6">
                            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden ring-4 ring-slate-200 dark:ring-slate-700">
                                <img src={previewImage} alt="Profile Preview" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = defaultUserProfileImage; }}/>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="mt-6 w-full btn btn-secondary"
                            >
                                <Camera size={16} className="mr-2" />
                                Change Profile Image
                            </button>
                        </div>
                    </div>
                    
                    {/* User Details */}
                    <div className="card-white">
                         <h3 className="card-header">User Details</h3>
                         <div className="p-6 space-y-4">
                            <DetailInput label="First Name" name="prenom" value={formData.prenom} onChange={handleInputChange} error={errors.prenom} icon={<User />} />
                            <DetailInput label="Last Name" name="nom" value={formData.nom} onChange={handleInputChange} error={errors.nom} icon={<User />} />
                            <DetailInput label="Login" name="login" value={formData.login} onChange={handleInputChange} error={errors.login} icon={<User />} readOnly={true} /> {/* Login is usually read-only */}
                            <DetailInput label="Email Address" name="email" value={formData.email} onChange={handleInputChange} error={errors.email} icon={<Mail />} />
                            <DetailInput label="Phone Number" name="numTelephone" value={formData.numTelephone} onChange={handleInputChange} icon={<Phone />} />
                            <DetailInput label="Position (Read-Only for Admin)" name="poste" value={formData.poste || 'N/A'} icon={<Briefcase />} readOnly={true} /> {/* Use formData.poste for display */}
                         </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Role & Password */}
                        <div className="space-y-8">
                            <div className="card-white">
                                <h3 className="card-header">Role & Status</h3>
                                <div className="p-6">
                                     <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Role</label>
                                     <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="form-select w-full bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:ring-sky-500"
                                        disabled={true} // Role is usually read-only for current user
                                    >
                                        <option value="E">Employee</option>
                                        <option value="C">Team Lead</option>
                                        <option value="A">Administrator</option>
                                    </select>
                                    <div className="mt-4">
                                        <ToggleSwitch label="Active Account" enabled={formData.actif} setEnabled={(val) => setFormData(prev => ({...prev, actif: val}))} />
                                    </div>
                                </div>
                            </div>
                            <div className="card-white">
                                <h3 className="card-header">Change Password</h3>
                                <div className="p-6 space-y-4">
                                   <DetailInput 
                                        label="New Password" 
                                        name="motDePasse" 
                                        type={showPassword ? "text" : "password"} 
                                        value={formData.motDePasse} 
                                        onChange={handleInputChange} 
                                        icon={<Key />} 
                                        hasToggle={true} 
                                        onToggle={() => setShowPassword(!showPassword)} 
                                        show={showPassword} 
                                        placeholder="Leave blank to keep current"
                                        error={errors.motDePasse}
                                    />
                                   <DetailInput 
                                        label="Confirm New Password" 
                                        name="confirmPassword" 
                                        type={showPassword ? "text" : "password"} 
                                        value={formData.confirmPassword} 
                                        onChange={handleInputChange} 
                                        icon={<Key />} 
                                        hasToggle={true} 
                                        onToggle={() => setShowPassword(!showPassword)} 
                                        show={showPassword} 
                                        error={errors.confirmPassword}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Info / Future Sections */}
                        <div className="space-y-8">
                             <div className="card-white">
                                <h3 className="card-header">Additional Info (Future)</h3>
                                <div className="p-6">
                                    <p className="text-slate-500 text-sm italic">This section can be extended with more user details or settings later.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-10 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-6">
                <button type="button" onClick={onNavigateHome} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
        </form>
    </div>
  );
};

export default ConsultProfilPage;