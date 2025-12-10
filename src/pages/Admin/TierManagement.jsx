import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

const TierManagement = () => {
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTier, setEditingTier] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    loadTiers()
  }, [])

  const loadTiers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setTiers(data || [])
    } catch (error) {
      console.error('Error loading tiers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tier) => {
    setEditingTier(tier.tier_code)
    setFormData({
      tier_name: tier.tier_name,
      price_monthly: tier.price_monthly,
      price_yearly: tier.price_yearly,
      features: JSON.stringify(tier.features, null, 2),
    })
  }

  const handleUpdate = async (tierCode) => {
    try {
      const updates = {
        tier_name: formData.tier_name,
        price_monthly: parseFloat(formData.price_monthly),
        price_yearly: parseFloat(formData.price_yearly),
        features: JSON.parse(formData.features),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('subscription_tiers')
        .update(updates)
        .eq('tier_code', tierCode)

      if (error) throw error

      alert('Tier updated successfully')
      setEditingTier(null)
      loadTiers()
    } catch (error) {
      console.error('Error updating tier:', error)
      alert('Failed to update tier: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Subscription Tiers</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Subscription Tiers</h1>
        <p>Manage subscription tier pricing and features</p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {tiers.map((tier) => (
          <div key={tier.tier_code} className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge ${tier.tier_code}`}>{tier.tier_name}</span>
                </h2>
              </div>
              {editingTier === tier.tier_code ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleUpdate(tier.tier_code)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => setEditingTier(null)}
                    style={{ background: '#6b7280', color: 'white' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleEdit(tier)}
                >
                  Edit
                </button>
              )}
            </div>

            {editingTier === tier.tier_code ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    Tier Name
                  </label>
                  <input
                    type="text"
                    value={formData.tier_name}
                    onChange={(e) => setFormData({ ...formData, tier_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                      Monthly Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price_monthly}
                      onChange={(e) => setFormData({ ...formData, price_monthly: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                      Yearly Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price_yearly}
                      onChange={(e) => setFormData({ ...formData, price_yearly: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    Features (JSON)
                  </label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    rows={15}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Monthly Price
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                      ${tier.price_monthly?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Yearly Price
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                      ${tier.price_yearly?.toFixed(2) || '0.00'}
                    </div>
                    {tier.price_monthly > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                        Save ${((tier.price_monthly * 12) - tier.price_yearly).toFixed(2)}/year
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem' }}>
                    Features:
                  </div>
                  <div style={{
                    background: '#f9fafb',
                    padding: '1rem',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                  }}>
                    <pre style={{ margin: 0, overflow: 'auto' }}>
                      {JSON.stringify(tier.features, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TierManagement
