
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface Contact {
  id: string;
  vendor_id: string;
  tour_id: string;
  email: string;
  phone: string;
}

interface CancellationPolicy {
  id: string;
  vendor_id: string;
  tour_id: string;
  cancellation_before_minutes: number;
}

const TicketDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy | null>(null);
  
  // Form state for editing - these maintain original values until submit
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingCancellationPolicy, setEditingCancellationPolicy] = useState<CancellationPolicy | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    addToVendorTour: false,
    fetchContact: false,
    fetchCancellation: false,
    updateContact: false,
    updateCancellation: false
  });
  const [error, setError] = useState<string | null>(null);
  const [isAddedToVendorTour, setIsAddedToVendorTour] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showCancellationInfo, setShowCancellationInfo] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showCancellationForm, setShowCancellationForm] = useState(false);
  const { toast } = useToast();

  const updateLoadingState = (key: keyof typeof loadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    console.log('Starting to fetch initial data from Supabase...');
    try {
      const [ticketsRes, vendorsRes, toursRes] = await Promise.all([
        supabase.from('tickets').select('*'),
        supabase.from('vendors').select('*'),
        supabase.from('tours').select('*')
      ]);

      if (ticketsRes.error) throw ticketsRes.error;
      if (vendorsRes.error) throw vendorsRes.error;
      if (toursRes.error) throw toursRes.error;

      console.log('Fetched tickets:', ticketsRes.data);
      console.log('Fetched vendors:', vendorsRes.data);
      console.log('Fetched tours:', toursRes.data);

      // Type the tickets data properly
      const typedTickets: Ticket[] = (ticketsRes.data || []).map(ticket => ({
        ...ticket,
        listing_type: ticket.listing_type as 'new_listing' | 'multi_variant'
      }));

      setTickets(typedTickets);
      setVendors(vendorsRes.data || []);
      setTours(toursRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load initial data');
    } finally {
      setIsLoading(false);
    }
  };

  const addToVendorTour = async () => {
    if (!selectedTicket) return;

    updateLoadingState('addToVendorTour', true);
    console.log('Adding to vendor tour:', selectedTicket.vendor_id, selectedTicket.tour_id);
    try {
      const { error } = await supabase
        .from('vendor_tours')
        .insert({
          vendor_id: selectedTicket.vendor_id,
          tour_id: selectedTicket.tour_id
        });

      if (error) {
        // If it's a unique constraint violation, treat as success
        if (error.code === '23505') {
          console.log('Entry already exists in vendor_tours');
        } else {
          throw error;
        }
      }

      setIsAddedToVendorTour(true);
      setError(null);
      toast({
        title: "Success",
        description: "Added to vendor tours successfully",
      });
    } catch (err) {
      console.error('Error adding to vendor tours:', err);
      setError('Failed to add to vendor tours');
    } finally {
      updateLoadingState('addToVendorTour', false);
    }
  };

  const fetchContactInfo = async () => {
    if (!selectedTicket) return;

    updateLoadingState('fetchContact', true);
    console.log('Fetching contact info for ticket:', selectedTicket.id);
    console.log('Looking for vendorId:', selectedTicket.vendor_id, 'tourId:', selectedTicket.tour_id);
    try {
      const { data: contactData, error } = await supabase
        .from('contact')
        .select('*')
        .eq('vendor_id', selectedTicket.vendor_id)
        .eq('tour_id', selectedTicket.tour_id)
        .maybeSingle();

      if (error) throw error;

      console.log('Contact data from Supabase:', contactData);

      if (contactData) {
        setContact(contactData);
      } else {
        // Create empty contact for this vendor/tour combination
        const emptyContact = {
          id: '',
          vendor_id: selectedTicket.vendor_id,
          tour_id: selectedTicket.tour_id,
          email: '',
          phone: ''
        };
        setContact(emptyContact);
        console.log('No matching contact found, created empty contact:', emptyContact);
      }
      
      setShowContactInfo(true);
      setShowContactForm(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching contact:', err);
      setError('Failed to fetch contact information');
    } finally {
      updateLoadingState('fetchContact', false);
    }
  };

  const fetchCancellationPolicy = async () => {
    if (!selectedTicket) return;

    updateLoadingState('fetchCancellation', true);
    console.log('Fetching cancellation policy for ticket:', selectedTicket.id);
    console.log('Looking for vendorId:', selectedTicket.vendor_id, 'tourId:', selectedTicket.tour_id);
    try {
      const { data: policyData, error } = await supabase
        .from('cancellation_policy')
        .select('*')
        .eq('vendor_id', selectedTicket.vendor_id)
        .eq('tour_id', selectedTicket.tour_id)
        .maybeSingle();

      if (error) throw error;

      console.log('Policy data from Supabase:', policyData);

      if (policyData) {
        setCancellationPolicy(policyData);
      } else {
        // Create empty policy for this vendor/tour combination
        const emptyPolicy = {
          id: '',
          vendor_id: selectedTicket.vendor_id,
          tour_id: selectedTicket.tour_id,
          cancellation_before_minutes: 0
        };
        setCancellationPolicy(emptyPolicy);
        console.log('No matching policy found, created empty policy:', emptyPolicy);
      }
      
      setShowCancellationInfo(true);
      setShowCancellationForm(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching cancellation policy:', err);
      setError('Failed to fetch cancellation policy');
    } finally {
      updateLoadingState('fetchCancellation', false);
    }
  };

  const handleContactUpdate = () => {
    if (!contact) return;
    // Create a copy for editing
    setEditingContact({ ...contact });
    setShowContactForm(true);
  };

  const handleCancellationUpdate = () => {
    if (!cancellationPolicy) return;
    // Create a copy for editing
    setEditingCancellationPolicy({ ...cancellationPolicy });
    setShowCancellationForm(true);
  };

  const updateContact = async () => {
    if (!editingContact || !selectedTicket) return;

    updateLoadingState('updateContact', true);
    console.log('Updating contact in Supabase:', editingContact);
    try {
      let result;
      
      if (editingContact.id) {
        // Update existing contact
        result = await supabase
          .from('contact')
          .update({
            email: editingContact.email,
            phone: editingContact.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingContact.id);
      } else {
        // Insert new contact
        result = await supabase
          .from('contact')
          .insert({
            vendor_id: editingContact.vendor_id,
            tour_id: editingContact.tour_id,
            email: editingContact.email,
            phone: editingContact.phone
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Update the main contact state with the edited values
      setContact({ ...editingContact });
      setError(null);
      setShowContactForm(false);
      setEditingContact(null);
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    } catch (err) {
      console.error('Error updating contact:', err);
      setError('Failed to update contact');
    } finally {
      updateLoadingState('updateContact', false);
    }
  };

  const updateCancellationPolicy = async () => {
    if (!editingCancellationPolicy || !selectedTicket) return;

    updateLoadingState('updateCancellation', true);
    console.log('Updating cancellation policy in Supabase:', editingCancellationPolicy);
    try {
      let result;
      
      if (editingCancellationPolicy.id) {
        // Update existing policy
        result = await supabase
          .from('cancellation_policy')
          .update({
            cancellation_before_minutes: editingCancellationPolicy.cancellation_before_minutes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCancellationPolicy.id);
      } else {
        // Insert new policy
        result = await supabase
          .from('cancellation_policy')
          .insert({
            vendor_id: editingCancellationPolicy.vendor_id,
            tour_id: editingCancellationPolicy.tour_id,
            cancellation_before_minutes: editingCancellationPolicy.cancellation_before_minutes
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Update the main policy state with the edited values
      setCancellationPolicy({ ...editingCancellationPolicy });
      setError(null);
      setShowCancellationForm(false);
      setEditingCancellationPolicy(null);
      toast({
        title: "Success",
        description: "Cancellation policy updated successfully",
      });
    } catch (err) {
      console.error('Error updating cancellation policy:', err);
      setError('Failed to update cancellation policy');
    } finally {
      updateLoadingState('updateCancellation', false);
    }
  };

  const cancelContactEdit = () => {
    setEditingContact(null);
    setShowContactForm(false);
  };

  const cancelCancellationEdit = () => {
    setEditingCancellationPolicy(null);
    setShowCancellationForm(false);
  };

  const selectedVendor = vendors.find(v => v.id === selectedTicket?.vendor_id);
  const selectedTour = tours.find(t => t.id === selectedTicket?.tour_id);

  const retryLastOperation = () => {
    setError(null);
    if (!selectedTicket) {
      fetchInitialData();
    }
  };

  return (
    <div className="min-h-screen bg-custom-bg font-jakarta">
      {/* Header */}
      <div className="bg-custom-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Headout</h1>
          <div className="bg-custom-button px-4 py-2 rounded-md">
            <span className="text-sm font-semibold text-gray-700">Dashboard</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Error Section */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={retryLastOperation}
                className="ml-4 bg-custom-button border-gray-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Card */}
        <Card className="bg-custom-white shadow-lg">
          <CardContent className="p-8 space-y-8">
            {/* Ticket Selection */}
            <div>
              <Label htmlFor="ticket-select" className="text-base font-bold text-gray-900 mb-3 block">
                Ticket :
              </Label>
              <Select onValueChange={(value) => {
                const ticket = tickets.find(t => t.id === value);
                console.log('Selected ticket:', ticket);
                setSelectedTicket(ticket || null);
                setContact(null);
                setCancellationPolicy(null);
                setEditingContact(null);
                setEditingCancellationPolicy(null);
                setIsAddedToVendorTour(false);
                setShowContactInfo(false);
                setShowCancellationInfo(false);
                setShowContactForm(false);
                setShowCancellationForm(false);
              }}>
                <SelectTrigger className="max-w-md bg-custom-white">
                  <SelectValue placeholder="Select a ticket" />
                </SelectTrigger>
                <SelectContent className="bg-custom-white">
                  {tickets.map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id}>
                      {ticket.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ticket Info - Enhanced UI */}
            {selectedTicket && (
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
            )}

            {/* Actions */}
            {selectedTicket && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
                <div className="flex gap-3">
                  {selectedTicket.listing_type === 'multi_variant' && !isAddedToVendorTour && (
                    <Button
                      onClick={addToVendorTour}
                      disabled={loadingStates.addToVendorTour}
                      className="bg-custom-button hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
                    >
                      {loadingStates.addToVendorTour ? 'Adding...' : 'Add to Vendor Tours'}
                    </Button>
                  )}

                  {(selectedTicket.listing_type === 'new_listing' || 
                    (selectedTicket.listing_type === 'multi_variant' && isAddedToVendorTour)) && (
                    <>
                      <Button
                        onClick={fetchContactInfo}
                        disabled={loadingStates.fetchContact}
                        className="bg-custom-button hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
                      >
                        {loadingStates.fetchContact ? 'Fetching...' : 'Fetch Contact Info'}
                      </Button>
                      <Button
                        onClick={fetchCancellationPolicy}
                        disabled={loadingStates.fetchCancellation}
                        className="bg-custom-button hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
                      >
                        {loadingStates.fetchCancellation ? 'Fetching...' : 'Fetch Cancellation Policy'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Contact Info Section */}
            {showContactInfo && contact && (
              <div className="border-t pt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
                  {!showContactForm && (
                    <Button
                      onClick={handleContactUpdate}
                      className="bg-custom-button hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
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

                {/* Contact Edit Form */}
                {showContactForm && editingContact && (
                  <div className="bg-custom-bg rounded-lg p-6 border border-gray-200">
                    <h4 className="text-base font-bold text-gray-900 mb-4">Edit Contact Information</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone</Label>
                        <Input
                          id="phone"
                          value={editingContact.phone}
                          onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
                          className="mt-1 max-w-md bg-custom-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editingContact.email}
                          onChange={(e) => setEditingContact({...editingContact, email: e.target.value})}
                          className="mt-1 max-w-md bg-custom-white"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <Button 
                        onClick={updateContact}
                        disabled={loadingStates.updateContact}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                      >
                        {loadingStates.updateContact ? 'Submitting...' : 'Submit'}
                      </Button>
                      <Button 
                        onClick={cancelContactEdit}
                        className="bg-custom-button hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cancellation Policy Section */}
            {showCancellationInfo && cancellationPolicy && (
              <div className="border-t pt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Cancellation Policy</h3>
                  {!showCancellationForm && (
                    <Button
                      onClick={handleCancellationUpdate}
                      className="bg-custom-button hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
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

                {/* Cancellation Policy Edit Form */}
                {showCancellationForm && editingCancellationPolicy && (
                  <div className="bg-custom-bg rounded-lg p-6 border border-gray-200">
                    <h4 className="text-base font-bold text-gray-900 mb-4">Edit Cancellation Policy</h4>
                    <div>
                      <Label htmlFor="cancellationPolicy" className="text-sm font-semibold text-gray-700">Cancellation Before Minutes</Label>
                      <Input
                        id="cancellationPolicy"
                        type="number"
                        value={editingCancellationPolicy.cancellation_before_minutes}
                        onChange={(e) => setEditingCancellationPolicy({
                          ...editingCancellationPolicy, 
                          cancellation_before_minutes: Number(e.target.value)
                        })}
                        className="mt-1 max-w-md bg-custom-white"
                        placeholder="Minutes before cancellation"
                      />
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <Button 
                        onClick={updateCancellationPolicy}
                        disabled={loadingStates.updateCancellation}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                      >
                        {loadingStates.updateCancellation ? 'Submitting...' : 'Submit'}
                      </Button>
                      <Button 
                        onClick={cancelCancellationEdit}
                        className="bg-custom-button hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketDashboard;
