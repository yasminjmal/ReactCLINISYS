// src/components/chefEquipe/TeamDetailDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Package, BarChart2, AlertTriangle, Star, TrendingUp, Box, CalendarDays, Clock, CheckCircle } from 'lucide-react';

// Vous devrez importer les services réels pour récupérer les données.
// Par exemple:
// import ticketService from '../../services/ticketService';
// import utilisateurService from '../../services/utilisateurService';
// import moduleService from '../../services/moduleService';
// import commentService from '../../services/commentService'; // si vous avez des commentaires spécifiques à l'équipe/membre

const TeamDetailDashboard = ({ team, allUsers, allPostes, allModules, refetchData }) => {
    // Dans une application réelle, vous feriez des appels API ici
    // pour récupérer des données plus granulaires et spécifiques à `team.id`.
    // Pour l'exemple, nous utilisons des données statiques ou dérivées des props.

    // Données des membres (dérivées de l'équipe, enrichies si nécessaire par API)
    const membersData = team.assignments || [];

    // Modules gérés par cette équipe (filtrés à partir de allModules)
    const modulesManaged = allModules.filter(mod => mod.equipe?.id === team.id);

    // Exemple de données pour les graphiques et stats (à remplacer par des appels API réels)
    const staticTeamTickets = [ // Simule des tickets pour cette équipe
        { id: 't1', title: 'Migration Serveur XYZ', status: 'En_cours', priority: 'HAUTE', assignedToId: 'user1', dateCreation: [2025,6,1], dateCloture: null, date_traitement: [2025,6,2], moduleId: 'mod1' },
        { id: 't2', title: 'Bug affichage front-end', status: 'Termine', priority: 'MOYENNE', assignedToId: 'user2', dateCreation: [2025,6,5], dateCloture: [2025,6,8], date_traitement: [2025,6,6], moduleId: 'mod2' },
        { id: 't3', title: 'Mise à jour base de données', status: 'En_attente', priority: 'BASSE', assignedToId: 'user1', dateCreation: [2025,6,10], dateCloture: null, date_traitement: null, moduleId: 'mod1' },
        { id: 't4', title: 'Support client urgent', status: 'Termine', priority: 'HAUTE', assignedToId: 'user3', dateCreation: [2025,6,12], dateCloture: [2025,6,15], date_traitement: [2025,6,13], moduleId: 'mod3' },
        { id: 't5', title: 'Développement nouvelle feature', status: 'Refuse', priority: 'MOYENNE', assignedToId: 'user1', dateCreation: [2025,6,15], dateCloture: null, date_traitement: null, moduleId: 'mod2' },
        { id: 't6', title: 'Correction faute orthographe', status: 'Termine', priority: 'BASSE', assignedToId: 'user2', dateCreation: [2025,6,16], dateCloture: [2025,6,17], date_traitement: [2025,6,17], moduleId: 'mod1' },
    ];
    
    // Calculs de stats basiques basés sur staticTeamTickets (à remplacer par API)
    const totalTickets = staticTeamTickets.length;
    const ticketsEnCours = staticTeamTickets.filter(t => t.status === 'En_cours').length;
    const ticketsTermines = staticTeamTickets.filter(t => t.status === 'Termine').length;
    const ticketsEnAttente = staticTeamTickets.filter(t => t.status === 'En_attente').length;

    // Fonctions utilitaires (peuvent être déplacées dans src/utils)
    const formatDate = (dateArray) => {
        if (!dateArray) return 'N/A';
        const [year, month, day] = dateArray;
        return new Date(year, month - 1, day).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatDateTime = (dateObj) => {
        if (!dateObj) return 'N/A';
        return dateObj.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const getRoleBadgeColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'chef projet': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
            case 'développeur': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case 'testeur': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
        }
    };
    
    // Pour "Top Performers"
    const topPerformerTickets = membersData.length > 0 ? membersData[0].utilisateur.prenom : "N/A"; // Statique pour l'exemple
    const topPerformerTime = membersData.length > 0 ? membersData[1].utilisateur.prenom : "N/A"; // Statique pour l'exemple

    // Pour "Top Modules"
    const mostSolicitedModule = modulesManaged.length > 0 ? modulesManaged[0].designation : "N/A";
    const moduleOverdueTickets = modulesManaged.length > 0 ? modulesManaged[1]?.designation || "N/A" : "N/A";


    return (
        <div className="animate-fade-in space-y-6">
            {/* Header équipe */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                    <UsersIcon size={36} className="mr-4 text-violet-600 dark:text-violet-400" />
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{team.designation}</h2>
                        <span className={`mt-1 px-3 py-1 text-sm font-semibold rounded-full w-fit ${team.actif ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                            {team.actif ? 'Actif' : 'Inactif'}
                        </span>
                    </div>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Créé le {formatDate(team.dateCreation)}</span>
            </div>

            {/* Section 1 : Membres */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center"><UsersIcon size={20} className="mr-3 text-sky-500" /> Membres ({membersData.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {membersData.length > 0 ? membersData.map(assignment => (
                        <div key={assignment.utilisateur.id} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
                            <img src={assignment.utilisateur.photo ? `data:image/jpeg;base64,${assignment.utilisateur.photo}` : 'https://placehold.co/40x40/E2E8F0/4A5568?text=U'} alt={assignment.utilisateur.prenom} className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{assignment.utilisateur.prenom} {assignment.utilisateur.nom}</p>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getRoleBadgeColor(assignment.poste?.designation)}`}>{assignment.poste?.designation || 'Rôle Inconnu'}</span>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center"><CheckCircle size={14} className="mr-1 text-emerald-500"/> 5 tickets résolus cette semaine</p> {/* Activité statique */}
                            </div>
                            {/* Indicateur de performance (étoiles ou barre de progression simple) */}
                            <div className="flex-shrink-0 ml-3">
                                <Star size={18} className="text-yellow-400 fill-yellow-400" /> {/* Exemple d'étoile */}
                            </div>
                        </div>
                    )) : (
                        <p className="text-slate-500 dark:text-slate-400 italic md:col-span-3">Aucun membre dans cette équipe.</p>
                    )}
                </div>
                {/* Bloc "Top Performers" */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center"><Star size={18} className="mr-2 text-yellow-500 fill-yellow-500"/> Top Performers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md flex items-center">
                            <UsersIcon size={20} className="text-blue-600 mr-3"/>
                            <p>🥇 Plus de tickets résolus: <span className="font-bold">{topPerformerTickets}</span> (15 tickets)</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md flex items-center">
                            <Clock size={20} className="text-green-600 mr-3"/>
                            <p>⏱️ Meilleur temps de traitement: <span className="font-bold">{topPerformerTime}</span> (moy. 2j)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2 : Modules gérés */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center"><Package size={20} className="mr-3 text-teal-500" /> Modules Gérés ({modulesManaged.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modulesManaged.length > 0 ? modulesManaged.map(module => (
                        <div key={module.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-700">
                            <p className="font-medium text-slate-800 dark:text-slate-100 mb-1">{module.designation}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 truncate" title={module.description || 'Pas de description.'}>{module.description || 'Pas de description.'}</p>
                            <div className="flex flex-col gap-1 text-sm">
                                <div className="flex items-center text-slate-500 dark:text-slate-400">
                                    <CheckCircle size={14} className="mr-2 text-emerald-500"/> Tickets liés: <span className="font-semibold ml-1">{module.ticketList?.length || 0}</span>
                                </div>
                                <div className="flex items-center text-slate-500 dark:text-slate-400">
                                    <Clock size={14} className="mr-2 text-blue-500"/> Moy. Résolution: <span className="font-semibold ml-1">3 jours</span> {/* Statique */}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-slate-500 dark:text-slate-400 italic lg:col-span-3">Cette équipe ne gère aucun module spécifique.</p>
                    )}
                </div>
                {/* Bloc "Top modules" */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center"><TrendingUp size={18} className="mr-2 text-blue-500"/> Top Modules</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md flex items-center">
                            <Box size={20} className="text-purple-600 mr-3"/>
                            <p>📈 Le plus sollicité: <span className="font-bold">{mostSolicitedModule}</span> (120 tickets)</p>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-md flex items-center">
                            <AlertTriangle size={20} className="text-rose-600 mr-3"/>
                            <p>🚨 Plus de tickets en retard: <span className="font-bold">{moduleOverdueTickets}</span> (5 tickets)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3 : Dashboards / Analytics */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center"><BarChart2 size={20} className="mr-3 text-cyan-500" /> Aperçu Analytique de l'Équipe</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-300 mb-4">
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">📊 Total Tickets: <span className="font-semibold">{totalTickets}</span></div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">⌛ Moy. Résolution: <span className="font-semibold">3.5 jours</span></div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">📅 Tickets cette semaine: <span className="font-semibold">12</span></div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">✅ Tickets terminés: <span className="font-semibold">{ticketsTermines}</span></div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">⏳ Tickets en cours: <span className="font-semibold">{ticketsEnCours}</span></div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">🚫 Tickets en attente: <span className="font-semibold">{ticketsEnAttente}</span></div>
                </div>
                {/* Graphiques (placeholders) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-md h-48 flex items-center justify-center">
                        <p className="text-slate-500 text-sm">Graphique: Évolution des tickets dans le temps</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-md h-48 flex items-center justify-center">
                        <p className="text-slate-500 text-sm">Graphique: Heatmap des jours/heures d’activité</p>
                    </div>
                     <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-md h-48 flex items-center justify-center">
                        <p className="text-slate-500 text-sm">Graphique: Performance globale équipe vs autres</p>
                    </div>
                </div>
            </div>

            {/* Section 4 : Alertes & recommandations IA */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center"><AlertTriangle size={20} className="mr-3 text-rose-500"/> Alertes & Recommandations IA</h3>
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                    <p className="flex items-center">⚠️ <span className="font-bold mr-1">Ce module (Logiciel)</span> a <span className="font-bold mr-1">+10 tickets non traités</span>.</p>
                    <p className="flex items-center">📌 <span className="font-bold mr-1">Yasmin Jmala</span> n’a pas de ticket depuis <span className="font-bold mr-1">2 semaines</span>.</p>
                    <p className="flex items-center">🤖 Recommandation : Réassigner les tickets de <span className="font-bold mr-1">Mohamed Saleh</span> car il est en <span className="font-bold">surcharge</span>.</p>
                    <p className="flex items-center">📅 Cette équipe n’a pas été active depuis <span className="font-bold mr-1">10 jours</span>.</p>
                </div>
            </div>
        </div>
    );
};

export default TeamDetailDashboard;