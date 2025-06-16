// import React, { useState, useEffect } from 'react';
// import { Briefcase as BriefcaseIconDetails, Save, XCircle, Edit3, Trash2, AlertTriangle, ArrowLeft, Users } from 'lucide-react';

// const PosteDetailsPage = ({ initialPoste, onUpdatePoste, onDeletePosteRequest, onCancelToList, adminName }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState(initialPoste);
//   const [errors, setErrors] = useState({});
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

//   useEffect(() => {
//     setFormData(initialPoste); 
//   }, [initialPoste]);

//   if (!formData) {
//     return <div>Chargement...</div>;
//   }
  
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
//   };
  
//   const validateEditForm = () => {
//     const newErrors = {};
//     if (!formData.designation?.trim()) newErrors.designation = "La désignation du poste est requise.";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleConfirmEdit = () => {
//     if (validateEditForm()) {
//       // Pass only the editable data to the update function
//       onUpdatePoste({ id: formData.id, designation: formData.designation });
//       setIsEditing(false);
//     }
//   };

//   const handleCancelEdit = () => {
//     setFormData(initialPoste);
//     setErrors({});
//     setIsEditing(false);
//   };

//   const confirmActualDelete = () => {
//     // Pass both id and designation for the feedback message
//     onDeletePosteRequest(initialPoste.id, initialPoste.designation);
//     setShowDeleteConfirm(false); 
//   };
  
//   return (
//     <div className="p-2 md:p-3 bg-slate-100 min-h-full flex justify-center items-start">
//       <div className="w-full max-w-xl bg-white p-3 md:p-6 rounded-xl shadow-2xl relative">
//         <button onClick={onCancelToList} className="absolute top-3 left-3 text-slate-500 hover:text-sky-600 p-1 rounded-full hover:bg-slate-100" title="Retourner à la liste">
//             <ArrowLeft size={20} />
//         </button>

//         <div className="absolute top-3 right-3 flex space-x-2">
//           {!isEditing && (
//             <>
//               <button onClick={() => setIsEditing(true)} className="p-2 rounded-full text-sky-600 hover:bg-sky-100" title="Modifier">
//                 <Edit3 size={20}/>
//               </button>
//               <button onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-full text-red-500 hover:bg-red-100" title="Supprimer">
//                 <Trash2 size={20}/>
//               </button>
//             </>
//           )}
//         </div>

//         <div className="text-center mb-6 pt-8">
//           <BriefcaseIconDetails className="h-12 w-12 text-amber-600 mx-auto mb-2" />
//           <h1 className="text-2xl font-bold text-slate-800">
//             {isEditing ? 
//               <input type="text" name="designation" value={formData.designation || ''} onChange={handleInputChange} className={`form-input text-center text-2xl font-bold w-full ${errors.designation ? 'border-red-500' : ''}`} />
//              : formData.designation}
//           </h1>
//            {isEditing && errors.designation && <p className="form-error-text text-center">{errors.designation}</p>}
//            <p className="text-sm text-slate-500">ID: {formData.id}</p>
//         </div>

//         {showDeleteConfirm && ( <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-lg shadow-xl text-center"><AlertTriangle size={40} className="text-red-500 mx-auto mb-4" /><h3 className="text-lg font-semibold">Confirmer la suppression</h3><p className="text-sm text-slate-600 my-2">Voulez-vous vraiment supprimer le poste {initialPoste.designation} ?</p><div className="flex justify-center space-x-3 mt-6"><button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">Annuler</button><button onClick={confirmActualDelete} className="btn btn-danger">Supprimer</button></div></div></div>)}

//         <div className="space-y-4">
//              <div>
//                 <label className="form-label text-xs">Nombre d'utilisateurs</label>
//                 <div className="form-icon-wrapper">
//                     <Users size={16} className="form-icon" />
//                     <input type="number" value={formData.nbUtilisateurs || 0} readOnly className="form-input-icon bg-slate-100 cursor-default" />
//                 </div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               <div>
//                   <label className="form-label text-xs">Créé par</label>
//                   <input type="text" value={formData.userCreation || adminName || 'N/A'} readOnly className="form-input bg-slate-100 cursor-default" />
//               </div>
//               <div>
//                   <label className="form-label text-xs">Date de création</label>
//                   <input type="text" value={formData.dateCreation ? new Date(formData.dateCreation).toLocaleDateString('fr-FR') : 'N/A'} readOnly className="form-input bg-slate-100 cursor-default" />
//               </div>
//             </div>
//         </div>

//         {isEditing && (
//             <div className="pt-6 flex justify-end space-x-2">
//                 <button type="button" onClick={handleCancelEdit} className="btn btn-secondary"><XCircle size={16} className="mr-1.5"/> Annuler</button>
//                 <button type="button" onClick={handleConfirmEdit} className="btn btn-primary"><Save size={16} className="mr-1.5"/> Confirmer</button>
//             </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PosteDetailsPage;