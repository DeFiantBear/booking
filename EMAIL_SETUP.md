# Email Setup Guide

## Setting up Email Confirmations with Resend

### 1. Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Add Environment Variables
Create a `.env.local` file in your project root and add these variables:

```env
# Email Configuration
RESEND_API_KEY=re_your_resend_api_key_here
ADMIN_EMAIL=contact@secondcitystudio.xyz

# Stripe Configuration (if not already set)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

**Important**: Replace `re_your_resend_api_key_here` with your actual Resend API key.

### 3. Update Email Settings
In `lib/email.ts`, update these fields if needed:
- `from: 'VR Arcade <contact@secondcitystudio.xyz>'` - Change to your domain
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
1. **Check RESEND_API_KEY**: Ensure it's set correctly in `.env.local`
2. **Check API Key Format**: Should start with `re_`
3. **Check Vercel Function Logs**: Look for email-related console messages
4. **Verify Resend Account**: Ensure your account is active and has credits
5. **Check Domain Verification**: If using custom domain, ensure it's verified

### Common Error Messages:
- `⚠️ RESEND_API_KEY is not configured` - Add the API key to `.env.local`
- `❌ Error sending customer confirmation` - Check Resend dashboard for specific errors
- `📧 Email sending skipped` - API key is missing or invalid

### Emails going to spam?
1. Verify your domain with Resend
2. Use a custom domain for sending
3. Check email content for spam triggers
4. Ensure proper SPF/DKIM records

### Testing Locally:
1. Create `.env.local` file with your API key
2. Run `npm run dev`
3. Make a test booking
4. Check terminal logs for email status

### Production Deployment:
1. Add environment variables in Vercel dashboard
2. Ensure `RESEND_API_KEY` is set in production
3. Check Vercel function logs for email delivery status

## Customization

You can customize the email templates in `lib/email.ts`:
- Update styling and colors
- Add your logo
- Modify content and messaging
- Add additional information

## Support

If you're still having issues:
1. Check the Resend documentation: https://resend.com/docs
2. Verify your API key in the Resend dashboard
3. Check the email delivery logs in Resend dashboard
4. Ensure your account has sufficient credits 