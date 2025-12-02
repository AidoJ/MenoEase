import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { moodService } from '../../services/supabaseService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { getTodayDate } from '../../utils/helpers'
import { supabase } from '../../config/supabase'
import './MoodWellness.css'

const MoodWellness = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [energyLevel, setEnergyLevel] = useState('ok')
  const [mentalClarity, setMentalClarity] = useState([])
  const [emotionalState, setEmotionalState] = useState([])
  const [stressManagement, setStressManagement] = useState([])
  const [tensionZones, setTensionZones] = useState([])
  const [hydration, setHydration] = useState(1.8)
  const [caffeine, setCaffeine] = useState(false)
  const [alcohol, setAlcohol] = useState(false)
  const [weatherSymptoms, setWeatherSymptoms] = useState([])
  const [weatherNotes, setWeatherNotes] = useState('')

  useEffect(() => {
    loadTodayMood()
  }, [])

  const loadTodayMood = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const today = getTodayDate()
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading mood log:', error)
        return
      }
      
      if (data) {
        setEnergyLevel(data.energy_level || 'ok')
        setMentalClarity(data.mental_clarity || [])
        setEmotionalState(data.emotional_state || [])
        setStressManagement(data.stress_management || [])
        setTensionZones(data.tension_zones || [])
        setHydration(parseFloat(data.hydration_liters) || 1.8)
        setCaffeine(data.caffeine || false)
        setAlcohol(data.alcohol || false)
        if (data.weather_impact) {
          setWeatherSymptoms(data.weather_impact.symptoms || [])
          setWeatherNotes(data.weather_impact.notes || '')
        }
      }
    } catch (err) {
      console.error('Error loading mood log:', err)
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
      const moodData = {
        user_id: user.id,
        date: today,
        energy_level: energyLevel,
        mental_clarity: mentalClarity,
        emotional_state: emotionalState,
        stress_management: stressManagement,
        tension_zones: tensionZones,
        hydration_liters: hydration,
        caffeine: caffeine,
        alcohol: alcohol,
        weather_impact: {
          symptoms: weatherSymptoms,
          notes: weatherNotes,
        },
      }

      // Check if entry exists
      const { data: existing } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()
      
      if (existing) {
        const { error } = await supabase
          .from('mood_logs')
          .update(moodData)
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const result = await moodService.create(moodData)
        if (result.error) throw result.error
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to save wellness log')
      console.error('Error saving mood log:', err)
    } finally {
      setSaving(false)
    }
  }

  const toggleArrayItem = (item, array, setter) => {
    setter(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  const energyOptions = [
    { value: 'crashed', emoji: '😴', label: 'Crashed' },
    { value: 'low', emoji: '😐', label: 'Low' },
    { value: 'ok', emoji: '🙂', label: 'OK' },
    { value: 'energised', emoji: '⚡', label: 'Energised' },
  ]

  const mentalClarityOptions = [
    { value: 'Clear', emoji: '✨', label: 'Clear' },
    { value: 'Foggy', emoji: '🌫️', label: 'Foggy' },
  ]

  const emotionalStateOptions = [
    { value: 'Calm', emoji: '😌', label: 'Calm' },
    { value: 'Frazzled', emoji: '😰', label: 'Frazzled' },
    { value: 'Connected', emoji: '🤗', label: 'Connected' },
    { value: 'Withdrawn', emoji: '😔', label: 'Withdrawn' },
    { value: 'Steady', emoji: '💪', label: 'Steady' },
    { value: 'Overwhelmed', emoji: '😣', label: 'Overwhelmed' },
  ]

  const stressManagementOptions = [
    { value: 'Meditation', emoji: '🧘', label: 'Meditation' },
    { value: 'Breathwork', emoji: '🫁', label: 'Breathwork' },
  ]

  const tensionZonesOptions = [
    { value: 'Shoulders', emoji: '💆', label: 'Shoulders' },
    { value: 'Jaw', emoji: '😬', label: 'Jaw' },
    { value: 'Chest', emoji: '🫀', label: 'Chest' },
    { value: 'Head', emoji: '🧠', label: 'Head' },
  ]

  const weatherSymptomOptions = [
    { value: 'Heat Sensitivity', emoji: '🔥', label: 'Heat Sensitivity' },
    { value: 'Pressure Headache', emoji: '🤕', label: 'Pressure Headache' },
    { value: 'Joint Stiffness', emoji: '🦴', label: 'Joint Stiffness' },
    { value: 'Weather Anxiety', emoji: '😰', label: 'Weather Anxiety' },
  ]

  const incrementWater = () => {
    setHydration(prev => Math.min(prev + 0.2, 10))
  }

  const decrementWater = () => {
    setHydration(prev => Math.max(prev - 0.2, 0.2))
  }

  if (loading) {
    return (
      <div className="mood-wellness">
        <div className="page-title">Mood & Wellness</div>
        <Card>
          <p>Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="mood-wellness">
      <div className="page-title">Mood & Wellness</div>

      <form onSubmit={handleSave}>
        <Card>
          <div className="card-title">Energy Level</div>
          <div className="selection-grid">
            {energyOptions.map((option) => (
              <div
                key={option.value}
                className={`selection-btn ${energyLevel === option.value ? 'selected' : ''}`}
                onClick={() => setEnergyLevel(option.value)}
              >
                <span className="emoji">{option.emoji}</span>
                <span className="label">{option.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="card-title">Mental Clarity</div>
          <div className="checkbox-grid">
            {mentalClarityOptions.map((option) => (
              <div
                key={option.value}
                className={`checkbox-item ${mentalClarity.includes(option.value) ? 'checked' : ''}`}
                onClick={() => toggleArrayItem(option.value, mentalClarity, setMentalClarity)}
              >
                <span className="icon">{option.emoji}</span>
                <span className="text">{option.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="card-title">Emotional State</div>
          <div className="card-subtitle">Select all that apply</div>
          <div className="checkbox-grid">
            {emotionalStateOptions.map((option) => (
              <div
                key={option.value}
                className={`checkbox-item ${emotionalState.includes(option.value) ? 'checked' : ''}`}
                onClick={() => toggleArrayItem(option.value, emotionalState, setEmotionalState)}
              >
                <span className="icon">{option.emoji}</span>
                <span className="text">{option.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="card-title">Stress Management</div>
          <div className="checkbox-grid">
            {stressManagementOptions.map((option) => (
              <div
                key={option.value}
                className={`checkbox-item ${stressManagement.includes(option.value) ? 'checked' : ''}`}
                onClick={() => toggleArrayItem(option.value, stressManagement, setStressManagement)}
              >
                <span className="icon">{option.emoji}</span>
                <span className="text">{option.label}</span>
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <div className="form-label">Tension Zones</div>
            <div className="checkbox-grid">
              {tensionZonesOptions.map((option) => (
                <div
                  key={option.value}
                  className={`checkbox-item ${tensionZones.includes(option.value) ? 'checked' : ''}`}
                  onClick={() => toggleArrayItem(option.value, tensionZones, setTensionZones)}
                >
                  <span className="icon">{option.emoji}</span>
                  <span className="text">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="card-title">Hydration</div>
          <div className="card-subtitle">Track water, caffeine & alcohol</div>

          <div className="water-counter">
            <button
              type="button"
              className="water-btn"
              onClick={decrementWater}
            >
              −
            </button>
            <div className="water-display">{hydration.toFixed(1)}L</div>
            <button
              type="button"
              className="water-btn"
              onClick={incrementWater}
            >
              +
            </button>
          </div>

          <div className="checkbox-grid">
            <div
              className={`checkbox-item ${caffeine ? 'checked' : ''}`}
              onClick={() => setCaffeine(!caffeine)}
            >
              <span className="icon">☕</span>
              <span className="text">Caffeine Today</span>
            </div>
            <div
              className={`checkbox-item ${alcohol ? 'checked' : ''}`}
              onClick={() => setAlcohol(!alcohol)}
            >
              <span className="icon">🍷</span>
              <span className="text">Alcohol Today</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="card-title">Weather Impact</div>
          <div className="card-subtitle">How is today's weather affecting you?</div>

          <div className="form-group">
            <div className="form-label">Weather-Related Symptoms</div>
            <div className="checkbox-grid">
              {weatherSymptomOptions.map((option) => (
                <div
                  key={option.value}
                  className={`checkbox-item ${weatherSymptoms.includes(option.value) ? 'checked' : ''}`}
                  onClick={() => toggleArrayItem(option.value, weatherSymptoms, setWeatherSymptoms)}
                >
                  <span className="icon">{option.emoji}</span>
                  <span className="text">{option.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <div className="form-label">Notes</div>
            <textarea
              className="form-textarea"
              value={weatherNotes}
              onChange={(e) => setWeatherNotes(e.target.value)}
              placeholder="How is the weather affecting your symptoms today?"
            />
          </div>
        </Card>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Wellness log saved successfully! ✅</div>}

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Wellness Log'}
        </Button>
      </form>
    </div>
  )
}

export default MoodWellness
