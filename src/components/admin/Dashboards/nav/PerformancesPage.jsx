// Créez ce nouveau fichier : src/components/admin/Dashboards/nav/PerformancesPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardService from '../../../../services/dashboardService';
import { WidgetContainer, LoadingIndicator } from './TicketsPage'; // On réutilise les composants
// import { WidgetContainer } from '../shared/WidgetContainer';
// import { LoadingIndicator } from '../shared/LoadingIndicator';

const HUE_START = 195; // Un bleu-cyan pour commencer

const PerformancesPage = () => {
    const [groupBy, setGroupBy] = useState('utilisateur');
    const [period, setPeriod] = useState('thismonth');
    const [chartData, setChartData] = useState([]);
    const [lineKeys, setLineKeys] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fonction pour transformer les données de l'API en un format pour Recharts
    const processApiData = (apiData) => {
        if (!apiData || apiData.length === 0) {
            setLineKeys([]);
            return [];
        }

        const uniqueKeys = [...new Set(apiData.map(item => item.groupName))];
        setLineKeys(uniqueKeys);

        const pivotedData = apiData.reduce((acc, item) => {
            // "acc" est l'accumulateur (notre tableau final), "item" est une ligne de l'API
            const { timeUnit, groupName, totalTickets, onTimeTickets } = item;
            
            // On cherche si un objet pour ce "timeUnit" (ex: jour "15") existe déjà
            let timeEntry = acc.find(entry => entry.timeUnit === timeUnit);
            if (!timeEntry) {
                timeEntry = { timeUnit };
                acc.push(timeEntry);
            }

            // On calcule le pourcentage et on l'ajoute à l'objet
            const percentage = totalTickets > 0 ? (onTimeTickets / totalTickets) * 100 : 0;
            timeEntry[groupName] = parseFloat(percentage.toFixed(1));

            return acc;
        }, []);
        
        return pivotedData;
    };


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await dashboardService.getPerformanceStats(groupBy, period);
                const processed = processApiData(response);
                setChartData(processed);
            } catch (e) {
                setError("Impossible de charger les données de performance.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [groupBy, period]);

    const groupByOptions = [ { key: 'utilisateur', label: 'Utilisateur' }, { key: 'module', label: 'Module' }, { key: 'equipe', label: 'Équipe' }];
    // Note: la logique de période ici est simplifiée, vous pouvez la complexifier comme sur l'autre page
const periodOptions = [ 
        { key: 'thismonth', label: 'Ce mois-ci' }, 
        { key: 'last7days', label: '7 derniers jours' }
    ];
    return (
        <div className="animate-in fade-in-0">
            <WidgetContainer title="Analyse de Performance : Taux de Résolution à Temps">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 mr-3">Grouper par :</span>
                        {groupByOptions.map(opt => (
                            <button key={opt.key} onClick={() => setGroupBy(opt.key)} className={`px-3 py-1.5 text-xs font-semibold rounded-md mr-2 ${groupBy === opt.key ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>{opt.label}</button>
                        ))}
                    </div>
                     <div>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 mr-3">Période :</span>
                        {periodOptions.map(opt => (
                            <button key={opt.key} onClick={() => setPeriod(opt.key)} className={`px-3 py-1.5 text-xs font-semibold rounded-md mr-2 ${period === opt.key ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>{opt.label}</button>
                        ))}
                    </div>
                </div>

                {isLoading ? <LoadingIndicator/> : (
                    error ? <p className="text-red-500">{error}</p> : (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                <XAxis dataKey="timeUnit" stroke="rgb(100 116 139)" fontSize={12} />
                                <YAxis stroke="rgb(100 116 139)" fontSize={12} unit="%" domain={[0, 100]} />
                                <Tooltip formatter={(value) => `${value}%`} />
                                <Legend />
                                {lineKeys.map((key, index) => (
                                    <Line 
                                        key={key} 
                                        type="monotone" 
                                        dataKey={key} 
                                        stroke={`hsl(${HUE_START + (index * 40)}, 70%, 50%)`} // Génère des couleurs différentes
                                        strokeWidth={2} 
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    )
                )}
            </WidgetContainer>
        </div>
    );
};

export default PerformancesPage;