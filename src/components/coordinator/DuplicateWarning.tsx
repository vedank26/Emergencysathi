import React from 'react';
import { AlertTriangle, GitMerge, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Incident } from '@/types';
import { DuplicateGroup } from '@/utils/duplicateDetection';
import { cn } from '@/lib/utils';

interface DuplicateWarningProps {
  incident: Incident;
  duplicateGroup?: DuplicateGroup;
  onMerge?: (incidentIds: string[]) => void;
  onMarkDuplicate?: (incidentId: string) => void;
}

export const DuplicateWarning: React.FC<DuplicateWarningProps> = ({
  incident,
  duplicateGroup,
  onMerge,
  onMarkDuplicate,
}) => {
  const [showMergeDialog, setShowMergeDialog] = React.useState(false);
  const [showMarkDialog, setShowMarkDialog] = React.useState(false);

  if (!duplicateGroup) return null;

  const otherIncidents = duplicateGroup.incidents.filter(inc => inc.id !== incident.id);

  const handleMerge = () => {
    onMerge?.(duplicateGroup.incidents.map(inc => inc.id));
    setShowMergeDialog(false);
  };

  const handleMarkDuplicate = () => {
    onMarkDuplicate?.(incident.id);
    setShowMarkDialog(false);
  };

  return (
    <>
      <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 mb-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-warning">Possible Duplicate</p>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  duplicateGroup.confidence === 'high'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : duplicateGroup.confidence === 'medium'
                    ? 'bg-warning/10 text-warning border-warning/20'
                    : 'bg-muted text-muted-foreground border-muted-foreground/20'
                )}
              >
                {duplicateGroup.confidence} confidence
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {otherIncidents.length} similar incident{otherIncidents.length !== 1 ? 's' : ''} found. {duplicateGroup.reason}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMergeDialog(true)}
                className="h-7 text-xs"
              >
                <GitMerge className="w-3 h-3 mr-1" />
                Merge
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMarkDialog(true)}
                className="h-7 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Mark Duplicate
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge Incidents</AlertDialogTitle>
            <AlertDialogDescription>
              This will merge {otherIncidents.length} incident{otherIncidents.length !== 1 ? 's' : ''} into this one. 
              All assigned resources will be combined. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMerge}>Merge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showMarkDialog} onOpenChange={setShowMarkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Duplicate</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this incident as it's a duplicate. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkDuplicate}>Mark Duplicate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
