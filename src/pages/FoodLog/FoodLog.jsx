import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { foodService } from '../../services/supabaseService'
import { getFoodItems } from '../../services/masterDataService'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import DateNavigator from '../../components/DateNavigator/DateNavigator'
import { getTodayDate, formatDate } from '../../utils/helpers'
import { supabase } from '../../config/supabase'
import { format } from 'date-fns'
import './FoodLog.css'

const FoodLog = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || getTodayDate())
  const [todayMeals, setTodayMeals] = useState([])
  
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

  useEffect(() => {
    loadTodayMeals()
  }, [selectedDate])

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

  const loadTodayMeals = async () => {
    if (!user) return
    
    try {
      const { data, error } = await foodService.getByDate(selectedDate, user.id)
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading meals:', error)
        return
      }
      setTodayMeals(data || [])
    } catch (err) {
      console.error('Error loading meals:', err)
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

    if (selectedFoods.length === 0) {
      setError('Please add at least one food item')
      return
    }

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const foodData = {
        user_id: user.id,
        date: selectedDate,
        meal_type: mealType,
        foods: selectedFoods.map(f => ({ id: f.id, name: f.name, category: f.category })),
        post_meal_symptoms: postMealSymptoms,
      }

      const result = await foodService.create(foodData)
      if (result.error) throw result.error

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setSelectedFoods([])
        setPostMealSymptoms([])
        setSearchTerm('')
        loadTodayMeals()
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to save meal')
      console.error('Error saving meal:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleEditMeal = (meal) => {
    setMealType(meal.meal_type || 'Breakfast')
    if (meal.foods) {
      const foods = meal.foods.map(f => ({
        id: f.id || f.name,
        name: f.name,
        category: f.category
      }))
      setSelectedFoods(foods)
    }
    if (meal.post_meal_symptoms) {
      setPostMealSymptoms(meal.post_meal_symptoms)
    }
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteMeal = async (mealId) => {
    if (!confirm('Delete this meal?')) return
    
    try {
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', mealId)
      
      if (error) throw error
      loadTodayMeals()
    } catch (err) {
      console.error('Error deleting meal:', err)
      setError('Failed to delete meal')
    }
  }

  const copyFromYesterday = async () => {
    if (!user) return
    
    try {
      const yesterday = new Date(selectedDate)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = getTodayDate(yesterday.toISOString())
      
      const { data, error } = await foodService.getByDate(yesterdayStr, user.id)
      if (error && error.code !== 'PGRST116') throw error
      
      if (data && data.length > 0) {
        const lastMeal = data[data.length - 1]
        setMealType(lastMeal.meal_type || 'Breakfast')
        if (lastMeal.foods) {
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

  const mealsByType = todayMeals.reduce((acc, meal) => {
    const type = meal.meal_type || 'Other'
    if (!acc[type]) acc[type] = []
    acc[type].push(meal)
    return acc
  }, {})

  return (
    <div className="food-log">
      <div className="page-title">Food Log</div>

      <DateNavigator 
        selectedDate={selectedDate}
        onChange={setSelectedDate}
        maxDate={getTodayDate()}
      />

      {Object.keys(mealsByType).length > 0 && (
        <Card>
          <div className="card-title">Meals for {formatDate(selectedDate)}</div>
          {Object.entries(mealsByType).map(([type, meals]) => (
            <div key={type} className="meal-type-section">
              <div className="meal-type-header">{type}</div>
              {meals.map((meal) => (
                <div key={meal.id} className="meal-item">
                  <div className="meal-foods">
                    {meal.foods?.map((food, idx) => (
                      <span key={idx} className="food-tag">
                        {food.name}
                      </span>
                    ))}
                  </div>
                  {meal.post_meal_symptoms && meal.post_meal_symptoms.length > 0 && (
                    <div className="meal-symptoms">
                      {meal.post_meal_symptoms.map((symptom, idx) => (
                        <span key={idx} className="symptom-tag">
                          {postMealSymptomOptions.find(s => s.value === symptom)?.emoji} {symptom}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="meal-actions">
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => handleEditMeal(meal)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDeleteMeal(meal.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </Card>
      )}

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
