import { createClient } from '@supabase/supabase-js'
import { generateUUID } from './utils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table name
export const BOOKINGS_TABLE = 'bookings'

// Test function to check table structure
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Try to get table info
    const { data, error } = await supabase
      .from(BOOKINGS_TABLE)
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection error:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    console.log('✅ Table structure sample:', data)
    return true
  } catch (error) {
    console.error('❌ Supabase test failed:', error)
    return false
  }
}

// Supabase database functions
export const supabaseDb = {
  // Get all bookings
  async getAllBookings() {
    const { data, error } = await supabase
      .from(BOOKINGS_TABLE)
      .select('*')
      .order('createdat', { ascending: false })
    
    if (error) throw error
    
    // Map the data back to camelCase for frontend compatibility
    return (data || []).map(booking => ({
      id: booking.id,
      date: booking.date,
      startTime: booking.starttime,
      duration: booking.duration / 60, // Convert minutes back to hours
      adults: booking.adults,
      children: booking.children,
      totalPrice: booking.totalprice,
      status: booking.status,
      paymentMethod: booking.paymentmethod,
      paymentStatus: booking.paymentstatus,
      contactName: booking.contactname,
      contactEmail: booking.contactemail,
      contactPhone: booking.contactphone,
      specialRequests: booking.specialrequests,
      createdAt: booking.createdat,
      updatedAt: booking.updatedat,
      bookingType: booking.bookingtype,
      partyPackage: booking.partypackage
    }))
  },

  // Get bookings by contact info
  async getBookingsByContact(email: string, phone: string, date?: string) {
    let query = supabase
      .from(BOOKINGS_TABLE)
      .select('*')
      .eq('contactemail', email.toLowerCase())
      .eq('contactphone', phone)
    
    if (date) {
      query = query.eq('date', date)
    }
    
    const { data, error } = await query.order('createdat', { ascending: false })
    
    if (error) throw error
    
    // Map the data back to camelCase for frontend compatibility
    return (data || []).map(booking => ({
      id: booking.id,
      date: booking.date,
      startTime: booking.starttime,
      duration: booking.duration / 60, // Convert minutes back to hours
      adults: booking.adults,
      children: booking.children,
      totalPrice: booking.totalprice,
      status: booking.status,
      paymentMethod: booking.paymentmethod,
      paymentStatus: booking.paymentstatus,
      contactName: booking.contactname,
      contactEmail: booking.contactemail,
      contactPhone: booking.contactphone,
      specialRequests: booking.specialrequests,
      createdAt: booking.createdat,
      updatedAt: booking.updatedat,
      bookingType: booking.bookingtype,
      partyPackage: booking.partypackage
    }))
  },

  // Add a new booking
  async addBooking(booking: any) {
    console.log('🔍 Supabase addBooking called with:', JSON.stringify(booking, null, 2))
    
    // Clean and validate the booking data
    const cleanBooking = {
      date: String(booking.date),
      startTime: String(booking.startTime),
      duration: Number(booking.duration), // Keep as number, let Supabase handle conversion
      adults: Number(booking.adults),
      children: Number(booking.children),
      totalPrice: Number(booking.totalPrice),
      status: String(booking.status),
      paymentMethod: String(booking.paymentMethod),
      paymentStatus: String(booking.paymentStatus),
      contactName: String(booking.contactName),
      contactEmail: String(booking.contactEmail),
      contactPhone: String(booking.contactPhone),
      specialRequests: booking.specialRequests ? String(booking.specialRequests) : null,
      createdAt: String(booking.createdAt),
      updatedAt: String(booking.updatedAt),
      bookingType: String(booking.bookingType),
      partyPackage: booking.partyPackage ? String(booking.partyPackage) : null
    }
    
    // Map the booking data to match the actual column names
    // Use proper UUID for Supabase compatibility
    const mappedBooking = {
      id: generateUUID(), // Use proper UUID format
      date: cleanBooking.date,
      starttime: cleanBooking.startTime,
      duration: Math.round(cleanBooking.duration * 60), // Convert hours to minutes for integer storage
      adults: cleanBooking.adults,
      children: cleanBooking.children,
      totalprice: cleanBooking.totalPrice,
      status: cleanBooking.status,
      paymentmethod: cleanBooking.paymentMethod,
      paymentstatus: cleanBooking.paymentStatus,
      contactname: cleanBooking.contactName,
      contactemail: cleanBooking.contactEmail,
      contactphone: cleanBooking.contactPhone,
      specialrequests: cleanBooking.specialRequests,
      createdat: cleanBooking.createdAt,
      updatedat: cleanBooking.updatedAt,
      bookingtype: cleanBooking.bookingType,
      partypackage: cleanBooking.partyPackage
    }

    console.log('🔍 Mapped booking data for Supabase:', JSON.stringify(mappedBooking, null, 2))

    try {
      const { data, error } = await supabase
        .from(BOOKINGS_TABLE)
        .insert([mappedBooking])
        .select()
        .single()
      
      if (error) {
        console.error('❌ Supabase insert error:', error)
        throw error
      }
      
      console.log('✅ Supabase insert successful, returned data:', JSON.stringify(data, null, 2))
      
      // Map the returned data back to camelCase for frontend compatibility
      const result = {
        id: data.id,
        date: data.date,
        startTime: data.starttime,
        duration: data.duration,
        adults: data.adults,
        children: data.children,
        totalPrice: data.totalprice,
        status: data.status,
        paymentMethod: data.paymentmethod,
        paymentStatus: data.paymentstatus,
        contactName: data.contactname,
        contactEmail: data.contactemail,
        contactPhone: data.contactphone,
        specialRequests: data.specialrequests,
        createdAt: data.createdat,
        updatedAt: data.updatedat,
        bookingType: data.bookingtype,
        partyPackage: data.partypackage
      }
      
      console.log('✅ Final result object:', JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      console.error('❌ Error in addBooking:', error)
      throw error
    }
  },

  // Check if time slot is available
  async isTimeSlotAvailable(date: string, startTime: string, duration: number, excludeBookingId?: string) {
    const endTime = new Date(`${date}T${startTime}`)
    endTime.setHours(endTime.getHours() + duration) // duration is in hours
    
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
      const bookingStart = new Date(`${booking.date}T${booking.starttime}`)
      // Convert booking.duration from minutes back to hours for calculation
      const bookingDurationHours = booking.duration / 60
      const bookingEnd = new Date(bookingStart.getTime() + bookingDurationHours * 60 * 60 * 1000)
      
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
      .update({ status, updatedat: new Date().toISOString() })
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