import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { mockIncidents, mockVehicles } from "@/data/mockData";
import { MAPTILER_KEY, MUMBAI } from "@/lib/map/mapConfig";

// === ICON LOGIC === //
const getIncidentEmoji = (severity: string) => {
  if (severity === "critical") return "🚨";
  if (severity === "high") return "🔥";
  if (severity === "medium") return "⚠️";
  return "📍";
};

const getVehicleEmoji = (type: string) => {
  if (type === "ambulance") return "🚑";
  if (type === "fire") return "🚒";
  if (type === "police") return "🚓";
  if (type === "forest") return "🦌";
  if (type === "disaster") return "🛠️";
  return "🚗";
};

const incidentIcon = (severity: string) =>
  L.divIcon({
    html: `<div style="font-size: 26px;">${getIncidentEmoji(severity)}</div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

const vehicleIcon = (type: string) =>
  L.divIcon({
    html: `<div style="font-size: 24px;">${getVehicleEmoji(type)}</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

// === COMPONENT === //
export default function CustomerCrisisMap() {
  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={[MUMBAI.lat, MUMBAI.lng]}
        zoom={12}
        scrollWheelZoom
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution="© MapTiler © OpenStreetMap"
          url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
        />

        {/* INCIDENT MARKERS */}
        {mockIncidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.location.lat, inc.location.lng]}
            icon={incidentIcon(inc.severity)}
          />
        ))}

        {/* VEHICLE MARKERS */}
        {mockVehicles.map((veh) => (
          <Marker
            key={veh.id}
            position={[veh.location.lat, veh.location.lng]}
            icon={vehicleIcon(veh.type)}
          />
        ))}
      </MapContainer>
    </div>
  );
}
