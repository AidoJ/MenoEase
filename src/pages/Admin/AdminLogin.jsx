import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import './AdminLogin.css'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('Admin login attempt:', { email })

    try {
      // Step 1: Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }

      console.log('Auth successful, checking admin role...')

      // Step 2: Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, first_name')
        .eq('user_id', authData.user.id)
        .single()

      console.log('Profile check:', { profile, profileError })

      if (profileError) {
        console.error('Profile error:', profileError)
        await supabase.auth.signOut()
        throw new Error('Unable to verify admin access')
      }

      if (profile.role !== 'admin') {
        console.log('User is not admin, denying access')
        await supabase.auth.signOut()
        throw new Error('Access denied. Admin credentials required.')
      }

      console.log('Admin access granted, navigating to dashboard...')

      // Step 3: Navigate to admin dashboard
      navigate('/admin', { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Invalid admin credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <Card>
          <div className="admin-login-header">
            <h1>🔐 Admin Access</h1>
            <p>MenoEase Administration Panel</p>
          </div>

          {error && (
            <div className="error-message" style={{
              padding: '12px',
              background: '#fee',
              color: '#c33',
              borderRadius: '6px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </Button>
          </form>

          <div style={{
            marginTop: '24px',
            padding: '12px',
            background: '#f3f4f6',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            <strong>⚠️ Admin Access Only</strong><br />
            Unauthorized access attempts are logged.
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminLogin
