import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { userService } from '../../services/userService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import './Profile.css'

const Profile = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
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
    setError('')
    try {
      // Try direct profile fetch first
      const { data: profileData, error: profileError } = await userService.getProfile(user.id)
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError)
        setError(`Failed to load profile: ${profileError.message || 'Unknown error'}`)
        setLoading(false)
        return
      }
      
      // Get subscription tier
      const { tier, error: tierError } = await userService.getSubscriptionTier(user.id)
      
      if (tierError && tierError.code !== 'PGRST116') {
        console.warn('Error loading subscription tier:', tierError)
        // Don't fail the whole load for tier errors
      }
      
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
        // If no profile exists, initialize with defaults
        setProfile({
          first_name: '',
          last_name: '',
          phone: '',
          country: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          date_of_birth: '',
          stage: '',
        })
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setError(`Failed to load profile: ${err.message || 'Unknown error'}`)
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
      const profileData = {
        user_id: user.id,
        email: user.email,
        first_name: profile.first_name?.trim() || null,
        last_name: profile.last_name?.trim() || null,
        phone: profile.phone?.trim() || null,
        country: profile.country?.trim() || null,
        timezone: profile.timezone?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone,
        date_of_birth: profile.date_of_birth || null,
        stage: profile.stage || null,
      }

      // Check if profile exists
      const { data: existing, error: checkError } = await userService.getProfile(user.id)
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking profile:', checkError)
        throw new Error(`Failed to check profile: ${checkError.message}`)
      }
      
      let result
      if (existing) {
        // Update existing profile - remove user_id and email from update (they're in WHERE clause)
        const { user_id, email, ...updateData } = profileData
        const { data, error } = await userService.updateProfile(user.id, updateData)
        if (error) {
          console.error('Update error details:', error)
          throw new Error(`Failed to update profile: ${error.message || JSON.stringify(error)}`)
        }
        result = data
      } else {
        // Create new profile
        const { data, error } = await userService.createProfile(profileData)
        if (error) {
          console.error('Create error details:', error)
          throw new Error(`Failed to create profile: ${error.message || JSON.stringify(error)}`)
        }
        result = data
      }

      // Reload profile to ensure we have the latest data
      await loadProfile()
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err.message || 'Failed to save profile. Please check console for details.')
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
                  {subscriptionTier.features?.reminders?.max_per_day || 0} per day
                </span>
              </div>
              <div className="feature-item">
                <span className="feature-label">History:</span>
                <span className="feature-value">
                  {subscriptionTier.features?.history_days === null ? 'Unlimited' :
                   `${subscriptionTier.features?.history_days || 7} days`}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <Button
                variant="teal"
                onClick={() => navigate('/subscription/manage')}
              >
                Manage Subscription
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/settings/communication')}
              >
                Communication Settings
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/reminders')}
              >
                Manage Reminders
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Profile

