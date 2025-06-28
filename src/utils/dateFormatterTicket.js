// src/utils/dateFormatter.js (ou le fichier contenant formatDateFromArray)

export const formatDateFromArray = (dateArray) => {
    if (!dateArray || dateArray.length < 3) {
        return 'N/A';
    }
    try {
        // Date array format: [year, month, day, hour, minute, second]
        // Month is 0-indexed in JavaScript Date object, so subtract 1
        const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3] || 0, dateArray[4] || 0, dateArray[5] || 0);

        // Options pour le format DD/MM/YYYY
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };

        return date.toLocaleDateString('fr-FR', options); // 'fr-FR' pour s'assurer du format JJ/MM/AAAA
    } catch (e) {
        console.error("Erreur de formatage de date:", e);
        return "Date invalide";
    }
};

// Si vous avez une fonction formatDate plus générique, vous pouvez la modifier aussi
export const formatDate = (dateInput) => {
    if (!dateInput) {
        return 'N/A';
    }
    let date;
    if (Array.isArray(dateInput) && dateInput.length >= 3) {
        const [year, month, day, hours = 0, minutes = 0, seconds = 0] = dateInput;
        date = new Date(year, month - 1, day, hours, minutes, seconds);
    } else if (typeof dateInput === 'string' || typeof dateInput === 'number' || dateInput instanceof Date) {
        date = new Date(dateInput);
    } else {
        return "Date invalide";
    }

    if (isNaN(date.getTime())) {
        return 'Date invalide';
    }

    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    return date.toLocaleDateString('fr-FR', options);
};