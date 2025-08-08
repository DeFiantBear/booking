import { NextRequest, NextResponse } from 'next/server'
import { addBooking, getBookingsByContact, isTimeSlotAvailable, getAvailableTimeSlots } from '@/lib/database'
import { generateUUID, validateEmail, validatePhone } from '@/lib/utils'
import { Booking } from '@/lib/types'
import { testSupabaseConnection } from '@/lib/supabase'
import { checkRateLimit, getClientIP } from '@/lib/rateLimit'

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(clientIP)
    
    if (!rateLimit.allowed) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚫 Rate limit exceeded for IP: ${clientIP}`)
      }
      return NextResponse.json(
        { 
          error: 'Too many requests. Please wait a moment before trying again.',
          retryAfter: 60
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'Retry-After': '60'
          }
        }
      )
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Rate limit check passed for IP: ${clientIP} (${rateLimit.remaining} requests remaining)`)
    }

    const body = await request.json()
    if (process.env.NODE_ENV === 'development') {
      console.log('=== BOOKING API DEBUG ===')
      console.log('Received booking data:', JSON.stringify(body, null, 2))
    }
    
    // Test Supabase connection first
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Testing Supabase connection...')
    }
    const supabaseTest = await testSupabaseConnection()
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Supabase test result:', supabaseTest)
    }
    
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

    if (process.env.NODE_ENV === 'development') {
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
    }

    // Validate required fields
    if (!date || !startTime || !duration || !contactName || !contactEmail || !contactPhone) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Missing required fields:', { 
          date: !!date, 
          startTime: !!startTime, 
          duration: !!duration, 
          contactName: !!contactName, 
          contactEmail: !!contactEmail, 
          contactPhone: !!contactPhone 
        })
      }
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ All required fields present')
    }

    // Validate email and phone
    if (!validateEmail(contactEmail)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Invalid email:', contactEmail)
      }
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Email validation passed')
    }

    if (!validatePhone(contactPhone)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Invalid phone:', contactPhone)
      }
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Phone validation passed')
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('Validation passed, checking time slot availability...')
    }

    // Check if time slot is available
    if (!(await isTimeSlotAvailable(date, startTime, duration))) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Time slot not available:', { date, startTime, duration })
      }
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please select a different time.' },
        { status: 409 }
      )
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Time slot available, creating booking...')
    }

    // Create booking with UUID format
    const booking: Booking = {
      id: generateUUID(), // Use UUID format for Supabase compatibility
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

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Booking object created:', booking)
    }

    // Save booking
    const savedBooking = await addBooking(booking)
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Booking saved successfully:', savedBooking)
    }

    // Test: Verify the booking was actually saved to Supabase
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Verifying booking was saved to database...')
    }
    try {
      const { supabaseDb } = await import('@/lib/supabase')
      const verificationResult = await supabaseDb.getBookingsByContact(contactEmail, contactPhone, date)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Verification result:', verificationResult)
        console.log('🔍 Found bookings with same contact info:', verificationResult.length)
      }
      if (verificationResult.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Booking verified in database:', verificationResult[0])
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ Booking NOT found in database after save!')
        }
      }
    } catch (verificationError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Verification failed:', verificationError)
      }
    }

    // Send confirmation emails (only if Resend is configured)
    let emailStatus = { customerEmailSent: false, adminEmailSent: false };
    
    if (process.env.RESEND_API_KEY) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('📧 Sending confirmation emails...')
        }
        
        // Dynamically import email functions
        const { sendBookingConfirmation, sendAdminNotification } = await import('@/lib/email')
        
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

        emailStatus = { customerEmailSent, adminEmailSent };
        if (process.env.NODE_ENV === 'development') {
          console.log('📧 Email results:', emailStatus)
        }
      } catch (emailError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Email sending failed:', emailError)
        }
        // Don't fail the booking if emails fail
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email sending skipped - RESEND_API_KEY not configured')
      }
    }

    return NextResponse.json({
      success: true,
      booking: savedBooking,
      emailStatus
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error creating booking:', error)
    }
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
    if (process.env.NODE_ENV === 'development') {
      console.error('Error retrieving bookings:', error)
    }
    return NextResponse.json(
      { error: 'Failed to retrieve bookings' },
      { status: 500 }
    )
  }
} 