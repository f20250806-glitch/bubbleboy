
import React from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { calculateRecessionScore, getRecessionStatus } from '../utils/scoring';
import type { CountryData } from '../utils/scoring';
import { Tooltip } from 'react-tooltip';

const GEO_URL = "/world-countries.json";

interface WorldMapProps {
    data: CountryData[];
    onSelectCountry: (country: CountryData) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ data, onSelectCountry }) => {

    const getCountryStyle = (geoId: string) => {
        // Match by geoId (M49 string)
        const country = data.find((c) => c.geoId === geoId);

        if (!country) {
            // Non-interactive / darkened
            return { fill: "#1e293b", stroke: "#020617", cursor: "default" }; // Slate-800 fill, Slate-950 stroke
        }

        // Calculate color based on score
        const score = calculateRecessionScore(country.indicators);
        const { color } = getRecessionStatus(score);
        return { fill: color, stroke: "#020617", cursor: "pointer" };
    };

    return (
        <div className="w-full h-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <ComposableMap projection="geoMercator" projectionConfig={{ scale: 100 }}>
                <ZoomableGroup center={[0, 20]} zoom={1} minZoom={0.7} maxZoom={4}>
                    <Geographies geography={GEO_URL}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                // Match by geoId
                                const country = data.find((c) => c.geoId === geo.id);
                                const style = getCountryStyle(geo.id);

                                const score = country ? calculateRecessionScore(country.indicators) : null;
                                const statusLabel = country ? getRecessionStatus(score!).label : "";

                                // Only show tooltip if it's a top 50 country
                                const tooltipText = country
                                    ? `${country.name} (Score: ${score}) - ${statusLabel}`
                                    : "";

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        // Only add tooltip attributes if country exists
                                        data-tooltip-id={country ? "my-tooltip" : undefined}
                                        data-tooltip-content={tooltipText}
                                        onClick={() => {
                                            if (country) onSelectCountry(country);
                                        }}
                                        style={{
                                            default: {
                                                fill: style.fill,
                                                stroke: style.stroke,
                                                strokeWidth: 0.5,
                                                outline: "none",
                                                transition: "all 250ms"
                                            },
                                            hover: {
                                                // Only highlight if it's a tracked country
                                                fill: country ? "#ffffff" : style.fill,
                                                stroke: style.stroke,
                                                strokeWidth: country ? 0.75 : 0.5,
                                                outline: "none",
                                                cursor: style.cursor,
                                                filter: country ? "drop-shadow(0 0 8px rgba(255,255,255,0.5))" : "none"
                                            },
                                            pressed: {
                                                fill: country ? "#e2e8f0" : style.fill,
                                                outline: "none",
                                            },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>

            {/* Legend */}
            <div className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur p-4 rounded-xl border border-slate-700 pointer-events-none">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recession Risk Index</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-slate-300">Expansion (0-30)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-slate-300">Warning (30-60)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs text-slate-300">Recession (60-100)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700"></div>
                        <span className="text-xs text-slate-500">Untracked</span>
                    </div>
                </div>
            </div>

            <Tooltip id="my-tooltip" place="top" style={{ backgroundColor: "#0f172a", color: "#fff", zIndex: 50 }} />
        </div>
    );
};
