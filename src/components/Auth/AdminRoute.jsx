import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

const AdminRoute = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        console.log('AdminRoute: No user logged in')
        setLoading(false)
        return
      }

      console.log('AdminRoute: Checking admin status for user:', user.id)

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role, email')
          .eq('user_id', user.id)
          .single()

        console.log('AdminRoute: Query result:', { data, error })

        if (error) {
          console.error('AdminRoute: Error checking admin status:', error)
          console.error('AdminRoute: Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          })
          setIsAdmin(false)
        } else {
          const adminStatus = data?.role === 'admin'
          console.log('AdminRoute: User role:', data?.role, '| Is admin?', adminStatus)
          setIsAdmin(adminStatus)
        }
      } catch (err) {
        console.error('AdminRoute: Exception:', err)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      checkAdminStatus()
    }
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="spinner"></div>
        <p>Verifying admin access...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default AdminRoute
