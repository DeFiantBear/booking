import { NextRequest, NextResponse } from 'next/server'

// Mock calendar data - in a real app, this would integrate with Google Calendar, Outlook, etc.
const mockCalendarEvents = [
  {
    id: '1',
    title: 'VR Session - John Doe',
    start: '2024-01-15T14:00:00Z',
    end: '2024-01-15T16:00:00Z',
    description: '2 adults, 1 child - £80',
    status: 'confirmed'
  },
  {
    id: '2',
    title: 'VR Party - Gold Package',
    start: '2024-01-20T15:00:00Z',
    end: '2024-01-20T17:30:00Z',
    description: '6 guests - £200',
    status: 'confirmed'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    // In a real implementation, you would filter events based on date range
    // and integrate with your actual calendar system
    
    return NextResponse.json({
      events: mockCalendarEvents,
      success: true
    })
  } catch (error) {
    console.error('Calendar API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, start, end, description, bookingId } = body

    // In a real implementation, you would:
    // 1. Create event in Google Calendar, Outlook, etc.
    // 2. Store the calendar event ID in your database
    // 3. Return the created event details

    const newEvent = {
      id: `cal_${Date.now()}`,
      title,
      start,
      end,
      description,
      bookingId,
      status: 'confirmed'
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Calendar event created:', newEvent)
    }

    return NextResponse.json({
      event: newEvent,
      success: true
    })
  } catch (error) {
    console.error('Calendar creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
} 