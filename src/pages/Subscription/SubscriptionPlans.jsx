import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { subscriptionService } from '../../services/subscriptionService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { format } from 'date-fns'
import './SubscriptionPlans.css'

const SubscriptionPlans = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tiers, setTiers] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [billingPeriod, setBillingPeriod] = useState('monthly') // 'monthly' or 'yearly'
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [user, billingPeriod])

  const loadData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Load tiers
      const { data: tiersData, error: tiersError } = await subscriptionService.getAllTiers()
      if (tiersError) throw tiersError

      // Load current subscription
      const { data: subscriptionData } = await subscriptionService.getCurrentSubscription(user.id)
      
      setTiers(tiersData || [])
      setCurrentSubscription(subscriptionData)
    } catch (err) {
      console.error('Error loading subscription data:', err)
      setError('Failed to load subscription plans')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (tier) => {
    if (!user) {
      setError('Please log in to subscribe')
      return
    }

    setProcessing(true)
    setError('')

    try {
      // Get price ID based on billing period
      const priceId = billingPeriod === 'yearly' 
        ? tier.stripe_price_id_yearly 
        : tier.stripe_price_id_monthly

      if (!priceId) {
        setError('Price not configured for this tier')
        setProcessing(false)
        return
      }

      // Create checkout session
      const { data, error: checkoutError } = await subscriptionService.createCheckoutSession(
        priceId,
        user.id,
        tier.tier_code,
        billingPeriod
      )

      if (checkoutError) throw checkoutError

      // Option 1: Redirect to Stripe Checkout (recommended for subscriptions)
      // Option 2: Navigate to embedded checkout page
      // Uncomment the option you prefer:
      
      // Option 1: Stripe Checkout (redirect)
      if (data?.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
      
      // Option 2: Embedded checkout (uncomment to use)
      // navigate(`/subscription/checkout?tier=${tier.tier_code}&period=${billingPeriod}`)
    } catch (err) {
      console.error('Error creating checkout session:', err)
      setError(err.message || 'Failed to start checkout. Please try again.')
      setProcessing(false)
    }
  }

  const getPrice = (tier) => {
    if (billingPeriod === 'yearly') {
      return tier.price_yearly || 0
    }
    return tier.price_monthly || 0
  }

  const getYearlySavings = (tier) => {
    if (billingPeriod === 'monthly' && tier.price_monthly && tier.price_yearly) {
      return subscriptionService.calculateYearlySavings(tier.price_monthly, tier.price_yearly)
    }
    return null
  }

  const isCurrentTier = (tierCode) => {
    return currentSubscription?.subscription_tier === tierCode && 
           currentSubscription?.subscription_status === 'active'
  }

  const tierRank = { free: 0, basic: 1, premium: 2, professional: 3 }
  const currentRank = tierRank[currentSubscription?.subscription_tier] || 0

  if (loading) {
    return (
      <div className="subscription-plans">
        <div className="page-title">Subscription Plans</div>
        <Card>
          <p>Loading plans...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="subscription-plans">
      <div className="page-title">Choose Your Plan</div>

      {error && (
        <Card className="error-card">
          <div className="error-message">{error}</div>
        </Card>
      )}

      {/* Billing Period Toggle */}
      <Card className="billing-toggle-card">
        <div className="billing-toggle">
          <button
            className={`billing-option ${billingPeriod === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            className={`billing-option ${billingPeriod === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingPeriod('yearly')}
          >
            Yearly
            <span className="savings-badge">Save up to 20%</span>
          </button>
        </div>
      </Card>

      {/* Plans Grid */}
      <div className="plans-grid">
        {tiers.map((tier) => {
          const price = getPrice(tier)
          const savings = getYearlySavings(tier)
          const isCurrent = isCurrentTier(tier.tier_code)
          const tierRankValue = tierRank[tier.tier_code] || 0
          const canUpgrade = tierRankValue > currentRank
          const isFree = tier.tier_code === 'free'

          return (
            <Card 
              key={tier.id} 
              className={`plan-card ${isCurrent ? 'current-plan' : ''} ${tier.tier_code}`}
            >
              {isCurrent && (
                <div className="current-badge">Current Plan</div>
              )}
              
              <div className="plan-header">
                <h3 className="plan-name">{tier.name}</h3>
                <div className="plan-price">
                  {isFree ? (
                    <span className="price-free">Free</span>
                  ) : (
                    <>
                      <span className="price-amount">${price.toFixed(2)}</span>
                      <span className="price-period">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                    </>
                  )}
                </div>
                {savings && (
                  <div className="savings-text">{savings.description}</div>
                )}
              </div>

              <div className="plan-description">
                {tier.description}
              </div>

              <div className="plan-features">
                <div className="feature-list">
                  {tier.features?.history_days && (
                    <div className="feature-item">
                      <span className="feature-icon">📊</span>
                      <span>
                        {tier.features.history_days === null 
                          ? 'Unlimited history' 
                          : `${tier.features.history_days}-day history`}
                      </span>
                    </div>
                  )}
                  
                  {tier.features?.reminders?.enabled && (
                    <div className="feature-item">
                      <span className="feature-icon">🔔</span>
                      <span>
                        {tier.features.reminders.max_per_day || 0} reminder{tier.features.reminders.max_per_day !== 1 ? 's' : ''} per day
                      </span>
                    </div>
                  )}
                  
                  {tier.features?.reports?.enabled && (
                    <div className="feature-item">
                      <span className="feature-icon">📄</span>
                      <span>
                        {tier.features.reports.frequencies?.join(', ') || 'Reports'} available
                      </span>
                    </div>
                  )}
                  
                  {tier.features?.insights && (
                    <div className="feature-item">
                      <span className="feature-icon">💡</span>
                      <span>
                        {tier.features.insights === 'basic' ? 'Basic insights' : 'Advanced insights'}
                      </span>
                    </div>
                  )}
                  
                  {tier.features?.pdf_export && (
                    <div className="feature-item">
                      <span className="feature-icon">📥</span>
                      <span>PDF export</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="plan-actions">
                {isCurrent ? (
                  <Button variant="secondary" disabled style={{ width: '100%' }}>
                    Current Plan
                  </Button>
                ) : isFree ? (
                  <Button variant="secondary" disabled style={{ width: '100%' }}>
                    Free Forever
                  </Button>
                ) : (
                  <Button
                    variant={tier.tier_code === 'professional' ? 'primary' : 'teal'}
                    onClick={() => handleSubscribe(tier)}
                    disabled={processing || !canUpgrade}
                    style={{ width: '100%' }}
                  >
                    {processing ? 'Processing...' : canUpgrade ? 'Subscribe' : 'Upgrade Required'}
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Current Subscription Info */}
      {currentSubscription && currentSubscription.subscription_tier !== 'free' && (
        <Card className="current-subscription-info">
          <h3>Current Subscription</h3>
          <div className="subscription-details">
            <div className="detail-item">
              <span className="detail-label">Plan:</span>
              <span className="detail-value">
                {subscriptionService.getTierName(currentSubscription.subscription_tier)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value">{currentSubscription.subscription_status}</span>
            </div>
            {currentSubscription.subscription_end_date && (
              <div className="detail-item">
                <span className="detail-label">
                  {currentSubscription.cancel_at_period_end ? 'Cancels on:' : 'Renews on:'}
                </span>
                <span className="detail-value">
                  {format(new Date(currentSubscription.subscription_end_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

export default SubscriptionPlans

