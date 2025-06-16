
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CancellationPolicy {
  id: string;
  vendor_id: string;
  tour_id: string;
  cancellation_before_minutes: number;
}

interface LoadingStates {
  addToVendorTour: boolean;
  fetchContact: boolean;
  fetchCancellation: boolean;
  updateContact: boolean;
  updateCancellation: boolean;
}

interface CancellationPolicySectionProps {
  showCancellationInfo: boolean;
  showCancellationForm: boolean;
  cancellationPolicy: CancellationPolicy | null;
  editingCancellationPolicy: CancellationPolicy | null;
  loadingStates: LoadingStates;
  onUpdate: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  onPolicyChange: (policy: CancellationPolicy) => void;
}

const CancellationPolicySection: React.FC<CancellationPolicySectionProps> = ({
  showCancellationInfo,
  showCancellationForm,
  cancellationPolicy,
  editingCancellationPolicy,
  loadingStates,
  onUpdate,
  onSubmit,
  onCancel,
  onPolicyChange
}) => {
  if (!showCancellationInfo || !cancellationPolicy) return null;

  return (
    <div className="border-t pt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Cancellation Policy</h3>
        {!showCancellationForm && (
          <Button
            onClick={onUpdate}
            className="bg-[#F5F0E5] hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
          >
            Update
          </Button>
        )}
      </div>
      
      {!showCancellationForm && (
        <div className="mb-6">
          <Label className="text-sm font-semibold text-gray-600">Cancellation Before Minutes</Label>
          <p className="text-sm font-medium text-gray-900 mt-1">
            {cancellationPolicy.cancellation_before_minutes ? 
              `${cancellationPolicy.cancellation_before_minutes} minutes` : 
              'Not available'
            }
          </p>
        </div>
      )}

      {showCancellationForm && editingCancellationPolicy && (
        <div className="bg-[#E4FFF6] rounded-lg p-6 border border-gray-200">
          <h4 className="text-base font-bold text-gray-900 mb-4">Edit Cancellation Policy</h4>
          <div>
            <Label htmlFor="cancellationPolicy" className="text-sm font-semibold text-gray-700">Cancellation Before Minutes</Label>
            <Input
              id="cancellationPolicy"
              type="number"
              value={editingCancellationPolicy.cancellation_before_minutes}
              onChange={(e) => onPolicyChange({
                ...editingCancellationPolicy, 
                cancellation_before_minutes: Number(e.target.value)
              })}
              className="mt-1 max-w-md bg-[#FFFFFE]"
              placeholder="Minutes before cancellation"
            />
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={onSubmit}
              disabled={loadingStates.updateCancellation}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {loadingStates.updateCancellation ? 'Submitting...' : 'Submit'}
            </Button>
            <Button 
              onClick={onCancel}
              className="bg-[#F5F0E5] hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancellationPolicySection;
