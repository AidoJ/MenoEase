import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { symptomService } from '../../services/supabaseService'
import { getSymptomsMasterByCategory } from '../../services/masterDataService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { getTodayDate } from '../../utils/helpers'
import { supabase } from '../../config/supabase'
import './SymptomsTracker.css'

const SymptomsTracker = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [symptomsByCategory, setSymptomsByCategory] = useState({})
  const [selectedPhysical, setSelectedPhysical] = useState([])
  const [selectedEmotional, setSelectedEmotional] = useState([])
  const [severity, setSeverity] = useState(5)

  useEffect(() => {
    loadSymptomsMaster()
    loadTodaySymptoms()
  }, [])

  const loadSymptomsMaster = async () => {
    try {
      const { data, error } = await getSymptomsMasterByCategory()
      if (error) throw error
      setSymptomsByCategory(data || {})
    } catch (err) {
      console.error('Error loading symptoms master:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadTodaySymptoms = async () => {
    if (!user) return
    
    try {
      const today = getTodayDate()
      const { data, error } = await symptomService.getByDate(today, user.id)
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading symptoms:', error)
        return
      }
      
      if (data) {
        setSelectedPhysical(data.physical_symptoms || [])
        setSelectedEmotional(data.emotional_symptoms || [])
        setSeverity(data.severity || 5)
      }
    } catch (err) {
      console.error('Error loading symptoms:', err)
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
      const symptomData = {
        user_id: user.id,
        date: today,
        physical_symptoms: selectedPhysical,
        emotional_symptoms: selectedEmotional,
        severity: severity,
      }

      // Check if entry exists for today
      const { data: existing } = await symptomService.getByDate(today)
      
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('symptoms')
          .update(symptomData)
          .eq('id', existing.id)
        if (error) throw error
      } else {
        // Create new
        const result = await symptomService.create(symptomData)
        if (result.error) throw result.error
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to save symptoms')
      console.error('Error saving symptoms:', err)
    } finally {
      setSaving(false)
    }
  }

  const toggleSymptom = (symptomName, category) => {
    if (category === 'Vasomotor' || category === 'Musculoskeletal' || 
        category === 'Energy' || category === 'Sleep' || category === 'Cardiac' ||
        category === 'Urogenital' || category === 'Metabolic' || category === 'Digestive' ||
        category === 'Immune' || category === 'Cognitive') {
      // Physical symptoms
      setSelectedPhysical(prev =>
        prev.includes(symptomName)
          ? prev.filter(s => s !== symptomName)
          : [...prev, symptomName]
      )
    } else {
      // Emotional symptoms
      setSelectedEmotional(prev =>
        prev.includes(symptomName)
          ? prev.filter(s => s !== symptomName)
          : [...prev, symptomName]
      )
    }
  }

  const isSymptomSelected = (symptomName, category) => {
    if (category === 'Vasomotor' || category === 'Musculoskeletal' || 
        category === 'Energy' || category === 'Sleep' || category === 'Cardiac' ||
        category === 'Urogenital' || category === 'Metabolic' || category === 'Digestive' ||
        category === 'Immune' || category === 'Cognitive') {
      return selectedPhysical.includes(symptomName)
    }
    return selectedEmotional.includes(symptomName)
  }

  const getSymptomEmoji = (symptom) => {
    const emojiMap = {
      'Hot flashes': '🔥',
      'Night sweats': '💦',
      'Brain fog': '🌫️',
      'Anxiety': '😰',
      'Irritability': '😡',
      'Joint pain': '🦴',
      'Fatigue': '😴',
      'Sleep difficulty': '🌙',
      'Heart palpitations': '💗',
      'Vaginal dryness': '🌸',
      'Weight gain': '📈',
      'Bloating': '🎈',
      'Histamine reactions': '🤧',
    }
    return emojiMap[symptom] || '📋'
  }

  if (loading) {
    return (
      <div className="symptoms-tracker">
        <div className="page-title">Symptoms Tracker</div>
        <Card>
          <p>Loading...</p>
        </Card>
      </div>
    )
  }

  const physicalCategories = ['Vasomotor', 'Musculoskeletal', 'Energy', 'Sleep', 'Cardiac', 'Urogenital', 'Metabolic', 'Digestive', 'Immune', 'Cognitive']
  const emotionalCategories = ['Emotional']

  return (
    <div className="symptoms-tracker">
      <div className="page-title">Symptoms Tracker</div>

      <form onSubmit={handleSave}>
        <Card>
          <div className="card-title">Physical Symptoms</div>
          <div className="card-subtitle">Track what you're experiencing</div>

          <div className="checkbox-grid">
            {physicalCategories.map(category => 
              symptomsByCategory[category]?.map((symptom) => (
                <div
                  key={symptom.id}
                  className={`checkbox-item ${isSymptomSelected(symptom.symptom, category) ? 'checked' : ''}`}
                  onClick={() => toggleSymptom(symptom.symptom, category)}
                >
                  <span className="icon">{getSymptomEmoji(symptom.symptom)}</span>
                  <span className="text">{symptom.symptom}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="card-title">Emotional Symptoms</div>

          <div className="checkbox-grid">
            {emotionalCategories.map(category => 
              symptomsByCategory[category]?.map((symptom) => (
                <div
                  key={symptom.id}
                  className={`checkbox-item ${isSymptomSelected(symptom.symptom, category) ? 'checked' : ''}`}
                  onClick={() => toggleSymptom(symptom.symptom, category)}
                >
                  <span className="icon">{getSymptomEmoji(symptom.symptom)}</span>
                  <span className="text">{symptom.symptom}</span>
                </div>
              ))
            )}
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <div className="form-label">Overall Severity (1-10)</div>
            <input
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value))}
              className="severity-slider"
            />
            <div className="severity-display">
              <span className="severity-value">{severity}</span> / 10
            </div>
          </div>
        </Card>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Symptoms saved successfully! ✅</div>}

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Symptoms'}
        </Button>
      </form>
    </div>
  )
}

export default SymptomsTracker
