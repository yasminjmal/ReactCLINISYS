// src/components/chefEquipe/TableauDeBordChef.jsx

import React, { useMemo } from 'react';
import { Users, Ticket, BarChart2, Shield, AlertTriangle, CheckCircle, ArrowRight, Bell, Calendar, Award } from 'lucide-react';

// --- Sous-composant AMÉLIORÉ pour les cartes de statistiques ---
const StatCard = ({ icon, title, value, gradient, textColor = 'text-white' }) => (
    <div className="glass-card p-4 flex flex-col justify-between h-full group">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${gradient}`}>
            {React.cloneElement(icon, { className: `h-7 w-7 ${textColor}` })}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

// --- NOUVEAU sous-composant pour la pile d'avatars ---
const AvatarStack = ({ users }) => (
    <div className="flex -space-x-3 rtl:space-x-reverse">
        {users.slice(0, 3).map((user, index) => (
            <img
                key={user.id || index}
                className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-700 object-cover"
                src={user.image || `https://i.pravatar.cc/150?u=${user.id}`}
                alt={user.prenom}
            />
        ))}
        {users.length > 3 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-600 dark:text-slate-200">
                +{users.length - 3}
            </div>
        )}
    </div>
);


const TableauDeBordChef = ({ user, equipes, tickets, ticketsATraiter, setActivePage }) => {
    console.log(tickets)
    const stats = useMemo(() => {
        const enCours = tickets.filter(t => t.statue === 'En_cours').length;
        const termine = tickets.filter(t => t.statue === 'Termine').length;
        const refuse = tickets.filter(t => t.statue === 'Refuse').length;
        const total = enCours + termine + refuse;
        const hautePrio = tickets.filter(t => t.priorite === 'Haute' && t.statue !== 'Termine' && t.statue !== 'Refuse').length;
        const membresTotal = equipes.reduce((acc, equipe) => acc + (equipe.utilisateurs ? equipe.utilisateurs.length : 0), 0);

        return {
            enCours,
            termine,
            refuse,
            total,
            hautePrio,
            membresTotal,
            pourcentageEnCours: total > 0 ? (enCours / total) * 100 : 0,
            pourcentageTermine: total > 0 ? (termine / total) * 100 : 0,
            pourcentageRefuse: total > 0 ? (refuse / total) * 100 : 0,
        };
    }, [tickets, equipes]);

    return (
        // AMÉLIORATION: Arrière-plan en dégradé subtil
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 min-h-full p-4 sm:p-6 lg:p-8 font-sans">
            <style>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease-in-out;
                }
                .dark .glass-card {
                    background: rgba(42, 51, 66, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .glass-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
                }
                .dark .glass-card:hover {
                     box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                }
            `}</style>
            
            <div className="max-w-7xl mx-auto">
                
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Tableau de Bord</h1>
                    <p className="text-slate-500 dark:text-slate-400">Un aperçu de votre journée, {user?.prenom || 'Chef d\'équipe'} 👋</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    
                    {/* --- Colonne de Gauche --- */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        
                        {/* AMÉLIORATION: Carte d'appel à l'action principale */}
                        <div className="relative glass-card rounded-2xl p-6 flex items-center justify-between overflow-hidden">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Vous avez {ticketsATraiter.length} ticket(s) en attente</h2>
                                <p className="text-slate-600 dark:text-slate-300 mt-1 mb-4">Assignez-les à votre équipe pour commencer.</p>
                                <button onClick={() => setActivePage('tickets_a_traiter_chef')} className="bg-slate-800 text-white dark:bg-white dark:text-slate-800 font-semibold py-2 px-5 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
                                    Voir les tickets
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                            <Ticket className="absolute -right-5 -top-3 h-32 w-32 text-slate-200/50 dark:text-slate-700/50" strokeWidth={1} />
                        </div>

                        {/* AMÉLIORATION: Carte des statistiques de tickets avec un style plus propre */}
                        <div className="glass-card rounded-2xl p-6">
                             <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 text-lg">Statistiques des Tickets</h3>
                            <div className="grid grid-cols-3 gap-4 text-center mb-5">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">EN COURS</p>
                                    <p className="font-bold text-3xl text-blue-500">{stats.enCours}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">TERMINÉS</p>
                                    <p className="font-bold text-3xl text-green-500">{stats.termine}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">REFUSÉS</p>
                                    <p className="font-bold text-3xl text-red-500">{stats.refuse}</p>
                                </div>
                            </div>
                             <div className="w-full bg-slate-200/70 dark:bg-slate-700 rounded-full h-3 flex overflow-hidden">
                                <div className="bg-blue-500 h-3" style={{width: `${stats.pourcentageEnCours}%`}}></div>
                                <div className="bg-green-500 h-3" style={{width: `${stats.pourcentageTermine}%`}}></div>
                                <div className="bg-red-500 h-3" style={{width: `${stats.pourcentageRefuse}%`}}></div>
                            </div>
                        </div>

                        {/* AMÉLIORATION: Carte des équipes avec avatars */}
                        <div className="glass-card rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-lg">Mes Équipes</h3>
                                <a href="#mes_equipes_chef" onClick={() => setActivePage('mes_equipes_chef')} className="text-sm text-blue-500 hover:text-blue-600 font-semibold">Gérer</a>
                            </div>
                            <div className="space-y-3">
                                {equipes.length > 0 ? equipes.slice(0, 3).map(equipe => (
                                    <div key={equipe.id} className="bg-white/60 dark:bg-slate-700/50 p-3 rounded-lg flex justify-between items-center transition-all hover:shadow-md hover:scale-[1.02]">
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-slate-100">{equipe.designation}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{equipe.description}</p>
                                        </div>
                                        <AvatarStack users={equipe.utilisateurs || []} />
                                    </div>
                                )) : <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">Aucune équipe à afficher.</p>}
                            </div>
                        </div>
                    </div>

                    {/* --- Colonne de Droite --- */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* AMÉLIORATION: Grille de stats avec les nouvelles cartes */}
                        <StatCard 
                            icon={<Shield size={24}/>} 
                            title="Équipes Gérées" 
                            value={equipes.length} 
                            gradient="bg-gradient-to-br from-blue-500 to-cyan-400"
                        />
                       <StatCard 
                            icon={<Users size={24}/>} 
                            title="Membres d'équipe" 
                            value={stats.membresTotal} 
                            gradient="bg-gradient-to-br from-purple-500 to-indigo-500"
                        />
                       <StatCard 
                            icon={<AlertTriangle size={24}/>} 
                            title="Priorité Haute" 
                            value={stats.hautePrio}
                            gradient="bg-gradient-to-br from-orange-500 to-amber-400"
                        />
                        <StatCard 
                            icon={<Award size={24}/>} 
                            title="Tickets terminés" 
                            value={stats.termine}
                            gradient="bg-gradient-to-br from-green-500 to-lime-400"
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TableauDeBordChef;