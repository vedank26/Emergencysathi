import React from 'react';
import { IncidentSeverity } from '@/types';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface SeverityChipProps {
  severity: IncidentSeverity;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const severityConfig: Record<IncidentSeverity, { label: string; className: string; color: string }> = {
  critical: {
    label: 'Critical',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
    color: 'bg-destructive',
  },
  high: {
    label: 'High',
    className: 'bg-warning/10 text-warning border-warning/30',
    color: 'bg-warning',
  },
  medium: {
    label: 'Medium',
    className: 'bg-info/10 text-info border-info/30',
    color: 'bg-info',
  },
  low: {
    label: 'Low',
    className: 'bg-success/10 text-success border-success/30',
    color: 'bg-success',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const SeverityChip: React.FC<SeverityChipProps> = ({ 
  severity, 
  className, 
  showIcon = false,
  size = 'md' 
}) => {
  const config = severityConfig[severity];
  
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium capitalize',
        config.className,
        sizeClasses[size],
        className
      )}
      aria-label={`Severity: ${config.label}`}
    >
      {showIcon && <AlertTriangle className="w-3 h-3" />}
      <span>{config.label}</span>
      <span className={cn('w-2 h-2 rounded-full', config.color)} aria-hidden="true" />
    </div>
  );
};
