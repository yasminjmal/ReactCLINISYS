// src/components/admin/Users/UsersTableRow.jsx
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { formatDateFromArray } from '../../../utils/dateFormatter';
import defaultProfilePic from '../../../assets/images/default-profile.png';

const StatusBadge = ({ isActive }) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center ${isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
        <span className={`h-2 w-2 mr-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {isActive ? 'Actif' : 'Inactif'}
    </span>
);

const RoleDisplay = ({ role }) => {
    const roleMap = {
        'ROLE_ADMIN': { text: 'Admin', color: 'text-red-500' },
        'ROLE_CHEF_EQUIPE': { text: 'Chef d\'équipe', color: 'text-yellow-600' },
        'ROLE_USER': { text: 'Utilisateur', color: 'text-sky-600' }
    };
    const { text, color } = roleMap[role] || { text: role, color: 'text-slate-500' };
    return <span className={`font-semibold ${color}`}>{text}</span>;
};

const UsersTableRow = ({ user, onEdit, onDelete }) => {
    const userPhotoUrl = defaultProfilePic; 

    // Create an array of JSX elements for teams and postes
    // This will be an empty array if user.equipePosteSet is null/undefined
    const equipesAndPostesElements = user.equipePosteSet?.map((ep, index) => (
        <React.Fragment key={`${user.id}-${ep.equipe?.id}-${ep.poste?.id || index}`}>
            <strong>{ep.equipe?.designation || 'N/A'}</strong> ({ep.poste?.designation || 'N/A'})
            {index < user.equipePosteSet?.length - 1 && ', '} {/* FIX: Added optional chaining here */}
        </React.Fragment>
    )) || []; // Ensure it defaults to an empty array if equipePosteSet is undefined/null

    return (
        <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                    <img className="h-10 w-10 rounded-full object-cover" src={userPhotoUrl} alt={`${user.prenom} ${user.nom}`} />
                    <div>
                        <div className="font-semibold text-slate-800 dark:text-white">{user.prenom} {user.nom}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <RoleDisplay role={user.role} />
            </td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                {equipesAndPostesElements.length > 0 ? equipesAndPostesElements : 'N/A'}
            </td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                {formatDateFromArray(user.dateCreation)}
            </td>
            <td className="px-6 py-4">
                <StatusBadge isActive={user.actif} />
            </td>
            <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => onEdit(user)} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full" title="Modifier"><Edit size={16} /></button>
                    <button onClick={() => onDelete(user)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Supprimer"><Trash2 size={16} /></button>
                </div>
            </td>
        </tr>
    );
};

export default UsersTableRow;