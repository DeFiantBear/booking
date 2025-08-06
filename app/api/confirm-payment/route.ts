import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      // Payment was successful
      // Here you would update your booking status in the database
      const bookingId = paymentIntent.metadata.bookingId

      // TODO: Update booking status to 'confirmed' and payment status to 'paid'
      console.log(`Payment confirmed for booking: ${bookingId}`)

      return NextResponse.json({
        success: true,
        bookingId,
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