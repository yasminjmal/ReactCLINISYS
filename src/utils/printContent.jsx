// src/utils/printContent.js

/**
 * Ouvre une nouvelle fenêtre avec le contenu HTML spécifié et lance l'impression.
 * @param {string} contentHtml Le contenu HTML à imprimer.
 * @param {string} title Le titre de la fenêtre d'impression.
 */
export const printHtmlContent = (contentHtml, title = 'Imprimer') => {
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<style>');
  printWindow.document.write(`
    body { font-family: Arial, sans-serif; margin: 20mm; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    @media print {
      body { -webkit-print-color-adjust: exact; }
    }
  `);
  printWindow.document.write('</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(contentHtml);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

/**
 * Imprime directement le contenu d'un élément HTML existant sur la page par son ID.
 * Cette méthode manipule le DOM temporairement, utilisez avec prudence.
 * Pour React, 'react-to-print' est souvent une meilleure solution.
 * @param {string} elementId L'ID de l'élément HTML à imprimer.
 */
export const printElementById = (elementId) => {
  const elementToPrint = document.getElementById(elementId);
  if (!elementToPrint) {
    console.error(`Element with ID '${elementId}' not found for printing.`);
    return;
  }

  const printContent = elementToPrint.innerHTML;
  const originalBody = document.body.innerHTML;
  
  // Masque tout le contenu sauf l'élément à imprimer
  document.body.innerHTML = printContent;
  
  window.print();
  
  // Restaure le contenu original du corps après l'impression (peut nécessiter un léger délai)
  // Une solution plus robuste serait d'utiliser une iframe ou 'react-to-print'
  document.body.innerHTML = originalBody;
  console.log(`Element ID '${elementId}' envoyé à l'impression.`);
};