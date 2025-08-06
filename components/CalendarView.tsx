'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Download, ExternalLink, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addDays } from 'date-fns'
import { generateICalEvent, addToGoogleCalendar } from '@/lib/calendar'

interface Booking {
  id: string
  date: string
  startTime: string
  duration: number
  adults: number
  children: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentMethod: 'stripe' | 'usdc'
  paymentStatus: 'pending' | 'paid' | 'failed'
  contactName: string
  contactEmail: string
  contactPhone: string
  specialRequests?: string
  createdAt: Date
  bookingType: 'vr' | 'party'
  partyPackage?: string
}

interface CalendarViewProps {
  bookings: Booking[]
}

export default function CalendarView({ bookings }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getBookingsForDay = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(parseISO(booking.date), date) && 
      (booking.status === 'confirmed' || booking.status === 'pending')
    )
  }

  const getDayClass = (date: Date) => {
    const dayBookings = getBookingsForDay(date)
    const isToday = isSameDay(date, new Date())
    const isPast = date < new Date()
    
    let baseClass = 'p-2 text-center min-h-[60px] border border-slate-700 hover:bg-slate-700 transition-colors'
    
    if (isPast) {
      baseClass += ' bg-slate-800 text-slate-500'
    } else if (dayBookings.length > 0) {
      baseClass += ' bg-red-900/20 text-red-400 border-red-500'
    } else {
      baseClass += ' bg-slate-800 text-slate-300'
    }
    
    if (isToday) {
      baseClass += ' ring-2 ring-blue-500'
    }
    
    return baseClass
  }

  const nextMonth = () => {
    setCurrentMonth(addDays(currentMonth, 32))
  }

  const prevMonth = () => {
    setCurrentMonth(addDays(currentMonth, -32))
  }

  const downloadICal = () => {
    const icalContent = generateICalEvent(bookings)
    const blob = new Blob([icalContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vr-arcade-bookings.ics'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openGoogleCalendar = () => {
    const url = addToGoogleCalendar(bookings[0]) // Use first booking as example
    window.open(url, '_blank')
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-400" />
            Availability Calendar
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={prevMonth}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              ←
            </Button>
            <Button
              onClick={nextMonth}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              →
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-slate-400">
              {day}
            </div>
          ))}
          
          {daysInMonth.map((day, index) => {
            const dayBookings = getBookingsForDay(day)
            return (
              <div key={index} className={getDayClass(day)}>
                <div className="text-sm font-medium">
                  {format(day, 'd')}
                </div>
                {dayBookings.length > 0 && (
                  <div className="text-xs mt-1">
                    <div className="flex items-center justify-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <div className="w-4 h-4 bg-slate-800 border border-slate-700 mr-2"></div>
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-4 h-4 bg-red-900/20 border border-red-500 mr-2"></div>
            <span className="text-red-400">Booked</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-4 h-4 bg-slate-800 border border-slate-700 ring-2 ring-blue-500 mr-2"></div>
            <span className="text-blue-400">Today</span>
          </div>
        </div>

        {/* Calendar Actions */}
        <div className="space-y-2">
          <Button
            onClick={downloadICal}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download iCal
          </Button>
          <Button
            onClick={openGoogleCalendar}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Add to Google Calendar
          </Button>
        </div>


      </CardContent>
    </Card>
  )
} 