import BookingSystem from '@/components/BookingSystem'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <div className="text-center py-8 px-4">
        <h1 className="cyber-title text-4xl md:text-6xl mb-4">
          VR ARCADE BOOKING SYSTEM
        </h1>
        
        <p className="terminal-text text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          ENTER THE MATRIX • BOOK YOUR SESSION • EXPERIENCE THE FUTURE
        </p>
        
        <div className="terminal-text text-sm mb-8">
          SYSTEM STATUS: ONLINE | AVAILABLE SLOTS: ACTIVE | PAYMENT GATEWAYS: SECURE
        </div>
      </div>

      {/* Main Booking System */}
      <div className="container mx-auto px-4 pb-8">
        <div className="cyber-card rounded-lg p-6 md:p-8">
          <BookingSystem />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 px-4">
        <div className="terminal-text text-sm">
          POWERED BY CYBER TECH | © 2024 VR ARCADE SYSTEM
        </div>
      </div>
    </div>
  )
} 