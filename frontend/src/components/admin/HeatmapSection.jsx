import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🔴 Blinking HIGH marker
const createBlinkIcon = () =>
  new L.DivIcon({
    className: "",
    html: `
      <div class="blink-marker 
                  w-6 h-6 
                  bg-red-500 
                  rounded-full 
                  shadow-[0_0_15px_#ef4444] 
                  border-2 border-white">
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

// 🟠🔵 Normal markers
const createCustomIcon = (color) =>
  new L.Icon({
    iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=warning|${color.replace(
      "#",
      ""
    )}`,
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [0, -40],
  });

export default function HeatmapSection({ incidents = [] }) {
  const [mode, setMode] = useState("intensity");
  const audioRef = useRef(null);


  // 🚨 Siren Trigger
  useEffect(() => {
    const hasHigh = incidents.some(
      (incident) => incident.severity === "HIGH"
    );

    if (hasHigh && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [incidents]);

  return (
    <div className="bg-[#121f32] rounded-2xl p-6 border border-blue-500/10 shadow-xl">

      {/* Hidden Audio */}
      <audio
        ref={audioRef}
        src="/siren.mp3"
        preload="auto"
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-white">
          Disaster Zone Heatmap
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => setMode("satellite")}
            className={`px-4 py-2 rounded-xl text-sm transition ${
              mode === "satellite"
                ? "bg-blue-600 text-white"
                : "bg-[#1e2f44] text-slate-400"
            }`}
          >
            Satellite
          </button>

          <button
            onClick={() => setMode("intensity")}
            className={`px-4 py-2 rounded-xl text-sm transition ${
              mode === "intensity"
                ? "bg-blue-600 text-white"
                : "bg-[#1e2f44] text-slate-400"
            }`}
          >
            Intensity
          </button>
        </div>
      </div>

      {/* MAP */}
      <div className="relative h-[420px] rounded-2xl overflow-hidden">
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={12}
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer
            url={
              mode === "satellite"
                ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            }
            attribution="&copy; OpenStreetMap & Carto"
          />

          {/* Dynamic Markers */}
          {incidents.map((incident) => {
            const position = [
              incident.location?.lat || 28.6139,
              incident.location?.lng || 77.209,
            ];

            const icon =
              incident.severity === "HIGH"
                ? createBlinkIcon()
                : createCustomIcon(
                    incident.severity === "MEDIUM"
                      ? "#f97316"
                      : "#3b82f6"
                  );

            return (
              <Marker
                key={incident.id}
                position={position}
                icon={icon}
              >
                <Popup>
                  <div className="space-y-1">
                    <p className="font-bold text-sm">
                      {incident.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      Severity: {incident.severity}
                    </p>
                    <p className="text-xs">
                      Status: {incident.status}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>


        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-[#0e1a2b] border border-blue-500/10 rounded-xl px-4 py-3 text-xs space-y-2 z-[1000]">
          <p className="text-slate-400 uppercase">
            Hazard Levels
          </p>
          <div className="flex gap-4 mt-1">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 bg-blue-500 rounded-full" /> Low
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 bg-orange-500 rounded-full" /> Medium
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 bg-red-500 rounded-full" /> High
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}