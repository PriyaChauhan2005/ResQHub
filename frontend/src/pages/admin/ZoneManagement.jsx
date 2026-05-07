import { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Rectangle,
  Popup,
} from "react-leaflet";
import { useIncidents } from "../../context/IncidentContext";
import "leaflet/dist/leaflet.css";

export default function ZoneManagement() {
  const { incidents } = useIncidents();

  const [zones, setZones] = useState(() => {
    const stored = localStorage.getItem("zones");
    return stored
      ? JSON.parse(stored)
      : [
          {
            id: "ZONE-1",
            name: "Sector Alpha",
            bounds: [
              [28.60, 77.18],
              [28.62, 77.21],
            ],
          },
          {
            id: "ZONE-2",
            name: "Sector Bravo",
            bounds: [
              [28.63, 77.22],
              [28.65, 77.25],
            ],
          },
          {
            id: "ZONE-3",
            name: "Sector Charlie",
            bounds: [
              [28.59, 77.23],
              [28.61, 77.26],
            ],
          },
        ];
  });

  const [selectedZone, setSelectedZone] = useState(null);

  // ================= PERSIST ZONES =================
  useEffect(() => {
    localStorage.setItem("zones", JSON.stringify(zones));
  }, [zones]);

  // ================= COUNT INCIDENTS PER ZONE =================
  const zonesWithStats = useMemo(() => {
    return zones.map((zone) => {
      const count = incidents.filter((incident) => {
        if (!incident.location) return false;

        const { lat, lng } = incident.location;
        const [[minLat, minLng], [maxLat, maxLng]] = zone.bounds;

        return (
          lat >= minLat &&
          lat <= maxLat &&
          lng >= minLng &&
          lng <= maxLng
        );
      }).length;

      let level = "SAFE";
      if (count >= 6) level = "CRITICAL";
      else if (count >= 3) level = "ALERT";

      return {
        ...zone,
        incidentCount: count,
        level,
      };
    });
  }, [zones, incidents]);

  const levelColor = (level) => {
    switch (level) {
      case "SAFE":
        return "green";
      case "ALERT":
        return "orange";
      case "CRITICAL":
        return "red";
      default:
        return "blue";
    }
  };

  const deleteZone = (id) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
    setSelectedZone(null);
  };

  const addZone = () => {
    const newZone = {
      id: `ZONE-${zones.length + 1}`,
      name: `Sector ${zones.length + 1}`,
      bounds: [
        [28.60 + Math.random() * 0.05, 77.18 + Math.random() * 0.05],
        [28.62 + Math.random() * 0.05, 77.21 + Math.random() * 0.05],
      ],
    };

    setZones((prev) => [...prev, newZone]);
  };

  return (
    <div className="space-y-8">

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Zone Intelligence Panel
          </h1>
          <p className="text-slate-400 text-sm">
            Live zone-based disaster monitoring.
          </p>
        </div>

        <button
          onClick={addZone}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold"
        >
          + Add Zone
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">

        {/* MAP */}
        <div className="xl:col-span-8 bg-[#121f32] rounded-2xl p-3 sm:p-4 border border-blue-500/10 shadow-xl">

          <MapContainer
            center={[28.6139, 77.209]}
            zoom={12}
            className="h-[320px] sm:h-[420px] lg:h-[500px] w-full rounded-xl"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {zonesWithStats.map((zone) => (
              <Rectangle
                key={zone.id}
                bounds={zone.bounds}
                pathOptions={{
                  color: levelColor(zone.level),
                  fillColor: levelColor(zone.level),
                  fillOpacity: 0.3,
                  weight:
                    selectedZone?.id === zone.id ? 4 : 2,
                  dashArray:
                    zone.level === "CRITICAL"
                      ? "5, 5"
                      : null,
                }}
                eventHandlers={{
                  click: () => setSelectedZone(zone),
                }}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{zone.name}</h3>
                    <p>Status: {zone.level}</p>
                    <p>Incidents: {zone.incidentCount}</p>
                  </div>
                </Popup>
              </Rectangle>
            ))}

          </MapContainer>
        </div>

        {/* RIGHT PANEL */}
        <div className="xl:col-span-4 bg-[#121f32] rounded-2xl p-4 sm:p-6 border border-blue-500/10 shadow-xl">

          {!selectedZone ? (
            <p className="text-slate-400 text-sm">
              Click on a zone to view live statistics.
            </p>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {selectedZone.name}
                </h2>
                <p className="text-xs text-slate-400">
                  ID: {selectedZone.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Live Incident Count
                </p>
                <h3 className="text-3xl font-bold text-white">
                  {
                    zonesWithStats.find(
                      (z) => z.id === selectedZone.id
                    )?.incidentCount
                  }
                </h3>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Risk Level
                </p>
                <h3
                  className={`text-xl font-bold ${
                    zonesWithStats.find(
                      (z) => z.id === selectedZone.id
                    )?.level === "CRITICAL"
                      ? "text-red-500 animate-pulse"
                      : zonesWithStats.find(
                          (z) =>
                            z.id === selectedZone.id
                        )?.level === "ALERT"
                      ? "text-orange-400"
                      : "text-green-400"
                  }`}
                >
                  {
                    zonesWithStats.find(
                      (z) => z.id === selectedZone.id
                    )?.level
                  }
                </h3>
              </div>

              <button
                onClick={() => deleteZone(selectedZone.id)}
                className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg text-sm font-semibold"
              >
                Delete Zone
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}