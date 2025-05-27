import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
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

interface ApiError {
  type: 'tickets' | 'vendors' | 'tours' | 'contact' | 'cancellation';
  message: string;
  timestamp: number;
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
  const [apiErrors, setApiErrors] = useState<ApiError[]>([]);
  const [isAddedToVendorTour, setIsAddedToVendorTour] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showCancellationInfo, setShowCancellationInfo] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showCancellationForm, setShowCancellationForm] = useState(false);
  const { toast } = useToast();

  const API_BASE_URL = 'https://my-json-server.typicode.com/neelbakshi94/test-plc';

  const updateLoadingState = (key: keyof typeof loadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  const addApiError = (type: ApiError['type'], message: string) => {
    const newError: ApiError = {
      type,
      message,
      timestamp: Date.now()
    };
    setApiErrors(prev => [...prev, newError]);
  };

  const removeApiError = (timestamp: number) => {
    setApiErrors(prev => prev.filter(error => error.timestamp !== timestamp));
  };

  const retryApiCall = async (type: ApiError['type'], timestamp: number) => {
    removeApiError(timestamp);
    
    try {
      switch (type) {
        case 'tickets':
          await fetchTicketsFromApi();
          break;
        case 'vendors':
          await fetchVendorsFromApi();
          break;
        case 'tours':
          await fetchToursFromApi();
          break;
        case 'contact':
          if (selectedTicket) await fetchContactInfo();
          break;
        case 'cancellation':
          if (selectedTicket) await fetchCancellationPolicy();
          break;
      }
    } catch (error) {
      console.error(`Retry failed for ${type}:`, error);
    }
  };

  const fetchTicketsFromApi = async () => {
    try {
      console.log('Fetching tickets from API...');
      const response = await fetch(`${API_BASE_URL}/tickets`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch tickets from API`);
      
      const apiTickets = await response.json();
      console.log('Fetched tickets from API:', apiTickets);
      
      // Transform API data to match our database structure
      const transformedTickets = apiTickets.map((ticket: any) => ({
        id: ticket.id.toString(),
        product_name: ticket.productName,
        vendor_id: ticket.vendorId.toString(),
        tour_id: ticket.tourId.toString(),
        listing_type: ticket.listingType as 'new_listing' | 'multi_variant'
      }));
      
      // Store in database
      for (const ticket of transformedTickets) {
        await supabase
          .from('tickets')
          .upsert({
            id: ticket.id,
            product_name: ticket.product_name,
            vendor_id: ticket.vendor_id,
            tour_id: ticket.tour_id,
            listing_type: ticket.listing_type
          });
      }
      
      setTickets(transformedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      addApiError('tickets', error instanceof Error ? error.message : 'Failed to fetch tickets from API');
      
      // Fallback to database data
      const { data: dbTickets } = await supabase.from('tickets').select('*');
      if (dbTickets) {
        const typedTickets: Ticket[] = dbTickets.map(ticket => ({
          ...ticket,
          listing_type: ticket.listing_type as 'new_listing' | 'multi_variant'
        }));
        setTickets(typedTickets);
      }
    }
  };

  const fetchVendorsFromApi = async () => {
    try {
      console.log('Fetching vendors from API...');
      const response = await fetch(`${API_BASE_URL}/vendors`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch vendors from API`);
      
      const apiVendors = await response.json();
      console.log('Fetched vendors from API:', apiVendors);
      
      // Transform API data to match our database structure
      const transformedVendors = apiVendors.map((vendor: any) => ({
        id: vendor.id.toString(),
        name: vendor.name
      }));
      
      // Store in database
      for (const vendor of transformedVendors) {
        await supabase
          .from('vendors')
          .upsert({
            id: vendor.id,
            name: vendor.name
          });
      }
      
      setVendors(transformedVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      addApiError('vendors', error instanceof Error ? error.message : 'Failed to fetch vendors from API');
      
      // Fallback to database data
      const { data: dbVendors } = await supabase.from('vendors').select('*');
      if (dbVendors) setVendors(dbVendors);
    }
  };

  const fetchToursFromApi = async () => {
    try {
      console.log('Fetching tours from API...');
      const response = await fetch(`${API_BASE_URL}/tours`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch tours from API`);
      
      const apiTours = await response.json();
      console.log('Fetched tours from API:', apiTours);
      
      // Transform API data to match our database structure
      const transformedTours = apiTours.map((tour: any) => ({
        id: tour.id.toString(),
        name: tour.name,
        location: tour.location
      }));
      
      // Store in database
      for (const tour of transformedTours) {
        await supabase
          .from('tours')
          .upsert({
            id: tour.id,
            name: tour.name,
            location: tour.location
          });
      }
      
      setTours(transformedTours);
    } catch (error) {
      console.error('Error fetching tours:', error);
      addApiError('tours', error instanceof Error ? error.message : 'Failed to fetch tours from API');
      
      // Fallback to database data
      const { data: dbTours } = await supabase.from('tours').select('*');
      if (dbTours) setTours(dbTours);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    console.log('Starting to fetch initial data from API...');
    
    try {
      await Promise.all([
        fetchTicketsFromApi(),
        fetchVendorsFromApi(),
        fetchToursFromApi()
      ]);
    } catch (error) {
      console.error('Error in fetchInitialData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToVendorTour = async () => {
    if (!selectedTicket) return;

    updateLoadingState('addToVendorTour', true);
    console.log('Adding to vendor tour:', selectedTicket.vendor_id, selectedTicket.tour_id);
    try {
      // Generate a unique ID for the vendor_tours entry
      const vendorTourId = `${selectedTicket.vendor_id}_${selectedTicket.tour_id}`;
      
      const { error } = await supabase
        .from('vendor_tours')
        .insert({
          id: vendorTourId,
          vendor_id: selectedTicket.vendor_id,
          tour_id: selectedTicket.tour_id
        });

      if (error) {
        // If it's a unique constraint violation, treat as success
        if (error.code === '23505') {
          console.log('Entry already exists in vendor_tours');
        } else {
          console.error('Error adding to vendor tours:', error);
          throw error;
        }
      }

      setIsAddedToVendorTour(true);
      toast({
        title: "Success",
        description: "Added to vendor tours successfully",
      });
    } catch (err) {
      console.error('Error adding to vendor tours:', err);
      toast({
        title: "Error",
        description: "Failed to add to vendor tours",
        variant: "destructive"
      });
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
      // First try to fetch from API
      console.log('Fetching contact data from API...');
      const response = await fetch(`${API_BASE_URL}/contact`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch contact from API`);
      
      const apiContacts = await response.json();
      console.log('Contact data from API:', apiContacts);
      
      // Find matching contact
      const matchingContact = apiContacts.find((contact: any) => 
        contact.vendorId.toString() === selectedTicket.vendor_id && 
        contact.tourId.toString() === selectedTicket.tour_id
      );
      
      console.log('Found matching contact:', matchingContact);
      
      if (matchingContact) {
        const transformedContact = {
          id: matchingContact.id.toString(),
          vendor_id: matchingContact.vendorId.toString(),
          tour_id: matchingContact.tourId.toString(),
          email: matchingContact.email || '',
          phone: matchingContact.phone || ''
        };
        
        console.log('Transformed contact:', transformedContact);
        
        // Store in database
        const { error } = await supabase
          .from('contact')
          .upsert(transformedContact);
        
        if (error) {
          console.error('Error storing contact in database:', error);
          throw error;
        }
        
        setContact(transformedContact);
      } else {
        console.log('No matching contact found, creating empty contact');
        // Create empty contact for this vendor/tour combination
        const emptyContact = {
          id: `contact_${selectedTicket.vendor_id}_${selectedTicket.tour_id}`,
          vendor_id: selectedTicket.vendor_id,
          tour_id: selectedTicket.tour_id,
          email: '',
          phone: ''
        };
        setContact(emptyContact);
      }
      
      setShowContactInfo(true);
      setShowContactForm(false);
    } catch (err) {
      console.error('Error fetching contact:', err);
      addApiError('contact', err instanceof Error ? err.message : 'Failed to fetch contact from API');
      
      // Fallback to database
      const { data: contactData, error } = await supabase
        .from('contact')
        .select('*')
        .eq('vendor_id', selectedTicket.vendor_id)
        .eq('tour_id', selectedTicket.tour_id)
        .maybeSingle();

      if (contactData) {
        setContact(contactData);
      } else {
        const emptyContact = {
          id: `contact_${selectedTicket.vendor_id}_${selectedTicket.tour_id}`,
          vendor_id: selectedTicket.vendor_id,
          tour_id: selectedTicket.tour_id,
          email: '',
          phone: ''
        };
        setContact(emptyContact);
      }
      
      setShowContactInfo(true);
      setShowContactForm(false);
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
      // First try to fetch from API
      console.log('Fetching cancellation policy data from API...');
      const response = await fetch(`${API_BASE_URL}/cancellationPolicy`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch cancellation policy from API`);
      
      const apiPolicies = await response.json();
      console.log('Policy data from API:', apiPolicies);
      
      // Find matching policy
      const matchingPolicy = apiPolicies.find((policy: any) => 
        policy.vendorId.toString() === selectedTicket.vendor_id && 
        policy.tourId.toString() === selectedTicket.tour_id
      );
      
      console.log('Found matching policy:', matchingPolicy);
      
      if (matchingPolicy) {
        const transformedPolicy = {
          id: matchingPolicy.id.toString(),
          vendor_id: matchingPolicy.vendorId.toString(),
          tour_id: matchingPolicy.tourId.toString(),
          cancellation_before_minutes: matchingPolicy.cancellationBeforeMinutes || 0
        };
        
        console.log('Transformed policy:', transformedPolicy);
        
        // Store in database
        const { error } = await supabase
          .from('cancellation_policy')
          .upsert(transformedPolicy);
        
        if (error) {
          console.error('Error storing policy in database:', error);
          throw error;
        }
        
        setCancellationPolicy(transformedPolicy);
      } else {
        console.log('No matching policy found, creating empty policy');
        // Create empty policy for this vendor/tour combination
        const emptyPolicy = {
          id: `policy_${selectedTicket.vendor_id}_${selectedTicket.tour_id}`,
          vendor_id: selectedTicket.vendor_id,
          tour_id: selectedTicket.tour_id,
          cancellation_before_minutes: 0
        };
        setCancellationPolicy(emptyPolicy);
      }
      
      setShowCancellationInfo(true);
      setShowCancellationForm(false);
    } catch (err) {
      console.error('Error fetching cancellation policy:', err);
      addApiError('cancellation', err instanceof Error ? err.message : 'Failed to fetch cancellation policy from API');
      
      // Fallback to database
      const { data: policyData, error } = await supabase
        .from('cancellation_policy')
        .select('*')
        .eq('vendor_id', selectedTicket.vendor_id)
        .eq('tour_id', selectedTicket.tour_id)
        .maybeSingle();

      if (policyData) {
        setCancellationPolicy(policyData);
      } else {
        const emptyPolicy = {
          id: `policy_${selectedTicket.vendor_id}_${selectedTicket.tour_id}`,
          vendor_id: selectedTicket.vendor_id,
          tour_id: selectedTicket.tour_id,
          cancellation_before_minutes: 0
        };
        setCancellationPolicy(emptyPolicy);
      }
      
      setShowCancellationInfo(true);
      setShowCancellationForm(false);
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
      
      if (editingContact.id && !editingContact.id.startsWith('contact_')) {
        // Update existing contact from API
        result = await supabase
          .from('contact')
          .update({
            email: editingContact.email,
            phone: editingContact.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingContact.id);
      } else {
        // Insert new contact with generated ID
        const newContactId = editingContact.id.startsWith('contact_') ? editingContact.id : `contact_${selectedTicket.vendor_id}_${selectedTicket.tour_id}_${Date.now()}`;
        result = await supabase
          .from('contact')
          .insert({
            id: newContactId,
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
      setShowContactForm(false);
      setEditingContact(null);
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    } catch (err) {
      console.error('Error updating contact:', err);
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive"
      });
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
      
      if (editingCancellationPolicy.id && !editingCancellationPolicy.id.startsWith('policy_')) {
        // Update existing policy from API
        result = await supabase
          .from('cancellation_policy')
          .update({
            cancellation_before_minutes: editingCancellationPolicy.cancellation_before_minutes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCancellationPolicy.id);
      } else {
        // Insert new policy with generated ID
        const newPolicyId = editingCancellationPolicy.id.startsWith('policy_') ? editingCancellationPolicy.id : `policy_${selectedTicket.vendor_id}_${selectedTicket.tour_id}_${Date.now()}`;
        result = await supabase
          .from('cancellation_policy')
          .insert({
            id: newPolicyId,
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
      setShowCancellationForm(false);
      setEditingCancellationPolicy(null);
      toast({
        title: "Success",
        description: "Cancellation policy updated successfully",
      });
    } catch (err) {
      console.error('Error updating cancellation policy:', err);
      toast({
        title: "Error",
        description: "Failed to update cancellation policy",
        variant: "destructive"
      });
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

  return (
    <div className="min-h-screen bg-[#E4FFF6] font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <div className="bg-[#FFFFFE] border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Headout</h1>
          <div className="bg-[#F5F0E5] px-4 py-2 rounded-md">
            <span className="text-sm font-semibold text-gray-700">Dashboard</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* API Error Alerts */}
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
                  onClick={() => retryApiCall(error.type, error.timestamp)}
                  className="bg-[#F5F0E5] border-gray-300 hover:bg-gray-100"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeApiError(error.timestamp)}
                  className="bg-[#F5F0E5] border-gray-300 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}

        {/* Main Content Card */}
        <Card className="bg-[#FFFFFE] shadow-lg">
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
                <SelectTrigger className="max-w-md bg-[#FFFFFE]">
                  <SelectValue placeholder="Select a ticket" />
                </SelectTrigger>
                <SelectContent className="bg-[#FFFFFE]">
                  {tickets.map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id}>
                      {ticket.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                      className="bg-[#F5F0E5] hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
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
                        className="bg-[#F5F0E5] hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
                      >
                        {loadingStates.fetchContact ? 'Fetching...' : 'Fetch Contact Info'}
                      </Button>
                      <Button
                        onClick={fetchCancellationPolicy}
                        disabled={loadingStates.fetchCancellation}
                        className="bg-[#F5F0E5] hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
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

                {/* Contact Edit Form */}
                {showContactForm && editingContact && (
                  <div className="bg-[#E4FFF6] rounded-lg p-6 border border-gray-200">
                    <h4 className="text-base font-bold text-gray-900 mb-4">Edit Contact Information</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone</Label>
                        <Input
                          id="phone"
                          value={editingContact.phone}
                          onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
                          className="mt-1 max-w-md bg-[#FFFFFE]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editingContact.email}
                          onChange={(e) => setEditingContact({...editingContact, email: e.target.value})}
                          className="mt-1 max-w-md bg-[#FFFFFE]"
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
                        className="bg-[#F5F0E5] hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
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

                {/* Cancellation Policy Edit Form */}
                {showCancellationForm && editingCancellationPolicy && (
                  <div className="bg-[#E4FFF6] rounded-lg p-6 border border-gray-200">
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
                        className="mt-1 max-w-md bg-[#FFFFFE]"
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
                        className="bg-[#F5F0E5] hover:bg-gray-200 text-gray-900 font-semibold border border-gray-300"
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
