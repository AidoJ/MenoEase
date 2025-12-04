import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { userService } from '../../services/userService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { supabase } from '../../config/supabase'
import './CommunicationPreferences.css'

const CommunicationPreferences = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [subscriptionTier, setSubscriptionTier] = useState(null)
  
  const [preferences, setPreferences] = useState({
    reminders: {
      method: 'email',
      frequency: 'daily',
      start_time: '07:00',
      end_time: '22:00',
      enabled: false,
    },
    reports: {
      frequency: 'weekly',
      time: '17:00',
      day_of_week: 1,
      day_of_month: 1,
      method: 'email',
      enabled: false,
    },
  })

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Load subscription tier
      const { tier } = await userService.getSubscriptionTier(user.id)
      setSubscriptionTier(tier)
      
      // Load user profile with preferences
      const { data: profile } = await userService.getProfile(user.id)
      
      if (profile?.communication_preferences) {
        setPreferences({
          reminders: {
            ...preferences.reminders,
            ...profile.communication_preferences.reminders,
          },
          reports: {
            ...preferences.reports,
            ...profile.communication_preferences.reports,
          },
        })
      }
    } catch (err) {
      console.error('Error loading preferences:', err)
      setError('Failed to load preferences')
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
      // Validate preferences based on tier
      const validationError = validatePreferences()
      if (validationError) {
        setError(validationError)
        setSaving(false)
        return
      }

      // Update user profile
      const { error } = await supabase
        .from('user_profiles')
        .update({
          communication_preferences: preferences,
        })
        .eq('user_id', user.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving preferences:', err)
      setError(err.message || 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const validatePreferences = () => {
    const commOptions = subscriptionTier?.features?.communication_options || {}
    
    // Check SMS availability
    if (preferences.reminders.method === 'sms' || preferences.reminders.method === 'both') {
      if (!commOptions.sms) {
        return 'SMS reminders require Basic tier or higher. Please upgrade or select Email only.'
      }
    }
    
    if (preferences.reports.method === 'sms' || preferences.reports.method === 'both') {
      if (!commOptions.sms) {
        return 'SMS reports require Basic tier or higher. Please upgrade or select Email only.'
      }
    }

    // Check frequency availability
    const allowedFrequencies = commOptions.reminder_frequencies || ['daily']
    if (!allowedFrequencies.includes(preferences.reminders.frequency)) {
      return `Reminder frequency "${preferences.reminders.frequency}" requires Premium tier or higher.`
    }

    // Check reports availability
    if (preferences.reports.enabled && !commOptions.reports) {
      return 'Reports require Basic tier or higher. Please upgrade.'
    }

    return null
  }

  const getReminderPreview = () => {
    if (!preferences.reminders.enabled) return 'Reminders disabled'
    
    const freqMap = {
      hourly: 'every hour',
      every_2_hours: 'every 2 hours',
      every_3_hours: 'every 3 hours',
      daily: 'daily',
      twice_daily: 'twice daily',
    }
    
    const methodMap = {
      email: 'via Email',
      sms: 'via SMS',
      both: 'via Email and SMS',
    }
    
    return `Reminders ${freqMap[preferences.reminders.frequency] || preferences.reminders.frequency} from ${preferences.reminders.start_time} to ${preferences.reminders.end_time} ${methodMap[preferences.reminders.method] || 'via Email'}`
  }

  const getReportPreview = () => {
    if (!preferences.reports.enabled) return 'Reports disabled'
    
    const freqMap = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
    }
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    let schedule = ''
    if (preferences.reports.frequency === 'weekly') {
      schedule = `every ${dayNames[preferences.reports.day_of_week]}`
    } else if (preferences.reports.frequency === 'monthly') {
      schedule = `on the ${preferences.reports.day_of_month}${getOrdinal(preferences.reports.day_of_month)}`
    } else {
      schedule = 'daily'
    }
    
    const methodMap = {
      email: 'via Email',
      sms: 'via SMS',
      both: 'via Email and SMS',
    }
    
    return `${freqMap[preferences.reports.frequency]} reports ${schedule} at ${preferences.reports.time} ${methodMap[preferences.reports.method] || 'via Email'}`
  }

  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }

  const commOptions = subscriptionTier?.features?.communication_options || {}
  const reminderFrequencies = commOptions.reminder_frequencies || ['daily']
  const reportFrequencies = commOptions.report_frequencies || ['weekly']

  if (loading) {
    return (
      <div className="communication-preferences">
        <div className="page-title">Communication Preferences</div>
        <Card>
          <p>Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="communication-preferences">
      <div className="page-title">Communication Preferences</div>
      
      {subscriptionTier && (
        <Card>
          <div className="tier-badge">
            Current Tier: <strong>{subscriptionTier.tier_name}</strong>
            {!commOptions.sms && (
              <span className="upgrade-hint">Upgrade for SMS and more options</span>
            )}
          </div>
        </Card>
      )}

      <Card>
        <form onSubmit={handleSave}>
          <div className="card-title">📱 Reminder Settings</div>
          
          <div className="form-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={preferences.reminders.enabled}
                onChange={(e) => setPreferences({
                  ...preferences,
                  reminders: { ...preferences.reminders, enabled: e.target.checked }
                })}
                className="toggle-checkbox"
              />
              <span>Enable Reminders</span>
            </label>
          </div>

          {preferences.reminders.enabled && (
            <>
              <div className="form-group">
                <label>Delivery Method</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="reminder-method"
                      value="email"
                      checked={preferences.reminders.method === 'email'}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        reminders: { ...preferences.reminders, method: e.target.value }
                      })}
                    />
                    <span>Email</span>
                  </label>
                  <label className={`radio-option ${!commOptions.sms ? 'disabled' : ''}`}>
                    <input
                      type="radio"
                      name="reminder-method"
                      value="sms"
                      checked={preferences.reminders.method === 'sms'}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        reminders: { ...preferences.reminders, method: e.target.value }
                      })}
                      disabled={!commOptions.sms}
                    />
                    <span>SMS {!commOptions.sms && '(Upgrade Required)'}</span>
                  </label>
                  <label className={`radio-option ${!commOptions.sms ? 'disabled' : ''}`}>
                    <input
                      type="radio"
                      name="reminder-method"
                      value="both"
                      checked={preferences.reminders.method === 'both'}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        reminders: { ...preferences.reminders, method: e.target.value }
                      })}
                      disabled={!commOptions.sms}
                    />
                    <span>Both {!commOptions.sms && '(Upgrade Required)'}</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Frequency</label>
                <select
                  className="form-select"
                  value={preferences.reminders.frequency}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    reminders: { ...preferences.reminders, frequency: e.target.value }
                  })}
                >
                  {reminderFrequencies.map(freq => (
                    <option key={freq} value={freq}>
                      {freq === 'hourly' ? 'Every Hour' :
                       freq === 'every_2_hours' ? 'Every 2 Hours' :
                       freq === 'every_3_hours' ? 'Every 3 Hours' :
                       freq === 'daily' ? 'Daily' :
                       freq === 'twice_daily' ? 'Twice Daily' : freq}
                    </option>
                  ))}
                </select>
                {reminderFrequencies.length === 1 && (
                  <small className="form-hint">Upgrade for more frequency options</small>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={preferences.reminders.start_time}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      reminders: { ...preferences.reminders, start_time: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={preferences.reminders.end_time}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      reminders: { ...preferences.reminders, end_time: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="preview-box">
                <strong>Preview:</strong> {getReminderPreview()}
              </div>
            </>
          )}
        </form>
      </Card>

      <Card>
        <form onSubmit={handleSave}>
          <div className="card-title">📊 Report Settings</div>
          
          <div className="form-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={preferences.reports.enabled}
                onChange={(e) => setPreferences({
                  ...preferences,
                  reports: { ...preferences.reports, enabled: e.target.checked }
                })}
                className="toggle-checkbox"
                disabled={!commOptions.reports}
              />
              <span>Enable Reports {!commOptions.reports && '(Upgrade Required)'}</span>
            </label>
          </div>

          {preferences.reports.enabled && (
            <>
              <div className="form-group">
                <label>Frequency</label>
                <select
                  className="form-select"
                  value={preferences.reports.frequency}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    reports: { ...preferences.reports, frequency: e.target.value }
                  })}
                >
                  {reportFrequencies.map(freq => (
                    <option key={freq} value={freq}>
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {preferences.reports.frequency === 'weekly' && (
                <div className="form-group">
                  <label>Day of Week</label>
                  <select
                    className="form-select"
                    value={preferences.reports.day_of_week}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      reports: { ...preferences.reports, day_of_week: parseInt(e.target.value) }
                    })}
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>
              )}

              {preferences.reports.frequency === 'monthly' && (
                <div className="form-group">
                  <label>Day of Month</label>
                  <select
                    className="form-select"
                    value={preferences.reports.day_of_month}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      reports: { ...preferences.reports, day_of_month: parseInt(e.target.value) }
                    })}
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={preferences.reports.time}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    reports: { ...preferences.reports, time: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label>Delivery Method</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="report-method"
                      value="email"
                      checked={preferences.reports.method === 'email'}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        reports: { ...preferences.reports, method: e.target.value }
                      })}
                    />
                    <span>Email</span>
                  </label>
                  <label className={`radio-option ${!commOptions.sms ? 'disabled' : ''}`}>
                    <input
                      type="radio"
                      name="report-method"
                      value="sms"
                      checked={preferences.reports.method === 'sms'}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        reports: { ...preferences.reports, method: e.target.value }
                      })}
                      disabled={!commOptions.sms}
                    />
                    <span>SMS {!commOptions.sms && '(Upgrade Required)'}</span>
                  </label>
                  <label className={`radio-option ${!commOptions.sms ? 'disabled' : ''}`}>
                    <input
                      type="radio"
                      name="report-method"
                      value="both"
                      checked={preferences.reports.method === 'both'}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        reports: { ...preferences.reports, method: e.target.value }
                      })}
                      disabled={!commOptions.sms}
                    />
                    <span>Both {!commOptions.sms && '(Upgrade Required)'}</span>
                  </label>
                </div>
              </div>

              <div className="preview-box">
                <strong>Preview:</strong> {getReportPreview()}
              </div>
            </>
          )}
        </form>
      </Card>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Preferences saved successfully! ✅</div>}

      <Card>
        <Button 
          type="button" 
          variant="teal" 
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%' }}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </Card>
    </div>
  )
}

export default CommunicationPreferences




