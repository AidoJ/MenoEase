import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    subscription_tier: '',
    subscription_status: ''
  })

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

  const handleEditUser = (user) => {
    setEditingUser(user.user_id)
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role: user.role || 'user',
      subscription_tier: user.subscription_tier || 'free',
      subscription_status: user.subscription_status || 'active'
    })
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({
      first_name: '',
      last_name: '',
      email: '',
      role: '',
      subscription_tier: '',
      subscription_status: ''
    })
  }

  const handleSaveUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: editForm.first_name.trim(),
          last_name: editForm.last_name.trim(),
          email: editForm.email.trim(),
          role: editForm.role,
          subscription_tier: editForm.subscription_tier,
          subscription_status: editForm.subscription_status
        })
        .eq('user_id', userId)

      if (error) throw error

      alert('User updated successfully')
      loadUsers()
      handleCancelEdit()
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user: ' + error.message)
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
                    {editingUser === user.user_id ? (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <input
                          type="text"
                          value={editForm.first_name}
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                          placeholder="First name"
                          style={{
                            width: '80px',
                            padding: '0.25rem 0.5rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                          }}
                        />
                        <input
                          type="text"
                          value={editForm.last_name}
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                          placeholder="Last name"
                          style={{
                            width: '80px',
                            padding: '0.25rem 0.5rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                          }}
                        />
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {user.first_name} {user.last_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {user.role === 'admin' && '👑 Admin'}
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingUser === user.user_id ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="Email"
                        style={{
                          width: '180px',
                          padding: '0.25rem 0.5rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                        }}
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editingUser === user.user_id ? (
                      <select
                        value={editForm.subscription_tier}
                        onChange={(e) => setEditForm({ ...editForm, subscription_tier: e.target.value })}
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
                      <span className={`badge ${user.subscription_tier}`}>
                        {user.subscription_tier}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingUser === user.user_id ? (
                      <select
                        value={editForm.subscription_status}
                        onChange={(e) => setEditForm({ ...editForm, subscription_status: e.target.value })}
                        style={{
                          padding: '0.25rem 0.5rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                      </select>
                    ) : (
                      <span className={`badge ${user.subscription_status}`}>
                        {user.subscription_status}
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                      {user.stripe_customer_id ? `${user.stripe_customer_id.substring(0, 12)}...` : '-'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    {editingUser === user.user_id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          style={{
                            padding: '0.25rem 0.5rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            width: '100%',
                            marginBottom: '0.25rem',
                          }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleSaveUser(user.user_id)}
                          style={{ flex: 1, minWidth: '60px' }}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={handleCancelEdit}
                          style={{ flex: 1, minWidth: '60px' }}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleResetPassword(user.user_id, user.email)}
                          title="Reset Password"
                          style={{ width: '100%' }}
                        >
                          🔑 Reset Password
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleResetPassword(user.user_id, user.email)}
                          title="Reset Password"
                        >
                          🔑
                        </button>
                      </div>
                    )}
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
