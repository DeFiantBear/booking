import { Pricing, BusinessHours, PartyPackage } from './types';

export const PRICING: Pricing = {
  adultPerHour: 15,
  childPerHour: 10,
  partyPackages: {
    silver: 150,
    gold: 200,
    platinum: 250,
  },
};

export const BUSINESS_HOURS: BusinessHours = {
  open: '12:00',
  close: '22:00',
  daysOpen: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
};

export const PARTY_PACKAGES: PartyPackage[] = [
  {
    id: 'silver',
    name: 'silver',
    price: 15, // £15 per head
    duration: 2.5, // 2 hours + 15 min buffer each side
    maxGuests: 10,
    description: 'SILVER GAMING PARTY - Perfect for small groups and birthday parties',
    includes: [
      '£15 per head',
      'Max 10 players',
      '2 hours play time with 15 min buffer either side',
      'Consoles only',
      'Cake and candles',
      'Drinks included',
    ],
  },
  {
    id: 'gold',
    name: 'gold',
    price: 20, // £20 per head
    duration: 2.5, // 2 hours + 15 min buffer each side
    maxGuests: 10,
    description: 'GOLD GAMING PARTY - Enhanced experience with VR gaming',
    includes: [
      '£20 per head',
      'Max 10 players',
      '2 hours play time with 15 min buffer either side',
      'Consoles and VR gaming',
      'Cake and candles',
      'Drinks included',
    ],
  },
  {
    id: 'platinum',
    name: 'platinum',
    price: 25, // £25 per head
    duration: 2.5, // 2 hours + 15 min buffer either side
    maxGuests: 10,
    description: 'PLATINUM GAMING PARTY - Ultimate gaming party experience',
    includes: [
      '£25 per head',
      'Max 10 players',
      '2 hours play time with 15 min buffer either side',
      'Consoles and VR gaming',
      'Cake and candles',
      'Drinks included',
      'Party bags',
      'Balloons',
      'Party snacks included',
    ],
  },
];

export const MAX_SESSION_DURATION = 6; // hours
export const MAX_PARTY_GUESTS = 5;
export const MIN_BOOKING_NOTICE = 2; // hours in advance
export const MAX_BOOKING_ADVANCE = 30; // days in advance

export const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', 
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
];

export const AVAILABLE_DURATIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]; // hours 

// Payment methods
export const PAYMENT_METHODS = [
  { id: 'stripe', name: 'Card Payment', icon: '💳' },
  { id: 'usdc', name: 'USDC (Crypto)', icon: '₿' },
  { id: 'cash', name: 'Pay at Venue', icon: '💵' }
] as const 