import { NextRequest, NextResponse } from 'next/server'
import { loadBookings, saveBookings } from '@/lib/database'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const updates = await request.json()

    // Load all bookings
    const bookings = await loadBookings()
    
    // Find the booking to update
    const bookingIndex = bookings.findIndex(booking => booking.id === id)
    
    if (bookingIndex === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Update the booking
    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      ...updates,
      // Ensure dates are properly handled
      createdAt: bookings[bookingIndex].createdAt,
    }

    // Save updated bookings
    await saveBookings(bookings)

    return NextResponse.json({
      success: true,
      booking: bookings[bookingIndex]
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Load all bookings
    const bookings = await loadBookings()
    
    // Find the booking
    const booking = bookings.find(booking => booking.id === id)
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      booking
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}
