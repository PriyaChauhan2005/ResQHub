import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapControls from "./MapControls";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

const severityIcon = (severity) => {
  if (severity === "HIGH") return createIcon("red");
  if (severity === "MEDIUM") return createIcon("orange");
  return createIcon("blue");
};

const userIcon = createIcon("blue");

export default function MapView({ incidents = [], userLocation = null }) {
  const mappedIncidents = incidents.filter(
    (incident) =>
      incident?.location &&
      incident.location?.lat != null &&
      incident.location?.lng != null
  );

  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={13}
      zoomControl={false}
      className="w-full h-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* MUST BE INSIDE */}
      <MapControls />

      {mappedIncidents.map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.location.lat, incident.location.lng]}
          icon={severityIcon(incident.severity)}
        >
          <Popup>
            <div className="space-y-1">
              <p className="font-bold text-sm">
                {incident.title || "Untitled Incident"}
              </p>
              <p className="text-xs text-slate-500">
                Severity: {incident.severity || "LOW"}
              </p>
              <p className="text-xs">
                Status: {incident.status || "PENDING"}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>Your Unit Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}