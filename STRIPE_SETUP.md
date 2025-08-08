# Stripe Payment Integration Setup

## Overview
This booking system now includes Stripe payment processing for secure card payments. Customers can choose between cash payment at the venue or secure online card payment.

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Getting Your Stripe Keys

1. **Create a Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **Get API Keys**: 
   - Go to Dashboard → Developers → API Keys
   - Copy your Publishable Key and Secret Key
3. **Set Up Webhooks**:
   - Go to Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook signing secret

## Features Implemented

### Payment Method Selection
- **Card Payment**: Secure Stripe processing
- **Cash Payment**: Pay at venue (existing functionality)
- **USDC**: Placeholder for future crypto payments

### Stripe Integration
- **Payment Intent Creation**: Creates payment intents with booking metadata
- **Card Element**: Secure card input form
- **Payment Confirmation**: Handles successful/failed payments
- **Webhook Processing**: Updates booking status automatically
- **Error Handling**: User-friendly error messages

### User Experience
- **Loading States**: Shows processing status during payment
- **Error Display**: Clear error messages for failed payments
- **Success Flow**: Automatic booking confirmation after payment
- **Responsive Design**: Works on mobile and desktop

## Payment Flow

1. **Customer selects payment method** (Card/Cash)
2. **If Card selected**: Stripe Elements form appears
3. **Customer enters card details** securely
4. **System creates booking** and payment intent
5. **Stripe processes payment** and confirms
6. **Webhook updates booking** status to "paid"
7. **Customer sees confirmation** screen

## Testing

### Test Cards
Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test Mode
- All keys should use `sk_test_` and `pk_test_` prefixes
- No real charges will be made
- Perfect for development and testing

## Production Deployment

1. **Switch to Live Keys**: Replace test keys with live keys
2. **Update Webhook URL**: Point to your production domain
3. **Test Thoroughly**: Ensure all payment flows work
4. **Monitor Webhooks**: Check Stripe dashboard for webhook delivery

## Security Features

- **PCI Compliance**: Stripe handles all card data
- **Webhook Verification**: Ensures webhooks come from Stripe
- **Metadata Tracking**: Links payments to specific bookings
- **Error Handling**: Graceful failure handling

## Troubleshooting

### Common Issues
1. **"Stripe not loaded"**: Check publishable key
2. **"Payment failed"**: Check secret key and webhook setup
3. **"Webhook verification failed"**: Check webhook secret

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your environment.

## Support

For Stripe-specific issues, refer to:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
