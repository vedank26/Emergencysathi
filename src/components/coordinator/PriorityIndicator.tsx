import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface PriorityIndicatorProps {
  priority: number;
  reportedAt: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

const SLA_THRESHOLDS = {
  critical: 15, // minutes
  high: 30,
  medium: 60,
  low: 120,
};

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({
  priority,
  reportedAt,
  severity,
  className,
}) => {
  const minutesSinceReport = Math.floor((Date.now() - reportedAt.getTime()) / (1000 * 60));
  const slaThreshold = SLA_THRESHOLDS[severity];
  const timeRemaining = Math.max(0, slaThreshold - minutesSinceReport);
  const isEscalating = timeRemaining < slaThreshold * 0.3 && timeRemaining > 0;
  const isOverdue = timeRemaining === 0;

  const getPriorityColor = () => {
    if (priority >= 80) return 'bg-destructive/10 text-destructive border-destructive/30';
    if (priority >= 60) return 'bg-warning/10 text-warning border-warning/30';
    return 'bg-info/10 text-info border-info/30';
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge variant="outline" className={cn('font-bold', getPriorityColor())}>
        P{priority}
      </Badge>
      {isOverdue && (
        <Badge variant="destructive" className="animate-pulse">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      )}
      {isEscalating && !isOverdue && (
        <Badge variant="destructive" className="animate-pulse">
          <Clock className="w-3 h-3 mr-1" />
          {timeRemaining}m remaining
        </Badge>
      )}
    </div>
  );
};
