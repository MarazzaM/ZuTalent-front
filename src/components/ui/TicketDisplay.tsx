import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Ticket {
  id: string;
  name: string;
  imageUrl: string;
}

interface TicketDisplayProps {
  tickets: Ticket[];
}

const TicketDisplay: React.FC<TicketDisplayProps> = ({ tickets }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tickets.map((ticket) => (
        <motion.div
          key={ticket.id}
          className="bg-gradient-to-br from-primarydark to-accentdark rounded-2xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-4">
            <Image
              src={ticket.imageUrl}
              alt={ticket.name}
              width={64}
              height={64}
              className="rounded-full"
            />
            <div>
              <h3 className="text-xl font-semibold text-zupass">{ticket.name}</h3>
              <p className="text-sm text-zupass opacity-75">Ticket ID: {ticket.id}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TicketDisplay;