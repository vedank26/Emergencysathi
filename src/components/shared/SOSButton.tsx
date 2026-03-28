import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SOSButtonProps {
  size?: 'default' | 'large';
  className?: string;
}

const SOSButton: React.FC<SOSButtonProps> = ({ size = 'default', className = '' }) => {
  const [isActivated, setIsActivated] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSOS = () => {
    setIsActivated(true);
    setShowConfirmation(true);
    
    // Simulate getting GPS location and sending alert
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        console.log('SOS Location:', position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.log('Location error:', error);
      }
    );
  };

  return (
    <>
      <Button
        variant="emergency"
        size={size === 'large' ? 'sos' : 'xl'}
        className={`relative ${className}`}
        onClick={handleSOS}
      >
        {/* Ping effect */}
        <span className="absolute inset-0 rounded-full bg-emergency animate-ping-slow opacity-75" />
        
        <span className="relative flex items-center gap-2">
          <AlertTriangle className={size === 'large' ? 'w-8 h-8' : 'w-5 h-5'} />
          <span className={size === 'large' ? 'text-2xl' : ''}>SOS</span>
        </span>
      </Button>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <Phone className="w-4 h-4 text-success" />
              </div>
              Emergency Alert Sent!
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Your location has been shared with emergency services. Help is on the way.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 p-4 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm text-foreground font-medium mb-2">What happens next:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5" />
                Emergency services have been notified
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5" />
                Nearest available units are being dispatched
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5" />
                You can track help on your map
              </li>
            </ul>
          </div>
          
          <Button 
            className="mt-4 w-full" 
            onClick={() => setShowConfirmation(false)}
          >
            View Status
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SOSButton;
