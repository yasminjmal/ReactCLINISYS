// src/pages/Admin/Dashboards/SubscriptionsHourlyBarChart.jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardService from '../../../services/dashboardService';

const SubscriptionsHourlyBarChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHourlyStats = async () => {
      try {
        setLoading(true);
        const rawData = await dashboardService.getSubscriptionsHourlyStats();
        setData(rawData);
      } catch (err) {
        console.error("Erreur lors de la récupération des stats horaires:", err);
        setError("Impossible de charger les statistiques horaires.");
      } finally {
        setLoading(false);
      }
    };

    fetchHourlyStats();
  }, []);

  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement des statistiques...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (data.length === 0) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Aucune donnée horaire disponible.</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Souscriptions Horaires</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 20, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="newClients" fill="#4CAF50" name="Nouveaux Clients" /> {/* 'newClients' pour l'API suggérée */}
          {/* <Bar dataKey="totalClients" fill="#9E9E9E" name="Total Clients" /> */} {/* Optionnel si vous voulez afficher */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubscriptionsHourlyBarChart;