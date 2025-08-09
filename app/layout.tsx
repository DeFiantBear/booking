import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SECOND CITY STUDIO - VR Arcade Booking',
  description: 'Book your VR gaming sessions and party packages at SECOND CITY STUDIO',
  keywords: 'VR, arcade, booking, gaming, virtual reality, party packages, SECOND CITY STUDIO',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://auth.farcaster.xyz" />
        {/* Farcaster Mini App Embed Meta Tags */}
        <meta property="fc:miniapp" content='{"version":"1","imageUrl":"https://booking.secondcitystudio.xyz/miniapp-embed.png","button":{"title":"Book VR Session","action":{"url":"https://booking.secondcitystudio.xyz","method":"GET"}}}' />
        <meta property="fc:frame" content='{"version":"1","imageUrl":"https://booking.secondcitystudio.xyz/miniapp-embed.png","button":{"title":"Book VR Session","action":{"url":"https://booking.secondcitystudio.xyz","method":"GET"}}}' />
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
} 