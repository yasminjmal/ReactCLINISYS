export const formatDateFromArray = (dateArray) => {
  // Sécurité : si la date n'est pas un tableau correct, on renvoie une chaîne vide.
  if (!Array.isArray(dateArray) || dateArray.length < 3) {
    return ''; 
  }

  // On décompose le tableau : [année, mois, jour, heure, minute, seconde]
  const [year, month, day, hours = 0, minutes = 0, seconds = 0] = dateArray;

  // On crée la date en soustrayant 1 au mois ! C'est l'étape la plus importante.
  const date = new Date(year, month - 1, day, hours, minutes, seconds);

  // Sécurité supplémentaire : si la date créée est invalide, on le signale.
  if (isNaN(date.getTime())) {
    return 'Date invalide';
  }

  // On formate la date pour l'affichage en France (ex: "1 octobre 2025")
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};