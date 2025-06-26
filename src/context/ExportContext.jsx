// src/context/ExportContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

// Crée le contexte
const ExportContext = createContext(null);

// Hook personnalisé pour utiliser le contexte
export const useExport = () => {
  const context = useContext(ExportContext);
  if (!context) {
    throw new Error('useExport must be used within an ExportProvider');
  }
  return context;
};

// Fournisseur de contexte
export const ExportProvider = ({ children }) => {
  const [currentExportPdfFunction, setCurrentExportPdfFunction] = useState(null);
  const [currentExportExcelFunction, setCurrentExportExcelFunction] = useState(null);
  const [currentPrintFunction, setCurrentPrintFunction] = useState(null);

  // Fonction pour définir les fonctions d'exportation de la page active
  const setExportFunctions = useCallback((pdfFunc, excelFunc, printFunc) => {
    setCurrentExportPdfFunction(() => pdfFunc); // Utiliser un callback pour stocker la fonction elle-même
    setCurrentExportExcelFunction(() => excelFunc);
    setCurrentPrintFunction(() => printFunc);
  }, []);

  // Valeur fournie par le contexte
  const value = {
    currentExportPdfFunction,
    currentExportExcelFunction,
    currentPrintFunction,
    setExportFunctions,
  };

  return (
    <ExportContext.Provider value={value}>
      {children}
    </ExportContext.Provider>
  );
};