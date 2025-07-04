// src/components/employe/pages/ProfilEmployePage.jsx
import React, { useState, useEffect } from 'react';
import { UserCircle, Mail, Phone, Briefcase, Edit, Save, X } from 'lucide-react';
import utilisateurService from '../../../services/utilisateurService'; // Import the service

const ProfilEmployePage = ({ user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    prenom: user?.prenom || '', 
    nom: user?.nom || '',
    email: user?.email || '',
    numTelephone: user?.numTelephone || '', 
  });
  const [photoFile, setPhotoFile] = useState(null); 
  const [previewImage, setPreviewImage] = useState(user?.photo ? `data:image/jpeg;base64,${user.photo}` : '/assets/images/default-profile.png');


  useEffect(() => {
    if (user) {
      setFormData({
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        numTelephone: user.numTelephone || '',
      });
      setPreviewImage(user.photo ? `data:image/jpeg;base64,${user.photo}` : '/assets/images/default-profile.png');
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({
        prenom: user?.prenom || '',
        nom: user?.nom || '',
        email: user?.email || '',
        numTelephone: user?.numTelephone || '',
      });
      setPreviewImage(user?.photo ? `data:image/jpeg;base64,${user.photo}` : '/assets/images/default-profile.png');
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            prenom: formData.prenom,
            nom: formData.nom,
            email: formData.email,
            numTelephone: formData.numTelephone,
        };
        await utilisateurService.updateUtilisateur(user.id, payload, photoFile);
        
        if (onUpdateProfile) {
            onUpdateProfile({ ...user, ...payload, photo: photoFile ? await new Promise(resolve => { 
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(photoFile);
            }) : user.photo });
        }
        setIsEditing(false);
    } catch (error) {
        console.error("Error updating employee profile:", error);
    }
  };

  if (!user) {
    return <div className="p-6 text-center">Chargement du profil...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 md:p-8">
        <div className="flex flex-col items-center md:flex-row md:items-start mb-6 md:mb-8">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-sky-500 shadow-md mb-4 md:mb-0 md:mr-8 overflow-hidden">
            <img 
              src={previewImage} 
              alt="Photo de profil" 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/default-profile.png';}}
            />
            {isEditing && (
                <label htmlFor="photo-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <Edit size={24} className="text-white" />
                    <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
            )}
          </div>
          <div className="text-center md:text-left flex-grow">
            {!isEditing ? (
              <>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">{user.prenom} {user.nom}</h1>
                <p className="text-md text-sky-600 dark:text-sky-400">{user.role ? user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Employé'}</p> {/* Fixed regex escape */}
              </>
            ) : (
               <>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 bg-transparent border-b-2 border-sky-500 focus:outline-none w-full mb-1"
                  placeholder="Prénom"
                />
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 bg-transparent border-b-2 border-sky-500 focus:outline-none w-full mb-1"
                  placeholder="Nom"
                />
               </>
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

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Téléphone</label>
              {!isEditing ? (
                <p className="text-md text-slate-800 dark:text-slate-100 flex items-center">
                  <Phone size={16} className="mr-2 text-slate-400"/>
                  {formData.numTelephone || 'Non renseigné'}
                </p>
              ) : (
                <input 
                  type="tel" 
                  name="numTelephone" 
                  value={formData.numTelephone} 
                  onChange={handleInputChange} 
                  className="form-input w-full py-2 text-md"
                  placeholder="Votre numéro de téléphone"
                />
              )}
            </div>
            
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