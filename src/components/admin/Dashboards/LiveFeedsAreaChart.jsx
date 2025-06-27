// src/pages/Admin/Dashboards/LiveFeedsAreaChart.jsx
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import monitoringService from '../../../services/monitoringService'; // Service pour le monitoring

const LiveFeedsAreaChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        // REMPLACEZ CECI par votre véritable appel API pour les données de flux en direct
        // Exemple: const response = await monitoringService.getLiveMetrics();
        // const rawData = response.data;

        // Simulation de données pour l'exemple:
        const simulatedData = Array.from({ length: 180 }, (_, i) => ({
          index: i,
          value: Math.floor(Math.random() * 60) + 20, // Valeurs entre 20 et 80
        }));

        setData(simulatedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des données de flux:", err);
        setError("Impossible de charger les données de flux en direct.");
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();
    // Tu peux aussi mettre un setInterval pour rafraîchir les données régulièrement
    // const interval = setInterval(fetchLiveData, 5000); // Rafraîchir toutes les 5 secondes
    // return () => clearInterval(interval); // Nettoyer l'intervalle au démontage
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
          <XAxis dataKey="index" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LiveFeedsAreaChart;