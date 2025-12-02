import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { foodService } from '../../services/supabaseService'
import { getFoodItems } from '../../services/masterDataService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { getTodayDate } from '../../utils/helpers'
import { supabase } from '../../config/supabase'
import './FoodLog.css'

const FoodLog = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [foodItems, setFoodItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFoods, setSelectedFoods] = useState([])
  const [mealType, setMealType] = useState('Breakfast')
  const [postMealSymptoms, setPostMealSymptoms] = useState([])

  const postMealSymptomOptions = [
    { value: 'Hot Flash', emoji: '🔥', label: 'Hot Flash' },
    { value: 'Bloating', emoji: '🎈', label: 'Bloating' },
    { value: 'Anxiety', emoji: '😰', label: 'Anxiety' },
    { value: 'Energy Crash', emoji: '📉', label: 'Energy Crash' },
  ]

  useEffect(() => {
    loadFoodItems()
  }, [])

  const loadFoodItems = async () => {
    try {
      const { data, error } = await getFoodItems()
      if (error) throw error
      setFoodItems(data || [])
    } catch (err) {
      console.error('Error loading food items:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredFoods = foodItems.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addFood = (food) => {
    if (!selectedFoods.find(f => f.id === food.id)) {
      setSelectedFoods([...selectedFoods, food])
    }
  }

  const removeFood = (foodId) => {
    setSelectedFoods(selectedFoods.filter(f => f.id !== foodId))
  }

  const togglePostMealSymptom = (symptom) => {
    setPostMealSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    )
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      if (selectedFoods.length === 0) {
        setError('Please add at least one food item')
        setSaving(false)
        return
      }

      const today = getTodayDate()
      const foodData = {
        user_id: user.id,
        date: today,
        meal_type: mealType,
        foods: selectedFoods.map(f => ({ id: f.id, name: f.name, category: f.category })),
        post_meal_symptoms: postMealSymptoms,
      }

      const result = await foodService.create(foodData)
      if (result.error) throw result.error

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        // Reset form
        setSelectedFoods([])
        setPostMealSymptoms([])
        setSearchTerm('')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to save meal')
      console.error('Error saving meal:', err)
    } finally {
      setSaving(false)
    }
  }

  const copyFromYesterday = async () => {
    if (!user) return
    
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = getTodayDate(yesterday.toISOString())
      
      const { data, error } = await foodService.getByDate(yesterdayStr, user.id)
      if (error && error.code !== 'PGRST116') throw error
      
      if (data && data.length > 0) {
        // Get the most recent meal from yesterday
        const lastMeal = data[data.length - 1]
        setMealType(lastMeal.meal_type || 'Breakfast')
        if (lastMeal.foods) {
          // Reconstruct food objects from stored data
          const foods = lastMeal.foods.map(f => ({
            id: f.id || f.name,
            name: f.name,
            category: f.category
          }))
          setSelectedFoods(foods)
        }
        if (lastMeal.post_meal_symptoms) {
          setPostMealSymptoms(lastMeal.post_meal_symptoms)
        }
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      } else {
        setError('No meals found from yesterday')
      }
    } catch (err) {
      setError(err.message || 'Failed to copy from yesterday')
    }
  }

  if (loading) {
    return (
      <div className="food-log">
        <div className="page-title">Food Log</div>
        <Card>
          <p>Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="food-log">
      <div className="page-title">Food Log</div>

      <Card>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <Button
              type="button"
              variant="teal"
              onClick={copyFromYesterday}
              style={{ flex: 1, padding: '12px', fontSize: '14px' }}
            >
              Copy from Yesterday
            </Button>
          </div>

          <div className="card-title">Log Your Meal</div>

          <div className="form-group">
            <div className="form-label">Meal Type</div>
            <select
              className="form-select"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
            </select>
          </div>

          <div className="form-group">
            <div className="form-label">Add Food Items</div>
            <input
              type="text"
              className="food-search"
              placeholder="Search: chicken, bread, milk, cheese..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="food-items">
            {filteredFoods.map((food) => (
              <div key={food.id} className="food-item">
                <div className="food-info">
                  <div className="name">{food.name}</div>
                  <div className="category">{food.category}</div>
                </div>
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => addFood(food)}
                  disabled={selectedFoods.find(f => f.id === food.id)}
                >
                  {selectedFoods.find(f => f.id === food.id) ? 'Added' : 'Add'}
                </button>
              </div>
            ))}
            {filteredFoods.length === 0 && (
              <div className="no-results">No foods found matching "{searchTerm}"</div>
            )}
          </div>

          {selectedFoods.length > 0 && (
            <div className="added-items">
              <div className="form-label">This Meal:</div>
              {selectedFoods.map((food) => (
                <div key={food.id} className="added-item">
                  <div className="food-info">
                    <div className="name">{food.name}</div>
                    <div className="category">{food.category}</div>
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeFood(food.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="form-group">
            <div className="form-label">Post-Meal Symptoms</div>
            <div className="checkbox-grid">
              {postMealSymptomOptions.map((option) => (
                <div
                  key={option.value}
                  className={`checkbox-item ${postMealSymptoms.includes(option.value) ? 'checked' : ''}`}
                  onClick={() => togglePostMealSymptom(option.value)}
                >
                  <span className="icon">{option.emoji}</span>
                  <span className="text">{option.label}</span>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Meal saved successfully! ✅</div>}

          <Button type="submit" variant="teal" disabled={saving}>
            {saving ? 'Saving...' : 'Save Meal'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default FoodLog
