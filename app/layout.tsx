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
  openGraph: {
    title: 'SECOND CITY STUDIO',
    description: 'Book your VR gaming sessions and party packages',
    images: [
      {
        url: 'https://booking.secondcitystudio.xyz/miniapp-embed.png',
        width: 1200,
        height: 800,
        alt: 'SECOND CITY STUDIO VR Arcade Booking',
      },
    ],
    type: 'website',
    url: 'https://booking.secondcitystudio.xyz',
  },
  other: {
    // Farcaster Mini App meta tags
    'fc:miniapp': '{"version":"1","imageUrl":"https://booking.secondcitystudio.xyz/miniapp-embed.png","button":{"title":"Book VR Session","action":{"url":"https://booking.secondcitystudio.xyz","method":"GET"}}}',
    
    // Farcaster Frame meta tags - CRITICAL for embed previews
    'fc:frame': '{"version":"1","imageUrl":"https://booking.secondcitystudio.xyz/miniapp-embed.png","button":{"title":"Book VR Session","action":{"url":"https://booking.secondcitystudio.xyz","method":"GET"}}}',
    'fc:frame:image': 'https://booking.secondcitystudio.xyz/miniapp-embed.png',
    'fc:frame:image:width': '1200',
    'fc:frame:image:height': '800',
    'fc:frame:button:1': 'Book VR Session',
    'fc:frame:button:1:action': 'post_redirect',
    'fc:frame:button:1:target': 'https://booking.secondcitystudio.xyz',
    
    // Additional Farcaster properties
    'fc:frame:state': '{"version":"1"}',
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
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
} 