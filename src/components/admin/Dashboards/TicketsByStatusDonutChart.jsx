// src/pages/Admin/Dashboards/TicketsByStatusDonutChart.jsx
import React, { useState, useEffect } from 'react';
// Importez les éléments nécessaires de Chart.js
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import dashboardService from '../../../services/dashboardService';

// ENREGISTREZ LES COMPOSANTS NÉCESSAIRES DE CHART.JS
ChartJS.register(ArcElement, Tooltip, Legend);

const TicketsByStatusDonutChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getTicketCountsByStatus(); //

        const labels = data.map(item => item.status);
        const counts = data.map(item => item.count);
        // Définir des couleurs distinctes pour chaque statut
        const backgroundColors = [
          '#FF6384', // En Attente
          '#36A2EB', // En Cours
          '#FFCE56', // Résolu
          '#4BC0C0', // Fermé
          '#9966FF', // Annulé
          '#FF9F40', // En attente de client
          // Ajoutez d'autres couleurs si vous avez plus de statuts
        ];
        const borderColors = backgroundColors.map(color => color.replace('FF', 'CC')); // slightly darker border

        setChartData({
          labels: labels,
          datasets: [
            {
              data: counts,
              backgroundColor: backgroundColors.slice(0, labels.length), // Assurez-vous d'avoir assez de couleurs
              borderColor: borderColors.slice(0, labels.length),
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        console.error("Erreur lors de la récupération des stats de tickets par statut:", err);
        setError("Impossible de charger les statistiques de tickets par statut.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketStats();
  }, []);

  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement des statistiques de tickets...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (chartData.labels.length === 0) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Aucune donnée de tickets par statut disponible.</div>;


  // Options pour le graphique en beignet
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(148, 163, 184)', // Couleur du texte pour les légendes (slate-400)
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('fr-FR').format(context.parsed);
            }
            return label;
          }
        }
      }
    },
    // Ajout d'une clé unique pour aider React à gérer les mises à jour et éviter les conflits de canvas
    // Note: C'est plus utile si le composant est monté/démonté fréquemment ou si les données changent radicalement,
    // mais Chart.js gère déjà une bonne partie de la destruction/recréation.
    // Cependant, il n'est généralement pas nécessaire d'ajouter une 'key' sur le Doughnut component lui-même
    // pour ces erreurs spécifiques de 'canvas in use' ou 'element not registered'.
    // La principale solution est l'enregistrement des composants de Chart.js.
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Tickets par Statut</h3>
      <div style={{ height: '300px' }}> {/* Conteneur avec hauteur fixe */}
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TicketsByStatusDonutChart;