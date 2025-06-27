// src/pages/Admin/Dashboards/TicketsByStatusDonutChart.jsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
// import ticketService from '../../../services/ticketService'; // Assurez-vous que ce service existe

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#AF19FF']; // Couleurs pour les segments

const TicketsByStatusDonutChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketStats = async () => {
      try {
        setLoading(true);
        // REMPLACEZ CECI par votre véritable appel API pour les statistiques de tickets par statut
        // Exemple: const response = await ticketService.getTicketCountByStatus();
        // const rawData = response.data; // Assurez-vous que cela correspond à votre API

        // Simulation de données pour l'exemple:
        const simulatedData = {
            "OUVERT": 150,
            "EN_COURS": 75,
            "FERMÉ": 200,
            "REFUSÉ": 25,
            "EN_ATTENTE": 30
        };

        const formattedData = Object.keys(simulatedData).map((status, index) => ({
          name: status.replace('_', ' '), // Formate les noms de statut (ex: "EN_COURS" -> "EN COURS")
          value: simulatedData[status],
          fill: COLORS[index % COLORS.length] // Assigne une couleur cycliquement
        }));
        setData(formattedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des stats de tickets par statut:", err);
        setError("Impossible de charger les statistiques par statut.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketStats();
  }, []);

  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement des statistiques...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (data.length === 0) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Aucune donnée de ticket par statut disponible.</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Répartition des Tickets par Statut</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60} // Pour un graphique en beignet
            outerRadius={90}
            fill="#8884d8"
            paddingAngle={5} // Espace entre les segments
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} // Affiche nom et pourcentage
            animationDuration={500}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip /> {/* Affiche les détails au survol */}
          <Legend /> {/* Affiche la légende des couleurs */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketsByStatusDonutChart;