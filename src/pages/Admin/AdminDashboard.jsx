import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    newUsersThisMonth: 0,
  })
  const [tierDistribution, setTierDistribution] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Get active subscriptions count
      const { count: activeSubscriptions } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active')
        .neq('subscription_tier', 'free')

      // Get tier distribution
      const { data: tiers } = await supabase
        .from('user_profiles')
        .select('subscription_tier')

      const distribution = tiers?.reduce((acc, { subscription_tier }) => {
        acc[subscription_tier] = (acc[subscription_tier] || 0) + 1
        return acc
      }, {})

      const tierArray = Object.entries(distribution || {}).map(([tier, count]) => ({
        tier,
        count,
      }))

      // Get new users this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count: newUsersThisMonth } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())

      // Get recent users
      const { data: recent } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      // Calculate monthly revenue (simplified - assumes all subscriptions are monthly)
      const { data: subscriptions } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('subscription_status', 'active')
        .neq('subscription_tier', 'free')

      const { data: tierPrices } = await supabase
        .from('subscription_tiers')
        .select('tier_code, price_monthly')

      const priceMap = tierPrices?.reduce((acc, { tier_code, price_monthly }) => {
        acc[tier_code] = price_monthly
        return acc
      }, {})

      const revenue = subscriptions?.reduce((sum, { subscription_tier }) => {
        return sum + (priceMap?.[subscription_tier] || 0)
      }, 0)

      setStats({
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        monthlyRevenue: revenue || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
      })

      setTierDistribution(tierArray)
      setRecentUsers(recent || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Dashboard</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Dashboard</h1>
        <p>Overview of your MenoEase application</p>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="value">{stats.totalUsers}</div>
          <div className="change positive">
            +{stats.newUsersThisMonth} this month
          </div>
        </div>

        <div className="stat-card">
          <h3>Active Subscriptions</h3>
          <div className="value">{stats.activeSubscriptions}</div>
          <div className="change">
            {((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}% conversion
          </div>
        </div>

        <div className="stat-card">
          <h3>Monthly Recurring Revenue</h3>
          <div className="value">${stats.monthlyRevenue.toFixed(2)}</div>
          <div className="change">
            ${(stats.monthlyRevenue / (stats.activeSubscriptions || 1)).toFixed(2)} ARPU
          </div>
        </div>

        <div className="stat-card">
          <h3>New Users (This Month)</h3>
          <div className="value">{stats.newUsersThisMonth}</div>
          <div className="change">
            {stats.totalUsers > 0
              ? ((stats.newUsersThisMonth / stats.totalUsers) * 100).toFixed(1)
              : 0}% of total
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2>Subscription Tier Distribution</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tier</th>
              <th>Users</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {tierDistribution.map(({ tier, count }) => (
              <tr key={tier}>
                <td>
                  <span className={`badge ${tier}`}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </span>
                </td>
                <td>{count}</td>
                <td>{((count / stats.totalUsers) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <h2>Recent Users</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user) => (
              <tr key={user.user_id}>
                <td>
                  {user.first_name} {user.last_name}
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.subscription_tier}`}>
                    {user.subscription_tier}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.subscription_status}`}>
                    {user.subscription_status}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDashboard
