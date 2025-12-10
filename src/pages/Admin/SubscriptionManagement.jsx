import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    active: 0,
    cancelled: 0,
    trialing: 0,
    past_due: 0,
  })

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    setLoading(true)
    try {
      // Get all active subscriptions
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('subscription_tier', 'free')
        .order('subscription_start_date', { ascending: false })

      if (error) throw error

      setSubscriptions(data || [])

      // Calculate stats
      const statusCounts = (data || []).reduce((acc, sub) => {
        acc[sub.subscription_status] = (acc[sub.subscription_status] || 0) + 1
        return acc
      }, {})

      setStats({
        active: statusCounts.active || 0,
        cancelled: statusCounts.cancelled || 0,
        trialing: statusCounts.trialing || 0,
        past_due: statusCounts.past_due || 0,
      })
    } catch (error) {
      console.error('Error loading subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async (userId) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          subscription_status: 'cancelled',
          cancel_at_period_end: true,
        })
        .eq('user_id', userId)

      if (error) throw error

      alert('Subscription cancelled successfully')
      loadSubscriptions()
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('Failed to cancel subscription')
    }
  }

  const handleReactivateSubscription = async (userId) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          subscription_status: 'active',
          cancel_at_period_end: false,
        })
        .eq('user_id', userId)

      if (error) throw error

      alert('Subscription reactivated successfully')
      loadSubscriptions()
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      alert('Failed to reactivate subscription')
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Subscription Management</h1>
          <p>Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Subscription Management</h1>
        <p>Monitor and manage all subscriptions</p>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Active</h3>
          <div className="value">{stats.active}</div>
          <div className="change positive">Paying customers</div>
        </div>

        <div className="stat-card">
          <h3>Cancelled</h3>
          <div className="value">{stats.cancelled}</div>
          <div className="change negative">Churn</div>
        </div>

        <div className="stat-card">
          <h3>Trialing</h3>
          <div className="value">{stats.trialing}</div>
          <div className="change">Trial period</div>
        </div>

        <div className="stat-card">
          <h3>Past Due</h3>
          <div className="value">{stats.past_due}</div>
          <div className="change negative">Payment failed</div>
        </div>
      </div>

      <div className="admin-card">
        <h2>All Subscriptions</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Tier</th>
                <th>Period</th>
                <th>Status</th>
                <th>Started</th>
                <th>Ends</th>
                <th>Stripe Sub ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.user_id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>
                      {sub.first_name} {sub.last_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {sub.email}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${sub.subscription_tier}`}>
                      {sub.subscription_tier}
                    </span>
                  </td>
                  <td>{sub.subscription_period || 'monthly'}</td>
                  <td>
                    <span className={`badge ${sub.subscription_status}`}>
                      {sub.subscription_status}
                    </span>
                    {sub.cancel_at_period_end && (
                      <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                        Cancels at period end
                      </div>
                    )}
                  </td>
                  <td>
                    {sub.subscription_start_date
                      ? new Date(sub.subscription_start_date).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    {sub.subscription_end_date
                      ? new Date(sub.subscription_end_date).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                      {sub.stripe_subscription_id
                        ? `${sub.stripe_subscription_id.substring(0, 12)}...`
                        : '-'}
                    </span>
                  </td>
                  <td>
                    {sub.subscription_status === 'active' ? (
                      <button
                        className="btn btn-sm"
                        onClick={() => handleCancelSubscription(sub.user_id)}
                        style={{ background: '#ef4444', color: 'white' }}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleReactivateSubscription(sub.user_id)}
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
          Total subscriptions: {subscriptions.length}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionManagement
