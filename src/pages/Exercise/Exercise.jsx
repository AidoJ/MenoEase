import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { exerciseService } from '../../services/supabaseService'
import { getExercisesMaster, getExerciseCategories } from '../../services/masterDataService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import DateNavigator from '../../components/DateNavigator/DateNavigator'
import { getTodayDate, formatDate } from '../../utils/helpers'
import { supabase } from '../../config/supabase'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import './Exercise.css'

const Exercise = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || getTodayDate())
  const [weeklySummary, setWeeklySummary] = useState(null)
  
  const [exercisesMaster, setExercisesMaster] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Exercises')
  const [activityType, setActivityType] = useState('')
  const [duration, setDuration] = useState('')
  const [intensity, setIntensity] = useState('moderate')
  const [notes, setNotes] = useState('')
  const [useCustomName, setUseCustomName] = useState(false)
  const [customActivityName, setCustomActivityName] = useState('')

  useEffect(() => {
    loadExercisesMaster()
  }, [])

  useEffect(() => {
    loadWeeklySummary()
  }, [selectedDate])

  const loadExercisesMaster = async () => {
    try {
      const [catsData, exercisesData] = await Promise.all([
        getExerciseCategories(),
        getExercisesMaster(selectedCategory),
      ])
      setCategories(catsData.data || [])
      setExercisesMaster(exercisesData.data || [])
    } catch (err) {
      console.error('Error loading exercises master:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Reload exercises when category changes
    const loadByCategory = async () => {
      try {
        const { data } = await getExercisesMaster(selectedCategory)
        setExercisesMaster(data || [])
        setActivityType('')
      } catch (err) {
        console.error('Error loading exercises by category:', err)
      }
    }
    loadByCategory()
  }, [selectedCategory])

  const loadWeeklySummary = async () => {
    if (!user) return
    
    try {
      const selectedDateObj = new Date(selectedDate)
      const weekStart = startOfWeek(selectedDateObj, { weekStartsOn: 1 }) // Monday
      const weekEnd = endOfWeek(selectedDateObj, { weekStartsOn: 1 })
      
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'))
        .order('date', { ascending: false })
      
      if (error) throw error
      
      const workouts = data || []
      const totalMinutes = workouts.reduce((sum, w) => sum + (parseInt(w.duration) || 0), 0)
      
      setWeeklySummary({
        workouts: workouts,
        count: workouts.length,
        totalMinutes: totalMinutes,
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd'),
      })
    } catch (err) {
      console.error('Error loading weekly summary:', err)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return

    const finalActivityType = useCustomName ? customActivityName.trim() : activityType
    if (!finalActivityType || !duration) {
      setError('Please select activity type and enter duration')
      return
    }

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      // Get category from master exercise if selected, otherwise use selected category
      const masterExercise = exercisesMaster.find(e => e.name === activityType)
      const exerciseCategory = masterExercise?.category || selectedCategory

      const exerciseData = {
        user_id: user.id,
        date: selectedDate,
        activity_type: finalActivityType,
        category: exerciseCategory,
        duration: parseInt(duration),
        intensity: intensity,
        notes: notes || null,
      }

      const result = await exerciseService.create(exerciseData)
      if (result.error) throw result.error

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setDuration('')
        setNotes('')
        setIntensity('moderate')
        setActivityType('')
        setCustomActivityName('')
        setUseCustomName(false)
        loadWeeklySummary()
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
        <div className="page-title">Exercise & Therapies</div>
        <Card>
          <p>Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="exercise">
      <div className="page-title">Exercise & Therapies</div>

      <DateNavigator 
        selectedDate={selectedDate}
        onChange={setSelectedDate}
        maxDate={getTodayDate()}
      />

      {weeklySummary && (
        <Card>
          <div className="card-title">This Week</div>
          <div className="card-subtitle">
            {format(new Date(weeklySummary.weekStart), 'MMM d')} - {format(new Date(weeklySummary.weekEnd), 'MMM d')}
          </div>
          <div className="weekly-stats">
            <div className="stat-item">
              <div className="stat-value">{weeklySummary.count}</div>
              <div className="stat-label">Workouts</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{weeklySummary.totalMinutes}</div>
              <div className="stat-label">Minutes</div>
            </div>
          </div>
          {weeklySummary.workouts.length > 0 && (
            <div className="weekly-workouts">
              {weeklySummary.workouts.map((workout) => (
                <div key={workout.id} className="workout-item">
                  <div className="workout-date">{formatDate(workout.date)}</div>
                  <div className="workout-details">
                    <span className="workout-activity">{workout.activity_type}</span>
                    <span className="workout-duration">{workout.duration} min</span>
                    <span className="workout-intensity">{intensityOptions.find(i => i.value === workout.intensity)?.emoji}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card>
        <form onSubmit={handleSave}>
          <div className="card-title">Log Activity or Therapy</div>

          <div className="form-group">
            <div className="form-label">Category</div>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <div className="form-label">Select from {selectedCategory}</div>
            <select
              className="form-select"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              disabled={useCustomName}
            >
              <option value="">Choose from list...</option>
              {exercisesMaster.map((exercise) => (
                <option key={exercise.id} value={exercise.name}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ textAlign: 'center', margin: '12px 0' }}>
            <span style={{ color: 'var(--muted)', fontSize: '14px' }}>OR</span>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={useCustomName}
                onChange={(e) => {
                  setUseCustomName(e.target.checked)
                  if (e.target.checked) {
                    setActivityType('')
                  }
                }}
                style={{ marginRight: '8px' }}
              />
              Enter Custom Name
            </label>
            {useCustomName && (
              <input
                type="text"
                className="form-input"
                value={customActivityName}
                onChange={(e) => setCustomActivityName(e.target.value)}
                placeholder="e.g., Custom Activity Name"
                style={{ marginTop: '8px' }}
              />
            )}
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
