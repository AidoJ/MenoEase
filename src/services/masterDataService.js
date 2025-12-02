import { supabase } from '../config/supabase'

// Fetch all medications from master table
export const getMedicationsMaster = async () => {
  const { data, error } = await supabase
    .from('medications_master')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching medications master:', error)
    return { data: [], error }
  }
  
  return { data, error: null }
}

// Fetch all vitamins/supplements from master table
export const getVitaminsMaster = async () => {
  const { data, error } = await supabase
    .from('vitamins_master')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching vitamins master:', error)
    return { data: [], error }
  }
  
  return { data, error: null }
}

// Fetch all symptoms from master table
export const getSymptomsMaster = async () => {
  const { data, error } = await supabase
    .from('symptoms_master')
    .select('*')
    .order('category', { ascending: true })
    .order('symptom', { ascending: true })
  
  if (error) {
    console.error('Error fetching symptoms master:', error)
    return { data: [], error }
  }
  
  return { data, error: null }
}

// Fetch symptoms grouped by category
export const getSymptomsMasterByCategory = async () => {
  const { data, error } = await supabase
    .from('symptoms_master')
    .select('*')
    .order('category', { ascending: true })
    .order('symptom', { ascending: true })
  
  if (error) {
    console.error('Error fetching symptoms master:', error)
    return { data: {}, error }
  }
  
  // Group by category
  const grouped = data.reduce((acc, symptom) => {
    const category = symptom.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(symptom)
    return acc
  }, {})
  
  return { data: grouped, error: null }
}

// Fetch all exercises from master table
export const getExercisesMaster = async () => {
  const { data, error } = await supabase
    .from('exercises_master')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching exercises master:', error)
    return { data: [], error }
  }
  
  return { data, error: null }
}

// Fetch all therapies from master table
export const getTherapiesMaster = async () => {
  const { data, error } = await supabase
    .from('therapies_master')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching therapies master:', error)
    return { data: [], error }
  }
  
  return { data, error: null }
}

// Fetch all food items
export const getFoodItems = async (searchTerm = '') => {
  let query = supabase
    .from('food_items')
    .select('*')
    .order('name', { ascending: true })
  
  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching food items:', error)
    return { data: [], error }
  }
  
  return { data, error: null }
}

// Fetch energy levels
export const getEnergyLevels = async () => {
  const { data, error } = await supabase
    .from('energy_levels')
    .select('*')
    .order('value', { ascending: true })
  
  if (error) {
    console.error('Error fetching energy levels:', error)
    return { data: [], error }
  }
  
  return { data, error: null }
}

// Fetch mood levels
export const getMoodLevels = async () => {
  const { data, error } = await supabase
    .from('mood_levels')
    .select('*')
    .order('value', { ascending: true })
  
  if (error) {
    console.error('Error fetching mood levels:', error)
    return { data: [], error }
  }
  
  return { data, error: null }
}

// Admin functions - Add to master tables
export const addToMedicationsMaster = async (medication) => {
  const { data, error } = await supabase
    .from('medications_master')
    .insert([medication])
    .select()
    .single()
  
  return { data, error }
}

export const addToSymptomsMaster = async (symptom) => {
  const { data, error } = await supabase
    .from('symptoms_master')
    .insert([symptom])
    .select()
    .single()
  
  return { data, error }
}

export const addToExercisesMaster = async (exercise) => {
  const { data, error } = await supabase
    .from('exercises_master')
    .insert([exercise])
    .select()
    .single()
  
  return { data, error }
}

export const addToVitaminsMaster = async (vitamin) => {
  const { data, error } = await supabase
    .from('vitamins_master')
    .insert([vitamin])
    .select()
    .single()
  
  return { data, error }
}

export const addToTherapiesMaster = async (therapy) => {
  const { data, error } = await supabase
    .from('therapies_master')
    .insert([therapy])
    .select()
    .single()
  
  return { data, error }
}

export const addToFoodItems = async (food) => {
  const { data, error } = await supabase
    .from('food_items')
    .insert([food])
    .select()
    .single()
  
  return { data, error }
}

// Admin functions - Update master tables
export const updateMedicationsMaster = async (id, updates) => {
  const { data, error } = await supabase
    .from('medications_master')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export const updateSymptomsMaster = async (id, updates) => {
  const { data, error } = await supabase
    .from('symptoms_master')
    .update(updates)
    .select()
    .single()
  
  return { data, error }
}

// Admin functions - Delete from master tables
export const deleteFromMedicationsMaster = async (id) => {
  const { error } = await supabase
    .from('medications_master')
    .delete()
    .eq('id', id)
  
  return { error }
}

export const deleteFromSymptomsMaster = async (id) => {
  const { error } = await supabase
    .from('symptoms_master')
    .delete()
    .eq('id', id)
  
  return { error }
}

export const deleteFromExercisesMaster = async (id) => {
  const { error } = await supabase
    .from('exercises_master')
    .delete()
    .eq('id', id)
  
  return { error }
}

export const deleteFromVitaminsMaster = async (id) => {
  const { error } = await supabase
    .from('vitamins_master')
    .delete()
    .eq('id', id)
  
  return { error }
}

export const deleteFromTherapiesMaster = async (id) => {
  const { error } = await supabase
    .from('therapies_master')
    .delete()
    .eq('id', id)
  
  return { error }
}

export const deleteFromFoodItems = async (id) => {
  const { error } = await supabase
    .from('food_items')
    .delete()
    .eq('id', id)
  
  return { error }
}

