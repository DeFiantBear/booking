'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Clock, Mail, Phone, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { formatPrice } from '@/lib/utils'

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
  createdAt: string
  bookingType: 'vr' | 'party'
  partyPackage?: string
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      setError('')
      if (process.env.NODE_ENV === 'development') {
        console.log('Loading admin bookings...')
      }
      
      const response = await fetch('/api/admin/bookings')
      if (process.env.NODE_ENV === 'development') {
        console.log('Admin API response status:', response.status)
      }
      
      const result = await response.json()
      if (process.env.NODE_ENV === 'development') {
        console.log('Admin API result:', result)
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load bookings')
      }

      setBookings(result.bookings || [])
      if (process.env.NODE_ENV === 'development') {
        console.log('Bookings loaded:', result.bookings?.length || 0)
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
      setError('Failed to load bookings: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, status })
      })

      if (!response.ok) {
        throw new Error('Failed to update booking status')
      }

      // Reload bookings to get updated data
      await loadBookings()
    } catch (error) {
      console.error('Error updating booking status:', error)
      alert('Failed to update booking status')
    }
  }

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/bookings?bookingId=${bookingId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete booking')
      }

      // Reload bookings to get updated data
      await loadBookings()
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Failed to delete booking')
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const statusMatch = filterStatus === 'all' || booking.status === filterStatus
    const typeMatch = filterType === 'all' || booking.bookingType === filterType
    return statusMatch && typeMatch
  })

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    vr: bookings.filter(b => b.bookingType === 'vr').length,
    party: bookings.filter(b => b.bookingType === 'party').length,
    revenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading bookings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Admin Dashboard</h1>
            <p className="text-slate-300">Manage all VR arcade bookings</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
                <div className="text-sm text-slate-400">Total Bookings</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                <div className="text-sm text-slate-400">Pending</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-400">{stats.confirmed}</div>
                <div className="text-sm text-slate-400">Confirmed</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-cyan-400">{formatPrice(stats.revenue)}</div>
                <div className="text-sm text-slate-400">Total Revenue</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-600 rounded-md bg-slate-700 text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-slate-600 rounded-md bg-slate-700 text-white"
            >
              <option value="all">All Types</option>
              <option value="vr">VR Sessions</option>
              <option value="party">Party Packages</option>
            </select>

            <Button onClick={loadBookings} className="bg-blue-600 hover:bg-blue-700">
              Refresh
            </Button>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <Card className="text-center py-12 bg-slate-800 border-slate-700">
                <CardContent>
                  <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No bookings found</h3>
                  <p className="text-slate-300">Try adjusting your filters or refresh the page.</p>
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map((booking) => (
                <Card key={booking.id} className="bg-slate-800 border-slate-700">
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
                          booking.status === 'cancelled' ? 'text-red-400 bg-red-900/20 border-red-500' :
                          'text-slate-400 bg-slate-700 border-slate-600'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                      
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-white">{booking.contactEmail || 'Not provided'}</p>
                          <p className="text-xs text-slate-400">{booking.contactPhone || 'Not provided'}</p>
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

                    {booking.specialRequests && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-300">
                          <strong>Special Requests:</strong> {booking.specialRequests}
                        </p>
                      </div>
                    )}

                    {/* Admin Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div className="flex space-x-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-400 hover:bg-red-900/20"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => deleteBooking(booking.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 