// src/pages/Admin/Dashboards/TicketsByStatusDonutChart.jsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import dashboardService from '../../../services/dashboardService';

const COLORS_MAP = {
    'En_attente': '#FFBB28', // Jaune
    'En_cours': '#00C49F',   // Cyan/Turquoise
    'Accepte': '#82CA9D',    // Vert clair
    'Termine': '#0088FE',    // Bleu
    'Refuse': '#FF8042',     // Orange
    // Assurez-vous que ces clés correspondent exactement aux noms de vos enums Status du backend
    // Ajoutez d'autres statuts si nécessaire
};

const TicketsByStatusDonutChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketStats = async () => {
      try {
        setLoading(true);
        // Appel à votre service pour récupérer les données réelles
        const rawData = await dashboardService.getTicketCountsByStatus(); // Attendu: { "En_attente": 10, ... }

        // Formater les données pour Recharts
        const formattedData = Object.keys(rawData).map((statusKey) => ({
          name: statusKey.replace('_', ' '), // Formate les noms (ex: "En_attente" -> "En attente")
          value: rawData[statusKey],
          fill: COLORS_MAP[statusKey] || '#CCCCCC' // Utilise la couleur du map, ou gris par défaut
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
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            animationDuration={500}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} tickets`, name]}/> {/* Amélioration du Tooltip */}
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketsByStatusDonutChart;