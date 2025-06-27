import React from 'react';
import { Edit, Trash2, Users as UsersIcon, UserCheck, Calendar, User as UserCreatorIcon } from 'lucide-react'; // Ajout Calendar, UserCreatorIcon
import defaultProfilePic from '../../../assets/images/default-profile.png';
import { formatDateFromArray } from '../../../utils/dateFormatter'; // Assurez-vous que c'est bien importé

const EquipeCard = ({ equipe, onEditRequest, onDeleteRequest }) => {
    const members = Array.isArray(equipe.utilisateurs) ? equipe.utilisateurs : [];

    // Préparation de l'URL de la photo du chef d'équipe (utilisant la même logique de détection MIME)
    const detectImageMime = (base64) => {
        if (!base64) return "image/jpeg";
        if (base64.startsWith("/9j/")) return "image/jpeg";
        if (base64.startsWith("iVBORw0KGgoAAAANSUhEUg")) return "image/png";
        if (base64.startsWith("R0lGOD")) return "image/gif";
        if (base64.startsWith("UklGR")) return "image/webp";
        return "image/jpeg";
    };
    const chefPhotoUrl = equipe.chefEquipe?.photo 
        ? `data:${detectImageMime(equipe.chefEquipe.photo)};base64,${equipe.chefEquipe.photo}` 
        : defaultProfilePic;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 min-h-[250px]">
            {/* Statut et boutons d'action */}
            <div className="flex justify-between items-start mb-3">
                <div className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-2 border ${equipe.actif ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20' : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-700'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${equipe.actif ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                    {equipe.actif ? 'Actif' : 'Inactif'}
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onEditRequest(equipe)} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors" title="Modifier">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => onDeleteRequest(equipe)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-slate-700 transition-colors" title="Supprimer">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Informations principales (Désignation) */}
            <div className="flex-grow">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2 truncate" title={equipe.designation}>{equipe.designation}</h3>
            </div>

            {/* Détails supplémentaires */}
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {/* Chef d'équipe */}
                <div className="flex items-center">
                    <UsersIcon size={14} className="mr-2 flex-shrink-0" />
                    <span className="font-medium text-slate-500 dark:text-slate-400 mr-2">Chef:</span>
                    {equipe.chefEquipe ? (
                        <div className="flex items-center space-x-2">
                            <img src={chefPhotoUrl} alt={equipe.chefEquipe.nom} className="h-6 w-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"/>
                            <span className="text-slate-700 dark:text-slate-200 text-sm">{equipe.chefEquipe.prenom} {equipe.chefEquipe.nom}</span>
                        </div>
                    ) : (
                        <span className="italic">N/A</span>
                    )}
                </div>

                {/* Membres */}
                <div className="flex items-center">
                    <UserCheck size={14} className="mr-2 flex-shrink-0" />
                    <span className="font-medium text-slate-500 dark:text-slate-400">Membres:</span>
                    <span className="ml-2 text-slate-700 dark:text-slate-200">{members.length}</span>
                </div>

                {/* Créé par */}
                <div className="flex items-center">
                    <UserCreatorIcon size={14} className="mr-2 flex-shrink-0"/>
                    <span className="font-medium text-slate-500 dark:text-slate-400">Créé par:</span>
                    <span className="ml-2 text-slate-700 dark:text-slate-200">{equipe.userCreation || 'N/A'}</span>
                </div>

                {/* Date de création */}
                <div className="flex items-center">
                    <Calendar size={14} className="mr-2 flex-shrink-0"/>
                    <span className="font-medium text-slate-500 dark:text-slate-400">Créé le:</span>
                    <span className="ml-2 text-slate-700 dark:text-slate-200">{formatDateFromArray(equipe.dateCreation)}</span>
                </div>
            </div>
        </div>
    );
};
export default EquipeCard;