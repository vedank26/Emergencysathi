export type UserRole = 'customer' | 'coordinator' | 'agency';

export type AgencyType = 'police' | 'ambulance' | 'fire' | 'disaster' | 'forest';

export type IncidentCategory = 'medical' | 'fire' | 'disaster' | 'infrastructure' | 'wildlife';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Normalized emergency lifecycle for both coordinator and agency views.
 * We intentionally use snake_case here to match the product spec and keep
 * it easy to persist/serialize later when a backend is added.
 */
export type IncidentStatus = 'new' | 'assigned' | 'en_route' | 'on_site' | 'resolved';

export type VehicleStatus = 'available' | 'en-route' | 'on-site' | 'returning';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  agencyType?: AgencyType;
  /**
   * Optional display address for agency users – captured during signup.
   * For coordinators/customers this will typically be undefined.
   */
  agencyAddress?: string;
  phone?: string;
}

export interface Incident {
  id: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  reportedBy: string;
  reportedAt: Date;
  assignedAgencies: AgencyType[];
  assignedVehicles: string[];
  priority: number;
}

export interface Vehicle {
  id: string;
  type: AgencyType;
  name: string;
  status: VehicleStatus;
  location: {
    lat: number;
    lng: number;
  };
  assignedIncident?: string;
  eta?: number;
}

export interface Agency {
  id: string;
  type: AgencyType;
  name: string;
  phone: string;
  address: string;
  vehicles: string[];
}
