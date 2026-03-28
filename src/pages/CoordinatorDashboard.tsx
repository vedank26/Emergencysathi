import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  LogOut, 
  Users, 
  Truck,
  RefreshCw,
  Search,
  MapPin,
  Clock,
  AlertTriangle,
  Activity,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCoordinator } from '@/context/CoordinatorContext';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/coordinator/StatusBadge';
import { SeverityChip } from '@/components/coordinator/SeverityChip';
import { EmptyState } from '@/components/coordinator/EmptyState';
import { IncidentDetailView } from '@/components/coordinator/IncidentDetailView';
import { ActivityLogs } from '@/components/coordinator/ActivityLogs';
import { ResourceAssignmentModal } from '@/components/coordinator/ResourceAssignmentModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AgencyType, IncidentStatus } from '@/types';

// ⬇ ONLY CHANGE: swap map import
import CustomerCrisisMap from "@/components/maps/CustomerCrisisMap";

const CoordinatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { state, updateIncidentStatus, selectIncident, assignResources } = useCoordinator();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // Calculate dashboard stats
  const stats = useMemo(() => {
    const activeIncidents = state.incidents.filter(inc => inc.status !== 'resolved');
    const newIncidents = state.incidents.filter(inc => inc.status === 'new');
    const criticalIncidents = activeIncidents.filter(inc => inc.severity === 'critical' || inc.severity === 'high');
    const availableVehicles = state.vehicles.filter(v => v.status === 'available');
    const deployedVehicles = state.vehicles.filter(v => v.status !== 'available');
    
    return {
      activeIncidents: activeIncidents.length,
      newIncidents: newIncidents.length,
      criticalIncidents: criticalIncidents.length,
      availableVehicles: availableVehicles.length,
      deployedVehicles: deployedVehicles.length,
      totalVehicles: state.vehicles.length,
    };
  }, [state.incidents, state.vehicles]);

  const filteredIncidents = useMemo(() => {
    return state.incidents.filter((inc) => {
      // Filter by status
      if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
      
      // Filter by severity
      if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !inc.title.toLowerCase().includes(query) &&
          !inc.location.address.toLowerCase().includes(query) &&
          !inc.description.toLowerCase().includes(query)
        ) return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by priority: new incidents first, then by reported time
      if (a.status === 'new' && b.status !== 'new') return -1;
      if (a.status !== 'new' && b.status === 'new') return 1;
      return b.reportedAt.getTime() - a.reportedAt.getTime();
    });
  }, [state.incidents, searchQuery, statusFilter, severityFilter]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // === INCIDENT DETAIL SCREEN ===
  if (state.selectedIncident) {
    const logs = state.activityLogs.filter((log) => log.incidentId === state.selectedIncident!.id);

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
                <span className="text-xs text-muted-foreground ml-2">Coordinator</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <IncidentDetailView
          incident={state.selectedIncident}
          onBack={() => selectIncident(null)}
          onAssignResources={() => setShowAssignmentModal(true)}
          onUpdateStatus={(status) => updateIncidentStatus(state.selectedIncident.id, status)}
          activityLogs={logs}
        />
        <ActivityLogs logs={logs} incidentId={state.selectedIncident.id} />

        {/* Resource Assignment Modal */}
        {state.selectedIncident && (
          <ResourceAssignmentModal
            open={showAssignmentModal}
            onClose={() => setShowAssignmentModal(false)}
            onConfirm={(vehicleIds, agencyTypes) => {
              assignResources(state.selectedIncident.id, vehicleIds, agencyTypes);
              setShowAssignmentModal(false);
            }}
            incident={state.selectedIncident}
            vehicles={state.vehicles}
            agencies={state.agencies.map(agency => ({
              id: agency.id,
              type: agency.type,
              name: agency.name,
            }))}
          />
        )}
      </div>
    );
  }

  // === MAIN DASHBOARD ===
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
              <span className="text-xs text-muted-foreground ml-2">Coordinator</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{state.region}</span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/coordinator/agencies')}>
              <Users className="w-4 h-4 mr-2" /> Agencies
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/coordinator/resources')}>
              <Truck className="w-4 h-4 mr-2" /> Resources
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">

        {/* === STATS CARDS === */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="text-2xl font-bold text-foreground">{stats.activeIncidents}</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Incidents</p>
            {stats.newIncidents > 0 && (
              <p className="text-xs text-warning mt-1 font-medium">{stats.newIncidents} new</p>
            )}
          </Card>
          
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-destructive" />
              <span className="text-2xl font-bold text-foreground">{stats.criticalIncidents}</span>
            </div>
            <p className="text-sm text-muted-foreground">Critical/High</p>
            <p className="text-xs text-muted-foreground mt-1">Priority cases</p>
          </Card>
          
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Truck className="w-5 h-5 text-success" />
              <span className="text-2xl font-bold text-foreground">{stats.availableVehicles}</span>
            </div>
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.totalVehicles} total</p>
          </Card>
          
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-info" />
              <span className="text-2xl font-bold text-foreground">{stats.deployedVehicles}</span>
            </div>
            <p className="text-sm text-muted-foreground">Deployed</p>
            <p className="text-xs text-muted-foreground mt-1">In service</p>
          </Card>
        </div>

        {/* === INCIDENTS LIST === */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Active Incidents</h2>
            <Badge variant="secondary">{filteredIncidents.length}</Badge>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by area, title, or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as IncidentStatus | 'all')}>
                <SelectTrigger className="flex-1">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="en_route">En Route</SelectItem>
                  <SelectItem value="on_site">On Site</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as typeof severityFilter)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
            {filteredIncidents.length === 0 ? (
              <EmptyState type="no_results" />
            ) : (
              filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-lg border border-border hover:border-primary/30 transition-all cursor-pointer bg-card hover:shadow-md"
                  onClick={() => selectIncident(inc)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-foreground">{inc.title}</h3>
                        <SeverityChip severity={inc.severity} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{inc.description}</p>
                    </div>
                    <StatusBadge status={inc.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {inc.location.address.split(',')[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor((Date.now() - inc.reportedAt.getTime()) / 60000)}m ago
                    </span>
                    {inc.assignedAgencies.length > 0 && (
                      <span className="flex items-center gap-1 text-success">
                        <Users className="w-3 h-3" />
                        {inc.assignedAgencies.length} assigned
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* === MAP SECTION === */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Live Crisis Map</h2>
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
          
          <CustomerCrisisMap />
        </div>
      </main>
    </div>
  );
};

export default CoordinatorDashboard;