
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  name: string;
  vendorId: string;
  tourId: string;
  listingType: 'new_listing' | 'multi_variant';
  status: string;
}

interface Vendor {
  id: string;
  name: string;
}

interface Tour {
  id: string;
  name: string;
  vendorId: string;
}

interface Contact {
  id: string;
  vendorId: string;
  tourId: string;
  email: string;
  phone: string;
  address: string;
}

interface CancellationPolicy {
  id: string;
  vendorId: string;
  tourId: string;
  policy: string;
  refundPercentage: number;
  cancellationWindow: number;
}

const API_BASE = 'https://my-json-server.typicode.com/neelbakshi94/test-plc';

const TicketDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [contact, setContact] = useState<Contact | null>(null);
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddedToVendorTour, setIsAddedToVendorTour] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [ticketsRes, vendorsRes, toursRes] = await Promise.all([
        fetch(`${API_BASE}/tickets`),
        fetch(`${API_BASE}/vendors`),
        fetch(`${API_BASE}/tours`)
      ]);

      if (!ticketsRes.ok || !vendorsRes.ok || !toursRes.ok) {
        throw new Error('Failed to fetch initial data');
      }

      const [ticketsData, vendorsData, toursData] = await Promise.all([
        ticketsRes.json(),
        vendorsRes.json(),
        toursRes.json()
      ]);

      setTickets(ticketsData);
      setVendors(vendorsData);
      setTours(toursData);
      setError(null);
    } catch (err) {
      setError('Failed to load initial data');
      console.error('Error fetching initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContactAndPolicy = async () => {
    if (!selectedTicket) return;

    setIsLoading(true);
    try {
      const [contactRes, policyRes] = await Promise.all([
        fetch(`${API_BASE}/contact`),
        fetch(`${API_BASE}/cancellationPolicy`)
      ]);

      if (!contactRes.ok || !policyRes.ok) {
        throw new Error('Failed to fetch contact and policy data');
      }

      const [contactData, policyData] = await Promise.all([
        contactRes.json(),
        policyRes.json()
      ]);

      // Find matching contact and policy by vendorId and tourId
      const matchingContact = contactData.find((c: Contact) => 
        c.vendorId === selectedTicket.vendorId && c.tourId === selectedTicket.tourId
      );
      const matchingPolicy = policyData.find((p: CancellationPolicy) => 
        p.vendorId === selectedTicket.vendorId && p.tourId === selectedTicket.tourId
      );

      setContact(matchingContact || {
        id: '',
        vendorId: selectedTicket.vendorId,
        tourId: selectedTicket.tourId,
        email: '',
        phone: '',
        address: ''
      });
      setCancellationPolicy(matchingPolicy || {
        id: '',
        vendorId: selectedTicket.vendorId,
        tourId: selectedTicket.tourId,
        policy: '',
        refundPercentage: 0,
        cancellationWindow: 24
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch contact and cancellation policy');
      console.error('Error fetching contact and policy:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToVendorTour = async () => {
    if (!selectedTicket) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/vendorTours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId: selectedTicket.vendorId,
          tourId: selectedTicket.tourId,
          addedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to vendor tours');
      }

      setIsAddedToVendorTour(true);
      setError(null);
      toast({
        title: "Success",
        description: "Added to vendor tours successfully",
      });
    } catch (err) {
      setError('Failed to add to vendor tours');
      console.error('Error adding to vendor tours:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateContact = async () => {
    if (!contact || !selectedTicket) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/contact/${contact.id || 'new'}`, {
        method: contact.id ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
      });

      if (!response.ok) {
        throw new Error('Failed to update contact');
      }

      setError(null);
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    } catch (err) {
      setError('Failed to update contact');
      console.error('Error updating contact:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCancellationPolicy = async () => {
    if (!cancellationPolicy || !selectedTicket) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/cancellationPolicy/${cancellationPolicy.id || 'new'}`, {
        method: cancellationPolicy.id ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cancellationPolicy),
      });

      if (!response.ok) {
        throw new Error('Failed to update cancellation policy');
      }

      setError(null);
      toast({
        title: "Success",
        description: "Cancellation policy updated successfully",
      });
    } catch (err) {
      setError('Failed to update cancellation policy');
      console.error('Error updating cancellation policy:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedVendor = vendors.find(v => v.id === selectedTicket?.vendorId);
  const selectedTour = tours.find(t => t.id === selectedTicket?.tourId);

  const retryLastOperation = () => {
    setError(null);
    if (!selectedTicket) {
      fetchInitialData();
    } else {
      fetchContactAndPolicy();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Error Section */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={retryLastOperation}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Ticket Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Select onValueChange={(value) => {
                  const ticket = tickets.find(t => t.id === value);
                  setSelectedTicket(ticket || null);
                  setContact(null);
                  setCancellationPolicy(null);
                  setIsAddedToVendorTour(false);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a ticket" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTickets.map((ticket) => (
                      <SelectItem key={ticket.id} value={ticket.id}>
                        {ticket.name} - {ticket.listingType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Info */}
        {selectedTicket && (
          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Name:</strong> {selectedTicket.name}</div>
              <div><strong>Vendor:</strong> {selectedVendor?.name || 'Unknown'}</div>
              <div><strong>Tour:</strong> {selectedTour?.name || 'Unknown'}</div>
              <div><strong>Listing Type:</strong> {selectedTicket.listingType}</div>
              <div><strong>Status:</strong> {selectedTicket.status}</div>
            </CardContent>
          </Card>
        )}

        {/* Actions Section */}
        {selectedTicket && (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTicket.listingType === 'multi_variant' && !isAddedToVendorTour && (
                <Button
                  onClick={addToVendorTour}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Adding...' : 'Add to VendorTour'}
                </Button>
              )}

              {(selectedTicket.listingType === 'new_listing' || 
                (selectedTicket.listingType === 'multi_variant' && isAddedToVendorTour)) && (
                <Button
                  onClick={fetchContactAndPolicy}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? 'Fetching...' : 'Fetch Contact & Cancellation Data'}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contact Form */}
        {contact && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={contact.email}
                  onChange={(e) => setContact({...contact, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={contact.phone}
                  onChange={(e) => setContact({...contact, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={contact.address}
                  onChange={(e) => setContact({...contact, address: e.target.value})}
                />
              </div>
              <Button onClick={updateContact} disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Contact'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Cancellation Policy Form */}
        {cancellationPolicy && (
          <Card>
            <CardHeader>
              <CardTitle>Cancellation Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="policy">Policy</Label>
                <Input
                  id="policy"
                  value={cancellationPolicy.policy}
                  onChange={(e) => setCancellationPolicy({...cancellationPolicy, policy: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="refundPercentage">Refund Percentage</Label>
                <Input
                  id="refundPercentage"
                  type="number"
                  value={cancellationPolicy.refundPercentage}
                  onChange={(e) => setCancellationPolicy({...cancellationPolicy, refundPercentage: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="cancellationWindow">Cancellation Window (hours)</Label>
                <Input
                  id="cancellationWindow"
                  type="number"
                  value={cancellationPolicy.cancellationWindow}
                  onChange={(e) => setCancellationPolicy({...cancellationPolicy, cancellationWindow: Number(e.target.value)})}
                />
              </div>
              <Button onClick={updateCancellationPolicy} disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Cancellation Policy'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TicketDashboard;
