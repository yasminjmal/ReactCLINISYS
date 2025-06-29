import React, { useState, useEffect, memo, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { interpolateGreens, interpolateBlues, interpolateReds } from "d3-scale-chromatic";
import dashboardService from '../../../services/dashboardService';

// URLs des fichiers GeoJSON
const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
// Pour la Tunisie, cette URL GitHub peut être instable ou bloquée par CORS.
// Idéalement, servez ce fichier depuis votre propre backend ou un CDN fiable.
const TUNISIA_GOVERNORATES_GEO_URL = "https://raw.githubusercontent.com/datasets/geo-countries-regions-tunisia/main/data/tunisia.geojson";

// Helper pour convertir le code ISO A2 en nom de pays (si nécessaire)
const countryCodeToNameMapping = {
    "US": "United States of America",
    "FR": "France",
    "TN": "Tunisie",
    "LY": "Libye",
    "EG": "Egypte",
    "MA": "Maroc",
    "DZ": "Algérie",
    // Ajoutez d'autres pays si nécessaire
};

const ClientMapWidget = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapType, setMapType] = useState('world'); // 'world' ou 'tunisia'
  const [clientStats, setClientStats] = useState([]);
  const [geoUrl, setGeoUrl] = useState(WORLD_GEO_URL); // URL GeoJSON active
  const [mapData, setMapData] = useState(null); // Données GeoJSON brutes (non utilisées directement par Geographies pour l'instant)

  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Charger les statistiques clients
  useEffect(() => {
    const fetchClientStats = async () => {
      setLoading(true);
      try {
        const stats = await dashboardService.getClientStatsByRegion(mapType);
        setClientStats(stats);
      } catch (err) {
        console.error("Erreur lors du chargement des stats clients:", err);
        setError("Erreur lors du chargement des statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchClientStats();
  }, [mapType]); // Re-fetch quand le type de carte change

  // Charger le fichier GeoJSON spécifique à la carte
  useEffect(() => {
    setLoading(true);
    setError(null);
    const currentGeoUrl = mapType === 'tunisia' ? TUNISIA_GOVERNORATES_GEO_URL : WORLD_GEO_URL;
    setGeoUrl(currentGeoUrl);

    // Une solution alternative si la Tunisie ne s'affiche pas à cause de CORS/URL invalide
    // (Non active par défaut, car Geographies peut charger l'URL directement)
    /*
    fetch(currentGeoUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setMapData(data); // Stocke les données GeoJSON
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur lors du chargement du fichier GeoJSON:", err);
        setError(`Impossible de charger la carte: ${err.message}. Vérifiez l'URL du fichier GeoJSON.`);
        setLoading(false);
      });
    */
    setLoading(false); // Réinitialiser le loading ici si on se repose sur Geographies
  }, [mapType]);


  // Générateur de couleurs basé sur les statistiques
  const colorScale = scaleQuantile()
    .domain(clientStats.map(d => d.value))
    .range(Array.from({ length: 9 }, (_, i) => interpolateBlues(i / 8))); // Génère 9 couleurs du plus clair au plus foncé

  const handleMouseEnter = (geo) => {
    // Déterminer l'ID de la région/pays en fonction du type de carte
    // Pour le monde, on utilise ISO_A2 (code pays alpha-2)
    // Pour la Tunisie, on utilise iso_3166_2 (code de subdivision, ex: TN-11)
    const geoId = mapType === 'tunisia' ? geo.properties.iso_3166_2 : geo.properties.ISO_A2;
    const stat = clientStats.find(s => s.id === geoId);
    
    let name = geo.properties.name;
    let count = stat ? stat.value : 0;
    
    // Pour la carte du monde, le nom est ISO_A2, on le convertit si possible
    if (mapType === 'world' && geo.properties.ISO_A2) {
        name = countryCodeToNameMapping[geo.properties.ISO_A2] || geo.properties.name;
    }
    // Pour la Tunisie, les noms sont dans geo.properties.name (selon le GeoJSON)
    if (mapType === 'tunisia' && geo.properties.name) {
        name = geo.properties.name;
    }

    setTooltipContent(`<strong>${name}</strong><br/>Clients: ${count}`);
  };

  const handleMouseLeave = () => {
    setTooltipContent("");
  };

  const handleMouseMove = (event) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[300px] text-slate-500 dark:text-slate-400">
        Chargement de la carte...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full min-h-[300px] text-red-500 dark:text-red-400">
        Erreur: {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow min-h-[350px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Clients par Région</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setMapType('world')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${mapType === 'world' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
          >
            Monde
          </button>
          <button
            onClick={() => setMapType('tunisia')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${mapType === 'tunisia' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
          >
            Tunisie
          </button>
        </div>
      </div>

      <div className="flex-grow relative" onMouseMove={handleMouseMove}>
        <div className="w-full h-full">
            <ComposableMap
              projection="geoMercator"
              // Ajuster le scale et le centre pour la Tunisie
              projectionConfig={{ 
                scale: mapType === 'world' ? 140 : 2500, // Ajuster le scale pour la Tunisie (peut nécessiter d'autres essais)
              }} 
              style={{ width: "100%", height: "100%" }}
            >
              <ZoomableGroup center={mapType === 'tunisia' ? [9.5, 34] : [0, 0]}> {/* Centrer sur la Tunisie si mapType est 'tunisia' */}
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      // Déterminer l'ID de la région/pays en fonction du type de carte
                      const geoId = mapType === 'tunisia' ? geo.properties.iso_3166_2 : geo.properties.ISO_A2;
                      const d = clientStats.find(s => s.id === geoId);
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => handleMouseEnter(geo)}
                          onMouseLeave={handleMouseLeave}
                          style={{
                            default: {
                                fill: d ? colorScale(d.value) : "#ECEFF1", // Couleur basée sur les stats
                                stroke: "#FFFFFF",
                                strokeWidth: 0.5,
                                outline: "none"
                            },
                            hover: {
                                fill: d ? colorScale(d.value) : "#D6D6DA", // Couleur au survol
                                stroke: "#FFFFFF",
                                strokeWidth: 0.75,
                                outline: "none"
                            },
                            pressed: {
                                fill: "#FFC107", // Couleur au clic
                                stroke: "#FFFFFF",
                                strokeWidth: 0.75,
                                outline: "none"
                            },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
        </div>

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

       {/* Légende */}
       <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
         <p>La couleur indique la concentration de clients (plus le bleu est foncé, plus il y a de clients).</p>
         <div className="flex mt-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div 
                    key={i} 
                    style={{ 
                        width: '20px', 
                        height: '10px', 
                        // *** CORRECTION DE LA LIGNE ICI POUR LA LÉGENDE ***
                        backgroundColor: interpolateBlues(i / 8) // Génère les mêmes nuances que la carte
                    }}
                    className="border border-slate-300 dark:border-slate-600"
                ></div>
            ))}
         </div>
       </div>
    </div>
  );
};

export default memo(ClientMapWidget);