'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, CreditCard, Wallet, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react'
import { formatDate, formatTime, formatPrice } from '@/lib/utils'

// Mock data - in a real app, this would come from your database
const mockBookings = [
  {
    id: 'BK001',
    type: 'session',
    date: '2024-01-15',
    startTime: '14:00',
    endTime: '16:00',
    duration: 2,
    adults: 2,
    children: 1,
    totalPrice: 80,
    status: 'confirmed',
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'BK002',
    type: 'party',
    packageName: 'Gold Package',
    date: '2024-01-20',
    startTime: '15:00',
    endTime: '17:30',
    guestCount: 6,
    totalPrice: 200,
    status: 'pending',
    paymentMethod: 'usdc',
    paymentStatus: 'pending',
    createdAt: new Date('2024-01-12'),
  },
  {
    id: 'BK003',
    type: 'session',
    date: '2024-01-08',
    startTime: '16:00',
    endTime: '17:00',
    duration: 1,
    adults: 1,
    children: 0,
    totalPrice: 15,
    status: 'completed',
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    createdAt: new Date('2024-01-05'),
  },
]

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    return method === 'usdc' ? (
      <Wallet className="h-4 w-4" />
    ) : (
      <CreditCard className="h-4 w-4" />
    )
  }

  const upcomingBookings = mockBookings.filter(booking => 
    booking.status === 'confirmed' || booking.status === 'pending'
  )
  
  const pastBookings = mockBookings.filter(booking => 
    booking.status === 'completed' || booking.status === 'cancelled'
  )

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-gray-600">Manage your VR arcade bookings and view your history</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-white text-vr-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'past'
                  ? 'bg-white text-vr-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past ({pastBookings.length})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(booking.status)}
                    <div>
                      <CardTitle className="text-lg">
                        {booking.type === 'party' ? booking.packageName : 'VR Session'}
                      </CardTitle>
                      <p className="text-sm text-gray-500">Booking #{booking.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{formatDate(booking.date)}</p>
                      <p className="text-xs text-gray-500">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {booking.type === 'party' ? '2.5 hours' : `${booking.duration || 1} hour${(booking.duration || 1) > 1 ? 's' : ''}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.type === 'party' ? `${booking.guestCount} guests` : `${booking.adults} adults, ${booking.children} children`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getPaymentMethodIcon(booking.paymentMethod)}
                    <div>
                      <p className="text-sm font-medium">
                        {booking.paymentMethod === 'usdc' ? 'USDC' : 'Card'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-vr-600">
                      {formatPrice(booking.totalPrice)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Booked on {formatDate(booking.createdAt.toISOString().split('T')[0])}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                {activeTab === 'upcoming' && booking.status === 'confirmed' && (
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      Modify Booking
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      Cancel Booking
                    </Button>
                    <Button size="sm" className="bg-vr-600 hover:bg-vr-700">
                      View Details
                    </Button>
                  </div>
                )}
                
                {activeTab === 'upcoming' && booking.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button size="sm" className="bg-vr-600 hover:bg-vr-700">
                      Complete Payment
                    </Button>
                    <Button variant="outline" size="sm">
                      Cancel Booking
                    </Button>
                  </div>
                )}
                
                {activeTab === 'past' && (
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      Book Again
                    </Button>
                    <Button variant="outline" size="sm">
                      Leave Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {activeTab} bookings
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming bookings. Book your next VR session now!"
                  : "You don't have any past bookings yet."
                }
              </p>
              {activeTab === 'upcoming' && (
                <Button className="bg-vr-600 hover:bg-vr-700">
                  Book a Session
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 