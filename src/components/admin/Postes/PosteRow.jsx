// import React from 'react';
// import { Briefcase as BriefcaseIconRow, Info, Users } from 'lucide-react';

// const PosteRow = ({ poste, onNavigateToPosteDetails }) => {
//   return (
//     <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md rounded-lg flex items-center p-3.5 space-x-4 transition-shadow duration-200">
//       <div className="flex-none w-10 h-10 bg-amber-100 dark:bg-amber-700/30 rounded-lg flex items-center justify-center">
//         <BriefcaseIconRow className="text-amber-600 dark:text-amber-400" size={20} />
//       </div>
      
//       <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-x-4 items-center min-w-0">
//         <div className="truncate sm:col-span-2">
//           <p 
//             className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" 
//             title={poste.designation}
//           >
//             {poste.designation}
//           </p>
//           <p className="text-xs text-slate-500 dark:text-slate-400">ID: {poste.id}</p>
//         </div>
        
//         <div className="hidden sm:flex items-center space-x-1.5 text-sm text-slate-600 dark:text-slate-300 justify-start sm:justify-end">
//            <Users size={14} className="text-slate-500 dark:text-slate-400 flex-shrink-0"/>
//            <span>{poste.nbUtilisateurs} Utilisateur{poste.nbUtilisateurs === 1 ? '' : 's'}</span>
//         </div>
//       </div>

//       <button 
//         onClick={() => onNavigateToPosteDetails(poste.id)}
//         className="text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
//         title="Voir détails du poste"
//       >
//         <Info size={18} />
//       </button>
//     </div>
//   );
// };
// export default PosteRow;