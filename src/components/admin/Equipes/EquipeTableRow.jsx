import React from 'react';
import { Edit, Trash2 } from 'lucide-react'; // Info n'est plus utilisé ici
import { formatDateFromArray } from '../../../utils/dateFormatter';
import defaultProfilePic from '../../../assets/images/default-profile.png'; // Assurez-vous que defaultProfilePic est importé

const StatusBadge = ({ isActive }) => (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-md inline-flex items-center gap-2 border ${ // py-0.5 pour consistance
        isActive
        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'
        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-700'
    }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
        {isActive ? 'Actif' : 'Non actif'}
    </span>
);

// Fonction pour détecter le type MIME de l'image (copiée de UsersTableRow)
const detectImageMime = (base64) => {
  if (!base64) return "image/jpeg";
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("iVBORw0KGgoAAAANSUhEUg")) return "image/png"; // Ajustement pour PNG
  if (base64.startsWith("R0lGOD")) return "image/gif";
  if (base64.startsWith("UklGR")) return "image/webp";
  return "image/jpeg"; // fallback
};

// Renommage des props onEditRequest/onDeleteRequest en onEdit/onDelete pour consistance
const EquipeTableRow = ({ equipe, onEdit, onDelete, visibleColumns, highlightedEquipeId }) => {
    const members = Array.isArray(equipe.utilisateurs) ? equipe.utilisateurs : [];

    // Préparation de l'URL de la photo du chef d'équipe
    const chefPhotoUrl = equipe.chefEquipe?.photo 
        ? `data:${detectImageMime(equipe.chefEquipe.photo)};base64,${equipe.chefEquipe.photo}` 
        : defaultProfilePic;

    // Détermine si la ligne doit être surlignée
    const isHighlighted = highlightedEquipeId === equipe.id;

    return (
        <tr className={`border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isHighlighted ? 'highlight-row' : ''}`}>
            {visibleColumns.designation && (
                <td className="px-6 py-1 font-medium text-slate-800 dark:text-slate-100 whitespace-nowrap separateur-colonne-leger">{equipe.designation}</td>
            )}
            {visibleColumns.chefEquipe && (
                <td className="px-6 py-1 separateur-colonne-leger">
                    {equipe.chefEquipe ? (
                        <div className="flex items-center space-x-3">
                            <img className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" src={chefPhotoUrl} alt={`${equipe.chefEquipe.prenom} ${equipe.chefEquipe.nom}`} onError={(e) => { e.currentTarget.src = defaultProfilePic; }} />
                            <div>
                                <div className="font-semibold text-slate-700 dark:text-slate-200">{equipe.chefEquipe.prenom} {equipe.chefEquipe.nom}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{equipe.chefEquipe.email || 'N/A'}</div>
                            </div>
                        </div>
                    ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">N/A</span>
                    )}
                </td>
            )}
            {visibleColumns.membresCount && (
                <td className="px-6 py-1 text-center text-sm font-medium text-slate-700 dark:text-slate-200 separateur-colonne-leger">
                    {members.length}
                </td>
            )}
            {visibleColumns.creePar && (
                 <td className="px-6 py-1 text-sm text-slate-600 dark:text-slate-300 separateur-colonne-leger">
                    {equipe.userCreation || 'N/A'}
                </td>
            )}
            {visibleColumns.dateCreation && (
                <td className="px-6 py-1 text-sm text-slate-600 dark:text-slate-300 separateur-colonne-leger">
                    {formatDateFromArray(equipe.dateCreation)}
                </td>
            )}
            {visibleColumns.statut && ( // Statut déplacé
                <td className="px-6 py-1 separateur-colonne-leger">
                    <StatusBadge isActive={equipe.actif} />
                </td>
            )}
            <td className="px-6 py-1 text-center">
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => onEdit(equipe)} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors" title="Modifier">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => onDelete(equipe)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-slate-700 transition-colors" title="Supprimer">
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default EquipeTableRow;