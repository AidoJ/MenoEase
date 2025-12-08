/**
 * Netlify Function: Create Subscription with Payment Method
 * 
 * Creates a Stripe subscription after payment method is confirmed
 * This is called after the payment intent succeeds
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
    const { paymentMethodId, customerId, userId, priceId, tierCode, period } = JSON.parse(event.body)

    // Validate required fields
    if (!paymentMethodId || !customerId || !userId || !priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      }
    }

    // Payment method should already be attached to customer from setup intent
    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: userId,
        tier_code: tierCode,
        period: period
      }
    })

    // Update user profile with subscription
    await supabase
      .from('user_profiles')
      .update({
        stripe_subscription_id: subscription.id,
        subscription_tier: tierCode,
        subscription_status: subscription.status,
        subscription_period: period,
        subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString().split('T')[0],
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
      })
      .eq('user_id', userId)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscriptionId: subscription.id,
        status: subscription.status,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
      })
    }
  } catch (error) {
    console.error('Error creating subscription:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create subscription',
        message: error.message
      })
    }
  }
}

