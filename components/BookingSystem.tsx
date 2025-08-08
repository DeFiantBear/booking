'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, CreditCard, Wallet, CheckCircle, XCircle, Gamepad2, PartyPopper } from 'lucide-react'
import { format, addDays, isAfter, isBefore, parseISO, startOfDay } from 'date-fns'
import { 
  calculateSessionPrice, 
  formatPrice, 
  getAvailableTimeSlots,
  generateBookingId,
  validateEmail,
  validatePhone
} from '@/lib/utils'
import { AVAILABLE_DURATIONS, BUSINESS_HOURS, PRICING, PARTY_PACKAGES } from '@/lib/constants'
import { createPaymentIntent } from '@/lib/stripe'
import { createCalendarEvent } from '@/lib/calendar'
import CalendarView from './CalendarView'

interface Booking {
  id: string
  date: string
  startTime: string
  duration: number
  adults: number
  children: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentMethod: 'stripe' | 'usdc' | 'cash'
  paymentStatus: 'pending' | 'paid' | 'failed'
  contactName: string
  contactEmail: string
  contactPhone: string
  specialRequests?: string
  createdAt: Date
  bookingType: 'vr' | 'party'
  partyPackage?: string
}

type BookingFlow = 'main' | 'vr-booking' | 'party-packages' | 'party-booking' | 'bookings'

export default function BookingSystem() {
  const [currentFlow, setCurrentFlow] = useState<BookingFlow>('main')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(1)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'usdc' | 'cash'>('stripe')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedPartyPackage, setSelectedPartyPackage] = useState<string>('')
  const [players, setPlayers] = useState(1)
  const [lookupResults, setLookupResults] = useState<Booking[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [lookupEmail, setLookupEmail] = useState('')
  const [lookupPhone, setLookupPhone] = useState('')
  const [lookupDate, setLookupDate] = useState('')

  // Calculate total price based on current flow
  const totalPrice = currentFlow === 'vr-booking' 
    ? calculateSessionPrice(adults, children, duration)
    : players * (selectedPartyPackage === 'silver' ? 15 : selectedPartyPackage === 'gold' ? 20 : 25)

  // Calculate max guests based on current flow
  const maxGuests = currentFlow === 'vr-booking' ? 5 : 10

  // Calculate price when inputs change
  React.useEffect(() => {
    if (currentFlow === 'party-booking' && selectedPartyPackage) {
      // For party packages, use per-person pricing
      const selectedPackage = PARTY_PACKAGES.find(pkg => pkg.id === selectedPartyPackage)
      if (selectedPackage) {
        const price = players * selectedPackage.price
        // setTotalPrice(price) // This line was removed from the new_code, so it's removed here.
      }
    } else if (currentFlow === 'vr-booking') {
      // For regular sessions, use hourly pricing
      const price = calculateSessionPrice(adults, children, duration)
      // setTotalPrice(price) // This line was removed from the new_code, so it's removed here.
    }
  }, [adults, children, players, duration, selectedPartyPackage, currentFlow])

  // Update available times when date or duration changes
  React.useEffect(() => {
    if (selectedDate && duration) {
      // Fetch available times from server
      fetch(`/api/availability?date=${selectedDate}&duration=${duration}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAvailableTimes(data.availableSlots)
            setSelectedTime('')
          }
        })
        .catch(error => {
          console.error('Error fetching available times:', error)
          // Fallback to client-side calculation
          const times = getAvailableTimeSlots(new Date(selectedDate), duration)
          setAvailableTimes(times)
          setSelectedTime('')
        })
    }
  }, [selectedDate, duration])

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
  }

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration)
  }

  const handleGuestChange = (type: 'adults' | 'children', value: number) => {
    const maxGuests = currentFlow === 'party-booking' ? 10 : 5 // 10 for party packages, 5 for regular sessions
    
    if (type === 'adults') {
      const newAdults = Math.max(0, Math.min(maxGuests, value))
      const totalGuests = newAdults + children
      if (totalGuests <= maxGuests) {
        setAdults(newAdults)
      }
    } else {
      const newChildren = Math.max(0, Math.min(maxGuests, value))
      const totalGuests = adults + newChildren
      if (totalGuests <= maxGuests) {
        setChildren(newChildren)
      }
    }
  }

  const handleBooking = async () => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const bookingData = {
        date: selectedDate,
        startTime: selectedTime,
        duration: currentFlow === 'vr-booking' ? duration : 2.5,
        adults: currentFlow === 'vr-booking' ? adults : 0,
        children: currentFlow === 'vr-booking' ? children : 0,
        totalPrice,
        contactName,
        contactEmail,
        contactPhone,
        specialRequests,
        paymentMethod,
        bookingType: currentFlow === 'vr-booking' ? 'vr' : 'party',
        partyPackage: currentFlow === 'party-booking' ? selectedPartyPackage : undefined
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setSubmitError('This time slot is no longer available. Please select a different time.')
        } else {
          setSubmitError(result.error || 'Failed to create booking')
        }
        return
      }

      // Handle payment based on method
      if (paymentMethod === 'cash') {
        console.log('Cash payment - customer will pay at venue')
        // Create calendar event for cash payments
        const calendarResponse = await fetch('/api/calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `${currentFlow === 'vr-booking' ? 'VR Session' : 'Gaming Party'} - ${contactName}`,
            start: `${selectedDate}T${selectedTime}`,
            end: new Date(new Date(`${selectedDate}T${selectedTime}`).getTime() + (currentFlow === 'vr-booking' ? duration : 2.5) * 60 * 60 * 1000).toISOString(),
            description: `${currentFlow === 'vr-booking' ? `${adults} adults, ${children} children` : `${players} players`} - ${formatPrice(totalPrice)}`,
            bookingId: result.booking.id,
            status: 'confirmed'
          })
        })

        if (calendarResponse.ok) {
          const calendarResult = await calendarResponse.json()
          console.log('Calendar event created:', calendarResult)
        }

        alert('Booking confirmed! Please pay at the venue.')
        resetForm()
        setCurrentFlow('main')
      } else if (paymentMethod === 'stripe') {
        // Handle Stripe payment
        const paymentResponse = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: totalPrice * 100, // Convert to pence
            bookingId: result.booking.id,
          }),
        })

        if (paymentResponse.ok) {
          const paymentResult = await paymentResponse.json()
          // Redirect to Stripe payment
          window.location.href = `/payment?client_secret=${paymentResult.client_secret}`
        } else {
          setSubmitError('Failed to create payment. Please try again.')
        }
      } else if (paymentMethod === 'usdc') {
        // Handle USDC payment (mocked)
        console.log('USDC payment - customer will pay with USDC')
        alert('USDC payment option selected. Payment will be processed separately.')
        resetForm()
        setCurrentFlow('main')
      }

    } catch (error) {
      console.error('Error creating booking:', error)
      setSubmitError('Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedDate('')
    setSelectedTime('')
    setDuration(1)
    setAdults(1)
    setChildren(0)
    setPlayers(5)
    setContactName('')
    setContactEmail('')
    setContactPhone('')
    setSpecialRequests('')
    setSelectedPartyPackage('')
    // setTotalPrice(0) // This line was removed from the new_code, so it's removed here.
  }

  const getMinDate = () => {
    const tomorrow = addDays(new Date(), 1)
    return format(tomorrow, 'yyyy-MM-dd')
  }

  const getMaxDate = () => {
    const maxDate = addDays(new Date(), 30)
    return format(maxDate, 'yyyy-MM-dd')
  }

  const startVRBooking = () => {
    resetForm()
    setCurrentFlow('vr-booking')
  }

  const startPartyBooking = () => {
    resetForm()
    setCurrentFlow('party-packages')
  }

  const selectPartyPackage = (packageId: string) => {
    setSelectedPartyPackage(packageId)
    const selectedPackage = PARTY_PACKAGES.find(pkg => pkg.id === packageId)
    if (selectedPackage) {
      setDuration(selectedPackage.duration)
      setPlayers(5)
    }
    setCurrentFlow('party-booking')
  }

  const goBack = () => {
    if (currentFlow === 'vr-booking' || currentFlow === 'party-booking') {
      setCurrentFlow('main')
      resetForm()
    } else if (currentFlow === 'party-packages') {
      setCurrentFlow('main')
      resetForm()
    }
  }

  // Main Selection Screen
  if (currentFlow === 'main') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6">
              VR Arcade
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              Book your virtual reality experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-3xl mx-auto px-2">
            {/* VR Booking Option */}
            <div className="cyber-card p-4 sm:p-6 md:p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="mb-4 md:mb-6">
                <Gamepad2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-500 mx-auto mb-3 md:mb-4" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">VR Gaming</h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  VR gaming for up to 5 people booked by the hour
                </p>
              </div>
              <button 
                onClick={startVRBooking}
                className="cyber-button w-full text-sm sm:text-base py-2 sm:py-3"
              >
                Book VR Session
              </button>
            </div>

            {/* Party Booking Option */}
            <div className="cyber-card p-4 sm:p-6 md:p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="mb-4 md:mb-6">
                <PartyPopper className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-500 mx-auto mb-3 md:mb-4" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">Gaming Party</h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Console and VR gaming for up to 10 players, 2.5 hours, cakes, snacks and other options available
                </p>
              </div>
              <button 
                onClick={startPartyBooking}
                className="cyber-button w-full text-sm sm:text-base py-2 sm:py-3"
              >
                Book Party
              </button>
            </div>
          </div>

          {/* View Bookings Button */}
          <div className="text-center mt-8 md:mt-12">
            <button 
              onClick={() => setCurrentFlow('bookings')}
              className="cyber-button text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 inline" />
              View My Bookings ({lookupResults.length})
            </button>
          </div>
        </div>
      </div>
    )
  }

  // VR Booking Form
  if (currentFlow === 'vr-booking') {
    return (
      <div className="min-h-screen relative">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <button 
                onClick={goBack}
                className="cyber-button mb-4 text-sm sm:text-base"
              >
                ← BACK TO MAIN MENU
              </button>
              <h1 className="cyber-title text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" data-text="VR SESSION BOOKING">VR SESSION BOOKING</h1>
              <p className="terminal-text text-base sm:text-lg">Book your VR gaming session</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Date & Time Selection */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                    Select Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Date</label>
                    <input
                      type="date"
                      min={getMinDate()}
                      max={getMaxDate()}
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full p-3 sm:p-4 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Start Time</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="w-full p-3 sm:p-4 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      disabled={!selectedDate}
                    >
                      <option value="">Select time</option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {format(parseISO(`2000-01-01T${time}`), 'h:mm a')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Duration (hours)</label>
                    <select
                      value={duration}
                      onChange={(e) => handleDurationChange(Number(e.target.value))}
                      className="w-full p-3 sm:p-4 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    >
                      {AVAILABLE_DURATIONS.map((d) => (
                        <option key={d} value={d}>
                          {d === 1 ? '1 hour' : d === 2.5 ? '2.5 hours' : `${d} hours`}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Guest Count & Pricing */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Users className="h-5 w-5 mr-2 text-blue-400" />
                    Guest Count & Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Adults</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={adults}
                        onChange={(e) => handleGuestChange('adults', Number(e.target.value))}
                        className="w-full p-3 sm:p-4 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-300">Children</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={children}
                        onChange={(e) => handleGuestChange('children', Number(e.target.value))}
                        className="w-full p-3 sm:p-4 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 text-center">
                    Total guests: {adults + children}/5
                  </div>

                  <div className="bg-slate-700 p-4 rounded-md">
                    <h4 className="font-semibold mb-2 text-white">Pricing Summary</h4>
                    <div className="space-y-1 text-sm text-slate-300">
                      <div className="flex justify-between">
                        <span>Adults ({adults} × £{PRICING.adultPerHour}/hour × {duration}h):</span>
                        <span>{formatPrice(adults * PRICING.adultPerHour * duration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Children ({children} × £{PRICING.childPerHour}/hour × {duration}h):</span>
                        <span>{formatPrice(children * PRICING.childPerHour * duration)}</span>
                      </div>
                      <hr className="my-2 border-slate-600" />
                      <div className="flex justify-between font-bold text-lg text-white">
                        <span>Total:</span>
                        <span className="text-blue-400">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <Card className="mt-6 sm:mt-8 bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Name *</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full p-3 sm:p-4 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Email *</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full p-3 sm:p-4 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Phone *</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full p-3 sm:p-4 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      placeholder="+44 20 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Special Requests</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full p-3 sm:p-4 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      placeholder="Any special requests or accommodations..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="mt-6 sm:mt-8 bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 rounded-md border text-sm sm:text-base ${
                      paymentMethod === 'stripe'
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Credit/Debit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('usdc')}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 rounded-md border text-sm sm:text-base ${
                      paymentMethod === 'usdc'
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <Wallet className="h-4 w-4" />
                    <span>USDC (Crypto)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 rounded-md border text-sm sm:text-base ${
                      paymentMethod === 'cash'
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span>💵</span>
                    <span>Pay at Venue</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Book Button */}
            <div className="mt-6 sm:mt-8 text-center">
              <Button
                onClick={handleBooking}
                disabled={isSubmitting || !selectedDate || !selectedTime || totalPrice === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto"
              >
                {isSubmitting ? 'Processing...' : `Book VR Session - ${formatPrice(totalPrice)}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Party Packages Selection
  if (currentFlow === 'party-packages') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <Button 
                onClick={goBack}
                variant="outline"
                className="mb-4 border-slate-600 text-slate-300 hover:bg-slate-700 text-sm sm:text-base"
              >
                ← Back to Main Menu
              </Button>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Gaming Party Packages</h1>
              <p className="text-slate-300 text-base sm:text-lg">Choose your perfect party package</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
              {PARTY_PACKAGES.map((pkg) => (
                <Card key={pkg.id} className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20">
                  <CardHeader className="text-center p-4 sm:p-6">
                    <CardTitle className="text-xl sm:text-2xl capitalize text-white">{pkg.name} Package</CardTitle>
                    <div className="text-2xl sm:text-3xl font-bold text-cyan-400">£{pkg.price}</div>
                    <div className="text-xs sm:text-sm text-slate-400">per person • {pkg.duration} hours</div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-center mb-4 text-slate-300 text-sm sm:text-base">{pkg.description}</p>
                    <ul className="space-y-2 mb-6">
                      {pkg.includes.map((item, index) => (
                        <li key={index} className="flex items-center text-sm text-slate-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => selectPartyPackage(pkg.id)}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      Select {pkg.name} Package
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Party Package Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-slate-300">What's Included:</h4>
                    <ul className="space-y-1 text-sm text-slate-400">
                      <li>• Dedicated VR gaming space</li>
                      <li>• Professional game master</li>
                      <li>• All VR equipment provided</li>
                      <li>• Party decorations</li>
                      <li>• Refreshments & snacks</li>
                      <li>• Safety briefing & instructions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-slate-300">Booking Information:</h4>
                    <ul className="space-y-1 text-sm text-slate-400">
                      <li>• Maximum 10 guests per party</li>
                      <li>• 2.5 hour duration</li>
                      <li>• Priced per person</li>
                      <li>• Available during business hours</li>
                      <li>• 24-hour cancellation policy</li>
                      <li>• Suitable for ages 8+</li>
                      <li>• Parental consent required for minors</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Party Booking Form
  if (currentFlow === 'party-booking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Button 
                onClick={goBack}
                variant="outline"
                className="mb-4 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                ← Back to Packages
              </Button>
              <h1 className="text-4xl font-bold text-white mb-4">Party Booking</h1>
              <p className="text-slate-300">
                {PARTY_PACKAGES.find(pkg => pkg.id === selectedPartyPackage)?.name} Package Selected
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Date & Time Selection */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Calendar className="h-5 w-5 mr-2 text-cyan-400" />
                    Select Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Date</label>
                    <input
                      type="date"
                      min={getMinDate()}
                      max={getMaxDate()}
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full p-3 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Start Time</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="w-full p-3 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      disabled={!selectedDate}
                    >
                      <option value="">Select time</option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {format(parseISO(`2000-01-01T${time}`), 'h:mm a')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Duration</label>
                    <input
                      type="text"
                      value={`${PARTY_PACKAGES.find(pkg => pkg.id === selectedPartyPackage)?.duration} hours`}
                      disabled
                      className="w-full p-3 border border-slate-600 rounded-md bg-slate-700 text-slate-400"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Guest Count & Pricing */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Users className="h-5 w-5 mr-2 text-cyan-400" />
                    Guest Count & Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Number of Players</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={players}
                      onChange={(e) => {
                        const value = Math.max(1, Math.min(10, Number(e.target.value)))
                        setPlayers(value)
                      }}
                      className="w-full p-3 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <div className="text-sm text-slate-400 text-center mt-2">
                      Total players: {players}/10
                    </div>
                  </div>

                  <div className="bg-slate-700 p-4 rounded-md">
                    <h4 className="font-semibold mb-2 text-white">Pricing Summary</h4>
                    <div className="space-y-1 text-sm text-slate-300">
                      <div className="flex justify-between">
                        <span>Party Package ({PARTY_PACKAGES.find(pkg => pkg.id === selectedPartyPackage)?.name}):</span>
                        <span>£{PARTY_PACKAGES.find(pkg => pkg.id === selectedPartyPackage)?.price} per person</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Players ({players} people):</span>
                        <span>{players} × £{PARTY_PACKAGES.find(pkg => pkg.id === selectedPartyPackage)?.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{PARTY_PACKAGES.find(pkg => pkg.id === selectedPartyPackage)?.duration} hours</span>
                      </div>
                      <hr className="my-2 border-slate-600" />
                      <div className="flex justify-between font-bold text-lg text-white">
                        <span>Total:</span>
                        <span className="text-cyan-400">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <Card className="mt-8 bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Name *</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full p-3 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Email *</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full p-3 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Phone *</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full p-3 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="+44 20 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Special Requests</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full p-3 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Any special requests or accommodations..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="mt-8 bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                      paymentMethod === 'stripe'
                        ? 'border-cyan-500 bg-cyan-600 text-white'
                        : 'border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Credit/Debit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('usdc')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                      paymentMethod === 'usdc'
                        ? 'border-cyan-500 bg-cyan-600 text-white'
                        : 'border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <Wallet className="h-4 w-4" />
                    <span>USDC (Crypto)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                      paymentMethod === 'cash'
                        ? 'border-cyan-500 bg-cyan-600 text-white'
                        : 'border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span>💵</span>
                    <span>Pay at Venue</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Book Button */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleBooking}
                disabled={isSubmitting || !selectedDate || !selectedTime || totalPrice === 0}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 text-lg font-semibold"
              >
                {isSubmitting ? 'Processing...' : `Book Party - ${formatPrice(totalPrice)}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Bookings View
  if (currentFlow === 'bookings') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <Button 
                onClick={() => setCurrentFlow('main')}
                variant="outline"
                className="mb-4 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                ← Back to Main Menu
              </Button>
              <h1 className="text-4xl font-bold text-white mb-4">My Bookings</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <BookingLookupForm 
                  onLookup={async (email, phone, date) => {
                    setIsSearching(true)
                    setSearchError('')
                    console.log('Searching for bookings with:', { email, phone, date })
                    
                    try {
                      const params = new URLSearchParams({
                        email: email,
                        phone: phone
                      })
                      
                      if (date) {
                        params.append('date', date)
                      }

                      console.log('Making API request to:', `/api/bookings?${params}`)
                      const response = await fetch(`/api/bookings?${params}`)
                      console.log('Search API response status:', response.status)
                      
                      const result = await response.json()
                      console.log('Search API result:', result)

                      if (!response.ok) {
                        throw new Error(result.error || 'Failed to find bookings')
                      }

                      setLookupResults(result.bookings || [])
                      console.log('Found bookings:', result.bookings)
                      console.log('Set lookup results:', result.bookings?.length || 0)
                      
                    } catch (error) {
                      console.error('Error looking up bookings:', error)
                      setSearchError('Failed to find bookings. Please check your details and try again.')
                      setLookupResults([])
                    } finally {
                      setIsSearching(false)
                    }
                  }}
                  isSearching={isSearching}
                  searchError={searchError}
                  lookupResults={lookupResults}
                />
                
                {lookupResults.length === 0 ? (
                  <Card className="text-center py-12 bg-slate-800 border-slate-700">
                    <CardContent>
                      <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No bookings found</h3>
                      <p className="text-slate-300 mb-6">Enter your email and phone number above to find your bookings!</p>
                      <Button onClick={() => setCurrentFlow('main')} className="bg-blue-600 hover:bg-blue-700">
                        Book a Session
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  lookupResults.map((booking) => (
                    <Card key={booking.id} className="hover:shadow-md transition-shadow bg-slate-800 border-slate-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {booking.bookingType === 'vr' ? 'VR Session' : 
                               booking.partyPackage && booking.partyPackage !== 'undefined' ? `${booking.partyPackage} Party` : 'Party Booking'}
                            </h3>
                            <p className="text-sm text-slate-400">Booking #{booking.id}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                              booking.status === 'confirmed' ? 'text-green-400 bg-green-900/20 border-green-500' :
                              booking.status === 'pending' ? 'text-yellow-400 bg-yellow-900/20 border-yellow-500' :
                              'text-slate-400 bg-slate-700 border-slate-600'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {(() => {
                                  try {
                                    return format(parseISO(booking.date), 'EEEE, MMMM do, yyyy')
                                  } catch (error) {
                                    console.error('Date parsing error:', error, 'Date value:', booking.date)
                                    return booking.date || 'Invalid date'
                                  }
                                })()}
                              </p>
                              <p className="text-xs text-slate-400">
                                {(() => {
                                  try {
                                    const startTime = booking.startTime && booking.startTime !== 'undefined' ? booking.startTime : 'TBD'
                                    return `${startTime} - ${booking.duration || 1} hours`
                                  } catch (error) {
                                    console.error('Time parsing error:', error, 'Time value:', booking.startTime)
                                    return `${booking.startTime || 'TBD'} - ${booking.duration || 1} hours`
                                  }
                                })()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            <div>
                              <p className="text-sm font-medium text-white">{booking.adults || 0} adults, {booking.children || 0} children</p>
                              <p className="text-xs text-slate-400">Contact: {booking.contactName || 'Not provided'}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-400">
                              {(() => {
                                const price = typeof booking.totalPrice === 'string' ? parseFloat(booking.totalPrice) : booking.totalPrice
                                return isNaN(price) || price === 0 ? 'Price not set' : formatPrice(price)
                              })()}
                            </p>
                            <p className="text-xs text-slate-400">
                              {booking.paymentMethod === 'usdc' ? 'USDC' : 
                               booking.paymentMethod === 'cash' ? 'Cash' : 'Card'} - {booking.paymentStatus || 'pending'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              
              <div>
                <CalendarView bookings={lookupResults} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// Booking Lookup Form Component
function BookingLookupForm({ 
  onLookup, 
  isSearching, 
  searchError, 
  lookupResults 
}: { 
  onLookup: (email: string, phone: string, date?: string) => Promise<void>
  isSearching: boolean
  searchError: string
  lookupResults: Booking[]
}) {
  const [lookupEmail, setLookupEmail] = useState('')
  const [lookupPhone, setLookupPhone] = useState('')
  const [lookupDate, setLookupDate] = useState('')

  const handleLookup = async () => {
    if (!lookupEmail || !lookupPhone) {
      return
    }

    await onLookup(lookupEmail, lookupPhone, lookupDate || undefined)
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Find My Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Email *</label>
            <input
              type="email"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              className="w-full p-3 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the email used for booking"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Phone *</label>
            <input
              type="tel"
              value={lookupPhone}
              onChange={(e) => setLookupPhone(e.target.value)}
              className="w-full p-3 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the phone number used for booking"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Date (Optional)</label>
            <input
              type="date"
              value={lookupDate}
              onChange={(e) => setLookupDate(e.target.value)}
              className="w-full p-3 border border-slate-600 rounded-md bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {searchError && (
            <div className="text-red-400 text-sm">{searchError}</div>
          )}

          <Button
            onClick={handleLookup}
            disabled={isSearching || !lookupEmail || !lookupPhone}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSearching ? 'Searching...' : 'Find My Bookings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 