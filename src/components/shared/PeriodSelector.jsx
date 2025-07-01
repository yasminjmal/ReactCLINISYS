// src/components/shared/PeriodSelector.jsx
import React from 'react';

const PeriodSelector = ({ selectedPeriod, onSelectPeriod }) => {
  const periods = [
    { id: 'day', label: 'Jour' },
    { id: 'week', label: 'Semaine' },
    { id: 'month', label: 'Mois' },
    { id: 'year', label: 'Année' },
    { id: 'all', label: 'Tout' },
    // Vous pouvez ajouter 'custom' pour un sélecteur de dates
  ];

  return (
    <div className="flex space-x-2 p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm mb-4">
      {periods.map((period) => (
        <button
          key={period.id}
          onClick={() => onSelectPeriod(period.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${selectedPeriod === period.id
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
            }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector;