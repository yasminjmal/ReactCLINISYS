import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Edit, Camera, KeyRound } from 'lucide-react';
import utilisateurService from '../../services/utilisateurService'; // Assurez-vous d'utiliser le service consolidé

const ProfilAdmin = ({ currentUser, refetchData, showTemporaryMessage }) => {

    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        // Pour la sécurité, les champs de mot de passe sont vides par défaut
        currentPassword: '', 
        newPassword: '',
        confirmPassword: ''
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [previewPhoto, setPreviewPhoto] = useState(null);

    // Initialiser le formulaire avec les données de l'utilisateur actuel
    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                prenom: currentUser.prenom || '',
                nom: currentUser.nom || '',
                email: currentUser.email || ''
            }));
            setPreviewPhoto(getProfileImageUrl(currentUser));
        }
    }, [currentUser]);

    // Helper pour afficher la photo
    const getProfileImageUrl = (user) => {
        if (user?.photo) {
            return `data:image/jpeg;base64,${user.photo}`;
        }
        return `https://i.pravatar.cc/150?u=${user?.id || 'default'}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPreviewPhoto(URL.createObjectURL(file)); // Affiche un aperçu local
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            showTemporaryMessage('error', 'Les nouveaux mots de passe ne correspondent pas.');
            return;
        }

        // Préparez les données de l'utilisateur à envoyer
        const userDataToUpdate = {
            prenom: formData.prenom,
            nom: formData.nom,
            email: formData.email,
        };
        // Ajoutez le mot de passe seulement s'il est changé
        if (formData.newPassword) {
            // NOTE: Le backend doit gérer la vérification de l'ancien mot de passe
            // et le hachage du nouveau. L'envoi en clair est à des fins de démonstration.
            userDataToUpdate.mot_de_passe = formData.newPassword; 
        }

        try {
            await utilisateurService.updateUtilisateur(currentUser.id, userDataToUpdate, photoFile);
            showTemporaryMessage('success', 'Profil mis à jour avec succès !');
            refetchData(); // Rafraîchir les données pour mettre à jour la navbar, etc.
        } catch (error) {
            showTemporaryMessage('error', 'Échec de la mise à jour du profil.');
            console.error("Update profile error:", error);
        }
    };

    if (!currentUser) return <div className="p-8">Chargement du profil...</div>;

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Mon Profil</h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* --- CARTE D'INFORMATIONS PERSONNELLES --- */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><Edit className="mr-3 text-blue-500"/> Informations Personnelles</h2>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Section Photo */}
                        <div className="relative flex-shrink-0">
                            <img 
                                src={previewPhoto}
                                alt="Aperçu du profil"
                                className="w-32 h-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-600"
                            />
                            <label htmlFor="photo-upload" className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600">
                                <Camera size={20} />
                                <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                            </label>
                        </div>
                        {/* Section Champs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                             <div>
                                <label className="form-label" htmlFor="prenom">Prénom</label>
                                <input type="text" id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} className="form-input"/>
                            </div>
                             <div>
                                <label className="form-label" htmlFor="nom">Nom</label>
                                <input type="text" id="nom" name="nom" value={formData.nom} onChange={handleChange} className="form-input"/>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="form-label" htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="form-input"/>
                            </div>
                        </div>
                    </div>
                </div>

                 {/* --- CARTE DE SÉCURITÉ --- */}
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><KeyRound className="mr-3 text-red-500"/> Sécurité</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label" htmlFor="newPassword">Nouveau mot de passe</label>
                            <input type="password" id="newPassword" name="newPassword" value={formData.newPassword} onChange={handleChange} className="form-input" placeholder="Laisser vide pour ne pas changer"/>
                        </div>
                         <div>
                            <label className="form-label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-input"/>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary">
                        Enregistrer les modifications
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilAdmin;