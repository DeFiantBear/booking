import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment succeeded:', paymentIntent.id)
      
      // Update booking status to paid
      const bookingId = paymentIntent.metadata.bookingId
      if (bookingId) {
        try {
          const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bookings/${bookingId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentStatus: 'paid',
              status: 'confirmed'
            }),
          })

          if (updateResponse.ok) {
            console.log(`Booking ${bookingId} updated to paid`)
          } else {
            console.error(`Failed to update booking ${bookingId}`)
          }
        } catch (error) {
          console.error('Error updating booking:', error)
        }
      }
      break

    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment failed:', failedPaymentIntent.id)
      
      // Update booking status to failed
      const failedBookingId = failedPaymentIntent.metadata.bookingId
      if (failedBookingId) {
        try {
          const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bookings/${failedBookingId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentStatus: 'failed',
              status: 'cancelled'
            }),
          })

          if (updateResponse.ok) {
            console.log(`Booking ${failedBookingId} updated to failed`)
          } else {
            console.error(`Failed to update booking ${failedBookingId}`)
          }
        } catch (error) {
          console.error('Error updating booking:', error)
        }
      }
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
