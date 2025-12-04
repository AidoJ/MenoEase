import { useState, useEffect } from 'react'
import { getEnergyLevels } from '../../services/masterDataService'
import './EnergyInput.css'

const EnergyInput = ({ value, onChange, label = 'Energy Level', showDescription = true }) => {
  const [energyLevels, setEnergyLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedLevel, setExpandedLevel] = useState(null)

  useEffect(() => {
    loadEnergyLevels()
  }, [])

  const loadEnergyLevels = async () => {
    try {
      const { data, error } = await getEnergyLevels()
      if (error) throw error
      // Sort by value (0-11)
      const sorted = (data || []).sort((a, b) => a.value - b.value)
      setEnergyLevels(sorted)
    } catch (err) {
      console.error('Error loading energy levels:', err)
    } finally {
      setLoading(false)
    }
  }

  const getEnergyColor = (val) => {
    if (val <= 2) return '#e74c3c' // Red - very low
    if (val <= 4) return '#f39c12' // Orange - low
    if (val <= 6) return '#f1c40f' // Yellow - moderate
    if (val <= 8) return '#2ecc71' // Green - good
    return '#27ae60' // Dark green - very good
  }

  const getEnergyEmoji = (val) => {
    if (val <= 1) return '😴'
    if (val <= 3) return '😐'
    if (val <= 5) return '😑'
    if (val <= 7) return '🙂'
    if (val <= 9) return '😊'
    if (val === 10) return '⚡'
    return '🚀'
  }

  if (loading) {
    return <div className="energy-input-loading">Loading energy levels...</div>
  }

  return (
    <div className="energy-input">
      {label && <div className="energy-input-label">{label}</div>}
      
      <div className="energy-scale">
        {energyLevels.map((level) => {
          const isSelected = value === level.value
          const isExpanded = expandedLevel === level.value
          
          return (
            <div
              key={level.value}
              className={`energy-level-item ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}
              style={{
                borderColor: isSelected ? getEnergyColor(level.value) : 'transparent',
                backgroundColor: isSelected ? `${getEnergyColor(level.value)}15` : 'white',
              }}
              onClick={() => {
                onChange(level.value)
                setExpandedLevel(isExpanded ? null : level.value)
              }}
            >
              <div className="energy-level-header">
                <div className="energy-level-emoji">{getEnergyEmoji(level.value)}</div>
                <div className="energy-level-content">
                  <div className="energy-level-value">{level.value}/11</div>
                  <div className="energy-level-title">{level.label}</div>
                </div>
                {isSelected && <div className="energy-level-check">✓</div>}
              </div>
              
              {isExpanded && (
                <div className="energy-level-details">
                  <div className="energy-level-mood">
                    <strong>Mood:</strong> {level.mood}
                  </div>
                  <div className="energy-level-description">
                    {level.description}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {value !== null && value !== undefined && (
        <div className="energy-selected-summary">
          <strong>Selected:</strong> {energyLevels.find(l => l.value === value)?.label} ({value}/11)
        </div>
      )}
    </div>
  )
}

export default EnergyInput




