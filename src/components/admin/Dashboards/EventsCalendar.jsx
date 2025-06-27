// src/pages/Admin/Dashboards/EventsCalendar.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction'; // pour les interactions (clic, drag-n-drop)

// import eventService from '../../../services/eventService'; // Service pour récupérer les événements

const EventsCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // REMPLACEZ CECI par votre véritable appel API pour les événements
        // Exemple: const response = await eventService.getCalendarEvents();
        // const rawEvents = response.data;

        // Simulation de données pour l'exemple (événements de tickets, réunions):
        const simulatedEvents = [
          { id: '1', title: 'All Day Event', start: '2025-06-01', allDay: true, color: '#FFD700' },
          { id: '2', title: 'Surgery on', start: '2025-06-03', end: '2025-06-03', color: '#8A2BE2' },
          { id: '3', title: 'NextGen Expo 2019 - Prodi', start: '2025-06-04', end: '2025-06-04', color: '#00BFFF' },
          { id: '4', title: '4:00pm Repeating E', start: '2025-06-09T16:00:00', end: '2025-06-09T17:00:00', color: '#FF1493' },
          { id: '5', title: 'Dinner', start: '2025-06-12T19:00:00', end: '2025-06-12T20:00:00', color: '#8A2BE2' },
          { id: '6', title: '1:30pm Reporting', start: '2025-06-14T13:30:00', end: '2025-06-14T14:30:00', color: '#5F9EA0' },
          { id: '7', title: '4:00pm Repeating E', start: '2025-06-16T16:00:00', end: '2025-06-16T17:00:00', color: '#FF1493' },
          { id: '8', title: '+1 more', start: '2025-06-25', end: '2025-06-25', color: '#ADD8E6' },
          { id: '9', title: '+6 more', start: '2025-06-26', end: '2025-06-26', color: '#ADD8E6' },
          { id: '10', title: '7:00am Birthday Pa', start: '2025-06-27T07:00:00', end: '2025-06-27T08:00:00', color: '#8A2BE2' },
          { id: '11', title: 'Gotbootstra', start: '2025-06-28T09:00:00', end: '2025-06-28T10:00:00', color: '#00BFFF' },
        ];

        setEvents(simulatedEvents);
      } catch (err) {
        console.error("Erreur lors de la récupération des événements du calendrier:", err);
        setError("Impossible de charger les événements du calendrier.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Gérer les clics sur les événements (si interactionPlugin est activé)
  const handleEventClick = (clickInfo) => {
    if (confirm(`Voulez-vous vraiment supprimer l'événement '${clickInfo.event.title}'?`)) {
      clickInfo.event.remove(); // Supprime l'événement du calendrier visuellement
      // Logique API: appeler ton service pour supprimer l'événement du backend
      // eventService.deleteEvent(clickInfo.event.id);
    }
  };

  // Gérer le dépôt d'événement après un glisser-déposer (si interactionPlugin est activé)
  const handleEventDrop = (dropInfo) => {
    console.log('Event dropped:', dropInfo.event.title, 'new start:', dropInfo.event.start);
    // Logique API: appeler ton service pour mettre à jour la date/heure de l'événement dans le backend
    // eventService.updateEvent(dropInfo.event.id, { start: dropInfo.event.start, end: dropInfo.event.end });
  };

  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement du calendrier...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Calendrier des Événements</h3>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth" // Vue initiale : mois
        headerToolbar={{ // Configuration de l'en-tête du calendrier
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' // Vues disponibles
        }}
        editable={true} // Permet le drag-n-drop et le redimensionnement d'événements
        selectable={true} // Permet la sélection de dates
        weekends={true} // Affiche les week-ends
        events={events} // Tes données d'événements
        eventClick={handleEventClick} // Gère le clic sur un événement
        eventDrop={handleEventDrop} // Gère le glisser-déposer d'un événement
        // Vous pouvez ajouter d'autres callbacks comme select pour créer de nouveaux événements
      />
    </div>
  );
};

export default EventsCalendar;