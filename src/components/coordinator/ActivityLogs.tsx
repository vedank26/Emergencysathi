import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Eye, Users, CheckCircle2, GitMerge, XCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityLog {
  id: string;
  incidentId: string;
  action: 'viewed' | 'assigned' | 'updated_status' | 'merged' | 'marked_duplicate';
  coordinatorName: string;
  timestamp: Date;
  details?: string;
}

interface ActivityLogsProps {
  logs: ActivityLog[];
  incidentId?: string;
  className?: string;
}

const actionIcons = {
  viewed: Eye,
  assigned: Users,
  updated_status: CheckCircle2,
  merged: GitMerge,
  marked_duplicate: XCircle,
};

const actionLabels = {
  viewed: 'Viewed',
  assigned: 'Assigned Resources',
  updated_status: 'Updated Status',
  merged: 'Merged Incidents',
  marked_duplicate: 'Marked as Duplicate',
};

export const ActivityLogs: React.FC<ActivityLogsProps> = ({ logs, incidentId, className }) => {
  const filteredLogs = incidentId
    ? logs.filter(log => log.incidentId === incidentId)
    : logs;

  if (filteredLogs.length === 0) {
    return (
      <Card className={cn('p-6', className)}>
        <h2 className="text-lg font-bold text-foreground mb-4">Activity Log</h2>
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No activity recorded</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-6', className)}>
      <h2 className="text-lg font-bold text-foreground mb-4">Activity Log</h2>
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {filteredLogs.map((log, index) => {
            const ActionIcon = actionIcons[log.action];
            const isLast = index === filteredLogs.length - 1;

            return (
              <div key={log.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <ActionIcon className="w-5 h-5 text-primary" />
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 my-2 bg-border" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">{actionLabels[log.action]}</h3>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    by {log.coordinatorName}
                  </p>
                  {log.details && (
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(log.timestamp, 'PPp')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
};
