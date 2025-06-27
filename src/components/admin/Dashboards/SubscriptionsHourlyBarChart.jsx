// src/pages/Admin/Dashboards/SubscriptionsHourlyBarChart.jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import analyticsService from '../../../services/analyticsService'; // Service pour les données analytiques

const SubscriptionsHourlyBarChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHourlyStats = async () => {
      try {
        setLoading(true);
        // REMPLACEZ CECI par votre véritable appel API pour les statistiques horaires
        // Exemple: const response = await analyticsService.getHourlySubscriptions();
        // const rawData = response.data;

        // Simulation de données pour l'exemple (comme sur la capture):
        const simulatedData = [
          { hour: '5am', 'Souscriptions': 100, 'Vues': 50 },
          { hour: '6am', 'Souscriptions': 500, 'Vues': 300 },
          { hour: '7am', 'Souscriptions': 1500, 'Vues': 1000 },
          { hour: '8am', 'Souscriptions': 5000, 'Vues': 2000 },
          { hour: '9am', 'Souscriptions': 20000, 'Vues': 25000 },
          { hour: '10am', 'Souscriptions': 30000, 'Vues': 27000 },
          { hour: '11am', 'Souscriptions': 25000, 'Vues': 25000 },
          { hour: '12nn', 'Souscriptions': 27000, 'Vues': 24000 },
          { hour: '1pm', 'Souscriptions': 5000, 'Vues': 30000 },
          { hour: '2pm', 'Souscriptions': 20000, 'Vues': 20000 },
          { hour: '3pm', 'Souscriptions': 25000, 'Vues': 20000 },
          { hour: '4pm', 'Souscriptions': 10000, 'Vues': 5000 },
          { hour: '5pm', 'Souscriptions': 5000, 'Vues': 1000 },
        ];
        setData(simulatedData);
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
          <Bar dataKey="Souscriptions" fill="#4CAF50" /> {/* Vert */}
          <Bar dataKey="Vues" fill="#9E9E9E" /> {/* Gris */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubscriptionsHourlyBarChart;