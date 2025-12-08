import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { subscriptionService } from '../../services/subscriptionService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { format } from 'date-fns'
import './Success.css'

const Success = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    const subscriptionId = searchParams.get('subscription_id')
    const sessionId = searchParams.get('session_id')

    if (!user) {
      setError('Please log in to view subscription details')
      setLoading(false)
      return
    }

    try {
      // If we have a subscription ID, load it directly
      if (subscriptionId) {
        const { data, error: subError } = await subscriptionService.getCurrentSubscription(user.id)
        if (subError) throw subError
        setSubscription(data)
      } else if (sessionId) {
        // If we have a session ID, wait a moment for webhook to process, then load
        setTimeout(async () => {
          const { data, error: subError } = await subscriptionService.getCurrentSubscription(user.id)
          if (subError) throw subError
          setSubscription(data)
        }, 2000)
      } else {
        // Just load current subscription
        const { data, error: subError } = await subscriptionService.getCurrentSubscription(user.id)
        if (subError) throw subError
        setSubscription(data)
      }
    } catch (err) {
      console.error('Error loading subscription:', err)
      setError('Failed to load subscription details')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    navigate('/')
  }

  const handleManageSubscription = () => {
    navigate('/subscription/manage')
  }

  if (loading) {
    return (
      <div className="success-page">
        <div className="page-title">Processing...</div>
        <Card>
          <p>Please wait while we confirm your subscription...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="success-page">
        <div className="page-title">Subscription Status</div>
        <Card>
          <div className="error-message">{error}</div>
          <Button variant="primary" onClick={handleContinue} style={{ marginTop: '16px' }}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="success-page">
      <div className="success-icon">✅</div>
      <h1 className="success-title">Subscription Activated!</h1>
      <p className="success-message">
        Thank you for subscribing to {subscriptionService.getTierName(subscription?.subscription_tier || 'premium')}!
      </p>

      <Card className="subscription-details-card">
        <h3 className="details-title">Your Subscription Details</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Plan:</span>
            <span className="detail-value">
              {subscriptionService.getTierName(subscription?.subscription_tier)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className="detail-value status-active">
              {subscription?.subscription_status || 'active'}
            </span>
          </div>
          {subscription?.subscription_end_date && (
            <div className="detail-item">
              <span className="detail-label">Next billing:</span>
              <span className="detail-value">
                {format(new Date(subscription.subscription_end_date), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>
      </Card>

      <div className="success-actions">
        <Button variant="primary" onClick={handleContinue} style={{ minWidth: '200px' }}>
          Go to Dashboard
        </Button>
        <Button variant="secondary" onClick={handleManageSubscription} style={{ minWidth: '200px' }}>
          Manage Subscription
        </Button>
      </div>

      <div className="success-note">
        <p>Your subscription is now active. You can start using all premium features immediately!</p>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    </div>
  )
}

export default Success

