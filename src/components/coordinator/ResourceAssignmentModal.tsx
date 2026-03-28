import React, { useState, useMemo } from 'react';
import { Vehicle, AgencyType, Incident } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ResourceCard } from './ResourceCard';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Search, CheckCircle2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ResourceAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (vehicleIds: string[], agencyTypes: AgencyType[]) => void;
  incident: Incident;
  vehicles: Vehicle[];
  agencies: Array<{ id: string; type: AgencyType; name: string }>;
}

const agencyTypeLabels: Record<AgencyType, string> = {
  police: 'Police',
  ambulance: 'Medical',
  fire: 'Fire',
  disaster: 'Disaster Response',
  forest: 'Forest',
};

export const ResourceAssignmentModal: React.FC<ResourceAssignmentModalProps> = ({
  open,
  onClose,
  onConfirm,
  incident,
  vehicles,
  agencies,
}) => {
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [selectedAgencyTypes, setSelectedAgencyTypes] = useState<AgencyType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgencyType, setFilterAgencyType] = useState<AgencyType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'busy'>('available');

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAgency = filterAgencyType === 'all' || vehicle.type === filterAgencyType;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'available' && vehicle.status === 'available') ||
        (filterStatus === 'busy' && vehicle.status !== 'available');

      return matchesSearch && matchesAgency && matchesStatus;
    });
  }, [vehicles, searchQuery, filterAgencyType, filterStatus]);

  // Group vehicles by agency type
  const vehiclesByAgency = useMemo(() => {
    const grouped: Record<AgencyType, Vehicle[]> = {
      police: [],
      ambulance: [],
      fire: [],
      disaster: [],
      forest: [],
    };

    filteredVehicles.forEach(vehicle => {
      grouped[vehicle.type].push(vehicle);
    });

    return grouped;
  }, [filteredVehicles]);

  const handleVehicleToggle = (vehicleId: string) => {
    setSelectedVehicles(prev =>
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleAgencyTypeToggle = (agencyType: AgencyType) => {
    setSelectedAgencyTypes(prev =>
      prev.includes(agencyType)
        ? prev.filter(type => type !== agencyType)
        : [...prev, agencyType]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedVehicles, selectedAgencyTypes);
    setSelectedVehicles([]);
    setSelectedAgencyTypes([]);
    setSearchQuery('');
    onClose();
  };

  const availableCount = vehicles.filter(v => v.status === 'available').length;
  const busyCount = vehicles.filter(v => v.status !== 'available').length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Resources</DialogTitle>
          <DialogDescription>
            Select vehicles and agencies to assign to this incident
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
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
            <Select value={filterAgencyType} onValueChange={value => setFilterAgencyType(value as AgencyType | 'all')}>
              <SelectTrigger className="w-[180px]">
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
            <Select value={filterStatus} onValueChange={value => setFilterStatus(value as 'all' | 'available' | 'busy')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available ({availableCount})</SelectItem>
                <SelectItem value="busy">Busy ({busyCount})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="vehicles" className="flex-1 flex flex-col overflow-hidden">
            <TabsList>
              <TabsTrigger value="vehicles">Vehicles ({selectedVehicles.length} selected)</TabsTrigger>
              <TabsTrigger value="agencies">Agencies ({selectedAgencyTypes.length} selected)</TabsTrigger>
            </TabsList>

            <TabsContent value="vehicles" className="flex-1 overflow-auto mt-4">
              <div className="space-y-4">
                {Object.entries(vehiclesByAgency).map(([agencyType, agencyVehicles]) => {
                  if (agencyVehicles.length === 0) return null;

                  return (
                    <div key={agencyType}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">
                          {agencyTypeLabels[agencyType as AgencyType]}
                        </h3>
                        <Badge variant="secondary">
                          {agencyVehicles.length} {agencyVehicles.length === 1 ? 'vehicle' : 'vehicles'}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        {agencyVehicles.map(vehicle => {
                          const isSelected = selectedVehicles.includes(vehicle.id);
                          const isAvailable = vehicle.status === 'available';

                          return (
                            <div
                              key={vehicle.id}
                              className={cn(
                                'relative cursor-pointer transition-all',
                                isSelected && 'ring-2 ring-primary'
                              )}
                              onClick={() => isAvailable && handleVehicleToggle(vehicle.id)}
                            >
                              <ResourceCard
                                resource={vehicle}
                                selected={isSelected}
                                compact
                              />
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                                </div>
                              )}
                              {!isAvailable && (
                                <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
                                  <span className="text-sm font-medium text-muted-foreground">Unavailable</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {filteredVehicles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No vehicles found matching your criteria
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="agencies" className="flex-1 overflow-auto mt-4">
              <div className="space-y-3">
                {agencies.map(agency => {
                  const isSelected = selectedAgencyTypes.includes(agency.type);

                  return (
                    <div
                      key={agency.id}
                      className={cn(
                        'p-4 rounded-lg border cursor-pointer transition-all',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-secondary/30'
                      )}
                      onClick={() => handleAgencyTypeToggle(agency.type)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{agency.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {agencyTypeLabels[agency.type]}
                          </p>
                        </div>
                        <Checkbox checked={isSelected} onCheckedChange={() => handleAgencyTypeToggle(agency.type)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Summary */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedVehicles.length} vehicle{selectedVehicles.length !== 1 ? 's' : ''} selected
              {selectedAgencyTypes.length > 0 && (
                <> • {selectedAgencyTypes.length} agenc{selectedAgencyTypes.length !== 1 ? 'ies' : 'y'} selected</>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedVehicles.length === 0 && selectedAgencyTypes.length === 0}
              >
                Confirm Assignment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
