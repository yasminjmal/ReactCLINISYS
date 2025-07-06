// src/components/chefEquipe/TeamGlobalOverview.jsx
import React from 'react';
import { Users as UsersIcon, Box, BarChart2, Hash,Globe } from 'lucide-react';

// Pour le diagramme (placeholder ou Recharts si installé)
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TeamGlobalOverview = ({ teams, allModules }) => {
    // Calcul des statistiques globales
    const totalTeams = teams.length;
    const totalMembers = teams.reduce((acc, team) => acc + (team.assignments?.length || 0), 0);
    
    // Calcul des modules gérés uniques par toutes les équipes
    const uniqueModulesManaged = new Set();
    teams.forEach(team => {
        allModules.filter(mod => mod.equipe?.id === team.id)
                  .forEach(mod => uniqueModulesManaged.add(mod.id));
    });
    const totalUniqueModules = uniqueModulesManaged.size;

    // Données pour le diagramme (exemple statique)
    const chartData = teams.map(team => ({
        name: team.designation,
        ticketsAssigned: Math.floor(Math.random() * 50) + 10, // Static random tickets
    }));

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
                <Globe size={24} className="mr-3 text-violet-600 dark:text-violet-400" /> Aperçu Global des Équipes
            </h2>

            {/* KPIs globaux */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center">
                    <UsersIcon size={40} className="mx-auto mb-3 text-blue-500" />
                    <p className="text-sm text-slate-500 dark:text-slate-300">Nombre d'Équipes</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{totalTeams}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center">
                    <UsersIcon size={40} className="mx-auto mb-3 text-green-500" />
                    <p className="text-sm text-slate-500 dark:text-slate-300">Membres Totaux</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{totalMembers}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center">
                    <Box size={40} className="mx-auto mb-3 text-orange-500" />
                    <p className="text-sm text-slate-500 dark:text-slate-300">Modules Gérés</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{totalUniqueModules}</p>
                </div>
            </div>

            {/* Diagramme à barres: Tickets assignés par équipe */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
                    <BarChart2 size={20} className="mr-2 text-violet-500" /> Tickets Assignés par Équipe
                </h3>
                <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    {/* Placeholder for Recharts BarChart */}
                    <p>Diagramme à barres ici (Nom d'équipe vs Nombre de tickets)</p>
                    {/* Example of how to use Recharts (uncomment and install if needed): */}
                    {/*
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="ticketsAssigned" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                    */}
                     <ul className="text-sm ml-4 space-y-1">
                        {chartData.map((item, index) => (
                            <li key={index}>{item.name}: {item.ticketsAssigned} tickets</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TeamGlobalOverview;