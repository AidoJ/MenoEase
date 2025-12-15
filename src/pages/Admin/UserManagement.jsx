import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    console.log('UserManagement: Loading users...')
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('UserManagement: Query result:', {
        userCount: data?.length,
        error,
        users: data?.map(u => ({ email: u.email, role: u.role }))
      })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('UserManagement: Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTier = async (userId, newTier) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ subscription_tier: newTier })
        .eq('user_id', userId)

      if (error) throw error

      alert('User tier updated successfully')
      loadUsers()
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating tier:', error)
      alert('Failed to update user tier')
    }
  }

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ subscription_status: newStatus })
        .eq('user_id', userId)

      if (error) throw error

      alert('User status updated successfully')
      loadUsers()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update user status')
    }
  }

  const handleResetPassword = async (userId, userEmail) => {
    const newPassword = prompt(`Enter new password for ${userEmail}:`)
    if (!newPassword) return

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    try {
      // Call Netlify function to reset password
      const response = await fetch('/.netlify/functions/admin-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password')
      }

      alert('Password reset successfully')
    } catch (error) {
      console.error('Error resetting password:', error)
      alert(error.message || 'Failed to reset password')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTier = filterTier === 'all' || user.subscription_tier === filterTier

    return matchesSearch && matchesTier
  })

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>User Management</h1>
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>User Management</h1>
        <p>Manage all users and their subscriptions</p>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.5rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          />
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="professional">Professional</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Tier</th>
                <th>Status</th>
                <th>Stripe ID</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {user.first_name} {user.last_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {user.role === 'admin' && '👑 Admin'}
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    {editingUser === user.user_id ? (
                      <select
                        defaultValue={user.subscription_tier}
                        onBlur={(e) => handleUpdateTier(user.user_id, e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                        }}
                      >
                        <option value="free">Free</option>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="professional">Professional</option>
                      </select>
                    ) : (
                      <span
                        className={`badge ${user.subscription_tier}`}
                        onClick={() => setEditingUser(user.user_id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {user.subscription_tier}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${user.subscription_status}`}>
                      {user.subscription_status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                      {user.stripe_customer_id ? `${user.stripe_customer_id.substring(0, 12)}...` : '-'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setEditingUser(user.user_id === editingUser ? null : user.user_id)}
                      >
                        {editingUser === user.user_id ? 'Cancel' : 'Edit'}
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleResetPassword(user.user_id, user.email)}
                        title="Reset Password"
                      >
                        🔑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>
  )
}

export default UserManagement
