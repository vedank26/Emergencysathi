import React from 'react';
import { IncidentStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: IncidentStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<IncidentStatus, { label: string; className: string }> = {
  new: {
    label: 'New',
    className: 'bg-muted text-muted-foreground border-muted-foreground/20',
  },
  assigned: {
    label: 'Assigned',
    className: 'bg-info/20 text-info border-info/30',
  },
  en_route: {
    label: 'En Route',
    className: 'bg-warning/20 text-warning border-warning/30',
  },
  on_site: {
    label: 'On Site',
    className: 'bg-primary/20 text-primary border-primary/30',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-success/20 text-success border-success/30',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, size = 'md' }) => {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium capitalize',
        config.className,
        sizeClasses[size],
        className
      )}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  );
};
