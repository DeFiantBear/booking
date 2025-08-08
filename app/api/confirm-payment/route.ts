import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, bookingId } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      // If bookingId is provided, update the payment intent metadata
      if (bookingId) {
        await stripe.paymentIntents.update(paymentIntentId, {
          metadata: {
            ...paymentIntent.metadata,
            bookingId,
          },
        })
      }

      // Payment was successful
      const finalBookingId = bookingId || paymentIntent.metadata.bookingId

      if (process.env.NODE_ENV === 'development') {
        console.log(`Payment confirmed for booking: ${finalBookingId}`)
      }

      return NextResponse.json({
        success: true,
        bookingId: finalBookingId,
        paymentStatus: 'paid',
        amount: paymentIntent.amount / 100, // Convert from cents
      })
    } else {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
} 