/**
 * Netlify Function: Create Setup Intent
 * 
 * Creates a Stripe Setup Intent for saving payment method for subscriptions
 * This is the recommended approach for recurring subscriptions
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
    const { userId, priceId, tierCode, period } = JSON.parse(event.body)

    // Validate required fields
    if (!userId || !priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: userId, priceId' })
      }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('email, first_name, last_name, stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User profile not found' })
      }
    }

    let customerId = profile.stripe_customer_id

    // Create or retrieve customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        metadata: {
          user_id: userId
        }
      })
      customerId = customer.id

      // Update user profile with customer ID
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId)
    }

    // Create setup intent for saving payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata: {
        user_id: userId,
        price_id: priceId,
        tier_code: tierCode,
        period: period
      }
    })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
        customerId: customerId
      })
    }
  } catch (error) {
    console.error('Error creating setup intent:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create setup intent',
        message: error.message
      })
    }
  }
}

