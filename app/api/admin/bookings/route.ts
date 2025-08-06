import { NextRequest, NextResponse } from 'next/server'
import { getAllBookings, getBookingsByDateRange, updateBookingStatus, deleteBooking } from '@/lib/database'

// GET /api/admin/bookings - Get all bookings (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let bookings

    if (startDate && endDate) {
      bookings = getBookingsByDateRange(startDate, endDate)
    } else {
      bookings = getAllBookings()
    }

    // Sort by date and time (newest first)
    bookings.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`)
      const dateB = new Date(`${b.date}T${b.startTime}`)
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json({
      success: true,
      bookings,
      total: bookings.length
    })

  } catch (error) {
    console.error('Error retrieving admin bookings:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve bookings' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/bookings - Update booking status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, status } = body

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Booking ID and status are required' },
        { status: 400 }
      )
    }

    const updatedBooking = updateBookingStatus(bookingId, status)

    if (!updatedBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking
    })

  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/bookings - Delete a booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const deleted = deleteBooking(bookingId)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
} 