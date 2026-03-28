import React, { useState, useMemo } from 'react';
import { Incident, Vehicle } from '@/types';
import { 
  AlertTriangle, 
  Flame, 
  Heart, 
  CloudRain, 
  Wrench, 
  PawPrint,
  Truck,
  Car,
  Shield,
  Layers,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { calculateDistance } from '@/utils/distance';

interface EnhancedCrisisMapProps {
  incidents: Incident[];
  vehicles: Vehicle[];
  coordinatorRegion?: string;
  onIncidentClick?: (incident: Incident) => void;
  className?: string;
}

const getCategoryIcon = (category: Incident['category']) => {
  switch (category) {
    case 'medical': return <Heart className="w-4 h-4" />;
    case 'fire': return <Flame className="w-4 h-4" />;
    case 'disaster': return <CloudRain className="w-4 h-4" />;
    case 'infrastructure': return <Wrench className="w-4 h-4" />;
    case 'wildlife': return <PawPrint className="w-4 h-4" />;
    default: return <AlertTriangle className="w-4 h-4" />;
  }
};

const getSeverityColor = (severity: Incident['severity']) => {
  switch (severity) {
    case 'critical': return 'bg-destructive';
    case 'high': return 'bg-warning';
    case 'medium': return 'bg-info';
    case 'low': return 'bg-success';
    default: return 'bg-muted';
  }
};

const getVehicleIcon = (type: Vehicle['type']) => {
  switch (type) {
    case 'ambulance':
    case 'fire':
      return <Truck className="w-3 h-3" />;
    case 'police':
      return <Shield className="w-3 h-3" />;
    default:
      return <Car className="w-3 h-3" />;
  }
};

const getStatusColor = (status: Vehicle['status']) => {
  switch (status) {
    case 'available': return 'bg-success';
    case 'en-route': return 'bg-warning';
    case 'on-site': return 'bg-info';
    case 'returning': return 'bg-muted';
    default: return 'bg-muted';
  }
};

// Simple clustering algorithm
function clusterIncidents(incidents: Incident[], clusterRadius: number = 0.02) {
  const clusters: Array<{ center: { lat: number; lng: number }; incidents: Incident[] }> = [];
  const processed = new Set<string>();

  incidents.forEach(incident => {
    if (processed.has(incident.id)) return;

    const cluster: Incident[] = [incident];
    processed.add(incident.id);

    incidents.forEach(other => {
      if (processed.has(other.id)) return;

      const distance = calculateDistance(
        incident.location.lat,
        incident.location.lng,
        other.location.lat,
        other.location.lng
      );

      if (distance <= clusterRadius) {
        cluster.push(other);
        processed.add(other.id);
      }
    });

    // Calculate cluster center
    const centerLat = cluster.reduce((sum, inc) => sum + inc.location.lat, 0) / cluster.length;
    const centerLng = cluster.reduce((sum, inc) => sum + inc.location.lng, 0) / cluster.length;

    clusters.push({
      center: { lat: centerLat, lng: centerLng },
      incidents: cluster,
    });
  });

  return clusters;
}

export const EnhancedCrisisMap: React.FC<EnhancedCrisisMapProps> = ({
  incidents,
  vehicles,
  coordinatorRegion,
  onIncidentClick,
  className = '',
}) => {
  const [showIncidents, setShowIncidents] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);

  // Cluster incidents if enabled
  const incidentClusters = useMemo(() => {
    if (!clusteringEnabled || !showIncidents) return [];
    return clusterIncidents(incidents, 0.02);
  }, [incidents, clusteringEnabled, showIncidents]);

  // Calculate positions for display (simplified - in real app would use map library)
  const getIncidentPosition = (incident: Incident, index: number) => {
    // Use actual coordinates scaled to viewport
    const baseLat = 19.0760;
    const baseLng = 72.8777;
    const latOffset = (incident.location.lat - baseLat) * 1000;
    const lngOffset = (incident.location.lng - baseLng) * 1000;
    
    return {
      left: `${50 + lngOffset * 2}%`,
      top: `${50 + latOffset * 2}%`,
    };
  };

  const getVehiclePosition = (vehicle: Vehicle, index: number) => {
    const baseLat = 19.0760;
    const baseLng = 72.8777;
    const latOffset = (vehicle.location.lat - baseLat) * 1000;
    const lngOffset = (vehicle.location.lng - baseLng) * 1000;
    
    return {
      left: `${50 + lngOffset * 2}%`,
      top: `${50 + latOffset * 2}%`,
    };
  };

  return (
    <div className={cn('relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden map-container border border-border', className)}>
      {/* Simulated map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-background to-secondary/20">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-12 grid-rows-8 h-full">
            {[...Array(96)].map((_, i) => (
              <div key={i} className="border border-border/30" />
            ))}
          </div>
        </div>
        
        {/* Roads simulation */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 30 L100 30" stroke="hsl(var(--border))" strokeWidth="0.5" fill="none" opacity="0.5" />
          <path d="M0 60 L100 60" stroke="hsl(var(--border))" strokeWidth="0.5" fill="none" opacity="0.5" />
          <path d="M30 0 L30 100" stroke="hsl(var(--border))" strokeWidth="0.5" fill="none" opacity="0.5" />
          <path d="M70 0 L70 100" stroke="hsl(var(--border))" strokeWidth="0.5" fill="none" opacity="0.5" />
        </svg>

        {/* Region highlight */}
        {coordinatorRegion && (
          <div className="absolute inset-0 border-4 border-primary/20 rounded-2xl pointer-events-none">
            <div className="absolute top-2 left-2 bg-primary/10 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-primary border border-primary/20">
              {coordinatorRegion}
            </div>
          </div>
        )}
      </div>

      {/* Incident markers */}
      {showIncidents && (
        <>
          {clusteringEnabled && incidentClusters.length > 0 ? (
            // Render clusters
            incidentClusters.map((cluster, index) => {
              const position = getIncidentPosition(cluster.incidents[0], index);
              const hasCritical = cluster.incidents.some(inc => inc.severity === 'critical' || inc.severity === 'high');

              return (
                <div
                  key={`cluster-${index}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={position}
                >
                  {hasCritical && (
                    <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-40 scale-150" />
                  )}
                  <div className="relative w-12 h-12 rounded-full bg-primary/80 backdrop-blur-sm border-2 border-primary flex items-center justify-center text-white shadow-lg">
                    <span className="text-sm font-bold">{cluster.incidents.length}</span>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-card border border-border rounded-lg p-2 shadow-lg whitespace-nowrap">
                      <p className="text-xs font-semibold text-foreground">
                        {cluster.incidents.length} incident{cluster.incidents.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Render individual incidents
            incidents.map((incident, index) => {
              const position = getIncidentPosition(incident, index);
              const isCritical = incident.severity === 'critical' || incident.severity === 'high';

              return (
                <div
                  key={incident.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={position}
                  onClick={() => onIncidentClick?.(incident)}
                >
                  {isCritical && (
                    <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-40 scale-150" />
                  )}
                  <div
                    className={cn(
                      'relative w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110',
                      getSeverityColor(incident.severity)
                    )}
                  >
                    {getCategoryIcon(incident.category)}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-card border border-border rounded-lg p-2 shadow-lg whitespace-nowrap">
                      <p className="text-xs font-semibold text-foreground">{incident.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{incident.status}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {/* Vehicle markers */}
      {showVehicles && vehicles.map((vehicle, index) => {
        const position = getVehiclePosition(vehicle, index);

        return (
          <div
            key={vehicle.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={position}
          >
            <div
              className={cn(
                'relative w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110',
                getStatusColor(vehicle.status)
              )}
            >
              {getVehicleIcon(vehicle.type)}
            </div>
            {vehicle.eta && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warning text-warning-foreground text-[8px] font-bold flex items-center justify-center">
                {vehicle.eta}
              </span>
            )}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-card border border-border rounded-lg p-2 shadow-lg whitespace-nowrap">
                <p className="text-xs font-semibold text-foreground">{vehicle.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{vehicle.status}</p>
                {vehicle.eta && <p className="text-xs text-warning">ETA: {vehicle.eta} min</p>}
              </div>
            </div>
          </div>
        );
      })}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3">
        <p className="text-xs font-semibold text-foreground mb-2">Legend</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">High</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Vehicle</span>
          </div>
        </div>
      </div>

      {/* Layer controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2 flex flex-col gap-1">
          <Toggle
            pressed={showIncidents}
            onPressedChange={setShowIncidents}
            aria-label="Toggle incidents"
            size="sm"
          >
            <MapPin className="w-4 h-4" />
          </Toggle>
          <Toggle
            pressed={showVehicles}
            onPressedChange={setShowVehicles}
            aria-label="Toggle vehicles"
            size="sm"
          >
            <Truck className="w-4 h-4" />
          </Toggle>
          <Toggle
            pressed={clusteringEnabled}
            onPressedChange={setClusteringEnabled}
            aria-label="Toggle clustering"
            size="sm"
          >
            <Layers className="w-4 h-4" />
          </Toggle>
        </div>
        <div className="flex flex-col gap-1">
          <Button variant="outline" size="icon" className="w-8 h-8">
            +
          </Button>
          <Button variant="outline" size="icon" className="w-8 h-8">
            −
          </Button>
        </div>
      </div>
    </div>
  );
};
