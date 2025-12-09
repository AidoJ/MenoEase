/**
 * Netlify Function: Stripe Webhook Handler
 *
 * Handles all Stripe webhook events for subscription management
 *
 * Environment Variables Required:
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - EMAILJS_SERVICE_ID
 * - EMAILJS_PUBLIC_KEY
 * - EMAILJS_TEMPLATE_WELCOME
 * - EMAILJS_TEMPLATE_UPGRADE
 * - EMAILJS_TEMPLATE_DOWNGRADE
 * - EMAILJS_TEMPLATE_CANCELLED
 */

// Don't initialize at module level - do it in handler
const { createClient } = require('@supabase/supabase-js')
const stripeLib = require('stripe')

// Initialize Supabase client (will be re-initialized in handler if env vars change)
let supabase
let stripe

function initializeClients() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  
  if (!supabase && supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
  }
  
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = stripeLib(process.env.STRIPE_SECRET_KEY)
  }
}

exports.handler = async (event, context) => {
  // Initialize clients
  initializeClients()

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  if (!stripe || !supabase) {
    console.error('Stripe or Supabase not initialized', {
      hasStripe: !!stripe,
      hasSupabase: !!supabase,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasSupabaseUrl: !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    }
  }

  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  console.log('Webhook received', {
    method: event.httpMethod,
    hasSignature: !!sig,
    hasSecret: !!webhookSecret,
    bodyType: typeof event.body,
    bodyLength: event.body ? event.body.length : 0
  })

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook secret not configured' })
    }
  }

  if (!sig) {
    console.error('No Stripe signature found in headers')
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No signature header' })
    }
  }

  let stripeEvent

  try {
    // Netlify functions may have body as string or already parsed
    const body = typeof event.body === 'string' ? event.body : JSON.stringify(event.body)
    
    // Verify webhook signature
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret
    )
    console.log('✅ Webhook signature verified successfully')
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message)
    console.error('Error details:', {
      message: err.message,
      type: err.type,
      hasBody: !!event.body,
      hasSig: !!sig
    })
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
    }
  }

  console.log('✅ Received Stripe event:', stripeEvent.type, {
    id: stripeEvent.id,
    created: new Date(stripeEvent.created * 1000).toISOString()
  })

  try {
    // Route to appropriate handler based on event type
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object)
        break

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code
    })
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Webhook processing failed',
        message: error.message 
      })
    }
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session) {
  console.log('🛒 Checkout completed:', session.id)
  console.log('Session data:', {
    customer: session.customer,
    subscription: session.subscription,
    client_reference_id: session.client_reference_id,
    metadata: session.metadata,
    mode: session.mode
  })

  const { customer, subscription, client_reference_id, metadata } = session
  const userId = client_reference_id || metadata?.user_id
  const tierCode = metadata?.tier_code

  if (!userId) {
    console.error('❌ No user ID found in checkout session', {
      client_reference_id,
      metadata_user_id: metadata?.user_id,
      metadata
    })
    return
  }

  console.log('👤 Processing for user:', userId, 'tier:', tierCode)

  // If subscription exists, fetch it to get full details
  let subscriptionData = null
  if (subscription) {
    try {
      console.log('📋 Fetching subscription details:', subscription)
      subscriptionData = await stripe.subscriptions.retrieve(subscription)
      console.log('✅ Retrieved subscription:', subscriptionData.id, {
        status: subscriptionData.status,
        current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString()
      })
    } catch (err) {
      console.error('❌ Error retrieving subscription:', err)
      console.error('Error details:', err.message)
    }
  } else {
    console.log('⚠️ No subscription ID in checkout session - might be a one-time payment')
  }

  // Update user profile with Stripe customer ID and subscription info
  const updateData = {
    stripe_customer_id: customer,
    stripe_subscription_id: subscription
  }

  // If we have subscription data, update tier and status
  if (subscriptionData) {
    const priceId = subscriptionData.items.data[0].price.id
    const tier = tierCode || await getTierFromPriceId(priceId)
    const period = subscriptionData.items.data[0].price.recurring.interval === 'year' ? 'yearly' : 'monthly'
    const currentPeriodEnd = new Date(subscriptionData.current_period_end * 1000)

    updateData.subscription_tier = tier
    updateData.subscription_status = subscriptionData.status
    updateData.subscription_period = period
    updateData.subscription_start_date = new Date(subscriptionData.start_date * 1000).toISOString().split('T')[0]
    updateData.subscription_end_date = currentPeriodEnd.toISOString().split('T')[0]
    updateData.stripe_price_id = priceId
    updateData.cancel_at_period_end = subscriptionData.cancel_at_period_end

    console.log(`Updating user ${userId} to tier ${tier} with subscription ${subscription}`)
  }

  console.log('💾 Updating user profile with data:', updateData)
  const { data: updateResult, error: updateError } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('user_id', userId)
    .select()

  if (updateError) {
    console.error('❌ Error updating user profile:', updateError)
    console.error('Update error details:', {
      message: updateError.message,
      code: updateError.code,
      details: updateError.details,
      hint: updateError.hint
    })
    throw updateError
  }

  console.log('✅ Successfully updated user profile:', {
    userId,
    customer,
    subscription: subscription || 'none',
    tier: updateData.subscription_tier || 'not set',
    rowsUpdated: updateResult?.length || 0
  })
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id)

  const customerId = subscription.customer
  const priceId = subscription.items.data[0].price.id
  const status = subscription.status
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

  // Get tier from price ID
  const tier = await getTierFromPriceId(priceId)
  const period = subscription.items.data[0].price.recurring.interval === 'year' ? 'yearly' : 'monthly'

  // Find user by customer ID
  const { data: profile, error: findError } = await supabase
    .from('user_profiles')
    .select('user_id, email, first_name, subscription_tier')
    .eq('stripe_customer_id', customerId)
    .single()

  if (findError || !profile) {
    console.error('User not found for customer:', customerId)
    return
  }

  const oldTier = profile.subscription_tier

  // Update user profile
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      subscription_tier: tier,
      subscription_status: status,
      subscription_period: period,
      subscription_start_date: new Date(subscription.start_date * 1000).toISOString().split('T')[0],
      subscription_end_date: currentPeriodEnd.toISOString().split('T')[0],
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      cancel_at_period_end: subscription.cancel_at_period_end
    })
    .eq('user_id', profile.user_id)

  if (updateError) {
    console.error('Error updating subscription:', updateError)
    throw updateError
  }

  // Log to subscription history
  await logSubscriptionEvent({
    userId: profile.user_id,
    eventType: 'subscription_created',
    fromTier: oldTier,
    toTier: tier,
    amount: subscription.items.data[0].price.unit_amount / 100,
    period: period,
    stripeEventId: subscription.id,
    metadata: {
      status: status,
      trial_end: subscription.trial_end,
      current_period_end: currentPeriodEnd
    }
  })

  // Send welcome or upgrade email
  const templateId = oldTier === 'free'
    ? process.env.EMAILJS_TEMPLATE_WELCOME
    : process.env.EMAILJS_TEMPLATE_UPGRADE

  if (templateId) {
    await sendEmail(
      profile.email,
      profile.first_name || 'User',
      templateId,
      {
        tier_name: tier.charAt(0).toUpperCase() + tier.slice(1),
        old_tier: oldTier,
        new_tier: tier
      }
    )
  }

  console.log(`Subscription created for user ${profile.user_id}: ${tier}`)
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id)

  const priceId = subscription.items.data[0].price.id
  const status = subscription.status
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

  // Get tier from price ID
  const tier = await getTierFromPriceId(priceId)
  const period = subscription.items.data[0].price.recurring.interval === 'year' ? 'yearly' : 'monthly'

  // Find user by subscription ID
  const { data: profile, error: findError } = await supabase
    .from('user_profiles')
    .select('user_id, email, first_name, subscription_tier')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (findError || !profile) {
    console.error('User not found for subscription:', subscription.id)
    return
  }

  const oldTier = profile.subscription_tier

  // Update user profile
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      subscription_tier: tier,
      subscription_status: status,
      subscription_period: period,
      subscription_end_date: currentPeriodEnd.toISOString().split('T')[0],
      stripe_price_id: priceId,
      cancel_at_period_end: subscription.cancel_at_period_end
    })
    .eq('user_id', profile.user_id)

  if (updateError) {
    console.error('Error updating subscription:', updateError)
    throw updateError
  }

  // Determine event type
  let eventType = 'subscription_updated'
  let templateId = null

  if (oldTier !== tier) {
    if (tierRank(tier) > tierRank(oldTier)) {
      eventType = 'tier_upgraded'
      templateId = process.env.EMAILJS_TEMPLATE_UPGRADE
    } else if (tierRank(tier) < tierRank(oldTier)) {
      eventType = 'tier_downgraded'
      templateId = process.env.EMAILJS_TEMPLATE_DOWNGRADE
    }
  }

  // Log to subscription history
  await logSubscriptionEvent({
    userId: profile.user_id,
    eventType: eventType,
    fromTier: oldTier,
    toTier: tier,
    amount: subscription.items.data[0].price.unit_amount / 100,
    period: period,
    stripeEventId: subscription.id,
    metadata: {
      status: status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: currentPeriodEnd
    }
  })

  // Send email if tier changed
  if (templateId && oldTier !== tier) {
    await sendEmail(
      profile.email,
      profile.first_name || 'User',
      templateId,
      {
        tier_name: tier.charAt(0).toUpperCase() + tier.slice(1),
        old_tier: oldTier,
        new_tier: tier
      }
    )
  }

  console.log(`Subscription updated for user ${profile.user_id}: ${oldTier} -> ${tier}`)
}

/**
 * Handle subscription deleted (cancelled)
 */
async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id)

  // Find user by subscription ID
  const { data: profile, error: findError } = await supabase
    .from('user_profiles')
    .select('user_id, email, first_name, subscription_tier')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (findError || !profile) {
    console.error('User not found for subscription:', subscription.id)
    return
  }

  const oldTier = profile.subscription_tier

  // Downgrade to free tier
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'cancelled',
      subscription_period: 'monthly',
      cancel_at_period_end: false
    })
    .eq('user_id', profile.user_id)

  if (updateError) {
    console.error('Error downgrading user:', updateError)
    throw updateError
  }

  // Log to subscription history
  await logSubscriptionEvent({
    userId: profile.user_id,
    eventType: 'subscription_cancelled',
    fromTier: oldTier,
    toTier: 'free',
    stripeEventId: subscription.id,
    metadata: {
      cancelled_at: new Date(subscription.canceled_at * 1000)
    }
  })

  // Send cancellation email
  const templateId = process.env.EMAILJS_TEMPLATE_CANCELLED
  if (templateId) {
    await sendEmail(
      profile.email,
      profile.first_name || 'User',
      templateId,
      {
        tier_name: oldTier.charAt(0).toUpperCase() + oldTier.slice(1)
      }
    )
  }

  console.log(`Subscription cancelled for user ${profile.user_id}`)
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id)

  const subscriptionId = invoice.subscription
  const amount = invoice.amount_paid / 100
  const customerId = invoice.customer

  // Find user
  const { data: profile, error: findError } = await supabase
    .from('user_profiles')
    .select('user_id, subscription_tier')
    .eq('stripe_customer_id', customerId)
    .single()

  if (findError || !profile) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Log payment
  await logSubscriptionEvent({
    userId: profile.user_id,
    eventType: 'payment_succeeded',
    fromTier: profile.subscription_tier,
    toTier: profile.subscription_tier,
    amount: amount,
    stripeEventId: invoice.id,
    stripeInvoiceId: invoice.id,
    metadata: {
      subscription_id: subscriptionId,
      paid_at: new Date(invoice.status_transitions.paid_at * 1000)
    }
  })

  console.log(`Payment succeeded for user ${profile.user_id}: $${amount}`)
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id)

  const customerId = invoice.customer
  const amount = invoice.amount_due / 100

  // Find user
  const { data: profile, error: findError } = await supabase
    .from('user_profiles')
    .select('user_id, email, first_name, subscription_tier')
    .eq('stripe_customer_id', customerId)
    .single()

  if (findError || !profile) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Update status to past_due
  await supabase
    .from('user_profiles')
    .update({
      subscription_status: 'past_due'
    })
    .eq('user_id', profile.user_id)

  // Log failed payment
  await logSubscriptionEvent({
    userId: profile.user_id,
    eventType: 'payment_failed',
    fromTier: profile.subscription_tier,
    toTier: profile.subscription_tier,
    amount: amount,
    stripeEventId: invoice.id,
    stripeInvoiceId: invoice.id,
    metadata: {
      attempt_count: invoice.attempt_count,
      next_payment_attempt: invoice.next_payment_attempt
    }
  })

  // TODO: Send payment failed email notification
  console.log(`Payment failed for user ${profile.user_id}: $${amount}`)
}

/**
 * Helper: Get tier from Stripe price ID
 * First checks price metadata, then checks database
 */
async function getTierFromPriceId(priceId) {
  try {
    // Try to get tier from price metadata (for dynamically created prices)
    const price = await stripe.prices.retrieve(priceId)
    if (price.metadata && price.metadata.tier_code) {
      console.log(`Found tier ${price.metadata.tier_code} from price metadata`)
      return price.metadata.tier_code
    }

    // Fallback: Check database for pre-configured prices
    const { data: tiers } = await supabase
      .from('subscription_tiers')
      .select('tier_code, stripe_price_id_monthly, stripe_price_id_yearly')

    if (tiers) {
      for (const tier of tiers) {
        if (tier.stripe_price_id_monthly === priceId || tier.stripe_price_id_yearly === priceId) {
          console.log(`Found tier ${tier.tier_code} from database`)
          return tier.tier_code
        }
      }
    }
  } catch (error) {
    console.error('Error getting tier from price ID:', error)
  }

  console.log('Could not determine tier, defaulting to free')
  return 'free'
}

/**
 * Helper: Get tier rank for comparison
 */
function tierRank(tier) {
  const ranks = { free: 0, basic: 1, premium: 2, professional: 3 }
  return ranks[tier] || 0
}

/**
 * Helper: Log subscription event to history
 */
async function logSubscriptionEvent(event) {
  const { error } = await supabase
    .from('subscription_history')
    .insert({
      user_id: event.userId,
      event_type: event.eventType,
      from_tier: event.fromTier,
      to_tier: event.toTier,
      amount: event.amount || null,
      period: event.period || null,
      stripe_event_id: event.stripeEventId || null,
      stripe_invoice_id: event.stripeInvoiceId || null,
      metadata: event.metadata || {}
    })

  if (error) {
    console.error('Error logging subscription event:', error)
  }
}

/**
 * Helper: Send email via EmailJS
 */
async function sendEmail(toEmail, userName, templateId, templateParams) {
  try {
    const emailjs = require('@emailjs/nodejs')

    const serviceId = process.env.EMAILJS_SERVICE_ID
    const publicKey = process.env.EMAILJS_PUBLIC_KEY

    if (!serviceId || !publicKey || !templateId) {
      console.log('EmailJS not configured, skipping email')
      return
    }

    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: toEmail,
        to_name: userName,
        user_name: userName,
        ...templateParams
      },
      { publicKey }
    )

    console.log(`Email sent to ${toEmail} using template ${templateId}`)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
