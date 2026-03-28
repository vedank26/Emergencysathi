import React from 'react';
import { Vehicle, AgencyType } from '@/types';
import { cn } from '@/lib/utils';
import { Truck, Car, Shield, Users, MapPin, Clock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface ResourceCardProps {
  resource: Vehicle;
  onSelect?: (resourceId: string) => void;
  selected?: boolean;
  className?: string;
  compact?: boolean;
}

const getAgencyIcon = (type: AgencyType) => {
  switch (type) {
    case 'ambulance':
    case 'fire':
      return <Truck className="w-5 h-5" />;
    case 'police':
      return <Shield className="w-5 h-5" />;
    default:
      return <Car className="w-5 h-5" />;
  }
};

const getAgencyColor = (type: AgencyType) => {
  switch (type) {
    case 'ambulance':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'fire':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'police':
      return 'bg-info/10 text-info border-info/20';
    case 'disaster':
      return 'bg-muted text-muted-foreground border-muted-foreground/20';
    case 'forest':
      return 'bg-success/10 text-success border-success/20';
    default:
      return 'bg-muted text-muted-foreground border-muted-foreground/20';
  }
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onSelect,
  selected = false,
  className,
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className={cn(
          'p-3 rounded-lg border cursor-pointer transition-all',
          selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/30',
          className
        )}
        onClick={() => onSelect?.(resource.id)}
        role="button"
        tabIndex={0}
        aria-label={`Select ${resource.name}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center border', getAgencyColor(resource.type))}>
              {getAgencyIcon(resource.type)}
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{resource.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{resource.type}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground capitalize mb-1">{resource.status}</div>
            {resource.eta && (
              <div className="flex items-center gap-1 text-xs text-warning">
                <Clock className="w-3 h-3" />
                <span>{resource.eta}m</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all',
        selected ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/30',
        className
      )}
      onClick={() => onSelect?.(resource.id)}
      role="button"
      tabIndex={0}
      aria-label={`Select ${resource.name}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', getAgencyColor(resource.type))}>
            {getAgencyIcon(resource.type)}
          </div>
          <div>
            <h3 className="font-bold text-foreground">{resource.name}</h3>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">{resource.type}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="text-xs font-medium capitalize text-foreground">{resource.status}</span>
        </div>
        
        {resource.eta && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">ETA</span>
            <div className="flex items-center gap-1 text-xs font-medium text-warning">
              <Clock className="w-3 h-3" />
              <span>{resource.eta} min</span>
            </div>
          </div>
        )}

        {resource.assignedIncident && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Assigned</span>
            <span className="text-xs font-medium text-info">Yes</span>
          </div>
        )}
      </div>
    </div>
  );
};
