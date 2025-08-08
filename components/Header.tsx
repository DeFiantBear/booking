'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Gamepad2, Users, Calendar, Package } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-vr-600 to-vr-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Gamepad2 className="h-8 w-8 text-vr-200" />
            <div>
              <h1 className="text-2xl font-bold">SECOND CITY STUDIO</h1>
              <p className="text-vr-200 text-sm">VR Arcade & Gaming</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-vr-200 transition-colors">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Book Session</span>
              </div>
            </Link>
            <Link href="/party-packages" className="hover:text-vr-200 transition-colors">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Party Packages</span>
              </div>
            </Link>
            <Link href="/my-bookings" className="hover:text-vr-200 transition-colors">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>My Bookings</span>
              </div>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="outline" className="border-vr-200 text-vr-200 hover:bg-vr-200 hover:text-vr-800">
              Connect Wallet
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4">
          <div className="flex justify-around">
            <Link href="/" className="flex flex-col items-center space-y-1 text-vr-200 hover:text-white">
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Book</span>
            </Link>
            <Link href="/party-packages" className="flex flex-col items-center space-y-1 text-vr-200 hover:text-white">
              <Package className="h-5 w-5" />
              <span className="text-xs">Parties</span>
            </Link>
            <Link href="/my-bookings" className="flex flex-col items-center space-y-1 text-vr-200 hover:text-white">
              <Users className="h-5 w-5" />
              <span className="text-xs">Bookings</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
} 