import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../UI/Button'
import Card from '../UI/Card'
import './PaymentForm.css'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

/**
 * Payment Form Component
 * 
 * Embedded Stripe payment form for subscription upgrades
 */
const PaymentFormInner = ({ 
  priceId, 
  tierCode, 
  period, 
  amount, 
  onSuccess, 
  onError,
  processing,
  setProcessing 
}) => {
  const { user } = useAuth()
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [setupIntentId, setSetupIntentId] = useState(null)
  const [customerId, setCustomerId] = useState(null)

  useEffect(() => {
    // Create setup intent on mount (for subscriptions)
    createSetupIntent()
  }, [priceId, user])

  const createSetupIntent = async () => {
    if (!user) {
      setError('Please log in to continue')
      return
    }

    try {
      const response = await fetch('/.netlify/functions/create-setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          priceId,
          tierCode,
          period
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create setup intent')
      }

      setClientSecret(data.clientSecret)
      setSetupIntentId(data.setupIntentId)
      setCustomerId(data.customerId)
    } catch (err) {
      console.error('Error creating setup intent:', err)
      setError(err.message)
      onError?.(err.message)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setProcessing(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    try {
      // Confirm setup intent (for saving payment method)
      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              // Add user details if available
            }
          }
        }
      )

      if (stripeError) {
        setError(stripeError.message)
        onError?.(stripeError.message)
        setProcessing(false)
        return
      }

      if (setupIntent.status === 'succeeded') {
        // Payment method is saved, now create subscription
        onSuccess?.({
          setupIntent,
          setupIntentId,
          customerId,
          paymentMethodId: setupIntent.payment_method
        })
      }
    } catch (err) {
      console.error('Error processing payment:', err)
      setError(err.message || 'Payment failed. Please try again.')
      onError?.(err.message)
      setProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: false,
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-amount">
        <div className="amount-label">Total Amount</div>
        <div className="amount-value">${amount.toFixed(2)}</div>
        <div className="amount-period">per {period === 'yearly' ? 'year' : 'month'}</div>
      </div>

      <div className="card-element-container">
        <label className="card-label">Card Details</label>
        <div className="card-element-wrapper">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="payment-error">{error}</div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={!stripe || processing || !clientSecret}
        style={{ width: '100%', marginTop: '20px' }}
      >
        {processing ? 'Processing...' : `Subscribe for $${amount.toFixed(2)}`}
      </Button>

      <div className="payment-security">
        <div className="security-badge">
          🔒 Secured by Stripe
        </div>
        <p className="security-text">
          Your payment information is encrypted and secure. We never store your card details.
        </p>
      </div>
    </form>
  )
}

/**
 * Payment Form Wrapper
 * Wraps the form with Stripe Elements provider
 */
const PaymentForm = ({ priceId, tierCode, period, amount, onSuccess, onError }) => {
  const [processing, setProcessing] = useState(false)

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Card>
        <div className="error-message">
          Stripe is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in your environment variables.
        </div>
      </Card>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner
        priceId={priceId}
        tierCode={tierCode}
        period={period}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        processing={processing}
        setProcessing={setProcessing}
      />
    </Elements>
  )
}

export default PaymentForm

