import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { journalService } from '../../services/supabaseService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { getTodayDate, formatDate } from '../../utils/helpers'
import { supabase } from '../../config/supabase'
import './Journal.css'

const Journal = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [content, setContent] = useState('')
  const [moodSummary, setMoodSummary] = useState('Overall Good Day')
  const [recentEntries, setRecentEntries] = useState([])

  useEffect(() => {
    loadTodayJournal()
    loadRecentEntries()
  }, [])

  const loadTodayJournal = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const today = getTodayDate()
      const { data, error } = await journalService.getByDate(today)
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading journal:', error)
        return
      }
      
      if (data) {
        setContent(data.content || '')
        setMoodSummary(data.mood_summary || 'Overall Good Day')
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
      
      // Get last 7 entries (excluding today)
      const today = getTodayDate()
      const recent = (data || [])
        .filter(entry => entry.date !== today)
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
      const today = getTodayDate()
      const journalData = {
        user_id: user.id,
        date: today,
        content: content.trim(),
        mood_summary: moodSummary,
      }

      // Check if entry exists
      const { data: existing } = await journalService.getByDate(today)
      
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

      <Card>
        <div className="card-title">{formatDate(new Date())}</div>
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

      <Card>
        <div className="card-title">Recent Entries</div>
        <div className="card-subtitle">Your last 7 days</div>

        <div className="recent-entries">
          {recentEntries.length === 0 ? (
            <div className="empty-state">No previous entries yet. Start writing to see your history here!</div>
          ) : (
            recentEntries.map((entry) => (
              <div key={entry.id} className="entry-preview">
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
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

export default Journal
