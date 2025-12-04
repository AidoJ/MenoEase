import { useState } from 'react'
import './MultiSelect.css'

const MultiSelect = ({
  options = [],
  selected = [],
  onChange,
  label,
  placeholder = 'Select options...',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = (optionValue) => {
    const newSelected = selected.includes(optionValue)
      ? selected.filter((val) => val !== optionValue)
      : [...selected, optionValue]
    onChange(newSelected)
  }

  const getSelectedLabels = () => {
    return selected
      .map((val) => {
        const option = options.find((opt) => {
          const optValue = typeof opt === 'string' ? opt : opt.id || opt.value
          return optValue === val
        })
        return typeof option === 'string' ? option : option?.name || option?.label
      })
      .filter(Boolean)
  }

  const selectedLabels = getSelectedLabels()

  return (
    <div className={`multi-select ${className}`}>
      {label && (
        <label className="multi-select-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div
        className={`multi-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="selected-count">
          {selected.length === 0 ? (
            <span className="placeholder">{placeholder}</span>
          ) : (
            <span>{selected.length} selected</span>
          )}
        </div>
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="multi-select-menu">
          <div className="multi-select-options">
            {options.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.id || option.value
              const optionLabel = typeof option === 'string' ? option : option.name || option.label
              const isSelected = selected.includes(optionValue)

              return (
                <div
                  key={index}
                  className={`multi-select-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleToggle(optionValue)}
                >
                  <div className="checkbox">
                    {isSelected && <span className="check">✓</span>}
                  </div>
                  <span>{optionLabel}</span>
                </div>
              )
            })}
          </div>
          {selectedLabels.length > 0 && (
            <div className="selected-preview">
              <div className="selected-preview-label">Selected:</div>
              <div className="selected-tags">
                {selectedLabels.map((label, index) => (
                  <span key={index} className="selected-tag">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MultiSelect




