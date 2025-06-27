// src/pages/Admin/Dashboards/LiveFeedsAreaChart.jsx
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dashboardService from '../../../services/dashboardService';

const LiveFeedsAreaChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        const rawData = await dashboardService.getLiveMetrics();
        setData(rawData); // rawData est déjà dans le bon format [{hour: "HH:00", count: X}]
      } catch (err) {
        console.error("Erreur lors de la récupération des données de flux:", err);
        setError("Impossible de charger les données de flux en direct.");
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 15000); // Rafraîchir toutes les 15 secondes
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement des flux...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (data.length === 0) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Aucune donnée de flux en direct disponible.</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Activité des Flux</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{
            top: 10, right: 30, left: 0, bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis dataKey="hour" /> {/* dataKey correspond à la clé 'hour' dans les données */}
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} /> {/* dataKey correspond à la clé 'count' */}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LiveFeedsAreaChart;