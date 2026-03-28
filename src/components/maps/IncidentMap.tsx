import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAPTILER_KEY, MUMBAI } from "@/lib/map/mapConfig";

// Marker icon for units
const vehicleIcon = L.icon({
  iconUrl: "/marker-unit.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface Unit {
  id: string;
  lat: number;
  lng: number;
  type: string;
  color: string;
}

interface Props {
  incidentLat?: number;
  incidentLng?: number;
  units?: Unit[];
  route?: LatLngExpression[];
}

export function IncidentMap({
  incidentLat,
  incidentLng,
  units = [],
  route = [],
}: Props) {
  console.log("📍 IncidentMap rendered");

  const center: LatLngExpression =
    incidentLat && incidentLng
      ? [incidentLat, incidentLng]
      : [MUMBAI.lat, MUMBAI.lng];

  return (
    <MapContainer
      center={center}
      zoom={incidentLat ? 16 : 12}
      scrollWheelZoom={false}
      style={{
        width: "100%",
        height: "400px", // FIXED HEIGHT
        borderRadius: "12px",
      }}
    >
      <TileLayer
        attribution="© MapTiler © OpenStreetMap contributors"
        url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
      />

      {incidentLat && incidentLng && <Marker position={[incidentLat, incidentLng]} />}

      {units.map((u) => (
        <Marker key={u.id} position={[u.lat, u.lng]} icon={vehicleIcon} />
      ))}

      {route.length > 0 && (
        <Polyline positions={route} color="cyan" weight={5} opacity={0.7} />
      )}
    </MapContainer>
  );
}
