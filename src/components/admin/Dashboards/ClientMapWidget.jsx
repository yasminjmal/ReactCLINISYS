// src/components/admin/Dashboards/ClientMapWidget.jsx
import React, { useState, useEffect, memo, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { interpolateGreens } from "d3-scale-chromatic";
import { ResponsiveContainer } from 'recharts';
import dashboardService from '../../../services/dashboardService';
// geoService n'est plus nécessaire ici pour le géocodage à la volée // <<--- C'est ICI qu'il faut supprimer cette ligne

const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const TUNISIA_GOVERNORATES_GEO_URL = "https://raw.githubusercontent.com/datasets/geo-countries-regions-tunisia/main/data/tunisia.geojson";

// Composant de marqueur animé, inchangé
const AnimatedClientMarker = memo(({ coordinates, status }) => {
  const color = status ? 'bg-blue-500' : 'bg-slate-400';
  const pingClass = status ? 'animate-ping-green' : 'animate-ping-red'; // Utilisez vos classes CSS

  return (
    <g transform={`translate(${coordinates[0]}, ${coordinates[1]})`}>
      <circle r={8} fill={color} stroke="#fff" strokeWidth={1} />
      <circle r={8} fill={color} className={pingClass} />
    </g>
  );
});

const ClientMapWidget = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapType, setMapType] = useState('world');
  const [clientStats, setClientStats] = useState([]); // Pour les statistiques par pays/région
  const [individualClients, setIndividualClients] = useState([]); // Pour les marqueurs individuels avec lat/lng
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);

  // useEffect pour charger les statistiques par pays/région
  useEffect(() => {
    const fetchMapStats = async () => {
      setLoading(true);
      try {
        const stats = await dashboardService.getClientStatsByRegion(mapType);
        setClientStats(stats);
      } catch (err) {
        setError("Erreur lors du chargement des statistiques de la carte.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapStats();
  }, [mapType]);

  // NOUVEAU useEffect pour charger les localisations individuelles des clients
  useEffect(() => {
    const fetchIndividualClientLocations = async () => {
      setLoading(true);
      setError(null);
      try {
        // Appelle le nouveau endpoint du backend qui retourne ClientLocationDTOs
        const data = await dashboardService.getClientLocations();
        setIndividualClients(data); // data contient déjà id, nomComplet, lat, lng, status
      } catch (err) {
        setError("Erreur lors du chargement des emplacements des clients.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIndividualClientLocations();
  }, []); // Se déclenche une seule fois au montage du composant

  const colorScale = scaleQuantile()
    .domain(clientStats.map(d => d.count))
    .range(interpolateGreens(clientStats.length / 10));

  const handleMouseLeave = () => {
    setTooltipContent("");
  };

  const handleMouseMove = (event) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseEnter = (geo) => {
    const d = clientStats.find(s => {
      if (mapType === 'world') {
        return geo.properties.iso_a2 === s.countryCode;
      } else if (mapType === 'tunisia') {
        return geo.properties.name === s.regionName;
      }
      return false;
    });

    if (d) {
      let content = `<b>${d.name}</b><br/>Clients: ${d.count}`;
      setTooltipContent(content);
    } else {
      setTooltipContent(`<b>${geo.properties.name}</b><br/>Aucun client`);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement de la carte...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  const currentGeoUrl = mapType === 'world' ? WORLD_GEO_URL : TUNISIA_GOVERNORATES_GEO_URL;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow relative" onMouseMove={handleMouseMove}>
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Clients par région</h2>
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setMapType('world')}
          className={`px-4 py-2 rounded-l-lg ${mapType === 'world' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
        >
          Monde
        </button>
        <button
          onClick={() => setMapType('tunisia')}
          className={`px-4 py-2 rounded-r-lg ${mapType === 'tunisia' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
        >
          Tunisie
        </button>
      </div>

      {currentGeoUrl && (
        <ResponsiveContainer width="100%" height={500}>
          <ComposableMap
            projection="geoMercator"
            ref={mapRef}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup center={[10, 34]} zoom={mapType === 'world' ? 1 : 8}>
              <Geographies geography={currentGeoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={
                        mapType === 'world' && clientStats.length > 0
                          ? colorScale(clientStats.find(s => geo.properties.iso_a2 === s.countryCode)?.count || 0)
                          : mapType === 'tunisia' && clientStats.length > 0
                            ? colorScale(clientStats.find(s => geo.properties.name === s.regionName)?.count || 0)
                            : "#DDD"
                      }
                      onMouseEnter={() => handleMouseEnter(geo)}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill: "#FFC107" },
                        pressed: { outline: "none", fill: "#FFA000" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Marqueurs pour clients actifs/inactifs */}
              {individualClients.map((client) => (
                <AnimatedClientMarker
                  key={client.id}
                  coordinates={[client.lng, client.lat]} // Utilise lat/lng du DTO
                  status={client.status} // 'active' ou 'inactive'
                />
              ))}
            </ZoomableGroup>
          </ComposableMap>
        </ResponsiveContainer>
      )}
      {tooltipContent && (
        <div
          style={{
            position: "absolute",
            background: "rgba(0, 0, 0, 0.8)",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "4px",
            pointerEvents: "none",
            zIndex: 1000,
            top: `${tooltipPosition.y + 15}px`,
            left: `${tooltipPosition.x + 15}px`,
            transform: "translate(-50%, -100%)",
            whiteSpace: 'nowrap',
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }}
        />
      )}
    </div>
  );
};

export default ClientMapWidget;