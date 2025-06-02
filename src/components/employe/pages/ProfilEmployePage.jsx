// src/components/employe/pages/ProfilEmployePage.jsx
import React, { useState } from 'react';
import { UserCircle, Mail, Phone, Briefcase, Edit, Save, X } from 'lucide-react';

// Supposons que l'objet user complet est passé en prop
const ProfilEmployePage = ({ user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  // Initialiser les champs du formulaire avec les données de l'utilisateur
  // Dans une vraie application, vous auriez plus de champs et une meilleure gestion d'état
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    // Ajoutez d'autres champs modifiables ici, par exemple :
    // telephone: user?.telephone || '', 
    // poste: user?.poste || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Si on annule l'édition, réinitialiser aux données utilisateur originales
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici, vous appelleriez onUpdateProfile(formData) pour envoyer les données au parent/backend
    console.log("Profil mis à jour (simulation):", formData);
    // Simuler la mise à jour et sortir du mode édition
    if (onUpdateProfile) { // Vérifier si la prop est fournie avant de l'appeler
        onUpdateProfile(formData); 
    }
    setIsEditing(false);
    // alert("Profil mis à jour (simulation). L'intégration avec InterfaceEmploye est nécessaire pour une sauvegarde réelle."); // Peut-être remplacer par une notification
  };

  if (!user) {
    return <div className="p-6 text-center">Chargement du profil...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 md:p-8">
        <div className="flex flex-col items-center md:flex-row md:items-start mb-6 md:mb-8">
          {user.profileImage ? (
            <img 
              src={user.profileImage} 
              alt="Photo de profil" 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-sky-500 shadow-md mb-4 md:mb-0 md:mr-8"
              onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/default-profile.png';}}
            />
          ) : (
            <UserCircle size={100} className="text-slate-400 dark:text-slate-500 mb-4 md:mb-0 md:mr-8" />
          )}
          <div className="text-center md:text-left flex-grow">
            {!isEditing ? (
              <>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">{formData.name}</h1> {/* Afficher depuis formData pour voir les modifs en direct si on ne sauvegarde pas */}
                <p className="text-md text-sky-600 dark:text-sky-400">{user.role ? user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Employé'}</p>
              </>
            ) : (
               <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 bg-transparent border-b-2 border-sky-500 focus:outline-none w-full mb-1"
                />
            )}
          </div>
          {!isEditing ? (
            <button 
              onClick={handleEditToggle} 
              className="btn btn-secondary-outline btn-sm mt-4 md:mt-0 py-2 px-3 flex items-center self-center md:self-start"
            >
              <Edit size={16} className="mr-2"/> Modifier le profil
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Email</label>
              {!isEditing ? (
                <p className="text-md text-slate-800 dark:text-slate-100 flex items-center"><Mail size={16} className="mr-2 text-slate-400"/>{formData.email}</p>
              ) : (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input w-full py-2 text-md"
                />
              )}
            </div>

            {/* Vous pouvez ajouter d'autres champs ici, en suivant le même modèle */}
            {/* Exemple:
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Téléphone</label>
              {!isEditing ? (
                <p className="text-md text-slate-800 dark:text-slate-100 flex items-center">
                  <Phone size={16} className="mr-2 text-slate-400"/>
                  {formData.telephone || user.telephone || 'Non renseigné'}
                </p>
              ) : (
                <input 
                  type="tel" 
                  name="telephone" 
                  value={formData.telephone || ''} 
                  onChange={handleInputChange} 
                  className="form-input w-full py-2 text-md"
                  placeholder="Votre numéro de téléphone"
                />
              )}
            </div>
            */}
            
            {isEditing && (
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t dark:border-slate-700">
                <button 
                  type="button" 
                  onClick={handleEditToggle} 
                  className="btn btn-secondary py-2 px-4"
                >
                  <X size={18} className="mr-1.5"/> Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary py-2 px-4 flex items-center"
                >
                  <Save size={18} className="mr-1.5"/> Sauvegarder les modifications
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
      <style jsx="true">{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ProfilEmployePage;
