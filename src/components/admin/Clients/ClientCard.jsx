// --- ClientCard.jsx ---
// NOTE: Ce composant semblait être une copie de 'EquipeCard', je l'ai adapté pour 'Client'.

import {
    Briefcase, Mail, MapPin as MapPinIcon, Calendar, User as UserCreatorIcon,
    Edit, Trash2 // <--- AJOUTEZ CES IMPORTATIONS
} from 'lucide-react';

const ClientCard = ({ client, onEditRequest, onDeleteRequest }) => {

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            {/* Statut et boutons d'action */}
            <div className="flex justify-between items-start mb-3">
                <div className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center ${client.actif ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                    <span className={`h-2 w-2 mr-2 rounded-full ${client.actif ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {client.actif ? 'Actif' : 'Inactif'}
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => onEditRequest(client)} className="p-1.5 rounded-full text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-700" title="Modifier">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => onDeleteRequest(client)} className="p-1.5 rounded-full text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700" title="Supprimer">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Informations principales */}
            <div className="flex-grow">
                <Briefcase className="w-10 h-10 text-sky-500 mb-2" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate" title={client.nomComplet}>{client.nomComplet}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center mt-1">
                    <MapPinIcon size={14} className="mr-1.5 flex-shrink-0" />
                    {client.region || 'Région non définie'}
                </p>
            </div>

            {/* Détails supplémentaires */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center">
                    <Mail size={12} className="mr-2"/>
                    <span className="truncate">{client.email || 'Pas d\'email'}</span>
                </div>
                <div className="flex items-center">
                    <MapPinIcon size={12} className="mr-2"/>
                    <span className="truncate">{client.adress || 'Pas d\'adresse'}</span>
                </div>
                <div className="flex items-center">
                    <Calendar size={12} className="mr-2"/>
                    <span>Créé le {formatDate(client.dateCreation)}</span>
                </div>
                   <div className="flex items-center">
                    <UserCreatorIcon size={12} className="mr-2"/>
                    <span>par {client.userCreation || 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

export default ClientCard;