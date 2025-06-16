
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Contact {
  id: string;
  vendor_id: string;
  tour_id: string;
  email: string;
  phone: string;
}

interface LoadingStates {
  addToVendorTour: boolean;
  fetchContact: boolean;
  fetchCancellation: boolean;
  updateContact: boolean;
  updateCancellation: boolean;
}

interface ContactInfoSectionProps {
  showContactInfo: boolean;
  showContactForm: boolean;
  contact: Contact | null;
  editingContact: Contact | null;
  loadingStates: LoadingStates;
  onUpdate: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  onContactChange: (contact: Contact) => void;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  showContactInfo,
  showContactForm,
  contact,
  editingContact,
  loadingStates,
  onUpdate,
  onSubmit,
  onCancel,
  onContactChange
}) => {
  if (!showContactInfo || !contact) return null;

  return (
    <div className="border-t pt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
        {!showContactForm && (
          <Button
            onClick={onUpdate}
            className="bg-[#F5F0E5] hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
          >
            Update
          </Button>
        )}
      </div>
      
      {!showContactForm && (
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <Label className="text-sm font-semibold text-gray-600">Phone</Label>
            <p className="text-sm font-medium text-gray-900 mt-1">{contact.phone || 'Not available'}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-600">Email</Label>
            <p className="text-sm font-medium text-gray-900 mt-1">{contact.email || 'Not available'}</p>
          </div>
        </div>
      )}

      {showContactForm && editingContact && (
        <div className="bg-[#E4FFF6] rounded-lg p-6 border border-gray-200">
          <h4 className="text-base font-bold text-gray-900 mb-4">Edit Contact Information</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone</Label>
              <Input
                id="phone"
                value={editingContact.phone}
                onChange={(e) => onContactChange({...editingContact, phone: e.target.value})}
                className="mt-1 max-w-md bg-[#FFFFFE]"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={editingContact.email}
                onChange={(e) => onContactChange({...editingContact, email: e.target.value})}
                className="mt-1 max-w-md bg-[#FFFFFE]"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={onSubmit}
              disabled={loadingStates.updateContact}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {loadingStates.updateContact ? 'Submitting...' : 'Submit'}
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

export default ContactInfoSection;
