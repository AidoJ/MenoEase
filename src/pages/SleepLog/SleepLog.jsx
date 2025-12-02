import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { sleepService } from '../../services/supabaseService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import DateNavigator from '../../components/DateNavigator/DateNavigator'
import { getTodayDate, calculateSleepDuration, formatDate } from '../../utils/helpers'
import { supabase } from '../../config/supabase'
import { format, parseISO } from 'date-fns'
import './SleepLog.css'

const SleepLog = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || getTodayDate())
  const [recentNights, setRecentNights] = useState([])
  
  const [quality, setQuality] = useState('good')
  const [bedtime, setBedtime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('06:30')
  const [nightSweats, setNightSweats] = useState('none')
  const [disturbances, setDisturbances] = useState('')

  useEffect(() => {
    loadSleepData()
    loadRecentNights()
  }, [selectedDate])

  const loadSleepData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await sleepService.getByDate(selectedDate, user.id)
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading sleep log:', error)
        return
      }
      
      if (data) {
        setQuality(data.quality || 'good')
        setBedtime(data.bedtime || '23:00')
        setWakeTime(data.wake_time || '06:30')
        setNightSweats(data.night_sweats || 'none')
        setDisturbances(data.disturbances || '')
      } else {
        // Reset form if no data for this date
        setQuality('good')
        setBedtime('23:00')
        setWakeTime('06:30')
        setNightSweats('none')
        setDisturbances('')
      }
    } catch (err) {
      console.error('Error loading sleep log:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentNights = async () => {
    if (!user) return
    
    try {
      const { data, error } = await sleepService.getAll(user.id)
      if (error) throw error
      
      // Get last 7 nights (excluding selected date)
      const recent = (data || [])
        .filter(entry => entry.date !== selectedDate)
        .slice(0, 7)
        .map(entry => {
          const duration = calculateSleepDuration(
            entry.bedtime ? `2000-01-01T${entry.bedtime}:00` : null,
            entry.wake_time ? `2000-01-01T${entry.wake_time}:00` : null
          )
          return {
            ...entry,
            duration: duration ? `${duration.hours}h ${duration.minutes}m` : '--'
          }
        })
      
      setRecentNights(recent)
    } catch (err) {
      console.error('Error loading recent nights:', err)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const sleepData = {
        user_id: user.id,
        date: selectedDate,
        bedtime: bedtime,
        wake_time: wakeTime,
        quality: quality,
        night_sweats: nightSweats,
        disturbances: disturbances || null,
      }

      // Check if entry exists for selected date
      const { data: existing } = await sleepService.getByDate(selectedDate, user.id)
      
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
      loadRecentNights() // Refresh history
    } catch (err) {
      setError(err.message || 'Failed to save sleep log')
      console.error('Error saving sleep log:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSelectHistoryDate = (date) => {
    setSelectedDate(date)
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

      <DateNavigator 
        selectedDate={selectedDate}
        onChange={setSelectedDate}
        maxDate={getTodayDate()}
      />

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

      {recentNights.length > 0 && (
        <Card>
          <div className="card-title">Recent Nights</div>
          <div className="card-subtitle">Last 7 nights</div>
          <div className="sleep-history">
            {recentNights.map((night) => (
              <div
                key={night.id}
                className="sleep-history-item"
                onClick={() => handleSelectHistoryDate(night.date)}
              >
                <div className="history-date">{formatDate(night.date)}</div>
                <div className="history-details">
                  <div className="history-quality">
                    {qualityOptions.find(q => q.value === night.quality)?.emoji || '😊'}
                    <span>{night.quality || 'Good'}</span>
                  </div>
                  <div className="history-duration">{night.duration}</div>
                  {night.night_sweats && night.night_sweats !== 'none' && (
                    <div className="history-sweats">💦 {night.night_sweats}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default SleepLog
