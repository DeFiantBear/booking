import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { addHours, format, isAfter, isBefore, parseISO, startOfDay } from 'date-fns'
import { PRICING, BUSINESS_HOURS, TIME_SLOTS } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateSessionPrice(adults: number, children: number, duration: number): number {
  const adultCost = adults * PRICING.adultPerHour * duration;
  const childCost = children * PRICING.childPerHour * duration;
  return adultCost + childCost;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(price);
}

export function formatTime(time: string): string {
  return format(parseISO(`2000-01-01T${time}`), 'h:mm a');
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'EEEE, MMMM do, yyyy');
}

export function isBusinessOpen(date: Date): boolean {
  const dayOfWeek = format(date, 'EEEE').toLowerCase();
  return BUSINESS_HOURS.daysOpen.includes(dayOfWeek);
}

export function getAvailableTimeSlots(date: Date, duration: number): string[] {
  if (!isBusinessOpen(date)) return [];
  
  const availableSlots: string[] = [];
  
  for (let i = 0; i < TIME_SLOTS.length; i++) {
    const startTime = TIME_SLOTS[i];
    const startDateTime = parseISO(`${format(date, 'yyyy-MM-dd')}T${startTime}`);
    const endDateTime = addHours(startDateTime, duration);
    
    // Check if the session ends before closing time
    const closeDateTime = parseISO(`${format(date, 'yyyy-MM-dd')}T${BUSINESS_HOURS.close}`);
    
    if (isBefore(endDateTime, closeDateTime) || endDateTime.getTime() === closeDateTime.getTime()) {
      availableSlots.push(startTime);
    }
  }
  
  return availableSlots;
}

export function isDateInPast(date: string): boolean {
  return isBefore(parseISO(date), startOfDay(new Date()));
}

export function isDateTooFarInFuture(date: string): boolean {
  const maxDate = addHours(new Date(), 24 * 30); // 30 days from now
  return isAfter(parseISO(date), maxDate);
}

export function validateBookingTime(date: string, startTime: string, duration: number): boolean {
  const bookingDateTime = parseISO(`${date}T${startTime}`);
  const now = new Date();
  const minBookingTime = addHours(now, 2); // 2 hours notice
  
  return isAfter(bookingDateTime, minBookingTime);
}

// Generate a UUID for Supabase compatibility
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateBookingId(): string {
  return `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Remove all non-digit characters except + at the start
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // UK phone number patterns
  const ukPatterns = [
    /^07\d{9}$/,           // Mobile: 07123456789
    /^01\d{8,9}$/,         // Landline: 01234567890 or 0123456789
    /^02\d{8,9}$/,         // Landline: 02012345678 or 0201234567
    /^03\d{8,9}$/,         // Landline: 03001234567
    /^0800\d{6,7}$/,       // Freephone: 0800123456
    /^0845\d{6,7}$/,       // Local rate: 0845123456
    /^\+447\d{9}$/,        // International mobile: +447123456789
    /^\+441\d{9,10}$/,     // International landline: +441234567890
  ];
  
  return ukPatterns.some(pattern => pattern.test(cleaned));
} 