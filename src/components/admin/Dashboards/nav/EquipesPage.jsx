// src/components/admin/Dashboards/nav/EquipesPage.jsx
import React from 'react';
// <-- 1. CORRECTION : "RechartsLegend" est remplacé par "Legend"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Shield, Zap } from 'lucide-react';

// --- Données Statiques ---
const teamsData = [
    { name: 'Équipe Alpha', ticketsResolus: 45, membres: 5 },
    { name: 'Équipe Bravo', ticketsResolus: 60, membres: 6 },
    { name: 'Équipe Charlie', ticketsResolus: 25, membres: 4 },
    { name: 'Support N1', ticketsResolus: 80, membres: 8 },
];

// --- Composants du Widget ---
const WidgetContainer = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md w-full flex flex-col">
        <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 mb-4">{title}</h3>
        <div className="flex-grow">{children}</div>
    </div>
);

// --- Composant Principal ---
const EquipesPage = () => {
    return (
        <div className="animate-in fade-in-0">
            <WidgetContainer title="Performance des Équipes (30 derniers jours)">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={teamsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" stroke="rgb(100 116 139)" fontSize={12} />
                        <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" label={{ value: 'Tickets Résolus', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#22c55e" label={{ value: 'Membres', angle: -90, position: 'insideRight' }}/>
                        <Tooltip />
                        {/* <-- 2. CORRECTION : Renommage du composant */}
                        <Legend />
                        <Bar yAxisId="left" dataKey="ticketsResolus" name="Tickets Résolus" fill="#3b82f6" />
                        <Bar yAxisId="right" dataKey="membres" name="Nombre de Membres" fill="#22c55e" />
                    </BarChart>
                </ResponsiveContainer>
            </WidgetContainer>
        </div>
    );
};

export default EquipesPage;