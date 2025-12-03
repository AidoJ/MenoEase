import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { supabase } from '../../config/supabase'
import { getTodayDate, calculateSleepDuration, formatDate } from '../../utils/helpers'
import { format, subDays } from 'date-fns'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    sleep: '--',
    energy: '--',
    water: '--',
    meals: '0/0',
  })
  const [streak, setStreak] = useState(0)
  const [completion, setCompletion] = useState(0)
  const [recentHistory, setRecentHistory] = useState([])

  const quickActions = [
    { icon: '🌙', label: 'Sleep', path: '/sleep' },
    { icon: '🍽️', label: 'Food', path: '/food' },
    { icon: '📋', label: 'Symptoms', path: '/symptoms' },
    { icon: '💊', label: 'Medications', path: '/medications' },
    { icon: '🏃', label: 'Exercise', path: '/exercise' },
    { icon: '💆', label: 'Mood', path: '/mood' },
    { icon: '🌤️', label: 'Weather', path: '/mood' },
    { icon: '📝', label: 'Journal', path: '/journal' },
  ]

  useEffect(() => {
    if (user) {
      loadDashboardData()
      loadRecentHistory()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const today = getTodayDate()

      const [
        sleepData,
        moodData,
        foodData,
        exerciseData,
        medicationData,
      ] = await Promise.all([
        supabase.from('sleep_logs').select('*').eq('user_id', user.id).eq('date', today).single(),
        supabase.from('mood_logs').select('*').eq('user_id', user.id).eq('date', today).single(),
        supabase.from('food_logs').select('*').eq('user_id', user.id).eq('date', today),
        supabase.from('exercises').select('*').eq('user_id', user.id).eq('date', today),
        supabase.from('medication_logs').select('*').eq('user_id', user.id).eq('date', today),
      ])

      // Calculate sleep duration
      let sleepDisplay = '--'
      if (sleepData.data) {
        const bedtime = sleepData.data.bedtime
        const wakeTime = sleepData.data.wake_time
        
        // Handle both TIME and string formats
        const bedtimeStr = typeof bedtime === 'string' ? bedtime : (bedtime ? String(bedtime) : null)
        const wakeTimeStr = typeof wakeTime === 'string' ? wakeTime : (wakeTime ? String(wakeTime) : null)
        
        if (bedtimeStr && wakeTimeStr) {
          // Ensure time format is correct (HH:MM:SS or HH:MM)
          const bedFormatted = bedtimeStr.includes(':') ? bedtimeStr.split('.')[0] : bedtimeStr
          const wakeFormatted = wakeTimeStr.includes(':') ? wakeTimeStr.split('.')[0] : wakeTimeStr
          
          const duration = calculateSleepDuration(
            `2000-01-01T${bedFormatted.padEnd(8, ':00').substring(0, 8)}`,
            `2000-01-01T${wakeFormatted.padEnd(8, ':00').substring(0, 8)}`
          )
          if (duration && !isNaN(duration.hours) && !isNaN(duration.minutes) && duration.hours >= 0 && duration.minutes >= 0) {
            sleepDisplay = `${duration.hours}h ${duration.minutes}m`
          }
        }
      }

      // Get energy level (now 0-11 integer)
      let energyDisplay = '--'
      if (moodData.data && moodData.data.energy_level !== null && moodData.data.energy_level !== undefined) {
        const energyValue = moodData.data.energy_level
        const energyEmoji = energyValue <= 1 ? '😴' : 
                           energyValue <= 3 ? '😐' : 
                           energyValue <= 5 ? '😑' : 
                           energyValue <= 7 ? '🙂' : 
                           energyValue <= 9 ? '😊' : 
                           energyValue === 10 ? '⚡' : '🚀'
        energyDisplay = `${energyEmoji} ${energyValue}/11`
      }

      // Get hydration
      let waterDisplay = '--'
      if (moodData.data && moodData.data.hydration_liters) {
        waterDisplay = `${moodData.data.hydration_liters.toFixed(1)}L`
      }

      // Count meals
      const mealCount = foodData.data?.length || 0
      const mealsDisplay = `${mealCount}/3`

      setStats({
        sleep: sleepDisplay,
        energy: energyDisplay,
        water: waterDisplay,
        meals: mealsDisplay,
      })

      // Calculate streak
      const streakCount = await calculateStreak(user.id)
      setStreak(streakCount)

      // Calculate completion percentage
      const completed = [
        sleepData.data ? 1 : 0,
        moodData.data ? 1 : 0,
        mealCount > 0 ? 1 : 0,
        exerciseData.data && exerciseData.data.length > 0 ? 1 : 0,
        medicationData.data && medicationData.data.length > 0 ? 1 : 0,
      ].reduce((a, b) => a + b, 0)
      
      setCompletion(Math.round((completed / 5) * 100))
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentHistory = async () => {
    if (!user) return
    
    try {
      const today = getTodayDate()
      const last7Days = Array.from({ length: 7 }, (_, i) => 
        format(subDays(new Date(today), i), 'yyyy-MM-dd')
      )

      const [sleep, mood, food, exercise] = await Promise.all([
        supabase.from('sleep_logs').select('date, quality').eq('user_id', user.id).in('date', last7Days),
        supabase.from('mood_logs').select('date, energy_level').eq('user_id', user.id).in('date', last7Days),
        supabase.from('food_logs').select('date').eq('user_id', user.id).in('date', last7Days),
        supabase.from('exercises').select('date').eq('user_id', user.id).in('date', last7Days),
      ])

      const history = last7Days.map(date => {
        const hasSleep = sleep.data?.some(s => s.date === date)
        const hasMood = mood.data?.some(m => m.date === date)
        const hasFood = food.data?.some(f => f.date === date)
        const hasExercise = exercise.data?.some(e => e.date === date)
        
        return {
          date,
          hasSleep,
          hasMood,
          hasFood,
          hasExercise,
          energyLevel: mood.data?.find(m => m.date === date)?.energy_level,
        }
      })

      setRecentHistory(history)
    } catch (err) {
      console.error('Error loading recent history:', err)
    }
  }

  const calculateStreak = async (userId) => {
    try {
      const [sleep, mood, food, exercise, journal] = await Promise.all([
        supabase.from('sleep_logs').select('date').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('mood_logs').select('date').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('food_logs').select('date').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('exercises').select('date').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('journal_entries').select('date').eq('user_id', userId).order('date', { ascending: false }),
      ])

      const allDates = new Set()
      ;[sleep, mood, food, exercise, journal].forEach(result => {
        if (result.data) {
          result.data.forEach(item => allDates.add(item.date))
        }
      })

      const sortedDates = Array.from(allDates).sort((a, b) => b.localeCompare(a))
      
      let streak = 0
      const today = getTodayDate()
      let currentDate = new Date(today)
      
      for (let i = 0; i < sortedDates.length; i++) {
        const dateStr = getTodayDate(currentDate)
        if (sortedDates.includes(dateStr)) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else {
          break
        }
      }

      return streak
    } catch (err) {
      console.error('Error calculating streak:', err)
      return 0
    }
  }

  const handleCardClick = (type) => {
    const today = getTodayDate()
    switch(type) {
      case 'sleep':
        navigate(`/sleep?date=${today}`)
        break
      case 'energy':
      case 'water':
        navigate(`/mood?date=${today}`)
        break
      case 'meals':
        navigate(`/food?date=${today}`)
        break
      default:
        break
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <Card>
          <p>Loading dashboard...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <Card>
        <div className="card-header">
          <div>
            <div className="card-title">Today's Overview</div>
            <div className="card-subtitle">Your daily health snapshot</div>
          </div>
        </div>
        <div className="stats-grid">
          <div 
            className="stat-card clickable"
            onClick={() => handleCardClick('sleep')}
            title="Click to view sleep log"
          >
            <span className="stat-value">{stats.sleep}</span>
            <span className="stat-label">Sleep</span>
          </div>
          <div 
            className="stat-card teal clickable"
            onClick={() => handleCardClick('energy')}
            title="Click to view mood & energy"
          >
            <span className="stat-value">{stats.energy}</span>
            <span className="stat-label">Energy</span>
          </div>
          <div 
            className="stat-card teal clickable"
            onClick={() => handleCardClick('water')}
            title="Click to view mood & wellness"
          >
            <span className="stat-value">{stats.water}</span>
            <span className="stat-label">Water</span>
          </div>
          <div 
            className="stat-card clickable"
            onClick={() => handleCardClick('meals')}
            title="Click to view food log"
          >
            <span className="stat-value">{stats.meals}</span>
            <span className="stat-label">Meals</span>
          </div>
        </div>

        {recentHistory.length > 0 && (
          <div className="history-sparkline">
            <div className="sparkline-label">Last 7 Days</div>
            <div className="sparkline-dots">
              {recentHistory.reverse().map((day, idx) => {
                const isToday = day.date === getTodayDate()
                const hasData = day.hasSleep || day.hasMood || day.hasFood || day.hasExercise
                return (
                  <div
                    key={idx}
                    className={`sparkline-dot ${hasData ? 'has-data' : ''} ${isToday ? 'today' : ''}`}
                    title={formatDate(day.date)}
                  />
                )
              })}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="card-header">
          <div>
            <div className="card-title">Quick Log</div>
            <div className="card-subtitle">Track your day</div>
          </div>
        </div>
        <div className="quick-grid">
          {quickActions.map((action) => (
            <div
              key={action.path}
              className="quick-btn"
              onClick={() => navigate(action.path)}
            >
              <div className="icon">{action.icon}</div>
              <div className="label">{action.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="card-header">
          <div className="card-title">Tracking Streak</div>
        </div>
        <p style={{ fontSize: '14px', marginBottom: '10px' }}>
          You've logged data for <strong>{streak} {streak === 1 ? 'day' : 'days'}</strong> in a row! {streak > 0 && '🎉'}
        </p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${completion}%` }}></div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
          {completion}% of daily goals completed
        </p>
      </Card>
    </div>
  )
}

export default Dashboard
