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
    price: 15, // Price per person
    duration: 2.5,
    maxGuests: 10,
    description: 'Perfect for small groups and birthday parties',
    includes: [
      '2.5 hours of VR gaming',
      'Up to 10 guests',
      'Basic refreshments',
      'Party decorations',
      'Game selection assistance',
    ],
  },
  {
    id: 'gold',
    name: 'gold',
    price: 20, // Price per person
    duration: 2.5,
    maxGuests: 10,
    description: 'Enhanced experience with premium features',
    includes: [
      '2.5 hours of VR gaming',
      'Up to 10 guests',
      'Premium refreshments',
      'Enhanced party decorations',
      'Dedicated game master',
      'Priority game selection',
    ],
  },
  {
    id: 'platinum',
    name: 'platinum',
    price: 25, // Price per person
    duration: 2.5,
    maxGuests: 10,
    description: 'Ultimate VR party experience',
    includes: [
      '2.5 hours of VR gaming',
      'Up to 10 guests',
      'Premium refreshments & snacks',
      'Full party decorations',
      'Dedicated game master',
      'Priority game selection',
      'Party photos & videos',
      'Custom party playlist',
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