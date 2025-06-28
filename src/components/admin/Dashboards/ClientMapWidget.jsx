// src/components/admin/Dashboards/ClientMapWidget.jsx
import React, { useState, useEffect, memo, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { interpolateGreens, interpolateBlues, interpolateReds } from "d3-scale-chromatic";
import { ResponsiveContainer } from 'recharts';
import dashboardService from '../../../services/dashboardService';

const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const TUNISIA_GOVERNORATES_GEO_URL = "https://raw.githubusercontent.com/datasets/geo-countries-regions-tunisia/main/data/tunisia.geojson";

// Helper pour convertir le code ISO A2 en nom de pays (si nécessaire)
// Ceci est un exemple, vous pourriez avoir besoin d'une liste plus complète
const countryCodeToNameMapping = {
    "US": "United States of America",
    "FR": "France",
    "TN": "Tunisia",
    // Ajoutez d'autres pays si nécessaire
};

const ClientMapWidget = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapType, setMapType] = useState('world');
  const [clientStats, setClientStats] = useState([]);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [colorBy, setColorBy] = useState('totalClients');
  const mapContainerRef = useRef(null);

  // Fonction pour obtenir la couleur de la région
  const getFillColor = (geo) => {
    // Pour la carte du monde, le nom est dans `geo.properties.name`
    // Pour la carte de Tunisie, le nom est dans `geo.properties.name` aussi (ex: "Sfax")
    const geoRegionName = geo.properties.name;
    
    // Le nom de la région depuis notre API est dans `s.regionName`
    const stat = clientStats.find(s => {
        if (mapType === 'world') {
            // On compare le nom du pays du GeoJSON avec la version convertie de notre code pays
            const countryNameFromCode = countryCodeToNameMapping[s.regionName] || s.regionName;
            return countryNameFromCode && geoRegionName && countryNameFromCode.toLowerCase() === geoRegionName.toLowerCase();
        }
        // Pour la Tunisie, la correspondance devrait être directe
        return s.regionName && geoRegionName && s.regionName.toLowerCase() === geoRegionName.toLowerCase();
    });

    if (!stat) return "#E0E0E0"; // Couleur pour les régions sans données

    let value = 0;
    let colorScale = scaleQuantile();

    if (colorBy === 'totalClients') {
      value = stat.totalClients || 0;
      colorScale.domain([0, 1, 10, 50, 100]).range(["#c8e6c9", "#81c784", "#4caf50", "#388e3c", "#1b5e20"]);
    } else if (colorBy === 'activeClients') {
      value = stat.activeClients || 0;
      colorScale.domain([0, 1, 5, 20, 50]).range(["#bbdefb", "#64b5f6", "#2196f3", "#1976d2", "#0d47a1"]);
    } else if (colorBy === 'ticketsHighPriority') {
        // NOTE: Cette donnée n'est plus calculée par le backend optimisé.
        // Il faudrait l'ajouter à la requête JPQL si vous en avez besoin.
        value = stat.ticketsByStatus?.HAUTE || 0;
        colorScale.domain([0, 1, 3, 5, 10]).range(["#ffcdd2", "#ef9a9a", "#e57373", "#ef5350", "#d32f2f"]);
    }

    return colorScale(value);
  };

  useEffect(() => {
    const fetchClientStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getClientStatsByRegion(mapType);
        setClientStats(data);
      } catch (err) {
        console.error(`Erreur lors de la récupération des stats pour ${mapType}:`, err);
        setError("Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientStats();
    // Re-fetch quand le type de carte change
  }, [mapType]);

  const handleMouseMove = (event) => {
      if (mapContainerRef.current) {
          const rect = mapContainerRef.current.getBoundingClientRect();
          setTooltipPosition({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
          });
      }
  };

  const handleMouseEnter = (geo) => {
    const geoRegionName = geo.properties.name;
    const stat = clientStats.find(s => {
        if (mapType === 'world') {
            const countryNameFromCode = countryCodeToNameMapping[s.regionName] || s.regionName;
            return countryNameFromCode && geoRegionName && countryNameFromCode.toLowerCase() === geoRegionName.toLowerCase();
        }
        return s.regionName && geoRegionName && s.regionName.toLowerCase() === geoRegionName.toLowerCase();
    });

    let content = `<b>${geoRegionName || "Région inconnue"}</b><br/>`;
    if (stat) {
      content += `Clients Totaux: ${stat.totalClients || 0}<br/>`;
      content += `Clients Actifs: ${stat.activeClients || 0}<br/>`;
    } else {
      content += "Aucune donnée client pour cette région.";
    }
    setTooltipContent(content);
  };

  const handleMouseLeave = () => {
    setTooltipContent("");
  };

  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Client Map (Bird's Eye)</h3>
        <div className="flex items-center space-x-2">
          <select
            value={mapType}
            onChange={(e) => setMapType(e.target.value)}
            className="form-select text-sm p-2 rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            <option value="world">Monde</option>
            <option value="tunisia">Tunisie</option>
          </select>
          <select
            value={colorBy}
            onChange={(e) => setColorBy(e.target.value)}
            className="form-select text-sm p-2 rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            <option value="totalClients">Total Clients</option>
            <option value="activeClients">Clients Actifs</option>
            {/* <option value="ticketsHighPriority">Tickets Haute Priorité</option> */}
          </select>
        </div>
      </div>

      <div ref={mapContainerRef} onMouseMove={handleMouseMove} style={{ position: 'relative', width: '100%', height: '450px' }}>
        {loading ? (
            <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement de la carte...</div>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposableMap projectionConfig={{ scale: mapType === 'tunisia' ? 4000 : 150 }}>
                <ZoomableGroup 
                    center={mapType === 'tunisia' ? [9.5, 34.5] : [0, 20]} 
                    zoom={mapType === 'tunisia' ? 1.5 : 1}
                >
                    <Geographies geography={mapType === 'tunisia' ? TUNISIA_GOVERNORATES_GEO_URL : WORLD_GEO_URL}>
                      {({ geographies }) =>
                        geographies.map((geo) => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={getFillColor(geo)}
                            stroke="#FFF"
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
              transform: "translate(-50%, -100%)", // Centrer au-dessus du curseur
              whiteSpace: 'nowrap',
            }}
            dangerouslySetInnerHTML={{ __html: tooltipContent }}
          />
        )}
      </div>

       {/* Légende (à adapter) */}
       <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
         {/* ... votre légende ici ... */}
       </div>
    </div>
  );
};

export default memo(ClientMapWidget);