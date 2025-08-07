# VR Arcade Booking System

A comprehensive booking system for VR arcade sessions and gaming parties.

## Features

- **VR Sessions**: Book hourly VR sessions for up to 5 people
- **Party Packages**: Silver, Gold, and Platinum packages for up to 10 people
- **Payment Integration**: Stripe and cash payment options
- **Email Confirmations**: Automatic booking confirmations via Resend
- **Admin Dashboard**: View and manage all bookings
- **Calendar Integration**: Check availability and export to calendar
- **Double-booking Prevention**: Prevents overlapping bookings

## Environment Variables

Required environment variables for full functionality:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend Email (Optional - for email confirmations)
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=contact@secondcitystudio.xyz
```

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- Resend (Email)
- Stripe (Payments)

## Deployment

Deployed on Vercel with automatic deployments from Git. 