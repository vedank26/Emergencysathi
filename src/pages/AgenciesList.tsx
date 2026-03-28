import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoordinator } from '@/context/CoordinatorContext';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, ChevronDown, ChevronUp, Phone, MapPin, Truck, Shield, LogOut, ArrowLeft } from 'lucide-react';
import { AgencyType } from '@/types';
import { cn } from '@/lib/utils';

const agencyTypeLabels: Record<AgencyType, string> = {
  police: 'Police',
  ambulance: 'Medical',
  fire: 'Fire',
  disaster: 'Disaster Response',
  forest: 'Forest',
};

export const AgenciesList: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { state } = useCoordinator();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AgencyType | 'all'>('all');
  const [expandedAgencies, setExpandedAgencies] = useState<Set<string>>(new Set());

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredAgencies = state.agencies.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || agency.type === filterType;
    return matchesSearch && matchesType;
  });

  const toggleExpand = (agencyId: string) => {
    setExpandedAgencies(prev => {
      const next = new Set(prev);
      if (next.has(agencyId)) {
        next.delete(agencyId);
      } else {
        next.add(agencyId);
      }
      return next;
    });
  };

  const getAgencyVehicles = (agencyId: string) => {
    return state.vehicles.filter(vehicle => {
      const agency = state.agencies.find(a => a.id === agencyId);
      return agency?.vehicles.includes(vehicle.id);
    });
  };

  const getAvailableCount = (agencyId: string) => {
    return getAgencyVehicles(agencyId).filter(v => v.status === 'available').length;
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
                <span className="font-bold text-foreground">EmergencySathi</span>
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
            <h1 className="text-2xl font-bold text-foreground">Agencies</h1>
          </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search agencies..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={value => setFilterType(value as AgencyType | 'all')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Agency Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(agencyTypeLabels).map(([type, label]) => (
              <SelectItem key={type} value={type}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Agencies Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgencies.map(agency => {
          const isExpanded = expandedAgencies.has(agency.id);
          const vehicles = getAgencyVehicles(agency.id);
          const availableCount = getAvailableCount(agency.id);
          const busyCount = vehicles.length - availableCount;

          return (
            <Card key={agency.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-1">{agency.name}</h3>
                  <Badge variant="secondary" className="capitalize">
                    {agencyTypeLabels[agency.type]}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleExpand(agency.id)}
                  className="h-8 w-8"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{agency.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{agency.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="w-4 h-4" />
                  <span>{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Availability</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      {availableCount} Available
                    </Badge>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      {busyCount} Busy
                    </Badge>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-2">Resources</h4>
                    <div className="space-y-2">
                      {vehicles.map(vehicle => (
                        <div
                          key={vehicle.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-secondary/30"
                        >
                          <span className="text-sm text-foreground">{vehicle.name}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              vehicle.status === 'available'
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-warning/10 text-warning border-warning/20'
                            )}
                          >
                            {vehicle.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {filteredAgencies.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No agencies found matching your criteria</p>
        </div>
      )}
        </div>
      </main>
    </div>
  );
};
