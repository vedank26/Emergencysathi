import React from 'react';
import { AlertTriangle, Search, Filter, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  type: 'no_incidents' | 'no_results' | 'loading' | 'error';
  title?: string;
  message?: string;
  className?: string;
}

const emptyStateConfig = {
  no_incidents: {
    icon: Inbox,
    defaultTitle: 'No Incidents',
    defaultMessage: 'There are no incidents to display at this time.',
  },
  no_results: {
    icon: Search,
    defaultTitle: 'No Results Found',
    defaultMessage: 'Try adjusting your filters or search query.',
  },
  loading: {
    icon: AlertTriangle,
    defaultTitle: 'Loading...',
    defaultMessage: 'Please wait while we load the data.',
  },
  error: {
    icon: AlertTriangle,
    defaultTitle: 'Error',
    defaultMessage: 'Something went wrong. Please try again.',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  message,
  className,
}) => {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {message || config.defaultMessage}
      </p>
    </div>
  );
};
