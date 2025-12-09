/**
 * Netlify Function: Create Stripe Checkout Session
 *
 * Creates a Stripe Checkout session for subscription purchases
 *
 * Environment Variables Required:
 * - STRIPE_SECRET_KEY
 * - VITE_APP_URL (or fallback to Netlify URL)
 */

// Don't initialize clients at module level - environment variables may not be available
// Initialize them inside the handler function after verifying env vars exist
const { createClient } = require('@supabase/supabase-js')
const stripeLib = require('stripe')

exports.handler = async (event, context) => {
  console.log('Checkout session function called', {
    method: event.httpMethod,
    path: event.path,
    hasBody: !!event.body
  })

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  // Check for required environment variables
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set')
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: Stripe key not set' })
    }
  }

  // Get Supabase URL (try SUPABASE_URL first, fallback to VITE_SUPABASE_URL)
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  
  if (!supabaseUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase environment variables not set', {
      hasUrl: !!supabaseUrl,
      hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasViteUrl: !!process.env.VITE_SUPABASE_URL
    })
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: Supabase credentials not set. Please add SUPABASE_URL or VITE_SUPABASE_URL environment variable.' })
    }
  }

  // Initialize clients inside handler after env vars are verified
  const supabase = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Initialize Stripe client
  const stripe = stripeLib(process.env.STRIPE_SECRET_KEY)

  try {
    // Parse request body
    let body
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    } catch (parseError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message })
      }
    }

    const { priceId, userId, tierCode, period, amount, tierName } = body

    // Validate required fields
    if (!userId || !tierCode || !period) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: userId, tierCode, period' })
      }
    }

    // Get user profile
    console.log('Fetching user profile for:', userId)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('email, first_name, last_name, stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return {
        statusCode: 404,
        body: JSON.stringify({ 
          error: 'User profile not found',
          details: profileError.message 
        })
      }
    }

    if (!profile) {
      console.error('Profile is null for user:', userId)
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User profile not found' })
      }
    }

    console.log('Profile found:', { email: profile.email, hasStripeCustomer: !!profile.stripe_customer_id })

    // Determine success and cancel URLs
    const appUrl = process.env.VITE_APP_URL || `https://${event.headers.host}`
    const successUrl = `${appUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${appUrl}/subscription/plans`

    let finalPriceId = priceId

    // If no priceId provided, create price dynamically
    if (!finalPriceId && amount) {
      // First, find or create a product for this tier
      const productName = tierName || `${tierCode.charAt(0).toUpperCase() + tierCode.slice(1)} Plan`
      
      // Search for existing product
      const products = await stripe.products.list({
        limit: 100,
        active: true
      })
      
      let product = products.data.find(p => p.name === productName)
      
      // Create product if it doesn't exist
      if (!product) {
        product = await stripe.products.create({
          name: productName,
          description: `Subscription plan for ${productName}`,
          metadata: {
            tier_code: tierCode
          }
        })
      }

      // Create price for this billing period
      const interval = period === 'yearly' ? 'year' : 'month'
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: interval
        },
        metadata: {
          tier_code: tierCode,
          period: period
        }
      })

      finalPriceId = price.id
      console.log(`Created dynamic price ${finalPriceId} for ${tierCode} ${period} at $${amount}`)
    }

    if (!finalPriceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Either priceId or amount must be provided' })
      }
    }

    // Prepare checkout session parameters
    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        tier_code: tierCode,
        period: period
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          tier_code: tierCode
        }
      }
    }

    // If user has existing Stripe customer, use it
    if (profile.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id
    } else {
      // For subscription mode, just set customer_email
      // Stripe will automatically create the customer
      sessionParams.customer_email = profile.email
      // Note: customer_creation is only for 'payment' mode, not 'subscription' mode
    }

    // Optional: Add trial period for first-time subscribers
    // sessionParams.subscription_data.trial_period_days = 7

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log(`Checkout session created for user ${userId}: ${session.id}`)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      })
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    })
    
    // Return more detailed error for debugging
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to create checkout session',
        message: error.message,
        type: error.type || 'Unknown',
        // Only include details in development
        ...(process.env.NETLIFY_DEV && {
          stack: error.stack,
          code: error.code
        })
      })
    }
  }
}
