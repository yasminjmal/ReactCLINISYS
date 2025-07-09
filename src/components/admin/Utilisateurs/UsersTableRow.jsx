// src/components/admin/Users/UsersTableRow.jsx
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { formatDateFromArray } from '../../../utils/dateFormatter';
import defaultProfilePic from '../../../assets/images/default-profile.png';

const StatusBadge = ({ isActive }) => (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-md inline-flex items-center gap-2 border ${
        isActive
        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'
        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-700'
    }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
        {isActive ? 'Actif' : 'Non actif'}
    </span>
);

const RoleDisplay = ({ role }) => {
    const roleMap = {
        'A': { text: 'Administrateur', color: 'text-red-600' },
        'C': { text: 'Chef d\'équipe', color: 'text-orange-500' },
        'E': { text: 'Employé', color: 'text-blue-600' }
    };
    const { text, color } = roleMap[role] || { text: role, color: 'text-slate-500' };
    return <span className={`font-semibold ${color}`}>{text}</span>;
};

const detectImageMime = (base64) => {
  if (!base64) return "image/jpeg";
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("iVBOR")) return "image/png";
  if (base64.startsWith("R0lGOD")) return "image/gif";
  if (base64.startsWith("UklGR")) return "image/webp";
  return "image/jpeg"; // fallback
};

const UsersTableRow = ({ user, onEdit, onDelete, visibleColumns, highlightedUserId }) => {
    
    const mimeType = user.photo ? detectImageMime(user.photo) : null;
    const photoUrl = user.photo ? `data:${mimeType};base64,${user.photo}` : defaultProfilePic;

    // Amélioration de l'affichage Équipe et Poste
    const equipePosteDisplay = user.equipePosteSet?.length > 0 ? (
        <div className="flex flex-col gap-0.5"> {/* Utilisez flex-col et gap pour une meilleure présentation verticale */}
            {user.equipePosteSet.map((ep, index) => (
                <span key={`${user.id}-${ep.equipe?.id}-${ep.poste?.id || index}`} className="block text-xs">
                    <strong className="font-medium">{ep.equipe?.designation || 'N/A'}</strong>: {ep.poste?.designation || 'N/A'}
                </span>
            ))}
        </div>
    ) : 'N/A';

    // Détermine si la ligne doit être surlignée
    const isHighlighted = highlightedUserId === user.id;

    return (
        <tr className={`border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isHighlighted ? 'highlight-row' : ''}`}>
            {visibleColumns.utilisateur && (
                <td className="px-6 py-1">
                    <div className="flex items-center space-x-3">
                        <img className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" src={photoUrl} alt={`${user.prenom} ${user.nom}`} onError={(e) => { e.currentTarget.src = defaultProfilePic; }}/>
                        <div>
                            <div className="font-semibold text-slate-800 dark:text-white">{user.prenom} {user.nom}</div>
                        </div>
                    </div>
                </td>
            )}
            {visibleColumns.email && ( // Nouvelle colonne Email
                <td className="px-6 py-1 text-xs text-slate-600 dark:text-slate-300 separateur-colonne-leger">
                    {user.email}
                </td>
            )}
            {visibleColumns.role && (
                <td className="px-6 py-1 separateur-colonne-leger">
                    <RoleDisplay role={user.role} />
                </td>
            )}
            {visibleColumns.equipeEtPoste && ( // Colonne Équipe et Poste mise à jour
                <td className="px-6 py-1 text-slate-600 dark:text-slate-300 separateur-colonne-leger">
                    {equipePosteDisplay}
                </td>
            )}
            {visibleColumns.creePar && ( // Colonne Créé par (déjà existante, juste m'assurer de la visibilité)
                <td className="px-6 py-1 text-sm text-slate-600 dark:text-slate-300 separateur-colonne-leger">
                    {user.userCreation || 'N/A'}
                </td>
            )}
            {visibleColumns.dateCreation && (
                <td className="px-6 py-1 text-sm text-slate-600 dark:text-slate-300 separateur-colonne-leger">
                    {formatDateFromArray(user.dateCreation)}
                </td>
            )}
            {visibleColumns.statut && (
                <td className="px-6 py-1 separateur-colonne-leger">
                    <StatusBadge isActive={user.actif} />
                </td>
            )}
            <td className="px-6 py-1 text-center">
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => onEdit(user)} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors" title="Modifier"><Edit size={16} /></button>
                    <button onClick={() => onDelete(user)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-slate-700 transition-colors" title="Supprimer"><Trash2 size={16} /></button>
                </div>
            </td>
        </tr>
    );
};

export default UsersTableRow;