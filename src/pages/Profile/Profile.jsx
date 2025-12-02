import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { userService } from '../../services/userService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import './Profile.css'

const Profile = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [subscriptionTier, setSubscriptionTier] = useState(null)
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    country: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    date_of_birth: '',
    stage: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { tier, profile: profileData, error } = await userService.getSubscriptionTier(user.id)
      if (error) throw error
      
      setSubscriptionTier(tier)
      if (profileData) {
        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          phone: profileData.phone || '',
          country: profileData.country || '',
          timezone: profileData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          date_of_birth: profileData.date_of_birth || '',
          stage: profileData.stage || '',
        })
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile } = await userService.createProfile({
          user_id: user.id,
          email: user.email,
          ...profile,
        })
        if (newProfile) setProfile(newProfile)
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const updates = {
        email: user.email,
        ...profile,
      }

      const { error } = await userService.updateProfile(user.id, updates)
      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to save profile')
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const stageOptions = [
    { value: '', label: 'Select stage...' },
    { value: 'perimenopause', label: 'Perimenopause' },
    { value: 'menopause', label: 'Menopause' },
    { value: 'postmenopause', label: 'Postmenopause' },
  ]

  if (loading) {
    return (
      <div className="profile">
        <div className="page-title">Profile & Settings</div>
        <Card>
          <p>Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="profile">
      <div className="page-title">Profile & Settings</div>

      <Card>
        <div className="card-title">Personal Information</div>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                placeholder="First name"
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
            />
            <small className="form-hint">Email cannot be changed</small>
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              className="form-input"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                className="form-input"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                placeholder="Country"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={profile.date_of_birth}
                onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Menopause Stage</label>
            <select
              className="form-select"
              value={profile.stage}
              onChange={(e) => setProfile({ ...profile, stage: e.target.value })}
            >
              {stageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Timezone</label>
            <input
              type="text"
              className="form-input"
              value={profile.timezone}
              onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
              placeholder="UTC"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Profile saved successfully! ✅</div>}

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </Card>

      {subscriptionTier && (
        <Card>
          <div className="card-title">Subscription</div>
          <div className="subscription-info">
            <div className="subscription-tier">
              <div className="tier-name">{subscriptionTier.tier_name || 'Free'}</div>
              <div className="tier-price">
                {subscriptionTier.price_monthly > 0 
                  ? `$${subscriptionTier.price_monthly}/month`
                  : 'Free'
                }
              </div>
            </div>
            <div className="tier-features">
              <div className="feature-item">
                <span className="feature-label">Reminders:</span>
                <span className="feature-value">
                  {subscriptionTier.max_reminders_per_day || 0} per day
                </span>
              </div>
              <div className="feature-item">
                <span className="feature-label">History:</span>
                <span className="feature-value">
                  {subscriptionTier.features?.history_unlimited ? 'Unlimited' : 
                   subscriptionTier.features?.history_30_days ? '30 days' : '7 days'}
                </span>
              </div>
            </div>
            <Button variant="teal" style={{ marginTop: '16px' }}>
              Manage Subscription
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Profile

