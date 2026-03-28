import React from "react";
import { mockIncidents, mockVehicles } from "@/data/mockData";
import {
  Heart,
  Flame,
  CloudRain,
  Wrench,
  PawPrint,
  Truck,
  Car,
  AlertTriangle,
} from "lucide-react";

const getIncidentColor = (severity: string) => {
  switch (severity) {
    case "critical": return "bg-red-500";
    case "high": return "bg-orange-500";
    case "medium": return "bg-blue-500";
    case "low": return "bg-green-500";
    default: return "bg-gray-500";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "medical": return <Heart className="w-4 h-4" />;
    case "fire": return <Flame className="w-4 h-4" />;
    case "disaster": return <CloudRain className="w-4 h-4" />;
    case "infrastructure": return <Wrench className="w-4 h-4" />;
    case "wildlife": return <PawPrint className="w-4 h-4" />;
    default: return <AlertTriangle className="w-4 h-4" />;
  }
};

const getVehicleColor = (status: string) => {
  switch (status) {
    case "available": return "bg-green-500";
    case "en-route": return "bg-orange-500";
    case "on-site": return "bg-blue-500";
    default: return "bg-gray-500";
  }
};

export default function CrisisMap() {
  return (
    <div className="relative w-full h-[420px] rounded-xl bg-[#1b2431] overflow-hidden border border-border">

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Fake road */
      }
      <svg className="absolute inset-0 w-full h-full opacity-40">
        <line
          x1="5%"
          y1="20%"
          x2="95%"
          y2="80%"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="3"
        />
      </svg>

      {/* INCIDENTS */}
      {mockIncidents.map((inc, idx) => (
        <div
          key={inc.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${10 + idx * 18}%`,
            top: `${20 + idx * 12}%`,
          }}
        >
          {(inc.severity === "critical" || inc.severity === "high") && (
            <span
              className={`absolute w-16 h-16 rounded-full ${getIncidentColor(
                inc.severity
              )} opacity-30 animate-ping`}
            />
          )}
          <div
            className={`relative w-10 h-10 rounded-full ${getIncidentColor(
              inc.severity
            )} text-white flex items-center justify-center shadow-lg`}
          >
            {getCategoryIcon(inc.category)}
          </div>
        </div>
      ))}

      {/* VEHICLES */}
      {mockVehicles.map((v, idx) => (
        <div
          key={v.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${20 + idx * 10}%`,
            top: `${70 - (idx % 3) * 10}%`,
          }}
        >
          <div
            className={`relative w-8 h-8 rounded-lg ${getVehicleColor(
              v.status
            )} text-white flex items-center justify-center shadow-md`}
          >
            {v.type === "ambulance" || v.type === "fire" ? (
              <Truck className="w-4 h-4" />
            ) : (
              <Car className="w-4 h-4" />
            )}
          </div>
          {v.eta && (
            <span className="absolute -top-2 -right-2 w-5 h-5 text-[10px] font-bold rounded-full bg-yellow-400 text-black flex items-center justify-center">
              {v.eta}
            </span>
          )}
        </div>
      ))}

      {/* LEGEND */}
      <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md text-white border border-white/10 rounded-lg p-3">
        <p className="text-xs font-bold mb-1">Legend</p>
        <div className="space-y-1 text-xs opacity-90">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> Critical</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500" /> High</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500" /> Vehicle</div>
        </div>
      </div>

      {/* ZOOM BTN */}
      <div className="absolute top-3 right-3 flex flex-col">
        <button className="w-8 h-8 bg-black/40 text-white border border-white/10 rounded-lg">+</button>
        <button className="w-8 h-8 mt-1 bg-black/40 text-white border border-white/10 rounded-lg">−</button>
      </div>
    </div>
  );
}
