import React from 'react';
import { Incident } from '@/types';
import { 
  AlertTriangle, 
  Flame, 
  Heart, 
  CloudRain, 
  Wrench, 
  PawPrint,
  MapPin,
  Clock,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/coordinator/StatusBadge';
import { SeverityChip } from '@/components/coordinator/SeverityChip';
import { formatDistanceToNow } from 'date-fns';

interface IncidentCardProps {
  incident: Incident;
  onAssign?: () => void;
  onView?: () => void;
  compact?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'medical': return <Heart className="w-5 h-5" />;
    case 'fire': return <Flame className="w-5 h-5" />;
    case 'disaster': return <CloudRain className="w-5 h-5" />;
    case 'infrastructure': return <Wrench className="w-5 h-5" />;
    case 'wildlife': return <PawPrint className="w-5 h-5" />;
    default: return <AlertTriangle className="w-5 h-5" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'medical': return 'bg-primary/10 text-primary';
    case 'fire': return 'bg-warning/10 text-warning';
    case 'disaster': return 'bg-info/10 text-info';
    case 'infrastructure': return 'bg-muted text-muted-foreground';
    case 'wildlife': return 'bg-accent/10 text-accent';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'critical': return 'border-l-destructive bg-destructive/5';
    case 'high': return 'border-l-warning bg-warning/5';
    case 'medium': return 'border-l-info bg-info/5';
    case 'low': return 'border-l-success bg-success/5';
    default: return 'border-l-muted';
  }
};


const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onAssign, onView, compact = false }) => {
  if (compact) {
    return (
      <div className={`p-3 rounded-lg border-l-4 ${getSeverityStyles(incident.severity)} border border-border hover:bg-secondary/30 transition-colors cursor-pointer`} onClick={onView}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${getCategoryColor(incident.category)} flex items-center justify-center`}>
              {getCategoryIcon(incident.category)}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{incident.title}</p>
              <p className="text-xs text-muted-foreground">{incident.location.address}</p>
            </div>
          </div>
          <StatusBadge status={incident.status} size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border-l-4 ${getSeverityStyles(incident.severity)} border border-border gradient-card hover:border-primary/30 transition-all duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${getCategoryColor(incident.category)} flex items-center justify-center`}>
            {getCategoryIcon(incident.category)}
          </div>
          <div>
            <h3 className="font-bold text-foreground">{incident.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={incident.status} size="sm" />
              <SeverityChip severity={incident.severity} size="sm" />
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="px-2 py-1 rounded-lg bg-secondary text-xs font-bold text-foreground">
            P{incident.priority}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{incident.description}</p>

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span className="truncate max-w-[150px]">{incident.location.address}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{formatDistanceToNow(incident.reportedAt, { addSuffix: true })}</span>
        </div>
        {incident.assignedVehicles.length > 0 && (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{incident.assignedVehicles.length} units</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {onView && (
          <Button variant="secondary" size="sm" onClick={onView} className="flex-1">
            View Details
          </Button>
        )}
        {onAssign && incident.status === 'new' && (
          <Button variant="default" size="sm" onClick={onAssign} className="flex-1">
            Assign Resources
          </Button>
        )}
      </div>
    </div>
  );
};

export default IncidentCard;
