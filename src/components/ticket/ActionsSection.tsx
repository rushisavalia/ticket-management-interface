
import React from 'react';
import { Button } from '@/components/ui/button';

interface Ticket {
  id: string;
  product_name: string;
  vendor_id: string;
  tour_id: string;
  listing_type: 'new_listing' | 'multi_variant';
  status?: string;
}

interface LoadingStates {
  addToVendorTour: boolean;
  fetchContact: boolean;
  fetchCancellation: boolean;
  updateContact: boolean;
  updateCancellation: boolean;
}

interface ActionsSectionProps {
  selectedTicket: Ticket;
  isAddedToVendorTour: boolean;
  loadingStates: LoadingStates;
  onAddToVendorTour: () => void;
  onFetchContactInfo: () => void;
  onFetchCancellationPolicy: () => void;
}

const ActionsSection: React.FC<ActionsSectionProps> = ({
  selectedTicket,
  isAddedToVendorTour,
  loadingStates,
  onAddToVendorTour,
  onFetchContactInfo,
  onFetchCancellationPolicy
}) => {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
      <div className="flex gap-3">
        {selectedTicket.listing_type === 'multi_variant' && !isAddedToVendorTour && (
          <Button
            onClick={onAddToVendorTour}
            disabled={loadingStates.addToVendorTour}
            className="bg-[#F5F0E5] hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
          >
            {loadingStates.addToVendorTour ? 'Adding...' : 'Add to Vendor Tours'}
          </Button>
        )}

        {(selectedTicket.listing_type === 'new_listing' || 
          (selectedTicket.listing_type === 'multi_variant' && isAddedToVendorTour)) && (
          <>
            <Button
              onClick={onFetchContactInfo}
              disabled={loadingStates.fetchContact}
              className="bg-[#F5F0E5] hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
            >
              {loadingStates.fetchContact ? 'Fetching...' : 'Fetch Contact Info'}
            </Button>
            <Button
              onClick={onFetchCancellationPolicy}
              disabled={loadingStates.fetchCancellation}
              className="bg-[#F5F0E5] hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
            >
              {loadingStates.fetchCancellation ? 'Fetching...' : 'Fetch Cancellation Policy'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ActionsSection;
