// src/components/admin/Dashboards/nav/TicketsPage.jsx

import React, { useState } from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend as RechartsLegend, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    RadialBarChart, 
    RadialBar 
} from 'recharts';
import { MoreVertical, Filter, Calendar, Download, Printer } from 'lucide-react';

// =================================================================================
// --- DONNÉES STATIQUES (à remplacer plus tard par vos appels API) ---
// =================================================================================

// Configuration des statuts et de leurs couleurs pour tout le tableau de bord
const ticketStatusConfig = {
  nouveau: { name: 'Nouveau', color: '#3b82f6' },        // Bleu
  en_attente: { name: 'En Attente', color: '#f97316' },  // Orange
  en_cours: { name: 'En Cours', color: '#eab308' },      // Jaune
  resolu: { name: 'Résolu', color: '#22c55e' },          // Vert
};

// Données pour les indicateurs de la colonne de droite
const ticketCounts = {
  nouveau: 12,
  en_attente: 8,
  en_cours: 31,
  resolu: 157,
  get total() { return this.nouveau + this.en_attente + this.en_cours + this.resolu; }
};

// Données pour le graphique à barres "Volume des Tickets"
const barChartDataByTime = {
    day: [ { name: 'Aujourd\'hui', nouveau: 2, en_cours: 5, resolu: 8, en_attente: 1 } ],
    week: [
        { name: 'Lun', nouveau: 2, en_cours: 5, resolu: 8, en_attente: 1 },
        { name: 'Mar', nouveau: 1, en_cours: 7, resolu: 6, en_attente: 3 },
        { name: 'Mer', nouveau: 3, en_cours: 4, resolu: 10, en_attente: 2 },
        { name: 'Jeu', nouveau: 2, en_cours: 6, resolu: 9, en_attente: 1 },
        { name: 'Ven', nouveau: 4, en_cours: 5, resolu: 12, en_attente: 1 },
    ],
    month: [
        { name: 'Sem 1', nouveau: 10, en_cours: 25, resolu: 40, en_attente: 5 },
        { name: 'Sem 2', nouveau: 12, en_cours: 30, resolu: 35, en_attente: 8 },
        { name: 'Sem 3', nouveau: 8, en_cours: 28, resolu: 45, en_attente: 6 },
        { name: 'Sem 4', nouveau: 15, en_cours: 35, resolu: 50, en_attente: 10 },
    ],
    year: [
        { name: 'Jan', nouveau: 50, en_cours: 120, resolu: 200, en_attente: 30 },
        { name: 'Fev', nouveau: 60, en_cours: 130, resolu: 210, en_attente: 35 },
        { name: 'Mar', nouveau: 55, en_cours: 125, resolu: 220, en_attente: 28 },
    ]
};

// Données pour le graphique "Suivi des Tickets En Cours"
const inProgressTicketsData = [
  { id: '#T-123', affectation: new Date('2025-07-01'), echeance: new Date('2025-07-10') },
  { id: '#T-124', affectation: new Date('2025-06-25'), echeance: new Date('2025-07-05') },
  { id: '#T-125', affectation: new Date('2025-07-02'), echeance: new Date('2025-07-15') },
  { id: '#T-126', affectation: new Date('2025-07-03'), echeance: new Date('2025-07-08') },
];

// Fonction utilitaire pour calculer la différence en jours
const daysBetween = (date1, date2) => Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));


// =================================================================================
// --- SOUS-COMPOSANTS RÉUTILISABLES (WIDGETS) ---
// =================================================================================

/**
 * Conteneur de base pour chaque widget, avec un titre et des actions
 */
const WidgetContainer = ({ title, children, actionButtons = true }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md w-full h-full flex flex-col">
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


// --- Widgets de la Colonne de Gauche (Graphiques principaux) ---

/**
 * Graphique en colonnes empilées montrant le volume de tickets par statut sur une période
 */
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
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartDataByTime[timeFilter]} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="name" stroke="rgb(100 116 139)" fontSize={12} />
                    <YAxis stroke="rgb(100 116 139)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem' }}/>
                    <RechartsLegend iconType="circle" iconSize={8} />
                    {Object.keys(ticketStatusConfig).map(statusKey => (
                         <Bar 
                            key={statusKey} 
                            dataKey={statusKey} 
                            stackId="a" 
                            name={ticketStatusConfig[statusKey].name} 
                            fill={ticketStatusConfig[statusKey].color} 
                         />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </WidgetContainer>
    );
};

/**
 * Graphique en barres horizontales simulant un Gantt pour les tickets en cours
 */
const InProgressTicketsChart = () => {
    const ganttData = inProgressTicketsData.map(ticket => {
        const joursEcoules = daysBetween(ticket.affectation, new Date());
        const joursTotaux = daysBetween(ticket.affectation, ticket.echeance);
        const joursRestants = Math.max(0, joursTotaux - joursEcoules);
        return { name: ticket.id, data: [joursEcoules, joursRestants] };
    });

    return (
        <WidgetContainer title="Suivi des Tickets 'En Cours'">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ganttData} layout="vertical" barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis type="number" stroke="rgb(100 116 139)" label={{ value: 'Jours', position: 'insideBottom', offset: -5 }} fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="rgb(100 116 139)" width={80} fontSize={12} />
                    <Tooltip formatter={(value, name) => `${value} jours`} />
                    <RechartsLegend payload={[
                        { value: 'Temps Écoulé', type: 'rect', color: ticketStatusConfig.en_cours.color },
                        { value: 'Temps Restant', type: 'rect', color: '#e2e8f0' }
                    ]}/>
                    <Bar dataKey="data[0]" stackId="a" name="Temps Écoulé" fill={ticketStatusConfig.en_cours.color} />
                    <Bar dataKey="data[1]" stackId="a" name="Temps Restant" fill="#e2e8f0" />
                </BarChart>
            </ResponsiveContainer>
        </WidgetContainer>
    );
};


// --- Widgets de la Colonne de Droite (Indicateurs) ---

/**
 * Bloc affichant les totaux de tickets par statut
 */
const StatsSummary = () => (
    <WidgetContainer title="Tickets par Statut" actionButtons={false}>
        <div className="space-y-3">
            {Object.keys(ticketStatusConfig).map(key => (
                <div key={key} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ticketStatusConfig[key].color }}></span>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{ticketStatusConfig[key].name}</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{ticketCounts[key]}</span>
                </div>
            ))}
            <div className="border-t dark:border-slate-700 my-2 pt-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Total</span>
                    <span className="font-bold text-lg text-sky-500">{ticketCounts.total}</span>
                </div>
            </div>
        </div>
    </WidgetContainer>
);

/**
 * Graphique en Donut montrant la répartition globale
 */
const DonutChartSummary = () => (
    <WidgetContainer title="Répartition Globale">
        <ResponsiveContainer width="100%" height={150}>
            <PieChart>
                <Pie 
                    data={Object.keys(ticketStatusConfig).map(key => ({ name: ticketStatusConfig[key].name, value: ticketCounts[key] }))} 
                    dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={2}
                >
                    {Object.keys(ticketStatusConfig).map(key => <Cell key={`cell-${key}`} fill={ticketStatusConfig[key].color} />)}
                </Pie>
                <Tooltip />
                <RechartsLegend iconType="circle" iconSize={8} layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
        </ResponsiveContainer>
    </WidgetContainer>
);

/**
 * Jauges radiales pour le pourcentage de chaque statut
 */
const GaugesSummary = () => (
     <WidgetContainer title="Taux par Statut">
         <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {Object.keys(ticketStatusConfig).map(key => (
                 <div key={key} className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={70}>
                        <RadialBarChart cx="50%" cy="70%" innerRadius="80%" outerRadius="100%" barSize={7} data={[{ value: (ticketCounts[key] / ticketCounts.total) * 100 }]}>
                            <RadialBar background dataKey="value" fill={ticketStatusConfig[key].color} cornerRadius={4} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <p className="text-sm font-semibold -mt-6">{((ticketCounts[key] / ticketCounts.total) * 100).toFixed(0)}%</p>
                    <p className="text-xs text-slate-500">{ticketStatusConfig[key].name}</p>
                </div>
            ))}
        </div>
    </WidgetContainer>
);


// =================================================================================
// --- COMPOSANT PRINCIPAL DE LA PAGE (`TicketsPage`) ---
// =================================================================================

const TicketsPage = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-0">
            
            {/* Colonne de Gauche (plus large) avec les graphiques principaux */}
            <div className="lg:col-span-2 space-y-6">
                <VolumeByStatusChart />
                <InProgressTicketsChart />
            </div>
            
            {/* Colonne de Droite (plus étroite) avec les indicateurs et jauges */}
            <div className="lg:col-span-1 space-y-6">
                <StatsSummary />
                <DonutChartSummary />
                <GaugesSummary />
            </div>

        </div>
    );
};

export default TicketsPage;