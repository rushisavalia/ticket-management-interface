import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ApiErrorAlerts from './ticket/ApiErrorAlerts';
import TicketSelection from './ticket/TicketSelection';
import TicketInformation from './ticket/TicketInformation';
import ActionsSection from './ticket/ActionsSection';
import ContactInfoSection from './ticket/ContactInfoSection';
import CancellationPolicySection from './ticket/CancellationPolicySection';

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
      
      // First check if entry already exists
      const { data: existingEntry, error: checkError } = await supabase
        .from('vendor_tours')
        .select('id')
        .eq('vendor_id', selectedTicket.vendor_id)
        .eq('tour_id', selectedTicket.tour_id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing vendor tour:', checkError);
        throw checkError;
      }

      if (existingEntry) {
        console.log('Entry already exists in vendor_tours');
        setIsAddedToVendorTour(true);
        toast({
          title: "Entry Already Exists",
          description: "This vendor-tour combination already exists in the database",
          variant: "default"
        });
        return;
      }

      const { error } = await supabase
        .from('vendor_tours')
        .insert({
          id: vendorTourId,
          vendor_id: selectedTicket.vendor_id,
          tour_id: selectedTicket.tour_id
        });

      if (error) {
        console.error('Error adding to vendor tours:', error);
        throw error;
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
    
    let contactFound = false;
    let finalContact: Contact | null = null;
    let apiError = null;
    
    try {
      // First try to fetch from API
      console.log('Fetching contact data from API...');
      const response = await fetch(`${API_BASE_URL}/contact`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch contact from API`);
      
      const apiContacts = await response.json();
      console.log('Contact data from API:', apiContacts);
      
      // Enhanced matching logic - try multiple comparison methods
      let matchingContact = null;
      
      // Try exact string match first
      matchingContact = apiContacts.find((contact: any) => 
        String(contact.vendorId) === String(selectedTicket.vendor_id) && 
        String(contact.tourId) === String(selectedTicket.tour_id)
      );
      
      // If not found, try numeric comparison
      if (!matchingContact) {
        matchingContact = apiContacts.find((contact: any) => 
          Number(contact.vendorId) === Number(selectedTicket.vendor_id) && 
          Number(contact.tourId) === Number(selectedTicket.tour_id)
        );
      }
      
      // If still not found, try loose comparison
      if (!matchingContact) {
        matchingContact = apiContacts.find((contact: any) => 
          contact.vendorId == selectedTicket.vendor_id && 
          contact.tourId == selectedTicket.tour_id
        );
      }
      
      console.log('Found matching contact:', matchingContact);
      console.log('Available contacts in API:', apiContacts.map((c: any) => ({ 
        id: c.id, 
        vendorId: c.vendorId, 
        tourId: c.tourId,
        vendorIdType: typeof c.vendorId,
        tourIdType: typeof c.tourId
      })));
      console.log('Looking for:', { 
        vendorId: selectedTicket.vendor_id, 
        tourId: selectedTicket.tour_id,
        vendorIdType: typeof selectedTicket.vendor_id,
        tourIdType: typeof selectedTicket.tour_id
      });
      
      if (matchingContact) {
        const transformedContact = {
          id: String(matchingContact.id),
          vendor_id: String(matchingContact.vendorId),
          tour_id: String(matchingContact.tourId),
          email: matchingContact.email || '',
          phone: matchingContact.phone || ''
        };
        
        console.log('Transformed contact:', transformedContact);
        
        // Store in database with generated ID if needed
        const contactId = transformedContact.id.includes('contact_') ? 
          transformedContact.id : 
          `contact_${transformedContact.vendor_id}_${transformedContact.tour_id}_${Date.now()}`;
        
        const { error } = await supabase
          .from('contact')
          .upsert({
            id: contactId,
            vendor_id: transformedContact.vendor_id,
            tour_id: transformedContact.tour_id,
            email: transformedContact.email,
            phone: transformedContact.phone
          });
        
        if (error) {
          console.error('Error storing contact in database:', error);
        } else {
          finalContact = { ...transformedContact, id: contactId };
          contactFound = true;
        }
      }
      
    } catch (err) {
      console.error('Error fetching contact from API:', err);
      apiError = err;
    }
    
    // If not found in API, try database
    if (!contactFound) {
      try {
        const { data: contactData, error } = await supabase
          .from('contact')
          .select('*')
          .eq('vendor_id', String(selectedTicket.vendor_id))
          .eq('tour_id', String(selectedTicket.tour_id))
          .maybeSingle();

        if (contactData) {
          console.log('Found contact in database:', contactData);
          finalContact = contactData;
          contactFound = true;
        }
      } catch (dbError) {
        console.error('Error fetching from database:', dbError);
      }
    }
    
    // Only add API error if both API and database failed AND it's a real API error
    if (!contactFound && apiError) {
      addApiError('contact', 'Failed to fetch contact from API and database');
      // Create empty contact as fallback
      finalContact = {
        id: `contact_${selectedTicket.vendor_id}_${selectedTicket.tour_id}_${Date.now()}`,
        vendor_id: selectedTicket.vendor_id,
        tour_id: selectedTicket.tour_id,
        email: '',
        phone: ''
      };
    } else if (!contactFound) {
      // If no API error but still not found, create empty contact without showing error
      finalContact = {
        id: `contact_${selectedTicket.vendor_id}_${selectedTicket.tour_id}_${Date.now()}`,
        vendor_id: selectedTicket.vendor_id,
        tour_id: selectedTicket.tour_id,
        email: '',
        phone: ''
      };
    }
    
    setContact(finalContact);
    setShowContactInfo(true);
    setShowContactForm(false);
    updateLoadingState('fetchContact', false);
  };

  const fetchCancellationPolicy = async () => {
    if (!selectedTicket) return;

    updateLoadingState('fetchCancellation', true);
    console.log('Fetching cancellation policy for ticket:', selectedTicket.id);
    console.log('Looking for vendorId:', selectedTicket.vendor_id, 'tourId:', selectedTicket.tour_id);
    
    let policyFound = false;
    let finalPolicy: CancellationPolicy | null = null;
    let apiError = null;
    
    try {
      // First try to fetch from API
      console.log('Fetching cancellation policy data from API...');
      const response = await fetch(`${API_BASE_URL}/cancellationPolicy`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch cancellation policy from API`);
      
      const apiPolicies = await response.json();
      console.log('Policy data from API:', apiPolicies);
      
      // Enhanced matching logic - try multiple comparison methods
      let matchingPolicy = null;
      
      // Try exact string match first
      matchingPolicy = apiPolicies.find((policy: any) => 
        String(policy.vendorId) === String(selectedTicket.vendor_id) && 
        String(policy.tourId) === String(selectedTicket.tour_id)
      );
      
      // If not found, try numeric comparison
      if (!matchingPolicy) {
        matchingPolicy = apiPolicies.find((policy: any) => 
          Number(policy.vendorId) === Number(selectedTicket.vendor_id) && 
          Number(policy.tourId) === Number(selectedTicket.tour_id)
        );
      }
      
      // If still not found, try loose comparison
      if (!matchingPolicy) {
        matchingPolicy = apiPolicies.find((policy: any) => 
          policy.vendorId == selectedTicket.vendor_id && 
          policy.tourId == selectedTicket.tour_id
        );
      }
      
      console.log('Found matching policy:', matchingPolicy);
      console.log('Available policies in API:', apiPolicies.map((p: any) => ({ 
        id: p.id, 
        vendorId: p.vendorId, 
        tourId: p.tourId,
        vendorIdType: typeof p.vendorId,
        tourIdType: typeof p.tourId
      })));
      console.log('Looking for:', { 
        vendorId: selectedTicket.vendor_id, 
        tourId: selectedTicket.tour_id,
        vendorIdType: typeof selectedTicket.vendor_id,
        tourIdType: typeof selectedTicket.tour_id
      });
      
      if (matchingPolicy) {
        const transformedPolicy = {
          id: String(matchingPolicy.id),
          vendor_id: String(matchingPolicy.vendorId),
          tour_id: String(matchingPolicy.tourId),
          cancellation_before_minutes: matchingPolicy.cancellationBeforeMinutes || 0
        };
        
        console.log('Transformed policy:', transformedPolicy);
        
        // Store in database with generated ID if needed
        const policyId = transformedPolicy.id.includes('policy_') ? 
          transformedPolicy.id : 
          `policy_${transformedPolicy.vendor_id}_${transformedPolicy.tour_id}_${Date.now()}`;
        
        const { error } = await supabase
          .from('cancellation_policy')
          .upsert({
            id: policyId,
            vendor_id: transformedPolicy.vendor_id,
            tour_id: transformedPolicy.tour_id,
            cancellation_before_minutes: transformedPolicy.cancellation_before_minutes
          });
        
        if (error) {
          console.error('Error storing policy in database:', error);
        } else {
          finalPolicy = { ...transformedPolicy, id: policyId };
          policyFound = true;
        }
      }
      
    } catch (err) {
      console.error('Error fetching cancellation policy from API:', err);
      apiError = err;
    }
    
    // If not found in API, try database
    if (!policyFound) {
      try {
        const { data: policyData, error } = await supabase
          .from('cancellation_policy')
          .select('*')
          .eq('vendor_id', String(selectedTicket.vendor_id))
          .eq('tour_id', String(selectedTicket.tour_id))
          .maybeSingle();

        if (policyData) {
          console.log('Found policy in database:', policyData);
          finalPolicy = policyData;
          policyFound = true;
        }
      } catch (dbError) {
        console.error('Error fetching from database:', dbError);
      }
    }
    
    // Only add API error if both API and database failed AND it's a real API error
    if (!policyFound && apiError) {
      addApiError('cancellation', 'Failed to fetch cancellation policy from API and database');
      // Create empty policy as fallback
      finalPolicy = {
        id: `policy_${selectedTicket.vendor_id}_${selectedTicket.tour_id}_${Date.now()}`,
        vendor_id: selectedTicket.vendor_id,
        tour_id: selectedTicket.tour_id,
        cancellation_before_minutes: 0
      };
    } else if (!policyFound) {
      // If no API error but still not found, create empty policy without showing error
      finalPolicy = {
        id: `policy_${selectedTicket.vendor_id}_${selectedTicket.tour_id}_${Date.now()}`,
        vendor_id: selectedTicket.vendor_id,
        tour_id: selectedTicket.tour_id,
        cancellation_before_minutes: 0
      };
    }
    
    setCancellationPolicy(finalPolicy);
    setShowCancellationInfo(true);
    setShowCancellationForm(false);
    updateLoadingState('fetchCancellation', false);
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
      // First check if a contact already exists for this vendor_id and tour_id
      const { data: existingContact, error: checkError } = await supabase
        .from('contact')
        .select('id')
        .eq('vendor_id', editingContact.vendor_id)
        .eq('tour_id', editingContact.tour_id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing contact:', checkError);
        throw checkError;
      }

      let result;

      if (existingContact) {
        // Update existing contact
        console.log('Updating existing contact with id:', existingContact.id);
        result = await supabase
          .from('contact')
          .update({
            email: editingContact.email,
            phone: editingContact.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContact.id)
          .select()
          .single();
      } else {
        // Insert new contact
        const newContactId = `contact_${editingContact.vendor_id}_${editingContact.tour_id}_${Date.now()}`;
        console.log('Inserting new contact with id:', newContactId);
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

      if (result.error) {
        console.error('Error saving contact:', result.error);
        throw result.error;
      }

      console.log('Contact saved successfully:', result.data);
      
      // Update the main contact state with the saved data
      setContact(result.data);
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
      // First check if a policy already exists for this vendor_id and tour_id
      const { data: existingPolicy, error: checkError } = await supabase
        .from('cancellation_policy')
        .select('id')
        .eq('vendor_id', editingCancellationPolicy.vendor_id)
        .eq('tour_id', editingCancellationPolicy.tour_id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing policy:', checkError);
        throw checkError;
      }

      let result;

      if (existingPolicy) {
        // Update existing policy
        console.log('Updating existing policy with id:', existingPolicy.id);
        result = await supabase
          .from('cancellation_policy')
          .update({
            cancellation_before_minutes: editingCancellationPolicy.cancellation_before_minutes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPolicy.id)
          .select()
          .single();
      } else {
        // Insert new policy
        const newPolicyId = `policy_${editingCancellationPolicy.vendor_id}_${editingCancellationPolicy.tour_id}_${Date.now()}`;
        console.log('Inserting new policy with id:', newPolicyId);
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

      if (result.error) {
        console.error('Error saving policy:', result.error);
        throw result.error;
      }

      console.log('Policy saved successfully:', result.data);
      
      // Update the main policy state with the saved data
      setCancellationPolicy(result.data);
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

  const handleTicketSelect = (ticket: Ticket | null) => {
    setSelectedTicket(ticket);
    setContact(null);
    setCancellationPolicy(null);
    setEditingContact(null);
    setEditingCancellationPolicy(null);
    setIsAddedToVendorTour(false);
    setShowContactInfo(false);
    setShowCancellationInfo(false);
    setShowContactForm(false);
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
        <ApiErrorAlerts 
          apiErrors={apiErrors}
          onRetry={retryApiCall}
          onDismiss={removeApiError}
        />

        {/* Main Content Card */}
        <Card className="bg-[#FFFFFE] shadow-lg">
          <CardContent className="p-8 space-y-8">
            {/* Ticket Selection */}
            <TicketSelection 
              tickets={tickets}
              onTicketSelect={handleTicketSelect}
            />

            {/* Ticket Information */}
            {selectedTicket && (
              <TicketInformation 
                selectedTicket={selectedTicket}
                selectedVendor={selectedVendor}
                selectedTour={selectedTour}
              />
            )}

            {/* Actions */}
            {selectedTicket && (
              <ActionsSection 
                selectedTicket={selectedTicket}
                isAddedToVendorTour={isAddedToVendorTour}
                loadingStates={loadingStates}
                onAddToVendorTour={addToVendorTour}
                onFetchContactInfo={fetchContactInfo}
                onFetchCancellationPolicy={fetchCancellationPolicy}
              />
            )}

            {/* Contact Info Section */}
            <ContactInfoSection 
              showContactInfo={showContactInfo}
              showContactForm={showContactForm}
              contact={contact}
              editingContact={editingContact}
              loadingStates={loadingStates}
              onUpdate={handleContactUpdate}
              onSubmit={updateContact}
              onCancel={cancelContactEdit}
              onContactChange={setEditingContact}
            />

            {/* Cancellation Policy Section */}
            <CancellationPolicySection 
              showCancellationInfo={showCancellationInfo}
              showCancellationForm={showCancellationForm}
              cancellationPolicy={cancellationPolicy}
              editingCancellationPolicy={editingCancellationPolicy}
              loadingStates={loadingStates}
              onUpdate={handleCancellationUpdate}
              onSubmit={updateCancellationPolicy}
              onCancel={cancelCancellationEdit}
              onPolicyChange={setEditingCancellationPolicy}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketDashboard;
