import { supabase } from '../config/supabase'

// Sleep Logs
export const sleepService = {
  async create(data) {
    const { data: result, error } = await supabase
      .from('sleep_logs')
      .insert([data])
      .select()
      .single()
    return { data: result, error }
  },

  async getByDate(date, userId = null) {
    let query = supabase
      .from('sleep_logs')
      .select('*')
      .eq('date', date)
    if (userId) {
      query = query.eq('user_id', userId)
    }
    const { data, error } = await query.single()
    return { data, error }
  },

  async getAll(userId) {
    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    return { data, error }
  },
}

// Food Logs
export const foodService = {
  async create(data) {
    const { data: result, error } = await supabase
      .from('food_logs')
      .insert([data])
      .select()
      .single()
    return { data: result, error }
  },

  async getByDate(date, userId = null) {
    let query = supabase
      .from('food_logs')
      .select('*')
      .eq('date', date)
    if (userId) {
      query = query.eq('user_id', userId)
    }
    const { data, error } = await query
    return { data, error }
  },
}

// Symptoms
export const symptomService = {
  async create(data) {
    const { data: result, error } = await supabase
      .from('symptoms')
      .insert([data])
      .select()
      .single()
    return { data: result, error }
  },

  async getByDate(date, userId = null) {
    let query = supabase
      .from('symptoms')
      .select('*')
      .eq('date', date)
    if (userId) {
      query = query.eq('user_id', userId)
    }
    const { data, error } = await query.single()
    return { data, error }
  },
}

// Medications
export const medicationService = {
  async create(data) {
    const { data: result, error } = await supabase
      .from('medications')
      .insert([data])
      .select()
      .single()
    return { data: result, error }
  },

  async getAll(userId) {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async logDose(medicationId, data) {
    const { data: result, error } = await supabase
      .from('medication_logs')
      .insert([{ medication_id: medicationId, ...data }])
      .select()
      .single()
    return { data: result, error }
  },
}

// Exercise
export const exerciseService = {
  async create(data) {
    const { data: result, error } = await supabase
      .from('exercises')
      .insert([data])
      .select()
      .single()
    return { data: result, error }
  },
}

// Mood & Wellness
export const moodService = {
  async create(data) {
    const { data: result, error } = await supabase
      .from('mood_logs')
      .insert([data])
      .select()
      .single()
    return { data: result, error }
  },
}

// Journal
export const journalService = {
  async create(data) {
    const { data: result, error } = await supabase
      .from('journal_entries')
      .insert([data])
      .select()
      .single()
    return { data: result, error }
  },

  async getByDate(date, userId = null) {
    let query = supabase
      .from('journal_entries')
      .select('*')
      .eq('date', date)
    if (userId) {
      query = query.eq('user_id', userId)
    }
    const { data, error } = await query.single()
    return { data, error }
  },

  async getAll(userId) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    return { data, error }
  },
}

// Weather
export const weatherService = {
  async create(data) {
    const { data: result, error } = await supabase
      .from('weather_data')
      .insert([data])
      .select()
      .single()
    return { data: result, error }
  },

  async getByDate(date) {
    const { data, error } = await supabase
      .from('weather_data')
      .select('*')
      .eq('date', date)
      .single()
    return { data, error }
  },
}

