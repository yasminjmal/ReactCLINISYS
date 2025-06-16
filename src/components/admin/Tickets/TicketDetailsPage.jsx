// import React, { useState } from 'react';
// import { ArrowLeft, Paperclip, Tag, CalendarDays, UserCircle, Building, CheckCircle, XCircle, Edit3, MessageSquare } from 'lucide-react';

// const TicketDetailsPage = ({ ticket, onAccepterTicket, onRefuserTicket, onCancelToList }) => {
//   const [showRefusModal, setShowRefusModal] = useState(false);
//   const [motifRefus, setMotifRefus] = useState('');

//   if (!ticket) {
//     return <div className="p-6 text-center text-slate-500 dark:text-slate-400">Aucun ticket sélectionné.</div>;
//   }

//   const getPriorityClasses = (priority) => {
//     switch (priority?.toLowerCase()) {
//       case 'haute': return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300 border-red-500';
//       case 'moyenne': return 'bg-sky-100 text-sky-700 dark:bg-sky-700/30 dark:text-sky-300 border-sky-500';
//       case 'faible': return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300 border-green-500';
//       default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-500';
//     }
//   };

//   const demandeurNom = ticket.demandeur ? `${ticket.demandeur.prenom || ''} ${ticket.demandeur.nom || ''}`.trim() : 'N/A';
//   const clientNom = ticket.idClient?.nom || ticket.client || 'N/A'; // Adapte le chemin du client
//   const dateCreationFormatted = ticket.dateCreation ? new Date(ticket.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour:'2-digit', minute: '2-digit' }) : 'N/A';

//   const handleConfirmRefus = () => {
//     if (motifRefus.trim() === '') {
//       alert("Veuillez entrer un motif de refus.");
//       return;
//     }
//     onRefuserTicket(ticket.id, motifRefus);
//     setShowRefusModal(false);
//     setMotifRefus('');
//   };

//   return (
//     <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
//       <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-5 md:p-8 rounded-xl shadow-xl">
//         <div className="flex justify-between items-start mb-6">
//           <button
//             onClick={onCancelToList}
//             className="flex items-center text-sm text-sky-600 dark:text-sky-400 hover:underline"
//             title="Retour à la liste des demandes"
//           >
//             <ArrowLeft size={18} className="mr-1.5" />
//             Retour
//           </button>
//           <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityClasses(ticket.priorite)}`}>
//             Priorité: {ticket.priorite ? ticket.priorite.charAt(0).toUpperCase() + ticket.priorite.slice(1) : 'N/A'}
//           </span>
//         </div>

//         <div className="mb-5">
//           <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
//             {ticket.titre || 'Détails du Ticket'}
//           </h1>
//           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
//             # {ticket.ref || 'N/A'}
//           </p>
//         </div>

//         <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
//           <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Description</h2>
//           <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
//             {ticket.description || 'Aucune description fournie.'}
//           </p>
//         </div>

//         {ticket.documentsJointesList && ticket.documentsJointesList.length > 0 && ( // Changé documentsJoints à documentsJointesList
//           <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
//             <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Documents Joints</h2>
//             <div className="space-y-2">
//               {ticket.documentsJointesList.map((doc, index) => ( // Changé documentsJoints à documentsJointesList
//                 <a
//                   key={index}
//                   href={doc.url || '#'} // Utilise doc.url
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center text-sm text-sky-600 dark:text-sky-400 hover:underline p-2 rounded-md bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700"
//                 >
//                   <Paperclip size={16} className="mr-2 flex-shrink-0" />
//                   <span className="truncate" title={doc.nom}>{doc.nom}</span>
//                   {doc.type && <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 uppercase">.{doc.type}</span>}
//                 </a>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Informations Client, Demandeur, Date */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-xs mb-8">
//           <div className="flex items-center">
//             <Building size={16} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
//             <div>
//               <span className="block text-slate-500 dark:text-slate-400">Client :</span>
//               <span className="font-medium text-slate-700 dark:text-slate-200">{clientNom}</span> {/* Utilise clientNom */}
//             </div>
//           </div>
//           <div className="flex items-center">
//             <UserCircle size={16} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
//             <div>
//               <span className="block text-slate-500 dark:text-slate-400">Demandeur :</span>
//               <span className="font-medium text-slate-700 dark:text-slate-200">{demandeurNom}</span>
//             </div>
//           </div>
//           <div className="flex items-center">
//             <CalendarDays size={16} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
//             <div>
//               <span className="block text-slate-500 dark:text-slate-400">Date de création :</span>
//               <span className="font-medium text-slate-700 dark:text-slate-200">
//                 {dateCreationFormatted}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Boutons d'action (Accepter/Refuser) - Uniquement si statut 'en attente' */}
//         {ticket.statue === 'EN_ATTENTE' && ( // Changé 'en attente' à EN_ATTENTE
//           <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
//             <button
//               onClick={() => setShowRefusModal(true)}
//               className="btn btn-danger-outline group w-full sm:w-auto transform hover:scale-105 active:scale-95"
//             >
//               <XCircle size={18} className="mr-2 transition-transform duration-150 group-hover:rotate-12" />
//               Refuser
//             </button>
//             <button
//               onClick={() => onAccepterTicket(ticket.id)}
//               className="btn btn-success group w-full sm:w-auto transform hover:scale-105 active:scale-95"
//             >
//               <CheckCircle size={18} className="mr-2 transition-transform duration-150 group-hover:scale-110" />
//               Accepter
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Modal de confirmation de refus */}
//       {showRefusModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all animate-slide-in-up">
//             <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Motif du Refus</h3>
//                 <button onClick={() => setShowRefusModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
//                     <XCircle size={20} className="text-slate-500 dark:text-slate-400"/>
//                 </button>
//             </div>
//             <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
//               Veuillez indiquer la raison du refus pour le ticket "{ticket.titre}".
//             </p>
//             <textarea
//               value={motifRefus}
//               onChange={(e) => setMotifRefus(e.target.value)}
//               placeholder="Expliquez pourquoi ce ticket est refusé..."
//               className="form-textarea w-full h-24 text-sm mb-4"
//               rows="3"
//             />
//             {motifRefus.trim() === '' && <p className="text-xs text-red-500 mb-2">Le motif est requis pour refuser un ticket.</p>}
//             <div className="flex justify-end space-x-3">
//               <button onClick={() => setShowRefusModal(false)} className="btn btn-secondary px-4 py-2 text-sm">
//                 Annuler
//               </button>
//               <button
//                 onClick={handleConfirmRefus}
//                 className="btn btn-danger px-4 py-2 text-sm"
//                 disabled={motifRefus.trim() === ''}
//               >
//                 Confirmer le Refus
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TicketDetailsPage;