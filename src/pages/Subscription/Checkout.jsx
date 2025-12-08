import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { subscriptionService } from '../../services/subscriptionService'
import PaymentForm from '../../components/PaymentForm/PaymentForm'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import './Checkout.css'

const Checkout = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [tier, setTier] = useState(null)
  const [priceId, setPriceId] = useState(null)
  const [period, setPeriod] = useState('monthly')
  const [amount, setAmount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTierData()
  }, [])

  const loadTierData = async () => {
    const tierCode = searchParams.get('tier')
    const billingPeriod = searchParams.get('period') || 'monthly'

    if (!tierCode) {
      setError('No tier selected')
      setLoading(false)
      return
    }

    try {
      const { data: tierData, error: tierError } = await subscriptionService.getTierByCode(tierCode)
      
      if (tierError || !tierData) {
        setError('Tier not found')
        setLoading(false)
        return
      }

      const price = billingPeriod === 'yearly' 
        ? tierData.stripe_price_id_yearly 
        : tierData.stripe_price_id_monthly

      const priceAmount = billingPeriod === 'yearly'
        ? tierData.price_yearly
        : tierData.price_monthly

      if (!price) {
        setError('Price not configured for this tier')
        setLoading(false)
        return
      }

      setTier(tierData)
      setPriceId(price)
      setPeriod(billingPeriod)
      setAmount(priceAmount)
    } catch (err) {
      console.error('Error loading tier:', err)
      setError('Failed to load subscription details')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentData) => {
    if (!user) {
      setError('User not found')
      return
    }

    try {
      // Create subscription with the saved payment method
      const response = await fetch('/.netlify/functions/create-subscription-with-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentData.paymentMethodId,
          customerId: paymentData.customerId,
          userId: user.id,
          priceId: priceId,
          tierCode: tier.tier_code,
          period: period
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription')
      }

      // Redirect to success page
      navigate(`/subscription/success?subscription_id=${data.subscriptionId}`)
    } catch (err) {
      console.error('Error creating subscription:', err)
      setError(err.message || 'Payment method saved but subscription creation failed. Please contact support.')
    }
  }

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage)
  }

  const handleCancel = () => {
    navigate('/subscription/plans')
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="page-title">Checkout</div>
        <Card>
          <p>Loading checkout...</p>
        </Card>
      </div>
    )
  }

  if (error && !tier) {
    return (
      <div className="checkout-page">
        <div className="page-title">Checkout</div>
        <Card>
          <div className="error-message">{error}</div>
          <Button variant="secondary" onClick={handleCancel} style={{ marginTop: '16px' }}>
            Back to Plans
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="page-title">Complete Your Subscription</div>

      <div className="checkout-container">
        <div className="checkout-summary">
          <Card>
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-item">
              <span className="summary-label">Plan:</span>
              <span className="summary-value">{tier?.name}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Billing:</span>
              <span className="summary-value">
                {period === 'yearly' ? 'Yearly' : 'Monthly'}
              </span>
            </div>
            <div className="summary-item total">
              <span className="summary-label">Total:</span>
              <span className="summary-value">${amount.toFixed(2)}</span>
            </div>
            {period === 'yearly' && tier?.price_monthly && (
              <div className="savings-note">
                Save ${((tier.price_monthly * 12) - tier.price_yearly).toFixed(2)} per year!
              </div>
            )}
          </Card>

          <Card>
            <h3 className="summary-title">What's Included</h3>
            <ul className="features-list">
              {tier?.features?.history_days && (
                <li>
                  {tier.features.history_days === null 
                    ? 'Unlimited history' 
                    : `${tier.features.history_days}-day history`}
                </li>
              )}
              {tier?.features?.reminders?.enabled && (
                <li>
                  {tier.features.reminders.max_per_day || 0} reminder{tier.features.reminders.max_per_day !== 1 ? 's' : ''} per day
                </li>
              )}
              {tier?.features?.reports?.enabled && (
                <li>Automated reports</li>
              )}
              {tier?.features?.insights && (
                <li>
                  {tier.features.insights === 'basic' ? 'Basic insights' : 'Advanced insights'}
                </li>
              )}
              {tier?.features?.pdf_export && (
                <li>PDF export</li>
              )}
            </ul>
          </Card>
        </div>

        <div className="checkout-payment">
          <Card>
            <h3 className="payment-title">Payment Information</h3>
            {error && (
              <div className="error-message" style={{ marginBottom: '20px' }}>
                {error}
              </div>
            )}
            <PaymentForm
              priceId={priceId}
              tierCode={tier?.tier_code}
              period={period}
              amount={amount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
            <Button
              variant="secondary"
              onClick={handleCancel}
              style={{ width: '100%', marginTop: '16px' }}
            >
              Cancel
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Checkout

