import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

const TierManagement = () => {
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTier, setEditingTier] = useState(null)
  const [formData, setFormData] = useState({})

  const formatFeatures = (features) => {
    if (!features) return []

    const formatted = []

    // Tracking
    if (features.tracking) {
      formatted.push('Basic symptom and mood tracking')
    }

    // History
    if (features.history_days === null) {
      formatted.push('Unlimited history')
    } else if (features.history_days > 0) {
      formatted.push(`${features.history_days} days of history`)
    }

    // Insights
    if (features.insights) {
      formatted.push('Basic insights and trends')
    }
    if (features.advanced_insights) {
      formatted.push('Advanced insights and analytics')
    }

    // Reminders
    if (features.reminders?.enabled) {
      const methods = features.reminders.methods?.join(', ') || 'none'
      const maxPerDay = features.reminders.max_per_day || 0
      formatted.push(`Reminders via ${methods} (up to ${maxPerDay}/day)`)
    } else {
      formatted.push('No reminders')
    }

    // Reports
    if (features.reports?.enabled) {
      const methods = features.reports.methods?.join(', ') || 'none'
      const frequencies = features.reports.frequencies?.join(', ') || 'none'
      formatted.push(`Reports via ${methods} (${frequencies})`)
    } else {
      formatted.push('No automated reports')
    }

    // PDF Export
    if (features.export_pdf) {
      formatted.push('PDF export')
    }

    // Support
    const supportMap = {
      'community': 'Community support',
      'email': 'Email support',
      'priority_email': 'Priority email support',
      'phone': 'Phone support'
    }
    if (features.support) {
      formatted.push(supportMap[features.support] || features.support)
    }
    if (features.priority_support) {
      formatted.push('Priority support')
    }
    if (features.dedicated_support) {
      formatted.push('Dedicated support manager')
    }

    // Special features
    if (features.api_access) {
      formatted.push('API access')
    }
    if (features.white_label) {
      formatted.push('White label branding')
    }

    return formatted
  }

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
      // Parse features into editable fields
      tracking: tier.features?.tracking || false,
      history_days: tier.features?.history_days === null ? 'unlimited' : (tier.features?.history_days || 7),
      insights: tier.features?.insights || false,
      advanced_insights: tier.features?.advanced_insights || false,
      reminders_enabled: tier.features?.reminders?.enabled || false,
      reminders_methods: tier.features?.reminders?.methods || [],
      reminders_max_per_day: tier.features?.reminders?.max_per_day || 0,
      reports_enabled: tier.features?.reports?.enabled || false,
      reports_methods: tier.features?.reports?.methods || [],
      reports_frequencies: tier.features?.reports?.frequencies || [],
      export_pdf: tier.features?.export_pdf || false,
      support: tier.features?.support || 'community',
      priority_support: tier.features?.priority_support || false,
      dedicated_support: tier.features?.dedicated_support || false,
      api_access: tier.features?.api_access || false,
      white_label: tier.features?.white_label || false,
    })
  }

  const handleUpdate = async (tierCode) => {
    try {
      // Build features object from form data
      const features = {
        tracking: formData.tracking,
        history_days: formData.history_days === 'unlimited' ? null : parseInt(formData.history_days),
        insights: formData.insights,
        export_pdf: formData.export_pdf,
        support: formData.support,
        reminders: {
          enabled: formData.reminders_enabled,
          methods: formData.reminders_methods,
          frequencies: formData.reminders_enabled ? ['daily', 'hourly', 'every_2_hours', 'every_3_hours', 'twice_daily'] : [],
          max_per_day: parseInt(formData.reminders_max_per_day) || 0,
        },
        reports: {
          enabled: formData.reports_enabled,
          methods: formData.reports_methods,
          frequencies: formData.reports_frequencies,
        },
      }

      // Add optional advanced features
      if (formData.advanced_insights) {
        features.advanced_insights = true
      }
      if (formData.priority_support) {
        features.priority_support = true
      }
      if (formData.dedicated_support) {
        features.dedicated_support = true
      }
      if (formData.api_access) {
        features.api_access = true
      }
      if (formData.white_label) {
        features.white_label = true
      }

      const updates = {
        tier_name: formData.tier_name,
        price_monthly: parseFloat(formData.price_monthly),
        price_yearly: parseFloat(formData.price_yearly),
        features: features,
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

                <div style={{ display: 'grid', gap: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Features Configuration</h3>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.tracking}
                      onChange={(e) => setFormData({ ...formData, tracking: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.875rem' }}>Enable Tracking</span>
                  </label>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                      History Days
                    </label>
                    <select
                      value={formData.history_days}
                      onChange={(e) => setFormData({ ...formData, history_days: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                    >
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.insights}
                      onChange={(e) => setFormData({ ...formData, insights: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.875rem' }}>Basic Insights</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.advanced_insights}
                      onChange={(e) => setFormData({ ...formData, advanced_insights: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.875rem' }}>Advanced Insights</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.export_pdf}
                      onChange={(e) => setFormData({ ...formData, export_pdf: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.875rem' }}>PDF Export</span>
                  </label>

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.reminders_enabled}
                        onChange={(e) => setFormData({ ...formData, reminders_enabled: e.target.checked })}
                      />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Enable Reminders</span>
                    </label>

                    {formData.reminders_enabled && (
                      <>
                        <div style={{ marginBottom: '0.75rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Methods:</label>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={formData.reminders_methods.includes('email')}
                                onChange={(e) => {
                                  const methods = e.target.checked
                                    ? [...formData.reminders_methods, 'email']
                                    : formData.reminders_methods.filter(m => m !== 'email')
                                  setFormData({ ...formData, reminders_methods: methods })
                                }}
                              />
                              <span style={{ fontSize: '0.875rem' }}>Email</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={formData.reminders_methods.includes('sms')}
                                onChange={(e) => {
                                  const methods = e.target.checked
                                    ? [...formData.reminders_methods, 'sms']
                                    : formData.reminders_methods.filter(m => m !== 'sms')
                                  setFormData({ ...formData, reminders_methods: methods })
                                }}
                              />
                              <span style={{ fontSize: '0.875rem' }}>SMS</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Max Per Day:</label>
                          <input
                            type="number"
                            value={formData.reminders_max_per_day}
                            onChange={(e) => setFormData({ ...formData, reminders_max_per_day: e.target.value })}
                            min="0"
                            max="20"
                            style={{ width: '100px', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.reports_enabled}
                        onChange={(e) => setFormData({ ...formData, reports_enabled: e.target.checked })}
                      />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Enable Reports</span>
                    </label>

                    {formData.reports_enabled && (
                      <>
                        <div style={{ marginBottom: '0.75rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Methods:</label>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={formData.reports_methods.includes('email')}
                                onChange={(e) => {
                                  const methods = e.target.checked
                                    ? [...formData.reports_methods, 'email']
                                    : formData.reports_methods.filter(m => m !== 'email')
                                  setFormData({ ...formData, reports_methods: methods })
                                }}
                              />
                              <span style={{ fontSize: '0.875rem' }}>Email</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={formData.reports_methods.includes('sms')}
                                onChange={(e) => {
                                  const methods = e.target.checked
                                    ? [...formData.reports_methods, 'sms']
                                    : formData.reports_methods.filter(m => m !== 'sms')
                                  setFormData({ ...formData, reports_methods: methods })
                                }}
                              />
                              <span style={{ fontSize: '0.875rem' }}>SMS</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Frequencies:</label>
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {['daily', 'weekly', 'monthly'].map(freq => (
                              <label key={freq} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={formData.reports_frequencies.includes(freq)}
                                  onChange={(e) => {
                                    const frequencies = e.target.checked
                                      ? [...formData.reports_frequencies, freq]
                                      : formData.reports_frequencies.filter(f => f !== freq)
                                    setFormData({ ...formData, reports_frequencies: frequencies })
                                  }}
                                />
                                <span style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{freq}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                      Support Level
                    </label>
                    <select
                      value={formData.support}
                      onChange={(e) => setFormData({ ...formData, support: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                    >
                      <option value="community">Community</option>
                      <option value="email">Email</option>
                      <option value="priority_email">Priority Email</option>
                      <option value="phone">Phone</option>
                    </select>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.priority_support}
                      onChange={(e) => setFormData({ ...formData, priority_support: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.875rem' }}>Priority Support</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.dedicated_support}
                      onChange={(e) => setFormData({ ...formData, dedicated_support: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.875rem' }}>Dedicated Support Manager</span>
                  </label>

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: 600 }}>Advanced Features</h4>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.api_access}
                        onChange={(e) => setFormData({ ...formData, api_access: e.target.checked })}
                      />
                      <span style={{ fontSize: '0.875rem' }}>API Access</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.white_label}
                        onChange={(e) => setFormData({ ...formData, white_label: e.target.checked })}
                      />
                      <span style={{ fontSize: '0.875rem' }}>White Label Branding</span>
                    </label>
                  </div>
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
                  <ul style={{
                    margin: 0,
                    paddingLeft: '1.25rem',
                    display: 'grid',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#374151'
                  }}>
                    {formatFeatures(tier.features).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
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
