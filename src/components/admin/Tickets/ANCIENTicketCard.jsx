// import React from 'react';
// import { Info, CalendarDays, UserCircle, Building, Tag, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// const TicketCard = ({ ticket, onNavigateToDetails }) => {
//   if (!ticket) {
//     return null;
//   }

//   const getPriorityClasses = (priority, type = 'text') => {
//     // type can be 'text', 'bg', 'border'
//     switch (priority?.toLowerCase()) {
//       case 'haute':
//         return type === 'text' ? 'text-red-600 dark:text-red-400' : 
//                type === 'bg' ? 'bg-red-100 dark:bg-red-700/20' : 
//                'border-red-500 dark:border-red-600';
//       case 'moyenne':
//         return type === 'text' ? 'text-sky-600 dark:text-sky-400' : 
//                type === 'bg' ? 'bg-sky-100 dark:bg-sky-700/20' : 
//                'border-sky-500 dark:border-sky-600';
//       case 'faible':
//         return type === 'text' ? 'text-green-600 dark:text-green-400' : 
//                type === 'bg' ? 'bg-green-100 dark:bg-green-700/20' : 
//                'border-green-500 dark:border-green-600';
//       default:
//         return type === 'text' ? 'text-slate-600 dark:text-slate-400' : 
//                type === 'bg' ? 'bg-slate-100 dark:bg-slate-700/20' : 
//                'border-slate-500 dark:border-slate-600';
//     }
//   };

//   const getStatusInfo = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'en attente':
//         return { icon: <AlertTriangle size={14} className="text-yellow-500 mr-1.5" />, textClass: 'text-yellow-600 dark:text-yellow-400' };
//       case 'accepté':
//         return { icon: <CheckCircle size={14} className="text-green-500 mr-1.5" />, textClass: 'text-green-600 dark:text-green-400' };
//       case 'refusé':
//         return { icon: <XCircle size={14} className="text-red-500 mr-1.5" />, textClass: 'text-red-600 dark:text-red-400' };
//       case 'affecté':
//         return { icon: <UserCircle size={14} className="text-blue-500 mr-1.5" />, textClass: 'text-blue-600 dark:text-blue-400' };
//       default:
//         return { icon: null, textClass: 'text-slate-600 dark:text-slate-400' };
//     }
//   };

//   const statusInfo = getStatusInfo(ticket.statut);
//   const demandeurNom = ticket.demandeur ? `${ticket.demandeur.prenom || ''} ${ticket.demandeur.nom || ''}`.trim() : 'N/A';

//   return (
//     <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col relative transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-l-4 ${getPriorityClasses(ticket.priorite, 'border')}`}>
//       {/* Bouton Détails */}
//       <button
//         onClick={() => onNavigateToDetails(ticket.id)}
//         className="absolute top-3 right-3 text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
//         title="Voir détails du ticket"
//       >
//         <Info size={18} />
//       </button>

//       {/* Titre et Référence */}
//       <div className="mb-2 pr-8"> {/* Espace pour le bouton info */}
//         <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate" title={ticket.titre}>
//           {ticket.titre || 'Sans titre'}
//         </h3>
//         <p className="text-xs text-slate-400 dark:text-slate-500">Réf: {ticket.ref || 'N/A'}</p>
//       </div>

//       {/* Contenu principal de la carte */}
//       <div className="space-y-2.5 text-xs flex-grow mb-3">
//         <div className="flex items-center">
//           <Building size={14} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
//           <span className="text-slate-600 dark:text-slate-300 truncate" title={ticket.client}>Client: <span className="font-medium text-slate-700 dark:text-slate-200">{ticket.client || 'N/A'}</span></span>
//         </div>
//         <div className="flex items-center">
//           <UserCircle size={14} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
//           <span className="text-slate-600 dark:text-slate-300 truncate" title={demandeurNom}>Demandeur: <span className="font-medium text-slate-700 dark:text-slate-200">{demandeurNom}</span></span>
//         </div>
//         <div className="flex items-center">
//           <Tag size={14} className={`mr-2 ${getPriorityClasses(ticket.priorite, 'text')} flex-shrink-0`} />
//           <span className={`${getPriorityClasses(ticket.priorite, 'text')}`}>Priorité: <span className="font-medium">{ticket.priorite ? ticket.priorite.charAt(0).toUpperCase() + ticket.priorite.slice(1) : 'N/A'}</span></span>
//         </div>
//       </div>

//       {/* Footer de la carte: Statut et Date */}
//       <div className="border-t border-slate-200 dark:border-slate-700 pt-2.5 mt-auto">
//         <div className="flex justify-between items-center text-xs">
//           <div className="flex items-center">
//             {statusInfo.icon}
//             <span className={statusInfo.textClass}>
//               {ticket.statut ? ticket.statut.charAt(0).toUpperCase() + ticket.statut.slice(1) : 'N/A'}
//             </span>
//           </div>
//           <div className="flex items-center text-slate-500 dark:text-slate-400">
//             <CalendarDays size={14} className="mr-1.5" />
//             <span>{ticket.dateCreation ? new Date(ticket.dateCreation).toLocaleDateString('fr-CA') : 'N/A'}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TicketCard;