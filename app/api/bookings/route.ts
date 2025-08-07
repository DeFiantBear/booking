import { NextRequest, NextResponse } from 'next/server'
import { addBooking, getBookingsByContact, isTimeSlotAvailable, getAvailableTimeSlots } from '@/lib/database'
import { generateBookingId, validateEmail, validatePhone } from '@/lib/utils'
import { Booking } from '@/lib/types'

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received booking data:', body)
    
    const {
      date,
      startTime,
      duration,
      adults,
      children,
      totalPrice,
      contactName,
      contactEmail,
      contactPhone,
      specialRequests,
      paymentMethod,
      bookingType,
      partyPackage
    } = body

    // Validate required fields
    if (!date || !startTime || !duration || !contactName || !contactEmail || !contactPhone) {
      console.log('Missing required fields:', { date, startTime, duration, contactName, contactEmail, contactPhone })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email and phone
    if (!validateEmail(contactEmail)) {
      console.log('Invalid email:', contactEmail)
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (!validatePhone(contactPhone)) {
      console.log('Invalid phone:', contactPhone)
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    console.log('Validation passed, checking time slot availability...')

    // Check if time slot is available
    if (!(await isTimeSlotAvailable(date, startTime, duration))) {
      console.log('Time slot not available:', { date, startTime, duration })
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please select a different time.' },
        { status: 409 }
      )
    }

    console.log('Time slot available, creating booking...')

    // Create booking
    const booking: Booking = {
      id: generateBookingId(),
      date,
      startTime,
      duration,
      adults,
      children,
      totalPrice,
      status: 'pending',
      paymentMethod,
      paymentStatus: 'pending',
      contactName,
      contactEmail,
      contactPhone,
      specialRequests,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookingType,
      partyPackage
    }

    console.log('Booking object created:', booking)

    // Save booking
    const savedBooking = await addBooking(booking)
    console.log('Booking saved successfully:', savedBooking)

    return NextResponse.json({
      success: true,
      booking: savedBooking
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

// GET /api/bookings - Get bookings by contact info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')
    const date = searchParams.get('date')

    if (!email || !phone) {
      return NextResponse.json(
        { error: 'Email and phone are required' },
        { status: 400 }
      )
    }

    const bookings = await getBookingsByContact(email, phone, date || undefined)

    return NextResponse.json({
      success: true,
      bookings
    })

  } catch (error) {
    console.error('Error retrieving bookings:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve bookings' },
      { status: 500 }
    )
  }
} 