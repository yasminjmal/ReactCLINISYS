// src/components/admin/Dashboards/nav/UtilisateursPage.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, UserCheck, UserX, LogIn } from 'lucide-react';

// --- Données Statiques ---
const userStats = { total: 42, actifs: 38, inactifs: 4 };
const usersByRole = [
    { role: 'Admin', count: 5, color: '#ef4444' },
    { role: 'Chef de projet', count: 10, color: '#f97316' },
    { role: 'Employé', count: 27, color: '#3b82f6' },
];
const recentActivity = [
    { id: 1, user: 'Alice', action: 'Connexion réussie', time: 'il y a 5 min' },
    { id: 2, user: 'Bob', action: 'A créé un ticket', time: 'il y a 15 min' },
    { id: 3, user: 'Charlie', action: 'Mot de passe modifié', time: 'il y a 1h' },
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
const UtilisateursPage = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 animate-in fade-in-0">
            {/* Colonne de Gauche */}
            <div className="lg:col-span-2 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <StatCard title="Utilisateurs Totaux" value={userStats.total} icon={Users} color="bg-sky-500" />
                    <StatCard title="Utilisateurs Actifs" value={userStats.actifs} icon={UserCheck} color="bg-green-500" />
                    <StatCard title="Utilisateurs Inactifs" value={userStats.inactifs} icon={UserX} color="bg-red-500" />
                </div>
                <WidgetContainer title="Répartition par Rôle">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={usersByRole} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="role" width={120} stroke="rgb(100 116 139)" fontSize={12} />
                            <Tooltip />
                            <Bar dataKey="count" name="Nombre d'utilisateurs">
                                {usersByRole.map(entry => <Cell key={entry.role} fill={entry.color} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </WidgetContainer>
            </div>
            {/* Colonne de Droite */}
            <div className="lg:col-span-1 space-y-3">
                <WidgetContainer title="Activité Récente">
                    <ul className="space-y-3">
                        {recentActivity.map(activity => (
                            <li key={activity.id} className="flex items-start gap-3">
                                <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full">
                                    <LogIn size={16} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{activity.user} <span className="text-slate-500 font-normal">{activity.action}</span></p>
                                    <p className="text-xs text-slate-400">{activity.time}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </WidgetContainer>
            </div>
        </div>
    );
};

export default UtilisateursPage;