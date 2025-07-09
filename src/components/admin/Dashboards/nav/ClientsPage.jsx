// src/components/admin/Dashboards/nav/ClientsPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

import dashboardService from '../../../../services/dashboardService';
import clientService from '../../../../services/clientService';
import { WidgetContainer, LoadingIndicator } from './TicketsPage';

// Le CSS de Leaflet est toujours nécessaire pour sa structure de base
import 'leaflet/dist/leaflet.css';

// --- Définitions des marqueurs et des statuts de tickets ---

// Couleurs associées à chaque statut de ticket
const statueColors = {
    En_attente: 'bg-yellow-500',
    En_cours: 'bg-blue-500',
    Accepte: 'bg-green-500',
    Termine: 'bg-gray-500',
    Refuse: 'bg-red-500',
};

// Icône "Heartbeat" pour les clients actifs (avec des tickets correspondant au filtre)
const createPulsingIcon = (colorClass) => L.divIcon({
    html: `
    <span class="relative flex h-3 w-3">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-75"></span>
      <span class="relative inline-flex rounded-full h-3 w-3 ${colorClass} border-2 border-white"></span>
    </span>
  `,
    className: 'bg-transparent border-0',
    iconSize: [12, 12],
});

// Icône statique pour les clients inactifs
const createStaticIcon = (colorClass) => L.divIcon({
    html: `<span class="relative inline-flex rounded-full h-3 w-3 ${colorClass} border-2 border-white"></span>`,
    className: 'bg-transparent border-0',
    iconSize: [12, 12],
});


// --- Liste des pays pour le filtre ---
const countryFilters = [
    { name: 'Monde entier', code: 'all', coords: [30, 0], zoom: 2 },
    { name: 'Tunisie', code: 'Tunisie', coords: [34.74, 10.76], zoom: 6.5 },
    { name: 'France', code: 'France', coords: [46.60, 2.21], zoom: 5.5 },
    { name: 'Maroc', code: 'Maroc', coords: [31.79, -7.09], zoom: 6 },
];

const worldBounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));


const ClientsPage = () => {
    const [period, setPeriod] = useState('thismonth');
    const [clientData, setClientData] = useState([]);
    const [clientsWithLocation, setClientsWithLocation] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState(countryFilters[0]);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeClientId, setActiveClientId] = useState(null);

    // --- État pour le filtre de statut de ticket ---
    const [selectedTicketstatue, setSelectedTicketstatue] = useState('all'); // 'all' pour tout afficher

    const mapRef = useRef(null);

    const periodOptions = [
        { key: 'thismonth', label: 'Ce mois-ci' },
        { key: 'thisyear', label: 'Cette Année' },
        { key: 'lastyear', label: 'Année Dernière' },
        { key: 'alltime', label: 'Historique' },
    ];

    // Effets de chargement des données
    useEffect(() => {
        const fetchClientActivity = async () => {
            setIsLoading(true);
            try {
                const response = await dashboardService.getClientActivity(period);
                const processedData = response.map((client) => ({ ...client, closedTickets: client.totalTickets - client.openTickets }));
                setClientData(processedData);
            } catch (e) { console.error('Erreur ClientsPage - activité', e); }
            finally { setIsLoading(false); }
        };
        fetchClientActivity();
    }, [period]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [clientsResponse, geoJsonResponse] = await Promise.all([
                    clientService.getAllClients(),
                    axios.get('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
                ]);
                const clients = Array.isArray(clientsResponse) ? clientsResponse : (clientsResponse?.data || []);
                setClientsWithLocation(clients);
                setGeoJsonData(geoJsonResponse.data);
            } catch (error) { console.error("Erreur lors du chargement des données initiales", error); }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (map && selectedCountry) {
            map.flyTo(selectedCountry.coords, selectedCountry.zoom);
        }
    }, [selectedCountry]);

    // Logique de filtrage
    const searchedClients = clientsWithLocation
        .filter(client => (selectedCountry.code === 'all' || client.country === selectedCountry.code))
        .filter(client => (client.nomComplet || client.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const clientsOnMap = clientsWithLocation.filter(client => {
        if (!client.latitude || !client.longitude) return false;
        if (selectedCountry.code === 'all') return true;
        return client.country === selectedCountry.code;
    });

    const tunisiaGeoJson = geoJsonData ? {
        ...geoJsonData,
        features: geoJsonData.features.filter(feature => feature.properties.name === 'Tunisia')
    } : null;

    // Fonctions de style et d'interaction pour GeoJSON
    const geoJsonStyle = () => ({ fillColor: '#E9E9E9', weight: 1, color: '#FFFFFF', fillOpacity: 0.5 });
    const highlightFeature = (e) => {
        e.target.setStyle({ weight: 2, color: '#666', fillColor: '#0ea5e9', fillOpacity: 0.7 });
        if (mapRef.current) mapRef.current.getContainer().style.cursor = 'pointer';
    };
    const resetHighlight = (e) => {
        e.target.setStyle(geoJsonStyle());
        if (mapRef.current) mapRef.current.getContainer().style.cursor = '';
    };
    const onEachFeature = (feature, layer) => {
        layer.on({ mouseover: highlightFeature, mouseout: resetHighlight });
        if (feature.properties?.name) layer.bindTooltip(feature.properties.name, { sticky: true, direction: 'auto' });
    };

    const handleClientSelect = (client) => {
        const map = mapRef.current;
        if (map && client.latitude && client.longitude) {
            map.flyTo([client.latitude, client.longitude], 15);
            setActiveClientId(client.id);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-2 animate-in fade-in-0 ">
            <div>
            <WidgetContainer title="Activité par Client">
                <div className="flex justify-start gap-2 mb-4 flex-wrap">
                    {periodOptions.map((opt) => (
                        <button
                            key={opt.key}
                            onClick={() => setPeriod(opt.key)}
                            className={`px-2 py-1 text-xs font-semibold rounded ${period === opt.key
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
                    <ResponsiveContainer width={500} height={200}>
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
            </div>
            <div className='gap-2 grid '>
                <WidgetContainer title="Rechercher un Client">
                    <input
                        type="text"
                        placeholder="Rechercher par nom..."
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 mb-4"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="max-h-60 overflow-y-auto border rounded-md">
                        {searchedClients.length > 0 ? (
                            searchedClients.map(client => (
                                <button
                                    key={client.id}
                                    onClick={() => handleClientSelect(client)}
                                    className={`w-full text-left p-3 text-sm hover:bg-sky-100 dark:hover:bg-sky-900 border-b dark:border-slate-700 ${activeClientId === client.id ? 'bg-sky-100 dark:bg-sky-900 font-semibold' : ''}`}
                                >
                                    {client.nomComplet || client.name}
                                </button>
                            ))
                        ) : (
                            <p className="p-3 text-sm text-gray-500">Aucun client trouvé pour les filtres actuels.</p>
                        )}
                    </div>
                </WidgetContainer>
                <WidgetContainer title="Emplacement des Clients">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Filtre par pays */}
                        <div>
                            <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Filtrer par pays
                            </label>
                            <select
                                id="country-select"
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600"
                                value={selectedCountry.code}
                                onChange={(e) => setSelectedCountry(countryFilters.find(c => c.code === e.target.value))}
                            >
                                {countryFilters.map(country => (<option key={country.code} value={country.code}>{country.name}</option>))}
                            </select>
                        </div>

                        {/* --- Filtre par statut de ticket --- */}
                        <div>
                            <label htmlFor="statue-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Filtrer par statut de ticket
                            </label>
                            <select
                                id="statue-select"
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600"
                                value={selectedTicketstatue}
                                onChange={(e) => setSelectedTicketstatue(e.target.value)}
                            >
                                <option value="all">Tous les statuts</option>
                                {Object.entries(statueColors).map(([statue, colorClass]) => (
                                    <option key={statue} value={statue}>
                                        {statue.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="w-full h-[500px] rounded-lg overflow-hidden relative">
                        {isLoading && <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 z-10 flex items-center justify-center"><LoadingIndicator /></div>}
                        <MapContainer
                            ref={mapRef}
                            center={selectedCountry.coords}
                            zoom={selectedCountry.zoom}
                            scrollWheelZoom={true}
                            style={{ height: '100%', width: '100%', backgroundColor: selectedCountry.code === 'Tunisie' ? '#FFFFFF' : '#f1f5f9' }}
                            maxBounds={worldBounds}
                            maxBoundsViscosity={1.0}
                        >
                            {selectedCountry.code !== 'Tunisie' && (
                                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" noWrap={true}
                                />
                            )}
                            {geoJsonData && (
                                <GeoJSON data={selectedCountry.code === 'Tunisie' ? tunisiaGeoJson : geoJsonData} style={geoJsonStyle} onEachFeature={onEachFeature} />
                            )}

                            {clientsOnMap.map((client) => {
                                // --- NOUVELLE Logique pour déterminer l'icône du client ---
                                let icon;

                                if (client.actif) {
                                    // Le client est actif, donc l'icône pulse.
                                    // On vérifie s'il a un ticket qui correspond au filtre de statut.
                                    const hasMatchingTicket = selectedTicketstatue !== 'all' &&
                                        Array.isArray(client.ticketList) &&
                                        client.ticketList.some(ticket => ticket.statue === selectedTicketstatue);

                                    // Si un ticket correspond, la couleur est celle du statut. Sinon, c'est une couleur "active" par défaut (verte).
                                    const colorClass = hasMatchingTicket
                                        ? statueColors[selectedTicketstatue]
                                        : statueColors['Accepte']; // Vert pour "actif" par défaut

                                    icon = createPulsingIcon(colorClass);

                                } else {
                                    // Le client est inactif, l'icône est statique et grise.
                                    icon = createStaticIcon('bg-gray-400');
                                }

                                return (
                                    <Marker key={client.id} position={[client.latitude, client.longitude]} icon={icon}>
                                        <Popup>
                                            <b>{client.nomComplet || client.name}</b><br />
                                            {client.adress || 'Adresse non disponible'}
                                            {Array.isArray(client.ticketList) && (
                                                <div className="mt-2 pt-2 border-t">
                                                    <h4 className="font-bold text-xs mb-1">Tickets Récents</h4>
                                                    {client.ticketList.slice(0, 3).map(ticket => (
                                                        <div key={ticket.id} className="text-xs">
                                                            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${statueColors[ticket.statue] || 'bg-gray-400'}`}></span>
                                                            {ticket.titre || 'Ticket sans sujet'}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                    </div>
                </WidgetContainer>
            </div>
        </div>
    );
};

export default ClientsPage;
