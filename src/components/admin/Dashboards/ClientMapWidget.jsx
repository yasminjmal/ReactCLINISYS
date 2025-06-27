// src/components/admin/Dashboards/ClientMapWidget.jsx
import React, { useState, useEffect, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { ZoomableGroup } from "react-simple-maps"; // Assurez-vous que cet import est correct pour votre version
import { scaleQuantile } from "d3-scale";
import { interpolateGreens, interpolateBlues, interpolateReds } from "d3-scale-chromatic";
import dashboardService from '../../../services/dashboardService';

// >>> VÉRIFICATION TRÈS IMPORTANTE ICI <<<
// Assurez-vous que ResponsiveContainer est importé directement de 'recharts'
// Si vous aviez d'autres imports de 'recharts' (ex: PieChart, BarChart), ils devraient aussi être ici
import { ResponsiveContainer } from 'recharts'; 


// NOUVELLES URLS GEOJSON DIRECTES
const WORLD_GEO_URL = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-continents.json";
// URL pour les gouvernorats de la Tunisie, basée sur notre recherche
const TUNISIA_GOVERNORATES_GEO_URL = "https://raw.githubusercontent.com/datasets/geo-countries-regions-tunisia/main/data/tunisia.geojson";

// Couleurs pour la carte, basées sur la densité de clients
const COLOR_SCALE_COMMON = scaleQuantile()
  .domain([0, 1, 10, 50, 100]) // Ex: 0 clients, 1 client, 10 clients, 50 clients, 100+ clients
  .range(["#E0E0E0", "#A2D9CE", "#68B2A6", "#44928A", "#20726C"]); // Gamme de verts/bleus

// Couleurs basées sur des statuts de tickets (ex: si une région a beaucoup de tickets "HAUTE")
const COLOR_SCALE_HIGH_PRIORITY = scaleQuantile()
  .domain([0, 1, 5, 10]) // Ex: 0 tickets HAUTE, 1, 5, 10+
  .range(["#E0E0E0", "#FFC0CB", "#FF69B4", "#FF1493"]); // Gamme de roses/rouges

const ClientMapWidget = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geoUrl, setGeoUrl] = useState(WORLD_GEO_URL); // Par défaut: carte du monde
  const [mapType, setMapType] = useState('world'); // 'world' ou 'tunisia'
  const [clientStats, setClientStats] = useState([]); // Données des clients par région/pays
  const [tooltipContent, setTooltipContent] = useState("");
  const [colorBy, setColorBy] = useState('totalClients'); // 'totalClients', 'activeClients', 'ticketsHighPriority', etc.

  // Fonction pour obtenir la couleur de la région
  const getFillColor = (geo) => {
    const geoRegionName = geo.properties.name; 
    const stat = clientStats.find(s => s.regionName && geoRegionName && s.regionName.toLowerCase() === geoRegionName.toLowerCase());

    if (!stat) return "#D9D9D9"; // Couleur pour les régions sans données

    let value = 0;
    let colorScale = COLOR_SCALE_COMMON; 

    if (colorBy === 'totalClients') {
      value = stat.totalClients;
      colorScale = scaleQuantile().domain([0, 1, 10, 50, 100]).range(interpolateGreens.range());
    } else if (colorBy === 'activeClients') {
      value = stat.activeClients;
      colorScale = scaleQuantile().domain([0, 1, 5, 20]).range(interpolateBlues.range());
    } else if (colorBy === 'ticketsHighPriority') {
      value = stat.ticketsByStatus?.HAUTE || 0; 
      colorScale = scaleQuantile().domain([0, 1, 3, 5, 10]).range(interpolateReds.range());
    }

    return colorScale(value);
  };

  useEffect(() => {
    const fetchClientStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getClientStatsByRegion();
        setClientStats(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des stats clients par région:", err);
        setError("Impossible de charger les statistiques clients par région.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientStats();
    const interval = setInterval(fetchClientStats, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mapType === 'world') {
      setGeoUrl(WORLD_GEO_URL);
    } else if (mapType === 'tunisia') {
      setGeoUrl(TUNISIA_GOVERNORATES_GEO_URL);
    }
  }, [mapType]);

  const handleMouseEnter = (geo) => {
    const geoRegionName = geo.properties.name; 
    const stat = clientStats.find(s => s.regionName && geoRegionName && s.regionName.toLowerCase() === geoRegionName.toLowerCase());
    
    let content = `<b>${geoRegionName || "Région inconnue"}</b><br/>`;
    if (stat) {
      content += `Clients Totaux: ${stat.totalClients}<br/>`;
      content += `Clients Actifs: ${stat.activeClients}<br/>`;
      content += `Clients Inactifs: ${stat.inactiveClients}<br/>`;
      content += `Tickets En Attente: ${stat.ticketsByStatus?.En_attente || 0}<br/>`;
      content += `Tickets En Cours: ${stat.ticketsByStatus?.En_cours || 0}<br/>`;
      content += `Tickets Terminés: ${stat.ticketsByStatus?.Termine || 0}<br/>`;
      content += `Tickets Haute Priorité: ${stat.ticketsByStatus?.HAUTE || 0}<br/>`;
    } else {
      content += "Aucune donnée client pour cette région.";
    }
    setTooltipContent(content);
  };

  const handleMouseLeave = () => {
    setTooltipContent("");
  };

  if (loading) return <div className="text-center py-4 text-slate-600 dark:text-slate-400">Chargement de la carte des clients...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Client Map (Bird's Eye)</h3>
        <div className="flex items-center space-x-2">
          <select
            value={mapType}
            onChange={(e) => setMapType(e.target.value)}
            className="form-select text-sm p-2 rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            <option value="world">Monde</option>
            <option value="tunisia">Tunisie</option>
          </select>
          <select
            value={colorBy}
            onChange={(e) => setColorBy(e.target.value)}
            className="form-select text-sm p-2 rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            <option value="totalClients">Total Clients</option>
            <option value="activeClients">Clients Actifs</option>
            <option value="ticketsHighPriority">Tickets Haute Priorité</option>
          </select>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '400px' }}>
        {/* ENVELOPPEMENT DANS RESPONSIVECONTAINER */}
        <ResponsiveContainer width="100%" height="100%">
          <ComposableMap projectionConfig={{ scale: mapType === 'world' ? 150 : 3000 }} className="w-full h-full">
            {mapType === 'tunisia' && (
              <ZoomableGroup center={[9.5, 34]} zoom={6} maxZoom={20} minZoom={1}>
                <Geographies geography={TUNISIA_GOVERNORATES_GEO_URL}>
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
                          hover: { outline: "none", stroke: "#222", strokeWidth: 1 },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>
              </ZoomableGroup>
            )}
            {mapType === 'world' && (
              <ZoomableGroup>
                <Geographies geography={WORLD_GEO_URL}>
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
                          hover: { outline: "none", stroke: "#222", strokeWidth: 1 },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>
              </ZoomableGroup>
            )}
          </ComposableMap>
        </ResponsiveContainer>
        {tooltipContent && (
          <div
            style={{
              position: "absolute",
              background: "rgba(0, 0, 0, 0.7)",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: "4px",
              pointerEvents: "none", 
              zIndex: 1000,
              top: "0px", 
              left: "0px",
              transform: "translate(10px, 10px)", 
            }}
            dangerouslySetInnerHTML={{ __html: tooltipContent }}
          />
        )}
      </div>

      <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        <h4 className="font-semibold mb-2">Légende :</h4>
        {colorBy === 'totalClients' && (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: COLOR_SCALE_COMMON.range()[0] }}></span> 0
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: COLOR_SCALE_COMMON.range()[1] }}></span> 1-9
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: COLOR_SCALE_COMMON.range()[2] }}></span> 10-49
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: COLOR_SCALE_COMMON.range()[3] }}></span> 50-99
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: COLOR_SCALE_COMMON.range()[4] }}></span> 100+
          </div>
        )}
        {colorBy === 'ticketsHighPriority' && (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: COLOR_SCALE_HIGH_PRIORITY.range()[0] }}></span> 0
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: COLOR_SCALE_HIGH_PRIORITY.range()[1] }}></span> 1-2
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: COLOR_SCALE_HIGH_PRIORITY.range()[2] }}></span> 3-5
            <span className="w-4 h-4 inline-block" style={{ backgroundColor: COLOR_SCALE_HIGH_PRIORITY.range()[3] }}></span> 5+
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ClientMapWidget);