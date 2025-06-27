// src/pages/Admin/Dashboards/TeamPerformanceChart.jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardService from '../../../services/dashboardService';

const TeamPerformanceChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupBy, setGroupBy] = useState('employee'); // 'employee' ou 'team'
  const [period, setPeriod] = useState('current_month'); // 'current_month', 'last_7_days'

  const periods = [
    { value: 'current_month', label: 'Mois Actuel' },
    { value: 'last_7_days', label: '7 Derniers Jours' },
    // Ajoutez d'autres périodes si votre backend les supporte (ex: 'last_30_days', 'current_year')
  ];

  useEffect(() => {
    const fetchPerformanceStats = async () => {
      try {
        setLoading(true);
        const rawData = await dashboardService.getPerformanceStats(groupBy, period);
        setData(rawData);
      } catch (err) {
        console.error("Erreur lors de la récupération des stats de performance:", err);
        setError("Impossible de charger les statistiques de performance.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceStats();
  }, [groupBy, period]); // Re-fetch quand groupBy ou period changent

  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement des statistiques de performance...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (data.length === 0) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Aucune donnée de performance disponible pour cette période ou catégorie.</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          Tickets Terminés par {groupBy === 'employee' ? 'Employé' : 'Équipe'}
        </h3>
        <div className="flex items-center space-x-2">
          {/* Sélecteur pour changer le regroupement (Employé/Équipe) */}
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="form-select text-sm p-2 rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            <option value="employee">Employé</option>
            <option value="team">Équipe</option>
          </select>
          {/* Sélecteur pour la période */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="form-select text-sm p-2 rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            {periods.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 20, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completedTickets" fill="#4CAF50" name="Tickets Terminés" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TeamPerformanceChart;