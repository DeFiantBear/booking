'use client'

import React, { useState } from 'react'
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
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 7, 7))

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
    const isToday = isSameDay(date, new Date(2024, 7, 7))
    const isPast = date < new Date(2024, 7, 7)
    
    let baseClass = 'p-2 text-center min-h-[60px] border border-[#333333] hover:bg-[#1a1a1a] transition-colors'
    
    if (isPast) {
      baseClass += ' bg-[#0a0a0a] text-[#666666]'
    } else if (dayBookings.length > 0) {
      baseClass += ' bg-[#0066ff]/20 text-[#0066ff] border-[#0066ff]'
    } else {
      baseClass += ' bg-[#1a1a1a] text-[#0066ff]'
    }
    
    if (isToday) {
      baseClass += ' ring-2 ring-[#0066ff]'
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
    const url = addToGoogleCalendar(bookings[0])
    window.open(url, '_blank')
  }

  return (
    <div className="cyber-card rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-[#0066ff]" />
            <h3 className="cyber-title text-xl">AVAILABILITY CALENDAR</h3>
          </div>
          <div className="flex space-x-2">
            <button onClick={prevMonth} className="cyber-button px-3 py-1 text-sm">←</button>
            <button onClick={nextMonth} className="cyber-button px-3 py-1 text-sm">→</button>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="cyber-title text-lg font-semibold text-center">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium terminal-text">
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

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <div className="w-4 h-4 bg-[#1a1a1a] border border-[#333333] mr-2"></div>
          <span className="terminal-text">Available</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-4 h-4 bg-[#0066ff]/20 border border-[#0066ff] mr-2"></div>
          <span className="text-[#0066ff]">Booked</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-4 h-4 bg-[#1a1a1a] border border-[#333333] ring-2 ring-[#0066ff] mr-2"></div>
          <span className="text-[#0066ff]">Today</span>
        </div>
      </div>

      <div className="space-y-2">
        <button onClick={downloadICal} className="cyber-button w-full">
          <Download className="h-4 w-4 mr-2 inline" />
          DOWNLOAD ICAL
        </button>
        <button onClick={openGoogleCalendar} className="cyber-button w-full">
          <ExternalLink className="h-4 w-4 mr-2 inline" />
          ADD TO GOOGLE CALENDAR
        </button>
      </div>
    </div>
  )
} 