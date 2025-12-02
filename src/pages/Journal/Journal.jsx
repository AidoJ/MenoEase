import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { journalService } from '../../services/supabaseService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import DateNavigator from '../../components/DateNavigator/DateNavigator'
import { getTodayDate, formatDate } from '../../utils/helpers'
import { supabase } from '../../config/supabase'
import { format } from 'date-fns'
import './Journal.css'

const Journal = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || getTodayDate())
  const [recentEntries, setRecentEntries] = useState([])
  
  const [content, setContent] = useState('')
  const [moodSummary, setMoodSummary] = useState('Overall Good Day')

  useEffect(() => {
    loadJournalEntry()
    loadRecentEntries()
  }, [selectedDate])

  const loadJournalEntry = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await journalService.getByDate(selectedDate, user.id)
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading journal:', error)
        return
      }
      
      if (data) {
        setContent(data.content || '')
        setMoodSummary(data.mood_summary || 'Overall Good Day')
      } else {
        setContent('')
        setMoodSummary('Overall Good Day')
      }
    } catch (err) {
      console.error('Error loading journal:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentEntries = async () => {
    if (!user) return
    
    try {
      const { data, error } = await journalService.getAll(user.id)
      if (error) throw error
      
      const recent = (data || [])
        .filter(entry => entry.date !== selectedDate)
        .slice(0, 7)
      setRecentEntries(recent)
    } catch (err) {
      console.error('Error loading recent entries:', err)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return

    if (!content.trim()) {
      setError('Please enter some content for your journal entry')
      return
    }

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const journalData = {
        user_id: user.id,
        date: selectedDate,
        content: content.trim(),
        mood_summary: moodSummary,
      }

      const { data: existing } = await journalService.getByDate(selectedDate)
      
      if (existing) {
        const { error } = await supabase
          .from('journal_entries')
          .update(journalData)
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const result = await journalService.create(journalData)
        if (result.error) throw result.error
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      loadRecentEntries()
    } catch (err) {
      setError(err.message || 'Failed to save journal entry')
      console.error('Error saving journal:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSelectHistoryDate = (date) => {
    setSelectedDate(date)
  }

  const moodSummaryOptions = [
    'Overall Good Day',
    'Challenging Day',
    'Mixed Day',
    'Great Day',
  ]

  if (loading) {
    return (
      <div className="journal">
        <div className="page-title">Daily Journal</div>
        <Card>
          <p>Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="journal">
      <div className="page-title">Daily Journal</div>

      <DateNavigator 
        selectedDate={selectedDate}
        onChange={setSelectedDate}
        maxDate={getTodayDate()}
      />

      <Card>
        <div className="card-title">{formatDate(selectedDate)}</div>
        <div className="card-subtitle">Capture your thoughts, patterns & insights</div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <div className="form-label">Today's Entry</div>
            <textarea
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="How are you feeling today? Notice any patterns or triggers? Any insights about your symptoms, food, mood, or activities?"
              style={{ minHeight: '200px' }}
            />
          </div>

          <div className="form-group">
            <div className="form-label">Mood Summary</div>
            <select
              className="form-select"
              value={moodSummary}
              onChange={(e) => setMoodSummary(e.target.value)}
            >
              {moodSummaryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Journal entry saved successfully! ✅</div>}

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Journal Entry'}
          </Button>
        </form>
      </Card>

      {recentEntries.length > 0 && (
        <Card>
          <div className="card-title">Recent Entries</div>
          <div className="card-subtitle">Your last 7 days</div>

          <div className="recent-entries">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="entry-preview"
                onClick={() => handleSelectHistoryDate(entry.date)}
              >
                <div className="entry-header">
                  <div className="entry-date">{formatDate(entry.date)}</div>
                  <div className="entry-mood">{entry.mood_summary}</div>
                </div>
                <div className="entry-content">
                  {entry.content.length > 100
                    ? `${entry.content.substring(0, 100)}...`
                    : entry.content}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default Journal
