import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { sleepService } from '../../services/supabaseService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { getTodayDate, calculateSleepDuration } from '../../utils/helpers'
import { supabase } from '../../config/supabase'
import './SleepLog.css'

const SleepLog = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [quality, setQuality] = useState('good')
  const [bedtime, setBedtime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('06:30')
  const [nightSweats, setNightSweats] = useState('none')
  const [disturbances, setDisturbances] = useState('')

  useEffect(() => {
    loadTodaySleep()
  }, [])

  const loadTodaySleep = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const today = getTodayDate()
      const { data, error } = await sleepService.getByDate(today)
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading sleep log:', error)
        return
      }
      
      if (data) {
        setQuality(data.quality || 'good')
        setBedtime(data.bedtime || '23:00')
        setWakeTime(data.wake_time || '06:30')
        setNightSweats(data.night_sweats || 'none')
        setDisturbances(data.disturbances || '')
      }
    } catch (err) {
      console.error('Error loading sleep log:', err)
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
      const today = getTodayDate()
      const sleepData = {
        user_id: user.id,
        date: today,
        bedtime: bedtime,
        wake_time: wakeTime,
        quality: quality,
        night_sweats: nightSweats,
        disturbances: disturbances || null,
      }

      // Check if entry exists for today
      const { data: existing } = await sleepService.getByDate(today)
      
      let result
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('sleep_logs')
          .update(sleepData)
          .eq('id', existing.id)
        if (error) throw error
      } else {
        // Create new
        result = await sleepService.create(sleepData)
        if (result.error) throw result.error
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to save sleep log')
      console.error('Error saving sleep log:', err)
    } finally {
      setSaving(false)
    }
  }

  const qualityOptions = [
    { value: 'awful', emoji: '😫', label: 'Awful' },
    { value: 'poor', emoji: '😔', label: 'Poor' },
    { value: 'good', emoji: '😊', label: 'Good' },
    { value: 'great', emoji: '😄', label: 'Great' },
  ]

  const nightSweatsOptions = [
    { value: 'none', emoji: '✅', label: 'None' },
    { value: 'mild', emoji: '😓', label: 'Mild' },
    { value: 'moderate', emoji: '💦', label: 'Moderate' },
    { value: 'severe', emoji: '🥵', label: 'Severe' },
  ]

  const sleepDuration = calculateSleepDuration(
    bedtime ? `2000-01-01T${bedtime}:00` : null,
    wakeTime ? `2000-01-01T${wakeTime}:00` : null
  )

  if (loading) {
    return (
      <div className="sleep-log">
        <div className="page-title">Sleep Log</div>
        <Card>
          <p>Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="sleep-log">
      <div className="page-title">Sleep Log</div>

      <Card>
        <form onSubmit={handleSave}>
          <div className="card-title">How did you sleep?</div>

          <div className="form-group">
            <div className="form-label">Sleep Quality</div>
            <div className="selection-grid">
              {qualityOptions.map((option) => (
                <div
                  key={option.value}
                  className={`selection-btn ${quality === option.value ? 'selected' : ''}`}
                  onClick={() => setQuality(option.value)}
                >
                  <span className="emoji">{option.emoji}</span>
                  <span className="label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <div className="form-label">Sleep Duration</div>
            <input
              type="time"
              className="form-input"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              placeholder="Bedtime"
            />
            <input
              type="time"
              className="form-input"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              placeholder="Wake time"
              style={{ marginTop: '10px' }}
            />
            {sleepDuration && (
              <div className="sleep-duration">
                Duration: {sleepDuration.hours}h {sleepDuration.minutes}m
              </div>
            )}
          </div>

          <div className="form-group">
            <div className="form-label">Night Sweats?</div>
            <div className="selection-grid">
              {nightSweatsOptions.map((option) => (
                <div
                  key={option.value}
                  className={`selection-btn ${nightSweats === option.value ? 'selected' : ''}`}
                  onClick={() => setNightSweats(option.value)}
                >
                  <span className="emoji">{option.emoji}</span>
                  <span className="label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <div className="form-label">Sleep Disturbances</div>
            <textarea
              className="form-textarea"
              value={disturbances}
              onChange={(e) => setDisturbances(e.target.value)}
              placeholder="Note any issues: insomnia, waking up, restlessness..."
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Sleep log saved successfully! ✅</div>}

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Sleep Log'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default SleepLog
