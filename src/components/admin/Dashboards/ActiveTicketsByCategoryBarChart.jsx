// src/pages/Admin/Dashboards/ActiveTicketsByCategoryBarChart.jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardService from '../../../services/dashboardService'; // Import du service

const ActiveTicketsByCategoryBarChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupBy, setGroupBy] = useState('employee'); // Nouvelle état pour le regroupement

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Appel à la nouvelle fonction du service avec le paramètre groupBy
        const rawData = await dashboardService.getActiveTicketsByCategory(groupBy);
        setData(rawData);
      } catch (err) {
        console.error("Erreur lors de la récupération des tickets actifs par catégorie:", err);
        setError("Impossible de charger les statistiques des tickets actifs.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [groupBy]); // Re-exécuter l'effet quand groupBy change

  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement des statistiques...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (data.length === 0) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Aucune donnée de tickets actifs disponible pour cette catégorie.</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          Tickets Actifs par {groupBy === 'employee' ? 'Employé' : 'Module'}
        </h3>
        {/* Sélecteur pour changer le regroupement */}
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="form-select text-sm p-2 rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
        >
          <option value="employee">Employé</option>
          <option value="module">Module</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 20, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis dataKey="category" /> {/* dataKey correspond à la clé 'category' */}
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="activeTickets" fill="#8884d8" name="Tickets Actifs" /> {/* dataKey et name mis à jour */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActiveTicketsByCategoryBarChart;