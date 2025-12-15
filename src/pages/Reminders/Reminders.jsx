import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { userService } from '../../services/userService'
import { supabase } from '../../config/supabase'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import './Reminders.css'

const Reminders = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [reminders, setReminders] = useState([])
  const [subscriptionTier, setSubscriptionTier] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load subscription tier
      const { tier } = await userService.getSubscriptionTier(user.id)
      setSubscriptionTier(tier)

      // Load reminders from database
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('time', { ascending: true })

      if (error) throw error
      setReminders(data || [])
    } catch (err) {
      console.error('Error loading reminders:', err)
      setError('Failed to load reminders')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    // Check tier limits from features.reminders
    const reminderFeatures = subscriptionTier?.features?.reminders || {}
    if (!reminderFeatures.enabled) {
      setError('Reminders require Basic tier or higher. Please upgrade.')
      return
    }

    const maxReminders = reminderFeatures.max_per_day || 0
    if (reminders.filter(r => r.is_active).length >= maxReminders) {
      setError(`You've reached your reminder limit (${maxReminders} per day). Please upgrade for more reminders.`)
      return
    }

    setEditingReminder(null)
    setShowAddModal(true)
    setError('')
  }

  const handleEdit = (reminder) => {
    setEditingReminder(reminder)
    setShowAddModal(true)
    setError('')
  }

  const handleDelete = async (reminderId) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId)

      if (error) throw error
      setSuccess('Reminder deleted successfully')
      setTimeout(() => setSuccess(''), 3000)
      loadData()
    } catch (err) {
      console.error('Error deleting reminder:', err)
      setError('Failed to delete reminder')
    }
  }

  const handleToggleActive = async (reminder) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_active: !reminder.is_active })
        .eq('id', reminder.id)

      if (error) throw error
      setSuccess(`Reminder ${!reminder.is_active ? 'activated' : 'deactivated'}`)
      setTimeout(() => setSuccess(''), 3000)
      loadData()
    } catch (err) {
      console.error('Error updating reminder:', err)
      setError('Failed to update reminder')
    }
  }

  const handleSaveReminder = async (reminderData) => {
    try {
      console.log('Saving reminder data:', reminderData)

      // Ensure title field is set (required by schema)
      const dataToSave = {
        ...reminderData,
        title: reminderData.reminder_type, // Use reminder_type as title
      }

      console.log('Data to save:', dataToSave)

      if (editingReminder) {
        console.log('Updating reminder:', editingReminder.id)
        const { data, error } = await supabase
          .from('reminders')
          .update(dataToSave)
          .eq('id', editingReminder.id)
          .select()

        console.log('Update result:', { data, error })
        if (error) throw error
        setSuccess('Reminder updated successfully')
      } else {
        console.log('Creating new reminder')
        const { data, error } = await supabase
          .from('reminders')
          .insert([{
            ...dataToSave,
            user_id: user.id,
          }])
          .select()

        console.log('Insert result:', { data, error })
        if (error) throw error
        setSuccess('Reminder created successfully')
      }
      setTimeout(() => setSuccess(''), 3000)
      setShowAddModal(false)
      setEditingReminder(null)
      loadData()
    } catch (err) {
      console.error('Error saving reminder:', err)
      setError(err.message || 'Failed to save reminder')
      setTimeout(() => setError(''), 5000)
    }
  }

  if (loading) {
    return (
      <div className="reminders-page">
        <div className="page-title">Reminders</div>
        <Card><p>Loading...</p></Card>
      </div>
    )
  }

  const reminderFeatures = subscriptionTier?.features?.reminders || {}
  const maxReminders = reminderFeatures.max_per_day || 0
  const activeReminders = reminders.filter(r => r.is_active).length
  const canAddMore = reminderFeatures.enabled && activeReminders < maxReminders

  return (
    <div className="reminders-page">
      <div className="page-title">Reminders</div>

      {subscriptionTier && (
        <Card>
          <div className="tier-info">
            <div>
              <strong>Current Tier:</strong> {subscriptionTier.tier_name}
            </div>
            <div>
              <strong>Reminder Limit:</strong> {activeReminders} / {maxReminders} per day
            </div>
            {!canAddMore && (
              <div className="upgrade-prompt">
                <span>You've reached your limit. </span>
                <a href="/profile" style={{ color: 'var(--purple)', textDecoration: 'underline' }}>
                  Upgrade for more reminders
                </a>
              </div>
            )}
          </div>
        </Card>
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="card-title">Your Reminders</div>
          <Button
            variant="teal"
            onClick={handleAdd}
            disabled={!canAddMore}
            style={{ width: 'auto', padding: '12px 20px', fontSize: '14px' }}
          >
            + Add Reminder
          </Button>
        </div>

        {reminders.length === 0 ? (
          <div className="empty-state">
            <p>No reminders yet. Create one to get started!</p>
            {!reminderFeatures.enabled && (
              <p className="hint">Reminders require Basic tier or higher.</p>
            )}
          </div>
        ) : (
          <div className="reminders-list">
            {reminders.map((reminder) => (
              <div key={reminder.id} className={`reminder-item ${!reminder.is_active ? 'inactive' : ''}`}>
                <div className="reminder-main">
                  <div className="reminder-header">
                    <div>
                      <h3 className="reminder-type">{reminder.reminder_type}</h3>
                      <p className="reminder-time">{reminder.time || 'No time set'}</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={reminder.is_active}
                        onChange={() => handleToggleActive(reminder)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  {reminder.message && (
                    <p className="reminder-message">{reminder.message}</p>
                  )}
                  <div className="reminder-days">
                    {reminder.days_of_week && reminder.days_of_week.length > 0 ? (
                      <span>
                        Days: {reminder.days_of_week.map(d => getDayName(d)).join(', ')}
                      </span>
                    ) : (
                      <span>Every day</span>
                    )}
                  </div>
                </div>
                <div className="reminder-actions">
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(reminder)}
                    style={{
                      fontSize: '12px',
                      padding: '8px 16px',
                      width: 'auto',
                      backgroundColor: '#f3f4f6',
                      color: '#1f2937',
                      border: '1px solid #d1d5db'
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(reminder.id)}
                    style={{
                      fontSize: '12px',
                      padding: '8px 16px',
                      width: 'auto',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showAddModal && (
        <ReminderForm
          reminder={editingReminder}
          onSave={handleSaveReminder}
          onCancel={() => {
            setShowAddModal(false)
            setEditingReminder(null)
            setError('')
          }}
        />
      )}
    </div>
  )
}

const getDayName = (dayNum) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[dayNum] || dayNum
}

// Reminder Form Component
const ReminderForm = ({ reminder, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    reminder_type: reminder?.reminder_type || 'Medication',
    message: reminder?.message || '',
    frequency: reminder?.frequency || 'one-off',
    time: reminder?.time || '08:00',
    days_of_week: reminder?.days_of_week || [],
    is_active: reminder?.is_active !== undefined ? reminder.is_active : true,
  })

  const reminderTypes = [
    'Medication',
    'Track Symptoms',
    'Log Food',
    'Exercise',
    'Check-in',
    'Water Intake',
    'Journal Entry',
    'Custom',
  ]

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ]

  const handleDayToggle = (dayValue) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayValue)
        ? prev.days_of_week.filter(d => d !== dayValue)
        : [...prev.days_of_week, dayValue],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Prepare data to save
    const dataToSubmit = { ...formData }

    // Auto-generate message if empty
    if (!dataToSubmit.message) {
      if (dataToSubmit.reminder_type === 'Custom') {
        alert('Please enter a message for custom reminders')
        return
      }
      dataToSubmit.message = `Time to ${dataToSubmit.reminder_type.toLowerCase()}!`
    }

    // For hourly reminders, set a default time (required by DB but not used)
    if (dataToSubmit.frequency === 'hourly') {
      dataToSubmit.time = '00:00'
    }

    onSave(dataToSubmit)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{reminder ? 'Edit Reminder' : 'Add Reminder'}</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Reminder Type</label>
            <select
              className="form-select"
              value={formData.reminder_type}
              onChange={(e) => {
                const newType = e.target.value
                setFormData({ 
                  ...formData, 
                  reminder_type: newType,
                  // Clear message if switching to/from Custom
                  message: newType === 'Custom' ? '' : (formData.reminder_type === 'Custom' ? '' : formData.message)
                })
              }}
              required
            >
              {reminderTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Message</label>
            <input
              type="text"
              className="form-input"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={formData.reminder_type === 'Custom' ? 'Enter your reminder message' : 'Auto-generated if left empty'}
            />
            {formData.reminder_type !== 'Custom' && (
              <small className="form-hint">Leave empty to auto-generate based on type</small>
            )}
          </div>

          <div className="form-group">
            <label>Frequency Type</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <span style={{
                fontWeight: formData.frequency === 'one-off' ? '600' : '400',
                color: formData.frequency === 'one-off' ? 'var(--teal)' : '#6b7280'
              }}>
                One-off
              </span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.frequency === 'hourly'}
                  onChange={(e) => setFormData({
                    ...formData,
                    frequency: e.target.checked ? 'hourly' : 'one-off'
                  })}
                />
                <span className="slider"></span>
              </label>
              <span style={{
                fontWeight: formData.frequency === 'hourly' ? '600' : '400',
                color: formData.frequency === 'hourly' ? 'var(--teal)' : '#6b7280'
              }}>
                Hourly
              </span>
            </div>
            <small className="form-hint" style={{ display: 'block', marginTop: '8px' }}>
              {formData.frequency === 'hourly'
                ? 'Will send every hour based on your Communication Settings (start/end time)'
                : 'Will send once at the specific time you set below'}
            </small>
          </div>

          {formData.frequency === 'one-off' && (
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                className="form-input"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Days of Week</label>
            <div className="days-grid">
              {daysOfWeek.map(day => (
                <label key={day.value} className="day-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.days_of_week.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                  />
                  <span>{day.label.substring(0, 3)}</span>
                </label>
              ))}
            </div>
            <small className="form-hint">Select days when this reminder should be sent. Leave all unchecked for daily.</small>
          </div>

          <div className="form-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="toggle-checkbox"
              />
              <span>Active</span>
            </label>
          </div>

          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#1f2937',
                border: '1px solid #d1d5db'
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal">
              {reminder ? 'Update' : 'Create'} Reminder
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Reminders

