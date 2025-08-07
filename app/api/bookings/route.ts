import { NextRequest, NextResponse } from 'next/server'
import { addBooking, getBookingsByContact, isTimeSlotAvailable, getAvailableTimeSlots } from '@/lib/database'
import { generateBookingId, validateEmail, validatePhone } from '@/lib/utils'
import { Booking } from '@/lib/types'
import { sendBookingConfirmation, sendAdminNotification } from '@/lib/email'

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('=== BOOKING API DEBUG ===')
    console.log('Received booking data:', JSON.stringify(body, null, 2))
    
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

    console.log('Extracted fields:', {
      date,
      startTime,
      duration,
      adults,
      children,
      totalPrice,
      contactName,
      contactEmail,
      contactPhone,
      paymentMethod,
      bookingType,
      partyPackage
    })

    // Validate required fields
    if (!date || !startTime || !duration || !contactName || !contactEmail || !contactPhone) {
      console.log('❌ Missing required fields:', { 
        date: !!date, 
        startTime: !!startTime, 
        duration: !!duration, 
        contactName: !!contactName, 
        contactEmail: !!contactEmail, 
        contactPhone: !!contactPhone 
      })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('✅ All required fields present')

    // Validate email and phone
    if (!validateEmail(contactEmail)) {
      console.log('❌ Invalid email:', contactEmail)
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    console.log('✅ Email validation passed')

    if (!validatePhone(contactPhone)) {
      console.log('❌ Invalid phone:', contactPhone)
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    console.log('✅ Phone validation passed')
    console.log('Validation passed, checking time slot availability...')

    // Check if time slot is available
    if (!(await isTimeSlotAvailable(date, startTime, duration))) {
      console.log('❌ Time slot not available:', { date, startTime, duration })
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please select a different time.' },
        { status: 409 }
      )
    }

    console.log('✅ Time slot available, creating booking...')

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

    console.log('✅ Booking object created:', booking)

    // Save booking
    const savedBooking = await addBooking(booking)
    console.log('✅ Booking saved successfully:', savedBooking)

    // Send confirmation emails
    try {
      console.log('📧 Sending confirmation emails...')
      
      // Send customer confirmation
      const customerEmailSent = await sendBookingConfirmation({
        bookingId: savedBooking.id,
        customerName: savedBooking.contactName,
        customerEmail: savedBooking.contactEmail,
        customerPhone: savedBooking.contactPhone,
        date: savedBooking.date,
        startTime: savedBooking.startTime,
        duration: savedBooking.duration,
        adults: savedBooking.adults,
        children: savedBooking.children,
        totalPrice: savedBooking.totalPrice,
        paymentMethod: savedBooking.paymentMethod,
        bookingType: savedBooking.bookingType,
        partyPackage: savedBooking.partyPackage,
        specialRequests: savedBooking.specialRequests
      })

      // Send admin notification
      const adminEmailSent = await sendAdminNotification({
        bookingId: savedBooking.id,
        customerName: savedBooking.contactName,
        customerEmail: savedBooking.contactEmail,
        customerPhone: savedBooking.contactPhone,
        date: savedBooking.date,
        startTime: savedBooking.startTime,
        duration: savedBooking.duration,
        adults: savedBooking.adults,
        children: savedBooking.children,
        totalPrice: savedBooking.totalPrice,
        paymentMethod: savedBooking.paymentMethod,
        bookingType: savedBooking.bookingType,
        partyPackage: savedBooking.partyPackage,
        specialRequests: savedBooking.specialRequests
      })

      console.log('📧 Email results:', { customerEmailSent, adminEmailSent })
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError)
      // Don't fail the booking if emails fail
    }

    return NextResponse.json({
      success: true,
      booking: savedBooking
    })

  } catch (error) {
    console.error('❌ Error creating booking:', error)
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