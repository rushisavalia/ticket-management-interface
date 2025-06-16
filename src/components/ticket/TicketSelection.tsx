
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Ticket {
  id: string;
  product_name: string;
  vendor_id: string;
  tour_id: string;
  listing_type: 'new_listing' | 'multi_variant';
  status?: string;
}

interface TicketSelectionProps {
  tickets: Ticket[];
  onTicketSelect: (ticket: Ticket | null) => void;
}

const TicketSelection: React.FC<TicketSelectionProps> = ({ tickets, onTicketSelect }) => {
  return (
    <div>
      <Label htmlFor="ticket-select" className="text-base font-bold text-gray-900 mb-3 block">
        Ticket :
      </Label>
      <Select onValueChange={(value) => {
        const ticket = tickets.find(t => t.id === value);
        console.log('Selected ticket:', ticket);
        onTicketSelect(ticket || null);
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
  );
};

export default TicketSelection;
