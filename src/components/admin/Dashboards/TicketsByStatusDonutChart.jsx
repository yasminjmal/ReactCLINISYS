// src/components/admin/Dashboards/TicketsByStatusDonutChart.jsx (Exemple adapté)
import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import DashboardService from '../../../services/dashboardService'; // Assurez-vous du bon chemin

const TicketsByStatusDonutChart = ({ period }) => { // Accepte la prop 'period'
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketStatusData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Utilisez la prop 'period' lors de l'appel au service
        const data = await DashboardService.getTicketsByStatus(period); 
        
        // Supposons que 'data' est un tableau d'objets { status: "Ouvert", count: 15 }
        const labels = data.map(item => item.status);
        const counts = data.map(item => item.count);
        const backgroundColors = [
          'rgba(255, 99, 132, 0.6)', // Rouge
          'rgba(54, 162, 235, 0.6)', // Bleu
          'rgba(255, 206, 86, 0.6)', // Jaune
          'rgba(75, 192, 192, 0.6)', // Vert
          'rgba(153, 102, 255, 0.6)',// Violet
        ];

        setChartData({
          labels: labels,
          datasets: [{
            data: counts,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
            borderWidth: 1,
          }],
        });
      } catch (err) {
        setError("Erreur lors du chargement des données des tickets par statut.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketStatusData();
  }, [period]); // Déclenchez l'effet lorsque 'period' change

  if (loading) return <div className="p-4">Chargement du graphique...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Tickets par Statut ({period === 'all' ? 'Toutes Périodes' : period})</h3>
      {chartData.labels && chartData.labels.length > 0 ? (
        <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      ) : (
        <p className="text-slate-500 dark:text-slate-400">Aucune donnée disponible pour cette période.</p>
      )}
    </div>
  );
};

export default TicketsByStatusDonutChart;