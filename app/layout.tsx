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
        
        {/* Farcaster Mini App Meta Tags */}
        <meta property="fc:miniapp" content='{"version":"1","imageUrl":"https://booking.secondcitystudio.xyz/miniapp-embed.png","button":{"title":"Book VR Session","action":{"url":"https://booking.secondcitystudio.xyz","method":"GET"}}}' />
        
        {/* Farcaster Frame Meta Tags - CRITICAL for Embed Previews */}
        <meta property="fc:frame" content='{"version":"1","imageUrl":"https://booking.secondcitystudio.xyz/miniapp-embed.png","button":{"title":"Book VR Session","action":{"url":"https://booking.secondcitystudio.xyz","method":"GET"}}}' />
        <meta property="fc:frame:image" content="https://booking.secondcitystudio.xyz/miniapp-embed.png" />
        <meta property="fc:frame:image:width" content="1200" />
        <meta property="fc:frame:image:height" content="800" />
        <meta property="fc:frame:button:1" content="Book VR Session" />
        <meta property="fc:frame:button:1:action" content="post_redirect" />
        <meta property="fc:frame:button:1:target" content="https://booking.secondcitystudio.xyz" />
        <meta property="fc:frame:state" content='{"version":"1"}' />
        
        {/* Additional Open Graph tags for maximum compatibility */}
        <meta property="og:title" content="SECOND CITY STUDIO" />
        <meta property="og:description" content="Book your VR gaming sessions and party packages" />
        <meta property="og:image" content="https://booking.secondcitystudio.xyz/miniapp-embed.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="800" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://booking.secondcitystudio.xyz" />
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
} 