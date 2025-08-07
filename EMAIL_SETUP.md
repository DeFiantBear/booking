# Email Setup Guide

## Setting up Email Confirmations with Resend

### 1. Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Add Environment Variables
Add these to your `.env.local` file:

```env
# Email Configuration
RESEND_API_KEY=your_resend_api_key_here
ADMIN_EMAIL=contact@secondcitystudio.xyz
```

### 3. Update Email Settings
In `lib/email.ts`, update these fields:
- `from: 'VR Arcade <bookings@yourdomain.com>'` - Change to your domain
- Contact information in the email templates

### 4. Verify Domain (Optional but Recommended)
1. In Resend dashboard, add your domain
2. Update the `from` email to use your verified domain
3. This improves email deliverability

### 5. Test the Setup
1. Make a test booking
2. Check if confirmation emails are sent
3. Check Vercel function logs for email status

## Email Features

### Customer Confirmation Email
- Booking details and confirmation
- Arrival instructions
- Contact information
- What to expect

### Admin Notification Email
- New booking notification
- Customer details
- Booking information
- Action required

## Troubleshooting

### Emails not sending?
1. Check `RESEND_API_KEY` is set correctly
2. Check Vercel function logs for errors
3. Verify your Resend account is active

### Emails going to spam?
1. Verify your domain with Resend
2. Use a custom domain for sending
3. Check email content for spam triggers

## Customization

You can customize the email templates in `lib/email.ts`:
- Update styling and colors
- Add your logo
- Modify content and messaging
- Add additional information 