'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format, addDays, parseISO } from 'date-fns'
import { Calendar, Clock, Users, Package, DollarSign, Gamepad2, ArrowLeft, Search, CheckCircle } from 'lucide-react'
import { calculateSessionPrice, formatPrice, getAvailableTimeSlots } from '@/lib/utils'
import { PARTY_PACKAGES, AVAILABLE_DURATIONS, PRICING } from '@/lib/constants'

interface Booking {
  id: string
  date: string
  startTime: string
  duration: number
  adults: number
  children: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentMethod: 'cash' | 'card'
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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')

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
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null)
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)

  // Calculate total price based on current flow
  const totalPrice = currentFlow === 'vr-booking' 
    ? calculateSessionPrice(adults, children, duration)
    : (() => {
        const selectedPackage = PARTY_PACKAGES.find(pkg => pkg.id === selectedPartyPackage)
        return selectedPackage ? players * selectedPackage.price : 0
      })()

  // Update available times when date or duration changes
  React.useEffect(() => {
    if (selectedDate) {
      let currentDuration = duration
      if (currentFlow === 'party-booking' && selectedPartyPackage) {
        const selectedPackage = PARTY_PACKAGES.find(pkg => pkg.id === selectedPartyPackage)
        currentDuration = selectedPackage ? selectedPackage.duration : 2.5
      }
      
      if (currentDuration) {
        setIsLoadingTimes(true)
        setAvailableTimes([])
        
        fetch(`/api/availability?date=${selectedDate}&duration=${currentDuration}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setAvailableTimes(data.availableSlots)
              setSelectedTime('')
            }
          })
          .catch(error => {
            console.error('Error fetching available times:', error)
            const times = getAvailableTimeSlots(new Date(selectedDate), currentDuration)
            setAvailableTimes(times)
            setSelectedTime('')
          })
          .finally(() => {
            setIsLoadingTimes(false)
          })
      }
    }
  }, [selectedDate, duration, currentFlow, selectedPartyPackage])

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
    const maxGuests = currentFlow === 'party-booking' ? 10 : 5
    
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
        adults: currentFlow === 'vr-booking' ? adults : players,
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

      const cleanBookingData = Object.fromEntries(
        Object.entries(bookingData).filter(([_, value]) => value !== undefined && value !== null)
      )

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanBookingData),
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

      // Create calendar event for the booking
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

      setConfirmedBooking(result.booking)
      setShowConfirmation(true)

    } catch (error) {
      console.error('Error creating booking:', error)
      setSubmitError('Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeConfirmation = () => {
    setShowConfirmation(false)
    setConfirmedBooking(null)
    resetForm()
    setCurrentFlow('main')
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
    setPaymentMethod('cash')
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

  // Confirmation Modal
  if (showConfirmation && confirmedBooking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <Card className="cyber-card">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="mb-4">
                  <img src="/logo.svg" alt="SECOND CITY STUDIO" className="h-20 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
                <p className="text-gray-300">Please screenshot this confirmation for your records</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">Booking Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Booking ID</p>
                      <p className="text-white font-mono">{confirmedBooking.id}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Type</p>
                      <p className="text-white capitalize">
                        {confirmedBooking.bookingType === 'vr' ? 'VR Session' : 
                         confirmedBooking.partyPackage ? `${confirmedBooking.partyPackage} Party` : 'Gaming Party'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p className="text-white">
                        {format(parseISO(confirmedBooking.date), 'EEEE, MMMM do, yyyy')}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Time</p>
                      <p className="text-white">
                        {confirmedBooking.startTime} - {confirmedBooking.duration} hours
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Guests</p>
                      <p className="text-white">
                        {confirmedBooking.bookingType === 'vr' 
                          ? `${confirmedBooking.adults} adults, ${confirmedBooking.children} children`
                          : `${confirmedBooking.adults} players`
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Total Price</p>
                      <p className="text-white font-bold text-lg">{formatPrice(confirmedBooking.totalPrice)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <p className="text-white"><strong>Name:</strong> {confirmedBooking.contactName}</p>
                    <p className="text-white"><strong>Email:</strong> {confirmedBooking.contactEmail}</p>
                    <p className="text-white"><strong>Phone:</strong> {confirmedBooking.contactPhone}</p>
                  </div>
                </div>

                {confirmedBooking.specialRequests && (
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Special Requests</h3>
                    <p className="text-white">{confirmedBooking.specialRequests}</p>
                  </div>
                )}

                <div className="bg-yellow-900/20 border border-yellow-500 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Payment Instructions</h3>
                  <p className="text-yellow-300">
                    Please pay <strong>{formatPrice(confirmedBooking.totalPrice)}</strong> in {confirmedBooking.paymentMethod} when you arrive at the venue.
                  </p>
                </div>
              </div>

              <div className="text-center space-y-3">
                <Button
                  onClick={closeConfirmation}
                  className="cyber-button w-full"
                >
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
            <div className="cyber-card p-4 sm:p-6 md:p-8 text-center hover:scale-105 transition-transform duration-300 flex flex-col h-full">
              <div className="flex-1 mb-4 md:mb-6">
                <Gamepad2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-500 mx-auto mb-3 md:mb-4" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">VR Gaming</h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  VR gaming for up to 5 people booked by the hour
                </p>
              </div>
              <button 
                onClick={startVRBooking}
                className="cyber-button w-full text-sm sm:text-base py-2 sm:py-3 mt-auto"
              >
                Book VR Session
              </button>
            </div>

            {/* Party Booking Option */}
            <div className="cyber-card p-4 sm:p-6 md:p-8 text-center hover:scale-105 transition-transform duration-300 flex flex-col h-full">
              <div className="flex-1 mb-4 md:mb-6">
                <Package className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-500 mx-auto mb-3 md:mb-4" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">Gaming Party</h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Console and VR gaming for up to 10 players, 2.5 hours, cakes, snacks and other options available
                </p>
              </div>
              <button 
                onClick={startPartyBooking}
                className="cyber-button w-full text-sm sm:text-base py-2 sm:py-3 mt-auto"
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
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <button 
                onClick={goBack}
                className="cyber-button mb-4 text-sm sm:text-base"
              >
                ← BACK TO MAIN MENU
              </button>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">VR SESSION BOOKING</h1>
              <p className="text-base sm:text-lg text-gray-300">Book your VR gaming session</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Date & Time Selection */}
              <Card className="cyber-card">
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
                      className="cyber-input w-full text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Start Time</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="cyber-input w-full text-base"
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
                    <label className="block text-sm font-medium mb-2 text-gray-300">Duration (hours)</label>
                    <select
                      value={duration}
                      onChange={(e) => handleDurationChange(Number(e.target.value))}
                      className="cyber-input w-full text-base"
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
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Users className="h-5 w-5 mr-2 text-blue-400" />
                    Guest Count & Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Adults</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={adults}
                        onChange={(e) => handleGuestChange('adults', Number(e.target.value))}
                        className="cyber-input w-full text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Children</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={children}
                        onChange={(e) => handleGuestChange('children', Number(e.target.value))}
                        className="cyber-input w-full text-base"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">Total Price:</span>
                      <span className="text-blue-400 text-xl font-bold">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <Card className="cyber-card mt-6 sm:mt-8">
              <CardHeader>
                <CardTitle className="text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Full Name *</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="cyber-input w-full text-base"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Email *</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="cyber-input w-full text-base"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Phone Number *</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="cyber-input w-full text-base"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Special Requests</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="cyber-input w-full text-base"
                    rows={3}
                    placeholder="Any special requests or requirements..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="cyber-card mt-6 sm:mt-8">
              <CardHeader>
                <CardTitle className="text-white">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card')}
                      className="text-blue-500"
                    />
                    <span className="text-white">Cash</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card')}
                      className="text-blue-500"
                    />
                    <span className="text-white">Card</span>
                  </label>
                  <p className="text-sm text-gray-400 mt-2">
                    Payment will be collected when you arrive at the venue.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="mt-6 sm:mt-8 text-center">
              {submitError && (
                <div className="text-red-400 mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
                  {submitError}
                </div>
              )}
              
              <button
                onClick={handleBooking}
                disabled={isSubmitting || !selectedDate || !selectedTime || !contactName || !contactEmail || !contactPhone}
                className="cyber-button text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Booking...' : `Book VR Session - ${formatPrice(totalPrice)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Party Packages Selection
  if (currentFlow === 'party-packages') {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <button 
                onClick={goBack}
                className="cyber-button mb-4 text-sm sm:text-base"
              >
                ← BACK TO MAIN MENU
              </button>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">PARTY PACKAGES</h1>
              <p className="text-base sm:text-lg text-gray-300">Choose your gaming party package</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
              {PARTY_PACKAGES.map((pkg) => (
                <Card key={pkg.id} className="cyber-card hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col h-full">
                  <CardHeader className="text-center p-4 sm:p-6">
                    <CardTitle className="text-xl sm:text-2xl capitalize text-white">{pkg.name} Package</CardTitle>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-400">£{pkg.price}</div>
                    <div className="text-xs sm:text-sm text-gray-400">per person • {pkg.duration} hours</div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 flex flex-col flex-1">
                    <p className="text-center mb-4 text-gray-300 text-sm sm:text-base">{pkg.description}</p>
                    <ul className="space-y-2 mb-6 flex-1">
                      {pkg.includes.map((item, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => selectPartyPackage(pkg.id)}
                      className="cyber-button w-full mt-auto"
                    >
                      Select Package
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Party Booking Form
  if (currentFlow === 'party-booking') {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <button 
                onClick={goBack}
                className="cyber-button mb-4 text-sm sm:text-base"
              >
                ← BACK TO PACKAGES
              </button>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">PARTY BOOKING</h1>
              <p className="text-base sm:text-lg text-gray-300">Book your gaming party</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Date & Time Selection */}
              <Card className="cyber-card">
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
                      className="cyber-input w-full text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Start Time</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="cyber-input w-full text-base"
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
                    <label className="block text-sm font-medium mb-2 text-gray-300">Number of Players</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={players}
                      onChange={(e) => setPlayers(Number(e.target.value))}
                      className="cyber-input w-full text-base"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Package Details & Pricing */}
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Package className="h-5 w-5 mr-2 text-blue-400" />
                    Package Details & Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const selectedPackage = PARTY_PACKAGES.find(pkg => pkg.id === selectedPartyPackage)
                    if (!selectedPackage) return null

                    return (
                      <>
                        <div className="bg-slate-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">{selectedPackage.name} Package</h3>
                          <p className="text-gray-300 text-sm mb-3">{selectedPackage.description}</p>
                          <div className="text-sm text-gray-400">
                            <p>Duration: {selectedPackage.duration} hours</p>
                            <p>Price per person: £{selectedPackage.price}</p>
                          </div>
                        </div>

                        <div className="bg-slate-800 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-semibold">Total Price:</span>
                            <span className="text-blue-400 text-xl font-bold">{formatPrice(totalPrice)}</span>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <Card className="cyber-card mt-6 sm:mt-8">
              <CardHeader>
                <CardTitle className="text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Full Name *</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="cyber-input w-full text-base"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Email *</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="cyber-input w-full text-base"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Phone Number *</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="cyber-input w-full text-base"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Special Requests</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="cyber-input w-full text-base"
                    rows={3}
                    placeholder="Any special requests or requirements..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="cyber-card mt-6 sm:mt-8">
              <CardHeader>
                <CardTitle className="text-white">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card')}
                      className="text-blue-500"
                    />
                    <span className="text-white">Cash</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card')}
                      className="text-blue-500"
                    />
                    <span className="text-white">Card</span>
                  </label>
                  <p className="text-sm text-gray-400 mt-2">
                    Payment will be collected when you arrive at the venue.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="mt-6 sm:mt-8 text-center">
              {submitError && (
                <div className="text-red-400 mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
                  {submitError}
                </div>
              )}
              
              <button
                onClick={handleBooking}
                disabled={isSubmitting || !selectedDate || !selectedTime || !contactName || !contactEmail || !contactPhone}
                className="cyber-button text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Booking...' : `Book Party - ${formatPrice(totalPrice)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Bookings Lookup
  if (currentFlow === 'bookings') {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <button 
                onClick={goBack}
                className="cyber-button mb-4 text-sm sm:text-base"
              >
                ← BACK TO MAIN MENU
              </button>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">MY BOOKINGS</h1>
              <p className="text-base sm:text-lg text-gray-300">Find and view your bookings</p>
            </div>

            <BookingLookupForm 
              onLookup={async (email, phone, date) => {
                setIsSearching(true)
                setSearchError('')
                
                try {
                  const params = new URLSearchParams({
                    email: email,
                    phone: phone
                  })
                  
                  if (date) {
                    params.append('date', date)
                  }

                  const response = await fetch(`/api/bookings?${params}`)
                  const data = await response.json()

                  if (response.ok) {
                    setLookupResults(data.bookings || [])
                  } else {
                    setSearchError(data.error || 'Failed to find bookings')
                  }
                } catch (error) {
                  console.error('Error searching bookings:', error)
                  setSearchError('Failed to search bookings')
                } finally {
                  setIsSearching(false)
                }
              }}
              isSearching={isSearching}
              searchError={searchError}
              lookupResults={lookupResults}
              lookupEmail={lookupEmail}
              setLookupEmail={setLookupEmail}
              lookupPhone={lookupPhone}
              setLookupPhone={setLookupPhone}
              lookupDate={lookupDate}
              setLookupDate={setLookupDate}
            />

            {lookupResults.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h2 className="text-xl font-bold text-white mb-4">Your Bookings</h2>
                <div className="space-y-4">
                  {lookupResults.map((booking) => (
                    <Card key={booking.id} className="cyber-card">
                      <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {booking.bookingType === 'vr' ? 'VR Session' : 'Gaming Party'}
                            </h3>
                            <p className="text-gray-300">
                              {format(parseISO(booking.date), 'EEEE, MMMM do, yyyy')}
                            </p>
                            <p className="text-gray-300">
                              {booking.startTime} - {booking.duration} hours
                            </p>
                            <p className="text-gray-300">
                              {booking.bookingType === 'vr' 
                                ? `${booking.adults} adults, ${booking.children} children`
                                : `${booking.adults} players`
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-blue-400 text-xl font-bold">{formatPrice(booking.totalPrice)}</p>
                            <p className="text-sm text-gray-400 capitalize">{booking.status}</p>
                            <p className="text-sm text-gray-400 capitalize">{booking.paymentMethod}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
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
  lookupResults,
  lookupEmail,
  setLookupEmail,
  lookupPhone,
  setLookupPhone,
  lookupDate,
  setLookupDate
}: { 
  onLookup: (email: string, phone: string, date?: string) => Promise<void>
  isSearching: boolean
  searchError: string
  lookupResults: Booking[]
  lookupEmail: string
  setLookupEmail: (email: string) => void
  lookupPhone: string
  setLookupPhone: (phone: string) => void
  lookupDate: string
  setLookupDate: (date: string) => void
}) {

  const handleLookup = async () => {
    if (!lookupEmail || !lookupPhone) {
      return
    }

    await onLookup(lookupEmail, lookupPhone, lookupDate || undefined)
  }

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="text-white">Find My Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Email *</label>
            <input
              type="email"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter the email used for booking"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Phone *</label>
            <input
              type="tel"
              value={lookupPhone}
              onChange={(e) => setLookupPhone(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter the phone number used for booking"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Date (Optional)</label>
            <input
              type="date"
              value={lookupDate}
              onChange={(e) => setLookupDate(e.target.value)}
              className="cyber-input w-full"
            />
          </div>

          {searchError && (
            <div className="text-red-400 text-sm">{searchError}</div>
          )}

          <button
            onClick={handleLookup}
            disabled={isSearching || !lookupEmail || !lookupPhone}
            className="cyber-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Find My Bookings'}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
