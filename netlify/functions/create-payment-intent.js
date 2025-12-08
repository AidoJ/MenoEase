/**
 * Netlify Function: Create Payment Intent
 * 
 * Creates a Stripe Payment Intent for embedded payment form
 * Used for subscription payments with embedded Stripe Elements
 * 
 * Environment Variables Required:
 * - STRIPE_SECRET_KEY
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { priceId, tierCode, period, userId } = JSON.parse(event.body)

    // Validate required fields
    if (!priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required field: priceId' })
      }
    }

    // Get price details from Stripe
    const price = await stripe.prices.retrieve(priceId)
    
    if (!price) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Price not found' })
      }
    }

    // Create payment intent for subscription
    // Note: For subscriptions, we should use SetupIntent or create subscription directly
    // This creates a payment intent that can be used for one-time payments
    // For recurring subscriptions, we'll create the subscription after payment succeeds
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: price.currency,
      metadata: {
        price_id: priceId,
        tier_code: tierCode,
        period: period,
        user_id: userId || 'anonymous'
      },
      // For subscriptions, we'll handle the subscription creation in the webhook
      // after payment succeeds
    })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      })
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create payment intent',
        message: error.message
      })
    }
  }
}

