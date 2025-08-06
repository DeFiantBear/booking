import { NextRequest, NextResponse } from 'next/server'
import { getAvailableTimeSlots, isTimeSlotAvailable } from '@/lib/database'

// GET /api/availability - Get available time slots for a date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const duration = searchParams.get('duration')

    if (!date || !duration) {
      return NextResponse.json(
        { error: 'Date and duration are required' },
        { status: 400 }
      )
    }

    const availableSlots = await getAvailableTimeSlots(date, Number(duration))

    return NextResponse.json({
      success: true,
      availableSlots,
      date,
      duration: Number(duration)
    })

  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

// POST /api/availability - Check if a specific time slot is available
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, startTime, duration } = body

    if (!date || !startTime || !duration) {
      return NextResponse.json(
        { error: 'Date, startTime, and duration are required' },
        { status: 400 }
      )
    }

    const isAvailable = await isTimeSlotAvailable(date, startTime, Number(duration))

    return NextResponse.json({
      success: true,
      isAvailable,
      date,
      startTime,
      duration: Number(duration)
    })

  } catch (error) {
    console.error('Error checking time slot availability:', error)
    return NextResponse.json(
      { error: 'Failed to check time slot availability' },
      { status: 500 }
    )
  }
} 