import BookingSystem from '@/components/BookingSystem'
import { MiniAppWrapper } from '../components/MiniAppWrapper'

export default function Home() {
  return (
    <MiniAppWrapper>
      <div className="min-h-screen bg-black">
        <BookingSystem />
      </div>
    </MiniAppWrapper>
  )
} 