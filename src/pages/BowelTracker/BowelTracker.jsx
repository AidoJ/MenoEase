import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import DateNavigator from '../../components/DateNavigator/DateNavigator'
import { getTodayDate, formatDate } from '../../utils/helpers'
import './BowelTracker.css'

const BowelTracker = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || getTodayDate())
  const [recentDays, setRecentDays] = useState([])

  const [wentToday, setWentToday] = useState(true)
  const [stoolForm, setStoolForm] = useState('Smooth & Formed')
  const [frequency, setFrequency] = useState('Once')
  const [easeLevel, setEaseLevel] = useState('Effortless')
  const [urgency, setUrgency] = useState('Normal urge')
  const [completeness, setCompleteness] = useState('Felt complete')
  const [discomfort, setDiscomfort] = useState([])
  const [color, setColor] = useState('Brown (normal)')
  const [otherVisual, setOtherVisual] = useState([])
  const [smellIntensity, setSmellIntensity] = useState('Normal')
  const [timing, setTiming] = useState('Morning')
  const [notes, setNotes] = useState('')
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadTodayLog()
    loadRecentDays()
  }, [selectedDate])

  const loadTodayLog = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bowel_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading bowel log:', error)
        return
      }

      if (data) {
        setWentToday(data.went_today !== false)
        setStoolForm(data.stool_form || 'Smooth & Formed')
        setFrequency(data.frequency || 'Once')
        setEaseLevel(data.ease_level || 'Effortless')
        setUrgency(data.urgency || 'Normal urge')
        setCompleteness(data.completeness || 'Felt complete')
        setDiscomfort(data.discomfort || [])
        setColor(data.color || 'Brown (normal)')
        setOtherVisual(data.other_visual || [])
        setSmellIntensity(data.smell_intensity || 'Normal')
        setTiming(data.timing || 'Morning')
        setNotes(data.notes || '')
      } else {
        // Reset form
        setWentToday(true)
        setStoolForm('Smooth & Formed')
        setFrequency('Once')
        setEaseLevel('Effortless')
        setUrgency('Normal urge')
        setCompleteness('Felt complete')
        setDiscomfort([])
        setColor('Brown (normal)')
        setOtherVisual([])
        setSmellIntensity('Normal')
        setTiming('Morning')
        setNotes('')
      }
    } catch (err) {
      console.error('Error loading bowel log:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentDays = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('bowel_logs')
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
      const logData = {
        user_id: user.id,
        date: selectedDate,
        went_today: wentToday,
        stool_form: wentToday ? stoolForm : null,
        frequency: wentToday ? frequency : null,
        ease_level: wentToday ? easeLevel : null,
        urgency: wentToday ? urgency : null,
        completeness: wentToday ? completeness : null,
        discomfort: wentToday ? discomfort : [],
        color: wentToday ? color : null,
        other_visual: wentToday ? otherVisual : [],
        smell_intensity: wentToday ? smellIntensity : null,
        timing: wentToday ? timing : null,
        notes: notes || null,
      }

      // Check if entry exists
      const { data: existing } = await supabase
        .from('bowel_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate)
        .single()

      if (existing) {
        const { error } = await supabase
          .from('bowel_logs')
          .update(logData)
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('bowel_logs')
          .insert([logData])
        if (error) throw error
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      loadRecentDays()
    } catch (err) {
      setError(err.message || 'Failed to save bowel log')
      console.error('Error saving bowel log:', err)
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

  const stoolFormOptions = [
    { value: 'Hard / Pebbly', emoji: '🟤', label: 'Hard / Pebbly', subtitle: 'constipation' },
    { value: 'Firm & Lumpy', emoji: '🟤', label: 'Firm & Lumpy', subtitle: '' },
    { value: 'Smooth & Formed', emoji: '🟤', label: 'Smooth & Formed', subtitle: 'ideal', highlight: true },
    { value: 'Soft', emoji: '🟤', label: 'Soft', subtitle: '' },
    { value: 'Loose / Mushy', emoji: '💧', label: 'Loose / Mushy', subtitle: '' },
    { value: 'Watery / Diarrhea', emoji: '💧', label: 'Watery / Diarrhea', subtitle: '' },
  ]

  const frequencyOptions = [
    { value: 'Did not go', emoji: '❌', label: 'Did not go' },
    { value: 'Less than usual', emoji: '⏱️', label: 'Less than usual' },
    { value: 'Once', emoji: '✅', label: 'Once' },
    { value: '2-3 times', emoji: '✅', label: '2-3 times' },
    { value: 'More than usual', emoji: '🔁', label: 'More than usual' },
  ]

  const easeLevelOptions = [
    { value: 'Effortless', emoji: '😌', label: 'Effortless' },
    { value: 'Mild effort', emoji: '😐', label: 'Mild effort' },
    { value: 'Straining', emoji: '😖', label: 'Straining' },
    { value: 'Painful', emoji: '⚠️', label: 'Painful' },
  ]

  const urgencyOptions = [
    { value: 'No urgency', emoji: '🧘', label: 'No urgency' },
    { value: 'Normal urge', emoji: '🚶', label: 'Normal urge' },
    { value: 'Sudden / urgent', emoji: '🚨', label: 'Sudden / urgent' },
    { value: 'Barely made it', emoji: '🏃', label: 'Barely made it' },
  ]

  const completenessOptions = [
    { value: 'Felt complete', emoji: '✅', label: 'Felt complete' },
    { value: 'Some left', emoji: '➖', label: 'Some left' },
    { value: 'Incomplete / unsatisfying', emoji: '❌', label: 'Incomplete / unsatisfying' },
  ]

  const discomfortOptions = [
    { value: 'Bloating', emoji: '🎈', label: 'Bloating' },
    { value: 'Gas', emoji: '💨', label: 'Gas' },
    { value: 'Burning', emoji: '🔥', label: 'Burning' },
    { value: 'Cramping', emoji: '🤕', label: 'Cramping' },
    { value: 'Nausea', emoji: '😵', label: 'Nausea' },
    { value: 'None', emoji: '👍', label: 'None' },
  ]

  const colorOptions = [
    'Brown (normal)',
    'Light / pale',
    'Dark',
    'Green',
    'Yellow',
    'Black',
    'Red',
  ]

  const otherVisualOptions = [
    { value: 'Mucus present', label: 'Mucus present' },
    { value: 'Undigested food', label: 'Undigested food' },
    { value: 'Oily / floating', label: 'Oily / floating' },
  ]

  const smellOptions = ['Mild', 'Normal', 'Strong', 'Extremely foul']

  const timingOptions = ['Morning', 'Afternoon', 'Evening', 'Night']

  if (loading) {
    return (
      <div className="bowel-tracker">
        <div className="page-title">Bowel Movement Tracker</div>
        <Card>
          <p>Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="bowel-tracker">
      <div className="page-title">Bowel Movement Tracker</div>

      <DateNavigator
        selectedDate={selectedDate}
        onChange={setSelectedDate}
        maxDate={getTodayDate()}
      />

      <form onSubmit={handleSave}>
        <Card>
          <div className="card-title">Daily Check-In</div>
          <div className="card-subtitle">Did you have a bowel movement today?</div>

          <div className="went-today-toggle">
            <button
              type="button"
              className={`toggle-option ${wentToday ? 'active' : ''}`}
              onClick={() => setWentToday(true)}
            >
              ✅ Yes
            </button>
            <button
              type="button"
              className={`toggle-option ${!wentToday ? 'active' : ''}`}
              onClick={() => setWentToday(false)}
            >
              ❌ No
            </button>
          </div>
        </Card>

        {wentToday && (
          <>
            <Card>
              <div className="card-title">Stool Form</div>
              <div className="card-subtitle">Bristol Stool Scale</div>
              <div className="radio-grid">
                {stoolFormOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`radio-item ${stoolForm === option.value ? 'selected' : ''} ${option.highlight ? 'highlight' : ''}`}
                    onClick={() => setStoolForm(option.value)}
                  >
                    <span className="icon">{option.emoji}</span>
                    <div className="label-group">
                      <span className="text">{option.label}</span>
                      {option.subtitle && <span className="subtitle">{option.subtitle}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="card-title">Frequency</div>
              <div className="card-subtitle">How many times today?</div>
              <div className="radio-grid">
                {frequencyOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`radio-item ${frequency === option.value ? 'selected' : ''}`}
                    onClick={() => setFrequency(option.value)}
                  >
                    <span className="icon">{option.emoji}</span>
                    <span className="text">{option.label}</span>
                  </div>
                ))}
              </div>
              <div className="info-tip">
                💡 Changes can reflect hormone shifts, stress, magnesium intake, or gut inflammation.
              </div>
            </Card>

            <Card>
              <div className="card-title">Ease & Urgency</div>

              <div className="form-group">
                <div className="form-label">How easy was it?</div>
                <div className="radio-grid">
                  {easeLevelOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`radio-item ${easeLevel === option.value ? 'selected' : ''}`}
                      onClick={() => setEaseLevel(option.value)}
                    >
                      <span className="icon">{option.emoji}</span>
                      <span className="text">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <div className="form-label">Urgency level</div>
                <div className="radio-grid">
                  {urgencyOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`radio-item ${urgency === option.value ? 'selected' : ''}`}
                      onClick={() => setUrgency(option.value)}
                    >
                      <span className="icon">{option.emoji}</span>
                      <span className="text">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="card-title">Completeness</div>
              <div className="card-subtitle">How did it feel afterward?</div>
              <div className="radio-grid">
                {completenessOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`radio-item ${completeness === option.value ? 'selected' : ''}`}
                    onClick={() => setCompleteness(option.value)}
                  >
                    <span className="icon">{option.emoji}</span>
                    <span className="text">{option.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="card-title">Discomfort & Sensations</div>
              <div className="card-subtitle">Select all that apply</div>
              <div className="checkbox-grid">
                {discomfortOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`checkbox-item ${discomfort.includes(option.value) ? 'checked' : ''}`}
                    onClick={() => toggleArrayItem(option.value, discomfort, setDiscomfort)}
                  >
                    <span className="icon">{option.emoji}</span>
                    <span className="text">{option.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* More Details - Expandable */}
            <Card>
              <button
                type="button"
                className="expand-toggle"
                onClick={() => setShowDetails(!showDetails)}
              >
                <span>{showDetails ? '▼' : '▶'} More Details (Optional)</span>
              </button>

              {showDetails && (
                <>
                  <div className="form-group">
                    <div className="form-label">Color</div>
                    <select
                      className="form-select"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    >
                      {colorOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <div className="form-label">Other Visual Changes</div>
                    <div className="checkbox-grid">
                      {otherVisualOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`checkbox-item ${otherVisual.includes(option.value) ? 'checked' : ''}`}
                          onClick={() => toggleArrayItem(option.value, otherVisual, setOtherVisual)}
                        >
                          <span className="text">{option.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-label">Smell Intensity</div>
                    <div className="radio-grid">
                      {smellOptions.map((smell) => (
                        <div
                          key={smell}
                          className={`radio-item ${smellIntensity === smell ? 'selected' : ''}`}
                          onClick={() => setSmellIntensity(smell)}
                        >
                          <span className="text">{smell}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-label">Timing</div>
                    <div className="radio-grid">
                      {timingOptions.map((t) => (
                        <div
                          key={t}
                          className={`radio-item ${timing === t ? 'selected' : ''}`}
                          onClick={() => setTiming(t)}
                        >
                          <span className="text">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </>
        )}

        <Card>
          <div className="form-group">
            <div className="form-label">Notes & Comments</div>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional observations, triggers, or patterns you noticed..."
              rows="3"
            />
          </div>
        </Card>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Bowel log saved successfully! ✅</div>}

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Bowel Log'}
        </Button>
      </form>

      {recentDays.length > 0 && (
        <Card>
          <div className="card-title">Recent Days</div>
          <div className="card-subtitle">Last 7 days</div>
          <div className="history-list">
            {recentDays.map((day) => (
              <div
                key={day.id}
                className="history-item"
                onClick={() => setSelectedDate(day.date)}
              >
                <div className="history-date">{formatDate(day.date)}</div>
                <div className="history-details">
                  {day.went_today ? (
                    <>
                      <span>{day.stool_form}</span>
                      <span className="separator">•</span>
                      <span>{day.frequency}</span>
                    </>
                  ) : (
                    <span>Did not go</span>
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

export default BowelTracker
