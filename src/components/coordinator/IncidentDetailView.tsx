import React from 'react';
import { Incident } from '@/types';
import { StatusBadge } from './StatusBadge';
import { SeverityChip } from './SeverityChip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Image,
  Video,
  CheckCircle2,
  AlertCircle,
  Truck,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface IncidentDetailViewProps {
  incident: Incident;
  onBack: () => void;
  onAssignResources: () => void;
  onUpdateStatus: (status: Incident['status']) => void;
  activityLogs?: Array<{
    action: string;
    timestamp: Date;
    coordinatorName: string;
    details?: string;
  }>;
}

interface TimelineEvent {
  status: Incident['status'];
  label: string;
  icon: React.ReactNode;
  timestamp?: Date;
  completed: boolean;
}

export const IncidentDetailView: React.FC<IncidentDetailViewProps> = ({
  incident,
  onBack,
  onAssignResources,
  onUpdateStatus,
  activityLogs = [],
}) => {
  const timelineEvents: TimelineEvent[] = [
    {
      status: 'new',
      label: 'New',
      icon: <AlertCircle className="w-4 h-4" />,
      timestamp: incident.reportedAt,
      completed: true,
    },
    {
      status: 'assigned',
      label: 'Acknowledged',
      icon: <CheckCircle2 className="w-4 h-4" />,
      timestamp: activityLogs.find(log => log.action === 'assigned')?.timestamp,
      completed: ['assigned', 'en_route', 'on_site', 'resolved'].includes(incident.status),
    },
    {
      status: 'assigned',
      label: 'Resources Assigned',
      icon: <Users className="w-4 h-4" />,
      timestamp: activityLogs.find(log => log.action === 'assigned')?.timestamp,
      completed: ['assigned', 'en_route', 'on_site', 'resolved'].includes(incident.status),
    },
    {
      status: 'en_route',
      label: 'En Route',
      icon: <Truck className="w-4 h-4" />,
      timestamp: activityLogs.find(
        log => log.action === 'updated_status' && log.details?.includes('en_route')
      )?.timestamp,
      completed: ['en_route', 'on_site', 'resolved'].includes(incident.status),
    },
    {
      status: 'resolved',
      label: 'Resolved',
      icon: <CheckCircle2 className="w-4 h-4" />,
      timestamp: activityLogs.find(
        log => log.action === 'updated_status' && log.details?.includes('resolved')
      )?.timestamp,
      completed: incident.status === 'resolved',
    },
  ];

  const currentStatusIndex = timelineEvents.findIndex(
    event => event.status === incident.status || (incident.status === 'on_site' && event.status === 'en_route')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <StatusBadge status={incident.status} size="lg" />
          <SeverityChip severity={incident.severity} size="lg" showIcon />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Info */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{incident.title}</h1>
                <p className="text-muted-foreground">Priority: P{incident.priority}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{incident.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Location</p>
                    <p className="text-sm text-muted-foreground">{incident.location.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Reported</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(incident.reportedAt, { addSuffix: true })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(incident.reportedAt, 'PPp')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Incident Timeline</h2>
            <div className="space-y-4">
              {timelineEvents.map((event, index) => {
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div key={event.status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted text-muted-foreground border-muted-foreground'
                        )}
                      >
                        {event.icon}
                      </div>
                      {index < timelineEvents.length - 1 && (
                        <div
                          className={cn(
                            'w-0.5 flex-1 my-2',
                            isActive ? 'bg-primary' : 'bg-muted-foreground/20'
                          )}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={cn('font-semibold', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                          {event.label}
                        </h3>
                        {event.timestamp && (
                          <span className="text-xs text-muted-foreground">
                            {format(event.timestamp, 'PPp')}
                          </span>
                        )}
                      </div>
                      {isCurrent && (
                        <p className="text-sm text-muted-foreground">Current status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Attachments Placeholder */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Attachments</h2>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-video rounded-lg bg-muted border border-border flex items-center justify-center"
                >
                  {i % 2 === 0 ? (
                    <Video className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Image className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">Placeholder for images/videos</p>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reporter Info */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Reporter Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">User ID</p>
                  <p className="text-xs text-muted-foreground">{incident.reportedBy}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Contact</p>
                  <p className="text-xs text-muted-foreground">***-***-****</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Assigned Resources */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Assigned Resources</h2>
            {incident.assignedVehicles.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Vehicles</span>
                  <span className="text-sm font-medium text-foreground">
                    {incident.assignedVehicles.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Agencies</span>
                  <span className="text-sm font-medium text-foreground">
                    {incident.assignedAgencies.length}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No resources assigned yet</p>
            )}
            {incident.status === 'new' && (
              <Button onClick={onAssignResources} className="w-full mt-4">
                Assign Resources
              </Button>
            )}
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Actions</h2>
            <div className="space-y-2">
              {incident.status === 'new' && (
                <Button onClick={onAssignResources} className="w-full" variant="default">
                  Assign Resources
                </Button>
              )}
              {incident.status === 'assigned' && (
                <Button
                  onClick={() => onUpdateStatus('en_route')}
                  className="w-full"
                  variant="default"
                >
                  Mark En Route
                </Button>
              )}
              {incident.status === 'en_route' && (
                <Button
                  onClick={() => onUpdateStatus('on_site')}
                  className="w-full"
                  variant="default"
                >
                  Mark On Site
                </Button>
              )}
              {incident.status === 'on_site' && (
                <Button
                  onClick={() => onUpdateStatus('resolved')}
                  className="w-full"
                  variant="default"
                >
                  Mark Resolved
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
