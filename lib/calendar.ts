// Calendar integration utilities
// This can be extended to integrate with Google Calendar, Outlook, iCal, etc.

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  description: string
  bookingId?: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

// Create calendar event for a booking
export async function createCalendarEvent(booking: any): Promise<CalendarEvent> {
  try {
    const startTime = new Date(`${booking.date}T${booking.startTime}`)
    const endTime = new Date(startTime.getTime() + booking.duration * 60 * 60 * 1000)
    
    const eventData = {
      title: `VR Session - ${booking.contactName}`,
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      description: `${booking.adults} adults, ${booking.children} children - ${booking.totalPrice} GBP`,
      bookingId: booking.id
    }

    const response = await fetch('/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      throw new Error('Failed to create calendar event')
    }

    const data = await response.json()
    return data.event
  } catch (error) {
    console.error('Calendar event creation error:', error)
    throw error
  }
}

// Get calendar events for a date range
export async function getCalendarEvents(start: string, end: string): Promise<CalendarEvent[]> {
  try {
    const response = await fetch(`/api/calendar?start=${start}&end=${end}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar events')
    }

    const data = await response.json()
    return data.events
  } catch (error) {
    console.error('Calendar events fetch error:', error)
    throw error
  }
}

// Generate iCal file content for a booking
export function generateICalEvent(booking: any): string {
  const startTime = new Date(`${booking.date}T${booking.startTime}`)
  const endTime = new Date(startTime.getTime() + booking.duration * 60 * 60 * 1000)
  
  const eventId = booking.id
  const summary = `VR Session - ${booking.contactName}`
  const description = `${booking.adults} adults, ${booking.children} children - ${booking.totalPrice} GBP`
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VR Arcade//Booking System//EN',
    'BEGIN:VEVENT',
    `UID:${eventId}@vrarcade.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTEND:${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
}

// Download iCal file
export function downloadICalFile(booking: any) {
  const icalContent = generateICalEvent(booking)
  const blob = new Blob([icalContent], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `vr-session-${booking.id}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Google Calendar integration (requires Google Calendar API setup)
export async function addToGoogleCalendar(booking: any) {
  // This would require Google Calendar API setup
  // For now, we'll create a Google Calendar URL
  const startTime = new Date(`${booking.date}T${booking.startTime}`)
  const endTime = new Date(startTime.getTime() + booking.duration * 60 * 60 * 1000)
  
  const title = encodeURIComponent(`VR Session - ${booking.contactName}`)
  const details = encodeURIComponent(`${booking.adults} adults, ${booking.children} children - ${booking.totalPrice} GBP`)
  const start = startTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const end = endTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`
  
  window.open(googleCalendarUrl, '_blank')
} 