// src/utils/exportExcel.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exporte des données dans un fichier Excel (.xlsx) au format objet JSON.
 * @param {Array<Object>} data Les données à exporter (tableau d'objets où chaque objet est une ligne).
 * @param {string} filename Le nom du fichier de sortie (ex: 'donnees.xlsx').
 * @param {string} sheetName Le nom de la feuille de calcul dans le fichier Excel (par défaut 'Feuille1').
 */
export const exportToExcel = (data, filename = 'document.xlsx', sheetName = 'Feuille1') => {
  if (!data || data.length === 0) {
    console.warn("Aucune donnée à exporter vers Excel.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = { Sheets: { [sheetName]: worksheet }, SheetNames: [sheetName] };
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(dataBlob, filename);
  console.log(`Données exportées en Excel: ${filename}`);
};

/**
 * Exporte des données de tableau (avec en-têtes séparées) dans un fichier Excel (.xlsx).
 * @param {Array<Array<string>>} headers Les en-têtes du tableau (ex: [['ID', 'Nom']]).
 * @param {Array<Array<string | number>>} data Les données du tableau.
 * @param {string} filename Le nom du fichier de sortie (ex: 'donnees.xlsx').
 * @param {string} sheetName Le nom de la feuille de calcul dans le fichier Excel (par défaut 'Feuille1').
 */
export const exportTableToExcel = (headers, data, filename = 'document.xlsx', sheetName = 'Feuille1') => {
  if (!data || data.length === 0) {
    console.warn("Aucune donnée à exporter vers Excel.");
    return;
  }

  const ws_data = [headers[0], ...data];
  const worksheet = XLSX.utils.aoa_to_sheet(ws_data);
  const workbook = { Sheets: { [sheetName]: worksheet }, SheetNames: [sheetName] };
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(dataBlob, filename);
  console.log(`Tableau exporté en Excel: ${filename}`);
};