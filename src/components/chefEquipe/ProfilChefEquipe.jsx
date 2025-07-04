// src/components/chefEquipe/ProfilChefEquipe.jsx
import React, { useState, useEffect } from 'react';
import { User, Mail, KeyRound, Camera, Save } from 'lucide-react';
import utilisateurService from '../../services/utilisateurService';

const ProfilChefEquipe = ({ currentUser, refetchData, showTemporaryMessage }) => {
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                prenom: currentUser.prenom || '',
                nom: currentUser.nom || '',
                email: currentUser.email || ''
            }));
            setPreviewPhoto(currentUser.photo ? `data:image/jpeg;base64,${currentUser.photo}` : `https://i.pravatar.cc/150?u=${currentUser.id}`);
        }
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPreviewPhoto(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            showTemporaryMessage('error', 'Les nouveaux mots de passe ne correspondent pas.');
            setIsSubmitting(false);
            return;
        }

        const userDataToUpdate = {
            prenom: formData.prenom,
            nom: formData.nom,
            email: formData.email,
        };
        // Le backend doit gérer la mise à jour du mot de passe
        if (formData.newPassword) {
            userDataToUpdate.mot_de_passe = formData.newPassword;
        }

        try {
            // Utilisation du service pour mettre à jour les données et la photo
            await utilisateurService.updateUtilisateur(currentUser.id, userDataToUpdate, photoFile);
            showTemporaryMessage('success', 'Profil mis à jour avec succès !');
            refetchData(); // Rafraîchir toutes les données
        } catch (error) {
            showTemporaryMessage('error', `Échec de la mise à jour : ${error.response?.data?.message || error.message}`);
            console.error("Update profile error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Mon Profil</h1>
                <p className="text-slate-500 mt-1">Gérez vos informations personnelles et de sécurité.</p>
            </header>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* --- CARTE D'INFORMATIONS PERSONNELLES --- */}
                <div className="bg-white p-8 rounded-2xl shadow-md">
                    <h2 className="text-xl font-semibold mb-6 flex items-center"><User className="mr-3 text-violet-500"/> Informations Personnelles</h2>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Section Photo */}
                        <div className="relative flex-shrink-0 group">
                            <img 
                                src={previewPhoto}
                                alt="Aperçu du profil"
                                className="w-32 h-32 rounded-full object-cover border-4 border-slate-200"
                            />
                            <label htmlFor="photo-upload" className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera size={32} className="text-white" />
                                <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                            </label>
                        </div>
                        {/* Section Champs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-grow">
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
                 <div className="bg-white p-8 rounded-2xl shadow-md">
                    <h2 className="text-xl font-semibold mb-6 flex items-center"><KeyRound className="mr-3 text-violet-500"/> Sécurité</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg">
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
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary flex items-center gap-2">
                        {isSubmitting ? 'Enregistrement...' : <> <Save size={16}/> Enregistrer les modifications </>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilChefEquipe;