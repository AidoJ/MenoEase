import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/UI/Button'
import Card from '../../components/UI/Card'
import './Auth.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Login attempt starting...', { email })
      const { data, error } = await signIn(email, password)
      
      console.log('Login response:', { data, error })
      
      if (error) {
        console.error('Login error object:', {
          message: error.message,
          status: error.status,
          name: error.name,
          fullError: JSON.stringify(error, null, 2)
        })
        throw error
      }
      
      if (data?.user) {
        console.log('Login successful, navigating to dashboard')
        navigate('/')
      } else {
        console.warn('No user in response:', data)
        setError('Login failed - no user data received')
      }
    } catch (error) {
      console.error('Login catch block:', error)
      // Provide more helpful error messages
      let errorMessage = error.message || 'Failed to sign in'
      
      // Log full error for debugging
      console.error('Full error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        error: error
      })
      
      if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('invalid_grant')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.'
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in.'
      } else if (errorMessage.includes('Email rate limit')) {
        errorMessage = 'Too many attempts. Please try again later.'
      } else if (errorMessage.includes('422')) {
        errorMessage = `Authentication error (422). Please check: 1) User exists in Supabase, 2) Email is confirmed, 3) Credentials are correct. Error: ${errorMessage}`
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <Card>
        <div className="auth-header">
          <h1>MenoEase</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Login

