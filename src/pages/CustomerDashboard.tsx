import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Bell, Phone, LogOut, FileText, Info, MapPin, AlertTriangle, Flame, HeartPulse, Droplets, Car, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCoordinator } from '@/context/CoordinatorContext';
import SOSButton from '@/components/shared/SOSButton';
import CustomerCrisisMap from "@/components/maps/CustomerCrisisMap";
import type { AgencyType, Incident } from '@/types';

// Map agency types to display information
const agencyTypeConfig: Record<AgencyType, { name: string; icon: string; color: string }> = {
  ambulance: { name: 'Ambulance', icon: '🚑', color: 'bg-primary' },
  fire: { name: 'Fire Brigade', icon: '🚒', color: 'bg-warning' },
  police: { name: 'Police', icon: '🚓', color: 'bg-info' },
  disaster: { name: 'Disaster Response', icon: '🆘', color: 'bg-accent' },
  forest: { name: 'Forest Department', icon: '🦌', color: 'bg-success' },
};

const emergencyContacts = [
  { name: 'Police', number: '100', color: 'bg-info' },
  { name: 'Ambulance', number: '102', color: 'bg-primary' },
  { name: 'Fire', number: '101', color: 'bg-warning' },
  { name: 'Disaster', number: '1078', color: 'bg-accent' },
];

const SafetyTips = [
  {
    title: 'General Emergency Tips',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    items: [
      'Stay calm and move to a safe location',
      'Do not spread rumours or unverified information',
      'Follow instructions from authorities',
      'Keep emergency exits clear'
    ]
  },
  {
    title: 'Fire Incident',
    icon: <Flame className="w-5 h-5 text-red-500" />,
    items: [
      'Move away from the fire area immediately',
      'Use stairs, do not use elevators',
      'Cover nose and mouth with a cloth',
      'Stay low to avoid smoke'
    ]
  },
  {
    title: 'Medical Emergency',
    icon: <HeartPulse className="w-5 h-5 text-red-500" />,
    items: [
      'Check if the person is conscious',
      'Do not move the injured person unnecessarily',
      'Apply pressure to stop bleeding',
      'Call for help using nearby resources'
    ]
  },
  {
    title: 'Flood / Disaster',
    icon: <Droplets className="w-5 h-5 text-blue-500" />,
    items: [
      'Move to higher ground',
      'Avoid walking through flowing water',
      'Switch off electricity if safe',
      'Keep important documents safe'
    ]
  },
  {
    title: 'Accident / Road Incident',
    icon: <Car className="w-5 h-5 text-amber-500" />,
    items: [
      'Move vehicles to the side if possible',
      'Turn on hazard lights',
      'Do not crowd the victim',
      'Call for professional help'
    ]
  },
  {
    title: 'Emergency Preparedness',
    icon: <AlertTriangle className="w-5 h-5 text-green-500" />,
    items: [
      'Keep emergency contacts saved',
      'Know your nearest hospital / police station',
      'Keep first-aid kit accessible',
      'Ensure phone location is enabled'
    ]
  }
];

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { state } = useCoordinator();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showSafetyTips, setShowSafetyTips] = useState(false);
  const [serviceETAs, setServiceETAs] = useState<Record<AgencyType, number | null>>({
    ambulance: null,
    fire: null,
    police: null,
    disaster: null,
    forest: null,
  });

  // Find the most recent incident (preferably reported by current user, or most recent overall)
  const activeIncident = useMemo(() => {
    const userIncidents = state.incidents
      .filter(inc => inc.status !== 'resolved' && inc.reportedBy === user?.id)
      .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
    
    if (userIncidents.length > 0) {
      return userIncidents[0];
    }
    
    // Fallback to most recent non-resolved incident
    const recentIncidents = state.incidents
      .filter(inc => inc.status !== 'resolved')
      .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());
    
    return recentIncidents[0] || null;
  }, [state.incidents, user?.id]);

  // Build service cards from assigned agencies in the active incident
  const services = useMemo(() => {
    if (!activeIncident) {
      return [];
    }

    // Get all possible agency types
    const allAgencyTypes: AgencyType[] = ['ambulance', 'fire', 'police', 'disaster', 'forest'];
    
    return allAgencyTypes.map(agencyType => {
      const isAssigned = activeIncident.assignedAgencies.includes(agencyType);
      const config = agencyTypeConfig[agencyType];
      
      // Find vehicles assigned to this incident for this agency type
      const assignedVehicles = state.vehicles.filter(
        v => v.type === agencyType && 
             activeIncident.assignedVehicles.includes(v.id)
      );

      // Determine status based on whether agency is assigned and vehicle/incident status
      let status: string;
      let statusColor: string;
      
      if (!isAssigned) {
        // Not assigned by coordinator - show as "Not Assigned"
        status = 'Not Assigned';
        statusColor = 'text-muted-foreground';
      } else {
        // Agency is assigned - determine status based on vehicle status and incident status
        const vehicleStatuses = assignedVehicles.map(v => v.status);
        const hasEnRouteVehicle = vehicleStatuses.includes('en-route');
        const hasOnSiteVehicle = vehicleStatuses.includes('on-site');
        
        if (activeIncident.status === 'on_site' || hasOnSiteVehicle) {
          status = 'Arrived';
          statusColor = 'text-green-500';
        } else if (activeIncident.status === 'en_route' || hasEnRouteVehicle) {
          status = 'On the way';
          statusColor = 'text-green-500';
        } else if (activeIncident.status === 'assigned') {
          status = 'Dispatched';
          statusColor = 'text-yellow-500';
        } else {
          status = 'Assigned';
          statusColor = 'text-yellow-500';
        }
      }

      // Calculate ETA: prioritize vehicle ETA, then estimate based on status
      let eta: number | null = null;
      if (isAssigned) {
        // First, try to use vehicle ETA if available
        const vehicleWithEta = assignedVehicles.find(v => v.eta !== undefined && v.eta !== null);
        if (vehicleWithEta?.eta !== undefined && vehicleWithEta.eta !== null) {
          eta = vehicleWithEta.eta;
        } else if (assignedVehicles.length > 0) {
          // Estimate ETA based on incident status and age
          const minutesSinceReport = (Date.now() - activeIncident.reportedAt.getTime()) / (1000 * 60);
          const minutesSinceAssigned = activeIncident.status !== 'new' 
            ? minutesSinceReport 
            : 0;
          
          if (activeIncident.status === 'on_site') {
            eta = 0;
          } else if (activeIncident.status === 'en_route') {
            // If en route, estimate remaining time (start with 8-15 mins, decrease slowly)
            eta = Math.max(1, 12 - minutesSinceAssigned * 0.15);
          } else if (activeIncident.status === 'assigned') {
            // If just assigned, estimate initial ETA (15-25 minutes)
            eta = Math.max(8, 20 - minutesSinceAssigned * 0.2);
          } else {
            // New incident, not yet assigned - shouldn't happen but handle it
            eta = null;
          }
        }
      }

      return {
        id: agencyType,
        name: config.name,
        icon: config.icon,
        status,
        eta,
        color: config.color,
        statusColor,
        isAssigned,
      };
    });
  }, [activeIncident, state.vehicles]);

  // Initialize ETAs when incident or services change
  useEffect(() => {
    if (!activeIncident) {
      setServiceETAs({
        ambulance: null,
        fire: null,
        police: null,
        disaster: null,
        forest: null,
      });
      return;
    }

    const initialETAs: Record<AgencyType, number | null> = {
      ambulance: null,
      fire: null,
      police: null,
      disaster: null,
      forest: null,
    };

    services.forEach(service => {
      // Only set ETA if the agency is actually assigned
      if (service.isAssigned) {
        // Try to get ETA from vehicles first
        const assignedVehicles = state.vehicles.filter(
          v => v.type === service.id && 
               activeIncident.assignedVehicles.includes(v.id)
        );
        
        const vehicleWithEta = assignedVehicles.find(v => v.eta !== undefined && v.eta !== null);
        if (vehicleWithEta?.eta !== undefined && vehicleWithEta.eta !== null) {
          initialETAs[service.id as AgencyType] = vehicleWithEta.eta;
        } else if (service.eta !== null) {
          // Use calculated ETA from service
          initialETAs[service.id as AgencyType] = service.eta;
        } else {
          // Initialize based on incident status
          if (activeIncident.status === 'on_site') {
            initialETAs[service.id as AgencyType] = 0;
          } else if (activeIncident.status === 'en_route') {
            initialETAs[service.id as AgencyType] = 10 + Math.random() * 5; // 10-15 minutes
          } else if (activeIncident.status === 'assigned') {
            initialETAs[service.id as AgencyType] = 18 + Math.random() * 7; // 18-25 minutes
          }
        }
      } else {
        // Not assigned - explicitly set to null
        initialETAs[service.id as AgencyType] = null;
      }
    });

    setServiceETAs(initialETAs);
  }, [activeIncident?.id, services, state.vehicles]);

  // Update ETAs based on real vehicle status and incident progress
  useEffect(() => {
    if (!activeIncident) return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      
      setServiceETAs(prev => {
        const updated = { ...prev };
        
        // Update ETA for each assigned agency
        services.forEach(service => {
          if (!service.isAssigned) {
            // Not assigned - keep ETA as null
            updated[service.id as AgencyType] = null;
            return;
          }

          const agencyType = service.id as AgencyType;
          const currentEta = updated[agencyType];
          
          // Find assigned vehicles for this agency type
          const assignedVehicles = state.vehicles.filter(
            v => v.type === agencyType && 
                 activeIncident.assignedVehicles.includes(v.id)
          );

          // Priority 1: Use vehicle ETA if available and valid
          const vehicleWithEta = assignedVehicles.find(v => v.eta !== undefined && v.eta !== null);
          if (vehicleWithEta?.eta !== undefined && vehicleWithEta.eta !== null) {
            updated[agencyType] = Math.max(0, vehicleWithEta.eta);
            return;
          }

          // Priority 2: Update based on incident/vehicle status
          if (currentEta === null) {
            // Initialize ETA if not set
            if (activeIncident.status === 'on_site') {
              updated[agencyType] = 0;
            } else if (activeIncident.status === 'en_route') {
              updated[agencyType] = 10 + Math.random() * 5; // 10-15 minutes
            } else if (activeIncident.status === 'assigned') {
              updated[agencyType] = 18 + Math.random() * 7; // 18-25 minutes
            }
          } else if (currentEta > 0) {
            // Countdown: decrease slowly based on status
            let decreaseRate = 0.03; // Base decrease per 3 seconds
            
            // Adjust rate based on status
            if (activeIncident.status === 'en_route') {
              decreaseRate = 0.05; // Faster when en route
            } else if (activeIncident.status === 'on_site') {
              decreaseRate = 1; // Arrive immediately
            }
            
            // Add realistic fluctuation
            const fluctuation = (Math.random() - 0.5) * 0.08; // ±0.04 minutes
            const newEta = Math.max(0, currentEta - decreaseRate + fluctuation);
            updated[agencyType] = Math.round(newEta * 10) / 10;
          } else {
            // Already arrived
            updated[agencyType] = 0;
          }
        });

        return updated;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(timer);
  }, [activeIncident, services, state.vehicles]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  return (
    <div className="min-h-screen bg-background">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-emergency flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-foreground">EmergencySathi</span>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-32">

        {/* WELCOME */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Hello, {user?.name || 'Citizen'} 👋</h1>
          <p className="text-muted-foreground">Stay safe. Help is just one tap away.</p>
        </div>

        {/* SOS SECTION */}
        <div className="mb-8 p-6 rounded-2xl gradient-card border border-border text-center">
          <p className="text-muted-foreground mb-4">Tap the button below in case of emergency</p>
          <div className="flex justify-center">
            <SOSButton size="large" />
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Your location will be shared automatically with emergency services
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Button variant="secondary" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/report')}>
            <FileText className="w-5 h-5" />
            <span>Report Incident</span>
          </Button>
          <Button 
            variant="secondary" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => setShowSafetyTips(true)}
          >
            <Info className="w-5 h-5" />
            <span>Safety Tips</span>
          </Button>
        </div>

        {/* EMERGENCY RESPONSE STATUS */}
        <div className="mb-8">
          <h2 className="font-semibold text-foreground mb-3">Emergency Response Status</h2>
          {activeIncident ? (
            <div className="space-y-3 mb-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-green-700 dark:text-green-300 text-sm">
                  <span className="font-medium">Emergency services have been notified and are responding.</span> Help is on the way to your location.
                </p>
              </div>
              
              <div className="space-y-3">
                {services.map((service) => {
                  // Use the current ETA from state (which updates based on vehicle status)
                  const currentEta = serviceETAs[service.id as AgencyType] ?? service.eta;
                  
                  // Only show ETA if the service is assigned
                  const showEta = service.isAssigned && currentEta !== null;
                  
                  return (
                    <div key={service.id} className="p-4 rounded-xl bg-card border border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg ${service.color} flex items-center justify-center text-xl`}>
                            {service.icon}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{service.name}</p>
                            <p className={`text-sm ${service.statusColor} flex items-center gap-1.5 mt-0.5`}>
                              <span className={`inline-block w-2 h-2 rounded-full ${
                                service.status === 'Arrived' ? 'bg-green-500' :
                                service.status === 'On the way' ? 'bg-green-500' :
                                service.status === 'Dispatched' ? 'bg-yellow-500' :
                                service.status === 'Assigned' ? 'bg-yellow-500' : 'bg-gray-400'
                              }`}></span>
                              {service.status}
                            </p>
                          </div>
                        </div>
                        {showEta && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground">
                              {currentEta === 0 ? '0' : currentEta.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">mins ETA</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                No active emergency. Your area is currently safe.
              </p>
            </div>
          )}
        </div>

        {/* EMERGENCY CONTACTS */}
        <div className="mb-8">
          <h2 className="font-semibold text-foreground mb-3">Emergency Contacts</h2>
          <div className="grid grid-cols-2 gap-3">
            {emergencyContacts.map((contact) => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg ${contact.color} flex items-center justify-center`}>
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.number}</p>
                </div>
              </a>
            ))}
          </div>
        </div>


        {/* LIVE MAP */}
        <div className="mb-4">
          <h2 className="font-semibold text-foreground mb-3">Live Crisis Map</h2>
          <CustomerCrisisMap />
          <p className="text-xs text-muted-foreground text-center mt-2">
            🟢 Vehicles responding • 🔴 Active incidents
          </p>
        </div>
      </main>

      {/* SAFETY TIPS MODAL */}
      <Dialog open={showSafetyTips} onOpenChange={setShowSafetyTips}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              Emergency Safety Tips
            </DialogTitle>
            <DialogDescription className="text-left">
              Important information to keep you safe during emergencies
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {SafetyTips.map((section, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-2">
                  {section.icon}
                  <h3 className="font-semibold text-lg">{section.title}</h3>
                </div>
                <ul className="space-y-2 pl-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-sm">
                      {section.title === 'General Emergency Tips' ? (
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : section.title === 'Emergency Preparedness' ? (
                        <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 flex-shrink-0"></div>
                      )}
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {index < SafetyTips.length - 1 && <div className="border-t border-border my-4"></div>}
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Info className="w-4 h-4" />
              Remember:
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Follow official instructions from emergency services</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Don't panic or spread unverified information</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Don't block emergency routes or services</span>
              </li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* FIXED BOTTOM SOS */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="container mx-auto max-w-md">
          <SOSButton className="w-full h-14" />
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
