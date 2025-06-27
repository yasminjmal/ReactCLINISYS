// src/utils/jspdfAutoTableHelper.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Assurez-vous d'importer directement le module jspdf-autotable

// Cette fonction va attacher autoTable à l'instance de jsPDF
// Normalement jspdf-autotable le fait automatiquement.
// Si cela ne se produit pas, cette fonction force l'attachement.
export const initializeJSPDFAutoTable = (doc) => {
    // Vérifie si autoTable n'est PAS déjà une fonction, ce qui signifie que le plugin n'a pas été attaché
    if (typeof doc.autoTable !== 'function') {
        // La façon la plus directe de faire fonctionner jspdf-autotable est souvent
        // de le laisser étendre le prototype global de jsPDF, ce que l'import
        // par effet de bord est censé faire.
        // Si cela ne se produit pas, nous devons simuler le comportement.

        // Dans les versions plus anciennes de jspdf-autotable, il y avait parfois un besoin
        // d'appeler `autoTable(jsPDF.API)`. Cependant, les versions récentes s'attachent.

        // Tentative de simuler l'attachement si l'import n'a pas eu son effet de bord
        // Cette partie est délicate car elle dépend de l'implémentation interne de jspdf-autotable.
        // Une approche "hacky" si rien d'autre ne marche est de forcer l'attachement au prototype
        // si le plugin n'a pas de fonction d'initialisation explicite.

        // La ligne `import 'jspdf-autotable';` dans `main.jsx` ou `exportPdf.jsx` est
        // supposée être suffisante. Si elle ne l'est pas, le bundler est coupable.

        // On va essayer d'appeler la fonction 'default' exportée par jspdf-autotable
        // si elle existe et si elle est conçue pour être appelée avec l'instance doc.
        // Le module 'jspdf-autotable' exporte une fonction par défaut qui est le point d'entrée du plugin.
        try {
            // C'est un hack si le plugin ne s'est pas attaché automatiquement
            // Il simule ce que le plugin fait quand il est chargé dans un environnement global
            if (autoTable.default) { // Vérifie si l'export par défaut est une fonction
                autoTable.default(doc); // Tente d'initialiser le plugin sur cette instance `doc`
            } else if (typeof autoTable === 'function') {
                autoTable(doc); // Alternative si c'est l'exportation par défaut
            }
            console.log("JSPDF-Autotable: Forcé l'attachement à l'instance jsPDF.");
        } catch (e) {
            console.error("JSPDF-Autotable: Échec de l'attachement forcé.", e);
        }
    }
};