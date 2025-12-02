import { useState, useEffect, useRef } from 'react'
import './SelectDropdown.css'

const SelectDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  label,
  required = false,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter((option) => {
    const displayValue = typeof option === 'string' ? option : option.name || option.label
    return displayValue.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const selectedOption = options.find((option) => {
    const optionValue = typeof option === 'string' ? option : option.id || option.value
    return optionValue === value
  })

  const displayValue = selectedOption
    ? typeof selectedOption === 'string'
      ? selectedOption
      : selectedOption.name || selectedOption.label
    : placeholder

  const handleSelect = (option) => {
    const optionValue = typeof option === 'string' ? option : option.id || option.value
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={`select-dropdown ${className}`} ref={dropdownRef}>
      {label && (
        <label className="select-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div
        className={`select-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={!selectedOption ? 'placeholder' : ''}>{displayValue}</span>
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="select-menu">
          {options.length > 5 && (
            <input
              type="text"
              className="select-search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <div className="select-options">
            {filteredOptions.length === 0 ? (
              <div className="select-option no-results">No options found</div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option.id || option.value
                const optionLabel = typeof option === 'string' ? option : option.name || option.label
                const isSelected = optionValue === value

                return (
                  <div
                    key={index}
                    className={`select-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(option)}
                  >
                    {optionLabel}
                    {isSelected && <span className="check">✓</span>}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SelectDropdown

