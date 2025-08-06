'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PARTY_PACKAGES } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'
import { Package, Users, Clock, Check, Star } from 'lucide-react'
import Link from 'next/link'

export default function PartyPackages() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Party Packages</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Celebrate your special occasions with our exclusive VR party packages. 
          Perfect for birthdays, corporate events, and group celebrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {PARTY_PACKAGES.map((pkg) => (
          <Card 
            key={pkg.id} 
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
              selectedPackage === pkg.id ? 'ring-2 ring-vr-500 shadow-lg' : ''
            }`}
          >
            {pkg.name === 'platinum' && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                <Star className="h-4 w-4 inline mr-1" />
                Most Popular
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-vr-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-vr-600" />
              </div>
              <CardTitle className="text-2xl font-bold capitalize text-vr-700">
                {pkg.name} Package
              </CardTitle>
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(pkg.price)}
              </div>
              <CardDescription className="text-gray-600">
                {pkg.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{pkg.duration} hours</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Up to {pkg.maxGuests} guests</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">What's Included:</h4>
                <ul className="space-y-2">
                  {pkg.includes.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full bg-vr-600 hover:bg-vr-700 text-white"
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  Book {pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1)} Package
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Package Comparison */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center">Package Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  {PARTY_PACKAGES.map((pkg) => (
                    <th key={pkg.id} className="text-center py-3 px-4 capitalize">
                      {pkg.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Duration</td>
                  {PARTY_PACKAGES.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-4">
                      {pkg.duration} hours
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Max Guests</td>
                  {PARTY_PACKAGES.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-4">
                      {pkg.maxGuests}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Price</td>
                  {PARTY_PACKAGES.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-4 font-bold">
                      {formatPrice(pkg.price)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Dedicated Game Master</td>
                  {PARTY_PACKAGES.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-4">
                      {pkg.name === 'silver' ? '❌' : '✅'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Premium Refreshments</td>
                  {PARTY_PACKAGES.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-4">
                      {pkg.name === 'silver' ? '❌' : '✅'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Party Photos & Videos</td>
                  {PARTY_PACKAGES.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-4">
                      {pkg.name === 'platinum' ? '✅' : '❌'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Custom Playlist</td>
                  {PARTY_PACKAGES.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-4">
                      {pkg.name === 'platinum' ? '✅' : '❌'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center">
        <Card className="bg-gradient-to-r from-vr-50 to-vr-100 border-vr-200">
          <CardContent className="py-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Book Your VR Party?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Contact us to discuss your party requirements and secure your preferred date. 
              We'll help you create an unforgettable VR experience for your special occasion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-vr-600 hover:bg-vr-700 text-white px-8 py-3">
                Book Now
              </Button>
              <Button variant="outline" className="border-vr-600 text-vr-600 hover:bg-vr-50 px-8 py-3">
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 