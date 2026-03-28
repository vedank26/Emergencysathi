import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Bell, 
  LogOut, 
  MapPin, 
  Navigation,
  CheckCircle2,
  Clock,
  Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import IncidentCard from '@/components/shared/IncidentCard';
import { useCoordinator } from '@/context/CoordinatorContext';
import { IncidentDetailView } from '@/components/coordinator/IncidentDetailView';
import type { Incident } from '@/types';

// ⬇ ONLY CHANGE: replace CrisisMap import
import CustomerCrisisMap from "@/components/maps/CustomerCrisisMap";

const AgencyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { state, updateIncidentStatus } = useCoordinator();
  const [selectedIncidentForDetails, setSelectedIncidentForDetails] = useState<Incident | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentAgencyType = user?.agencyType;

  const currentAgency = useMemo(
    () =>
      currentAgencyType
        ? state.agencies.find((agency) => agency.type === currentAgencyType) ?? null
        : null,
    [state.agencies, currentAgencyType]
  );

  const assignedIncidents = useMemo(
    () =>
      state.incidents.filter((incident) => {
        if (incident.status === 'resolved') return false;
        if (!currentAgencyType) {
          return incident.assignedAgencies.length > 0;
        }
        return incident.assignedAgencies.includes(currentAgencyType);
      }),
    [state.incidents, currentAgencyType]
  );

  const agencyVehicles = useMemo(() => {
    if (!currentAgency) return [];
    return state.vehicles.filter(
      (vehicle) =>
        vehicle.type === currentAgency.type && currentAgency.vehicles.includes(vehicle.id)
    );
  }, [state.vehicles, currentAgency]);

  const handleNavigateClick = (incident: Incident) => {
    const { lat, lng } = incident.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleSetStatus = (incident: Incident, nextStatus: Incident['status']) => {
    updateIncidentStatus(incident.id, nextStatus);
  };

  if (selectedIncidentForDetails) {
    const freshIncident =
      state.incidents.find((i) => i.id === selectedIncidentForDetails.id) ??
      selectedIncidentForDetails;
    const incidentLogs = state.activityLogs.filter(
      (log) => log.incidentId === freshIncident.id
    );

    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-emergency flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-foreground">EmergencySathi</span>
                  <span className="text-xs text-muted-foreground ml-2">Agency Portal</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <IncidentDetailView
            incident={freshIncident}
            onBack={() => setSelectedIncidentForDetails(null)}
            onAssignResources={() => {}}
            onUpdateStatus={(status) => updateIncidentStatus(freshIncident.id, status)}
            activityLogs={incidentLogs}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-emergency flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-foreground">EmergencySathi</span>
              <span className="text-xs text-muted-foreground ml-2">Agency Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5" />
            <span className="text-sm text-muted-foreground hidden md:block">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Assigned Incidents</h2>
              <span className="text-sm text-muted-foreground">{assignedIncidents.length} active</span>
            </div>

            {assignedIncidents.length > 0 ? (
              <div className="space-y-4">
                {assignedIncidents.map((incident) => (
                  <div key={incident.id} className="p-4 rounded-xl bg-card border border-border">
                    <IncidentCard
                      incident={incident}
                      onView={() => setSelectedIncidentForDetails(incident)}
                    />

                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                      <Button size="sm" className="flex-1 min-w-[100px]" onClick={() => handleNavigateClick(incident)}>
                        <Navigation className="w-4 h-4 mr-2" /> Navigate
                      </Button>
                      {incident.status === 'assigned' && (
                        <Button size="sm" variant="warning" className="flex-1 min-w-[100px]" onClick={() => handleSetStatus(incident, 'en_route')}>
                          <Clock className="w-4 h-4 mr-2" /> En Route
                        </Button>
                      )}
                      {incident.status === 'en_route' && (
                        <Button size="sm" variant="success" className="flex-1 min-w-[100px]" onClick={() => handleSetStatus(incident, 'on_site')}>
                          <CheckCircle2 className="w-4 h-4 mr-2" /> On Site
                        </Button>
                      )}
                      {incident.status === 'on_site' && (
                        <Button size="sm" variant="outline" className="flex-1 min-w-[100px]" onClick={() => handleSetStatus(incident, 'resolved')}>
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-card border border-border text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">All Clear</h3>
                <p className="text-muted-foreground">No incidents assigned. Stand by for dispatch.</p>
              </div>
            )}

            {/* ONLY CHANGE BELOW */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Response Map</h2>
              {/* replaced CrisisMap with CustomerCrisisMap */}
              <CustomerCrisisMap />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Fleet Status</h2>
              <div className="space-y-3">
                {agencyVehicles.map((vehicle) => (
                  <div 
                    key={vehicle.id}
                    className="p-3 rounded-xl bg-card border border-border flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      vehicle.status === 'available' ? 'bg-success/20 text-success' :
                      vehicle.status === 'en-route' ? 'bg-warning/20 text-warning' :
                      vehicle.status === 'on-site' ? 'bg-info/20 text-info' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Truck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{vehicle.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{vehicle.status.replace('-', ' ')}</p>
                    </div>
                    {vehicle.eta && (
                      <span className="text-xs font-medium text-warning">ETA {vehicle.eta}m</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Today's Stats</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-card border border-border text-center">
                  <p className="text-2xl font-bold text-foreground">7</p>
                  <p className="text-xs text-muted-foreground">Calls Responded</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border text-center">
                  <p className="text-2xl font-bold text-success">3.8m</p>
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border text-center">
                  <p className="text-2xl font-bold text-foreground">4</p>
                  <p className="text-xs text-muted-foreground">Vehicles Active</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border text-center">
                  <p className="text-2xl font-bold text-warning">1</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <h3 className="font-semibold text-foreground mb-2">Station Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">
                    {user?.agencyAddress ?? currentAgency?.address ?? 'Address not set'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">📞 101 (Emergency)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AgencyDashboard;