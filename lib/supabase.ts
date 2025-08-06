import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table name
export const BOOKINGS_TABLE = 'bookings'

// Supabase database functions
export const supabaseDb = {
  // Get all bookings
  async getAllBookings() {
    const { data, error } = await supabase
      .from(BOOKINGS_TABLE)
      .select('*')
      .order('createdAt', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get bookings by contact info
  async getBookingsByContact(email: string, phone: string, date?: string) {
    let query = supabase
      .from(BOOKINGS_TABLE)
      .select('*')
      .eq('contactEmail', email.toLowerCase())
      .eq('contactPhone', phone)
    
    if (date) {
      query = query.eq('date', date)
    }
    
    const { data, error } = await query.order('createdAt', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Add a new booking
  async addBooking(booking: any) {
    const { data, error } = await supabase
      .from(BOOKINGS_TABLE)
      .insert([booking])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Check if time slot is available
  async isTimeSlotAvailable(date: string, startTime: string, duration: number, excludeBookingId?: string) {
    const endTime = new Date(`${date}T${startTime}`)
    endTime.setHours(endTime.getHours() + duration)
    
    let query = supabase
      .from(BOOKINGS_TABLE)
      .select('*')
      .eq('date', date)
      .in('status', ['confirmed', 'pending'])
    
    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // Check for overlaps
    return !data?.some(booking => {
      const bookingStart = new Date(`${booking.date}T${booking.startTime}`)
      const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 60 * 1000)
      
      const newStart = new Date(`${date}T${startTime}`)
      const newEnd = endTime
      
      return (
        (newStart >= bookingStart && newStart < bookingEnd) ||
        (newEnd > bookingStart && newEnd <= bookingEnd) ||
        (newStart <= bookingStart && newEnd >= bookingEnd)
      )
    })
  },

  // Update booking status
  async updateBookingStatus(bookingId: string, status: string) {
    const { data, error } = await supabase
      .from(BOOKINGS_TABLE)
      .update({ status, updatedAt: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete booking
  async deleteBooking(bookingId: string) {
    const { error } = await supabase
      .from(BOOKINGS_TABLE)
      .delete()
      .eq('id', bookingId)
    
    if (error) throw error
    return true
  }
} 