import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoordinator } from '@/context/CoordinatorContext';
import { useAuth } from '@/context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Truck, Car, Shield, LogOut, ArrowLeft } from 'lucide-react';
import { AgencyType, VehicleStatus } from '@/types';
import { cn } from '@/lib/utils';

const agencyTypeLabels: Record<AgencyType, string> = {
  police: 'Police',
  ambulance: 'Medical',
  fire: 'Fire',
  disaster: 'Disaster Response',
  forest: 'Forest',
};

const statusLabels: Record<VehicleStatus, string> = {
  available: 'Available',
  'en-route': 'En Route',
  'on-site': 'On Site',
  returning: 'Returning',
};

export const ResourcesView: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { state } = useCoordinator();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgency, setFilterAgency] = useState<AgencyType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<VehicleStatus | 'all'>('all');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredVehicles = useMemo(() => {
    return state.vehicles.filter(vehicle => {
      const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAgency = filterAgency === 'all' || vehicle.type === filterAgency;
      const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
      return matchesSearch && matchesAgency && matchesStatus;
    });
  }, [state.vehicles, searchQuery, filterAgency, filterStatus]);

  const getAgencyName = (vehicleId: string) => {
    const agency = state.agencies.find(a => a.vehicles.includes(vehicleId));
    return agency?.name || 'Unknown';
  };

  const statusColors: Record<VehicleStatus, string> = {
    available: 'bg-success/10 text-success border-success/20',
    'en-route': 'bg-warning/10 text-warning border-warning/20',
    'on-site': 'bg-info/10 text-info border-info/20',
    returning: 'bg-muted text-muted-foreground border-muted-foreground/20',
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/coordinator')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="w-8 h-8 rounded-lg gradient-emergency flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-foreground">CrisisConnect</span>
                <span className="text-xs text-muted-foreground ml-2">Coordinator</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:block">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Resource Inventory</h1>
          </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterAgency} onValueChange={value => setFilterAgency(value as AgencyType | 'all')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Agency Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agencies</SelectItem>
            {Object.entries(agencyTypeLabels).map(([type, label]) => (
              <SelectItem key={type} value={type}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={value => setFilterStatus(value as VehicleStatus | 'all')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusLabels).map(([status, label]) => (
              <SelectItem key={status} value={status}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resources Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resource Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Agency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Assigned To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No resources found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map(vehicle => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {agencyTypeLabels[vehicle.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getAgencyName(vehicle.id)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('capitalize', statusColors[vehicle.status])}
                    >
                      {statusLabels[vehicle.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {vehicle.location.lat.toFixed(4)}, {vehicle.location.lng.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {vehicle.assignedIncident ? (
                      <Badge variant="outline" className="text-xs">
                        {vehicle.assignedIncident}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Resources</p>
          <p className="text-2xl font-bold text-foreground">{state.vehicles.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-success/10 border border-success/20">
          <p className="text-sm text-muted-foreground mb-1">Available</p>
          <p className="text-2xl font-bold text-success">
            {state.vehicles.filter(v => v.status === 'available').length}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
          <p className="text-sm text-muted-foreground mb-1">En Route</p>
          <p className="text-2xl font-bold text-warning">
            {state.vehicles.filter(v => v.status === 'en-route').length}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-info/10 border border-info/20">
          <p className="text-sm text-muted-foreground mb-1">On Site</p>
          <p className="text-2xl font-bold text-info">
            {state.vehicles.filter(v => v.status === 'on-site').length}
          </p>
        </div>
      </div>
        </div>
      </main>
    </div>
  );
};
