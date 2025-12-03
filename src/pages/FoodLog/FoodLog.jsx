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
  const [customFoodName, setCustomFoodName] = useState('')
  const [showCustomFoodInput, setShowCustomFoodInput] = useState(false)
  const [showSaveToMasterPrompt, setShowSaveToMasterPrompt] = useState(false)
  const [customFoodToSave, setCustomFoodToSave] = useState(null)
  
  // Quantity structure: { amount: '', unit: '' }
  const quantityUnits = [
    { value: '', label: 'No unit' },
    { value: 'g', label: 'grams (g)' },
    { value: 'kg', label: 'kilograms (kg)' },
    { value: 'ml', label: 'milliliters (ml)' },
    { value: 'L', label: 'liters (L)' },
    { value: 'cup', label: 'cup(s)' },
    { value: 'tbsp', label: 'tablespoon(s)' },
    { value: 'tsp', label: 'teaspoon(s)' },
    { value: 'oz', label: 'ounce(s)' },
    { value: 'lb', label: 'pound(s)' },
    { value: 'piece', label: 'piece(s)' },
    { value: 'slice', label: 'slice(s)' },
  ]

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

  // Reset search when meal type changes
  useEffect(() => {
    setSearchTerm('')
  }, [mealType])

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

  // Filter foods by meal type category and search term
  const getCategoryForMealType = (mealType) => {
    const categoryMap = {
      'Breakfast': 'Breakfast',
      'Lunch': 'Lunch',
      'Dinner': 'Dinner',
      'Snack': 'Snack',
    }
    return categoryMap[mealType] || null
  }

  const filteredFoods = foodItems.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase())
    const mealCategory = getCategoryForMealType(mealType)
    const matchesCategory = !mealCategory || food.category === mealCategory
    return matchesSearch && matchesCategory
  })

  const addFood = (food) => {
    if (!selectedFoods.find(f => f.id === food.id)) {
      setSelectedFoods([...selectedFoods, { ...food, quantity: { amount: '', unit: '' } }])
    }
  }

  const addCustomFood = () => {
    if (!customFoodName.trim()) {
      setError('Please enter a food name')
      return
    }

    const customFood = {
      id: `custom-${Date.now()}`,
      name: customFoodName.trim(),
      category: getCategoryForMealType(mealType) || 'Other',
      isCustom: true,
      quantity: { amount: '', unit: '' }
    }

    if (!selectedFoods.find(f => f.id === customFood.id && f.name.toLowerCase() === customFood.name.toLowerCase())) {
      setSelectedFoods([...selectedFoods, customFood])
      // Prompt to save to master list
      setCustomFoodToSave(customFood)
      setShowSaveToMasterPrompt(true)
      setCustomFoodName('')
      setShowCustomFoodInput(false)
      setError('')
    } else {
      setError('This food is already added')
    }
  }

  const saveCustomFoodToMaster = async () => {
    if (!customFoodToSave) return
    
    try {
      const { data, error } = await supabase
        .from('food_items')
        .insert([{
          name: customFoodToSave.name,
          category: customFoodToSave.category
        }])
        .select()
        .single()
      
      if (error) {
        // If it's a duplicate, that's okay
        if (error.code !== '23505') {
          console.error('Error saving to master:', error)
        }
      } else {
        // Update the food item in selectedFoods to use the new ID
        setSelectedFoods(selectedFoods.map(f => 
          f.id === customFoodToSave.id 
            ? { ...f, id: data.id, isCustom: false }
            : f
        ))
        // Reload food items to include the new one
        loadFoodItems()
      }
      setShowSaveToMasterPrompt(false)
      setCustomFoodToSave(null)
    } catch (err) {
      console.error('Error saving custom food:', err)
    }
  }

  const updateFoodQuantity = (foodId, field, value) => {
    setSelectedFoods(selectedFoods.map(f => {
      if (f.id === foodId) {
        const currentQty = f.quantity || { amount: '', unit: '' }
        return { 
          ...f, 
          quantity: { ...currentQty, [field]: value }
        }
      }
      return f
    }))
  }
  
  const formatQuantity = (quantity) => {
    if (!quantity) return ''
    if (typeof quantity === 'string') return quantity // Backward compatibility
    const { amount, unit } = quantity
    if (!amount) return ''
    return unit ? `${amount} ${unit}` : amount
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
        foods: selectedFoods.map(f => ({ 
          id: f.id, 
          name: f.name, 
          category: f.category,
          quantity: f.quantity || null, // Can be string (backward compat) or {amount, unit}
          quantityAmount: typeof f.quantity === 'object' ? f.quantity.amount : null,
          quantityUnit: typeof f.quantity === 'object' ? f.quantity.unit : null,
          isCustom: f.isCustom || false
        })),
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
      const foods = meal.foods.map(f => {
        // Handle both old string format and new object format
        let quantity = f.quantity || ''
        if (f.quantityAmount !== undefined || f.quantityUnit !== undefined) {
          quantity = { amount: f.quantityAmount || '', unit: f.quantityUnit || '' }
        } else if (typeof f.quantity === 'string') {
          // Keep as string for backward compatibility
          quantity = f.quantity
        }
        
        return {
          id: f.id || f.name,
          name: f.name,
          category: f.category,
          quantity: quantity,
          isCustom: f.isCustom || false
        }
      })
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
                    {meal.foods?.map((food, idx) => {
                      const qtyDisplay = typeof food.quantity === 'object' 
                        ? (food.quantity.amount ? `${food.quantity.amount}${food.quantity.unit ? ' ' + food.quantity.unit : ''}` : '')
                        : (food.quantity || '')
                      return (
                        <span key={idx} className="food-tag">
                          {food.name}{qtyDisplay && ` (${qtyDisplay})`}
                        </span>
                      )
                    })}
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
            <div className="food-filter-hint">
              Showing {mealType} foods {searchTerm && `matching "${searchTerm}"`}
            </div>
            <input
              type="text"
              className="food-search"
              placeholder={`Search ${mealType.toLowerCase()} foods...`}
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
            {filteredFoods.length === 0 && searchTerm && (
              <div className="no-results">
                No foods found matching "{searchTerm}"
                <button
                  type="button"
                  className="add-custom-btn"
                  onClick={() => setShowCustomFoodInput(true)}
                  style={{ marginTop: '10px', display: 'block', width: '100%' }}
                >
                  Add "{searchTerm}" as custom food
                </button>
              </div>
            )}
            {filteredFoods.length === 0 && !searchTerm && (
              <div className="no-results">No foods available for {mealType}</div>
            )}
          </div>

          <div className="form-group">
            <div className="form-label">Or Add Custom Food</div>
            {!showCustomFoodInput ? (
              <button
                type="button"
                className="add-custom-btn"
                onClick={() => setShowCustomFoodInput(true)}
              >
                + Add Custom Food Item
              </button>
            ) : (
              <div className="custom-food-input">
                <div className="spelling-warning">
                  ⚠️ Please ensure you spell the item correctly
                </div>
                <input
                  type="text"
                  className="food-search"
                  placeholder="Enter food name (e.g., eggs, cereal, chicken breast)"
                  value={customFoodName}
                  onChange={(e) => setCustomFoodName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomFood()
                    }
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <Button
                    type="button"
                    variant="teal"
                    onClick={addCustomFood}
                    style={{ flex: 1 }}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCustomFoodInput(false)
                      setCustomFoodName('')
                    }}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {selectedFoods.length > 0 && (
            <div className="added-items">
              <div className="form-label">This Meal:</div>
              {selectedFoods.map((food) => {
                const qty = food.quantity || { amount: '', unit: '' }
                const amount = typeof qty === 'object' ? qty.amount : (qty || '')
                const unit = typeof qty === 'object' ? qty.unit : ''
                
                return (
                  <div key={food.id} className="added-item">
                    <div className="food-info">
                      <div className="name">
                        {food.name}
                        {food.isCustom && <span className="custom-badge">Custom</span>}
                      </div>
                      <div className="category">{food.category}</div>
                    </div>
                    <div className="food-quantity-inputs">
                      <input
                        type="text"
                        className="quantity-amount-input"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => updateFoodQuantity(food.id, 'amount', e.target.value)}
                      />
                      <select
                        className="quantity-unit-select"
                        value={unit}
                        onChange={(e) => updateFoodQuantity(food.id, 'unit', e.target.value)}
                      >
                        {quantityUnits.map(u => (
                          <option key={u.value} value={u.value}>{u.label}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeFood(food.id)}
                    >
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>
          )}
          
          {/* Prompt to save custom food to master list */}
          {showSaveToMasterPrompt && customFoodToSave && (
            <div className="save-to-master-modal">
              <div className="modal-content">
                <div className="modal-title">Save to Food List?</div>
                <div className="modal-message">
                  Would you like to save <strong>"{customFoodToSave.name}"</strong> to your food list 
                  so you can easily find it again? It will be saved in the <strong>{customFoodToSave.category}</strong> category.
                </div>
                <div className="modal-actions">
                  <Button
                    type="button"
                    variant="teal"
                    onClick={saveCustomFoodToMaster}
                    style={{ flex: 1 }}
                  >
                    Yes, Save It
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowSaveToMasterPrompt(false)
                      setCustomFoodToSave(null)
                    }}
                    style={{ flex: 1 }}
                  >
                    No Thanks
                  </Button>
                </div>
              </div>
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
