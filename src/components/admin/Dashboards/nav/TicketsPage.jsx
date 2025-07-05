// src/components/admin/Dashboards/nav/TicketsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend as RechartsLegend, 
    ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar 
} from 'recharts';
import { Filter, Download, Printer, ChevronDown } from 'lucide-react';
import dashboardService from '../../../../services/dashboardService';
import webSocketService from '../../../../services/webSocketService';

// --- CONFIGURATIONS ---
const ticketStatusConfig = {
  accepte: { name: 'Accepté', color: '#84cc16' },
  en_attente: { name: 'En Attente', color: '#f97316' },
  en_cours: { name: 'En Cours', color: '#eab308' },
  termine: { name: 'Terminé', color: '#22c55e' },
  refuse: { name: 'Refusé', color: '#ef4444' },
};

const ticketPriorityConfig = {
  haute: { name: 'Haute', color: '#be123c' },
  moyenne: { name: 'Moyenne', color: '#f59e0b' },
  basse: { name: 'Basse', color: '#3b82f6' },
};


// --- SOUS-COMPOSANTS ---

export const WidgetContainer = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md w-full flex flex-col">
        {title && (
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100">{title}</h3>
            </div>
        )}
        <div className="flex-grow min-h-[100px]">{children}</div>
    </div>
);

export const LoadingIndicator = () => <div className="flex justify-center items-center h-full"><p className="text-slate-500">Chargement...</p></div>;

const VolumeByStatusChart = ({ data, isLoading, timeFilter, onTimeFilterChange, groupBy, onGroupByChange, config }) => {
    const filterButtons = [{ key: 'today', label: 'Aujourd\'hui' }, { key: 'last7days', label: '7 Jours' }, { key: 'thismonthweeks', label: 'Mois' }, { key: 'thisyearmonths', label: 'Année' }, { key: 'byyear', label: 'Historique' }];
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <WidgetContainer title={`Volume des Tickets par ${groupBy === 'status' ? 'Statut' : 'Priorité'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex justify-start gap-2 flex-wrap">
                    {filterButtons.map(button => (<button key={button.key} onClick={() => onTimeFilterChange(button.key)} className={`px-3 py-1 text-xs font-semibold rounded ${timeFilter === button.key ? 'bg-sky-500 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{button.label}</button>))}
                </div>
                <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-slate-400 hover:text-slate-600 flex items-center gap-1 border rounded-md px-2 py-0.5">
                        <Filter size={14} />
                        <span className="text-xs font-semibold">Grouper par</span>
                        <ChevronDown size={14} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-700 rounded-md shadow-lg z-10">
                            <a href="#" onClick={(e) => { e.preventDefault(); onGroupByChange('status'); setMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">Statut</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onGroupByChange('priority'); setMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">Priorité</a>
                        </div>
                    )}
                </div>
            </div>
            {isLoading ? <LoadingIndicator /> : ((data && data.length > 0) ? (<ResponsiveContainer width="100%" height={250}><BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="time_unit" stroke="rgb(100 116 139)" fontSize={12} /><YAxis stroke="rgb(100 116 139)" fontSize={12} /><Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem' }} /><RechartsLegend iconType="circle" iconSize={8} />
                {Object.entries(config).map(([key, conf]) => (<Bar key={key} dataKey={key} stackId="a" name={conf.name} fill={conf.color} />))}</BarChart></ResponsiveContainer>) : (<div className="flex items-center justify-center h-[250px] text-slate-500"><p>Aucune donnée pour cette période.</p></div>))}
        </WidgetContainer>
    );
};

// Dans src/components/admin/Dashboards/nav/TicketsPage.jsx

const InProgressTicketsChart = ({ data, isLoading, timeFilter, onTimeFilterChange }) => {
    const filterButtons = [ { key: 'today', label: 'Aujourd\'hui' }, { key: 'last7days', label: '7 Jours' }, { key: 'thismonthweeks', label: 'Mois' }, { key: 'thisyearmonths', label: 'Année' }, { key: 'byyear', label: 'Historique' }];

    // NOUVEAU : Fonction pour formater les libellés de l'axe Y
    const formatYAxisTick = (value) => {
        const maxLength = 20; // Nombre de caractères max avant de couper
        if (value.length > maxLength) {
            return `${value.substring(0, maxLength)}...`;
        }
        return value;
    };

    return (
        <WidgetContainer title="Suivi des Tickets 'En Cours'">
            <div className="flex justify-start gap-2 mb-4 flex-wrap">
                {filterButtons.map(button => (
                    <button key={button.key} onClick={() => onTimeFilterChange(button.key)} className={`px-3 py-1 text-xs font-semibold rounded ${timeFilter === button.key ? 'bg-sky-500 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {button.label}
                    </button>
                ))}
            </div>
            {isLoading ? <LoadingIndicator /> : (
                (data && data.length > 0) ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data} layout="vertical" barSize={15} margin={{ right: 20, left: 25 /* On ajoute de la marge à gauche */ }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis type="number" stroke="rgb(100 116 139)" label={{ value: 'Jours', position: 'insideBottom', offset: -5 }} fontSize={12} />
                            
                            {/* --- CORRECTION ICI --- */}
                            <YAxis 
                                type="category" 
                                dataKey="name" 
                                stroke="rgb(100 116 139)" 
                                width={120} // On donne une largeur fixe
                                fontSize={12} 
                                tickFormatter={formatYAxisTick} // On applique notre fonction de formatage
                            />
                            
                            <Tooltip formatter={(value) => `${value} jours`} />
                            <RechartsLegend payload={[{ value: 'Temps Écoulé', type: 'rect', color: '#eab308' }, { value: 'Temps Restant', type: 'rect', color: '#e2e8f0' }]} />
                            <Bar dataKey="data[0]" stackId="a" name="Temps Écoulé" fill="#eab308" />
                            <Bar dataKey="data[1]" stackId="a" name="Temps Restant" fill="#e2e8f0" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                     <div className="flex items-center justify-center h-[250px] text-slate-500"><p>Aucun ticket "En Cours" pour cette période.</p></div>
                )
            )}
        </WidgetContainer>
    );
};

const StatsSummary = ({ stats, isLoading }) => (
    <WidgetContainer title="Tickets par Statut (Global)">
        {isLoading ? <LoadingIndicator /> : (<div className="space-y-2">{Object.entries(ticketStatusConfig).map(([key, config]) => (<div key={key} className="flex justify-between items-center py-1"><div className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }}></span><span className="text-sm font-medium text-slate-600 dark:text-slate-300">{config.name}</span></div><span className="font-semibold text-slate-800 dark:text-slate-100">{stats[key] || 0}</span></div>))}<div className="border-t dark:border-slate-700 !mt-2 pt-2"><div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-800 dark:text-slate-100">Total</span><span className="font-bold text-lg text-sky-500">{stats.total || 0}</span></div></div></div>)}
    </WidgetContainer>
);

const DonutChartSummary = ({ stats, isLoading, timeFilter, onTimeFilterChange }) => {
    const chartData = Object.entries(ticketStatusConfig).map(([key, config]) => ({ name: config.name, value: stats[key] || 0, fill: config.color })).filter(item => item.value > 0);
    const filterButtons = [{ key: 'week', label: 'Semaine' }, { key: 'month', label: 'Mois' }, { key: 'year', label: 'Année' }];
    return (
        <WidgetContainer title="Répartition par Période">
            <div className="flex justify-start gap-2 mb-4">{filterButtons.map(button => (<button key={button.key} onClick={() => onTimeFilterChange(button.key)} className={`px-3 py-1 text-xs font-semibold rounded ${timeFilter === button.key ? 'bg-sky-500 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{button.label}</button>))}</div>
            {isLoading ? <LoadingIndicator /> : (<ResponsiveContainer width="100%" height={120}><PieChart><Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={3}>{chartData.map(entry => <Cell key={`cell-${entry.name}`} fill={entry.fill} />)}</Pie><Tooltip /><RechartsLegend iconType="circle" iconSize={8} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} /></PieChart></ResponsiveContainer>)}
        </WidgetContainer>
    );
};

const GaugesSummary = ({ stats, isLoading, timeFilter, onTimeFilterChange }) => {
    const total = stats.total || 1;
    const filterButtons = [{ key: 'week', label: 'Semaine' }, { key: 'month', label: 'Mois' }, { key: 'year', label: 'Année' }];
    return (
        <WidgetContainer title="Taux par Période">
            <div className="flex justify-start gap-2 mb-4">{filterButtons.map(button => (<button key={button.key} onClick={() => onTimeFilterChange(button.key)} className={`px-3 py-1 text-xs font-semibold rounded ${timeFilter === button.key ? 'bg-sky-500 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{button.label}</button>))}</div>
            {isLoading ? <LoadingIndicator /> : (<div className="grid grid-cols-2 gap-y-2 gap-x-0">{Object.entries(ticketStatusConfig).map(([key, config]) => (<div key={key} className="flex flex-col items-center"><ResponsiveContainer width="100%" height={60}><RadialBarChart cx="50%" cy="80%" innerRadius="90%" outerRadius="110%" barSize={6} data={[{ value: ((stats[key] || 0) / total) * 100 }]}><RadialBar background dataKey="value" fill={config.color} cornerRadius={3} /></RadialBarChart></ResponsiveContainer><p className="text-sm font-semibold -mt-8">{(((stats[key] || 0) / total) * 100).toFixed(0)}%</p><p className="text-xs text-slate-500">{config.name}</p></div>))}</div>)}
        </WidgetContainer>
    );
};


// --- COMPOSANT PRINCIPAL DE LA PAGE ---
const TicketsPage = () => {
    const [groupBy, setGroupBy] = useState('status');
    const [timeFilter, setTimeFilter] = useState('last7days');
    const [chartData, setChartData] = useState([]);
    const [isChartLoading, setIsChartLoading] = useState(true);
    
    const [globalStats, setGlobalStats] = useState({});
    const [isGlobalStatsLoading, setIsGlobalStatsLoading] = useState(true);
    
    const [donutTimeFilter, setDonutTimeFilter] = useState('week');
    const [donutStats, setDonutStats] = useState({});
    const [isDonutLoading, setIsDonutLoading] = useState(true);
    
    const [gaugesTimeFilter, setGaugesTimeFilter] = useState('week');
    const [gaugesStats, setGaugesStats] = useState({});
    const [isGaugesLoading, setIsGaugesLoading] = useState(true);

    const [ganttTimeFilter, setGanttTimeFilter] = useState('thismonthweeks');
    const [ganttData, setGanttData] = useState([]);
    const [isGanttLoading, setIsGanttLoading] = useState(true);
    
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    

    const mapApiStatusToKey = (apiStatus) => {
        const lowerCaseStatus = String(apiStatus).toLowerCase().replace('_', '-');
        for (const key in ticketStatusConfig) { if (lowerCaseStatus === key.replace('_', '-')) return key; }
        return null;
    };

    const processStatsResponse = (response) => {
        const processedStats = { total: 0 };
        Object.keys(ticketStatusConfig).forEach(key => processedStats[key] = 0);
        response.forEach(item => {
            const key = mapApiStatusToKey(item.status);
            if (key) {
                processedStats[key] = (processedStats[key] || 0) + item.count;
                processedStats.total += item.count;
            }
        });
        return processedStats;
    };
    
    const refreshAllData = useCallback(() => {
        console.log('Notification WebSocket reçue ! Rafraîchissement des données...');
        setRefreshTrigger(count => count + 1);
    }, []);

    useEffect(() => {
        webSocketService.connect((message) => {
            if (message === 'TICKETS_UPDATED') {
                console.log('Notification WebSocket reçue ! Déclenchement du rafraîchissement.');
                // On incrémente le compteur pour forcer la mise à jour
                setRefreshTrigger(prevCount => prevCount + 1);
            }
        });

        // Déconnexion propre lorsque le composant est retiré de l'écran
        return () => {
            webSocketService.disconnect();
        };
    }, []);

    useEffect(() => {
        setIsGlobalStatsLoading(true);
        dashboardService.getGlobalTicketsByStatus()
            .then(response => setGlobalStats(processStatsResponse(response)))
            .catch(e => console.error("Échec stats globales", e))
            .finally(() => setIsGlobalStatsLoading(false));
    }, [refreshTrigger]); // <-- Dépendance ajoutée

    // Hook pour le GRAPHIQUE PRINCIPAL
    useEffect(() => {
        setIsChartLoading(true);
        const serviceCall = groupBy === 'priority' 
            ? dashboardService.getTicketsByPriorityOverTime(timeFilter) 
            : dashboardService.getTicketsByStatusOverTime(timeFilter);
        
        serviceCall
            .then(response => setChartData(response))
            .catch(e => setError("Impossible de charger les données du graphique principal."))
            .finally(() => setIsChartLoading(false));
    }, [timeFilter, groupBy, refreshTrigger]); // <-- Dépendance ajoutée

    // Hook pour le GRAPHIQUE DONUT
    useEffect(() => {
        setIsDonutLoading(true);
        dashboardService.getTicketsByStatus(donutTimeFilter)
            .then(response => setDonutStats(processStatsResponse(response)))
            .catch(e => console.error("Échec graphique donut", e))
            .finally(() => setIsDonutLoading(false));
    }, [donutTimeFilter, refreshTrigger]); // <-- Dépendance ajoutée

    // Hook pour les JAUGES
    useEffect(() => {
        setIsGaugesLoading(true);
        dashboardService.getTicketsByStatus(gaugesTimeFilter)
            .then(response => setGaugesStats(processStatsResponse(response)))
            .catch(e => console.error("Échec jauges", e))
            .finally(() => setIsGaugesLoading(false));
    }, [gaugesTimeFilter, refreshTrigger]); // <-- Dépendance ajoutée
    
    // Hook pour le graphique GANTT
    useEffect(() => {
        const daysBetween = (date1, date2) => Math.round(Math.abs(new Date(date1) - new Date(date2)) / (1000 * 60 * 60 * 24));
        setIsGanttLoading(true);
        dashboardService.getInProgressTicketsGantt(ganttTimeFilter)
            .then(response => {
                const processedData = response.map(ticket => {
                    const now = new Date();
                    const debut = ticket.debutTraitement ? new Date(ticket.debutTraitement) : now;
                    const echeance = ticket.dateEcheance ? new Date(ticket.dateEcheance) : now;
                    const tempsEcoule = daysBetween(debut, now);
                    const tempsTotal = daysBetween(debut, echeance);
                    const tempsRestant = Math.max(0, tempsTotal - tempsEcoule);
                    return { name: ticket.name, data: [tempsEcoule, tempsRestant] };
                });
                setGanttData(processedData);
            })
            .catch(e => console.error("Échec du chargement des données Gantt:", e))
            .finally(() => setIsGanttLoading(false));
    }, [ganttTimeFilter, refreshTrigger]); // <-- Dépendance ajoutée    

    if (error) {
        return <div className="text-red-500 text-center p-8">{error}</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 animate-in fade-in-0">
            <div className="lg:col-span-2 space-y-3">
                <VolumeByStatusChart data={chartData} isLoading={isChartLoading} timeFilter={timeFilter} onTimeFilterChange={setTimeFilter} groupBy={groupBy} onGroupByChange={setGroupBy} config={groupBy === 'status' ? ticketStatusConfig : ticketPriorityConfig} />
                <InProgressTicketsChart data={ganttData} isLoading={isGanttLoading} timeFilter={ganttTimeFilter} onTimeFilterChange={setGanttTimeFilter} />
            </div>
            <div className="lg:col-span-1 space-y-3">
                <StatsSummary stats={globalStats} isLoading={isGlobalStatsLoading} />
                <DonutChartSummary stats={donutStats} isLoading={isDonutLoading} timeFilter={donutTimeFilter} onTimeFilterChange={setDonutTimeFilter} />
                <GaugesSummary stats={gaugesStats} isLoading={isGaugesLoading} timeFilter={gaugesTimeFilter} onTimeFilterChange={setGaugesTimeFilter} />
            </div>
        </div>
    );
};

export default TicketsPage;