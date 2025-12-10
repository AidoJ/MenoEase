import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './AdminLayout.css'

const AdminLayout = () => {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleBackToApp = () => {
    navigate('/')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>🔧 Admin Panel</h2>
          <p>MenoEase</p>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
            👥 Users
          </NavLink>
          <NavLink to="/admin/subscriptions" className={({ isActive }) => isActive ? 'active' : ''}>
            💳 Subscriptions
          </NavLink>
          <NavLink to="/admin/tiers" className={({ isActive }) => isActive ? 'active' : ''}>
            🎯 Subscription Tiers
          </NavLink>
          <NavLink to="/admin/master-data" className={({ isActive }) => isActive ? 'active' : ''}>
            📚 Master Data
          </NavLink>
        </nav>

        <div className="admin-actions">
          <button onClick={handleBackToApp} className="btn-secondary">
            ← Back to App
          </button>
          <button onClick={handleSignOut} className="btn-danger">
            Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
