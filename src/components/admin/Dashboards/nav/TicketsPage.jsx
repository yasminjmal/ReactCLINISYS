// src/components/admin/Dashboards/nav/TicketsPage.jsx

import React, { useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend as RechartsLegend, 
    ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar 
} from 'recharts';
import { MoreVertical, Filter, Download, Printer } from 'lucide-react';

// --- Données Statiques (inchangées) ---
const ticketStatusConfig = {
  nouveau: { name: 'Nouveau', color: '#3b82f6' },
  en_attente: { name: 'En Attente', color: '#f97316' },
  en_cours: { name: 'En Cours', color: '#eab308' },
  resolu: { name: 'Résolu', color: '#22c55e' },
};
const ticketCounts = {
  nouveau: 12, en_attente: 8, en_cours: 31, resolu: 157,
  get total() { return this.nouveau + this.en_attente + this.en_cours + this.resolu; }
};
const barChartDataByTime = {
    day: [ { name: 'Aujourd\'hui', nouveau: 2, en_cours: 5, resolu: 8, en_attente: 1 } ],
    week: [
        { name: 'Lun', nouveau: 2, en_cours: 5, resolu: 8, en_attente: 1 }, { name: 'Mar', nouveau: 1, en_cours: 7, resolu: 6, en_attente: 3 },
        { name: 'Mer', nouveau: 3, en_cours: 4, resolu: 10, en_attente: 2 }, { name: 'Jeu', nouveau: 2, en_cours: 6, resolu: 9, en_attente: 1 },
        { name: 'Ven', nouveau: 4, en_cours: 5, resolu: 12, en_attente: 1 },
    ],
    month: [
        { name: 'Sem 1', nouveau: 10, en_cours: 25, resolu: 40, en_attente: 5 }, { name: 'Sem 2', nouveau: 12, en_cours: 30, resolu: 35, en_attente: 8 },
        { name: 'Sem 3', nouveau: 8, en_cours: 28, resolu: 45, en_attente: 6 }, { name: 'Sem 4', nouveau: 15, en_cours: 35, resolu: 50, en_attente: 10 },
    ],
    year: [ { name: 'Jan', nouveau: 50, en_cours: 120, resolu: 200, en_attente: 30 }, /* ... */ ]
};
const inProgressTicketsData = [
  { id: '#T-123', affectation: new Date('2025-07-01'), echeance: new Date('2025-07-10') }, { id: '#T-124', affectation: new Date('2025-06-25'), echeance: new Date('2025-07-05') },
  { id: '#T-125', affectation: new Date('2025-07-02'), echeance: new Date('2025-07-15') }, { id: '#T-126', affectation: new Date('2025-07-03'), echeance: new Date('2025-07-08') },
];
const daysBetween = (date1, date2) => Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));

// --- SOUS-COMPOSANTS ---

// <-- CORRECTION PRINCIPALE ICI : La classe "h-full" a été retirée
const WidgetContainer = ({ title, children, actionButtons = true }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md w-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100">{title}</h3>
            {actionButtons && (
                <div className="flex items-center gap-2">
                    <button className="p-1 text-slate-400 hover:text-slate-600"><Filter size={16}/></button>
                    <button className="p-1 text-slate-400 hover:text-slate-600"><Download size={16}/></button>
                    <button className="p-1 text-slate-400 hover:text-slate-600"><Printer size={16}/></button>
                </div>
            )}
        </div>
        <div className="flex-grow">{children}</div>
    </div>
);


// --- Widgets de la Colonne de Gauche ---

const VolumeByStatusChart = () => {
    const [timeFilter, setTimeFilter] = useState('week');
    return (
        <WidgetContainer title="Volume des Tickets par Statut">
            <div className="flex justify-start gap-2 mb-4">
                 {['day', 'week', 'month', 'year'].map(period => (
                    <button key={period} onClick={() => setTimeFilter(period)} className={`px-3 py-1 text-xs font-semibold rounded ${timeFilter === period ? 'bg-sky-500 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {period === 'day' ? 'Jour' : period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
                    </button>
                ))}
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barChartDataByTime[timeFilter]} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="name" stroke="rgb(100 116 139)" fontSize={12} />
                    <YAxis stroke="rgb(100 116 139)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem' }}/>
                    <RechartsLegend iconType="circle" iconSize={8} />
                    {Object.keys(ticketStatusConfig).map(statusKey => (
                         <Bar key={statusKey} dataKey={statusKey} stackId="a" name={ticketStatusConfig[statusKey].name} fill={ticketStatusConfig[statusKey].color} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </WidgetContainer>
    );
};

const InProgressTicketsChart = () => {
    const ganttData = inProgressTicketsData.map(ticket => {
        const joursEcoules = daysBetween(ticket.affectation, new Date());
        const joursTotaux = daysBetween(ticket.affectation, ticket.echeance);
        const joursRestants = Math.max(0, joursTotaux - joursEcoules);
        return { name: ticket.id, data: [joursEcoules, joursRestants] };
    });
    return (
        <WidgetContainer title="Suivi des Tickets 'En Cours'">
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ganttData} layout="vertical" barSize={15}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis type="number" stroke="rgb(100 116 139)" label={{ value: 'Jours', position: 'insideBottom', offset: -5 }} fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="rgb(100 116 139)" width={70} fontSize={12} />
                    <Tooltip formatter={(value) => `${value} jours`} />
                    <RechartsLegend payload={[{ value: 'Temps Écoulé', type: 'rect', color: '#eab308' }, { value: 'Temps Restant', type: 'rect', color: '#e2e8f0' }]}/>
                    <Bar dataKey="data[0]" stackId="a" name="Temps Écoulé" fill="#eab308" />
                    <Bar dataKey="data[1]" stackId="a" name="Temps Restant" fill="#e2e8f0" />
                </BarChart>
            </ResponsiveContainer>
        </WidgetContainer>
    );
};


// --- Widgets de la Colonne de Droite ---

const StatsSummary = () => (
    <WidgetContainer title="Tickets par Statut" actionButtons={false}>
        <div className="space-y-2">
            {Object.keys(ticketStatusConfig).map(key => (
                <div key={key} className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ticketStatusConfig[key].color }}></span>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{ticketStatusConfig[key].name}</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{ticketCounts[key]}</span>
                </div>
            ))}
            <div className="border-t dark:border-slate-700 !mt-2 pt-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Total</span>
                    <span className="font-bold text-lg text-sky-500">{ticketCounts.total}</span>
                </div>
            </div>
        </div>
    </WidgetContainer>
);

const DonutChartSummary = () => (
    <WidgetContainer title="Répartition Globale">
        <ResponsiveContainer width="100%" height={120}> 
            <PieChart>
                <Pie data={Object.keys(ticketStatusConfig).map(key => ({ name: ticketStatusConfig[key].name, value: ticketCounts[key] }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={3}>
                    {Object.keys(ticketStatusConfig).map(key => <Cell key={`cell-${key}`} fill={ticketStatusConfig[key].color} />)}
                </Pie>
                <Tooltip />
                <RechartsLegend iconType="circle" iconSize={8} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px'}} />
            </PieChart>
        </ResponsiveContainer>
    </WidgetContainer>
);

const GaugesSummary = () => (
     <WidgetContainer title="Taux par Statut">
         <div className="grid grid-cols-2 gap-y-2 gap-x-0">
            {Object.keys(ticketStatusConfig).map(key => (
                 <div key={key} className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={60}> 
                        <RadialBarChart cx="50%" cy="80%" innerRadius="90%" outerRadius="110%" barSize={6} data={[{ value: (ticketCounts[key] / ticketCounts.total) * 100 }]}>
                            <RadialBar background dataKey="value" fill={ticketStatusConfig[key].color} cornerRadius={3} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <p className="text-sm font-semibold -mt-8">{((ticketCounts[key] / ticketCounts.total) * 100).toFixed(0)}%</p>
                    <p className="text-xs text-slate-500">{ticketStatusConfig[key].name}</p>
                </div>
            ))}
        </div>
    </WidgetContainer>
);


// --- COMPOSANT PRINCIPAL DE LA PAGE ---
const TicketsPage = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 animate-in fade-in-0">
            
            {/* Colonne de Gauche */}
            <div className="lg:col-span-2 space-y-3">
                <VolumeByStatusChart />
                <InProgressTicketsChart />
            </div>
            
            {/* Colonne de Droite */}
            <div className="lg:col-span-1 space-y-3">
                <StatsSummary />
                <DonutChartSummary />
                <GaugesSummary />
            </div>

        </div>
    );
};

export default TicketsPage;