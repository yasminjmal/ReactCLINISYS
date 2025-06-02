// src/components/admin/Profil/ConsultProfilPage.jsx
import React, { useState, useEffect } from 'react';
import { UserCircle, Mail, Briefcase, Phone, CalendarDays, KeyRound, Edit3, Save, XCircle, Eye, EyeOff, CheckCircle, Home } from 'lucide-react'; // Ajout de Home

const ConsultProfilPage = ({ user: initialUser, onUpdateProfile, onNavigateHome }) => { // Ajout de onNavigateHome
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [formData, setFormData] = useState({
    prenom: initialUser?.prenom || '',
    nom: initialUser?.nom || '',
    email: initialUser?.email || '',
    num_telephone: initialUser?.num_telephone || '',
    nom_utilisateur: initialUser?.nom_utilisateur || '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setUser(initialUser);
    setFormData({
        prenom: initialUser?.prenom || '',
        nom: initialUser?.nom || '',
        email: initialUser?.email || '',
        num_telephone: initialUser?.num_telephone || '',
        nom_utilisateur: initialUser?.nom_utilisateur || '',
    });
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  }, [initialUser]);


  if (!user) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-slate-400">
        Chargement des informations du profil ou utilisateur non trouvé.
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
    if (passwordError) setPasswordError('');
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (passwordError) setPasswordError('');
  };

  const toggleEditMode = () => {
    if (isEditing) {
      setFormData({
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        num_telephone: user.num_telephone || '',
        nom_utilisateur: user.nom_utilisateur || '',
      });
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword || confirmPassword) {
      if (newPassword.length < 8) {
        setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
        return;
      }
    }
    
    const updatedUserData = { ...user, ...formData };
    if (newPassword) {
      updatedUserData.mot_de_passe = newPassword; // Dans une vraie app, ce serait hashé côté serveur
    }

    if (onUpdateProfile) {
      onUpdateProfile(updatedUserData);
    }
    setIsEditing(false); // Revenir au mode affichage après la soumission
  };

  const dateCreationFormatted = user.dateCreation 
    ? new Date(user.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) 
    : 'N/A';
  
  const userCreationDisplay = user.userCreation || 'Système';

  const passwordInputClass = newPassword.length >= 8 
    ? 'border-green-500 focus:ring-green-500 focus:border-green-500' 
    : 'border-slate-300 dark:border-slate-600 focus:ring-sky-500 focus:border-sky-500';

  const InfoItem = ({ icon, label, value, isEditable, name, type = "text", children }) => (
    <div className="flex items-start py-2">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400">
        {icon}
      </div>
      <div className="ml-3 flex-grow">
        <span className="block text-xs text-slate-500 dark:text-slate-400">{label}</span>
        {isEditing && isEditable ? (
          children || <input type={type} name={name} value={formData[name]} onChange={handleInputChange} className="form-input w-full text-sm mt-0.5" />
        ) : (
          <span className="font-medium text-slate-700 dark:text-slate-200 break-words">{value}</span>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
                {onNavigateHome && ( // Afficher le bouton Home seulement si la prop est fournie
                    <button
                        type="button"
                        onClick={onNavigateHome}
                        className="btn btn-secondary-icon group"
                        title="Retour à l'accueil"
                    >
                        <Home size={20} className="text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition-colors" />
                    </button>
                )}
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Mon Profil
                </h1>
            </div>
            {!isEditing && (
                <button 
                    type="button" 
                    onClick={toggleEditMode} 
                    className="btn btn-secondary-icon group"
                    title="Modifier le profil"
                >
                    <Edit3 size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition-colors" />
                </button>
            )}
        </div>

        <div className="md:flex md:space-x-8">
          {/* Colonne de Gauche (Image et infos non modifiables) */}
          <div className="md:w-1/3 flex flex-col items-center text-center md:text-left md:items-start mb-6 md:mb-0">
            {user.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={`Profil de ${user.prenom} ${user.nom}`} 
                className="w-36 h-36 rounded-full object-cover mb-4 border-4 border-slate-200 dark:border-slate-700 shadow-lg"
              />
            ) : (
              <UserCircle size={144} className="text-slate-300 dark:text-slate-600 mb-4" />
            )}
            <div className="w-full">
                 <InfoItem icon={<UserCircle size={20}/>} label="Créé par" value={userCreationDisplay} isEditable={false} />
                 <InfoItem icon={<CalendarDays size={20}/>} label="Date de création" value={dateCreationFormatted} isEditable={false} />
            </div>
          </div>

          {/* Colonne de Droite (Informations modifiables) */}
          <div className="md:w-2/3 space-y-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                {/* En mode affichage, on utilise user.prenom, en mode édition formData.prenom */}
                <InfoItem icon={<UserCircle size={20}/>} label="Prénom" value={isEditing ? formData.prenom : user.prenom} isEditable={true} name="prenom" />
                <InfoItem icon={<UserCircle size={20}/>} label="Nom" value={isEditing ? formData.nom : user.nom} isEditable={true} name="nom" />
            </div>
            <InfoItem icon={<Mail size={20}/>} label="Email" value={isEditing ? formData.email : user.email} isEditable={true} name="email" type="email" />
            <InfoItem icon={<Phone size={20}/>} label="Téléphone" value={isEditing ? formData.num_telephone : user.num_telephone} isEditable={true} name="num_telephone" />
            <InfoItem icon={<Briefcase size={20}/>} label="Nom d'utilisateur" value={isEditing ? formData.nom_utilisateur : user.nom_utilisateur} isEditable={true} name="nom_utilisateur" />
            
            {isEditing ? (
              <>
                <div className="pt-3 mt-2">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={handlePasswordChange}
                      className={`form-input w-full text-sm pr-10 ${passwordInputClass}`}
                      placeholder="Minimum 8 caractères"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 dark:text-slate-400">
                        {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                  {newPassword && newPassword.length < 8 && <p className="text-xs text-orange-500 mt-1">Le mot de passe est un peu court.</p>}
                  {newPassword && newPassword.length >= 8 && <p className="text-xs text-green-500 mt-1 flex items-center"><CheckCircle size={14} className="mr-1"/> Longueur de mot de passe acceptable.</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Confirmer le nouveau mot de passe</label>
                   <div className="relative">
                    <input 
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        className={`form-input w-full text-sm pr-10 ${(newPassword && confirmPassword && newPassword !== confirmPassword) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-sky-500 focus:border-sky-500'}`}
                        placeholder="Retapez le nouveau mot de passe"
                    />
                     <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 dark:text-slate-400">
                        {showConfirmPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
                {passwordError && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{passwordError}</p>}
              </>
            ) : (
              <InfoItem icon={<KeyRound size={20}/>} label="Mot de passe" value="**********" isEditable={false} />
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button 
              type="button" 
              onClick={toggleEditMode} 
              className="btn btn-secondary-outline group w-full sm:w-auto"
            >
              <XCircle size={18} className="mr-2" />
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn btn-primary group w-full sm:w-auto"
            >
              <Save size={18} className="mr-2" />
              Confirmer les modifications
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ConsultProfilPage;
