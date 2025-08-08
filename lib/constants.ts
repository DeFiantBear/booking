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
    duration: 2.5, // 2 hours + 30 min buffer each side
    maxGuests: 10,
    description: '🎮 SILVER GAMING PARTY – £15 per head',
    includes: [
      'Max 10 players | 2 hours of game time + 15 min setup & wind-down buffer',
      'Get the party started with two full hours of non-stop console gaming fun!',
      'Ideal for younger gamers or casual play sessions.',
      'Includes:',
      '• Console access',
      '• Drinks, cake & candles to celebrate in style',
      'Perfect for birthdays or special occasions without breaking the bank!',
    ],
  },
  {
    id: 'gold',
    name: 'gold',
    price: 20, // £20 per head
    duration: 2.5, // 2 hours + 30 min buffer each side
    maxGuests: 10,
    description: '⚔️ GOLD GAMING PARTY – £20 per head',
    includes: [
      'Max 10 players | 2 hours of game time + 15 min setup & wind-down buffer',
      'Level up your celebration with console and VR gaming for a next-gen experience!',
      'Perfect for kids, teens — and yes, grown-up gamers too.',
      'Whether it\'s a birthday, stag, hen, or just a get-together, there\'s loads of fun to be had.',
      'Includes:',
      '• Console + VR gaming',
      '• Drinks, cake & candles',
      'Step into the virtual world and make it a party to remember!',
    ],
  },
  {
    id: 'platinum',
    name: 'platinum',
    price: 25, // £25 per head
    duration: 2.5, // 2 hours + 30 min buffer each side
    maxGuests: 10,
    description: '🏆 PLATINUM GAMING PARTY – £25 per head',
    includes: [
      'Max 10 players | 2 hours of game time + 15 min setup & wind-down buffer',
      'Go all out with the ultimate gaming celebration!',
      'Packed with extras, this is our premium package for serious party vibes.',
      'Includes:',
      '• Console + VR gaming',
      '• Drinks, cake & candles',
      '• Party bags, balloons & snacks',
      'The full VIP treatment for your gaming crew!',
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
  // { id: 'usdc', name: 'USDC (Crypto)', icon: '₿' }, // Temporarily hidden - will be re-enabled later
  { id: 'cash', name: 'Pay at Venue', icon: '💵' }
] as const 