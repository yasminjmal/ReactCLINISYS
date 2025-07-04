// src/components/chefEquipe/TableauDeBordChef.jsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUpRight, Clock, Users, Ticket, AlertTriangle } from 'lucide-react';

// Sous-composant pour une carte de statistique simple
const StatCard = ({ title, value, icon, change, changeType }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md flex-1">
        <div className="flex justify-between items-start">
            <div className="flex flex-col">
                <p className="text-sm text-slate-500">{title}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
            </div>
            <div className="p-3 bg-violet-100 rounded-full">
                {icon}
            </div>
        </div>
        {change && (
            <div className={`mt-4 flex items-center text-xs ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                <ArrowUpRight size={14} className={changeType === 'decrease' ? 'transform rotate-180' : ''} />
                <span className="ml-1">{change}</span>
            </div>
        )}
    </div>
);


const TableauDeBordChef = ({ user, tickets, equipes }) => {
    const stats = useMemo(() => {
        const ticketsATraiter = tickets.filter(t => !t.idUtilisateur && t.statue !== 'Refuse');
        const ticketsEnCours = tickets.filter(t => t.statue === 'En_cours');
        const ticketsTermines = tickets.filter(t => t.statue === 'Termine');
        const ticketsHautePrio = tickets.filter(t => t.priorite === 'Haute' && t.statue !== 'Termine' && t.statue !== 'Refuse');

        // Préparation des données pour le graphique
        const ticketsByDay = tickets.reduce((acc, ticket) => {
            const date = new Date(ticket.dateCreation).toLocaleDateString('fr-CA');
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        const chartData = Object.entries(ticketsByDay)
            .map(([name, value]) => ({ name, tickets: value }))
            .sort((a, b) => new Date(a.name) - new Date(b.name)) // tri par date
            .slice(-30); // 30 derniers jours

        return {
            aTraiter: ticketsATraiter.length,
            enCours: ticketsEnCours.length,
            termines: ticketsTermines.length,
            hautePrio: ticketsHautePrio.length,
            membresTotal: equipes.reduce((acc, eq) => acc + (eq.utilisateurs?.length || 0), 0),
            chartData
        };
    }, [tickets, equipes]);

    const getProfileImageUrl = (u) => {
        return u?.photo ? `data:image/jpeg;base64,${u.photo}` : `https://i.pravatar.cc/150?u=${u?.id}`;
    }

    return (
        <div>
            {/* Header de la page */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Tableau de Bord</h1>
                    <p className="text-slate-500 mt-1">Bienvenue, {user?.prenom} ! Voici un aperçu de vos activités.</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{user?.prenom} {user?.nom}</span>
                    <img src={getProfileImageUrl(user)} alt="Profil" className="w-12 h-12 rounded-full object-cover" />
                </div>
            </header>

            {/* Grille de widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne de gauche (principale) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex gap-6">
                       <StatCard title="Tickets à traiter" value={stats.aTraiter} icon={<AlertTriangle className="text-orange-500" />} />
                       <StatCard title="Tickets en cours" value={stats.enCours} icon={<Clock className="text-blue-500" />} />
                       <StatCard title="Membres d'équipe" value={stats.membresTotal} icon={<Users className="text-green-500" />} />
                    </div>
                    {/* Graphique d'activité */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className="text-lg font-semibold mb-4">Activité des Tickets (30 derniers jours)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="tickets" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Colonne de droite */}
                <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col">
                    <h2 className="text-lg font-semibold mb-4">Tickets par Priorité</h2>
                    <p className="text-slate-500 text-sm mb-4">Aperçu des tickets ouverts par niveau d'urgence.</p>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-red-600">Haute</span>
                            <span className="font-bold text-lg">{stats.hautePrio}</span>
                        </div>
                         <div className="w-full bg-gray-200 rounded-full h-2.5">
                           <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(stats.hautePrio / (tickets.length || 1)) * 100}%` }}></div>
                         </div>
                    </div>
                    {/* Vous pouvez ajouter d'autres priorités ici */}
                </div>
            </div>
        </div>
    );
};

export default TableauDeBordChef;