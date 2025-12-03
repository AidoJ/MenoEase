import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import './Header.css'

const Header = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="header">
      <div className="header-content">
        <div>
          <h1>MenopEase</h1>
          <div className="subtitle">{today}</div>
        </div>
        {user && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
    </header>
  )
}

export default Header

