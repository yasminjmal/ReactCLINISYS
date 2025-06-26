// Dans votre fichier d'utilitaires
export const formatDateFromArray = (dateInput) => {
  // Sécurité : si la date est nulle ou non définie, on renvoie 'N/A'.
  if (!dateInput) {
    return 'N/A';
  }

  let date;

  // --- AJOUT : Détection du format ---
  // On vérifie d'abord si c'est un tableau, comme vous le faisiez déjà.
  if (Array.isArray(dateInput) && dateInput.length >= 3) {
    const [year, month, day, hours = 0, minutes = 0, seconds = 0] = dateInput;
    // On crée la date en soustrayant 1 au mois.
    date = new Date(year, month - 1, day, hours, minutes, seconds);
  } 
  // SINON, on essaie de la traiter comme une chaîne de caractères ou un nombre.
  else {
    date = new Date(dateInput);
  }
  // --- FIN DE L'AJOUT ---


  // Sécurité supplémentaire : si la date créée est invalide, on le signale.
  if (isNaN(date.getTime())) {
    return 'Date invalide';
  }

  // On formate la date pour l'affichage en France (ex: "26 juin 2025")
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};