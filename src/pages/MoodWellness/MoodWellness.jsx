import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { moodService } from '../../services/supabaseService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import DateNavigator from '../../components/DateNavigator/DateNavigator'
import EnergyInput from '../../components/EnergyInput/EnergyInput'
import { getTodayDate, formatDate } from '../../utils/helpers'
import { supabase } from '../../config/supabase'
import { format } from 'date-fns'
import './MoodWellness.css'

const MoodWellness = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || getTodayDate())
  const [recentDays, setRecentDays] = useState([])
  
  const [energyLevel, setEnergyLevel] = useState(5) // Default to 5 (Flat / Below Average)
  const [mentalClarity, setMentalClarity] = useState([])
  const [emotionalState, setEmotionalState] = useState([])
  const [stressManagement, setStressManagement] = useState([])
  const [tensionZones, setTensionZones] = useState([])
  const [hydration, setHydration] = useState(1.8)
  const [caffeine, setCaffeine] = useState(false)
  const [alcohol, setAlcohol] = useState(false)
  const [weatherSymptoms, setWeatherSymptoms] = useState([])
  const [weatherNotes, setWeatherNotes] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadTodayMood()
    loadRecentDays()
  }, [selectedDate])

  const loadTodayMood = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading mood log:', error)
        return
      }
      
      if (data) {
        setEnergyLevel(data.energy_level !== null && data.energy_level !== undefined ? data.energy_level : 5)
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
        setNotes(data.notes || '')
      } else {
        // Reset form if no data
        setEnergyLevel(5)
        setMentalClarity([])
        setEmotionalState([])
        setStressManagement([])
        setTensionZones([])
        setHydration(1.8)
        setCaffeine(false)
        setAlcohol(false)
        setWeatherSymptoms([])
        setWeatherNotes('')
        setNotes('')
      }
    } catch (err) {
      console.error('Error loading mood log:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentDays = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7)
      
      if (error) throw error
      
      const recent = (data || [])
        .filter(entry => entry.date !== selectedDate)
        .slice(0, 7)
      
      setRecentDays(recent)
    } catch (err) {
      console.error('Error loading recent days:', err)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const moodData = {
        user_id: user.id,
        date: selectedDate,
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
        notes: notes || null,
      }

      // Check if entry exists
      const { data: existing } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate)
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
      loadRecentDays()
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

  const mentalClarityOptions = [
    { value: 'Clear', emoji: '✨', label: 'Clear' },
    { value: 'Foggy', emoji: '🌫️', label: 'Foggy' },
  ]

  const emotionalStateOptions = [
    { value: 'Calm', emoji: '😌', label: 'Calm' },
    { value: 'Anxious', emoji: '😟', label: 'Anxious' },
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

  const getEnergyEmoji = (level) => {
    if (level <= 1) return '😴'
    if (level <= 3) return '😐'
    if (level <= 5) return '😑'
    if (level <= 7) return '🙂'
    if (level <= 9) return '😊'
    if (level === 10) return '⚡'
    return '🚀'
  }

  return (
    <div className="mood-wellness">
      <div className="page-title">Mood & Wellness</div>

      <DateNavigator 
        selectedDate={selectedDate}
        onChange={setSelectedDate}
        maxDate={getTodayDate()}
      />

      <form onSubmit={handleSave}>
        <Card>
          <div className="card-title">Energy Level</div>
          <div className="card-subtitle">Select your energy level (0-11)</div>
          <EnergyInput
            value={energyLevel}
            onChange={setEnergyLevel}
            showDescription={true}
          />
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

        <Card>
          <div className="form-group">
            <div className="form-label">Notes & Comments</div>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about your mood and wellness: why energy changed, what helped, lifestyle changes, etc."
              rows="3"
            />
          </div>
        </Card>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Wellness log saved successfully! ✅</div>}

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Wellness Log'}
        </Button>
      </form>

      {recentDays.length > 0 && (
        <Card>
          <div className="card-title">Recent Wellness Days</div>
          <div className="card-subtitle">Last 7 days</div>
          <div className="wellness-history">
            {recentDays.map((day) => (
              <div
                key={day.id}
                className="wellness-history-item"
                onClick={() => setSelectedDate(day.date)}
              >
                <div className="history-date">{formatDate(day.date)}</div>
                <div className="history-details">
                  <div className="history-energy">
                    {getEnergyEmoji(day.energy_level)} Energy: {day.energy_level}/11
                  </div>
                  <div className="history-hydration">
                    💧 {day.hydration_liters?.toFixed(1)}L
                  </div>
                  {day.emotional_state && day.emotional_state.length > 0 && (
                    <div className="history-emotions">
                      {day.emotional_state.slice(0, 2).join(', ')}
                    </div>
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

export default MoodWellness
