import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import SleepLog from './pages/SleepLog/SleepLog'
import FoodLog from './pages/FoodLog/FoodLog'
import SymptomsTracker from './pages/SymptomsTracker/SymptomsTracker'
import Medications from './pages/Medications/Medications'
import Exercise from './pages/Exercise/Exercise'
import MoodWellness from './pages/MoodWellness/MoodWellness'
import Journal from './pages/Journal/Journal'
import Insights from './pages/Insights/Insights'
import Track from './pages/Track/Track'
import Profile from './pages/Profile/Profile'
import CommunicationPreferences from './pages/Settings/CommunicationPreferences'
import Reminders from './pages/Reminders/Reminders'
import SubscriptionPlans from './pages/Subscription/SubscriptionPlans'
import ManageSubscription from './pages/Subscription/ManageSubscription'
import Checkout from './pages/Subscription/Checkout'
import Success from './pages/Subscription/Success'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import AdminRoute from './components/Auth/AdminRoute'
import AdminLayout from './components/Layout/AdminLayout'
import AdminLogin from './pages/Admin/AdminLogin'
import AdminDashboard from './pages/Admin/AdminDashboard'
import UserManagement from './pages/Admin/UserManagement'
import SubscriptionManagement from './pages/Admin/SubscriptionManagement'
import TierManagement from './pages/Admin/TierManagement'
import MasterDataManagement from './pages/Admin/MasterDataManagement'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="subscriptions" element={<SubscriptionManagement />} />
              <Route path="tiers" element={<TierManagement />} />
              <Route path="master-data" element={<MasterDataManagement />} />
            </Route>

            {/* User Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="sleep" element={<SleepLog />} />
              <Route path="food" element={<FoodLog />} />
              <Route path="symptoms" element={<SymptomsTracker />} />
              <Route path="medications" element={<Medications />} />
              <Route path="exercise" element={<Exercise />} />
              <Route path="mood" element={<MoodWellness />} />
              <Route path="track" element={<Track />} />
              <Route path="journal" element={<Journal />} />
              <Route path="insights" element={<Insights />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings/communication" element={<CommunicationPreferences />} />
              <Route path="reminders" element={<Reminders />} />
              <Route path="subscription/plans" element={<SubscriptionPlans />} />
              <Route path="subscription/checkout" element={<Checkout />} />
              <Route path="subscription/success" element={<Success />} />
              <Route path="subscription/manage" element={<ManageSubscription />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

