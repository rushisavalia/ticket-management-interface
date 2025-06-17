
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ApiError {
  type: 'tickets' | 'vendors' | 'tours' | 'contact' | 'cancellation';
  message: string;
  timestamp: number;
}

interface ApiErrorAlertsProps {
  apiErrors: ApiError[];
  onRetry: (type: ApiError['type'], timestamp: number) => void;
  onDismiss: (timestamp: number) => void;
}

const ApiErrorAlerts: React.FC<ApiErrorAlertsProps> = ({ apiErrors, onRetry, onDismiss }) => {
  return (
    <>
      {apiErrors.map((error) => (
        <Alert key={error.timestamp} variant="destructive" className="mb-4 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between w-full">
            <div className="flex-1">
              <span className="font-semibold capitalize">{error.type} API Error:</span> {error.message}
            </div>
            <div className="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRetry(error.type, error.timestamp)}
                className="bg-[#F5F0E5] border-gray-300 hover:bg-gray-100"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDismiss(error.timestamp)}
                className="bg-[#F5F0E5] border-gray-300 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </>
  );
};

export default ApiErrorAlerts;
