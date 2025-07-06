// src/components/admin/Dashboards/EventsCalendar.jsx
// Note: FullCalendar's internal layout is robust. We mainly adjust its container padding.
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

        const formattedEvents = rawEvents.map(event => ({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          allDay: event.allDay || false,
          color: event.color || '#ADD8E6',
          extendedProps: event.extendedProps || {},
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
        clickInfo.event.remove();
        // TODO: Call your service to delete the event from the backend
    }
  };

  const handleEventDrop = (dropInfo) => {
    console.log('Event dropped:', dropInfo.event.title, 'new start:', dropInfo.event.start, 'new end:', dropInfo.event.end);
    // TODO: Call your service to update the event date/time in the backend
  };

  if (loading) return <div className="text-center py-3 text-slate-600 dark:text-slate-400 text-sm">Chargement du calendrier...</div>;
  if (error) return <div className="text-center py-3 text-red-500 text-sm">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md"> {/* Reduced padding */}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Calendrier des Échéances et Événements</h3> {/* Smaller title */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        editable={true}
        selectable={true}
        weekends={true}
        events={events}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        locale="fr"
        buttonText={{
          today: 'Aujourd\'hui',
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour',
          listWeek: 'Liste Semaine'
        }}
        height="auto" // Allows the calendar to adjust height based on content/container
        contentHeight="auto" // Ensures content also adapts
        // No specific changes to FullCalendar options here for "minimizing" beyond container size,
        // as its internal design is mostly fixed.
      />
    </div>
  );
};

export default EventsCalendar;