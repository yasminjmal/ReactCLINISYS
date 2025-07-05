// Dans src/components/admin/Dashboards/nav/UtilisateursPage.jsx

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import dashboardService from '../../../../services/dashboardService';
import { WidgetContainer, LoadingIndicator } from './TicketsPage';

const PerformanceRankingChart = ({ title, data, color }) => (
    <WidgetContainer title={title}>
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 50, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                <XAxis type="number" domain={[0, 100]} unit="%" hide/>
                <YAxis type="category" dataKey="userName" width={120} axisLine={false} tickLine={false}/>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Bar dataKey="onTimeRate" fill={color} barSize={25}>
                    <LabelList dataKey="onTimeRate" position="right" formatter={(value) => `${value.toFixed(1)}%`} fill={color}/>
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </WidgetContainer>
);

const UtilisateursPage = () => {
    const [period, setPeriod] = useState('thismonth');
    const [topUsers, setTopUsers] = useState([]);
    const [bottomUsers, setBottomUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // NOUVEAU : Définition des boutons de filtre
    const periodOptions = [
        { key: 'thismonth', label: 'Ce mois-ci' },
        { key: 'last7days', label: '7 Jours' },
        { key: 'thisyearmonths', label: 'Cette Année' },
        { key: 'byyear', label: 'Historique' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await dashboardService.getUserPerformanceStats(period);
                const sortedByTop = [...response].sort((a, b) => b.onTimeRate - a.onTimeRate);
                setTopUsers(sortedByTop.slice(0, 5));
                const sortedByBottom = [...response].sort((a, b) => a.onTimeRate - b.onTimeRate);
                setBottomUsers(sortedByBottom.slice(0, 5));
            } catch (e) {
                console.error("Erreur UtilisateursPage", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [period]);

    return (
        <div>
            {/* NOUVEAU : Conteneur pour les filtres */}
            <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 mr-3">Filtrer par Période :</span>
                {periodOptions.map(opt => (
                    <button key={opt.key} onClick={() => setPeriod(opt.key)} className={`px-3 py-1.5 text-xs font-semibold rounded-md mr-2 ${period === opt.key ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                        {opt.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-0">
                {isLoading ? (
                    <>
                        <WidgetContainer><LoadingIndicator /></WidgetContainer>
                        <WidgetContainer><LoadingIndicator /></WidgetContainer>
                    </>
                ) : (
                    <>
                        <PerformanceRankingChart title="Top 5 des Utilisateurs Performants" data={topUsers} color="#22c55e" />
                        <PerformanceRankingChart title="Top 5 des Utilisateurs à Suivre" data={bottomUsers} color="#ef4444" />
                    </>
                )}
            </div>
        </div>
    );
};

export default UtilisateursPage;