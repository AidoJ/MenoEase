import { supabase } from '../config/supabase'

// User Profiles
export const userService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  async createProfile(profileData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select()
      .single()
    return { data, error }
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    return { data, error }
  },

  async getSubscriptionTier(userId) {
    const { data, error } = await this.getProfile(userId)
    if (error) return { tier: 'free', error }
    
    const tierCode = data?.subscription_tier || 'free'
    
    // Get tier details
    const { data: tierData, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('tier_code', tierCode)
      .single()
    
    return { 
      tier: tierData || { tier_code: 'free', tier_name: 'Free' }, 
      profile: data,
      error: tierError 
    }
  },

  async getAllTiers() {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('price_monthly', { ascending: true })
    return { data, error }
  },

  async updateSubscription(userId, tierCode, startDate, endDate = null) {
    const updates = {
      subscription_tier: tierCode,
      subscription_status: 'active',
      subscription_start_date: startDate,
    }
    
    if (endDate) {
      updates.subscription_end_date = endDate
    }
    
    return await this.updateProfile(userId, updates)
  },
}

// Reminders
export const reminderService = {
  async getReminders(userId) {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('time', { ascending: true })
    return { data, error }
  },

  async createReminder(reminderData) {
    const { data, error } = await supabase
      .from('reminders')
      .insert([reminderData])
      .select()
      .single()
    return { data, error }
  },

  async updateReminder(reminderId, updates) {
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', reminderId)
      .select()
      .single()
    return { data, error }
  },

  async deleteReminder(reminderId) {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId)
    return { error }
  },

  async getReminderLogs(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('reminder_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('sent_at', startDate)
      .lte('sent_at', endDate)
      .order('sent_at', { ascending: false })
    return { data, error }
  },
}

