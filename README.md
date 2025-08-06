# VR Arcade Booking System

A modern, full-stack booking system for VR arcades with Farcaster integration and dual payment options (Stripe + USDC).

## Features

### 🎮 Core Booking System
- **Session Bookings**: Book VR sessions by the hour (1-6 hours)
- **Party Packages**: Silver (£150), Gold (£200), Platinum (£250) packages
- **Real-time Availability**: Dynamic time slot management
- **Pricing**: £15/hour for adults, £10/hour for children
- **Business Hours**: 12PM - 10PM daily

### 🔐 Authentication & Payments
- **Farcaster Integration**: Quick auth with Farcaster accounts
- **Dual Payment Options**: 
  - Traditional: Stripe (credit/debit cards)
  - Crypto: USDC payments
- **Secure Payment Processing**: Server-side payment validation

### 📱 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Built with Tailwind CSS and shadcn/ui
- **Real-time Updates**: Live pricing calculations
- **Booking Management**: View, modify, and cancel bookings

### 🎯 Business Features
- **Party Packages**: 2.5-hour packages for special occasions
- **Guest Management**: Up to 6 players for sessions, up to 10 for parties
- **Contact Information**: Integrated contact forms
- **Booking History**: Complete booking management system

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: Farcaster Auth Kit
- **Payments**: Stripe + USDC integration
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Stripe account (for payments)
- Farcaster developer account (for auth)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vr-arcade-booking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   
   # Farcaster Configuration
   FARCASTER_DEVELOPER_MNEMONIC=your_mnemonic_here
   FARCASTER_APP_FID=your_app_fid_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### Business Settings

Update the business configuration in `lib/constants.ts`:

```typescript
export const BUSINESS_HOURS: BusinessHours = {
  open: '12:00',
  close: '22:00',
  daysOpen: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
}

export const PRICING: Pricing = {
  adultPerHour: 15,
  childPerHour: 10,
  partyPackages: {
    silver: 150,
    gold: 200,
    platinum: 250,
  },
}
```

### Party Packages

Customize party packages in `lib/constants.ts`:

```typescript
export const PARTY_PACKAGES: PartyPackage[] = [
  {
    id: 'silver',
    name: 'silver',
    price: 150,
    duration: 2.5,
    maxGuests: 6,
    description: 'Perfect for small groups and birthday parties',
    includes: [
      '2.5 hours of VR gaming',
      'Up to 6 guests',
      'Basic refreshments',
      // ... more features
    ],
  },
  // ... other packages
]
```

## API Routes

### Payment Processing

- `POST /api/create-payment-intent` - Create Stripe payment intent
- `POST /api/confirm-payment` - Confirm payment and update booking

### Example Usage

```typescript
// Create payment intent
const clientSecret = await createPaymentIntent(150, 'BK123456')

// Process USDC payment
const result = await processUSDCTransaction(150, 'recipient_address', 'user_address')
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Stripe secret key for payment processing | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for frontend | Yes |
| `FARCASTER_DEVELOPER_MNEMONIC` | Farcaster developer mnemonic | Yes |
| `FARCASTER_APP_FID` | Farcaster app FID | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email info@vrarcade.com or create an issue in this repository.

## Roadmap

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Mobile app
- [ ] Multi-location support
- [ ] Advanced booking rules
- [ ] Integration with VR game platforms 