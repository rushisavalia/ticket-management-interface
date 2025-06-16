
import React from 'react';
import { Label } from '@/components/ui/label';

interface Ticket {
  id: string;
  product_name: string;
  vendor_id: string;
  tour_id: string;
  listing_type: 'new_listing' | 'multi_variant';
  status?: string;
}

interface Vendor {
  id: string;
  name: string;
}

interface Tour {
  id: string;
  name: string;
  location?: string;
  vendor_id?: string;
}

interface TicketInformationProps {
  selectedTicket: Ticket;
  selectedVendor?: Vendor;
  selectedTour?: Tour;
}

const TicketInformation: React.FC<TicketInformationProps> = ({ 
  selectedTicket, 
  selectedVendor, 
  selectedTour 
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
        Ticket Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white/70 rounded-lg p-4 backdrop-blur-sm">
            <Label className="text-sm font-bold text-gray-600 uppercase tracking-wide">Product Name</Label>
            <p className="text-lg font-semibold text-gray-900 mt-2">{selectedTicket.product_name}</p>
          </div>
          <div className="bg-white/70 rounded-lg p-4 backdrop-blur-sm">
            <Label className="text-sm font-bold text-gray-600 uppercase tracking-wide">Vendor</Label>
            <p className="text-lg font-semibold text-gray-900 mt-2">{selectedVendor?.name || 'N/A'}</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white/70 rounded-lg p-4 backdrop-blur-sm">
            <Label className="text-sm font-bold text-gray-600 uppercase tracking-wide">Tour</Label>
            <p className="text-lg font-semibold text-gray-900 mt-2">{selectedTour?.name || 'N/A'}</p>
          </div>
          <div className="bg-white/70 rounded-lg p-4 backdrop-blur-sm">
            <Label className="text-sm font-bold text-gray-600 uppercase tracking-wide">Listing Type</Label>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                selectedTicket.listing_type === 'new_listing' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {selectedTicket.listing_type.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketInformation;
