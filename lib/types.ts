export interface User {
  id: string;
  farcasterId?: string;
  email?: string;
  name: string;
  phone?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bookingId?: string;
}

export interface BookingSession {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentMethod: 'stripe' | 'usdc';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface PartyPackage {
  id: string;
  name: 'silver' | 'gold' | 'platinum';
  price: number;
  duration: number; // 2.5 hours
  maxGuests: number;
  description: string;
  includes: string[];
}

export interface BookingParty {
  id: string;
  userId: string;
  packageId: string;
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentMethod: 'stripe' | 'usdc';
  paymentStatus: 'pending' | 'paid' | 'failed';
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pricing {
  adultPerHour: number; // £15
  childPerHour: number; // £10
  partyPackages: {
    silver: number; // £150
    gold: number; // £200
    platinum: number; // £250
  };
}

export interface BusinessHours {
  open: string; // "12:00"
  close: string; // "22:00"
  daysOpen: string[]; // ["monday", "tuesday", etc.]
}

export interface BookingFormData {
  date: string;
  startTime: string;
  duration: number;
  adults: number;
  children: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
}

export interface PartyBookingFormData {
  packageId: string;
  date: string;
  startTime: string;
  guestCount: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
} 