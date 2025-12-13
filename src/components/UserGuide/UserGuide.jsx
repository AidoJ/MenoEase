import React, { useState } from 'react'
import './UserGuide.css'

const UserGuide = ({ isOpen, onClose }) => {
  const [openSections, setOpenSections] = useState([0]) // First section open by default
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const toggleSection = (index) => {
    if (openSections.includes(index)) {
      setOpenSections(openSections.filter(i => i !== index))
    } else {
      setOpenSections([...openSections, index])
    }
  }

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('dontShowUserGuide', 'true')
    }
    onClose()
  }

  if (!isOpen) return null

  const sections = [
    {
      title: 'Step 1: Complete Your Profile',
      icon: '⚙️',
      content: (
        <div>
          <p>First things first! Set up your profile for the best experience:</p>
          <ol>
            <li><strong>Tap the Settings icon</strong> (⚙️) in the top right corner</li>
            <li><strong>Fill in your details</strong>:
              <ul>
                <li>First Name (appears in your welcome message)</li>
                <li>Email address</li>
                <li>Phone number (for SMS reminders - Premium/Ultimate)</li>
                <li><strong>Timezone</strong> - Important! Ensures reminders fire at the right time</li>
              </ul>
            </li>
            <li><strong>Communication Preferences</strong>:
              <ul>
                <li>Enable/disable email notifications</li>
                <li>Enable/disable SMS notifications (Premium/Ultimate)</li>
              </ul>
            </li>
            <li><strong>Save your profile</strong></li>
          </ol>
        </div>
      )
    },
    {
      title: 'Step 2: Take Your First Daily Snapshot',
      icon: '📸',
      content: (
        <div>
          <p>On your <strong>Dashboard</strong>, you'll see <strong>Quick Log</strong> with these buttons:</p>

          <h3>Track Your Basics (2-3 minutes):</h3>
          <div className="guide-button-grid">
            <div className="guide-button-item">
              <span className="emoji">🌙</span>
              <span className="label">Sleep</span>
            </div>
            <div className="guide-button-item">
              <span className="emoji">😊</span>
              <span className="label">Energy/Mood</span>
            </div>
            <div className="guide-button-item">
              <span className="emoji">💧</span>
              <span className="label">Water</span>
            </div>
          </div>

          <ol>
            <li><strong>🌙 Sleep</strong> - How did you sleep last night?
              <ul>
                <li>Enter bedtime and wake time</li>
                <li>Rate sleep quality (Awful → Great)</li>
                <li>Note any night sweats</li>
                <li>Add sleep disturbances if any</li>
              </ul>
            </li>
            <li><strong>😊 Energy/Mood</strong> - How are you feeling?
              <ul>
                <li>Select your energy level (1-10)</li>
                <li>Choose your mood</li>
                <li>Track mental clarity (Clear/Foggy)</li>
                <li>Note emotional state</li>
              </ul>
            </li>
            <li><strong>💧 Water</strong> - Stay hydrated!
              <ul>
                <li>Use the + and - buttons to track water intake</li>
                <li>Aim for 1.8-2.5L per day</li>
              </ul>
            </li>
          </ol>

          <h3>Add More Details (optional, 3-5 minutes):</h3>
          <div className="guide-button-grid">
            <div className="guide-button-item">
              <span className="emoji">🍽️</span>
              <span className="label">Food</span>
            </div>
            <div className="guide-button-item">
              <span className="emoji">💊</span>
              <span className="label">Meds</span>
            </div>
            <div className="guide-button-item">
              <span className="emoji">🏃</span>
              <span className="label">Exercise</span>
            </div>
            <div className="guide-button-item">
              <span className="emoji">🌤️</span>
              <span className="label">Weather</span>
            </div>
            <div className="guide-button-item">
              <span className="emoji">📝</span>
              <span className="label">Journal</span>
            </div>
            <div className="guide-button-item">
              <span className="emoji">✨</span>
              <span className="label">Just for today</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Step 3: Build Your Tracking Habit',
      icon: '🔥',
      content: (
        <div>
          <div className="guide-callout">
            <div className="guide-callout-title">📊 The 4-Week Rule</div>
            <p>Track consistently for at least <strong>4 weeks</strong> to unlock meaningful AI insights. This allows MenoEase to identify patterns in:</p>
            <ul>
              <li>Food triggers for hot flashes</li>
              <li>Sleep quality vs. energy levels</li>
              <li>Exercise impact on mood</li>
              <li>Weather effects on symptoms</li>
              <li>Medication effectiveness</li>
            </ul>
          </div>

          <h3>Make It Easy:</h3>
          <div className="guide-tips">
            <ul>
              <li><strong>Set a daily reminder</strong> (Premium/Ultimate)
                <ul>
                  <li>Profile → Manage Reminders</li>
                  <li>Choose your preferred time</li>
                  <li>Get SMS or email reminders</li>
                </ul>
              </li>
              <li><strong>Track at the same time each day</strong>
                <ul>
                  <li>Morning: Log yesterday's sleep + today's mood</li>
                  <li>Evening: Log food, exercise, symptoms</li>
                </ul>
              </li>
              <li><strong>Don't aim for perfection</strong>
                <ul>
                  <li>Even partial tracking helps</li>
                  <li>"Good enough" beats skipping entirely</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'Step 4: Review Your Progress',
      icon: '📈',
      content: (
        <div>
          <h3>On Your Dashboard:</h3>
          <ul>
            <li><strong>Today's Overview</strong> - See your daily snapshot at a glance</li>
            <li><strong>7-Day History</strong> - Dots below show your tracking consistency
              <ul>
                <li>Click any dot to view that day's data</li>
              </ul>
            </li>
            <li><strong>Tracking Streak</strong> - How many consecutive days you've tracked</li>
            <li><strong>Date Navigator</strong> - Swipe to view past days</li>
          </ul>

          <h3>View Insights (Premium/Ultimate):</h3>
          <ul>
            <li>Tap <strong>Insights</strong> in the navigation</li>
            <li>After 4+ weeks, see AI-powered patterns:
              <ul>
                <li>Hot flash triggers</li>
                <li>Sleep correlations</li>
                <li>Energy patterns</li>
                <li>Weather impact</li>
                <li>Weekly symptom summaries</li>
              </ul>
            </li>
            <li>Export PDF reports for your doctor</li>
          </ul>
        </div>
      )
    },
    {
      title: 'Step 5: Customize Your Experience',
      icon: '🎯',
      content: (
        <div>
          <h3>Set Up Reminders (Premium/Ultimate):</h3>
          <ol>
            <li><strong>Profile → Manage Reminders</strong></li>
            <li><strong>Add Reminder</strong>:
              <ul>
                <li>Choose type (Daily, Medication, Custom)</li>
                <li>Set time</li>
                <li>Select days of week</li>
                <li>Choose notification method (Email/SMS)</li>
              </ul>
            </li>
            <li><strong>Save</strong></li>
          </ol>

          <h3>Manage Your Subscription:</h3>
          <ul>
            <li><strong>Free</strong>: Basic tracking + 7-day history</li>
            <li><strong>Premium</strong> ($4.99/mo): Insights + 5 reminders + 90-day history</li>
            <li><strong>Ultimate</strong> ($9.99/mo): Everything + unlimited reminders + full history + advanced reports</li>
          </ul>
          <p><strong>Upgrade anytime</strong>: Profile → Manage Subscription</p>
        </div>
      )
    },
    {
      title: 'Quick Tips for Success',
      icon: '💡',
      content: (
        <div>
          <div className="guide-tips">
            <ul>
              <li>Track even "normal" days - Pattern detection needs full data</li>
              <li>Be specific in notes - "Mild headache after cheese" is better than "headache"</li>
              <li>Use the Journal daily - Your observations are valuable</li>
              <li>Review your 7-day dots - Spot your tracking consistency</li>
              <li>Check your streak - Build momentum!</li>
              <li>Share reports with your doctor - Better conversations, better care</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'Navigation Quick Reference',
      icon: '🧭',
      content: (
        <div>
          <h3>Top Icons:</h3>
          <ul>
            <li><strong>📖 Help</strong> - Opens this guide anytime</li>
            <li><strong>⚙️ Settings</strong> - Your profile and preferences</li>
          </ul>

          <h3>Bottom Navigation:</h3>
          <ul>
            <li><strong>🏠 Dashboard</strong> - Your daily home base</li>
            <li><strong>📋 Track</strong> - Quick symptom logging</li>
            <li><strong>💆 Wellness</strong> - Mood, energy, hydration</li>
            <li><strong>💡 Insights</strong> - AI-powered patterns</li>
          </ul>

          <h3>Quick Log Buttons:</h3>
          <ul>
            <li>Direct access to all tracking features</li>
            <li>Fastest way to log your day</li>
          </ul>
        </div>
      )
    },
    {
      title: 'You\'re All Set!',
      icon: '🎉',
      content: (
        <div>
          <h3>Your First Week Checklist:</h3>
          <ul className="guide-checklist">
            <li>Complete your profile</li>
            <li>Set your timezone</li>
            <li>Log your first sleep entry</li>
            <li>Track today's mood and energy</li>
            <li>Log at least one meal</li>
            <li>Write a journal entry</li>
            <li>Set up a daily reminder (Premium/Ultimate)</li>
            <li>Check out your JFT card</li>
            <li>Track for 7 consecutive days</li>
          </ul>

          <div className="guide-callout">
            <div className="guide-callout-title">Remember</div>
            <p>Small daily actions lead to big insights. Your future self will thank you! 💪</p>
          </div>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '16px', fontWeight: '600' }}>
            Ready to start tracking? Close this guide and tap any Quick Log button to begin!
          </p>
        </div>
      )
    }
  ]

  return (
    <div className="user-guide-overlay">
      <div className="user-guide-modal">
        <div className="user-guide-header">
          <h2>📖 MenoEase Quick User Guide</h2>
          <button className="user-guide-close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="user-guide-content">
          <div className="user-guide-intro">
            <p>
              MenoEase helps you understand your menopause journey by tracking symptoms,
              identifying patterns, and providing personalized insights.
            </p>
          </div>

          {sections.map((section, index) => (
            <div key={index} className="guide-section">
              <div
                className={`guide-section-header ${openSections.includes(index) ? 'active' : ''}`}
                onClick={() => toggleSection(index)}
              >
                <h3 className="guide-section-title">
                  {section.icon} {section.title}
                </h3>
                <span className={`guide-section-icon ${openSections.includes(index) ? 'open' : ''}`}>
                  ▶
                </span>
              </div>
              <div className={`guide-section-content ${openSections.includes(index) ? 'open' : ''}`}>
                <div className="guide-section-body">
                  {section.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="user-guide-footer">
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="dontShowAgain" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              Don't show this again
            </label>
          </div>
          <p>Need help? Email: support@menoease.com</p>
        </div>
      </div>
    </div>
  )
}

export default UserGuide
