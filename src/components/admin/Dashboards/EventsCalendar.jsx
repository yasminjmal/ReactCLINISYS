// src/pages/Admin/Dashboards/EventsCalendar.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import dashboardService from '../../../services/dashboardService';

const EventsCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const rawEvents = await dashboardService.getCalendarEvents();

        // Le backend renvoie déjà les dates au format ISO string, donc pas de conversion ici.
        // On s'assure juste des valeurs par défaut pour les champs optionnels.
        const formattedEvents = rawEvents.map(event => ({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          allDay: event.allDay || false,
          color: event.color || '#ADD8E6',
          extendedProps: event.extendedProps || {}, // Assurez-vous de récupérer les extendedProps
        }));

        setEvents(formattedEvents);
      } catch (err) {
        console.error("Erreur lors de la récupération des événements du calendrier:", err);
        setError("Impossible de charger les événements du calendrier.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Amélioration de la gestion des clics sur les événements
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const extendedProps = event.extendedProps;

    let details = `Titre: ${event.title}\n`;
    details += `Début: ${event.start.toLocaleString()}\n`;
    if (event.end) {
      details += `Fin: ${event.end.toLocaleString()}\n`;
    }
    if (extendedProps.ticketStatus) {
      details += `Statut Ticket: ${extendedProps.ticketStatus}\n`;
    }
    if (extendedProps.ticketPriority) {
      details += `Priorité Ticket: ${extendedProps.ticketPriority}\n`;
    }
    if (extendedProps.assignedTo) {
      details += `Affecté à: ${extendedProps.assignedTo}\n`;
    }

    alert(`Détails de l'événement:\n\n${details}\n\nVoulez-vous vraiment supprimer cet événement?`);

    if (confirm("Voulez-vous vraiment supprimer l'événement ? (Cette action est une simulation) ")) {
        clickInfo.event.remove(); // Supprime visuellement
        // TODO: Appeler votre service pour supprimer l'événement du backend
        // dashboardService.deleteCalendarEvent(event.id); // Si vous avez un tel endpoint pour les événements
    }
  };

  // Gérer le dépôt d'événement après un glisser-déposer
  const handleEventDrop = (dropInfo) => {
    console.log('Event dropped:', dropInfo.event.title, 'new start:', dropInfo.event.start, 'new end:', dropInfo.event.end);
    // TODO: Appeler votre service pour mettre à jour la date/heure de l'événement dans le backend
    // dashboardService.updateCalendarEvent(dropInfo.event.id, { start: dropInfo.event.start.toISOString(), end: dropInfo.event.end ? dropInfo.event.end.toISOString() : null });
  };

  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement du calendrier...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Calendrier des Échéances et Événements</h3>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        editable={true} // Permet le drag-n-drop et le redimensionnement d'événements
        selectable={true} // Permet la sélection de dates (pour potentiellement créer de nouveaux événements)
        weekends={true}
        events={events}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        // Pour les détails des options FullCalendar: https://fullcalendar.io/docs
        locale="fr" // Affiche le calendrier en français
        buttonText={{
          today: 'Aujourd\'hui',
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour',
          listWeek: 'Liste Semaine'
        }}
      />
    </div>
  );
};

export default EventsCalendar;