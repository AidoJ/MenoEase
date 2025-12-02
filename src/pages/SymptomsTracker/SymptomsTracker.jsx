import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { symptomService } from '../../services/supabaseService'
import { getSymptomsMasterByCategory } from '../../services/masterDataService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import DateNavigator from '../../components/DateNavigator/DateNavigator'
import { getTodayDate, formatDate } from '../../utils/helpers'
import { supabase } from '../../config/supabase'
import { format } from 'date-fns'
import './SymptomsTracker.css'

const SymptomsTracker = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || getTodayDate())
  const [recentDays, setRecentDays] = useState([])
  
  const [symptomsByCategory, setSymptomsByCategory] = useState({})
  const [selectedPhysical, setSelectedPhysical] = useState([])
  const [selectedEmotional, setSelectedEmotional] = useState([])
  const [severity, setSeverity] = useState(5)

  useEffect(() => {
    loadSymptomsMaster()
  }, [])

  useEffect(() => {
    loadTodaySymptoms()
    loadRecentDays()
  }, [selectedDate])

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
      const { data, error } = await symptomService.getByDate(selectedDate, user.id)
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading symptoms:', error)
        return
      }
      
      if (data) {
        setSelectedPhysical(data.physical_symptoms || [])
        setSelectedEmotional(data.emotional_symptoms || [])
        setSeverity(data.severity || 5)
      } else {
        setSelectedPhysical([])
        setSelectedEmotional([])
        setSeverity(5)
      }
    } catch (err) {
      console.error('Error loading symptoms:', err)
    }
  }

  const loadRecentDays = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('symptoms')
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
      const symptomData = {
        user_id: user.id,
        date: selectedDate,
        physical_symptoms: selectedPhysical,
        emotional_symptoms: selectedEmotional,
        severity: severity,
      }

      const { data: existing } = await symptomService.getByDate(selectedDate, user.id)
      
      if (existing) {
        const { error } = await supabase
          .from('symptoms')
          .update(symptomData)
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const result = await symptomService.create(symptomData)
        if (result.error) throw result.error
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      loadRecentDays()
    } catch (err) {
      setError(err.message || 'Failed to save symptoms')
      console.error('Error saving symptoms:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSelectHistoryDate = (date) => {
    setSelectedDate(date)
  }

  const toggleSymptom = (symptomName, category) => {
    if (category === 'Vasomotor' || category === 'Musculoskeletal' || 
        category === 'Energy' || category === 'Sleep' || category === 'Cardiac' ||
        category === 'Urogenital' || category === 'Metabolic' || category === 'Digestive' ||
        category === 'Immune' || category === 'Cognitive') {
      setSelectedPhysical(prev =>
        prev.includes(symptomName)
          ? prev.filter(s => s !== symptomName)
          : [...prev, symptomName]
      )
    } else {
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

      <DateNavigator 
        selectedDate={selectedDate}
        onChange={setSelectedDate}
        maxDate={getTodayDate()}
      />

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

      {recentDays.length > 0 && (
        <Card>
          <div className="card-title">Recent Symptom Days</div>
          <div className="card-subtitle">Last 7 days</div>
          <div className="symptoms-history">
            {recentDays.map((day) => (
              <div
                key={day.id}
                className="symptom-history-item"
                onClick={() => handleSelectHistoryDate(day.date)}
              >
                <div className="history-date">{formatDate(day.date)}</div>
                <div className="history-details">
                  <div className="history-severity">
                    Severity: <strong>{day.severity}/10</strong>
                  </div>
                  <div className="history-symptoms">
                    {(day.physical_symptoms || []).slice(0, 3).map((s, idx) => (
                      <span key={idx} className="symptom-badge">{getSymptomEmoji(s)} {s}</span>
                    ))}
                    {(day.physical_symptoms || []).length > 3 && (
                      <span className="symptom-more">+{day.physical_symptoms.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default SymptomsTracker
