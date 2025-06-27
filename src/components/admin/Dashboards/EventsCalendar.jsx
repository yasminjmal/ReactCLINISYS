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

        // FullCalendar attend des objets d'événements. Si votre API renvoie des LocalDateTime [y,m,d,h,min,s]
        // pour start/end, la conversion en string ISO est nécessaire.
        const formattedEvents = rawEvents.map(event => ({
          id: event.id,
          title: event.title,
          // Convertir le tableau LocalDateTime en chaîne ISO pour 'start' et 'end'
          start: Array.isArray(event.start) ? new Date(event.start[0], event.start[1] - 1, event.start[2], event.start[3] || 0, event.start[4] || 0, event.start[5] || 0).toISOString() : event.start,
          end: Array.isArray(event.end) ? new Date(event.end[0], event.end[1] - 1, event.end[2], event.end[3] || 0, event.end[4] || 0, event.end[5] || 0).toISOString() : event.end,
          allDay: event.allDay || false,
          color: event.color || '#ADD8E6', // Couleur par défaut si non fournie
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
    if (confirm(`Voulez-vous vraiment supprimer l'événement '${clickInfo.event.title}'?`)) {
      clickInfo.event.remove();
      // TODO: Appeler votre service pour supprimer l'événement du backend
      // dashboardService.deleteCalendarEvent(clickInfo.event.id); // Vous devrez créer cette fonction dans dashboardService
    }
  };

  const handleEventDrop = (dropInfo) => {
    console.log('Event dropped:', dropInfo.event.title, 'new start:', dropInfo.event.start);
    // TODO: Appeler votre service pour mettre à jour la date/heure de l'événement dans le backend
    // dashboardService.updateCalendarEvent(dropInfo.event.id, { start: dropInfo.event.start, end: dropInfo.event.end }); // Vous devrez créer cette fonction dans dashboardService
  };

  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement du calendrier...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Calendrier des Événements</h3>
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
      />
    </div>
  );
};

export default EventsCalendar;