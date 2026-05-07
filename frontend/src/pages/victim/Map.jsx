import { useMemo, useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useIncidents } from "../../context/IncidentContext";

import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

const MARKER_ICON_BASE =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img";
const MARKER_SHADOW =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const createColoredIcon = (color) =>
  new L.Icon({
    iconUrl: `${MARKER_ICON_BASE}/marker-icon-${color}.png`,
    shadowUrl: MARKER_SHADOW,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

const STATUS_ICONS = {
  PENDING: createColoredIcon("red"),
  IN_PROGRESS: createColoredIcon("orange"),
  RESOLVED: createColoredIcon("green"),
  USER: createColoredIcon("blue"),
};

const toStatusKey = (status = "") => {
  if (status === "ASSIGNED") return "IN_PROGRESS";
  if (status === "PENDING" || status === "RESOLVED" || status === "IN_PROGRESS") {
    return status;
  }
  return "PENDING";
};

const getMarkerColor = (status = "") => {
  const statusKey = toStatusKey(status);
  if (statusKey === "PENDING") return "red";
  if (statusKey === "IN_PROGRESS") return "orange";
  if (statusKey === "RESOLVED") return "green";
  return "red";
};

function IncidentMarker({ incident, position }) {
  const map = useMap();
  const markerRef = useRef(null);
  const normalizedStatus = toStatusKey(incident.status);
  const markerColor = getMarkerColor(normalizedStatus);
  const icon =
    markerColor === "red"
      ? STATUS_ICONS.PENDING
      : markerColor === "orange"
      ? STATUS_ICONS.IN_PROGRESS
      : STATUS_ICONS.RESOLVED;

  const handleClick = () => {
    map.flyTo(position, 14, { duration: 0.6 });
    markerRef.current?.openPopup();
  };

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    >
      <Popup>
        <div className="text-slate-900 min-w-[180px]">
          <p className="font-bold text-sm">{incident.title || "Untitled Incident"}</p>
          <p className="text-xs mt-1">
            <span className="font-semibold">Status:</span> {normalizedStatus}
          </p>
          <p className="text-xs">
            <span className="font-semibold">Severity:</span> {incident.severity || "N/A"}
          </p>
          <p className="text-xs">
            <span className="font-semibold">Time:</span>{" "}
            {incident.createdAt
              ? new Date(incident.createdAt).toLocaleString()
              : "Not available"}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function Map() {
  const { incidents } = useIncidents();
  const [userLocation, setUserLocation] = useState(null);

  const offlineIncidents =
    JSON.parse(localStorage.getItem("offlineIncidents")) || [];

  const allIncidents = useMemo(() => [...incidents, ...offlineIncidents], [incidents]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        setUserLocation(null);
      }
    );
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Safety Map</h1>
        <p className="text-slate-400 text-sm">
          Real-time view of nearby incidents for better situational awareness.
        </p>
      </div>

      {/* Map Container */}
      <div className="bg-slate-900 rounded-xl border border-blue-500/10 p-4">
        <MapContainer
          center={[28.6139, 77.2090]} // Default Delhi
          zoom={12}
          className="h-[320px] sm:h-[420px] lg:h-[500px] w-full rounded-lg"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MarkerClusterGroup chunkedLoading>
            {allIncidents.map((incident) => {
              if (!incident.location || incident.location.manual) return null;

              const position = [incident.location.lat, incident.location.lng];
              return (
                <IncidentMarker
                  key={incident.id}
                  incident={incident}
                  position={position}
                />
              );
            })}
          </MarkerClusterGroup>

          {userLocation && (
            <Marker position={userLocation} icon={STATUS_ICONS.USER}>
              <Popup>
                <div className="text-slate-900 text-xs">
                  <p className="font-bold">You are here</p>
                  <p className="mt-1">
                    {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-slate-900 rounded-xl p-6 border border-blue-500/10">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4">
          Legend
        </h2>

        <div className="flex flex-wrap gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600"></div>
            Pending
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            In Progress
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            Resolved
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            Your Location
          </div>
        </div>
      </div>

    </div>
  );
}