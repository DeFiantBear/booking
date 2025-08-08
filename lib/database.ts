import fs from 'fs'
import path from 'path'
import { Booking } from './types'

const BOOKINGS_FILE = path.join(process.cwd(), 'data', 'bookings.json')

// In-memory storage for Vercel serverless environment
let inMemoryBookings: Booking[] = [
  // Sample data for Vercel deployment
  {
    id: 'sample-001',
    date: '2024-01-15',
    startTime: '14:00',
    duration: 2,
    adults: 2,
    children: 1,
    totalPrice: 80,
    status: 'confirmed',
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    contactName: 'Sample Customer',
    contactEmail: 'sample@example.com',
    contactPhone: '07123456789',
    bookingType: 'vr',
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-10T10:00:00.000Z'
  }
]

// Check if we're in a serverless environment (Vercel)
const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

// Check if Supabase is configured (make this dynamic)
const checkHasSupabase = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Debug logging - only in development
if (process.env.NODE_ENV === 'development') {
  console.log('Database configuration:')
  console.log('- Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')
  console.log('- Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')
  console.log('- Has Supabase:', checkHasSupabase())
  console.log('- Is Serverless:', isServerless)
  console.log('- NODE_ENV:', process.env.NODE_ENV)
  console.log('- VERCEL:', process.env.VERCEL)
}

// Ensure data directory exists
const ensureDataDir = () => {
  if (isServerless) return // Skip file system operations in serverless
  
  const dataDir = path.dirname(BOOKINGS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load all bookings from file, memory, or Supabase
export const loadBookings = async (): Promise<Booking[]> => {
  if (checkHasSupabase()) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Using Supabase for loadBookings')
      }
      const { supabaseDb } = await import('./supabase')
      return await supabaseDb.getAllBookings()
    } catch (error) {
      console.error('Supabase error, falling back to local storage:', error)
    }
  }
  
  if (isServerless) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Using in-memory storage (serverless)')
    }
    return inMemoryBookings
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Using file storage')
  }
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

// Save all bookings to file or memory
export const saveBookings = async (bookings: Booking[]): Promise<void> => {
  if (isServerless) {
    inMemoryBookings = bookings
    return
  }
  
  try {
    ensureDataDir()
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
  } catch (error) {
    console.error('Error saving bookings:', error)
    throw new Error('Failed to save booking')
  }
}

// Add a new booking
export const addBooking = async (booking: Booking): Promise<Booking> => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Database addBooking called with:', JSON.stringify(booking, null, 2))
    console.log('🔍 Has Supabase config:', checkHasSupabase())
    console.log('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')
    console.log('🔍 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set')
  }

  if (checkHasSupabase()) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Attempting to use Supabase for addBooking')
      }
      const { supabaseDb } = await import('./supabase')
      const result = await supabaseDb.addBooking(booking)
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Supabase addBooking successful:', JSON.stringify(result, null, 2))
      }
      return result
    } catch (error) {
      console.error('Supabase error, falling back to local storage:', error)
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Using local storage for addBooking')
  }
  const bookings = await loadBookings()
  bookings.push(booking)
  await saveBookings(bookings)
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Local storage addBooking successful')
  }
  return booking
}

// Get bookings by email and phone
export const getBookingsByContact = async (email: string, phone: string, date?: string): Promise<Booking[]> => {
  if (checkHasSupabase()) {
    try {
      const { supabaseDb } = await import('./supabase')
      return await supabaseDb.getBookingsByContact(email, phone, date)
    } catch (error) {
      console.error('Supabase error, falling back to local storage:', error)
    }
  }
  
  const bookings = await loadBookings()
  return bookings.filter(booking => {
    const emailMatch = booking.contactEmail.toLowerCase() === email.toLowerCase()
    const phoneMatch = booking.contactPhone === phone
    const dateMatch = !date || booking.date === date
    return emailMatch && phoneMatch && dateMatch
  })
}

// Check for double booking
export const isTimeSlotAvailable = async (date: string, startTime: string, duration: number, excludeBookingId?: string): Promise<boolean> => {
  if (checkHasSupabase()) {
    try {
      const { supabaseDb } = await import('./supabase')
      return await supabaseDb.isTimeSlotAvailable(date, startTime, duration, excludeBookingId)
    } catch (error) {
      console.error('Supabase error, falling back to local storage:', error)
    }
  }
  
  const bookings = await loadBookings()
  
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
export const getAvailableTimeSlots = async (date: string, duration: number): Promise<string[]> => {
  const { TIME_SLOTS, BUSINESS_HOURS } = require('./constants')
  const availableSlots: string[] = []
  
  for (const time of TIME_SLOTS) {
    if (await isTimeSlotAvailable(date, time, duration)) {
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
export const getAllBookings = async (): Promise<Booking[]> => {
  return await loadBookings()
}

// Get bookings for a specific date range
export const getBookingsByDateRange = async (startDate: string, endDate: string): Promise<Booking[]> => {
  const bookings = await loadBookings()
  return bookings.filter(booking =>
    booking.date >= startDate && booking.date <= endDate
  )
}

// Update booking status
export const updateBookingStatus = async (bookingId: string, status: Booking['status']): Promise<Booking | null> => {
  if (checkHasSupabase()) {
    try {
      const { supabaseDb } = await import('./supabase')
      return await supabaseDb.updateBookingStatus(bookingId, status)
    } catch (error) {
      console.error('Supabase error, falling back to local storage:', error)
    }
  }
  
  const bookings = await loadBookings()
  const bookingIndex = bookings.findIndex(b => b.id === bookingId)
  
  if (bookingIndex === -1) {
    return null
  }
  
  bookings[bookingIndex].status = status
  await saveBookings(bookings)
  return bookings[bookingIndex]
}

// Delete booking (for admin purposes)
export const deleteBooking = async (bookingId: string): Promise<boolean> => {
  if (checkHasSupabase()) {
    try {
      const { supabaseDb } = await import('./supabase')
      return await supabaseDb.deleteBooking(bookingId)
    } catch (error) {
      console.error('Supabase error, falling back to local storage:', error)
    }
  }
  
  const bookings = await loadBookings()
  const filteredBookings = bookings.filter(b => b.id !== bookingId)
  
  if (filteredBookings.length === bookings.length) {
    return false // Booking not found
  }
  
  await saveBookings(filteredBookings)
  return true
} 