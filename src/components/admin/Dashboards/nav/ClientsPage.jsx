// src/components/admin/Dashboards/nav/ClientsPage.jsx
import React from 'react';
// <-- 1. CORRECTION : Ajout de "Legend" à l'importation
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'; 
import { Briefcase, UserPlus, Star, Activity } from 'lucide-react';

// --- Données Statiques ---
const clientStats = {
    total: 84,
    nouveaux: 5, // Ce mois-ci
    actifs: 75,
    inactifs: 9,
};

const clientsByIndustry = [
    { name: 'Technologie', value: 25, color: '#3b82f6' },
    { name: 'Santé', value: 18, color: '#22c55e' },
    { name: 'Finance', value: 15, color: '#eab308' },
    { name: 'Retail', value: 26, color: '#f97316' },
];

const recentClients = [
    { id: 1, name: 'Innovatech Solutions', status: 'Actif', joinDate: '01 Juil 2025' },
    { id: 2, name: 'SantéPlus Laboratoires', status: 'Actif', joinDate: '28 Juin 2025' },
    { id: 3, name: 'FinSecure Banque', status: 'Inactif', joinDate: '15 Mai 2025' },
];

// --- Composants du Widget ---
const WidgetContainer = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md w-full flex flex-col">
        <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 mb-4">{title}</h3>
        <div className="flex-grow">{children}</div>
    </div>
);

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="text-white" size={24} />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

// --- Composant Principal ---
const ClientsPage = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 animate-in fade-in-0">
            {/* Colonne de Gauche */}
            <div className="lg:col-span-2 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard title="Clients Totaux" value={clientStats.total} icon={Briefcase} color="bg-sky-500" />
                    <StatCard title="Nouveaux (30j)" value={clientStats.nouveaux} icon={UserPlus} color="bg-green-500" />
                    <StatCard title="Clients Actifs" value={clientStats.actifs} icon={Activity} color="bg-yellow-500" />
                    <StatCard title="Top Client" value="Innovatech" icon={Star} color="bg-orange-500" />
                </div>
                <WidgetContainer title="Nouveaux Clients Récents">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-4 py-2">Nom du Client</th>
                                    <th className="px-4 py-2">Statut</th>
                                    <th className="px-4 py-2">Date d'inscription</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentClients.map(client => (
                                    <tr key={client.id} className="border-b dark:border-slate-700">
                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{client.name}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${client.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{client.status}</span></td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{client.joinDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </WidgetContainer>
            </div>
            {/* Colonne de Droite */}
            <div className="lg:col-span-1 space-y-3">
                <WidgetContainer title="Répartition par Industrie">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={clientsByIndustry} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                {clientsByIndustry.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                            </Pie>
                            <Tooltip />
                            {/* <-- 2. CORRECTION : Renommage du composant */}
                            <Legend iconType="circle" iconSize={8} /> 
                        </PieChart>
                    </ResponsiveContainer>
                </WidgetContainer>
            </div>
        </div>
    );
};

export default ClientsPage;