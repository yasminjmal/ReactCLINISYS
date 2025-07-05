// Dans src/components/admin/Dashboards/nav/EquipesPage.jsx

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import dashboardService from '../../../../services/dashboardService';
import { WidgetContainer, LoadingIndicator } from './TicketsPage';

const EquipesPage = () => {
    const [period, setPeriod] = useState('thismonth');
    const [teamData, setTeamData] = useState([]);
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
                const response = await dashboardService.getTeamPerformanceStats(period);
                response.sort((a, b) => b.onTimeRate - a.onTimeRate);
                setTeamData(response);
            } catch (e) {
                console.error("Erreur EquipesPage", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [period]); // L'effet se déclenche quand la période change

    return (
        <div className="animate-in fade-in-0">
            <WidgetContainer title="Performance par Équipe (Taux de Résolution à Temps)">
                {/* NOUVEAU : Affichage des boutons de filtre */}
                <div className="flex justify-start gap-2 mb-4 flex-wrap">
                    {periodOptions.map(opt => (
                        <button key={opt.key} onClick={() => setPeriod(opt.key)} className={`px-3 py-1 text-xs font-semibold rounded ${period === opt.key ? 'bg-sky-500 text-white shadow' : 'bg-slate-100 dark:bg-slate-700'}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>
                {isLoading ? <LoadingIndicator /> : (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={teamData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                            <XAxis type="number" domain={[0, 100]} unit="%"/>
                            <YAxis type="category" dataKey="teamName" width={120} />
                            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                            <Bar dataKey="onTimeRate" fill="#3b82f6" barSize={30}>
                                <LabelList dataKey="onTimeRate" position="right" formatter={(value) => `${value.toFixed(1)}%`} fill="#3b82f6"/>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </WidgetContainer>
        </div>
    );
};

export default EquipesPage;