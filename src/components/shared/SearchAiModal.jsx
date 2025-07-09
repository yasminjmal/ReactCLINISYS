import React, { useState, useEffect } from 'react';
import { X, Ticket as TicketIcon, User, Users, Building, Puzzle, Briefcase, Hash, Type, Calendar, CheckCircle, AlertTriangle, UserCheck, List, Paperclip, Mail, MapPin, Globe } from 'lucide-react';

// --- HELPERS ---

// Formatteur de date/heure complet
const formatDateTime = (dateString) => {
    if (!dateString) return <span className="text-slate-500">N/A</span>;
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Composant pour afficher une ligne de détail (label + valeur)
const DetailItem = ({ label, value, icon: Icon, children }) => (
    <div className="py-2 px-3 grid grid-cols-3 gap-4 items-start bg-slate-50/50 dark:bg-slate-900/50 rounded-md">
        <dt className="text-sm font-semibold text-slate-600 dark:text-slate-300 col-span-1 flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-slate-400" />}
            {label}
        </dt>
        <dd className="text-sm text-slate-800 dark:text-slate-100 col-span-2 break-words">
            {children || value || <span className="text-slate-500">N/A</span>}
        </dd>
    </div>
);

// Composant pour afficher les statuts avec des couleurs
const StatusBadge = ({ status }) => {
    if (!status) return <span className="text-slate-500">N/A</span>;
    const colors = {
        'OUVERT': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        'EN_COURS': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'RESOLU': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'FERME': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${colors[status] || colors['FERME']}`}>{status}</span>;
};


// --- RENDERERS DÉTAILLÉS POUR CHAQUE ENTITÉ ---

const renderTicket = (item) => (
    <div key={item.id} className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-3"><TicketIcon /> Ticket: {item.titre}</h3>
        <div className="space-y-1">
            <DetailItem label="ID" value={item.id} icon={Hash} />
            <DetailItem label="Description" value={item.description} icon={Type} />
            <DetailItem label="Statut" icon={AlertTriangle}><StatusBadge status={item.statue} /></DetailItem>
            <DetailItem label="Priorité" value={item.priorite} icon={AlertTriangle} />
            <DetailItem label="Créé par" value={item.userCreation} icon={User} />
            <DetailItem label="Assigné à" value={item.idUtilisateur ? `${item.idUtilisateur.prenom} ${item.idUtilisateur.nom}` : 'Non assigné'} icon={UserCheck} />
            <DetailItem label="Client" value={item.idClient?.nomComplet} icon={Building} />
            <DetailItem label="Module" value={item.idModule?.designation} icon={Puzzle} />
            <DetailItem label="Date Création" value={formatDateTime(item.dateCreation)} icon={Calendar} />
            <DetailItem label="Début Traitement" value={formatDateTime(item.debutTraitement)} icon={Calendar} />
            <DetailItem label="Date d'Échéance" value={formatDateTime(item.date_echeance)} icon={Calendar} />
            <DetailItem label="Date Clôture" value={formatDateTime(item.dateCloture)} icon={Calendar} />
            <DetailItem label="Ticket Parent ID" value={item.parentTicket?.id} icon={Hash} />
            <DetailItem label="Tickets Enfants" value={item.childTickets?.length || 0} icon={List} />
            <DetailItem label="Commentaires" value={item.commentaireList?.length || 0} icon={List} />
            <DetailItem label="Documents" value={item.documentJointesList?.length || 0} icon={Paperclip} />
            <DetailItem label="Actif" value={item.actif ? 'Oui' : 'Non'} icon={CheckCircle} />
        </div>
    </div>
);

const renderUtilisateur = (item) => (
    <div key={item.id} className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2 mb-3"><User /> Utilisateur: {item.prenom} {item.nom}</h3>
        <div className="space-y-1">
            <DetailItem label="ID" value={item.id} icon={Hash} />
            <DetailItem label="Login" value={item.login} icon={Type} />
            <DetailItem label="Email" value={item.email} icon={Mail} />
            <DetailItem label="Téléphone" value={item.numTelephone} icon={Type} />
            <DetailItem label="Rôle" value={item.role} icon={Briefcase} />
            <DetailItem label="Actif" value={item.actif ? 'Oui' : 'Non'} icon={CheckCircle} />
            <DetailItem label="Date Création" value={formatDateTime(item.dateCreation)} icon={Calendar} />
            <DetailItem label="Créé par" value={item.userCreation} icon={User} />
            <DetailItem label="Équipes/Postes" value={`${item.equipePosteSet?.length || 0} assignation(s)`} icon={List} />
            <DetailItem label="Tickets Assignés" value={`${item.ticketList?.length || 0} ticket(s)`} icon={TicketIcon} />
            <DetailItem label="Photo" value={item.photo ? 'Oui' : 'Non'} icon={Paperclip} />
        </div>
    </div>
);

const renderEquipe = (item) => (
     <div key={item.id} className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2 mb-3"><Users /> Équipe: {item.designation}</h3>
        <div className="space-y-1">
            <DetailItem label="ID" value={item.id} icon={Hash} />
            <DetailItem label="Chef d'équipe" value={item.chefEquipe ? `${item.chefEquipe.prenom} ${item.chefEquipe.nom}` : 'Non assigné'} icon={UserCheck} />
            <DetailItem label="Actif" value={item.actif ? 'Oui' : 'Non'} icon={CheckCircle} />
            <DetailItem label="Date Création" value={formatDateTime(item.dateCreation)} icon={Calendar} />
            <DetailItem label="Créé par" value={item.userCreation} icon={User} />
            <DetailItem label="Modules" icon={Puzzle}>{item.moduleList?.length > 0 ? <ul className='list-disc pl-5'>{item.moduleList.map(m => <li key={m.id}>{m.designation}</li>)}</ul> : 'Aucun'}</DetailItem>
            <DetailItem label="Utilisateurs" icon={Users}>{item.utilisateurs?.length > 0 ? <ul className='list-disc pl-5'>{item.utilisateurs.map(u => <li key={u.id}>{u.prenom} {u.nom}</li>)}</ul> : 'Aucun'}</DetailItem>
        </div>
    </div>
);

const renderClient = (item) => (
    <div key={item.id} className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2 mb-3"><Building /> Client: {item.nomComplet}</h3>
        <div className="space-y-1">
            <DetailItem label="ID" value={item.id} icon={Hash} />
            <DetailItem label="Email" value={item.email} icon={Mail} />
            <DetailItem label="Adresse" value={item.adress} icon={MapPin} />
            <DetailItem label="Pays" value={item.countryCode} icon={Globe} />
            <DetailItem label="Région" value={item.regionName} icon={MapPin} />
            <DetailItem label="Latitude" value={item.latitude} icon={MapPin} />
            <DetailItem label="Longitude" value={item.longitude} icon={MapPin} />
            <DetailItem label="Actif" value={item.actif ? 'Oui' : 'Non'} icon={CheckCircle} />
            <DetailItem label="Date Création" value={formatDateTime(item.dateCreation)} icon={Calendar} />
            <DetailItem label="Créé par" value={item.userCreation} icon={User} />
            <DetailItem label="Tickets" value={`${item.ticketList?.length || 0} ticket(s)`} icon={TicketIcon} />
        </div>
    </div>
);

const renderModule = (item) => (
    <div key={item.id} className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-3"><Puzzle /> Module: {item.designation}</h3>
        <div className="space-y-1">
            <DetailItem label="ID" value={item.id} icon={Hash} />
            <DetailItem label="Équipe assignée" value={item.equipe?.designation} icon={Users} />
            <DetailItem label="Actif" value={item.actif ? 'Oui' : 'Non'} icon={CheckCircle} />
            <DetailItem label="Date Création" value={formatDateTime(item.dateCreation)} icon={Calendar} />
            <DetailItem label="Créé par" value={item.userCreation} icon={User} />
            <DetailItem label="Tickets" value={`${item.ticketList?.length || 0} ticket(s)`} icon={TicketIcon} />
        </div>
    </div>
);

const renderPoste = (item) => (
    <div key={item.id} className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2 mb-3"><Briefcase /> Poste: {item.designation}</h3>
        <div className="space-y-1">
            <DetailItem label="ID" value={item.id} icon={Hash} />
            <DetailItem label="Actif" value={item.actif ? 'Oui' : 'Non'} icon={CheckCircle} />
            <DetailItem label="Date Création" value={formatDateTime(item.dateCreation)} icon={Calendar} />
            <DetailItem label="Créé par" value={item.userCreation} icon={User} />
        </div>
    </div>
);

// --- COMPOSANT PRINCIPAL DU MODAL ---

const SearchResultsModal = ({ isOpen, onClose, data, entityType }) => {
     // ✅ CHANGÉ : Un seul état pour contrôler si le composant doit être dans le DOM
    const [shouldRender, setShouldRender] = useState(isOpen);

    // ✅ CHANGÉ : Logique pour monter/démonter le composant
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
        }
        // La suppression est gérée par onAnimationEnd
    }, [isOpen]);

    // ✅ NOUVEAU : Gestionnaire de fin d'animation
    const handleAnimationEnd = () => {
        // Si l'animation de sortie est terminée, on retire le composant du DOM
        if (!isOpen) {
            setShouldRender(false);
        }
    };
    
    // Si le composant ne doit pas être rendu, on retourne null
    if (!shouldRender) {
        return null;
    }
    
    const renderers = {
        ticket: renderTicket,
        utilisateur: renderUtilisateur,
        equipe: renderEquipe,
        client: renderClient,
        module: renderModule,
        poste: renderPoste,
    };

    const renderContent = () => {
        if (!data || data.length === 0) {
            return <p className="p-6 text-center text-slate-500">Aucun résultat trouvé.</p>;
        }
        const renderer = renderers[entityType];
        return renderer ? data.map(renderer) : <p className="p-6 text-center text-red-500">Type de données non pris en charge : {entityType}</p>;
    };

    const entityTitles = {
        ticket: 'Résultats Détaillés : Tickets',
        utilisateur: 'Résultats Détaillés : Utilisateurs',
        equipe: 'Résultats Détaillés : Équipes',
        client: 'Résultats Détaillés : Clients',
        module: 'Résultats Détaillés : Modules',
        poste: 'Résultats Détaillés : Postes',
    };


    return (
        <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center transition-opacity duration-300"
        >
            <style>{`
                @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes slide-down { from { transform: translateY(0); } to { transform: translateY(100%); } }
                .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
                .animate-slide-down { animation: slide-down 0.3s ease-in forwards; }
            `}</style>
            <div 
                onClick={(e) => e.stopPropagation()}
className={`relative bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col ${isOpen ? 'animate-slide-up' : 'animate-slide-down'}`}
                onAnimationEnd={handleAnimationEnd}            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{entityTitles[entityType] || 'Résultats Détaillés'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SearchResultsModal;