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

// Chemins vers les fichiers GeoJSON locaux
const WORLD_GEO_URL = "/assets/geo/countries-110m.json"; 
const TUNISIA_GOVERNORATES_GEO_URL = "/assets/geo/tunisia.geojson"; 

// Composant de marqueur animé
const AnimatedClientMarker = memo(({ coordinates, status }) => {
  const staticCircleColor = status ? '#4299E1' : '#A0AEC0'; 
  const pingClass = status ? 'animate-ping-red' : ''; 

  return (
    <g transform={`translate(${coordinates[0]}, ${coordinates[1]})`}>
      <circle r={8} fill={staticCircleColor} stroke="#fff" strokeWidth={1} />
      {status && <circle r={8} fill={staticCircleColor} className={pingClass} />}
    </g>
  );
});

const ClientMapWidget = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapType, setMapType] = useState('world');
  const [clientStats, setClientStats] = useState([]); 
  const [individualClients, setIndividualClients] = useState([]); 
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchMapStats = async () => {
      setLoading(true);
      try {
        const stats = await dashboardService.getClientStatsByRegion(mapType);
        console.log("Données clientStats reçues:", stats); 
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

  useEffect(() => {
    const fetchIndividualClientLocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getClientLocations();
        console.log("Données individualClients reçues:", data); 
        setIndividualClients(data); 
      } catch (err) {
        setError("Erreur lors du chargement des emplacements des clients.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIndividualClientLocations();
  }, []); 

  const colorScale = scaleQuantile()
    .domain(clientStats.map(d => d.totalClients))
    .range(["#ECEFF1", "#8DE28D", "#6CCF6C", "#4BBF4B", "#2AA62A", "#0C8C0C"]);

  const handleMouseLeave = () => {
    setTooltipContent("");
  };

  const handleMouseMove = (event) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseEnter = (geo) => {
    const d = clientStats.find(s => {
      if (mapType === 'world') {
        // CORRECTION ICI : Utilise geo.properties.name pour les pays du monde
        return geo.properties.name === s.regionName.trim(); 
      } else if (mapType === 'tunisia') {
        return geo.properties.gouv_fr === s.regionName.trim();
      }
      return false;
    });

    if (d) {
      let content = `<b>${d.regionName.trim()}</b><br/>Clients: ${d.totalClients}`;
      setTooltipContent(content);
    } else {
      const geoName = mapType === 'world' ? geo.properties.name : geo.properties.gouv_fr;
      setTooltipContent(`<b>${geoName || 'Inconnu'}</b><br/>Aucun client`);
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
                  geographies.map((geo) => {
                    const relatedStat = clientStats.find(s => {
                      if (mapType === 'world') {
                        // CORRECTION ICI : Utilise geo.properties.name pour les pays du monde
                        return geo.properties.name === s.regionName.trim();
                      } else if (mapType === 'tunisia') {
                        return geo.properties.gouv_fr === s.regionName.trim();
                      }
                      return false;
                    });
                    
                    const fillColor = relatedStat 
                                      ? colorScale(relatedStat.totalClients) 
                                      : "#ECEFF1"; 
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillColor}
                        onMouseEnter={() => handleMouseEnter(geo)}
                        onMouseLeave={handleMouseLeave}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", fill: "#FFC107" }, 
                          pressed: { outline: "none", fill: "#FFA000" }, 
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {/* Marqueurs pour clients actifs/inactifs */}
              {individualClients.map((client) => (
                <AnimatedClientMarker
                  key={client.id}
                  coordinates={[client.lng, client.lat]} 
                  status={client.status} 
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