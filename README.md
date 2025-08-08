# VR Arcade Booking System

A comprehensive booking system for VR arcade sessions and gaming parties, built with Next.js and Supabase.

## 🎮 Features

### Customer Features
- **VR Sessions**: Book hourly VR sessions for up to 5 people
- **Party Packages**: Silver (£15), Gold (£20), and Platinum (£25) packages for up to 10 people
- **Real-time Availability**: Check available time slots instantly
- **Booking Confirmation**: Detailed confirmation popup with screenshot suggestion
- **Booking Lookup**: View your bookings by email and phone
- **Special Requests**: Add custom requests to your booking
- **Payment Options**: Cash payment (USDC coming soon)

### Admin Features
- **Admin Dashboard**: View and manage all bookings
- **Booking Management**: Confirm, cancel, and mark bookings as completed
- **Filtering**: Filter by status, type, and date
- **Statistics**: View total bookings, revenue, and status breakdowns
- **Special Requests**: See customer special requests clearly displayed

### Technical Features
- **Double-booking Prevention**: Prevents overlapping bookings
- **Email Confirmations**: Automatic booking confirmations via Resend
- **Calendar Integration**: Google Calendar export for confirmed bookings
- **Rate Limiting**: Prevents spam bookings
- **Responsive Design**: Works on all devices
- **TypeScript**: Full type safety

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Resend account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd booking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your actual values.

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL from `SUPABASE_SECURITY_SETUP.sql` in your Supabase SQL editor
   - Add your Supabase URL and anon key to `.env.local`

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

### Required
```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Optional but Recommended
```env
# Email Configuration (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
ADMIN_EMAIL=contact@secondcitystudio.xyz

# Google Calendar Integration
GOOGLE_CALENDAR_ID=your_calendar_id_here
GOOGLE_CLIENT_EMAIL=your_service_account_email_here
GOOGLE_PRIVATE_KEY=your_private_key_here
```

### Future Features
```env
# Stripe Configuration (for USDC payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## 📁 Project Structure

```
booking/
├── app/                    # Next.js app router
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── my-bookings/       # Customer booking lookup
│   └── party-packages/    # Party package display
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── BookingSystem.tsx # Main booking interface
├── lib/                  # Utility functions
│   ├── database.ts       # Database operations
│   ├── supabase.ts       # Supabase client
│   ├── email.ts          # Email functionality
│   └── utils.ts          # Helper functions
└── data/                 # Local data storage
```

## 🎯 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Payments**: Stripe (coming soon)
- **Calendar**: Google Calendar API
- **Deployment**: Vercel

## 🔒 Security

- Row Level Security (RLS) enabled on Supabase
- Rate limiting on booking API
- Input validation and sanitization
- Secure environment variable handling

## 🚀 Deployment

The app is configured for Vercel deployment with automatic deployments from Git.

### Production Checklist
- [ ] Set up Supabase with RLS policies
- [ ] Configure Resend email service
- [ ] Set up Google Calendar integration
- [ ] Test all booking flows
- [ ] Verify admin dashboard functionality

## 🔮 Future Features

- **USDC Payments**: Crypto payment integration
- **Farcaster Integration**: Mini app for Farcaster
- **SMS Notifications**: Text message confirmations
- **Advanced Analytics**: Detailed booking analytics
- **Multi-location Support**: Support for multiple venues

## 📞 Support

For support or questions, please contact the development team. 