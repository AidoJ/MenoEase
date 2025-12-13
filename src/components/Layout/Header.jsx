import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import UserGuide from '../UserGuide/UserGuide'
import './Header.css'

const Header = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const today = format(new Date(), 'EEEE, MMMM d, yyyy')
  const [showGuide, setShowGuide] = useState(false)

  // Show guide on every login unless user opted out
  useEffect(() => {
    if (user) {
      const dontShowGuide = localStorage.getItem('dontShowUserGuide')
      if (!dontShowGuide) {
        // Show guide on login
        setShowGuide(true)
      }
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
  }

  const handleGuideClose = () => {
    setShowGuide(false)
    // Set flag so JFT card can show after guide closes
    localStorage.setItem('guideClosedOnce', 'true')
    // Dispatch custom event to notify Dashboard
    window.dispatchEvent(new Event('guideClosedEvent'))
  }

  return (
    <header className="header">
      <div className="header-content">
        <div>
          <h1>MenoEase</h1>
          <div className="subtitle">{today}</div>
        </div>
        {user && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="help-btn"
              onClick={() => setShowGuide(true)}
              title="User Guide & Help"
            >
              ?
            </button>
            <button
              className="profile-btn"
              onClick={() => navigate('/profile')}
              title="Profile & Settings"
            >
              ⚙️
            </button>
            <button className="sign-out-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        )}
      </div>

      <UserGuide isOpen={showGuide} onClose={handleGuideClose} />
    </header>
  )
}

export default Header

