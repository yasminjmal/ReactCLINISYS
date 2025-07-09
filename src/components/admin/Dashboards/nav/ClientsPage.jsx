// src/components/admin/Dashboards/nav/ClientsPage.jsx

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

import dashboardService from '../../../../services/dashboardService';
import clientService from '../../../../services/clientService';
import { WidgetContainer, LoadingIndicator } from './TicketsPage';

// Le CSS de Leaflet est toujours nécessaire pour sa structure de base
import 'leaflet/dist/leaflet.css';

// --- NOUVEAU : Définition du marqueur animé avec du HTML et des classes Tailwind ---
// Cette icône utilise la classe 'animate-ping' de Tailwind pour créer l'effet de pulsation.
const pulsingIcon = L.divIcon({
  html: `
    <span class="relative flex h-3 w-3">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-3 w-3 bg-sky-500 border-2 border-white"></span>
    </span>
  `,
  className: 'bg-transparent border-0', // On s'assure que Leaflet n'ajoute pas de style par défaut
  iconSize: [12, 12],
});


// --- NOUVEAU : Liste des pays pour le filtre ---
// Vous pouvez enrichir cette liste avec les pays de vos clients.
const countryFilters = [
    { name: 'Monde entier', code: 'all', coords: [30, 0], zoom: 2 },
    { name: 'Tunisie', code: 'Tunisie', coords: [34.74, 10.76], zoom: 6.5 },
    { name: 'France', code: 'France', coords: [46.60, 2.21], zoom: 5.5 },
    { name: 'Maroc', code: 'Maroc', coords: [31.79, -7.09], zoom: 6 },
    // Ajoutez d'autres pays ici. Assurez-vous que la propriété 'code'
    // correspond à la valeur de la propriété 'country' de vos objets client.
];


const ClientsPage = () => {
  const [period, setPeriod] = useState('thismonth');
  const [clientData, setClientData] = useState([]);
  const [clientsWithLocation, setClientsWithLocation] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- NOUVEAU : États pour la gestion de la carte ---
  const [map, setMap] = useState(null); // Pour garder une référence à l'instance de la carte
  const [selectedCountry, setSelectedCountry] = useState(countryFilters[0]); // Filtre de pays actif

  const periodOptions = [
    { key: 'thismonth', label: 'Ce mois-ci' },
    { key: 'thisyear', label: 'Cette Année' },
    { key: 'lastyear', label: 'Année Dernière' },
    { key: 'alltime', label: 'Historique' },
  ];

  // Effet pour charger l'activité des clients (graphique)
  useEffect(() => {
    const fetchClientActivity = async () => {
      setIsLoading(true);
      try {
        const response = await dashboardService.getClientActivity(period);
        const processedData = response.map((client) => ({
          ...client,
          closedTickets: client.totalTickets - client.openTickets,
        }));
        setClientData(processedData);
      } catch (e) {
        console.error('Erreur ClientsPage - activité', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClientActivity();
  }, [period]);

  // Effet pour charger la localisation des clients
  useEffect(() => {
    const fetchClientLocations = async () => {
      try {
        const clients = await clientService.getAllClients();
        if (Array.isArray(clients)) {
          setClientsWithLocation(clients);
        } else if (clients && Array.isArray(clients.data)) {
          setClientsWithLocation(clients.data);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des emplacements clients', e);
      }
    };
    fetchClientLocations();
  }, []);

  // --- NOUVEAU : Effet pour déplacer la carte quand un pays est sélectionné ---
  useEffect(() => {
    if (map && selectedCountry) {
      map.flyTo(selectedCountry.coords, selectedCountry.zoom);
    }
  }, [map, selectedCountry]);

  // --- NOUVEAU : Filtrage des clients à afficher sur la carte ---
  const filteredClients = clientsWithLocation.filter(client => {
    // IMPORTANT : Assurez-vous que vos objets client ont une propriété `country`
    if (!client.latitude || !client.longitude) return false;
    if (selectedCountry.code === 'all') return true;
    return client.country === selectedCountry.code;
  });

  return (
    <div className="animate-in fade-in-0 space-y-6">
      {/* ---- Client Activity Chart (inchangé) ---- */}
      <WidgetContainer title="Activité par Client">
        <div className="flex justify-start gap-2 mb-4 flex-wrap">
          {periodOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key)}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                period === opt.key
                  ? 'bg-sky-500 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={clientData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="clientName" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="closedTickets" stackId="a" name="Tickets Fermés" fill="#22c55e" />
              <Bar dataKey="openTickets" stackId="a" name="Tickets Ouverts" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </WidgetContainer>

      {/* ---- Leaflet World Map with Client Markers (mis à jour) ---- */}
      <WidgetContainer title="Emplacement des Clients">
        
        {/* --- NOUVEAU : Sélecteur de pays --- */}
        <div className="mb-4">
            <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filtrer par pays
            </label>
            <select
                id="country-select"
                className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600"
                value={selectedCountry.code}
                onChange={(e) => {
                    const country = countryFilters.find(c => c.code === e.target.value);
                    if (country) setSelectedCountry(country);
                }}
            >
                {countryFilters.map(country => (
                    <option key={country.code} value={country.code}>
                        {country.name}
                    </option>
                ))}
            </select>
        </div>

        <div className="w-full h-[500px] rounded-lg overflow-hidden relative">
          {isLoading && <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 z-10 flex items-center justify-center"><LoadingIndicator /></div>}
          <MapContainer
            center={selectedCountry.coords}
            zoom={selectedCountry.zoom}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', backgroundColor: '#f1f5f9' }}
            whenCreated={setMap} // On sauvegarde l'instance de la carte
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredClients.map((client) => (
              <Marker
                key={client.id}
                position={[client.latitude, client.longitude]}
                icon={pulsingIcon} // <-- Utilisation de notre nouvelle icône animée
              >
                <Popup>
                    <b>{client.nomComplet || client.name}</b><br/>
                    {client.address || 'Adresse non disponible'}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </WidgetContainer>
    </div>
  );
};

export default ClientsPage;
