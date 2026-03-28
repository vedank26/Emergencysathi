import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, CheckCheck, AlertTriangle, Truck, CheckCircle2, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'new_incident' | 'high_severity' | 'assignment_completed' | 'status_update';
  title: string;
  message: string;
  incidentId?: string;
  read: boolean;
  timestamp: Date;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const notificationIcons = {
  new_incident: Info,
  high_severity: AlertTriangle,
  assignment_completed: Truck,
  status_update: CheckCircle2,
};

const notificationColors = {
  new_incident: 'bg-info/10 text-info border-info/20',
  high_severity: 'bg-destructive/10 text-destructive border-destructive/20',
  assignment_completed: 'bg-success/10 text-success border-success/20',
  status_update: 'bg-primary/10 text-primary border-primary/20',
};

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNotificationClick,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  const Icon = Bell;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Icon className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                onMarkAllRead();
              }}
              className="h-8 text-xs"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => {
                const NotificationIcon = notificationIcons[notification.type];
                const isUnread = !notification.read;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 cursor-pointer transition-colors hover:bg-secondary/50',
                      isUnread && 'bg-primary/5'
                    )}
                    onClick={() => {
                      if (!notification.read) {
                        onMarkRead(notification.id);
                      }
                      onNotificationClick?.(notification);
                    }}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0',
                          notificationColors[notification.type]
                        )}
                      >
                        <NotificationIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-foreground">{notification.title}</h4>
                          {isUnread && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={e => {
                                e.stopPropagation();
                                onMarkRead(notification.id);
                              }}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', notificationColors[notification.type])}
                          >
                            {notification.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
