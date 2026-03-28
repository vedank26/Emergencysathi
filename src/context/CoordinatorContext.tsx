import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Incident, Vehicle, Agency, IncidentStatus, IncidentSeverity, IncidentCategory } from '@/types';
import { mockIncidents, mockVehicles, mockAgencies } from '@/data/mockData';
import { detectDuplicates, DuplicateGroup } from '@/utils/duplicateDetection';

interface CoordinatorState {
  incidents: Incident[];
  vehicles: Vehicle[];
  agencies: Agency[];
  duplicateGroups: DuplicateGroup[];
  selectedIncident: Incident | null;
  notifications: Notification[];
  activityLogs: ActivityLog[];
  region: string;
}

interface Notification {
  id: string;
  type: 'new_incident' | 'high_severity' | 'assignment_completed' | 'status_update';
  title: string;
  message: string;
  incidentId?: string;
  read: boolean;
  timestamp: Date;
}

interface ActivityLog {
  id: string;
  incidentId: string;
  action: 'viewed' | 'assigned' | 'updated_status' | 'merged' | 'marked_duplicate';
  coordinatorName: string;
  timestamp: Date;
  details?: string;
}

interface CoordinatorContextType {
  state: CoordinatorState;
  // Incident management
  addIncident: (incident: Omit<Incident, 'id' | 'reportedAt' | 'assignedAgencies' | 'assignedVehicles' | 'priority' | 'status'>) => void;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
  assignResources: (incidentId: string, vehicleIds: string[], agencyTypes: string[]) => void;
  mergeIncidents: (incidentIds: string[]) => void;
  markAsDuplicate: (incidentId: string) => void;
  // Selection
  selectIncident: (incident: Incident | null) => void;
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  // Activity logs
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  // Real-time simulation
  simulateNewIncident: () => void;
  simulateStatusUpdate: () => void;
}

const CoordinatorContext = createContext<CoordinatorContextType | undefined>(undefined);

export const CoordinatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CoordinatorState>({
    incidents: [...mockIncidents],
    vehicles: [...mockVehicles],
    agencies: [...mockAgencies],
    duplicateGroups: [],
    selectedIncident: null,
    notifications: [],
    activityLogs: [],
    region: 'Mumbai Central', // Mock region
  });

  // Detect duplicates whenever incidents change
  useEffect(() => {
    const duplicates = detectDuplicates(state.incidents);
    setState(prev => {
      // Only update if duplicates actually changed to avoid infinite loops
      const prevDuplicateIds = prev.duplicateGroups.flatMap(g => g.incidents.map(i => i.id)).sort().join(',');
      const newDuplicateIds = duplicates.flatMap(g => g.incidents.map(i => i.id)).sort().join(',');
      if (prevDuplicateIds === newDuplicateIds) {
        return prev;
      }
      return { ...prev, duplicateGroups: duplicates };
    });
  }, [state.incidents]);

  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'read' | 'timestamp'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      read: false,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications],
    }));
  }, []);

  const addActivityLog = useCallback((log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      activityLogs: [newLog, ...prev.activityLogs],
    }));
  }, []);

  const addIncident = useCallback((
    incidentData: Omit<Incident, 'id' | 'reportedAt' | 'assignedAgencies' | 'assignedVehicles' | 'priority' | 'status'>
  ) => {
    /**
     * Location handling
     * -----------------
     * If the caller (e.g. ReportIncident) already provides precise lat/lng
     * from GPS, we trust those coordinates and DO NOT try to re-parse them
     * from the address string. This ensures the "Navigate" button on the
     * agency dashboard always opens the correct place in Google Maps.
     */
    let lat = incidentData.location.lat;
    let lng = incidentData.location.lng;

    // Fallback: if lat/lng look invalid (0/NaN), approximate from address.
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const addressParts = incidentData.location.address.split(',');
      lat = 19.0760; // Default Mumbai coordinates
      lng = 72.8777;

      if (addressParts.length >= 2) {
        const latMatch = addressParts[0].trim().match(/-?\d+\.?\d*/);
        const lngMatch = addressParts[1].trim().match(/-?\d+\.?\d*/);
        if (latMatch && lngMatch) {
          lat = parseFloat(latMatch[0]);
          lng = parseFloat(lngMatch[0]);
        }
      }
    }

    // Calculate priority based on severity
    const priorityMap: Record<IncidentSeverity, number> = {
      critical: 95,
      high: 80,
      medium: 60,
      low: 40,
    };

    const newIncident: Incident = {
      ...incidentData,
      id: `inc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      reportedAt: new Date(),
      assignedAgencies: [],
      assignedVehicles: [],
      priority: priorityMap[incidentData.severity],
      // New incidents always start as "new" for agencies/coordinator
      status: 'new',
      location: {
        ...incidentData.location,
        lat,
        lng,
      },
    };

    setState(prev => ({
      ...prev,
      incidents: [newIncident, ...prev.incidents],
    }));

    // Add notification for coordinator
    addNotification({
      type: newIncident.severity === 'critical' || newIncident.severity === 'high' 
        ? 'high_severity' 
        : 'new_incident',
      title: 'New Incident Reported',
      message: newIncident.title,
      incidentId: newIncident.id,
    });
  }, [addNotification]);

  const updateIncidentStatus = useCallback((incidentId: string, status: IncidentStatus) => {
    setState(prev => ({
      ...prev,
      incidents: prev.incidents.map(inc =>
        inc.id === incidentId ? { ...inc, status } : inc
      ),
    }));

    // Add activity log
    addActivityLog({
      incidentId,
      action: 'updated_status',
      coordinatorName: 'Current Coordinator',
      details: `Status changed to ${status}`,
    });

    // Add notification
    addNotification({
      type: 'status_update',
      title: 'Status Updated',
      message: `Incident status changed to ${status}`,
      incidentId,
    });
  }, [addActivityLog, addNotification]);

  const assignResources = useCallback((
    incidentId: string,
    vehicleIds: string[],
    agencyTypes: string[]
  ) => {
    setState(prev => ({
      ...prev,
      incidents: prev.incidents.map(inc =>
        inc.id === incidentId
          ? {
              ...inc,
              // Add vehicles if not already assigned to this incident
              assignedVehicles: [...new Set([...inc.assignedVehicles, ...vehicleIds])],
              assignedAgencies: [...new Set([...inc.assignedAgencies, ...agencyTypes as any])],
              // First assignment moves the incident from "new" → "assigned"
              status: inc.status === 'new' ? 'assigned' : inc.status,
            }
          : inc
      ),
      // Keep vehicles available - they can be assigned to multiple incidents
      // Only track which incident they're assigned to, but don't change their status
      vehicles: prev.vehicles.map(veh =>
        vehicleIds.includes(veh.id)
          ? { 
              ...veh, 
              // Keep status as 'available' so vehicle can be assigned to other incidents
              // Still track the assignment for reference
              assignedIncident: incidentId,
              // Status remains 'available' - vehicles can serve multiple incidents
            }
          : veh
      ),
    }));

    // Add activity log
    addActivityLog({
      incidentId,
      action: 'assigned',
      coordinatorName: 'Current Coordinator',
      details: `Assigned ${vehicleIds.length} resources`,
    });

    // Add notification
    addNotification({
      type: 'assignment_completed',
      title: 'Resources Assigned',
      message: `${vehicleIds.length} resources assigned to incident`,
      incidentId,
    });
  }, [addActivityLog, addNotification]);

  const mergeIncidents = useCallback((incidentIds: string[]) => {
    if (incidentIds.length < 2) return;

    // Merge into the first incident
    const primaryId = incidentIds[0];
    const others = incidentIds.slice(1);

    setState(prev => {
      const primary = prev.incidents.find(inc => inc.id === primaryId);
      if (!primary) return prev;

      const merged = others.reduce((acc, id) => {
        const incident = prev.incidents.find(inc => inc.id === id);
        if (!incident) return acc;

        return {
          ...acc,
          assignedVehicles: [...new Set([...acc.assignedVehicles, ...incident.assignedVehicles])],
          assignedAgencies: [...new Set([...acc.assignedAgencies, ...incident.assignedAgencies])],
          description: `${acc.description}\n\n[Merged from incident ${id}]: ${incident.description}`,
        };
      }, primary);

      return {
        ...prev,
        incidents: prev.incidents
          .filter(inc => !others.includes(inc.id))
          .map(inc => (inc.id === primaryId ? merged : inc)),
      };
    });

    // Add activity log
    addActivityLog({
      incidentId: primaryId,
      action: 'merged',
      coordinatorName: 'Current Coordinator',
      details: `Merged ${others.length} incidents`,
    });
  }, [addActivityLog]);

  const markAsDuplicate = useCallback((incidentId: string) => {
    setState(prev => ({
      ...prev,
      incidents: prev.incidents.filter(inc => inc.id !== incidentId),
    }));

    // Add activity log
    addActivityLog({
      incidentId,
      action: 'marked_duplicate',
      coordinatorName: 'Current Coordinator',
      details: 'Marked as duplicate and removed',
    });
  }, [addActivityLog]);

  const selectIncident = useCallback((incident: Incident | null) => {
    setState(prev => ({ ...prev, selectedIncident: incident }));

    if (incident) {
      // Add activity log
      addActivityLog({
        incidentId: incident.id,
        action: 'viewed',
        coordinatorName: 'Current Coordinator',
      });
    }
  }, [addActivityLog]);

  const markNotificationRead = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif => ({ ...notif, read: true })),
    }));
  }, []);

  const simulateNewIncident = useCallback(() => {
    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      category: ['medical', 'fire', 'disaster', 'infrastructure', 'wildlife'][
        Math.floor(Math.random() * 5)
      ] as IncidentCategory,
      severity: ['low', 'medium', 'high', 'critical'][
        Math.floor(Math.random() * 4)
      ] as IncidentSeverity,
      status: 'new',
      title: `New Incident ${Date.now()}`,
      description: 'Simulated incident for testing',
      location: {
        lat: 19.0760 + (Math.random() - 0.5) * 0.1,
        lng: 72.8777 + (Math.random() - 0.5) * 0.1,
        address: `Simulated Location ${Math.floor(Math.random() * 1000)}`,
      },
      reportedBy: 'system',
      reportedAt: new Date(),
      assignedAgencies: [],
      assignedVehicles: [],
      priority: Math.floor(Math.random() * 100),
    };

    setState(prev => ({
      ...prev,
      incidents: [newIncident, ...prev.incidents],
    }));

    addNotification({
      type: newIncident.severity === 'critical' || newIncident.severity === 'high' 
        ? 'high_severity' 
        : 'new_incident',
      title: 'New Incident Reported',
      message: newIncident.title,
      incidentId: newIncident.id,
    });
  }, [addNotification]);

  const simulateStatusUpdate = useCallback(() => {
    const activeIncidents = state.incidents.filter(inc => inc.status !== 'resolved');
    if (activeIncidents.length === 0) return;

    const randomIncident = activeIncidents[Math.floor(Math.random() * activeIncidents.length)];
    const statuses: IncidentStatus[] = ['new', 'assigned', 'en_route', 'on_site', 'resolved'];
    const currentIndex = statuses.indexOf(randomIncident.status);
    const nextStatus = statuses[currentIndex + 1] || randomIncident.status;

    if (nextStatus !== randomIncident.status) {
      updateIncidentStatus(randomIncident.id, nextStatus);
    }
  }, [state.incidents, updateIncidentStatus]);

  return (
    <CoordinatorContext.Provider
      value={{
        state,
        addIncident,
        updateIncidentStatus,
        assignResources,
        mergeIncidents,
        markAsDuplicate,
        selectIncident,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        addActivityLog,
        simulateNewIncident,
        simulateStatusUpdate,
      }}
    >
      {children}
    </CoordinatorContext.Provider>
  );
};

export const useCoordinator = () => {
  const context = useContext(CoordinatorContext);
  if (context === undefined) {
    throw new Error('useCoordinator must be used within a CoordinatorProvider');
  }
  return context;
};
