// import React, { useState, useEffect } from 'react'; // React, useState, useEffect déjà importés si même fichier
// import { 
//     Users as UsersIconDetails, UserCheck, Save, XCircle, Edit3, Trash2, 
//     AlertTriangle, ArrowLeft, CheckCircle as CheckCircleIcon, // Renommé pour éviter conflit
//     ChevronDown as ChevronDownDetails // Renommé pour éviter conflit
// } from 'lucide-react'; // ToggleLeft, ToggleRight enlevés car on utilise Checkbox pour 'actif'
// // Assurez-vous que ce chemin est correct
// import defaultProfilePicImport_EquipeDetails from '../../../assets/images/default-profile.png'; 

// const EquipeDetailsPage = ({ equipe: initialEquipe, availableUsers = [], onUpdateEquipe, onDeleteEquipeRequest, onCancelToList, adminName }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState(initialEquipe);
//   const [errors, setErrors] = useState({});
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

//   useEffect(() => {
//     // S'assurer de créer une copie profonde pour éviter les mutations directes de la prop
//     if (initialEquipe) {
//         setFormData({
//             ...initialEquipe,
//             // Cloner les tableaux d'objets pour éviter les mutations
//             membres: initialEquipe.membres ? initialEquipe.membres.map(m => ({...m})) : [],
//             // Assurer que chefEquipe est aussi un nouvel objet si présent
//             chefEquipe: initialEquipe.chefEquipe ? {...initialEquipe.chefEquipe} : null,
//         });
//     }
//   }, [initialEquipe]);

//   if (!initialEquipe || !formData) { // Vérifier formData aussi car il est utilisé avant la fin du premier rendu potentiel
//     return <div className="p-6 text-center text-slate-500 dark:text-slate-400">Équipe non trouvée ou en cours de chargement...</div>;
//   }
  
//   const safeAvailableUsers = Array.isArray(availableUsers) ? availableUsers : [];
//   const potentialChefs = safeAvailableUsers.filter(u => u.role === 'chef_equipe' || u.role === 'admin');
//   // Pour la sélection des membres, exclure le chef actuellement sélectionné dans le formulaire
//   const availableMembersForSelection = safeAvailableUsers.filter(u => u.id !== formData.chefEquipe?.id);

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({ 
//         ...prev, 
//         [name]: type === 'checkbox' ? checked : value 
//     }));
//     if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
//   };
  
//   const handleChefEquipeChange = (e) => {
//     const selectedChefId = e.target.value;
//     const selectedChefObject = safeAvailableUsers.find(u => u.id === selectedChefId) || null;
//     setFormData(prev => ({ ...prev, chefEquipe: selectedChefObject })); // Stocker l'objet chef directement
//     if (errors.chefEquipe) setErrors(prev => ({...prev, chefEquipe: null}));
//   };

//   const handleMemberSelect = (userId) => {
//     setFormData(prev => {
//         const currentMembers = prev.membres || [];
//         const isMemberSelected = currentMembers.some(m => m.id === userId);
//         let newMembres;
//         if (isMemberSelected) {
//             newMembres = currentMembers.filter(m => m.id !== userId);
//         } else {
//             const memberToAdd = safeAvailableUsers.find(u => u.id === userId);
//             if (memberToAdd) {
//                 newMembres = [...currentMembers, memberToAdd];
//             } else {
//                 newMembres = currentMembers; // Ne rien faire si l'utilisateur n'est pas trouvé (ne devrait pas arriver)
//             }
//         }
//         return {...prev, membres: newMembres };
//     });
//   };

//   const validateEditForm = () => {
//     const newErrors = {};
//     if (!formData.nom?.trim()) newErrors.nom = "Le nom de l'équipe est requis.";
//     if (!formData.chefEquipe) newErrors.chefEquipe = "Un chef d'équipe doit être sélectionné.";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleConfirmEdit = () => {
//     if (validateEditForm()) {
//       onUpdateEquipe(formData); // formData contient déjà l'objet chefEquipe et le tableau membres mis à jour
//       setIsEditing(false);
//     }
//   };

//   const handleCancelEdit = () => {
//     setFormData(initialEquipe); // Réinitialise aux données initiales
//     setErrors({});
//     setIsEditing(false);
//     // Pas de message d'annulation ici, on reste sur la page
//   };

//   const handleDeleteClick = () => {
//     setShowDeleteConfirm(true);
//   };

//   const confirmActualDelete = () => {
//     onDeleteEquipeRequest(initialEquipe.id, initialEquipe.nom); // La fonction parente gère la navigation et le message
//     setShowDeleteConfirm(false); 
//   };

//   return (
//     <div className="p-2 md:p-3 bg-slate-100 dark:bg-slate-950 min-h-full flex justify-center items-start">
//       <div className="w-full max-w-3xl bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-2xl relative">
//         <button 
//             onClick={onCancelToList} // Ce bouton retourne toujours à la liste des équipes
//             className="absolute top-3 left-3 md:top-4 md:left-4 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
//             title="Retourner à la liste des équipes"
//         >
//             <ArrowLeft size={20} />
//         </button>

//         <div className="absolute top-3 right-3 md:top-4 md:right-4 flex space-x-2">
//           {!isEditing && !showDeleteConfirm && (
//             <>
//               <button onClick={() => setIsEditing(true)} className="p-2 rounded-full text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-700/50 transition-all duration-200 hover:scale-110" title="Modifier">
//                 <Edit3 size={20}/>
//               </button>
//               <button onClick={handleDeleteClick} className="p-2 rounded-full text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700/50 transition-all duration-200 hover:scale-110" title="Supprimer">
//                 <Trash2 size={20}/>
//               </button>
//             </>
//           )}
//         </div>

//         <div className="text-center mb-4 md:mb-6 pt-8">
//           <UsersIconDetails className="h-10 w-10 md:h-12 md:w-12 text-sky-600 dark:text-sky-400 mx-auto mb-2" />
//           <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
//             {isEditing ? 
//               <input type="text" name="nom" value={formData.nom || ''} onChange={handleInputChange} className={`form-input py-1 text-center text-xl md:text-2xl font-bold w-2/3 mx-auto ${errors.nom ? 'border-red-500' : ''}`} />
//              : formData.nom}
//           </h1>
//            {isEditing && errors.nom && <p className="form-error-text text-center">{errors.nom}</p>}
//         </div>

//         {showDeleteConfirm && (
//             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                 <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl text-center max-w-sm transform transition-all animate-slide-in-up">
//                     <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
//                     <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Confirmer la suppression</h3>
//                     <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
//                         Voulez-vous vraiment supprimer l'équipe {initialEquipe.nom} ? Cette action est irréversible.
//                     </p>
//                     <div className="flex justify-center space-x-3">
//                         <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary px-4 py-2 transform hover:scale-105 active:scale-95">Annuler</button>
//                         <button onClick={confirmActualDelete} className="btn btn-danger px-4 py-2 transform hover:scale-105 active:scale-95">Supprimer</button>
//                     </div>
//                 </div>
//             </div>
//         )}

//         <div className="space-y-3 md:space-y-4">
//             {/* Chef d'équipe */}
//             <div>
//                 <label htmlFor="chefEquipeDetails" className="form-label text-xs">Chef d'équipe</label>
//                 {isEditing ? (
//                     <div className="relative">
//                         <UserCheck size={16} className="form-icon left-3" />
//                         <select name="chefEquipe" id="chefEquipeDetails" value={formData.chefEquipe?.id || ''} onChange={handleChefEquipeChange} className={`form-select-icon appearance-none py-1.5 text-sm ${errors.chefEquipe ? 'border-red-500' : ''}`}>
//                             <option value="">Sélectionner un chef...</option>
//                             {potentialChefs.map(user => (
//                             <option key={user.id} value={user.id}>{user.prenom} {user.nom}</option>
//                             ))}
//                         </select>
//                         <ChevronDownDetails size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"/>
//                     </div>
//                 ) : (
//                     <div className="form-icon-wrapper">
//                         <UserCheck size={16} className="form-icon" />
//                         <input type="text" value={formData.chefEquipe ? `${formData.chefEquipe.prenom} ${formData.chefEquipe.nom}` : 'N/A'} readOnly className="form-input-icon py-1.5 text-sm bg-slate-100 dark:bg-slate-700 cursor-default" />
//                     </div>
//                 )}
//                 {isEditing && errors.chefEquipe && <p className="form-error-text">{errors.chefEquipe}</p>}
//             </div>

//             {/* Membres */}
//             <div>
//                 <label className="form-label text-xs mb-1">Membres ({formData.membres?.length || 0})</label>
//                 {isEditing ? (
//                     <div className="max-h-32 overflow-y-auto p-2 border rounded-md dark:border-slate-600 space-y-1 bg-slate-50 dark:bg-slate-700/50">
//                         {availableMembersForSelection.map(user => (
//                             <label key={user.id} className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-600">
//                                 <input 
//                                     type="checkbox"
//                                     checked={formData.membres?.some(m => m.id === user.id)}
//                                     onChange={() => handleMemberSelect(user.id)}
//                                     className="form-checkbox h-3.5 w-3.5"
//                                 />
//                                 <img src={user.profileImage || defaultProfilePicImport_EquipeDetails} alt={user.nom} className="h-5 w-5 rounded-full object-cover"/>
//                                 <span className="text-xs text-slate-700 dark:text-slate-200">{user.prenom} {user.nom}</span>
//                             </label>
//                         ))}
//                          {availableMembersForSelection.length === 0 && <p className="text-xs italic text-slate-500 dark:text-slate-400">Aucun autre utilisateur disponible.</p>}
//                     </div>
//                 ) : (
//                     <div className="p-2 border rounded-md dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 min-h-[40px]">
//                         {formData.membres && formData.membres.length > 0 ? (
//                             <ul className="space-y-1 max-h-32 overflow-y-auto">
//                                 {formData.membres.map(membre => (
//                                     <li key={membre.id} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-200">
//                                         <img src={membre.profileImage || defaultProfilePicImport_EquipeDetails} alt={membre.nom} className="h-5 w-5 rounded-full object-cover"/>
//                                         <span>{membre.prenom} {membre.nom} ({membre.poste})</span>
//                                     </li>
//                                 ))}
//                             </ul>
//                         ) : <p className="text-xs text-slate-500 dark:text-slate-400 italic">Aucun membre.</p>}
//                     </div>
//                 )}
//             </div>
            
//             {/* Statut Actif */}
//             <div>
//                 <label className="form-label text-xs flex items-center mt-2">
//                     Équipe Active :
//                     {isEditing ? (
//                          <input 
//                             type="checkbox" 
//                             name="actif" 
//                             checked={!!formData.actif} 
//                             onChange={handleInputChange}
//                             className="form-checkbox ml-2 h-4 w-4"
//                         />
//                     ) : (
//                         formData.actif ? <CheckCircleIcon size={18} className="ml-2 text-green-500"/> : <XCircle size={18} className="ml-2 text-red-500"/>
//                     )}
//                 </label>
//             </div>

//             {/* Infos non modifiables */}
//             <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
//                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     <div>
//                         <label className="form-label text-xs">Créé par</label>
//                         <input type="text" value={formData.userCreation || adminName || 'N/A'} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-default py-1.5 text-sm" />
//                     </div>
//                     <div>
//                         <label className="form-label text-xs">Date de création</label>
//                         <input type="text" value={formData.dateCreation ? new Date(formData.dateCreation).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} readOnly className="form-input bg-slate-100 dark:bg-slate-700 cursor-default py-1.5 text-sm" />
//                     </div>
//                 </div>
//             </div>
//         </div>

//         {isEditing && (
//             <div className="pt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
//                 <button type="button" onClick={handleCancelEdit} className="btn btn-secondary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3">
//                     <XCircle size={16} className="mr-1.5 transition-transform duration-300 group-hover:rotate-12" /> Annuler
//                 </button>
//                 <button type="button" onClick={handleConfirmEdit} className="btn btn-primary group w-full sm:w-auto transform hover:scale-105 active:scale-95 py-2 px-3">
//                     <Save size={16} className="mr-1.5 transition-transform duration-300 group-hover:scale-110" /> Confirmer Modifications
//                 </button>
//             </div>
//         )}
//       </div>
//     </div>
//   );
// };
// export default EquipeDetailsPage;   