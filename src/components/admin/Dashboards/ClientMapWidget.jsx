import React, { useState, useEffect, memo, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker // Importez Marker si vous voulez des points précis
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { interpolateGreens, interpolateReds } from "d3-scale-chromatic"; // Importez Greens et Reds
import dashboardService from '../../../services/dashboardService';

// URLs des fichiers GeoJSON
const WORLD_GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const TUNISIA_GOVERNORATES_GEO_URL = "/data/tunisia.geojson"; // Chemin relatif vers votre dossier public/data

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

// --- Composant d'animation de cercle (Exemple - nécessite des données lat/lng du backend) ---
// Ceci est un exemple et nécessitera des données de clients avec leurs coordonnées exactes
const AnimatedClientMarker = ({ coordinates, status }) => {
  const color = status === 'active' ? '#4CAF50' : '#F44336'; // Vert pour actif, Rouge pour inactif
  const animationClass = status === 'active' ? 'animate-ping-green' : 'animate-ping-red';

  return (
    <Marker coordinates={coordinates}>
      <circle r={8} fill={color} stroke="#fff" strokeWidth={1} />
      <circle r={8} fill={color} className={animationClass} />
    </Marker>
  );
};
// N'oubliez pas d'ajouter les keyframes CSS pour 'animate-ping-green' et 'animate-ping-red' dans votre fichier CSS global (ex: index.css ou tailwind.css)
/*
@keyframes ping-green {
  0% {
    transform: scale(0.2);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
.animate-ping-green {
  animation: ping-green 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping-red {
  0% {
    transform: scale(0.2);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
.animate-ping-red {
  animation: ping-red 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
*/


const ClientMapWidget = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapType, setMapType] = useState('world'); // 'world' ou 'tunisia'
  const [clientStats, setClientStats] = useState([]); // Stats agrégées par région/pays
  // [NEW] Pourrait contenir une liste de clients individuels avec lat/lng si le backend les fournit
  const [individualClients, setIndividualClients] = useState([]); 
  const [geoUrl, setGeoUrl] = useState(WORLD_GEO_URL); // URL GeoJSON active

  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Charger les statistiques clients (agrégées par région/pays)
  useEffect(() => {
    const fetchClientStats = async () => {
      setLoading(true);
      try {
        // Le backend doit renvoyer les stats pour le type de carte demandé
        // Ex: [{ id: "TN", value: 10, active: 8, inactive: 2 }]
        // Ou pour clients individuels: [{ lat: ..., lng: ..., status: "active" }]
        const stats = await dashboardService.getClientStatsByRegion(mapType);
        setClientStats(stats);
        // Si le backend renvoyait des clients individuels, vous les stockeriez ici:
        // setIndividualClients(stats.individualClients || []);
      } catch (err) {
        console.error("Erreur lors du chargement des stats clients:", err);
        setError("Erreur lors du chargement des statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchClientStats();
  }, [mapType]); // Re-fetch quand le type de carte change
  

  useEffect(() => {
  const fetchClientLocations = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getClientLocations(); // Ou clientService.getClientLocations()
      setIndividualClients(data);
    } catch (err) {
      setError("Erreur lors du chargement des emplacements clients.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };}, []);

  // Charger le fichier GeoJSON spécifique à la carte
  useEffect(() => {
    setLoading(true);
    setError(null);
    const currentGeoUrl = mapType === 'tunisia' ? TUNISIA_GOVERNORATES_GEO_URL : WORLD_GEO_URL;
    setGeoUrl(currentGeoUrl);
    setLoading(false); 
  }, [mapType]);

  // Générateur de couleurs basé sur les statistiques
  // Utilisation de interpolateGreens pour une palette plus douce
  const colorScale = scaleQuantile()
    .domain(clientStats.map(d => d.value)) // `value` est le nombre total de clients
    .range(Array.from({ length: 9 }, (_, i) => interpolateGreens(i / 8))); 

  const handleMouseEnter = (geo) => {
    const geoId = mapType === 'tunisia' ? geo.properties.iso_3166_2 : geo.properties.ISO_A2;
    const stat = clientStats.find(s => s.id === geoId);
    
    let name = geo.properties.name;
    let totalCount = stat ? stat.value : 0;
    let activeCount = stat && stat.active !== undefined ? stat.active : 'N/A'; // Supposons que le backend renvoie 'active' et 'inactive'
    let inactiveCount = stat && stat.inactive !== undefined ? stat.inactive : 'N/A';

    if (mapType === 'world' && geo.properties.ISO_A2) {
        name = countryCodeToNameMapping[geo.properties.ISO_A2] || geo.properties.name;
    }
    if (mapType === 'tunisia' && geo.properties.name) {
        name = geo.properties.name;
    }

    setTooltipContent(
      `<strong>${name}</strong><br/>
      Clients Totaux: ${totalCount}<br/>
      Actifs: <span style="color:${interpolateGreens(0.8)};">${activeCount}</span><br/>
      Non Actifs: <span style="color:${interpolateReds(0.8)};">${inactiveCount}</span>`
    );
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
              projectionConfig={{ 
                scale: mapType === 'world' ? 140 : 2500, 
              }} 
              style={{ width: "100%", height: "100%" }}
            >
              <ZoomableGroup center={mapType === 'tunisia' ? [9.5, 34] : [0, 0]}> 
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
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
                                fill: d ? interpolateGreens(d.value * 0.5) : "#D6D6DA", // Couleur au survol, légèrement différente
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
                
                {individualClients.map((client, index) => (
                    <AnimatedClientMarker 
                        key={index} 
                        coordinates={[client.lng, client.lat]} // Assurez-vous d'avoir lat/lng
                        status={client.status} // 'active' ou 'inactive'
                    />
                ))}


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
              transform: "translateY(-100%)", // Rendu au-dessus du curseur, ajustement en Y
              whiteSpace: 'nowrap',
            }}
            dangerouslySetInnerHTML={{ __html: tooltipContent }}
          />
        )}
      </div>

       {/* Légende */}
       <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
         <p>La couleur indique la concentration de clients (plus le vert est foncé, plus il y a de clients).</p>
         <div className="flex mt-2 items-center">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div 
                    key={i} 
                    style={{ 
                        width: '20px', 
                        height: '10px', 
                        backgroundColor: interpolateGreens(i / 8) // Génère les mêmes nuances que la carte
                    }}
                    className="border border-slate-300 dark:border-slate-600"
                ></div>
            ))}
            <span className="ml-3">Nombre de clients</span>
         </div>
         {/* Légende pour les statuts Actif/Non actif si les données sont disponibles */}
         <div className="flex mt-2 items-center gap-4">
             <div className="flex items-center">
                 <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#4CAF50' }} className="mr-2 border border-slate-300"></div>
                 <span>Actif (survol pour les chiffres par région)</span>
             </div>
             <div className="flex items-center">
                 <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#F44336' }} className="mr-2 border border-slate-300"></div>
                 <span>Non Actif (survol pour les chiffres par région)</span>
             </div>
         </div>
       </div>
    </div>
  );
};

export default memo(ClientMapWidget);