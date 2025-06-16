// // src/components/admin/Tickets/TicketTableRow.jsx
// import React, { useMemo } from 'react';
// import { ChevronDown, ChevronUp, Info, Package, UserCircle, AlertTriangle, CheckCircle, Clock, GitBranch } from 'lucide-react';

// const TicketTableRow = ({
//   ticket,
//   isSubTicket = false,
//   depth = 0,
//   onNavigateToDetailsCallback,
//   highlightedItemId, 
//   actionStatus,    
//   newlyCreatedTicketIds, 
//   isExpanded,
//   onToggleExpand,
//   onShowNoSubTicketsMessage
// }) => {

//   const handleNavigateToDetailClick = (e) => {
//     e.stopPropagation();
//     if (onNavigateToDetailsCallback) {
//       onNavigateToDetailsCallback(ticket.id, isSubTicket);
//     }
//   };

//   const handleSubTicketIconClick = (e) => {
//     e.stopPropagation();
//     if (!isSubTicket && ticket.sousTickets && ticket.sousTickets.length > 0) {
//       onToggleExpand(ticket.id);
//     } else if (!isSubTicket && (!ticket.sousTickets || ticket.sousTickets.length === 0)) {
//       if (onShowNoSubTicketsMessage) {
//         onShowNoSubTicketsMessage();
//       }
//     }
//   };

//   const getPriorityStyling = (priority) => {
//     switch (priority?.toLowerCase()) {
//       case 'haute': return { badge: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300', icon: <AlertTriangle size={12} className="text-red-500 mr-1" /> };
//       case 'moyenne': return { badge: 'bg-sky-100 text-sky-700 dark:bg-sky-700/20 dark:text-sky-300', icon: <AlertTriangle size={12} className="text-sky-500 mr-1" /> };
//       case 'faible': return { badge: 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300', icon: <CheckCircle size={12} className="text-green-500 mr-1" /> };
//       default: return { badge: 'bg-slate-100 text-slate-700 dark:bg-slate-700/20 dark:text-slate-300', icon: null };
//     }
//   };
//   const priorityStyle = getPriorityStyling(ticket.priorite);

//   let displayStatus = ticket.statut;
//   let statusStyling = { textClass: 'text-slate-600 dark:text-slate-300', icon: null, label: ticket.statut || 'N/A' };

//   if (ticket.employeAssigne && ticket.statut !== 'Résolu' && ticket.statut !== 'Fermé') {
//       displayStatus = 'En cours';
//       statusStyling = { textClass: 'text-yellow-600 dark:text-yellow-400', icon: <Clock size={12} className="text-yellow-500 mr-1" />, label: 'En cours'};
//   } else if (ticket.statut === 'Accepté') {
//       statusStyling = { textClass: 'text-green-600 dark:text-green-400', icon: <CheckCircle size={12} className="text-green-500 mr-1" />, label: 'Accepté'};
//   } else if (ticket.statut === 'Refusé') { 
//       // Style pour Refusé si nécessaire
//   }

//   const demandeurNom = ticket.demandeur ? `${ticket.demandeur.prenom || ''} ${ticket.demandeur.nom || ''}`.trim() : 'N/A';
//   const dateCreationFormatted = ticket.dateCreation ? new Date(ticket.dateCreation).toLocaleDateString('fr-CA') : 'N/A';

//   const actualHighlightClass = useMemo(() => {
//     const isHighlightedByAction = ticket.id === highlightedItemId && actionStatus === 'success';
//     const isNewlyCreatedSubTicket = newlyCreatedTicketIds && newlyCreatedTicketIds.includes(ticket.id);

//     if (isHighlightedByAction || isNewlyCreatedSubTicket) {
//       // Surlignage vert standard (légèrement plus visible que bg-green-100)
//       return 'bg-green-200 dark:bg-green-700/50'; 
//     }
//     return '';
//   }, [ticket.id, highlightedItemId, actionStatus, newlyCreatedTicketIds]);


//   const cellClass = "px-3 py-3 text-sm text-slate-700 dark:text-slate-200 align-top border-b border-r border-slate-300 dark:border-slate-600";
//   const lastCellClass = "px-3 py-3 text-sm text-slate-700 dark:text-slate-200 align-top border-b border-slate-300 dark:border-slate-600"; 
  
//   const fixedWidthClass = "whitespace-nowrap";
//   const wrappingCellClass = "break-words";

//   return (
//     <>
//       <tr 
//         className={`
//           ${isSubTicket ? 'bg-slate-100/70 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}
//           ${actualHighlightClass} 
//           hover:bg-slate-50 dark:hover:bg-slate-700/60 
//           transition-colors duration-150
//         `}
//       >
//         <td className={`${cellClass} ${fixedWidthClass} w-[7%]`} style={{ paddingLeft: isSubTicket ? `${depth * 20 + 12}px` : '12px' }}>
//           {isSubTicket && <span className="mr-1 text-slate-400 dark:text-slate-500">↳</span>}
//           {ticket.ref}
//         </td>
//         <td className={`${cellClass} ${wrappingCellClass} w-[15%]`}>
//           <div className="font-medium text-slate-800 dark:text-slate-100">{ticket.client}</div>
//           <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{demandeurNom}</div>
//         </td>
//         <td className={`${cellClass} ${wrappingCellClass} w-[20%]`}>
//             {ticket.titre}
//         </td>
//         <td className={`${cellClass} ${fixedWidthClass} w-[12%]`}>
//           <div className="flex flex-col space-y-1">
//             <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${priorityStyle.badge}`}>
//               {priorityStyle.icon}
//               {ticket.priorite ? ticket.priorite.charAt(0).toUpperCase() + ticket.priorite.slice(1) : 'N/A'}
//             </span>
//             <span className={`inline-flex items-center font-medium text-xs ${statusStyling.textClass}`}>
//                 {statusStyling.icon}
//                 {displayStatus}
//             </span>
//           </div>
//         </td>
//         <td className={`${cellClass} ${wrappingCellClass} w-[16%]`}>
//           {ticket.sousTickets && ticket.sousTickets.length > 0 && !isSubTicket ? (
//             <span className="italic text-xs text-slate-500 dark:text-slate-400">N/A (Parent avec sous-tickets)</span>
//           ) : ticket.moduleAssigne ? (
//             <div className="flex items-center">
//                 <Package size={14} className="mr-1.5 text-indigo-500 flex-shrink-0"/>
//                 <span className="text-xs">{ticket.moduleAssigne.nom}</span>
//             </div>
//           ) : (
//             <div className="border border-dashed border-slate-300 dark:border-slate-600 p-1.5 rounded text-xs text-center text-slate-400 dark:text-slate-500">Vide</div>
//           )}
//         </td>
//         <td className={`${cellClass} ${wrappingCellClass} w-[14%]`}>
//           {ticket.employeAssigne ? (
//             <div className="flex items-center">
//                 <UserCircle size={14} className="mr-1.5 text-teal-500 flex-shrink-0"/>
//                 <span className="text-xs">{ticket.employeAssigne.nom}</span>
//             </div>
//           ) : (
//             <div className="border border-dashed border-slate-300 dark:border-slate-600 p-1.5 rounded text-xs text-center text-slate-400 dark:text-slate-500">Vide</div>
//           )}
//         </td>
//         <td className={`${cellClass} ${fixedWidthClass} w-[8%]`}>{dateCreationFormatted}</td>
//         <td className={`${lastCellClass} ${fixedWidthClass} w-[8%] text-center`}>
//           <div className="flex items-center justify-center space-x-1 sm:space-x-2">
//             {!isSubTicket && ( 
//                 <button
//                     onClick={handleSubTicketIconClick}
//                     className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 flex items-center text-xs"
//                     title={ticket.sousTickets && ticket.sousTickets.length > 0 ? (isExpanded ? "Masquer sous-tickets" : "Afficher sous-tickets") : "Voir sous-tickets"}
//                 >
//                     <GitBranch size={16} className="mr-0.5 sm:mr-1"/> ({ticket.sousTickets?.length || 0})
//                     {ticket.sousTickets && ticket.sousTickets.length > 0 && (
//                         isExpanded ? <ChevronUp size={14} className="ml-0.5" /> : <ChevronDown size={14} className="ml-0.5"/>
//                     )}
//                 </button>
//             )}
//              {isSubTicket && <span className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"></span> }
//             <button
//               onClick={handleNavigateToDetailClick}
//               className="p-1 sm:p-1.5 rounded-full text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
//               title="Détails et Actions"
//             >
//               <Info size={16} />
//             </button>
//           </div>
//         </td>
//       </tr>
//       {isExpanded && !isSubTicket && ticket.sousTickets && ticket.sousTickets.length > 0 && (
//         ticket.sousTickets.map(subTicket => (
//           <TicketTableRow
//             key={subTicket.id}
//             ticket={subTicket}
//             isSubTicket={true}
//             depth={depth + 1}
//             onNavigateToDetailsCallback={onNavigateToDetailsCallback}
//             highlightedItemId={highlightedItemId} 
//             actionStatus={actionStatus}         
//             newlyCreatedTicketIds={newlyCreatedTicketIds} 
//             isExpanded={false} 
//             onToggleExpand={onToggleExpand} 
//             onShowNoSubTicketsMessage={onShowNoSubTicketsMessage}
//           />
//         ))
//       )}
//     </>
//   );
// };

// export default TicketTableRow;
