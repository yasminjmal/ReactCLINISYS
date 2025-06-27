// src/utils/printContent.jsx

export const printHtmlContent = (contentHtml, title = 'Imprimer') => {
  const printWindow = window.open('', '_blank', 'height=600,width=800'); // Utiliser '_blank'
  if (!printWindow) {
    alert("Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les pop-ups.");
    return;
  }
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<style>');
  printWindow.document.write(`
    body { font-family: Arial, sans-serif; margin: 20mm; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    @media print {
      body { -webkit-print-color-adjust: exact; } /* Pour Chrome/Safari */
      @page { size: A4 portrait; margin: 10mm; } /* Options de page pour l'impression */
    }
  `);
  printWindow.document.write('</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(contentHtml);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.focus();
  
  // AJOUTER UN DÉLAI AVANT D'APPLIQUER print()
  setTimeout(() => {
    printWindow.print();
    // printWindow.close(); // Décommentez si vous voulez que la fenêtre se ferme automatiquement après l'impression
  }, 250); // Un petit délai de 250ms pour laisser le navigateur rendre le contenu
};

export const printElementById = (elementId) => {
  const elementToPrint = document.getElementById(elementId);
  if (!elementToPrint) {
    console.error(`Element with ID '${elementId}' not found for printing.`);
    return;
  }

  console.warn("Utiliser printElementById peut causer des problèmes de rendu. Préférez printHtmlContent ou react-to-print.");
  
  const printContent = elementToPrint.innerHTML;
  const originalBody = document.body.innerHTML;
  
  document.body.innerHTML = printContent;
  
  setTimeout(() => {
    window.print();
    document.body.innerHTML = originalBody;
  }, 100); 
};