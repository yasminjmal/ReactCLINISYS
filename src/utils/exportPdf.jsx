// src/utils/exportPdf.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * Exporte des données de tableau dans un fichier PDF.
 * @param {string} title Le titre du document PDF.
 * @param {Array<Array<string>>} headers Les en-têtes du tableau (ex: [['ID', 'Nom']]).
 * @param {Array<Array<string | number>>} data Les données du tableau.
 * @param {string} filename Le nom du fichier de sortie (ex: 'rapport.pdf').
 */
export const exportToPdf = (title, headers, data, filename = 'document.pdf') => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 22);

  doc.autoTable({
    head: headers,
    body: data,
    startY: 30,
    theme: 'striped',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    didDrawPage: function(data) {
      let str = 'Page ' + doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
    }
  });

  doc.save(filename);
  console.log(`Données exportées en PDF: ${filename}`);
};

/**
 * Exporte un élément HTML (identifié par son ID) dans un fichier PDF.
 * Nécessite 'html2canvas' installé.
 * @param {string} elementId L'ID de l'élément HTML à exporter.
 * @param {string} filename Le nom du fichier de sortie (ex: 'page.pdf').
 * @param {string} title Le titre interne du document PDF.
 */
export const exportHtmlElementToPdf = async (elementId, filename = 'page.pdf', title = 'Document') => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with ID '${elementId}' not found for PDF export.`);
    return;
  }

  try {
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(filename);
    console.log(`Element ID '${elementId}' exporté en PDF: ${filename}`);

  } catch (error) {
    console.error("Erreur lors de l'exportation HTML vers PDF:", error);
  }
};