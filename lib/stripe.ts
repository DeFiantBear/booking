import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Create payment intent for booking
export async function createPaymentIntent(amount: number, bookingId?: string) {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        bookingId,
        currency: 'gbp',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create payment intent')
    }

    const data = await response.json()
    return data.clientSecret
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

// Confirm payment
export async function confirmPayment(paymentIntentId: string) {
  try {
    const response = await fetch('/api/confirm-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to confirm payment')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error confirming payment:', error)
    throw error
  }
}

// Format amount for Stripe (convert to cents)
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100)
}

// Format amount from Stripe (convert from cents)
export function formatAmountFromStripe(amount: number): number {
  return amount / 100
} 