import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { exerciseService } from '../../services/supabaseService'
import { getExercisesMaster } from '../../services/masterDataService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { getTodayDate } from '../../utils/helpers'
import './Exercise.css'

const Exercise = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [exercisesMaster, setExercisesMaster] = useState([])
  const [activityType, setActivityType] = useState('')
  const [duration, setDuration] = useState('')
  const [intensity, setIntensity] = useState('moderate')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadExercisesMaster()
  }, [])

  const loadExercisesMaster = async () => {
    try {
      const { data, error } = await getExercisesMaster()
      if (error) throw error
      setExercisesMaster(data || [])
      if (data && data.length > 0) {
        setActivityType(data[0].name)
      }
    } catch (err) {
      console.error('Error loading exercises master:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return

    if (!activityType || !duration) {
      setError('Please select activity type and enter duration')
      return
    }

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const today = getTodayDate()
      const exerciseData = {
        user_id: user.id,
        date: today,
        activity_type: activityType,
        duration: parseInt(duration),
        intensity: intensity,
        notes: notes || null,
      }

      const result = await exerciseService.create(exerciseData)
      if (result.error) throw result.error

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        // Reset form
        setDuration('')
        setNotes('')
        setIntensity('moderate')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to save exercise')
      console.error('Error saving exercise:', err)
    } finally {
      setSaving(false)
    }
  }

  const intensityOptions = [
    { value: 'light', emoji: '😌', label: 'Light' },
    { value: 'moderate', emoji: '🙂', label: 'Moderate' },
    { value: 'vigorous', emoji: '💪', label: 'Vigorous' },
    { value: 'intense', emoji: '🔥', label: 'Intense' },
  ]

  if (loading) {
    return (
      <div className="exercise">
        <div className="page-title">Exercise & Activity</div>
        <Card>
          <p>Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="exercise">
      <div className="page-title">Exercise & Activity</div>

      <Card>
        <form onSubmit={handleSave}>
          <div className="card-title">Log Activity</div>

          <div className="form-group">
            <div className="form-label">Activity Type</div>
            <select
              className="form-select"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              required
            >
              <option value="">Select activity...</option>
              {exercisesMaster.map((exercise) => (
                <option key={exercise.id} value={exercise.name}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <div className="form-label">Duration (minutes)</div>
            <input
              type="number"
              className="form-input"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="30"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <div className="form-label">Intensity</div>
            <div className="selection-grid">
              {intensityOptions.map((option) => (
                <div
                  key={option.value}
                  className={`selection-btn ${intensity === option.value ? 'selected' : ''}`}
                  onClick={() => setIntensity(option.value)}
                >
                  <span className="emoji">{option.emoji}</span>
                  <span className="label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <div className="form-label">Notes</div>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel? Energy levels, pain, mood..."
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Activity saved successfully! ✅</div>}

          <Button type="submit" variant="teal" disabled={saving}>
            {saving ? 'Saving...' : 'Save Activity'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default Exercise
