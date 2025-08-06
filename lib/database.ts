import fs from 'fs'
import path from 'path'
import { Booking } from './types'

const BOOKINGS_FILE = path.join(process.cwd(), 'data', 'bookings.json')

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(BOOKINGS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load all bookings from file
export const loadBookings = (): Booking[] => {
  try {
    ensureDataDir()
    if (!fs.existsSync(BOOKINGS_FILE)) {
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2))
      return []
    }
    const data = fs.readFileSync(BOOKINGS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading bookings:', error)
    return []
  }
}

// Save all bookings to file
export const saveBookings = (bookings: Booking[]): void => {
  try {
    ensureDataDir()
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
  } catch (error) {
    console.error('Error saving bookings:', error)
    throw new Error('Failed to save booking')
  }
}

// Add a new booking
export const addBooking = (booking: Booking): Booking => {
  const bookings = loadBookings()
  bookings.push(booking)
  saveBookings(bookings)
  return booking
}

// Get bookings by email and phone
export const getBookingsByContact = (email: string, phone: string, date?: string): Booking[] => {
  const bookings = loadBookings()
  return bookings.filter(booking => {
    const emailMatch = booking.contactEmail.toLowerCase() === email.toLowerCase()
    const phoneMatch = booking.contactPhone === phone
    const dateMatch = !date || booking.date === date
    return emailMatch && phoneMatch && dateMatch
  })
}

// Check for double booking
export const isTimeSlotAvailable = (date: string, startTime: string, duration: number, excludeBookingId?: string): boolean => {
  const bookings = loadBookings()
  
  // Convert start time to minutes for easier comparison
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = startMinutes + (duration * 60)
  
  // Check if any existing booking overlaps with this time slot
  const hasConflict = bookings.some(booking => {
    // Skip the booking we're updating (if any)
    if (excludeBookingId && booking.id === excludeBookingId) {
      return false
    }
    
    // Only check confirmed and pending bookings
    if (booking.status !== 'confirmed' && booking.status !== 'pending') {
      return false
    }
    
    // Check if it's the same date
    if (booking.date !== date) {
      return false
    }
    
    // Check for time overlap
    const bookingStartMinutes = timeToMinutes(booking.startTime)
    const bookingEndMinutes = bookingStartMinutes + (booking.duration * 60)
    
    // Check if the time slots overlap
    return (
      (startMinutes >= bookingStartMinutes && startMinutes < bookingEndMinutes) ||
      (endMinutes > bookingStartMinutes && endMinutes <= bookingEndMinutes) ||
      (startMinutes <= bookingStartMinutes && endMinutes >= bookingEndMinutes)
    )
  })
  
  return !hasConflict
}

// Get available time slots for a date
export const getAvailableTimeSlots = (date: string, duration: number): string[] => {
  const { TIME_SLOTS, BUSINESS_HOURS } = require('./constants')
  const availableSlots: string[] = []
  
  for (const time of TIME_SLOTS) {
    if (isTimeSlotAvailable(date, time, duration)) {
      availableSlots.push(time)
    }
  }
  
  return availableSlots
}

// Helper function to convert time string to minutes
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Get all bookings (for admin purposes)
export const getAllBookings = (): Booking[] => {
  return loadBookings()
}

// Get bookings for a specific date range
export const getBookingsByDateRange = (startDate: string, endDate: string): Booking[] => {
  const bookings = loadBookings()
  return bookings.filter(booking => 
    booking.date >= startDate && booking.date <= endDate
  )
}

// Update booking status
export const updateBookingStatus = (bookingId: string, status: Booking['status']): Booking | null => {
  const bookings = loadBookings()
  const bookingIndex = bookings.findIndex(b => b.id === bookingId)
  
  if (bookingIndex === -1) {
    return null
  }
  
  bookings[bookingIndex].status = status
  saveBookings(bookings)
  return bookings[bookingIndex]
}

// Delete booking (for admin purposes)
export const deleteBooking = (bookingId: string): boolean => {
  const bookings = loadBookings()
  const filteredBookings = bookings.filter(b => b.id !== bookingId)
  
  if (filteredBookings.length === bookings.length) {
    return false // Booking not found
  }
  
  saveBookings(filteredBookings)
  return true
} 