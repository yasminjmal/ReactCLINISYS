    import React from 'react';
    import { Edit, Trash2 } from 'lucide-react';

    // Composant pour afficher un badge de statut (Actif/Inactif)
    const StatusBadge = ({ isActive }) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center ${ isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }`}>
            <span className={`h-2 w-2 mr-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {isActive ? 'Actif' : 'Inactif'}
        </span>
    );

    // Fonction pour formater la date (ex: 2023-10-27T10:00:00 -> 27/10/2023)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error("Invalid date format:", dateString);
            return 'Date invalide';
        }
    };


    const ClientTableRow = ({ client, onEditRequest, onDeleteRequest }) => {
        return (
            <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                {/* Colonne Nom Complet et Email */}
                <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 dark:text-white truncate" title={client.nomComplet}>
                        {client.nomComplet}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate" title={client.email}>
                        {client.email || 'N/A'}
                    </div>
                </td>

                {/* Colonne Région */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {client.region || 'N/A'}
                </td>

                {/* Colonne Adresse */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300 truncate" title={client.adress}>
                    {client.adress || 'N/A'}
                </td>
                
                {/* Colonne Date de Création */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {formatDate(client.dateCreation)}
                </td>

                {/* Colonne Créé par */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {client.userCreation || 'N/A'}
                </td>
                
                {/* Colonne Statut */}
                <td className="px-6 py-4">
                    <StatusBadge isActive={client.actif} />
                </td>
                
                {/* Colonne Actions */}
                <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                        <button 
                            onClick={() => onEditRequest(client)} 
                            className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-100 dark:hover:bg-slate-700 rounded-full transition-colors" 
                            title="Modifier"
                        >
                            <Edit size={16} />
                        </button>
                        <button 
                            onClick={() => onDeleteRequest(client)} 
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-slate-700 rounded-full transition-colors" 
                            title="Supprimer"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    export default ClientTableRow;
